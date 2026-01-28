import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WwffProgram } from './sourceWwff';
import { makeWwffRawSpot } from '../../tests/factories/wwffRawSpot';
import { mockFetchOk, mockFetchError } from '../../tests/helpers/mockFetch';

describe('WwffProgram.fetchSpots (integration)', () => {

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('returns normalized spots from API', async () => {

        mockFetchOk([
            makeWwffRawSpot({
                id: 1,
                activator: 'VK6ASK',
                reference: 'VKFF-0514',
                frequency_khz: 7170,
                spot_time: undefined,
                spot_time_formatted: '2026-01-25 07:17:17'
            })
        ]);

        const result = await WwffProgram.fetchSpots();

        expect(result).toHaveLength(1);

        const spot = result[0];

        expect(spot.program).toBe('WWFF');
        expect(spot.activator).toBe('VK6ASK');
        expect(spot.reference).toBe('VKFF-0514');
        expect(spot.frequency).toBe(7170);
        expect(spot.time).toBe('2026-01-25T07:17:17Z');
    });

    it('filters out unusable spots', async () => {

        mockFetchOk([
            makeWwffRawSpot({ activator: '' }),      // invalid
            makeWwffRawSpot({ frequency_khz: -258 }),// invalid
            makeWwffRawSpot({})                      // valid
        ]);

        const result = await WwffProgram.fetchSpots();

        expect(result).toHaveLength(1);
    });

    it('keeps only newest duplicate spot', async () => {

        mockFetchOk([
            makeWwffRawSpot({
                id: 1,
                activator: 'VK6ASK',
                reference: 'VKFF-0514',
                frequency_khz: 7170,
                spot_time: undefined,
                spot_time_formatted: '2026-01-25 07:17:17'
            }),
            makeWwffRawSpot({
                id: 2,
                activator: 'VK6ASK',
                reference: 'VKFF-0514',
                frequency_khz: 7170,
                spot_time: undefined,
                spot_time_formatted: '2026-01-25 08:17:17'
            })
        ]);

        const result = await WwffProgram.fetchSpots();

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('wwff-2');
    });

    it('throws when API responds with error', async () => {

        mockFetchError(500);

        await expect(
            WwffProgram.fetchSpots()
        ).rejects.toThrow('WWFF API error: 500');
    });

});
