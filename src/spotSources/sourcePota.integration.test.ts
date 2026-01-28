import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PotaProgram } from './sourcePota';
import { makePotaRawSpot } from '../../tests/factories/potaRawSpot';
import { mockFetchOk, mockFetchError } from '../../tests/helpers/mockFetch';

describe('PotaProgram.fetchSpots (integration)', () => {

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('returns normalized spots from API', async () => {

        mockFetchOk([
            makePotaRawSpot({
                spotId: 1,
                activator: 'K7ATN/P',
                reference: 'US-001',
                frequency: '14000',
                spotTime: '2026-01-01T10:00:00'
            })
        ]);

        const result = await PotaProgram.fetchSpots();

        expect(result).toHaveLength(1);

        const spot = result[0];

        expect(spot.program).toBe('POTA');
        expect(spot.activator).toBe('K7ATN/P');
        expect(spot.reference).toBe('US-001');
        expect(spot.frequency).toBe(14000);
        expect(spot.time).toBe('2026-01-01T10:00:00Z');
    });

    it('filters out unusable spots', async () => {

        mockFetchOk([
            makePotaRawSpot({ activator: '' }),      // invalid
            makePotaRawSpot({ frequency: 'abc' }),   // invalid
            makePotaRawSpot({})                      // valid
        ]);

        const result = await PotaProgram.fetchSpots();

        expect(result).toHaveLength(1);
    });

    it('keeps only newest duplicate spot', async () => {

        mockFetchOk([
            makePotaRawSpot({
                spotId: 1,
                activator: 'A',
                reference: 'R1',
                spotTime: '2026-01-01T10:00:00'
            }),
            makePotaRawSpot({
                spotId: 2,
                activator: 'A',
                reference: 'R1',
                spotTime: '2026-01-01T11:00:00'
            })
        ]);

        const result = await PotaProgram.fetchSpots();

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('2');
    });

    it('throws when API responds with error', async () => {

        mockFetchError(500);

        await expect(
            PotaProgram.fetchSpots()
        ).rejects.toThrow('POTA API error: 500');
    });

});
