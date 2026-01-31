import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    getUTCAgeMinutes,
    formatTimeAge,
    formatLocalTime,
    formatMinutes,
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

});

describe('formatMinutes', () => {
    describe('positive values', () => {
        it('should return only minutes when hours = 0', () => {
            expect(formatMinutes(0)).toBe('0');
            expect(formatMinutes(30)).toBe('30');
            expect(formatMinutes(59)).toBe('59');
        });

        it('should return hours and minutes when hours > 0', () => {
            expect(formatMinutes(60)).toBe('1:00');
            expect(formatMinutes(90)).toBe('1:30');
            expect(formatMinutes(125)).toBe('2:05');
            expect(formatMinutes(1440)).toBe('24:00');
        });

        it('should handle large values', () => {
            expect(formatMinutes(1500)).toBe('25:00');
            expect(formatMinutes(3660)).toBe('61:00');
        });
    });

    describe('negative values', () => {
        it('should return negative minutes when hours = 0', () => {
            expect(formatMinutes(-0)).toBe('0');
            expect(formatMinutes(-30)).toBe('-30');
            expect(formatMinutes(-59)).toBe('-59');
        });

        it('should return negative hours and minutes when hours > 0', () => {
            expect(formatMinutes(-60)).toBe('-1:00');
            expect(formatMinutes(-90)).toBe('-1:30');
            expect(formatMinutes(-125)).toBe('-2:05');
            expect(formatMinutes(-1440)).toBe('-24:00');
        });

        it('should handle large negative values', () => {
            expect(formatMinutes(-1500)).toBe('-25:00');
            expect(formatMinutes(-3660)).toBe('-61:00');
        });
    });

    describe('with showHoursIfZero option', () => {
        it('should show hours even when 0', () => {
            expect(formatMinutes(0, { showHoursIfZero: true })).toBe('0:00');
            expect(formatMinutes(30, { showHoursIfZero: true })).toBe('0:30');
            expect(formatMinutes(59, { showHoursIfZero: true })).toBe('0:59');
        });

        it('should show negative hours even when 0', () => {
            expect(formatMinutes(-0, { showHoursIfZero: true })).toBe('0:00');
            expect(formatMinutes(-30, { showHoursIfZero: true })).toBe('-0:30');
            expect(formatMinutes(-59, { showHoursIfZero: true })).toBe('-0:59');
        });

        it('should still work correctly when hours > 0', () => {
            expect(formatMinutes(60, { showHoursIfZero: true })).toBe('1:00');
            expect(formatMinutes(-60, { showHoursIfZero: true })).toBe('-1:00');
        });
    });

    describe('with padMinutes option', () => {
        it('should pad minutes when showing only minutes', () => {
            expect(formatMinutes(0, { padMinutes: true })).toBe('00');
            expect(formatMinutes(5, { padMinutes: true })).toBe('05');
            expect(formatMinutes(30, { padMinutes: true })).toBe('30');
        });

        it('should pad negative minutes when showing only minutes', () => {
            expect(formatMinutes(-0, { padMinutes: true })).toBe('00');
            expect(formatMinutes(-5, { padMinutes: true })).toBe('-05');
            expect(formatMinutes(-30, { padMinutes: true })).toBe('-30');
        });

        it('should still pad minutes in hour:minute format', () => {
            expect(formatMinutes(60, { padMinutes: true })).toBe('1:00');
            expect(formatMinutes(65, { padMinutes: true })).toBe('1:05');
            expect(formatMinutes(-60, { padMinutes: true })).toBe('-1:00');
        });
    });

    describe('with both options', () => {
        it('should combine showHoursIfZero and padMinutes', () => {
            expect(formatMinutes(0, { showHoursIfZero: true, padMinutes: true })).toBe('0:00');
            expect(formatMinutes(5, { showHoursIfZero: true, padMinutes: true })).toBe('0:05');
            expect(formatMinutes(30, { showHoursIfZero: true, padMinutes: true })).toBe('0:30');
            expect(formatMinutes(-5, { showHoursIfZero: true, padMinutes: true })).toBe('-0:05');
        });

        it('should work correctly with hours > 0', () => {
            expect(formatMinutes(60, { showHoursIfZero: true, padMinutes: true })).toBe('1:00');
            expect(formatMinutes(125, { showHoursIfZero: true, padMinutes: true })).toBe('2:05');
            expect(formatMinutes(-125, { showHoursIfZero: true, padMinutes: true })).toBe('-2:05');
        });
    });

    describe('edge cases', () => {
        it('should handle decimal values by floor division', () => {
            expect(formatMinutes(59.9)).toBe('59');
            expect(formatMinutes(60.5)).toBe('1:00');
            expect(formatMinutes(-59.9)).toBe('-59');
            expect(formatMinutes(-60.5)).toBe('-1:00');
            expect(formatMinutes(-0.5)).toBe('0'); // not -0
        });

        it('should handle maximum safe integer', () => {
            const maxSafe = Number.MAX_SAFE_INTEGER;
            expect(() => formatMinutes(maxSafe)).not.toThrow();
        });
    });
});

