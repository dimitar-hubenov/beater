// src/utils/frequency.test.ts

import { describe, it, expect } from 'vitest';
import { formatFrequency } from './frequency';

describe('formatFrequency', () => {
    it.each([
        [7000, '7.000.0'],
        [14280, '14.280.0'],
        [14074.3, '14.074.3'],
        [14074.96, '14.075.0'],
        [14999.96, '15.000.0'],
        [null, '—'],
        [undefined, '—'],
        [NaN, '—'],
        [-1, '—'],
    ])('formatFrequency(%o)', (input, expected) => {
        expect(formatFrequency(input as any)).toBe(expected);
    });
});