//i18n/i18nProvider.tsx
import { createContext, useContext, ReactNode, useMemo } from 'react';
import type { Language } from '../types/userSettings';

import en from './locales/en.json';
import bg from './locales/bg.json';


type Messages = Record<string, string>;

const dictionaries: Record<Language, Messages> = {
    en,
    bg,
};

export type I18nContextValue = {
    t: (key: string) => string;
    language: Language;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
    language,
    children,
}: {
    language: Language;
    children: ReactNode;
}) {
    const messages = dictionaries[language] ?? dictionaries.en;

    const value = useMemo<I18nContextValue>(() => ({
        language,
        t(key) {
            return messages[key] ?? key;
        },
    }), [language, messages]);

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
}
