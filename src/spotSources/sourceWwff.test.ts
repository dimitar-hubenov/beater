// src/spotSources/sourceWwff.test.ts
import { describe, it, expect } from 'vitest';
import { makeWwffRawSpot } from '../../tests/factories/wwffRawSpot';
import { isUsableWwffSpot, normalizeWwffSpot } from './sourceWwff';

describe('isUsableWwffSpot', () => {
    it('returns true for valid spot', () => {
        expect(isUsableWwffSpot(makeWwffRawSpot())).toBe(true);
    });

    it('accepts decimal frequency', () => {
        const spot = makeWwffRawSpot({ frequency_khz: 7033.3 });
        expect(isUsableWwffSpot(spot)).toBe(true);
    });

    it('accepts valid Unix timestamp w/o formated time', () => {
        const spot = makeWwffRawSpot({
            spot_time: 1769333253,
            spot_time_formatted: ''
        });
        expect(isUsableWwffSpot(spot)).toBe(true);
    });

    it('accepts valid formated time w/o Unix timestamp', () => {
        const spot = makeWwffRawSpot({
            spot_time: undefined,
            spot_time_formatted: '2026-01-25 09:27:33'
        });
        expect(isUsableWwffSpot(spot)).toBe(true);
    });

    it('accepts valid UTC time', () => {
        const spot = makeWwffRawSpot({
            spot_time: undefined,
            spot_time_formatted: '2026-01-25T09:27:33Z' 
        });
        expect(isUsableWwffSpot(spot)).toBe(true);
    });

    it.each([
        [{ activator: '' }],
        [{ reference: '' }],
        [{ frequency_khz: null }],
        [{ frequency_khz: 0 }],
        [{ frequency_khz: -28250 }],
        [{ spot_time: undefined, spot_time_formatted: undefined }],
        [{ spot_time: -234, spot_time_formatted: undefined }],
        [{ spot_time: undefined, spot_time_formatted: 'invalid date format' }],
        [{ spot_time: undefined, spot_time_formatted: 'invalid date format' }],
        [{ remarks: 'qrt' }],
        [{ remarks: 'qrt' }],
        [{ remarks: 'QRT' }],
        [{ remarks: 'thanks to all, qrt now' }],
        [{ remarks: 'QRT TU' }],
        [{ remarks: 'TNX all, going QRT' }],
    ])('returns false for invalid override %o', (override) => {
        const spot = makeWwffRawSpot(override as any);
        expect(isUsableWwffSpot(spot)).toBe(false);
    });

    it('returns false for null input', () => {
        expect(isUsableWwffSpot(null as any)).toBe(false);
    });
});


describe('normalizeWwffSpot', () => {
    // happy path
    it('normalizes basic WWFF spot', () => {
        const raw = makeWwffRawSpot({
            id: 65310,
            activator: ' SP9AQQ ',
            frequency_khz: 7162,
            mode: 'SSB',
            reference: ' SPFF-2626 ',
            reference_name: 'Natura 2000 Labowa',
            remarks: 'Re-spot from web',
            spotter: 'SQ9WDR',
            latitude: 49.54291,
            longitude: 20.85224,
            spot_time: 1769338877,
            spot_time_formatted: '2026-01-25 11:01:17',
        });

        const spot = normalizeWwffSpot(raw);

        expect(spot.id).toBe('wwff-65310');
        expect(spot.program).toBe('WWFF');

        expect(spot.activator).toBe('SP9AQQ');
        expect(spot.reference).toBe('SPFF-2626');

        expect(spot.frequency).toBe(7162);
        expect(spot.band).toBe('40m');
        expect(spot.mode).toBe('SSB');

        expect(spot.time).toBe('2026-01-25T11:01:17Z');

        expect(spot.spotter).toBe('SQ9WDR');
        expect(spot.comments).toBe('Re-spot from web');

        expect(spot.raw).toBe(raw);
    });

    // coordinates
    it('sets latitude/longitude when valid numbers', () => {
        const raw = makeWwffRawSpot({
            latitude: 42.5,
            longitude: 23.3
        });

        const spot = normalizeWwffSpot(raw);

        expect(spot.latitude).toBe(42.5);
        expect(spot.longitude).toBe(23.3);
    });

    it('sets latitude/longitude undefined when invalid', () => {
        const raw = makeWwffRawSpot({
            latitude: NaN,
            longitude: Infinity
        });

        const spot = normalizeWwffSpot(raw);

        expect(spot.latitude).toBeUndefined();
        expect(spot.longitude).toBeUndefined();
    });

    it('rejects out of range coordinates', () => {
        const raw = makeWwffRawSpot({
            latitude: 200,
            longitude: -300
        });

        const spot = normalizeWwffSpot(raw);

        expect(spot.latitude).toBeUndefined();
        expect(spot.longitude).toBeUndefined();
    });

    // Mode parsing fallback
    it.each([
        [{ mode: 'SSB' }, 'SSB'],
        [{ mode: 'CW' }, 'CW'],
        [{ mode: 'FT8' }, 'FT8'],
        [{ mode: 'ft4' }, 'FT4'],
        [{ mode: 'Emc2' }, 'unknown'],
        [{ mode: '' }, 'unknown'],
        [{ mode: undefined }, 'unknown'],
    ])('parses mode safely %o', (override, expected) => {
        const normalizedSpot = normalizeWwffSpot(makeWwffRawSpot(override as any));
        expect(normalizedSpot.mode).toBe(expected);
    });

    // Time
    it('normalize formatted time w/o T and trailing Z', () => {
        const raw = makeWwffRawSpot({
            spot_time: undefined,
            spot_time_formatted: '2026-01-25 09:27:33'
        });

        const spot = normalizeWwffSpot(raw);

        expect(spot.time).toBe('2026-01-25T09:27:33Z');
    });

    it('normalize properly formatted time w/o change', () => {
        const raw = makeWwffRawSpot({
            spot_time: undefined,
            spot_time_formatted: '2026-01-25T09:27:33Z'
        });

        const spot = normalizeWwffSpot(raw);

        expect(spot.time).toBe('2026-01-25T09:27:33Z');
    });

    it('normalize to empty string with invalid formatted time', () => {
        const raw = makeWwffRawSpot({
            spot_time: undefined,
            spot_time_formatted: '2026-55-66 77:88:99'
        });

        const spot = normalizeWwffSpot(raw);

        expect(spot.time).toBe('');
    });

    it('normalize from Unix time', () => {
        const raw = makeWwffRawSpot({
            spot_time: 1769333253,
            spot_time_formatted: ''
        });

        const spot = normalizeWwffSpot(raw);

        expect(spot.time).toBe('2026-01-25T09:27:33Z');
    });

    it('normalize fallback to empty string', () => {
        const raw = makeWwffRawSpot({
            spot_time: undefined,
            spot_time_formatted: undefined
        });

        const spot = normalizeWwffSpot(raw);

        expect(spot.time).toBe('');
    });


    it('normalize spotter to empty string if not passed', () => {
        const raw = makeWwffRawSpot({
            spotter: undefined
        });

        const spot = normalizeWwffSpot(raw);

        expect(spot.spotter).toBe('');
    });

    it('normalize remarks to empty string if not passed', () => {
        const raw = makeWwffRawSpot({
            remarks: undefined
        });

        const spot = normalizeWwffSpot(raw);

        expect(spot.comments).toBe('');
    });

});