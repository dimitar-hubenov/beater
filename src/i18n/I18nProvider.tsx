//i18n/i18nProvider.tsx
import { createContext, useContext, ReactNode, useMemo } from 'react';
import type { Language } from '../types/language';

import en from './locales/en.json';
import bg from './locales/bg.json';


export interface Messages {
    [key: string]: string | Messages;
}

export type I18nKey = string;

const dictionaries: Record<Language, Messages> = {
    en,
    bg,
};

export type I18nContextValue = {
    t: (key: I18nKey) => string;
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
            const value = resolveKey(messages, key);
            if (!value && import.meta.env.DEV) {
                console.warn(`Missing i18n key: ${key}`);
            }
            return value ?? key;
        },
    }), [language, messages]);

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
}

function resolveKey(
    obj: Messages,
    path: string
): string | undefined {
    return path.split('.').reduce<any>(
        (acc, part) => acc?.[part],
        obj
    );
}