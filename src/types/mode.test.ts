// src/types/mode.test.ts
import { describe, it, expect } from 'vitest';
import { ModeUtils } from './mode';

describe('ModeUtils', () => {

    const allModes = ModeUtils.getAllModes();

    it('allMode type and structure is correct', () => {
        expect(Array.isArray(allModes)).toBe(true);
        allModes.forEach(mode => {
            expect(typeof mode).toBe('string');
            expect(mode.length).toBeGreaterThan(0);
        });
    });

    describe('Mode parser tests', () => {

        it('parse() should return known modes correctly', () => {
            allModes.forEach(mode => {
                expect(ModeUtils.parse(mode)).toBe(mode);
            });
        });

        it('parse() should be case-insensitive and trim spaces', () => {
            let testWithMode = allModes[0];
            expect(ModeUtils.parse('  ' + allModes[0] + '  ')).toBe(testWithMode);
            expect(ModeUtils.parse(allModes[0].toLowerCase())).toBe(testWithMode);
            expect(ModeUtils.parse(allModes[0].toUpperCase())).toBe(testWithMode);
            expect(ModeUtils.parse('  ' + allModes[0].toLowerCase() + '  ')).toBe(testWithMode);
        });

        it('parse() should handle unknown modes gracefully', () => {
            expect(ModeUtils.parse(null)).toBe('unknown');
            expect(ModeUtils.parse(undefined)).toBe('unknown');
            expect(ModeUtils.parse('')).toBe('unknown');
            expect(ModeUtils.parse('   ')).toBe('unknown');
            expect(ModeUtils.parse('nonexistentmode')).toBe('unknown');
        });

    });

    describe('Toggle tests', () => {

        const allToggles = ModeUtils.getAllTogglesArray();

        it('getAllTogglesArray() returns correct structure', () => {
            expect(Array.isArray(allToggles)).toBe(true);
            allToggles.forEach(toggle => {
                expect(typeof toggle).toBe('string');
                expect(toggle.length).toBeGreaterThan(0);
            });
        });

        it('getToggleForMode() returns correct toggle for each mode', () => {
            allModes.forEach(mode => {
                const toggle = ModeUtils.getToggleForMode(mode);
                expect(toggle).toBeDefined();
                expect(typeof toggle).toBe('string');
                expect(allToggles).toContain(toggle);
            });
        });

        it('getToggleForMode() is undefined for invalid mode input', () => {
            expect(ModeUtils.getToggleForMode('invalidmode' as any)).toBeUndefined();
        });

        it('getModesForToggle() returns correct modes for each toggle', () => {
            allToggles.forEach(toggle => {
                const modes = ModeUtils.getModesForToggle(toggle);
                expect(Array.isArray(modes)).toBe(true);
                modes.forEach(mode => {
                    expect(allModes).toContain(mode);
                    expect(ModeUtils.getToggleForMode(mode)).toBe(toggle);
                });
            });
        });

        it('isModeInToggle() correctly identifies mode membership in toggles', () => {
            allModes.forEach(mode => {
                const toggle = ModeUtils.getToggleForMode(mode);
                expect(ModeUtils.isModeInToggle(mode, toggle as any)).toBe(true);
                allToggles
                    .filter(t => t !== toggle)
                    .forEach(otherToggle => {
                        expect(ModeUtils.isModeInToggle(mode, otherToggle)).toBe(false);
                    });
            });
        });

        it('isModeInToggle() is undefined for invalid mode input', () => {
            expect(ModeUtils.isModeInToggle('invalidmode' as any, allToggles[0])).toBeUndefined();
        });

    });

});

