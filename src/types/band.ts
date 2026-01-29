// src/types/band.ts

export type BandGroup = string;

export type FrequencyRange = {
    min: number;
    max: number;
};

export type DistanceZones = {
    skip?: number;
    near?: number;
    far?: number;
};

type BandInfo = {
    group: BandGroup;
    frequencies?: FrequencyRange;
    zones?: DistanceZones;
};

// Band main object definition
const BAND_INFO = {
    // HF Bands
    '160m': {
        group: '160m',
        frequencies: { min: 1800, max: 2000 },
        zones: { skip: 50, near: 200, far: 800 }
    },
    '80m': {
        group: '80m',
        frequencies: { min: 3500, max: 4000 },
        zones: { skip: 50, near: 300, far: 1000 }
    },
    '60m': {
        group: '60m',
        frequencies: { min: 5300, max: 5450 },
        zones: { skip: 50, near: 300, far: 1200 }
    },
    '40m': {
        group: '40m',
        frequencies: { min: 7000, max: 7300 },
        zones: { skip: 100, near: 500, far: 1500 }
    },
    '30m': {
        group: '30m',
        frequencies: { min: 10100, max: 10150 },
        zones: { skip: 150, near: 800, far: 2000 }
    },
    '20m': {
        group: '20m',
        frequencies: { min: 14000, max: 14350 },
        zones: { skip: 200, near: 900, far: 3500 }
    },
    '17m': {
        group: '17m',
        frequencies: { min: 18068, max: 18168 },
        zones: { skip: 200, near: 1000, far: 3500 }
    },
    '15m': {
        group: '15m',
        frequencies: { min: 21000, max: 21450 },
        zones: { skip: 300, near: 1500, far: 4000 }
    },
    '12m': {
        group: '12m',
        frequencies: { min: 24890, max: 24990 },
        zones: { skip: 300, near: 1500, far: 4500 }
    },
    '10m': {
        group: '10m',
        frequencies: { min: 28000, max: 29700 },
        zones: { skip: 1200, near: 2000, far: 5000 }
    },

    // VHF/UHF Bands
    '6m': {
        group: 'VHF/UHF',
        frequencies: { min: 50000, max: 54000 },
        zones: { skip: undefined, near: 100, far: 500 }
    },
    '4m': {
        group: 'VHF/UHF',
        frequencies: { min: 70000, max: 70500 },
        zones: { skip: undefined, near: 50, far: 200 }
    },
    '2m': {
        group: 'VHF/UHF',
        frequencies: { min: 144000, max: 148000 },
        zones: { skip: undefined, near: 50, far: 200 }
    },
    '1.25m': {
        group: 'VHF/UHF',
        frequencies: { min: 222000, max: 225000 },
        zones: { skip: undefined, near: 50, far: 200 }
    },
    '70cm': {
        group: 'VHF/UHF',
        frequencies: { min: 420000, max: 450000 },
        zones: { skip: undefined, near: 50, far: 200 }
    },
    unknown: {
        group: 'unknown',
        frequencies: undefined,
        zones: undefined
    },
} as const satisfies Record<string, BandInfo>;

// Extract the types from the object
export type Band = keyof typeof BAND_INFO;
export type BandToggle = typeof BAND_INFO[Band]['group'];

// Helper functions
export const BandUtils = {

    parse(rawBand: string | null | undefined): Band {
        if (rawBand == null || rawBand.trim() === '') {
            return 'unknown';
        }

        const normalized = rawBand.trim().toLowerCase();
        const bandKey = Object.keys(BAND_INFO).find(
            key => key.toLowerCase() === normalized
        ) as Band | undefined;

        return bandKey || 'unknown';
    },

    // Frequency related functions

    getAllBandsWithFrequencies(): Array<{
        band: Band;
        frequencies: FrequencyRange;
    }> {
        return Object.entries(BAND_INFO)
            .filter(([, info]) => info.frequencies)
            .map(([band, info]) => ({
                band: band as Band,
                frequencies: info.frequencies!
            }));
    },

    detectFromFrequency(freqKhz: number | null | undefined): Band {
        if (freqKhz == null || isNaN(freqKhz)) {
            return 'unknown';
        }

        for (const [band, info] of Object.entries(BAND_INFO) as [Band, BandInfo][]) {
            if (!info.frequencies) continue;

            if (
                freqKhz >= info.frequencies.min &&
                freqKhz <= info.frequencies.max
            ) {
                return band;
            }
        }

        return 'unknown';
    },

    getFrequencyRange(band: Band): FrequencyRange | undefined {
        return BAND_INFO[band].frequencies;
    },

    isFrequencyInBand(freqKhz: number, band: Band): boolean {
        const range = BandUtils.getFrequencyRange(band);
        if (!range) return false; // Band has no defined frequency range ("unknown")

        return freqKhz >= range.min && freqKhz <= range.max;
    },

    // Toggle related functions

    getAllTogglesArray(): BandToggle[] {
        return Array.from(new Set(
            Object.values(BAND_INFO).map(info => info.group)
        ));
    },
    
    getBandToggles(): { id: BandToggle; bands: Band[] }[] {
        const groups = new Set<BandToggle>();
        Object.values(BAND_INFO).forEach(info => groups.add(info.group));

        return Array.from(groups).map(group => ({
            id: group,
            bands: this.getBandsForToggle(group)
        }));
    },

    getToggleForBand(band: Band): BandToggle {
        return BAND_INFO[band].group;
    },

    getBandsForToggle(toggle: BandToggle): Band[] {
        return (Object.entries(BAND_INFO) as [Band, typeof BAND_INFO[Band]][])
            .filter(([, info]) => info.group === toggle)
            .map(([band]) => band);
    },

    isBandInToggle(band: Band, toggle: BandToggle): boolean {
        return BAND_INFO[band].group === toggle;
    },

    // Distance zone related functions

    getDistanceZones(band: Band): { 
        skip: number | undefined; 
        near: number | undefined; 
        far: number | undefined;
    } {
        const info = BAND_INFO[band];
        return {
            skip: info.zones?.skip,
            near: info.zones?.near,
            far: info.zones?.far
        };
    },

    getDistanceZone(
        distance: number | null | undefined, 
        band: Band
    ): 'skip' | 'near' | 'medium' | 'far' | 'unknown' {
        if (distance == null || isNaN(distance) || distance < 0) {
            return 'unknown';
        }

        const zones = this.getDistanceZones(band);

        if (zones.skip === undefined && zones.near === undefined && zones.far === undefined) {
            return 'unknown';
        }

        if (zones.skip !== undefined && distance < zones.skip) {
            return 'skip';
        }

        if (zones.near !== undefined && distance < zones.near) {
            return 'near';
        }

        if (zones.far !== undefined && distance < zones.far) {
            return 'medium';
        }

        return 'far';
    },
};

// Pregenerated constants
export const BANDS = BandUtils.getAllBandsWithFrequencies();
export const BAND_TOGGLES = BandUtils.getBandToggles();
