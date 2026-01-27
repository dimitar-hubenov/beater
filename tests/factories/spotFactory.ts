// tests/factories/spotFactory.ts
import type { SpotUI } from '../../src/types/spot';
import type { Band } from '../../src/types/band';
import type { Mode } from '../../src/types/mode';
import type { SpotSource } from '../../src/types/spotSource';

let idCounter = 1;

export function resetSpotFactory() {
    idCounter = 1;
}

export function makeSpot(overrides: Partial<SpotUI> = {}): SpotUI {
    return {
        id: String(idCounter++),

        program: 'POTA' as SpotSource,

        activator: 'LZ1ABC',
        reference: 'LZ-001',

        frequency: 7000,
        band: '40m' as Band,
        mode: 'CW' as Mode,

        time: '2025-01-01T12:00:00Z',

        spotter: 'TEST',
        comments: '',

        latitude: 42,
        longitude: 23,
        distanceKm: 100,

        raw: undefined,

        ...overrides,
    };
}