describe('formatSeconds', () => {
    describe('positive values', () => {
        it('should return only seconds when minutes = 0', () => {
            expect(formatSeconds(0)).toBe('0');
            expect(formatSeconds(30)).toBe('30');
            expect(formatSeconds(59)).toBe('59');
        });

        it('should return minutes and seconds when minutes > 0', () => {
            expect(formatSeconds(60)).toBe('1:00');
            expect(formatSeconds(90)).toBe('1:30');
            expect(formatSeconds(125)).toBe('2:05');
            expect(formatSeconds(3600)).toBe('60:00');
        });

        it('should handle large values', () => {
            expect(formatSeconds(3661)).toBe('61:01');
            expect(formatSeconds(86400)).toBe('1440:00'); // 24 hours
        });
    });

    describe('negative values', () => {
        it('should return negative seconds when minutes = 0', () => {
            expect(formatSeconds(-0)).toBe('0');
            expect(formatSeconds(-30)).toBe('-30');
            expect(formatSeconds(-59)).toBe('-59');
        });

        it('should return negative minutes and seconds when minutes > 0', () => {
            expect(formatSeconds(-60)).toBe('-1:00');
            expect(formatSeconds(-90)).toBe('-1:30');
            expect(formatSeconds(-125)).toBe('-2:05');
            expect(formatSeconds(-3600)).toBe('-60:00');
        });

        it('should handle large negative values', () => {
            expect(formatSeconds(-3661)).toBe('-61:01');
            expect(formatSeconds(-86400)).toBe('-1440:00');
        });
    });

    describe('with showMinutesIfZero option', () => {
        it('should show minutes even when 0', () => {
            expect(formatSeconds(0, { showMinutesIfZero: true })).toBe('0:00');
            expect(formatSeconds(30, { showMinutesIfZero: true })).toBe('0:30');
            expect(formatSeconds(59, { showMinutesIfZero: true })).toBe('0:59');
        });

        it('should show negative minutes even when 0', () => {
            expect(formatSeconds(-0, { showMinutesIfZero: true })).toBe('0:00');
            expect(formatSeconds(-30, { showMinutesIfZero: true })).toBe('-0:30');
            expect(formatSeconds(-59, { showMinutesIfZero: true })).toBe('-0:59');
        });

        it('should still work correctly when minutes > 0', () => {
            expect(formatSeconds(60, { showMinutesIfZero: true })).toBe('1:00');
            expect(formatSeconds(-60, { showMinutesIfZero: true })).toBe('-1:00');
        });
    });

    describe('with padSeconds option', () => {
        it('should pad seconds when showing only seconds', () => {
            expect(formatSeconds(0, { padSeconds: true })).toBe('00');
            expect(formatSeconds(5, { padSeconds: true })).toBe('05');
            expect(formatSeconds(30, { padSeconds: true })).toBe('30');
        });

        it('should pad negative seconds when showing only seconds', () => {
            expect(formatSeconds(-0, { padSeconds: true })).toBe('00');
            expect(formatSeconds(-5, { padSeconds: true })).toBe('-05');
            expect(formatSeconds(-30, { padSeconds: true })).toBe('-30');
        });

        it('should still pad seconds in minute:second format', () => {
            expect(formatSeconds(60, { padSeconds: true })).toBe('1:00');
            expect(formatSeconds(65, { padSeconds: true })).toBe('1:05');
            expect(formatSeconds(-60, { padSeconds: true })).toBe('-1:00');
        });
    });

    describe('with both options', () => {
        it('should combine showMinutesIfZero and padSeconds', () => {
            expect(formatSeconds(0, { showMinutesIfZero: true, padSeconds: true })).toBe('0:00');
            expect(formatSeconds(5, { showMinutesIfZero: true, padSeconds: true })).toBe('0:05');
            expect(formatSeconds(30, { showMinutesIfZero: true, padSeconds: true })).toBe('0:30');
            expect(formatSeconds(-5, { showMinutesIfZero: true, padSeconds: true })).toBe('-0:05');
        });

        it('should work correctly with minutes > 0', () => {
            expect(formatSeconds(60, { showMinutesIfZero: true, padSeconds: true })).toBe('1:00');
            expect(formatSeconds(125, { showMinutesIfZero: true, padSeconds: true })).toBe('2:05');
            expect(formatSeconds(-125, { showMinutesIfZero: true, padSeconds: true })).toBe('-2:05');
        });
    });

    describe('edge cases', () => {
        it('should handle decimal values by floor division', () => {
            expect(formatSeconds(59.9)).toBe('59');
            expect(formatSeconds(60.5)).toBe('1:00');
            expect(formatSeconds(-59.9)).toBe('-59');
            expect(formatSeconds(-60.5)).toBe('-1:00');
            expect(formatSeconds(-0.5)).toBe('0'); // not -0
        });

        it('should handle maximum safe integer', () => {
            const maxSafe = Number.MAX_SAFE_INTEGER;
            expect(() => formatSeconds(maxSafe)).not.toThrow();
        });

        it('should handle special time values', () => {
            // 1 hour 23 minutes 45 seconds
            expect(formatSeconds(1 * 3600 + 23 * 60 + 45)).toBe('83:45');
            // 2 days 3 hours 4 minutes 5 seconds
            expect(formatSeconds(2 * 86400 + 3 * 3600 + 4 * 60 + 5)).toBe('3064:05');
        });
    });
});