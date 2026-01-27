// src/utils/spotSorting.test.ts
import { describe, it, expect, beforeEach } from 'vitest';

import { resetSpotFactory, makeSpot } from '../../tests/factories/spotFactory';
import {
    getInitialSortConfig,
    getNextSortDirection,
    sortSpots,
    COLUMN_DEFAULTS,
} from './spotSorting';

describe('getInitialSortConfig', () => {
    it('returns time column with default direction', () => {
        expect(getInitialSortConfig()).toEqual({
            key: 'time',
            direction: COLUMN_DEFAULTS.time,
        });
    });
});

describe('getNextSortDirection', () => {
    it('toggles direction on same column', () => {
        expect(getNextSortDirection('time', 'time', 'asc')).toBe('desc');
        expect(getNextSortDirection('time', 'time', 'desc')).toBe('asc');
    });

    it('uses column default on new column', () => {
        expect(getNextSortDirection('time', 'activator', 'desc')).toBe('asc');
    });

    it('falls back to asc if column not in defaults', () => {
        expect(getNextSortDirection('time', 'unknown', 'desc')).toBe('asc');
    });
});

describe('sortSpots', () => {
    beforeEach(() => {
        resetSpotFactory();
    });

    it('sorts by activator', () => {
        const spots = [
            makeSpot({ activator: 'DL2BBB' }),
            makeSpot({ activator: 'DL2AAA' }),
            makeSpot({ activator: 'DL2CCC' }),
        ];
        const resultAsc = sortSpots(spots, { key: 'activator', direction: 'asc' });
        expect(resultAsc.map(s => s.activator)).toEqual(['DL2AAA', 'DL2BBB', 'DL2CCC']);

        const resultDesc = sortSpots(spots, { key: 'activator', direction: 'desc' });
        expect(resultDesc.map(s => s.activator)).toEqual(['DL2CCC', 'DL2BBB', 'DL2AAA']);
    });

    it('sorts by program', () => {
        const spots = [
            makeSpot({ program: 'SOTA' }),
            makeSpot({ program: 'POTA' }),
            makeSpot({ program: 'WWFF' }),
        ];
        const resultAsc = sortSpots(spots, { key: 'program', direction: 'asc' });
        expect(resultAsc.map(s => s.program)).toEqual(['POTA', 'SOTA', 'WWFF']);

        const resultDesc = sortSpots(spots, { key: 'program', direction: 'desc' });
        expect(resultDesc.map(s => s.program)).toEqual(['WWFF', 'SOTA', 'POTA']);
    });

    it('sorts by reference', () => {
        const spots = [
            makeSpot({ reference: 'DE-1005' }),
            makeSpot({ reference: 'BG-0082' }),
            makeSpot({ reference: 'FR-5454' }),
        ];
        const resultAsc = sortSpots(spots, { key: 'reference', direction: 'asc' });
        expect(resultAsc.map(s => s.reference)).toEqual(['BG-0082', 'DE-1005', 'FR-5454']);

        const resultDesc = sortSpots(spots, { key: 'reference', direction: 'desc' });
        expect(resultDesc.map(s => s.reference)).toEqual(['FR-5454', 'DE-1005', 'BG-0082']);
    });


    it('sorts by frequency', () => {
        const spots = [
            makeSpot({ frequency: 14000 }),
            makeSpot({ frequency: 7000 }),
            makeSpot({ frequency: 21000 }),
        ];
        const resultAsc = sortSpots(spots, { key: 'frequency', direction: 'asc' });
        expect(resultAsc.map(s => s.frequency)).toEqual([7000, 14000, 21000]);

        const resultDesc = sortSpots(spots, { key: 'frequency', direction: 'desc' });
        expect(resultDesc.map(s => s.frequency)).toEqual([21000, 14000, 7000]);
    });

    it('sorts by mode', () => {
        const spots = [
            makeSpot({ mode: 'SSB' }),
            makeSpot({ mode: 'AM' }),
            makeSpot({ mode: 'FT8' }),
        ];
        const resultAsc = sortSpots(spots, { key: 'mode', direction: 'asc' });
        expect(resultAsc.map(s => s.mode)).toEqual(['AM', 'FT8', 'SSB']);

        const resultDesc = sortSpots(spots, { key: 'mode', direction: 'desc' });
        expect(resultDesc.map(s => s.mode)).toEqual(['SSB', 'FT8', 'AM']);
    });

    it('sorts by time', () => {
        const spots = [
            makeSpot({ time: '2025-01-01T12:00:00Z' }),
            makeSpot({ time: '2025-01-01T10:00:00Z' }),
            makeSpot({ time: '2025-01-01T14:00:00Z' }),
        ];

        const resultAsc = sortSpots(spots, { key: 'time', direction: 'asc' });
        expect(resultAsc.map(s => s.id)).toEqual(['2', '1', '3']);

        const resultDesc = sortSpots(spots, { key: 'time', direction: 'desc' });
        expect(resultDesc.map(s => s.id)).toEqual(['3', '1', '2']);
    });

    it('puts undefined distances at the bottom', () => {
        const withUndefined = [
            makeSpot({ distanceKm: 50 }),
            makeSpot({ distanceKm: undefined }),
            makeSpot({ distanceKm: 10 }),
        ];

        const result = sortSpots(withUndefined, {
            key: 'distance',
            direction: 'asc',
        });

        expect(result.map(s => s.id)).toEqual(['3', '1', '2']);
    });

    it('sorts by spotter', () => {
        const spots = [
            makeSpot({ spotter: 'DL2BBB' }),
            makeSpot({ spotter: 'DL2AAA' }),
            makeSpot({ spotter: 'DL2CCC' }),
        ];
        const resultAsc = sortSpots(spots, { key: 'spotter', direction: 'asc' });
        expect(resultAsc.map(s => s.spotter)).toEqual(['DL2AAA', 'DL2BBB', 'DL2CCC']);

        const resultDesc = sortSpots(spots, { key: 'spotter', direction: 'desc' });
        expect(resultDesc.map(s => s.spotter)).toEqual(['DL2CCC', 'DL2BBB', 'DL2AAA']);
    });

    it('uses time as secondary sort when primary values are equal', () => {
        const spots = [
            makeSpot({
                activator: 'LZ1AAA',
                time: '2025-01-01T10:00:00Z',
            }),
            makeSpot({
                activator: 'LZ1AAA',
                time: '2025-01-01T12:00:00Z',
            }),
        ];

        const result = sortSpots(spots, {
            key: 'activator',
            direction: 'asc',
        });

        expect(result.map(s => s.time)).toEqual([
            '2025-01-01T12:00:00Z',
            '2025-01-01T10:00:00Z',
        ]);
    });

    it('doesn\'t sort by non sorting column', () => {
        const spots = [
            makeSpot({ comments: 'Bcdefg' }),
            makeSpot({ comments: 'Abcdef' }),
            makeSpot({ comments: 'Cdefgh' }),
        ];
        const resultAsc = sortSpots(spots, { key: 'comments', direction: 'asc' });
        expect(resultAsc.map(s => s.comments)).toEqual(['Bcdefg', 'Abcdef', 'Cdefgh']);

        const resultDesc = sortSpots(spots, { key: 'comments', direction: 'desc' });
        expect(resultDesc.map(s => s.comments)).toEqual(['Bcdefg', 'Abcdef', 'Cdefgh']);
    });
});

