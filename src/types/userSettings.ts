import { SpotSource } from "./spotSource";
import type { Language } from "./language";

export type DistanceUnit = 'km' | 'mi';
export type Theme = 'dark' | 'light' | 'system';
// export type Language = 'en' | 'bg';

export type UserSettings = {
    enabledPrograms: SpotSource[];
    programRefreshInterval: number; // in seconds

    qthGrid: string | null;
    qthLat: number | null;
    qthLon: number | null;

    distanceUnit: DistanceUnit;
    alwaysShowSpotsWithoutDistance: boolean;

    theme: Theme;
    language: Language;
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
    enabledPrograms: ['POTA'],
    programRefreshInterval: 60, // 1 minute

    qthGrid: null,
    qthLat: null,
    qthLon: null,

    distanceUnit: 'km',
    alwaysShowSpotsWithoutDistance: true,

    theme: 'system',
    language: 'en',
};