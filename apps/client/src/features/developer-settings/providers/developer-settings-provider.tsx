import type { Theme } from '@/components/providers/theme-provider';
import { LOCAL_STORAGE_USER_SETTINGS_KEY } from '@/lib/constants';
import React, { createContext, useMemo } from 'react';

type DeveloperSettingsContextType = {
    state: {
        settings: DeveloperSettings;
    };
    actions: {
        setTheme: (theme: Theme) => void;
    };
};

export interface DeveloperSettings {
    theme: Theme;
}

const initialUserSettings: DeveloperSettings = {
    theme: 'system',
};

export const DeveloperSettingsContext = createContext<DeveloperSettingsContextType | undefined>(undefined);

interface DeveloperSettingsProviderProps {
    children: React.ReactNode;
}
export function DeveloperSettingsProvider({ children }: DeveloperSettingsProviderProps) {
    const loadSettingsFromLocalStorage = React.useCallback(() => {
        try {
            // Query settings from the server

            const settingsFromLS = localStorage.getItem(LOCAL_STORAGE_USER_SETTINGS_KEY);
            if (settingsFromLS) {
                // merge
                return {
                    ...initialUserSettings,
                    ...JSON.parse(settingsFromLS),
                };
            }
        } catch (e) {
            console.error('Error while loading developer settings from localStorage', e);
        }
        // return initial settings if nothing stored in the LS
        return {
            ...initialUserSettings,
        };
    }, []);

    const [settings, setSettings] = React.useState<DeveloperSettings>(loadSettingsFromLocalStorage);

    React.useEffect(() => {
        try {
            // Persist settings on the server
            localStorage.setItem(LOCAL_STORAGE_USER_SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error('Error while saving developer settings to localStorage', e);
        }
    }, [settings]);

    const updateSetting = <K extends keyof DeveloperSettings>(key: K, value: DeveloperSettings[K]) => {
        setSettings(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const contextValue: DeveloperSettingsContextType = useMemo(
        () => ({
            state: {
                settings,
            },
            actions: {
                setTheme: (theme: Theme) => updateSetting('theme', theme),
            },
        }),
        [settings, updateSetting],
    );
    return (
        <DeveloperSettingsContext.Provider value={{ ...contextValue }}>
            {children}
        </DeveloperSettingsContext.Provider>
    );
}
