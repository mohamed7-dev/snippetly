import React from 'react';
import { AuthContext } from '../components/auth-provider';

export function useAuth() {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be wrapped in an AuthProvider');
    }
    return context;
}
