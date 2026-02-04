import { describe, it, expect } from 'vitest';
import {
    calculateDistance,
    isValidLatitude,
    isValidLongitude,
    convertDistanceToKm,
    convertDistanceFromKm,
    getDistanceValue,
    formatDistance,
    getDistanceMaxRange,
    getDistanceDisplayUnit
} from './distance';

describe('Distance calculation', () => {
    it('returns 0 for same coordinates', () => {
        const d = calculateDistance(42, 23, 42, 23);
        expect(d).toBeCloseTo(0, 5);
    });

    it('is symmetric', () => {
        const d1 = calculateDistance(42, 23, 43, 24);
        const d2 = calculateDistance(43, 24, 42, 23);
        expect(d1).toBeCloseTo(d2, 6);
    });

    it('calculates Sofia to Plovdiv distance', () => {
        const d = calculateDistance(
            42.6977, 23.3219,
            42.1354, 24.7453
        );

        expect(d).toBeGreaterThan(120);
        expect(d).toBeLessThan(140);
    });

    it('calculates London to Paris distance', () => {
        const d = calculateDistance(
            51.5074, -0.1278,
            48.8566, 2.3522
        );

        expect(d).toBeGreaterThan(330);
        expect(d).toBeLessThan(360);
    });

});

describe('isValidLatitude', () => {
    it.each([
        [0, true],
        [45, true],
        [-45, true],
        [90, true],
        [-90, true],
        [89.9999, true],
    ])('returns true for valid latitude %o', (value, expected) => {
        expect(isValidLatitude(value)).toBe(expected);
    });

    it.each([
        [91],
        [-91],
        [100],
        [-100],
        [Infinity],
        [-Infinity],
        [NaN],
        ['45'],
        [null],
        [undefined],
        [{}],
        [true],
    ])('returns false for invalid latitude %o', (value) => {
        expect(isValidLatitude(value)).toBe(false);
    });
});

describe('isValidLongitude', () => {
    it.each([
        [0, true],
        [90, true],
        [-90, true],
        [180, true],
        [-180, true],
        [179.9999, true],
    ])('returns true for valid longitude %o', (value, expected) => {
        expect(isValidLongitude(value)).toBe(expected);
    });

    it.each([
        [181],
        [-181],
        [200],
        [-200],
        [Infinity],
        [-Infinity],
        [NaN],
        ['90'],
        [null],
        [undefined],
        [{}],
        [false],
    ])('returns false for invalid longitude %o', (value) => {
        expect(isValidLongitude(value)).toBe(false);
    });
});

describe('distance utils', () => {
    it('converts miles to km', () => {
        expect(convertDistanceToKm(10, 'mi')).toBeCloseTo(16.09, 2);
    });

    it('calls convertToKm with value in km', () => {
        expect(convertDistanceToKm(112, 'km')).toBe(112);
    });

    it('converts km to miles', () => {
        expect(convertDistanceFromKm(16.09344, 'mi')).toBeCloseTo(10, 2);
    });

    it('rounds display value', () => {
        expect(getDistanceValue(16.1, 'mi')).toBe(10);
    });

    it('formats distance', () => {
        expect(formatDistance(100, 'km')).toBe('100 km');
    });

    it('format distance in miles', () => {
        expect(formatDistance(161, 'mi')).toBe('100 mi');
    });

    it('return empty string when no unit is passed', () => {
        expect(getDistanceDisplayUnit()).toBe('');
    })

    it('get correct max range in km', () => {
        expect(getDistanceMaxRange('km')).toBe(20000);
    });

    it('get correct max range in mi', () => {
        expect(getDistanceMaxRange('mi')).toBe(12500);
    });

    it('get max range of 0 if no unit is passed', () => {
        expect(getDistanceMaxRange()).toBe(0);
    });

});

describe('formatDistance', () => {
    it('returns em dash for null or undefined', () => {
        expect(formatDistance(null, 'km')).toBe('—');
        expect(formatDistance(undefined, 'mi')).toBe('—');
    });

    it('formats distance correctly', () => {
        expect(formatDistance(1234.56, 'km')).toBe('1235 km');
        expect(formatDistance(804.67, 'mi')).toBe('500 mi');
    });
});
