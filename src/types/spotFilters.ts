// src/types/spotFilters.ts
import type { Mode } from "./mode";
import type { Band } from "./band";

export type SpotFilters = {
    activator: string;
    reference: string;

    bands: Band[];
    modes: Mode[];

    maxAgeMinutes: number | null;
    maxDistanceKm: number | null; 
};

export const DEFAULT_FILTERS: SpotFilters = {
    activator: '',
    reference: '',

    bands: [] as Band[],
    modes: [] as Mode[],

    maxAgeMinutes: null,
    maxDistanceKm: null,
};
