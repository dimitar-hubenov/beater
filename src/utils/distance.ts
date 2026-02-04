// src/utils/distance.ts
import type { DistanceUnit } from '../types/userSettings';

const KM_PER_MI = 1.609344;

// Haversine formula to calculate distance between two coordinates in km
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export function isValidLatitude(value: unknown): boolean {
    if (typeof value !== 'number') return false;
    if (Number.isNaN(value)) return false;
    if (value < -90 || value > 90) return false;

    return true;
}

export function isValidLongitude(value: unknown): boolean {
    if (typeof value !== 'number') return false;
    if (Number.isNaN(value)) return false;
    if (value < -180 || value > 180) return false;

    return true;
}

export function convertDistanceToKm(value: number, unit: DistanceUnit): number {
    return unit === 'mi'
        ? value * KM_PER_MI
        : value;
}

export function convertDistanceFromKm(valueKm: number, unit: DistanceUnit): number {
    return unit === 'mi'
        ? valueKm / KM_PER_MI
        : valueKm;
}

export function getDistanceDisplayUnit(unit?: DistanceUnit): string {
    let displayUnit: string;

    switch (unit) {
        case 'km':
            displayUnit = 'km';
            break;
        case 'mi':
            displayUnit = 'mi';
            break;
        default:
            displayUnit = '';
            break;
    }
    return displayUnit;
}

const MAX_RANGE: Record<DistanceUnit, number> = {
    km: 20000,
    mi: 12500,
};

export function getDistanceMaxRange(unit?: DistanceUnit) {
    return unit ? MAX_RANGE[unit] : 0;
}

export function getDistanceValue(valueKm: number, unit: DistanceUnit): number {
    const display = convertDistanceFromKm(valueKm, unit);
    return Math.round(display);
}

export function formatDistance(valueKm: number | null | undefined, unit: DistanceUnit): string {
    if (valueKm === null || valueKm === undefined) { return '—'; }
    return `${getDistanceValue(valueKm, unit)} ${getDistanceDisplayUnit(unit)}`;
}