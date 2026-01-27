import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SotaProgram } from './sourceSota';
import { makeSotaRawSpot } from '../../tests/factories/sotaRawSpot';
import { mockFetchOk, mockFetchError } from '../../tests/helpers/mockFetch';

describe('SotaProgram.fetchSpots (integration)', () => {

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('returns normalized spots from API', async () => {

        mockFetchOk([
            makeSotaRawSpot({
                id: 243310,
                userID: 19344,
                timeStamp: '2026-01-26T22:00:02',
                comments: '[RBNHole] at WA7LNW 25 WPM 41 dB SNR',
                callsign: 'RBNHOLE',
                associationCode: 'W7Y',
                summitCode: 'TT-122',
                activatorCallsign: 'K7GUD',
                activatorName: 'Patrick',
                frequency: '14.0622',
                mode: 'CW',
                summitDetails: 'Pass Benchmark, 2828m, 6 points',
                highlightColor: null
            })
        ]);

        const result = await SotaProgram.fetchSpots();

        expect(result).toHaveLength(1);

        const spot = result[0];

        expect(spot.program).toBe('SOTA');
        expect(spot.activator).toBe('K7GUD');
        expect(spot.reference).toBe('W7Y/TT-122');
        expect(spot.frequency).toBe(14062.2);
        
        expect(spot.time).toBe('2026-01-26T22:00:02Z');
    });

    it('filters out unusable spots', async () => {

        mockFetchOk([
            makeSotaRawSpot({ activatorCallsign: '' }), // invalid
            makeSotaRawSpot({ timeStamp: 'abc' }),      // invalid
            makeSotaRawSpot({})                         // valid
        ]);

        const result = await SotaProgram.fetchSpots();

        expect(result).toHaveLength(1);
    });

    it('keeps only newest duplicate spot', async () => {

        mockFetchOk([
            makeSotaRawSpot({
                id: 1,
                activatorCallsign: 'A',
                associationCode: 'R1',
                summitCode: 'R1-168',
                timeStamp: '2026-01-17T12:00:00Z'
            }),
            makeSotaRawSpot({
                id: 2,
                activatorCallsign: 'A',
                associationCode: 'R1',
                summitCode: 'R1-168',
                timeStamp: '2026-01-01T11:00:00'
            })
        ]);

        const result = await SotaProgram.fetchSpots();

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('sota-1');
    });

    it('throws when API responds with error', async () => {

        mockFetchError(500);

        await expect(
            SotaProgram.fetchSpots()
        ).rejects.toThrow('SOTA API error: 500');
    });

});
