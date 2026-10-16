import { useDeveloperSettings } from '@/features/developer-settings/hooks/use-developer-settings';
import React, { createContext } from 'react';

export type Theme = 'dark' | 'light' | 'system';

export interface ThemeContextType {
    state: {
        theme: Theme;
    };
    actions: {
        setTheme: (theme: Theme) => void;
    };
}

export const ThemeContext = createContext<ThemeContextType | undefined>({
    state: {
        theme: 'system',
    },
    actions: {
        setTheme: () => null,
    },
});

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
}

export function ThemeProvider(props: ThemeProviderProps) {
    const { defaultTheme = 'system', children } = props;

    const {
        state: { settings },
        actions: { setTheme },
    } = useDeveloperSettings();

    React.useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove('light', 'dark');

        const activeTheme =
            defaultTheme !== 'system' && settings.theme === 'system' ? defaultTheme : settings.theme;

        if (activeTheme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

            root.classList.add(systemTheme);
            return;
        }

        root.classList.add(activeTheme);
    }, [settings.theme, defaultTheme]);

    const contextValue = React.useMemo(() => {
        return {
            state: {
                theme: settings.theme,
            },
            actions: {
                setTheme: setTheme,
            },
        } satisfies ThemeContextType;
    }, [setTheme, settings.theme]);

    return <ThemeContext.Provider value={{ ...contextValue }}>{children}</ThemeContext.Provider>;
}
