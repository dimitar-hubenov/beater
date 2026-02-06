// src/references/referenceStore.ts

import type {
    PotaReferenceItem,
    SotaReferenceItem,
    PotaReferenceFile,
    SotaReferenceFile,
} from './types'
import type { SpotSource } from '../types/spotSource'
import type { Spot } from '../types/spot'
import { publicUrl } from '../utils/url';

/**
 * Internal caches (lazy-loaded)
 */
let potaMap: Map<string, PotaReferenceItem> | null = null
let sotaMap: Map<string, SotaReferenceItem> | null = null

let potaLoading: Promise<void> | null = null
let sotaLoading: Promise<void> | null = null

/**
 * Load POTA reference data (lazy, cached)
 */
async function loadPotaMap(): Promise<void> {
    if (potaMap) return
    if (potaLoading) return potaLoading

    potaLoading = (async () => {
        const response = await fetch(publicUrl('/data/pota-references.json'))
        if (!response.ok) {
            throw new Error('Failed to load POTA reference data')
        }

        const json = (await response.json()) as PotaReferenceFile

        const map = new Map<string, PotaReferenceItem>()
        for (const item of json.items) {
            map.set(item.reference, {
                ...item,
                program: 'POTA',
            })
        }

        potaMap = map
    })()

    return potaLoading
}

/**
 * Load SOTA reference data (lazy, cached)
 */
async function loadSotaMap(): Promise<void> {
    if (sotaMap) return
    if (sotaLoading) return sotaLoading

    sotaLoading = (async () => {
        const response = await fetch(publicUrl('/data/sota-references.json'))
        if (!response.ok) {
            throw new Error('Failed to load SOTA reference data')
        }

        const json = (await response.json()) as SotaReferenceFile

        const map = new Map<string, SotaReferenceItem>()
        for (const item of json.items) {
            map.set(item.reference, {
                ...item,
                program: 'SOTA',
            })
        }

        sotaMap = map
    })()

    return sotaLoading
}

/**
 * Resolve coordinates by program + reference
 *
 * Returns null if:
 * - reference file not loaded
 * - reference not found
 */
export async function resolveReferenceCoordinates(
    source: SpotSource,
    reference: string,
    spot?: Pick<Spot, 'latitude' | 'longitude'>
): Promise<{ latitude: number; longitude: number } | null> {
    
    // Spot coords are always the most trustworthy
    if (
        spot?.latitude != null &&
        spot?.longitude != null
    ) {
        return {
            latitude: spot.latitude,
            longitude: spot.longitude,
        };
    }

    if (!reference) {
        return null;
    }

    switch (source) {
        case 'POTA': {
            if (!potaMap) {
                await loadPotaMap();
            }

            return potaMap?.get(reference) ?? null;
        }

        case 'SOTA': {
            if (!sotaMap) {
                await loadSotaMap();
            }

            return sotaMap?.get(reference) ?? null;
        }

        default:
            return null;
    }
}

/**
 * Optional helpers (future-safe)
 */

export async function hasReference(
    source: SpotSource,
    reference: string
): Promise<boolean> {
    if (!reference) {
        return false;
    }

    switch (source) {
        case 'POTA': {
            if (!potaMap) {
                await loadPotaMap();
            }

            return potaMap?.has(reference) ?? false;
        }

        case 'SOTA': {
            if (!sotaMap) {
                await loadSotaMap();
            }

            return sotaMap?.has(reference) ?? false;
        }

        default:
            return false;
    }
}

export async function getReferenceItem(
    source: SpotSource,
    reference: string
): Promise<PotaReferenceItem | SotaReferenceItem | null> {
    if (!reference) {
        return null;
    }

    switch (source) {
        case 'POTA': {
            if (!potaMap) {
                await loadPotaMap();
            }

            return potaMap?.get(reference) ?? null;
        }

        case 'SOTA': {
            if (!sotaMap) {
                await loadSotaMap();
            }

            return sotaMap?.get(reference) ?? null;
        }

        default:
            return null;
    }
}
