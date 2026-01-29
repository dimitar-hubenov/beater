// src/types/spotSource.ts

export type SourceRefreshRange = {
    min: number;
    max: number;
};

export type SourceInfo = {
    label: string;
    refreshRange: SourceRefreshRange;
    available: boolean;
};

const SOURCE_INFO = {
    POTA: {
        label: "POTA",
        refreshRange: { min: 60, max: 300 },
        available: true
    },
    SOTA: {
        label: "SOTA",
        refreshRange: { min: 60, max: 300 },
        available: true
    },
    WWFF: {
        label: "WWFF",
        refreshRange: { min: 60, max: 300 },
        available: true
    }
} as const satisfies Record<string, SourceInfo>;

export type SpotSource = keyof typeof SOURCE_INFO;

function isSpotSource(source: string): source is SpotSource {
    return source in SOURCE_INFO;
}

export const SourceUtils = {

    getSourcesArray(): Array<{
        source: SpotSource;
        label: string;
        rateMin: number;
        rateMax: number;
        available: boolean;
    }> {
        return (Object.entries(SOURCE_INFO) as [SpotSource, typeof SOURCE_INFO[SpotSource]][])
            .map(([source, info]) => ({
                source,
                label: info.label,
                rateMin: info.refreshRange.min,
                rateMax: info.refreshRange.max,
                available: info.available
            }));
    },

    getAllSources(): SpotSource[] {
        return Object.keys(SOURCE_INFO) as SpotSource[];
    },

    getAvailableSources(): SpotSource[] {
        return (Object.entries(SOURCE_INFO) as [SpotSource, typeof SOURCE_INFO[SpotSource]][])
            .filter(([, info]) => info.available)
            .map(([source]) => source);
    },


    isAvailable(source: SpotSource): boolean | undefined {
        if (!isSpotSource(source)) { return undefined; }
        return SOURCE_INFO[source].available;
    },

    getRateLimits(source: SpotSource): SourceRefreshRange | unknown {
        if (!isSpotSource(source)) { return undefined; }
        return SOURCE_INFO[source].refreshRange;
    },

    getMinRate(source: SpotSource): number| undefined {
        if (!isSpotSource(source)) { return undefined; }
        return SOURCE_INFO[source].refreshRange.min;
    },

    getMaxRate(source: SpotSource): number| undefined {
        if (!isSpotSource(source)) { return undefined; }
        return SOURCE_INFO[source].refreshRange.max;
    },

    getSourceInfo(source: SpotSource): SourceInfo | undefined {
        if (!isSpotSource(source)) { return undefined; }
        return SOURCE_INFO[source];
    },

    getLabel(source: SpotSource): string | undefined {
        if (!isSpotSource(source)) { return undefined; }
        return SOURCE_INFO[source].label;
    },

    isValidRate(rate: number, source: SpotSource): boolean | undefined {
        if (!isSpotSource(source)) { return undefined; }
        const info = SOURCE_INFO[source];
        return rate >= info.refreshRange.min && rate <= info.refreshRange.max;
    }
};
