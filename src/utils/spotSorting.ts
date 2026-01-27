// src/utils/spotSorting.ts
import { SpotUI } from '../types/spot';

export type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
};

// Default ("natural") sort direction per column
export const COLUMN_DEFAULTS = {
    activator: 'asc' as const,    // A-Z
    program: 'asc' as const,      // A-Z
    reference: 'asc' as const,    // A-Z
    frequency: 'asc' as const,    // Low to high
    mode: 'asc' as const,         // A-Z
    distance: 'asc' as const,     // Nearest first
    time: 'desc' as const,        // Newest first
};

export type ColumnKey = keyof typeof COLUMN_DEFAULTS;

export function getInitialSortConfig(): SortConfig {
    return {
        key: 'time',
        direction: COLUMN_DEFAULTS.time
    };
}

export function getNextSortDirection(
    currentKey: string,
    nextKey: string,
    currentDirection: 'asc' | 'desc'
): 'asc' | 'desc' {
    if (currentKey === nextKey) {
        // Toggle direction when clicking the same column
        return currentDirection === 'asc' ? 'desc' : 'asc';
    } else {
        // Use column natural direction on first click
        return COLUMN_DEFAULTS[nextKey as ColumnKey] || 'asc';
    }
}

export function sortSpots(spots: SpotUI[], sortConfig: SortConfig): SpotUI[] {
    const sorted = [...spots];

    sorted.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortConfig.key) {
            case 'activator':
                aValue = a.activator?.toLowerCase() || '';
                bValue = b.activator?.toLowerCase() || '';
                break;

            case 'program':
                aValue = a.program;
                bValue = b.program;
                break;

            case 'reference':
                aValue = a.reference?.toLowerCase() || '';
                bValue = b.reference?.toLowerCase() || '';
                break;

            case 'frequency':
                aValue = a.frequency || 0;
                bValue = b.frequency || 0;
                break;

            case 'mode':
                aValue = a.mode;
                bValue = b.mode;
                break;

            case 'distance':
                // Undefined values go to the bottom
                aValue = a.distanceKm ?? Infinity;
                bValue = b.distanceKm ?? Infinity;
                break;

            case 'time':
                aValue = new Date(a.time).getTime();
                bValue = new Date(b.time).getTime();
                break;

            case 'spotter':
                aValue = a.spotter?.toLowerCase() || '';
                bValue = b.spotter?.toLowerCase() || '';
                break;

            default:
                return 0;
        }

        // Primary comparison
        if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }

        // Secondary sort: always by time (newest first)
        return new Date(b.time).getTime() - new Date(a.time).getTime();
    });

    return sorted;
}
