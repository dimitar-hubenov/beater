// src/types/band.test.ts
import { describe, it, expect } from 'vitest';
import { BANDS, BAND_TOGGLES, BandUtils } from './band';

describe('BandUtils parse string to Band', () => {

    it.each([
        ['40m', '40m'],
        ['20M', '20m'],
        [' 15m ', '15m'],
        ['unknown', 'unknown'],
        ['', 'unknown'],
        [null, 'unknown'],
        [undefined, 'unknown'],
        ['invalidband', 'unknown'],
    ]) ('parses "%s" -> %s', (raw, expected) => {
        expect(BandUtils.parse(raw as any)).toBe(expected);
    });

});

describe('BandUtils detect Band from frequency', () => {

    it.each(BANDS) (
        'returns correct band for frequency in %s',
        ({ band, frequencies }) => {
            const midFreq = Math.floor((frequencies.min + frequencies.max) / 2);
            expect(BandUtils.detectFromFrequency(frequencies.min)).toBe(band);
            expect(BandUtils.detectFromFrequency(midFreq)).toBe(band);
            expect(BandUtils.detectFromFrequency(frequencies.max)).toBe(band);
        }
    );

    it.each([
        [null],
        [undefined],
        [NaN],
        [999999],
    ])('returns unknown for invalid frequency %s', (freq) => {
        expect(BandUtils.detectFromFrequency(freq as any)).toBe('unknown');
    });

});

describe('BandUtils get frequency ranges for Band', () => {

    it.each(BANDS)(
        'returns correct frequency range limits per band %s',
        ({ band, frequencies }) => {
            expect(BandUtils.getFrequencyRange(band)).toEqual({
                min: frequencies.min,
                max: frequencies.max
            });
        }
    );

    it('returns undefined frequency range for the unknown band', () => {
        expect(BandUtils.getFrequencyRange('unknown')).toBeUndefined();
    })
});

describe('BandUtils check if frequency is inside a Band', () => {

    it.each(BANDS) (
        'returns true if frequency is in Band in %s',
        ({ band, frequencies }) => {
            const midFreq = Math.floor((frequencies.min + frequencies.max) / 2);
            expect(BandUtils.isFrequencyInBand(frequencies.min, band)).toBe(true);
            expect(BandUtils.isFrequencyInBand(midFreq, band)).toBe(true);
            expect(BandUtils.isFrequencyInBand(frequencies.max, band)).toBe(true);
        }
    );

    it.each([
        [null],
        [undefined],
        [NaN],
        [999999],
    ]) ('returns false for invalid frequency %s', (freq) => {
        expect(BandUtils.isFrequencyInBand(freq as any, '40m')).toBe(false);
    });

    it('returns false for the unknown band', () => {
        expect(BandUtils.isFrequencyInBand(14000, 'unknown')).toBe(false);
    })

});



// Tests for band toggles

