// src/hooks/useSpotFilters.ts

import { act, useEffect, useMemo, useState } from 'react';
import type { Spot, SpotUI } from '../types/spot';
import { getUTCAgeMinutes } from '../utils/time';
import { calculateDistance } from '../utils/distance';
import type { Mode, ModeToggle } from '../types/mode';
import { ModeUtils } from '../types/mode';
import type { Band, BandToggle } from '../types/band';
import { BandUtils } from '../types/band';
import type { SpotFilters } from '../types/spotFilters';
import { DEFAULT_FILTERS } from '../types/spotFilters';

const STORAGE_KEY = 'pota.spotFilters.v1';

type SpotFiltersContext = {
    qthLat?: number;
    qthLon?: number;
    alwaysShowSpotsWithoutDistance?: boolean; // determine distance filter behavior
};

function loadFilters(): SpotFilters {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_FILTERS;

        const parsed = JSON.parse(raw);
        return { ...DEFAULT_FILTERS, ...parsed };
    } catch {
        return DEFAULT_FILTERS;
    }
}

export function useSpotFilters(
    spots: Spot[],
    context: SpotFiltersContext
) {
    const [filters, setFilters] = useState<SpotFilters>(loadFilters);

    /* ---------------------------------------------
     * Persist filters
     * ------------------------------------------- */
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    }, [filters]);

    /* ---------------------------------------------
     * Filtering logic
     * ------------------------------------------- */
    const filteredSpots = useMemo<SpotUI[]>(() => {
        // Start with all spots, adding distance if possible
        let result: SpotUI[] = spots.map(spot => ({
            ...spot,
            distanceKm:
                context.qthLat != null && context.qthLon != null && // user location is known
                    spot.latitude != null && spot.longitude != null // spot location is known
                    ? calculateDistance(
                        context.qthLat,
                        context.qthLon,
                        spot.latitude,
                        spot.longitude
                    )
                    : undefined,
        }));

        // Activator
        if (filters.activator) {
            result = result.filter(spot =>
                matchPattern(spot.activator, filters.activator)
            );
        }

        // Reference
        if (filters.reference) {
            result = result.filter(spot =>
                matchPattern(spot.reference, filters.reference)
            );
        }

        // Bands
        if (filters.bands.length > 0) {
            result = result.filter(spot =>
                filters.bands.includes(spot.band)
            );
        }

        // Modes
        if (filters.modes.length > 0) {
            result = result.filter(spot =>
                filters.modes.includes(spot.mode)
            );
        }

        // Age
        const maxAge = filters.maxAgeMinutes;
        if (maxAge != null) {
            result = result.filter(
                spot =>
                    getUTCAgeMinutes(spot.time) <= maxAge
            );
        }

        // Distance
        const maxDistance = filters.maxDistanceKm;
        if (maxDistance != null) {  
            result = result.filter(spot => {
                const alwaysShow = context.alwaysShowSpotsWithoutDistance ?? false;
                const d = spot.distanceKm;
                if (d == null) {
                    return alwaysShow; // we can't determine distance, include or exclude based on setting
                }
                return d <= maxDistance;
            });
        }

        return result;
    }, [spots, filters, context]);

    /* ---------------------------------------------
     * Actions
     * ------------------------------------------- */
    const actions: SpotFilterActions = {
        setActivator(value: string) {
            setFilters(f => ({ ...f, activator: value }));
        },

        setReference(value: string) {
            setFilters(f => ({ ...f, reference: value }));
        },

        toggleBand(toggle: BandToggle) {
            setFilters(f => ({
                ...f,
                bands: toggleBandFilterInternal(toggle, f.bands),
            }));
        },

        toggleMode(toggle: ModeToggle) {
            setFilters(f => ({
                ...f,
                modes: toggleModeFilterInternal(toggle, f.modes),
            }));
        },

        setMaxAge(minutes: number | null) {
            setFilters(f => ({ ...f, maxAgeMinutes: minutes }));
        },

        setMaxDistance(km: number | null) {
            setFilters(f => ({ ...f, maxDistanceKm: km }));
        },

        reset() {
            setFilters(DEFAULT_FILTERS);
        },
    }

    return {
        filters,
        filteredSpots,
        actions,
    };
}

/**
 * Actions that can be performed on SpotFilters
 */
export interface SpotFilterActions {
    setActivator(value: string): void;
    setReference(value: string): void;

    toggleBand(toggle: BandToggle): void;
    toggleMode(toggle: ModeToggle): void;

    setMaxAge(minutes: number | null): void;
    setMaxDistance(km: number | null): void;
    
    reset(): void;
};

const matchPattern = (value: string, patternInput: string): boolean => {
    if (!patternInput) return true;
    if (!value) return false;

    const valueUpper = value.toUpperCase();

    const patterns = patternInput
        .toUpperCase()
        .split(',')
        .map(p => p.trim())
        .filter(Boolean);

    return patterns.some(pattern => {
        if (!pattern.includes('*')) {
            return valueUpper.includes(pattern);
        }

        if (pattern === '*') return true;

        const regexPattern = pattern
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '.*');

        try {
            return new RegExp(regexPattern, 'i').test(value);
        } catch {
            return false;
        }
    });
};

function toggleBandFilterInternal(
    toggle: BandToggle,
    prevBands: Band[]
): Band[] {
    const toggleBands = BandUtils.getBandsForToggle(toggle);

    const allActive = toggleBands.every(b =>
        prevBands.includes(b)
    );

    if (allActive) {
        return prevBands.filter(
            b => !toggleBands.includes(b)
        );
    }

    return Array.from(
        new Set([...prevBands, ...toggleBands])
    );
}

function toggleModeFilterInternal(
    toggle: ModeToggle,
    prevModes: Mode[]
): Mode[] {
    const toggleModes = ModeUtils.getModesForToggle(toggle)

    const allActive = toggleModes.every(m =>
        prevModes.includes(m)
    );

    if (allActive) {
        return prevModes.filter(
            m => !toggleModes.includes(m)
        );
    }

    return Array.from(
        new Set([...prevModes, ...toggleModes])
    );
}