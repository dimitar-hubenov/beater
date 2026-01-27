import { describe, it, expect } from 'vitest';
import {
    parseNumber,
    parseOptionalNumber,
    parseNonEmptyString
} from './parsers';

describe('parser utils', () => {
    
    it('return the number from a string', () => {
        expect(parseNumber('234')).toBe(234);
    });

    it('return zero from an empty string', () => {
        expect(parseNumber('')).toBe(0);
    });

    it('return zero from null', () => {
        expect(parseNumber(null)).toBe(0);
    });

    it('return null from infinity', () => {
        expect(parseNumber("Infinity")).toBe(null);
    });


    it('return the number from a string', () => {
        expect(parseOptionalNumber('234')).toBe(234);
    });

    it('return zero from an empty string', () => {
        expect(parseOptionalNumber('')).toBe(0);
    });

    it('return zero from null', () => {
        expect(parseOptionalNumber(null)).toBe(0);
    });

    it('return undefined from infinity', () => {
        expect(parseOptionalNumber("Infinity")).toBe(undefined);
    });


    it('return null if not a string', () => {
        expect(parseNonEmptyString(1234)).toBe(null);
    });

    it('return null if empty string', () => {
        expect(parseNonEmptyString(' ')).toBe(null);
    });

    it('reim the string', () => {
        expect(parseNonEmptyString(' Boots ')).toBe('Boots');
    });

});
