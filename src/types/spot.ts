// src/types/spot.ts
import type { SpotSource } from "./spotSource";
import type { Mode } from "./mode";
import type { Band } from "./band";

export type Spot = {
    id: string;
    program: SpotSource;
    
    activator: string;
    
    reference: string;
    latitude?: number;
    longitude?: number;
    
    frequency: number; // kHz
    band: Band;
    mode: Mode;

    time: string; // ISO UTC 2026-01-16T23:50:49Z

    spotter?: string;
    comments?: string;

    raw?: unknown; // original API object
};

export type SpotUI = Spot & {
    distanceKm?: number;
};
