// tests/factories.potaRawSpot.ts
import { PotaRawSpot } from '../../src/spotSources/sourcePota';

export function makePotaRawSpot(
    overrides: Partial<PotaRawSpot> = {}
): PotaRawSpot {
    return {
        spotId: 1,
        activator: 'TEST/P',
        frequency: "14280",
        mode: 'SSB',
        reference: 'US-0001',
        spotTime: '2026-01-17T10:00:00',
        spotter: 'K1ABC',
        comments: '',
        source: 'WEB',
        invalid: null,
        name: '',
        locationDesc: '',
        grid4: 'AA00',
        grid6: 'AA00aa',
        count: 1,
        expire: 60,
        ...overrides
    }
}