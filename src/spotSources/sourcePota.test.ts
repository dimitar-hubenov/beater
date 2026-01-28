// src/spotSources/sourcePota.test.ts
import { describe, it, expect } from 'vitest';
import { makePotaRawSpot } from '../../tests/factories/potaRawSpot';
import { isUsablePotaSpot, normalizePotaSpot } from './sourcePota';

describe('isUsablePotaSpot', () => {
    it('returns true for valid spot', () => {
        expect(isUsablePotaSpot(makePotaRawSpot())).toBe(true);
    });

    it('accepts decimal frequency', () => {
        const spot = makePotaRawSpot({ frequency: '7033.5' });
        expect(isUsablePotaSpot(spot)).toBe(true);
    });

    it('accepts valid UTC time', () => {
        const spot = makePotaRawSpot({ spotTime: '2026-01-17T10:00:00Z' });
        expect(isUsablePotaSpot(spot)).toBe(true);
    });

    it.each([
        [{ activator: '' }],
        [{ reference: '' }],
        [{ frequency: 'abc' }],
        [{ frequency: '0' }],
        [{ spotTime: '' }],
        [{ spotTime: 'alabala' }],
        [{ spotTime: '2026-99-99T99:99' }],
        [{ comments: 'qrt' }],
        [{ comments: 'QRT' }],
        [{ comments: 'thanks to all, qrt now' }],
        [{ comments: 'QRT TU' }],
        [{ comments: 'TNX all, going QRT' }],
    ])('returns false for invalid override %o', (override) => {
        const spot = makePotaRawSpot(override as any);
        expect(isUsablePotaSpot(spot)).toBe(false);
    });

    it('returns false for null input', () => {
        expect(isUsablePotaSpot(null as any)).toBe(false);
    });
});


describe('normalizePotaSpot', () => {
    // happy path
    it('normalizes basic POTA spot', () => {
        const raw = makePotaRawSpot({
            spotId: 123,
            activator: ' K7ATN/P ',
            reference: ' US-001 ',
            frequency: '14280',
            mode: 'SSB',
            spotTime: '2026-01-17T10:00:00',
            spotter: 'K1ABC',
            comments: 'CQ',
            source: 'WEB'
        });

        const spot = normalizePotaSpot(raw);

        expect(spot.id).toBe('123');
        expect(spot.program).toBe('POTA');

        expect(spot.activator).toBe('K7ATN/P');
        expect(spot.reference).toBe('US-001');

        expect(spot.frequency).toBe(14280);
        expect(spot.band).toBeDefined();
        expect(spot.mode).toBe('SSB');

        expect(spot.time).toBe('2026-01-17T10:00:00Z');

        expect(spot.spotter).toBe('K1ABC');
        expect(spot.comments).toBe('CQ');

        expect(spot.raw).toBe(raw);
    });

    // coordinates
    it('sets latitude/longitude when valid numbers', () => {
        const raw = makePotaRawSpot({
            latitude: 42.5,
            longitude: 23.3
        });

        const spot = normalizePotaSpot(raw);

        expect(spot.latitude).toBe(42.5);
        expect(spot.longitude).toBe(23.3);
    });

    it('sets latitude/longitude undefined when invalid', () => {
        const raw = makePotaRawSpot({
            latitude: NaN,
            longitude: Infinity
        });

        const spot = normalizePotaSpot(raw);

        expect(spot.latitude).toBeUndefined();
        expect(spot.longitude).toBeUndefined();
    });

    it('rejects out of range coordinates', () => {
        const raw = makePotaRawSpot({
            latitude: 200,
            longitude: -300
        });

        const spot = normalizePotaSpot(raw);

        expect(spot.latitude).toBeUndefined();
        expect(spot.longitude).toBeUndefined();
    });

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
        const normalizedSpot = normalizePotaSpot(makePotaRawSpot(override as any));
        expect(normalizedSpot.mode).toBe(expected);
    });

    // Time
    it('adds trailing Z to spotTime', () => {
        const raw = makePotaRawSpot({
            spotTime: '2026-01-17T10:00:00'
        });

        const spot = normalizePotaSpot(raw);

        expect(spot.time).toBe('2026-01-17T10:00:00Z');
    });

    it('keeps trailing Z if already present', () => {
        const raw = makePotaRawSpot({
            spotTime: '2026-01-17T10:00:00Z'
        });

        const spot = normalizePotaSpot(raw);

        expect(spot.time).toBe('2026-01-17T10:00:00Z');
    });

    it('normalize spotter to empty string if not passed', () => {
        const raw = makePotaRawSpot({
            spotter: undefined
        });

        const spot = normalizePotaSpot(raw);

        expect(spot.spotter).toBe('');
    });

    // RBN suffix stripping -#
    it('strips RBN suffix from spotter', () => {
        const raw = makePotaRawSpot({
            source: 'RBN',
            spotter: 'K1ABC-#'
        });

        const spot = normalizePotaSpot(raw);

        expect(spot.spotter).toBe('K1ABC');
    });

    it('strips RBN suffix from comments', () => {
        const raw = makePotaRawSpot({
            source: 'RBN',
            comments: '599-#'
        });

        const spot = normalizePotaSpot(raw);

        expect(spot.comments).toBe('599');
    });
});