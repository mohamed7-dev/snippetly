import React from 'react';
import { DeveloperSettingsContext } from '../providers/developer-settings-provider';

export function useDeveloperSettings() {
    const context = React.useContext(DeveloperSettingsContext);

    if (context === undefined)
        throw new Error('useDeveloperSettings must be used within a DeveloperSettingsProvider');

    return context;
}
