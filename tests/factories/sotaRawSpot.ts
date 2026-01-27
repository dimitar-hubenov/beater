// tests/factories.sotaRawSpot.ts
import { SotaRawSpot } from '../../src/spotSources/sourceSota';

export function makeSotaRawSpot(
    overrides: Partial<SotaRawSpot> = {}
): SotaRawSpot {
    return {
        id: 1,
        userID: 132435,
        timeStamp: '2026-01-17T10:00:00',
        comments: '',
        callsign: 'ZL2AJ', // Spotter callsign
        associationCode: 'ZL1',
        summitCode: 'WK-210',
        activatorCallsign: 'ZL2AJ',
        activatorName: 'Warren',
        frequency: '7.1',
        mode: 'SSB',
        summitDetails: 'ZL1/WK-210, 573m, 2 points',
        highlightColor: null,
        ...overrides
    }
}