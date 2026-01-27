// src/spotSources/sourceSota.test.ts
import { describe, it, expect } from 'vitest';
import { makeSotaRawSpot } from '../../tests/factories/sotaRawSpot';
import { isUsableSotaSpot, normalizeSotaSpot } from './sourceSota';

describe('isUsableSotaSpot', () => {
    it('returns true for valid spot', () => {
        expect(isUsableSotaSpot(makeSotaRawSpot())).toBe(true);
    });

    it('accepts decimal frequency', () => {
        const spot = makeSotaRawSpot({ frequency: '7.0335' });
        expect(isUsableSotaSpot(spot)).toBe(true);
    });

    it('accepts valid UTC time', () => {
        const spot = makeSotaRawSpot({ timeStamp: '2026-01-17T10:00:00Z' });
        expect(isUsableSotaSpot(spot)).toBe(true);
    });

    it.each([
        [{ activatorCallsign: '' }],
        [{ activatorCallsign: undefined }],
        [{ activatorCallsign: null }],
        [{ associationCode: '' }],
        [{ associationCode: undefined }],
        [{ associationCode: null }],
        [{ summitCode: '' }],
        [{ summitCode: undefined }],
        [{ summitCode: null }],
        [{ frequency: 'abc' }],
        [{ frequency: '0' }],
        [{ timeStamp: '' }],
        [{ timeStamp: 'alabala' }],
        [{ timeStamp: '2026-99-99T99:99' }],
        [{ comments: 'qrt' }],
        [{ comments: 'QRT' }],
        [{ comments: 'thanks to all, qrt now' }],
        [{ comments: 'QRT TU' }],
        [{ comments: 'TNX all, going QRT' }],
    ])('returns false for invalid override %o', (override) => {
        const spot = makeSotaRawSpot(override as any);
        expect(isUsableSotaSpot(spot)).toBe(false);
    });

    it('returns false for null input', () => {
        expect(isUsableSotaSpot(null as any)).toBe(false);
    });
});

describe('normalizeSotaSpot', () => {
    // happy path
    it('normalizes basic SOTA spot', () => {
        const raw = makeSotaRawSpot({
            id: 123,
            userID: 124578,
            timeStamp: '2026-01-17T10:00:00',
            comments: 'CQ',
            callsign: 'K1ABC',
            associationCode: 'W6',
            summitCode: 'NC-298',
            activatorCallsign: ' KE6X/P ',
            activatorName: 'Randall',
            frequency: '145.67', // in MHz
            mode: 'FM',
            summitDetails: 'Vollmer Peak, 581m, 1 points',
            highlightColor: null,
        });

        const spot = normalizeSotaSpot(raw);

        expect(spot.id).toBe('sota-123');
        expect(spot.program).toBe('SOTA');

        expect(spot.activator).toBe('KE6X/P');
        expect(spot.reference).toBe('W6/NC-298');

        expect(spot.frequency).toBe(145670);
        expect(spot.band).toBeDefined();
        expect(spot.mode).toBe('FM');

        expect(spot.time).toBe('2026-01-17T10:00:00Z');

        expect(spot.spotter).toBe('K1ABC');
        expect(spot.comments).toBe('CQ');

        //expect(spot.raw).toContain(raw);
    });

    // coordinates are not provided here

    // Mode parsing fallback
    it.each([
        [{ mode: 'SSB' }, 'SSB'],
        [{ mode: 'CW' }, 'CW'],
        [{ mode: 'FT8' }, 'FT8'],
        [{ mode: 'ft4' }, 'FT4'],
        [{ mode: 'Emc2' }, 'Other'],
        [{ mode: '' }, 'Other'],
        [{ mode: undefined }, 'Other'],
    ])('parses mode safely %o', (override, expected) => {
        const normalizedSpot = normalizeSotaSpot(makeSotaRawSpot(override as any));
        expect(normalizedSpot.mode).toBe(expected);
    });

    // Time
    it('adds trailing Z to spotTime', () => {
        const raw = makeSotaRawSpot({ timeStamp: '2026-01-17T10:00:00' });
        const spot = normalizeSotaSpot(raw);

        expect(spot.time).toBe('2026-01-17T10:00:00Z');
    });

    it('keeps trailing Z if already present', () => {
        const raw = makeSotaRawSpot({ timeStamp: '2026-01-17T10:00:00Z' });
        const spot = normalizeSotaSpot(raw);

        expect(spot.time).toBe('2026-01-17T10:00:00Z');
    });

    it('normalize spotter to empty string if not passed', () => {
        const raw = makeSotaRawSpot({ callsign: undefined });
        const spot = normalizeSotaSpot(raw);

        expect(spot.spotter).toBe('');
    });
});