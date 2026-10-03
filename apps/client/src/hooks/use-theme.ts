import { ThemeContext } from '@/components/providers/theme-provider';
import React from 'react';

export const useTheme = () => {
    const context = React.useContext(ThemeContext);

    if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

    return context;
};
