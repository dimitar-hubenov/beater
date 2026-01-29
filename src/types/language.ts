// src/types/languages.ts

type LanguageInfo = {
    label: string;
    available: boolean;
};

const LANGUAGE_INFO = {
    en: {
        label: "English",
        available: true 
    },
    bg: {
        label: "Български",
        available: true
    },
} as const satisfies Record<string, LanguageInfo>;

export type Language = keyof typeof LANGUAGE_INFO;

export function isLanguage(lang: string): lang is Language {
    return lang in LANGUAGE_INFO;
}

export const LanguageUtils = {

    getLanguagesArray(): Array<{
        language: Language;
        label: string;
        available: boolean;
    }> {
        return (Object.entries(LANGUAGE_INFO) as [Language, typeof LANGUAGE_INFO[Language]][])
            .map(([language, info]) => ({
                language,
                label: info.label,
                available: info.available
            }));
    },

    getAllLanguages(): Language[] {
        return Object.keys(LANGUAGE_INFO) as Language[];
    },

    getAvailableLanguages(): Language[] {
        return (Object.entries(LANGUAGE_INFO) as [Language, typeof LANGUAGE_INFO[Language]][])
            .filter(([, info]) => info.available)
            .map(([lang]) => lang);
    },

    isAvailable(lang: Language): boolean | undefined {
        if (!isLanguage(lang)) { return undefined; }
        return LANGUAGE_INFO[lang].available;
    },

    getLabel(lang: Language): string | undefined {
        if (!isLanguage(lang)) { return undefined; }
        return LANGUAGE_INFO[lang].label;
    },

    getLanguageInfo(source: Language): typeof LANGUAGE_INFO[Language] | undefined {
        if (!isLanguage(source)) { return undefined; }
        return LANGUAGE_INFO[source];
    }
};
