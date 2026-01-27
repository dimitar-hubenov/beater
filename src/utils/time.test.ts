import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    getUTCAgeMinutes,
    formatTimeAge,
    formatLocalTime,
    formatSeconds
} from './time';

describe('Age and Time Utils', () => {

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('calculates age in minutes', () => {
        const iso = '2025-06-15T11:30:00Z';
        expect(getUTCAgeMinutes(iso)).toBe(30);
    });

    it('handle invalid/missing dates', () => {
        expect(getUTCAgeMinutes('')).toBe(Infinity);
        expect(getUTCAgeMinutes('2025-15-55T12:00:00Z')).toBe(Infinity);
    });

    it('returns <1m for very recent time', () => {
        expect(formatTimeAge('2025-06-15T11:59:30Z')).toBe('<1m');
    });

    it('returns correct age on the edge of 1m', () => {
        expect(formatTimeAge('2025-06-15T11:59:01Z')).toBe('<1m');
        expect(formatTimeAge('2025-06-15T11:59:00Z')).toBe('1m');
    });

    it('returns correct age on the edge of 1m', () => {
        expect(formatTimeAge('2025-06-15T11:15:00Z')).toBe('45m');
        expect(formatTimeAge('2025-06-15T11:30:00Z')).toBe('30m');
        expect(formatTimeAge('2025-06-15T11:45:00Z')).toBe('15m');
    });

    it('returns correct age on the edge of 1h', () => {
        expect(formatTimeAge('2025-06-15T11:00:01Z')).toBe('59m');
        expect(formatTimeAge('2025-06-15T11:00:00Z')).toBe('1h');
    });

    it('formats hours', () => {
        const iso = '2025-06-15T08:00:00Z';
        expect(formatTimeAge(iso)).toBe('4h');
    });

    it('returns correct age on the edge of 24h', () => {
        expect(formatTimeAge('2025-06-14T12:00:01Z')).toBe('23h');
        expect(formatTimeAge('2025-06-14T12:00:00Z')).toBe('1d');
    });

    it('returns dash for invalid date', () => {
        expect(formatTimeAge('invalid')).toBe('—');
    });

    it('formats local time', () => {
        const iso = '2025-06-15T10:15:00Z';
        const result = formatLocalTime(iso);
        expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('formats local time with invalid date', () => {
        const iso = '2025-13-55T10:15:00Z';
        const result = formatLocalTime(iso);
        expect(result).toBe("—");
    });

    it('formats seconds mm:ss', () => {
        expect(formatSeconds(65)).toBe('1:05');
    });

});