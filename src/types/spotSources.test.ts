// src/types/spotSource.test.ts
import { describe, it, expect } from 'vitest';
import { SourceUtils, type SpotSource } from "./spotSource";

describe("SourceUtils", () => {
    
    const sourcesArray = SourceUtils.getSourcesArray();

    it('getSourceArray has correct structure and values', () => {
        expect(Array.isArray(sourcesArray)).toBe(true);

        sourcesArray.forEach(item => {
            expect(typeof item.source).toBe('string');
            expect(typeof item.label).toBe('string');
            expect(typeof item.rateMin).toBe('number');
            expect(typeof item.rateMax).toBe('number');
            expect(typeof item.available).toBe('boolean');
        });
    });

    it('getAllSources has all defined sources', () => {
        const definedSources = SourceUtils.getAllSources();
        const arraySources = sourcesArray.map(item => item.source);
        expect(arraySources.sort()).toEqual(definedSources.sort());
    });

    it('getAvailableSources gets the correct subset', () => {
        const availableSources = SourceUtils.getAvailableSources();
        const expectedSources = sourcesArray
            .filter(item => item.available)
            .map(item => item.source);
        expect(availableSources.sort()).toEqual(expectedSources.sort());
    });

    it('retrieves correct availability for sources', () => {
        sourcesArray.forEach(item => {
            expect(SourceUtils.isAvailable(item.source)).toBe(item.available);
        });
    });

    it('retrieves correct labels for sources', () => {
        sourcesArray.forEach(item => {
            expect(SourceUtils.getLabel(item.source)).toBe(item.label);
        });
    });

    it('retrieves correct data for each source', () => {
        sourcesArray.forEach(item => {
            const info = SourceUtils.getSourceInfo(item.source);
            expect(info).toEqual({
                label: item.label,
                refreshRange: {
                    min: item.rateMin,
                    max: item.rateMax
                },
                available: item.available
            });
        });
    });

    it('varify at least one source is available', () => {
        const availableSources = SourceUtils.getAvailableSources();
        expect(availableSources.length).toBeGreaterThan(0);
    });

    describe("Rate Limits", () => {

        it('retrieves correct rate limits for each source', () => {
            sourcesArray.forEach(item => {
                const rateLimits = SourceUtils.getRateLimits(item.source) as { min: number; max: number };
                expect(rateLimits.min).toBe(item.rateMin);
                expect(rateLimits.max).toBe(item.rateMax);
            });
        });

        it('retrieves correct rate limits for each source via Min/Max methods', () => {
            sourcesArray.forEach(item => {
                const minRate = SourceUtils.getMinRate(item.source);
                const maxRate = SourceUtils.getMaxRate(item.source);
                expect(minRate).toBe(item.rateMin);
                expect(maxRate).toBe(item.rateMax);
            });
        });

        it('rate limits are evaluated correctly through the isValidRate method', () => {
            sourcesArray.forEach(item => {
                expect(SourceUtils.isValidRate(item.rateMin, item.source)).toBe(true);
                expect(SourceUtils.isValidRate(item.rateMax, item.source)).toBe(true);
                expect(SourceUtils.isValidRate((item.rateMin + item.rateMax) / 2, item.source)).toBe(true);
                expect(SourceUtils.isValidRate(item.rateMin - 1, item.source)).toBe(false);
                expect(SourceUtils.isValidRate(item.rateMax + 1, item.source)).toBe(false);
            });
        });

    });
    
    it('handles invalid source keys gracefully', () => {
        expect(SourceUtils.isAvailable('invalid' as SpotSource)).toBeUndefined();
        expect(SourceUtils.getLabel('invalid' as SpotSource)).toBeUndefined();
        expect(SourceUtils.getSourceInfo('invalid' as SpotSource)).toBeUndefined();

        expect(SourceUtils.getRateLimits('invalid' as SpotSource)).toBeUndefined();
        expect(SourceUtils.getMinRate('invalid' as SpotSource)).toBeUndefined();
        expect(SourceUtils.getMaxRate('invalid' as SpotSource)).toBeUndefined();

        expect(SourceUtils.isValidRate(10, 'invalid' as SpotSource)).toBeUndefined();
    });

});