describe('sortSpots fallbacks', () => {
    it('treats missing activator as empty string (A)', () => {
        const spots = [
            makeSpot({ activator: undefined }),
            makeSpot({ activator: 'AAA' }),
        ];

        const result = sortSpots(spots, { key: 'activator', direction: 'asc'});
        expect(result.map(s => s.activator)).toEqual([undefined, 'AAA']);
    });

    it('treats missing activator as empty string (B)', () => {
        const spots = [
            makeSpot({ activator: 'AAA' }),
            makeSpot({ activator: undefined }),
        ];

        const result = sortSpots(spots, { key: 'activator', direction: 'asc' });
        expect(result.map(s => s.activator)).toEqual([undefined, 'AAA']);
    });

    it('treats missing reference as empty string (A)', () => {
        const spots = [
            makeSpot({ reference: undefined }),
            makeSpot({ reference: 'AA-001' }),
        ];

        const result = sortSpots(spots, {key: 'reference', direction: 'asc' });
        expect(result.map(s => s.reference)).toEqual([undefined, 'AA-001']);
    });

    it('treats missing reference as empty string (B)', () => {
        const spots = [
            makeSpot({ reference: 'AA-001' }),
            makeSpot({ reference: undefined }),
        ];

        const result = sortSpots(spots, { key: 'reference', direction: 'asc' });
        expect(result.map(s => s.reference)).toEqual([undefined, 'AA-001']);
    });

    it('treats missing frequency as 0 (A)', () => {
        const spots = [
            makeSpot({ frequency: undefined }),
            makeSpot({ frequency: 7000 }),
        ];

        const result = sortSpots(spots, {key: 'frequency', direction: 'asc' });
        expect(result.map(s => s.frequency)).toEqual([undefined, 7000]);
    });

    it('treats missing frequency as 0 (B)', () => {
        const spots = [
            makeSpot({ frequency: 7000 }),
            makeSpot({ frequency: undefined }),
        ];

        const result = sortSpots(spots, { key: 'frequency', direction: 'asc' });
        expect(result.map(s => s.frequency)).toEqual([undefined, 7000]);
    });

    it('treats missing spotter as empty string (A)', () => {
        const spots = [
            makeSpot({ spotter: undefined }),
            makeSpot({ spotter: 'DL1AAA' }),
        ];

        const result = sortSpots(spots, { key: 'spotter', direction: 'asc' });
        expect(result.map(s => s.spotter)).toEqual([undefined, 'DL1AAA']);
    });

    it('treats missing spotter as empty string (B)', () => {
        const spots = [
            makeSpot({ spotter: 'DL1AAA' }),
            makeSpot({ spotter: undefined }),
        ];

        const result = sortSpots(spots, { key: 'spotter', direction: 'asc' });
        expect(result.map(s => s.spotter)).toEqual([undefined, 'DL1AAA']);
    });
});