import type { ColorScheme, Theme } from '@/components/providers/theme-provider';
import { Code2Icon, MonitorIcon, MoonIcon, PaletteIcon, SunIcon } from 'lucide-react';

export const COLOR_SCHEME_OPTIONS = [
    {
        value: 'classic' as ColorScheme,
        label: 'Classic',
        description: 'The familiar Snippetly look',
        preview: {
            light: { background: '#ffffff', foreground: '#4b5563', primary: '#0891b2' },
            dark: { background: '#0f172a', foreground: '#f1f5f9', primary: '#0891b2' },
        },
        icon: PaletteIcon,
    },
    {
        value: 'retro' as ColorScheme,
        label: 'Retro',
        description: 'Warm paper, ink, and vintage accents',
        preview: {
            light: { background: '#f6f0df', foreground: '#382f2a', primary: '#a4472d' },
            dark: { background: '#211d1a', foreground: '#f5ead5', primary: '#e08a54' },
        },
        icon: PaletteIcon,
    },
    {
        value: 'coding' as ColorScheme,
        label: 'Coding',
        description: 'A focused workspace with terminal-inspired colors',
        preview: {
            light: { background: '#f3f6fa', foreground: '#172334', primary: '#2563eb' },
            dark: { background: '#0b1220', foreground: '#dbeafe', primary: '#4ade80' },
        },
        icon: Code2Icon,
    },
];

export const THEME_OPTIONS = [
    {
        value: 'light' as Theme,
        label: 'Light',
        description: 'Clean and bright interface',
        icon: SunIcon,
        preview: 'bg-background dark:bg-foreground',
    },
    {
        value: 'dark' as Theme,
        label: 'Dark',
        description: 'Easy on the eyes in low light',
        icon: MoonIcon,
        preview: 'bg-foreground dark:bg-background',
    },
    {
        value: 'system' as Theme,
        label: 'System',
        description: 'Adapts to your device settings',
        icon: MonitorIcon,
        preview: 'bg-gradient-to-br from-background dark:from-foreground to-foreground dark:to-background',
    },
];
