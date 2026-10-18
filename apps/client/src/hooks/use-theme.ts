import { ThemeContext, type ThemeContextType } from '@/components/providers/theme-provider';
import React from 'react';

export function useTheme(): ThemeContextType {
    const context = React.useContext(ThemeContext);

    if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

    return context;
}
