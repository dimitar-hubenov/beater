// src/utils/time.ts

/**
 * Parse UTC date string to Date
 * @param value ISO UTC date string
 * @return Date | null
 */
function parseUTC(value: string): Date | null {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
}

/**
 * Returns age in minutes.
 * @param isoUtc ISO UTC date string
 * @return number Minutes. Invalid/missing dates → Infinity
 */
export function getUTCAgeMinutes(isoUtc: string): number {
    const t = Date.parse(isoUtc);
    if (Number.isNaN(t)) return Number.POSITIVE_INFINITY;

    const now = Date.now(); // UTC timestamp
    return Math.floor((now - t) / 60000);
}

/**
 * Format age like "5m ago", "2h ago", or date for older spots.
 * @param isoUtc ISO UTC date string
 * @return string Formatted age or "—" if invalid
 */
export function formatTimeAge(isoUtc: string): string {
    const date = parseUTC(isoUtc);
    if (!date) return '—';

    const ageMinutes = getUTCAgeMinutes(isoUtc);
    if (ageMinutes < 1) return '<1m';
    if (ageMinutes < 60) return `${Math.floor(ageMinutes)}m`;
    if (ageMinutes < 1440) return `${Math.floor(ageMinutes / 60)}h`;
    return `${Math.floor(ageMinutes / 1440)}d`;
}

/**
 * Format UTC time to local HH:mm
 * @param isoUtc ISO UTC date string
 * @return string Formatted time or "—" if invalid
 */
export function formatLocalTime(isoUtc: string): string {
    const date = parseUTC(isoUtc);
    if (!date) return '—';

    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    });
}

export function formatMinutes(
    minutes: number,
    options: {
        showHoursIfZero?: boolean;
        padMinutes?: boolean;
    } = {}
): string {
    const { showHoursIfZero = false, padMinutes = false } = options;

    // Handle -0 and very small negative values
    if (Object.is(minutes, -0) || (Math.abs(minutes) < 1 && minutes < 0)) {
        minutes = 0;
    }

    const isNegative = minutes < 0;
    const absMinutes = Math.abs(minutes);
    const h = Math.floor(absMinutes / 60);
    const m = Math.floor(absMinutes % 60);

    const sign = isNegative ? '-' : '';

    if (h > 0 || showHoursIfZero) {
        return `${sign}${h}:${m.toString().padStart(2, '0')}`;
    } else {
        return padMinutes ? `${sign}${m.toString().padStart(2, '0')}` : `${sign}${m.toString()}`;
    }
}

export function formatSeconds(
    seconds: number,
    options: {
        showMinutesIfZero?: boolean;
        padSeconds?: boolean;
    } = {}
): string {
    const { showMinutesIfZero = false, padSeconds = false } = options;

    // Handle -0 and very small negative values
    if (Object.is(seconds, -0) || (Math.abs(seconds) < 1 && seconds < 0)) {
        seconds = 0;
    }

    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const m = Math.floor(absSeconds / 60);
    const s = Math.floor(absSeconds % 60);

    const sign = isNegative ? '-' : '';

    if (m > 0 || showMinutesIfZero) {
        return `${sign}${m}:${s.toString().padStart(2, '0')}`;
    } else {
        return padSeconds ? `${sign}${s.toString().padStart(2, '0')}` : `${sign}${s.toString()}`;
    }
}
