import type { ColorScheme, Theme } from '@/components/providers/theme-provider';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { LOCAL_STORAGE_USER_SETTINGS_KEY } from '@/lib/constants';
import { toastApiError } from '@/lib/toast-api-error';
import { getDeveloperPreferencesDto, updateDeveloperPreferencesDto } from '@snippetly/common/dto';
import { DEFAULT_DEVELOPER_PREFERENCES } from '@snippetly/common/lib';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { createContext, useEffect, useRef, useState } from 'react';
import z from 'zod';

type DeveloperSettings = z.infer<typeof getDeveloperPreferencesDto.output>['preferences'];
export type CodeEditorSettings = DeveloperSettings['codeEditor'];
export type CodeEditorTheme = CodeEditorSettings['theme'];
type PreferencePatch = z.input<typeof updateDeveloperPreferencesDto.input>;
type PreferencesResponse = z.infer<typeof getDeveloperPreferencesDto.output>;
type UpdatedPreferencesResponse = z.infer<typeof updateDeveloperPreferencesDto.output>;
type SavePreferencesInput = {
    developerId: string;
    patch: PreferencePatch;
    removeLegacyPreferences?: boolean;
};

export interface DeveloperSettingsContextType {
    state: {
        settings: DeveloperSettings;
        isLoaded: boolean;
    };
    actions: {
        setTheme: (theme: Theme) => void;
        setColorScheme: (colorScheme: ColorScheme) => void;
        updateCodeEditorSettings: (settings: Partial<CodeEditorSettings>) => void;
        setInAppNotificationsEnabled: (enabled: boolean) => void;
        setPushEnabled: (enabled: boolean) => void;
    };
}

const initialUserSettings: DeveloperSettings = DEFAULT_DEVELOPER_PREFERENCES;

export const DeveloperSettingsContext = createContext<DeveloperSettingsContextType | undefined>(undefined);

function getLegacyPreferences(): PreferencePatch | undefined {
    const patch: PreferencePatch = {};

    try {
        const legacySettings = localStorage.getItem(LOCAL_STORAGE_USER_SETTINGS_KEY);
        if (legacySettings) {
            const parsed = updateDeveloperPreferencesDto.input.safeParse(JSON.parse(legacySettings));
            if (parsed.success) Object.assign(patch, parsed.data);
        }
    } catch (error) {
        console.error('Could not read legacy developer settings from local storage.', error);
    }

    try {
        const inAppPreference = localStorage.getItem('snippetly:in-app-notifications-enabled');
        if (inAppPreference !== null) patch.inAppNotificationsEnabled = inAppPreference !== 'false';
    } catch (error) {
        console.error('Could not read the legacy in-app notification preference.', error);
    }

    return Object.keys(patch).length ? patch : undefined;
}

function removeLegacyPreferences(): void {
    try {
        localStorage.removeItem(LOCAL_STORAGE_USER_SETTINGS_KEY);
        localStorage.removeItem('snippetly:in-app-notifications-enabled');
    } catch (error) {
        console.error('Could not remove migrated developer settings from local storage.', error);
    }
}

interface DeveloperSettingsProviderProps {
    children: React.ReactNode;
}

export function DeveloperSettingsProvider({ children }: DeveloperSettingsProviderProps) {
    const { status, user } = useAuth();
    const queryClient = useQueryClient();
    const developerId = user?.id;
    const queryKey = ['developer-preferences', developerId];
    const [settings, setSettings] = useState<DeveloperSettings>(initialUserSettings);
    const [initializedDeveloperId, setInitializedDeveloperId] = useState<string>();
    const handledDeveloperId = useRef<string | undefined>(undefined);

    const preferencesQuery = useQuery({
        queryKey,
        enabled: status === 'authenticated' && Boolean(developerId),
        retry: false,
        queryFn: () =>
            developerApiClient.fetch<PreferencesResponse>(apiEndpoints.developers.getPreferences.url, {
                method: apiEndpoints.developers.getPreferences.method,
            }),
    });

    const { mutate: savePreferences } = useMutation({
        scope: { id: `developer-preferences-${developerId ?? 'anonymous'}` },
        mutationFn: ({ patch }: SavePreferencesInput) =>
            developerApiClient.fetch<UpdatedPreferencesResponse>(
                apiEndpoints.developers.updatePreferences.url,
                {
                    method: apiEndpoints.developers.updatePreferences.method,
                    body: JSON.stringify(patch),
                },
            ),
        onSuccess: (preferences, { developerId, removeLegacyPreferences: removeLegacy }) => {
            queryClient.setQueryData<PreferencesResponse>(['developer-preferences', developerId], {
                preferences,
                isInitialized: true,
            });
            if (removeLegacy) removeLegacyPreferences();
        },
        onError: toastApiError,
    });

    useEffect(() => {
        if (!developerId || !preferencesQuery.data || handledDeveloperId.current === developerId) return;
        handledDeveloperId.current = developerId;

        const legacyPreferences = preferencesQuery.data.isInitialized ? undefined : getLegacyPreferences();
        const nextSettings: DeveloperSettings = {
            ...preferencesQuery.data.preferences,
            ...legacyPreferences,
            codeEditor: {
                ...preferencesQuery.data.preferences.codeEditor,
                ...legacyPreferences?.codeEditor,
            },
        };
        setSettings(nextSettings);
        setInitializedDeveloperId(developerId);

        if (!preferencesQuery.data.isInitialized) {
            savePreferences({
                developerId,
                patch: nextSettings,
                removeLegacyPreferences: true,
            });
        } else {
            removeLegacyPreferences();
        }
    }, [developerId, preferencesQuery.data, savePreferences]);

    useEffect(() => {
        if (preferencesQuery.isError) toastApiError(preferencesQuery.error);
    }, [preferencesQuery.error, preferencesQuery.isError]);

    const updatePreference = (patch: PreferencePatch): void => {
        setSettings((previous: DeveloperSettings) => ({
            ...previous,
            ...patch,
            codeEditor: { ...previous.codeEditor, ...patch.codeEditor },
        }));
        if (status === 'authenticated' && developerId) savePreferences({ developerId, patch });
    };

    const contextValue: DeveloperSettingsContextType = {
        state: {
            settings,
            isLoaded: !developerId || initializedDeveloperId === developerId,
        },
        actions: {
            setTheme: theme => updatePreference({ theme }),
            setColorScheme: colorScheme => updatePreference({ colorScheme }),
            updateCodeEditorSettings: codeEditor => updatePreference({ codeEditor }),
            setInAppNotificationsEnabled: enabled => updatePreference({ inAppNotificationsEnabled: enabled }),
            setPushEnabled: enabled => updatePreference({ isPushEnabled: enabled }),
        },
    };

    return (
        <DeveloperSettingsContext.Provider value={contextValue}>{children}</DeveloperSettingsContext.Provider>
    );
}
