// tests/factories.wwffRawSpot.ts
import { WwffRawSpot } from '../../src/spotSources/sourceWwff';

export function makeWwffRawSpot(
    overrides: Partial<WwffRawSpot> = {}
): WwffRawSpot {
    return {
        id: 65294,
        activator: 'Z35M',
        frequency_khz: 10123,
        mode: 'CW',
        reference: 'Z3FF-0107',
        reference_name: 'Rasadnik, Skopje',
        remarks: 'Re-spotted via RBN',
        spotter: 'HA5E',
        latitude: 41.9748,
        longitude: 21.4482,
        spot_time: 1769333253,            // Unix timestamp
        spot_time_formatted: '2026-01-25 09:27:33',
        ...overrides
    }
}