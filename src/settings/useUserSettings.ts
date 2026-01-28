// src/settings/useUserSettings.ts
import { useContext } from 'react';
import { UserSettingsContext } from './UserSettingsProvider';

export function useUserSettings() {
    const ctx = useContext(UserSettingsContext);
    if (!ctx) {
        throw new Error('useUserSettings must be used inside UserSettingsProvider');
    }
    return ctx;
}
