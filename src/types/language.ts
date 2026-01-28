// src/types/languages.ts
const LANGUAGE_INFO = {
    en: {
        label: "English",
        available: true 
    },
    bg: {
        label: "Български",
        available: true
    },
} as const;

export type Language = keyof typeof LANGUAGE_INFO;

export const LanguageUtils = {

    isAvailable(lang: Language): boolean {
        return LANGUAGE_INFO[lang].available;
    },

    getLabel(lang: Language): string {
        return LANGUAGE_INFO[lang].label;
    },

    getAvailableLanguages(): Language[] {
        return (Object.entries(LANGUAGE_INFO) as [Language, typeof LANGUAGE_INFO[Language]][])
            .filter(([, info]) => info.available)
            .map(([lang]) => lang);
    },

    getAllLanguages(): Language[] {
        return Object.keys(LANGUAGE_INFO) as Language[];
    },

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
    

    getLanguageInfo(source: Language): typeof LANGUAGE_INFO[Language] {
        return LANGUAGE_INFO[source];
    }
};
