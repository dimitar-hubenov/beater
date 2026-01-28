// src/spotSources/sourcePota.ts
import type { SpotSourceProvider } from './types';
import { Spot } from '../types/spot';
import { parseNumber, parseNonEmptyString } from '../utils/parsers';
import { ModeUtils } from '../types/mode';
import { BandUtils } from '../types/band';
import { isValidLatitude, isValidLongitude } from '../utils/distance';
import { deduplicateSpots } from './utils/deduplicateSpots';

const POTA_ENDPOINT = 'https://api.pota.app/spot/activator';

/**
 * Parks on the Air (POTA) API object type
 */
export type PotaRawSpot = {
    spotId: number;             // 46487733
    activator: string;          // "K7ATN/P"
    frequency: string;          // "21431"
    mode?: string;              // "SSB"
    reference: string;          // "US-0177"
    //"parkName" is always null. Seems kept for backward compatibility
    spotTime: string;           // UTC, without trailing Z "2026-01-17T18:56:52"
    spotter: string;            // "KK7PZE"
    comments: string;           // comment from spotter or signal strength info from RBN
    source: string;             // where is spot originated from "Web", "RBN", "PSK Reporter", etc.
    invalid: string | null;     // always null for valid spots TBD: track when it's defined!
    name: string;               // park name
    locationDesc: string;       // park location description "US-AZ". Be aware some parks have more than one locationDesc options
    grid4: string;              // Maidenhead grid locator 4-char "DM23"
    grid6: string;              // Maidenhead grid locator 6-char "DM23wm"
    latitude?: number;          //   33.5351
    longitude?: number;         // -114.164
    count: number;              // number of times this activator has been spotted recently
    expire: number;             // seconds until this spot expires
};

/**
 * Sanity checks
 */
export function isUsablePotaSpot(raw: PotaRawSpot): boolean {
    if (!raw) return false;

    // Activator
    if (!parseNonEmptyString(raw.activator)) return false;

    // Reference
    if (!parseNonEmptyString(raw.reference)) return false;

    // Frequency
    const freq = parseNumber(raw.frequency);
    if (!freq || freq <= 0) return false;

    // Time
    if (!parseNonEmptyString(raw.spotTime)) return false;
    const iso = raw.spotTime.endsWith('Z') ? raw.spotTime : raw.spotTime + 'Z';
    if (Number.isNaN(Date.parse(iso))) return false;

    // ignore QRT spots
    if (raw.comments?.toLowerCase().includes('qrt')) {
        return false;
    }

    return true;
}

/**
 * Convert POTA API spot → internal Spot model
 */
export function normalizePotaSpot(rawSpot: PotaRawSpot): Spot {
    const rawFrequency = Number(rawSpot.frequency);

    return {
        id: String(rawSpot.spotId),
        program: 'POTA',

        activator: rawSpot.activator.trim(),

        reference: rawSpot.reference.trim(),
        latitude: isValidLatitude(rawSpot.latitude) ? rawSpot.latitude : undefined,
        longitude: isValidLongitude(rawSpot.longitude) ? rawSpot.longitude : undefined,

        frequency: rawFrequency,
        band: BandUtils.detectFromFrequency(rawFrequency),
        mode: ModeUtils.parse(rawSpot.mode),

        time: normalizePotaTime(rawSpot.spotTime),

        spotter: normalizePotaSpotter(rawSpot.source, rawSpot.spotter),
        comments: normalizePotaComments(rawSpot.source, rawSpot.comments),

        raw: rawSpot, // remove in production
    };
}


function normalizePotaTime(value: string): string {
    return value.endsWith('Z') ? value : value + 'Z';
}

function normalizePotaSpotter(source ?: string | null, spotter ?: string | null): string {
    if (!spotter) return '';
    return source === 'RBN'
        ? stripRbnSuffix(spotter)
        : spotter;
}

function normalizePotaComments(source ?: string | null, comment ?: string | null): string {
    if (!comment) return '';
    return source === 'RBN'
        ? stripRbnSuffix(comment)
        : comment;
}

function stripRbnSuffix(value: string): string {
    return value.replace(/-#$/, '');
}

export const PotaProgram: SpotSourceProvider = {
    program: 'POTA',

    async fetchSpots(): Promise<Spot[]> {
        const response = await fetch(POTA_ENDPOINT);

        if (!response.ok) {
            throw new Error(`POTA API error: ${response.status}`);
        }

        const data: PotaRawSpot[] = await response.json();

        const normalizedSpots = data
            .filter(isUsablePotaSpot)
            .map(normalizePotaSpot);

        // Keep only the latest spot for each activator+reference combination
        return deduplicateSpots(normalizedSpots);
    }
};