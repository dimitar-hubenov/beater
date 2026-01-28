// Дефинирай обекта за SpotSource информация
const SOURCE_INFO = {
    POTA: {
        rateMin: 60,      // Min refresh interval in seconds
        rateMax: 300,     // Max refresh interval in seconds
        available: true 
    },
    SOTA: {
        rateMin: 60,
        rateMax: 300,
        available: false  // not implemented yet
    },
    WWFF: {
        rateMin: 60,
        rateMax: 300,
        available: false  // not implemented yet
    }
} as const;

export type SpotSource = keyof typeof SOURCE_INFO;

export const SourceUtils = {

    parse(rawSource: string | null | undefined): SpotSource | null {
        if (rawSource == null || rawSource.trim() === '') {
            return null;
        }

        const normalized = rawSource.trim().toUpperCase();
        const sourceKey = Object.keys(SOURCE_INFO).find(
            key => key.toUpperCase() === normalized
        ) as SpotSource | undefined;

        return sourceKey || null;
    },

    isAvailable(source: SpotSource): boolean {
        return SOURCE_INFO[source].available;
    },

    getRateLimits(source: SpotSource): { rateMin: number; rateMax: number } {
        const info = SOURCE_INFO[source];
        return {
            rateMin: info.rateMin,
            rateMax: info.rateMax
        };
    },

    getMinRate(source: SpotSource): number {
        return SOURCE_INFO[source].rateMin;
    },

    getMaxRate(source: SpotSource): number {
        return SOURCE_INFO[source].rateMax;
    },

    getAvailableSources(): SpotSource[] {
        return (Object.entries(SOURCE_INFO) as [SpotSource, typeof SOURCE_INFO[SpotSource]][])
            .filter(([, info]) => info.available)
            .map(([source]) => source);
    },

    getAllSources(): SpotSource[] {
        return Object.keys(SOURCE_INFO) as SpotSource[];
    },

    getSourceInfo(source: SpotSource): typeof SOURCE_INFO[SpotSource] {
        return SOURCE_INFO[source];
    },

    getSourcesArray(): Array<{
        source: SpotSource;
        rateMin: number;
        rateMax: number;
        available: boolean;
    }> {
        return (Object.entries(SOURCE_INFO) as [SpotSource, typeof SOURCE_INFO[SpotSource]][])
            .map(([source, info]) => ({
                source,
                rateMin: info.rateMin,
                rateMax: info.rateMax,
                available: info.available
            }));
    },

    isValidRate(rate: number, source: SpotSource): boolean {
        const info = SOURCE_INFO[source];
        return rate >= info.rateMin && rate <= info.rateMax;
    }
};
