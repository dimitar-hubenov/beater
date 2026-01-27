// src/settings/useUserSettingsState.ts
import { useEffect, useState } from 'react';
import { DEFAULT_USER_SETTINGS } from '../types/userSettings';
import type { UserSettings } from '../types/userSettings';
import { type Language, LanguageUtils } from '../types/language';
import { type SpotSource, SourceUtils } from '../types/spotSource';

const STORAGE_KEY = 'pota.userSettings.v1';

function loadSettings(): UserSettings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_USER_SETTINGS;
        
        const merged = { ...DEFAULT_USER_SETTINGS, ...JSON.parse(raw) };

        return sanitizeSettings(merged);
    } catch {
        return DEFAULT_USER_SETTINGS;
    }
}

function sanitizeSpotSources(
    enabled: SpotSource[]
): SpotSource[] {
    const available = SourceUtils.getAvailableSources();

    const filtered = enabled.filter(s =>
        available.includes(s)
    );

    return filtered.length > 0
        ? filtered
        : DEFAULT_USER_SETTINGS.enabledPrograms;
}

function sanitizeSettings(settings: UserSettings): UserSettings {
    return {
        ...settings,
        language: sanitizeLanguage(settings.language),
        enabledPrograms: sanitizeSpotSources(settings.enabledPrograms),
    };
}

function sanitizeLanguage(lang: Language): Language {
    if (LanguageUtils.isAvailable(lang)) {
        return lang;
    }

    const fallback = LanguageUtils.getAvailableLanguages()[0];
    return fallback ?? DEFAULT_USER_SETTINGS.language;
}


export function useUserSettingsState() {
    const [settings, setSettings] = useState<UserSettings>(loadSettings);

    /* Persist */
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    /* Theme */
    useEffect(() => {
        const root = document.documentElement;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const isDark =
            settings.theme === 'dark' ||
            (settings.theme === 'system' && prefersDark);

        root.classList.toggle('dark', isDark);
    }, [settings.theme]);

    return { settings, setSettings };
}
