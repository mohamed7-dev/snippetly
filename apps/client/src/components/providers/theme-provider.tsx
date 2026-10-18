import { useDeveloperSettings } from '@/features/developer-settings/hooks/use-developer-settings';
import React, { createContext } from 'react';

export type Theme = 'dark' | 'light' | 'system';
export type ColorScheme = 'classic' | 'retro' | 'coding';

export interface ThemeContextType {
    state: {
        theme: Theme;
        colorScheme: ColorScheme;
    };
    actions: {
        setTheme: (theme: Theme) => void;
        setColorScheme: (colorScheme: ColorScheme) => void;
    };
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
}

export function ThemeProvider(props: ThemeProviderProps) {
    const { defaultTheme = 'system', children } = props;

    const {
        state: { settings },
        actions: { setTheme, setColorScheme },
    } = useDeveloperSettings();

    React.useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove('light', 'dark');
        root.dataset.colorScheme = settings.colorScheme;

        const activeTheme =
            defaultTheme !== 'system' && settings.theme === 'system' ? defaultTheme : settings.theme;

        if (activeTheme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

            root.classList.add(systemTheme);
            return;
        }

        root.classList.add(activeTheme);
    }, [settings.colorScheme, settings.theme, defaultTheme]);

    const contextValue = React.useMemo(() => {
        return {
            state: {
                theme: settings.theme,
                colorScheme: settings.colorScheme,
            },
            actions: {
                setTheme: setTheme,
                setColorScheme: setColorScheme,
            },
        } satisfies ThemeContextType;
    }, [setColorScheme, setTheme, settings.colorScheme, settings.theme]);

    return <ThemeContext.Provider value={{ ...contextValue }}>{children}</ThemeContext.Provider>;
}
