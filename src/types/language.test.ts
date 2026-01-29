// src/types/language.test.ts
import { describe, it, expect } from 'vitest';
import { type Language, LanguageUtils } from './language';

describe('LanguageUtils', () => {

    const languagesArray = LanguageUtils.getLanguagesArray();

    it('getLAnguagesArray has correct type and structure', () => {
        expect(Array.isArray(languagesArray)).toBe(true);

        languagesArray.forEach(item => {
            expect(typeof item.language).toBe('string');
            expect(typeof item.label).toBe('string');
            expect(typeof item.available).toBe('boolean');
        });
    });

    it('getAllLanguages has all defined languages', () => {
        const definedLanguages = LanguageUtils.getAllLanguages();
        const arrayLanguages = languagesArray.map(item => item.language);
        expect(arrayLanguages.sort()).toEqual(definedLanguages.sort());
    });

    it('getAvailableLanguages gets the correct subset', () => {
        const availableLanguages = LanguageUtils.getAvailableLanguages();
        const expectedLanguages = languagesArray
            .filter(item => item.available)
            .map(item => item.language);
        expect(availableLanguages.sort()).toEqual(expectedLanguages.sort());
    });

    it('retrieves correct availability for languages', () => {
        languagesArray.forEach(item => {
            expect(LanguageUtils.isAvailable(item.language)).toBe(item.available);
        });
    });

    it('retrieves correct labels for languages', () => {
        languagesArray.forEach(item => {
            expect(LanguageUtils.getLabel(item.language)).toBe(item.label);
        });
    });

    it('retrieves correct data for each language', () => {
        languagesArray.forEach(item => {
            const info = LanguageUtils.getLanguageInfo(item.language);
            expect(info).toEqual({ label: item.label, available: item.available });
        });
    });

    it('varify at least one language is available', () => {
        const availableLanguages = LanguageUtils.getAvailableLanguages();
        expect(availableLanguages.length).toBeGreaterThan(0);
    });
    
    it('handles invalid language keys gracefully', () => {
        expect(LanguageUtils.isAvailable('invalid' as Language)).toBeUndefined();
        expect(LanguageUtils.getLabel('invalid' as Language)).toBeUndefined();
        expect(LanguageUtils.getLanguageInfo('invalid' as Language)).toBeUndefined();
        
    });
    
});