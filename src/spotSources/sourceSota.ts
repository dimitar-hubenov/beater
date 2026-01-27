// src/spotSources/sourceSota.ts
import type { SpotSourceProvider } from './types';
import { Spot } from '../types/spot';
import { parseNumber, parseNonEmptyString } from '../utils/parsers';
import { ModeUtils } from '../types/mode';
import { BandUtils } from '../types/band';
import { deduplicateSpots } from './utils/deduplicateSpots';

const SOTA_ENDPOINT = 'https://api2.sota.org.uk/api/spots/30/all%7Call';

// https://api-db.sota.org.uk/admin/activator_roll?associationID=XX // Activators by association
// https://api-db.sota.org.uk/admin/activator_log_by_id?year=all&id=XXXX // Activator logs
// https://www.sotadata.org.uk/summitslist.csv // List of summits

/**
 * SOTA (Summits on the Air) API object type
 */
export type SotaRawSpot = {
    id: number;
    userID: number;
    timeStamp: string;           // "2026-01-21T19:38:02"
    comments: string | null;
    callsign: string;            // Spotter callsign
    associationCode: string;     // e.g., "W5N", "W7A"
    summitCode: string;          // e.g., "SI-001", "AE-014"
    activatorCallsign: string;   // Activator callsign (may include /P)
    activatorName: string;       // Activator name
    frequency: string;           // Frequency in MHz as string "14.0611"
    mode: string;                // e.g., "CW", "SSB", "FT8"
    summitDetails: string;       // e.g., "Sandia Crest, 3255m, 10 points"
    highlightColor: string | null;
};

/**
 * Sanity checks
 */
export function isUsableSotaSpot(raw: SotaRawSpot): boolean {
    if (!raw) return false;

    // Activator callsign is required
    if (!parseNonEmptyString(raw.activatorCallsign)) return false;

    // Both assosiation code and summit code are needed to form Summit Reference
    // Association code
    if (!parseNonEmptyString(raw.associationCode)) return false;

    // Summit code is required
    if (!parseNonEmptyString(raw.summitCode)) return false;

    // Frequency must be valid
    const freqMhz = parseNumber(raw.frequency);
    if (!freqMhz || freqMhz <= 0) return false;

    // Time
    if (!parseNonEmptyString(raw.timeStamp)) return false;
    const iso = raw.timeStamp.endsWith('Z') ? raw.timeStamp : raw.timeStamp + 'Z';
    if (Number.isNaN(Date.parse(iso))) return false;

    // Ignore QRT spots (if mentioned in comments)
    if (raw.comments?.toLowerCase().includes('qrt')) {
        return false;
    }

    return true;
}

/**
 * Convert SOTA API spot → internal Spot model
 */
export function normalizeSotaSpot(rawSpot: SotaRawSpot): Spot {
    const freqKhz = (Number(rawSpot.frequency)*1000); // the input is in MHz

    const spot: Spot = {
        id: `sota-${rawSpot.id}`,
        program: 'SOTA',

        activator: rawSpot.activatorCallsign.trim(),

        // Use standardized summit reference
        reference: buildSummitReference(rawSpot.associationCode, rawSpot.summitCode),

        // SOTA API doesn't provide lat/long in spots, but we will look it up later
        latitude: undefined,
        longitude: undefined,

        frequency: freqKhz,
        band: BandUtils.detectFromFrequency(freqKhz),
        mode: ModeUtils.parse(rawSpot.mode),

        time: normalizeSotaTime(rawSpot.timeStamp),

        spotter: rawSpot.callsign || '',
        comments: rawSpot.comments || '',

        // Store additional SOTA-specific info in raw
        raw: rawSpot,
    };

    return spot;
}

/**
 * Extract summit reference in standardized format
 * Format: [AssociationCode]/[SummitCode] e.g., "W5N/SI-001"
 */
function buildSummitReference(associationCode: string, summitCode: string): string {
    return `${associationCode}/${summitCode}`;
}

/**
 * Normalize SOTA time to ISO format with Z
 */
function normalizeSotaTime(value: string): string {
    return value.endsWith('Z') ? value : value + 'Z';
}

export const SotaProgram: SpotSourceProvider = {
    program: 'SOTA',

    async fetchSpots(): Promise<Spot[]> {
        const response = await fetch(SOTA_ENDPOINT);

        if (!response.ok) {
            throw new Error(`SOTA API error: ${response.status}`);
        }

        const data: SotaRawSpot[] = await response.json();

        const normalizedSpots = data
            .filter(isUsableSotaSpot)
            .map(normalizeSotaSpot);

        // Keep only the latest spot for each activator+reference combination
        return deduplicateSpots(normalizedSpots);
    }
};




