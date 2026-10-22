import type { ColorScheme, Theme } from '@/components/providers/theme-provider';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { LOCAL_STORAGE_USER_SETTINGS_KEY } from '@/lib/constants';
import { toastApiError } from '@/lib/toast-api-error';
import type {
    GetDeveloperPreferencesDtoType,
    UpdateDeveloperPreferencesDtoType,
} from '@snippetly/common/dto';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type DeveloperSettings = GetDeveloperPreferencesDtoType['output']['preferences'];
type CodeEditorSettings = DeveloperSettings['codeEditor'];
type PreferencePatch = UpdateDeveloperPreferencesDtoType['input'];

type DeveloperSettingsContextType = {
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
};

const initialUserSettings: DeveloperSettings = {
    theme: 'system',
    colorScheme: 'classic',
    codeEditor: {
        theme: 'system',
        fontSize: 14,
        fontFamily: 'geist-mono',
        tabSize: 4,
        lineWrapping: false,
        lineNumbers: true,
    },
    inAppNotificationsEnabled: true,
    isPushEnabled: true,
};

export const DeveloperSettingsContext = createContext<DeveloperSettingsContextType | undefined>(undefined);

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function loadDeveloperSettings(value: unknown): DeveloperSettings {
    if (!isRecord(value)) return initialUserSettings;

    const storedEditorSettings = isRecord(value.codeEditor) ? value.codeEditor : {};
    const editorTheme = storedEditorSettings.theme;
    const fontSize = storedEditorSettings.fontSize;
    const fontFamily = storedEditorSettings.fontFamily;
    const tabSize = storedEditorSettings.tabSize;

    return {
        theme:
            value.theme === 'light' || value.theme === 'dark' || value.theme === 'system'
                ? value.theme
                : initialUserSettings.theme,
        colorScheme:
            value.colorScheme === 'retro' || value.colorScheme === 'coding' || value.colorScheme === 'classic'
                ? value.colorScheme
                : initialUserSettings.colorScheme,
        codeEditor: {
            theme:
                editorTheme === 'system' ||
                editorTheme === 'ayu-light' ||
                editorTheme === 'one-dark' ||
                editorTheme === 'dracula'
                    ? editorTheme
                    : initialUserSettings.codeEditor.theme,
            fontSize:
                typeof fontSize === 'number' && [10, 12, 14, 16, 18, 20, 24].includes(fontSize)
                    ? fontSize
                    : initialUserSettings.codeEditor.fontSize,
            fontFamily:
                fontFamily === 'geist-mono' || fontFamily === 'system-mono'
                    ? fontFamily
                    : initialUserSettings.codeEditor.fontFamily,
            tabSize:
                typeof tabSize === 'number' && [2, 4, 8].includes(tabSize)
                    ? tabSize
                    : initialUserSettings.codeEditor.tabSize,
            lineWrapping:
                typeof storedEditorSettings.lineWrapping === 'boolean'
                    ? storedEditorSettings.lineWrapping
                    : initialUserSettings.codeEditor.lineWrapping,
            lineNumbers:
                typeof storedEditorSettings.lineNumbers === 'boolean'
                    ? storedEditorSettings.lineNumbers
                    : initialUserSettings.codeEditor.lineNumbers,
        },
        inAppNotificationsEnabled:
            typeof value.inAppNotificationsEnabled === 'boolean'
                ? value.inAppNotificationsEnabled
                : initialUserSettings.inAppNotificationsEnabled,
        isPushEnabled:
            typeof value.isPushEnabled === 'boolean'
                ? value.isPushEnabled
                : initialUserSettings.isPushEnabled,
    };
}

