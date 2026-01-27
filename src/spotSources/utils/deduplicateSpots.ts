// src/spotSources/utils/deduplicateSpots.ts
import { Spot } from "../../types/spot";

/**
 * Shared utility to filter duplicate spots (activator+reference)
 * @param spots Array of spots to check
 * @returns Array with duplicates filtered
 */
export function deduplicateSpots(spots: Spot[]): Spot[] {
    const map = new Map<string, Spot>();

    for (const spot of spots) {
        const key = getSpotKey(spot);
        const existing = map.get(key);

        if (!existing) {
            map.set(key, spot);
        } else {
            const existingTime = Date.parse(existing.time);
            const currentTime = Date.parse(spot.time);

            if (currentTime > existingTime) {
                map.set(key, spot);
            }
        }
    }

    return [...map.values()];
}

/**
 * Helper to create a unique key for activator+reference
 * @param spot The raw spot object
 * @returns String key with the Activator and the Reference baing activated
 */
export function getSpotKey(spot: Spot): string {
    return `${spot.activator.trim().toLowerCase()}|${spot.reference.trim().toLowerCase()}`;
}