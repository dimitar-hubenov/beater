// src/settings/UserSettingsProvider.tsx
import { createContext, ReactNode, useMemo } from 'react';
import type { UserSettings, DistanceUnit, Theme } from '../types/userSettings';
import type { SpotSource } from '../types/spotSource';
import type { Language } from '../types/language';
import { DEFAULT_USER_SETTINGS } from '../types/userSettings';
import { useUserSettingsState } from './useUserSettingsState';
import { validateGrid, gridToPoint } from '@hamlog/maidenhead';

export interface UserSettingsActions {
    toggleProgram(program: SpotSource): void;
    setProgramRefreshInterval(seconds: number): void;
    setQthGrid(grid: string | null): void;
    setDistanceUnit(unit: DistanceUnit): void;
    setTheme(theme: Theme): void;
    setLanguage(language: Language): void;
    reset(): void;
}

type UserSettingsContextValue = {
    settings: UserSettings;
    actions: UserSettingsActions;
};

export const UserSettingsContext = createContext<UserSettingsContextValue | null>(null);

export function UserSettingsProvider({ children }: { children: ReactNode }) {
    const { settings, setSettings } = useUserSettingsState();

    const actions = useMemo<UserSettingsActions>(() => ({
        toggleProgram(program: SpotSource) {
            setSettings(prev => {
                const enabled = prev.enabledPrograms.includes(program);

                return {
                    ...prev,
                    enabledPrograms: enabled
                        ? prev.enabledPrograms.filter(p => p !== program)
                        : [...prev.enabledPrograms, program],
                };
            });
        },

        setProgramRefreshInterval(seconds: number) {
            const PROGRAM_REFRESH_INTERVAL_MIN_S: number = 60;
            const PROGRAM_REFRESH_INTERVAL_MAX_S: number = 300;

            const clamped = Math.min(
                PROGRAM_REFRESH_INTERVAL_MAX_S,
                Math.max(PROGRAM_REFRESH_INTERVAL_MIN_S, Math.round(seconds))
            );

            setSettings(prev => ({
                ...prev,
                programRefreshInterval: clamped,
            }));
        },

        setQthGrid(grid) {
            if (!grid) {
                setSettings(s => ({ ...s, qthGrid: null, qthLat: null, qthLon: null }));
                return;
            }

            const g = grid.trim().toUpperCase();

            if (!validateGrid(grid)) {
                setSettings(s => ({ ...s, qthGrid: g, qthLat: null, qthLon: null }));
                return;
            }
            
            const coords = gridToPoint(g);
            setSettings(s => ({
                ...s,
                qthGrid: g,
                qthLat: coords?.lat ?? null,
                qthLon: coords?.lon ?? null,
            }));
        },

        setDistanceUnit(unit) {
            setSettings(s => ({ ...s, distanceUnit: unit }));
        },

        setTheme(theme) {
            setSettings(s => ({ ...s, theme }));
        },

        setLanguage(language) {
            setSettings(s => ({ ...s, language }));
        },

        reset() {
            setSettings(DEFAULT_USER_SETTINGS);
        },
    }), [setSettings]);

    const value = useMemo(
        () => ({ settings, actions }),
        [settings, actions]
    );

    return (
        <UserSettingsContext.Provider value={value}>
            {children}
        </UserSettingsContext.Provider>
    );
}