function getLegacyPreferences(): PreferencePatch | undefined {
    const patch: PreferencePatch = {};

    try {
        const legacySettings = localStorage.getItem(LOCAL_STORAGE_USER_SETTINGS_KEY);
        if (legacySettings) Object.assign(patch, loadDeveloperSettings(JSON.parse(legacySettings)));
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

function removeLegacyPreferences() {
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
    const handledDeveloperId = useRef<string>();
    const saveQueue = useRef<Promise<void>>(Promise.resolve());

    const preferencesQuery = useQuery({
        queryKey,
        enabled: status === 'authenticated' && Boolean(developerId),
        retry: false,
        queryFn: () =>
            developerApiClient.fetch<GetDeveloperPreferencesDtoType['output']>(
                apiEndpoints.developers.getPreferences.url,
                { method: apiEndpoints.developers.getPreferences.method },
            ),
    });

    const persistPreferences = useCallback(
        (patch: PreferencePatch) => {
            if (status !== 'authenticated' || !developerId) return Promise.resolve();

            const save = () =>
                developerApiClient.fetch<DeveloperSettings>(apiEndpoints.developers.updatePreferences.url, {
                    method: apiEndpoints.developers.updatePreferences.method,
                    body: JSON.stringify(patch),
                });
            const operation = saveQueue.current.then(save);
            saveQueue.current = operation.then(
                () => undefined,
                error => {
                    toastApiError(error);
                },
            );
            return operation;
        },
        [developerId, status],
    );

    useEffect(() => {
        if (!developerId || !preferencesQuery.data || handledDeveloperId.current === developerId) return;
        handledDeveloperId.current = developerId;

        const legacyPreferences = preferencesQuery.data.isInitialized ? undefined : getLegacyPreferences();
        const nextSettings = {
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
            void persistPreferences(nextSettings)
                .then(() => {
                    removeLegacyPreferences();
                    queryClient.setQueryData(queryKey, {
                        preferences: nextSettings,
                        isInitialized: true,
                    });
                })
                .catch(() => {
                    // persistPreferences already reports the failure to the user.
                });
        } else {
            removeLegacyPreferences();
        }
    }, [developerId, persistPreferences, preferencesQuery.data, queryClient, queryKey]);

    useEffect(() => {
        if (preferencesQuery.isError) toastApiError(preferencesQuery.error);
    }, [preferencesQuery.error, preferencesQuery.isError]);

    const updatePreference = useCallback(
        (patch: PreferencePatch) => {
            setSettings(previous => ({
                ...previous,
                ...patch,
                codeEditor: { ...previous.codeEditor, ...patch.codeEditor },
            }));
            void persistPreferences(patch).catch(() => {
                // persistPreferences already reports the failure to the user.
            });
        },
        [persistPreferences],
    );

    const setTheme = useCallback((theme: Theme) => updatePreference({ theme }), [updatePreference]);
    const setColorScheme = useCallback(
        (colorScheme: ColorScheme) => updatePreference({ colorScheme }),
        [updatePreference],
    );
    const updateCodeEditorSettings = useCallback(
        (codeEditor: Partial<CodeEditorSettings>) => updatePreference({ codeEditor }),
        [updatePreference],
    );
    const setInAppNotificationsEnabled = useCallback(
        (enabled: boolean) => updatePreference({ inAppNotificationsEnabled: enabled }),
        [updatePreference],
    );
    const setPushEnabled = useCallback(
        (enabled: boolean) => updatePreference({ isPushEnabled: enabled }),
        [updatePreference],
    );

    const contextValue = useMemo<DeveloperSettingsContextType>(
        () => ({
            state: {
                settings,
                isLoaded: !developerId || initializedDeveloperId === developerId,
            },
            actions: {
                setTheme,
                setColorScheme,
                updateCodeEditorSettings,
                setInAppNotificationsEnabled,
                setPushEnabled,
            },
        }),
        [
            developerId,
            initializedDeveloperId,
            settings,
            setColorScheme,
            setInAppNotificationsEnabled,
            setPushEnabled,
            setTheme,
            updateCodeEditorSettings,
        ],
    );

    return (
        <DeveloperSettingsContext.Provider value={contextValue}>{children}</DeveloperSettingsContext.Provider>
    );
}
