// src/spotSources/sourceWwff.ts
import type { SpotSourceProvider } from './types';
import { Spot } from '../types/spot';
import { parseNumber, parseNonEmptyString } from '../utils/parsers';
import { ModeUtils } from '../types/mode';
import { BandUtils } from '../types/band';
import { isValidLatitude, isValidLongitude } from '../utils/distance';
import { deduplicateSpots } from './utils/deduplicateSpots';

const WWFF_ENDPOINT = 'https://spots.wwff.co/static/spots.json';

/**
 * WWFF (World Wide Flora & Fauna) API object type
 */
export type WwffRawSpot = {
    id: number;                    // 64667
    activator: string;             // "WB0RLJ"
    frequency_khz: number;         // 14032.5
    mode: string;                  // "CW"
    reference: string;             // "KFF-4011"
    reference_name: string;        // "Chalco Hills"
    remarks: string;               // "Re-spotted via RBN"
    spotter: string;               // "W3OA"
    latitude: number;              // 41.1709
    longitude: number;             // -96.1556
    spot_time: number;             // Unix timestamp: 1769038879
    spot_time_formatted: string;   // "2026-01-21 23:41:19"
};

/**
 * Sanity checks for WWFF spots
 */
export function isUsableWwffSpot(raw: WwffRawSpot): boolean {
    if (!raw) return false;

    // Activator
    if (!parseNonEmptyString(raw.activator)) return false;

    // Reference
    if (!parseNonEmptyString(raw.reference)) return false;

    // Frequency
    if (!raw.frequency_khz || raw.frequency_khz <= 0) return false;

    // Time
    let isSpotTimeInvalid = (!raw.spot_time || raw.spot_time <= 0);

    let isSpotTimeFormattedInfalid = (!parseNonEmptyString(raw.spot_time_formatted));
    if (!isSpotTimeFormattedInfalid) {
        let isoTime = raw.spot_time_formatted.replace(' ', 'T');
        isoTime = isoTime.endsWith('Z') ? isoTime : isoTime + 'Z';
        isSpotTimeFormattedInfalid = (Number.isNaN(Date.parse(isoTime)));
    }
    // WWFF has 2 time fields - at least one of them must be valid
    if (isSpotTimeInvalid && isSpotTimeFormattedInfalid) return false;
    
    // Ignore QRT spots
    if (raw.remarks?.toLowerCase().includes('qrt')) {
        return false;
    }

    return true;
}

/**
 * Convert WWFF API spot → internal Spot model
 */
export function normalizeWwffSpot(rawSpot: WwffRawSpot): Spot {
    const spot: Spot = {
        id: `wwff-${rawSpot.id}`,
        program: 'WWFF',

        activator: rawSpot.activator.trim(),

        reference: rawSpot.reference.trim(),
        latitude: isValidLatitude(rawSpot.latitude) ? rawSpot.latitude : undefined,
        longitude: isValidLongitude(rawSpot.longitude) ? rawSpot.longitude : undefined,

        frequency: rawSpot.frequency_khz,
        band: BandUtils.detectFromFrequency(rawSpot.frequency_khz),
        mode: ModeUtils.parse(rawSpot.mode),

        time: normalizeWwffTime(rawSpot.spot_time, rawSpot.spot_time_formatted),

        spotter: rawSpot.spotter || '',
        comments: rawSpot.remarks || '',

        raw: rawSpot,
    };

    return spot;
}

/**
 * Normalize WWFF time to ISO 8601 format with Z
 * WWFF provides both Unix timestamp and formatted string
 */
function normalizeWwffTime(unixTimestamp: number, formattedTime: string): string {
    // First try to use Unix timestamp
    if (unixTimestamp && unixTimestamp > 0) {
        const date = new Date(unixTimestamp * 1000); // Convert seconds to milliseconds
        return date.toISOString().slice(0, -5) + "Z"; // remove the milliseconds
    }

    // If timestamp is invalid, try to parse the formatted string
    if (formattedTime) {
        // The format is "2026-01-21 23:41:19" - need to replace space with 'T' and add 'Z'
        let isoTime = formattedTime.replace(' ', 'T');
        isoTime = isoTime.endsWith('Z') ? isoTime : isoTime + 'Z';

        // Validate date
        const date = new Date(isoTime);
        if (!isNaN(date.getTime())) {
            return isoTime;
        }
    }

    // If nothing works, return empty string
    return "";
}

export const WwffProgram: SpotSourceProvider = {
    program: 'WWFF',

    async fetchSpots(): Promise<Spot[]> {
        const response = await fetch(WWFF_ENDPOINT);

        if (!response.ok) {
            throw new Error(`WWFF API error: ${response.status}`);
        }

        const data: WwffRawSpot[] = await response.json();

        const normalizedSpots = data
            .filter(isUsableWwffSpot)
            .map(normalizeWwffSpot);

        // Keep only the latest spot for each activator+reference combination
        return deduplicateSpots(normalizedSpots);
    }
};






