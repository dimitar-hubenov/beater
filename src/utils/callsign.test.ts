// src/utils/callsign.test.ts
import { describe, it, expect } from 'vitest';
import { formatCallsign } from './callsign';

describe('formatCallsign', () => {

    it('formats simple callsign', () => {
        expect(formatCallsign('LZ1ABC'))
            .toBe('    LZ1ABC     ');
    });

    it('formats prefixed callsign', () => {
        expect(formatCallsign('EA/F4MFS'))
            .toBe('  EA/F4MFS     ');
    });

    it('formats suffixed callsign', () => {
        expect(formatCallsign('F4MFS/P'))
            .toBe('     F4MFS/P   ');
    });

    it('formats long multi-part callsign', () => {
        expect(formatCallsign('EA8/YR0POTA/QRP'))
            .toBe('EA8/YR0POTA/QRP');
    });

    it('formats special club callsign', () => {
        expect(formatCallsign('LA/YR0POTA'))
            .toBe(' LA/YR0POTA    ');
    });

    it('does not cut callsign longer than max length', () => {
        const long = 'VERYVERYLONGCALLSIGN123';
        expect(formatCallsign(long)).toBe(long);
    });

    it('handles empty string safely', () => {
        expect(formatCallsign('')).toBe('');
    });

    it('handles invalid callsign without digit in it', () => {
        expect(formatCallsign('DLOABC')).toBe('DLOABC         ');
    });

    it('handles invalid callsign without digit but with suffix', () => {
        expect(formatCallsign('DLOABC/P')).toBe('DLOABC/P       ');
    });

    it('handles invalid callsign without digit but with prefix and suffix', () => {
        expect(formatCallsign('AE/DLOABC/P')).toBe('AE/DLOABC/P    ');
    });

});
