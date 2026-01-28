// src/spotSources/utils/deduplicateSpots.test.ts
import { describe, it, expect } from 'vitest';
import { deduplicateSpots, getSpotKey } from './deduplicateSpots';
import { makeSpot } from '../../../tests/factories/spotFactory';

describe('getSpotKey', () => {

    it('creates lowercase trimmed key', () => {
        const spot = makeSpot({
            activator: ' TEST/P ',
            reference: ' Us-123 '
        });

        expect(getSpotKey(spot)).toBe('test/p|us-123');
    });

});

describe('deduplicateSpots', () => {

    it('returns same array if no duplicates exist', () => {
        const spots = [
            makeSpot({ activator: 'A', reference: 'R1' }),
            makeSpot({ activator: 'B', reference: 'R2' })
        ];

        const result = deduplicateSpots(spots);

        expect(result).toHaveLength(2);
    });

    it('keeps only newest spot when duplicate exists', () => {
        const oldSpot = makeSpot({
            activator: 'A',
            reference: 'R1',
            time: '2026-01-01T10:00:00Z'
        });

        const newSpot = makeSpot({
            activator: 'A',
            reference: 'R1',
            time: '2026-01-01T11:00:00Z'
        });

        const resultOldNew = deduplicateSpots([oldSpot, newSpot]);
        expect(resultOldNew).toHaveLength(1);
        expect(resultOldNew[0]).toBe(newSpot);

        // confirm it is consistent if spots come in reverse order
        const resultNewOld = deduplicateSpots([oldSpot, newSpot]);
        expect(resultNewOld).toHaveLength(1);
        expect(resultNewOld[0]).toBe(newSpot);
    });

    it('treats trimmed activator and reference as same key', () => {
        const a = makeSpot({
            activator: ' A ',
            reference: ' R1 ',
            time: '2026-01-01T10:00:00Z'
        });

        const b = makeSpot({
            activator: 'A',
            reference: 'R1',
            time: '2026-01-01T11:00:00Z'
        });

        const result = deduplicateSpots([a, b]);

        expect(result).toHaveLength(1);
    });

    it('is case-insensitive for activator and reference', () => {
        const a = makeSpot({
            activator: 'k7atn/p',
            reference: 'us-001',
            time: '2026-01-01T10:00:00Z'
        });

        const b = makeSpot({
            activator: 'K7ATN/P',
            reference: 'US-001',
            time: '2026-01-01T11:00:00Z'
        });

        const result = deduplicateSpots([a, b]);

        expect(result).toHaveLength(1);
    });

    it('does not merge spots with different reference', () => {
        const a = makeSpot({ activator: 'A', reference: 'R1' });
        const b = makeSpot({ activator: 'A', reference: 'R2' });

        const result = deduplicateSpots([a, b]);

        expect(result).toHaveLength(2);
    });

    it('does not merge spots with different activator', () => {
        const a = makeSpot({ activator: 'A1', reference: 'R' });
        const b = makeSpot({ activator: 'A2', reference: 'R' });

        const result = deduplicateSpots([a, b]);

        expect(result).toHaveLength(2);
    });

    it('returns empty array when input is empty', () => {
        const result = deduplicateSpots([]);
        expect(result).toEqual([]);
    });
});