describe('BandUtils toggles', () => {
    describe('getAllTogglesArray', () => {
        it('should return all unique band groups', () => {
            const result = BandUtils.getAllTogglesArray();

            // Expected toggles:
            // '160m', '80m', '60m', '40m', '30m', '20m', '17m', '15m', '12m', '10m', 'VHF/UHF', 'unknown'
            const expected = [
                '160m', '80m', '60m', '40m', '30m', '20m',
                '17m', '15m', '12m', '10m', 'VHF/UHF', 'unknown'
            ];

            expect(result).toHaveLength(expected.length);
            expect(result).toEqual(expect.arrayContaining(expected));

            // Check for uniqueness
            expect(result.length).toBe(new Set(result).size);
        });

        it('should return an array', () => {
            const result = BandUtils.getAllTogglesArray();
            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('getBandToggles', () => {
        it('should return an array of toggles with bands', () => {
            const result = BandUtils.getBandToggles();

            // Check that result is an array
            expect(Array.isArray(result)).toBe(true);

            result.forEach(toggle => {
                expect(toggle).toHaveProperty('id');
                expect(toggle).toHaveProperty('bands');
                expect(Array.isArray(toggle.bands)).toBe(true);
            });
        });

        it('should have correct bands for unknown toggle', () => {
            const result = BandUtils.getBandToggles();
            const unknownToggle = result.find(t => t.id === 'unknown');

            expect(unknownToggle).toBeDefined();
            expect(unknownToggle!.bands).toEqual(['unknown']);
        });
    });

    describe('getToggleForBand', () => {
        it('should return correct group for given band', () => {
            // HF Bands have their own groups
            expect(BandUtils.getToggleForBand('160m')).toBe('160m');
            expect(BandUtils.getToggleForBand('20m')).toBe('20m');
            expect(BandUtils.getToggleForBand('10m')).toBe('10m');

            // VHF/UHF group
            expect(BandUtils.getToggleForBand('2m')).toBe('VHF/UHF');
            expect(BandUtils.getToggleForBand('70cm')).toBe('VHF/UHF');

            // Test unknown
            expect(BandUtils.getToggleForBand('unknown')).toBe('unknown');
        });
    });

    describe('getBandsForToggle', () => {
        it('should return [unknown] for unknown toggle', () => {
            const result = BandUtils.getBandsForToggle('unknown');
            expect(result).toEqual(['unknown']);
        });

        it('should return empty array for non-existent toggle', () => {
            const result = BandUtils.getBandsForToggle('non-existent' as any);
            expect(result).toEqual([]);
        });
    });

    describe('isBandInToggle', () => {
        it('should return false for non-existent toggle', () => {
            expect(BandUtils.isBandInToggle('6m', 'non-existent' as any)).toBe(false);
        });
    });

    describe('Edge cases', () => {
        it('should have consistent data between different methods', () => {
            const toggles = BandUtils.getBandToggles();

            toggles.forEach(toggle => {
                toggle.bands.forEach(band => {
                    expect(BandUtils.getToggleForBand(band)).toBe(toggle.id);
                    expect(BandUtils.isBandInToggle(band, toggle.id)).toBe(true);
                });
            });
        });
    });

});

// Tests for distance zones

describe('distance zone invariants', () => {

    it.each(BANDS)(
        'zones increase correctly for %s',
        (current) => {

            const zones = BandUtils.getDistanceZones(current.band);

            if (zones.skip === undefined && zones.near === undefined && zones.far === undefined) {
                return;
            }

            let lastValue = -1;

            if (zones.skip !== undefined) {
                expect(zones.skip).toBeGreaterThanOrEqual(lastValue);
                lastValue = zones.skip;
            }

            if (zones.near !== undefined) {
                expect(zones.near).toBeGreaterThanOrEqual(lastValue);
                lastValue = zones.near;
            }

            if (zones.far !== undefined) {
                expect(zones.far).toBeGreaterThanOrEqual(lastValue);
                lastValue = zones.far;
            }
        }
    );

});

describe('distance zone classification', () => {

    it.each(BANDS)(
        'classifies zones correctly for %s',
        (current) => {

            const zones = BandUtils.getDistanceZones(current.band);

            if (zones.skip === undefined && zones.near === undefined && zones.far === undefined) {
                return;
            }

            let checkDistance: number;

            if (zones.skip !== undefined) {
                let checkDistance = zones.skip > 0 ? zones.skip - 1 : 0;
                expect(
                    BandUtils.getDistanceZone(checkDistance, current.band)
                ).toBe('skip');

                expect(
                    BandUtils.getDistanceZone(zones.skip, current.band)
                ).toBe('near');
            }
               
            if (zones.near !== undefined) {
                checkDistance = zones.near > 0 ? zones.near - 1 : 0;
                expect(
                    BandUtils.getDistanceZone(checkDistance, current.band)
                ).toBe('near');

                expect(
                    BandUtils.getDistanceZone(zones.near, current.band)
                ).toBe('medium');
            }

            if (zones.far !== undefined) {
                checkDistance = zones.far > 0 ? zones.far - 1 : 0;
                expect(
                    BandUtils.getDistanceZone(checkDistance, current.band)
                ).toBe('medium');

                expect(
                    BandUtils.getDistanceZone(zones.far, current.band)
                ).toBe('far');

            }
        }
    );

    it.each([
        [null],
        [undefined],
        [NaN],
        [-555],
    ])('returns unknown zone for invalid distance %s', (distance) => {
        const band = BANDS[0].band;
        expect(BandUtils.getDistanceZone(distance, band)).toBe('unknown');
    });

    it('should return unknown zone for the unknown band', () => {
        expect(BandUtils.getDistanceZone(20, 'unknown')).toBe('unknown');
    });

});
