import type { ColorScheme, Theme } from '@/components/providers/theme-provider';
import { LOCAL_STORAGE_USER_SETTINGS_KEY } from '@/lib/constants';
import React, { createContext, useMemo } from 'react';

type DeveloperSettingsContextType = {
    state: {
        settings: DeveloperSettings;
    };
    actions: {
        setTheme: (theme: Theme) => void;
        setColorScheme: (colorScheme: ColorScheme) => void;
        updateCodeEditorSettings: (settings: Partial<CodeEditorSettings>) => void;
    };
};

export interface DeveloperSettings {
    theme: Theme;
    colorScheme: ColorScheme;
    codeEditor: CodeEditorSettings;
}

export type CodeEditorTheme = 'system' | 'ayu-light' | 'one-dark' | 'dracula';

export interface CodeEditorSettings {
    theme: CodeEditorTheme;
    fontSize: number;
    fontFamily: 'geist-mono' | 'system-mono';
    tabSize: number;
    lineWrapping: boolean;
    lineNumbers: boolean;
}

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
    };
}

interface DeveloperSettingsProviderProps {
    children: React.ReactNode;
}
export function DeveloperSettingsProvider({ children }: DeveloperSettingsProviderProps) {
    const loadSettingsFromLocalStorage = React.useCallback(() => {
        try {
            const settingsFromLS = localStorage.getItem(LOCAL_STORAGE_USER_SETTINGS_KEY);
            if (settingsFromLS) {
                return loadDeveloperSettings(JSON.parse(settingsFromLS));
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
                setColorScheme: (colorScheme: ColorScheme) => updateSetting('colorScheme', colorScheme),
                updateCodeEditorSettings: (codeEditor: Partial<CodeEditorSettings>) =>
                    setSettings(prev => ({
                        ...prev,
                        codeEditor: {
                            ...prev.codeEditor,
                            ...codeEditor,
                        },
                    })),
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
