import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { publicUrl } from './url';

const TEST_BASE_URL = '/app/';

describe('publicUrl', () => {
    const originalBase = import.meta.env.BASE_URL;

    beforeEach(() => {
        import.meta.env.BASE_URL = TEST_BASE_URL;
    });

    afterEach(() => {
        import.meta.env.BASE_URL = originalBase;
    });

    it('joins base url with relative path', () => {
        expect(publicUrl('icons/logo.png'))
            .toBe(`${TEST_BASE_URL}icons/logo.png`);
    });

    it('removes leading slash from path', () => {
        expect(publicUrl('/icons/logo.png'))
            .toBe(`${TEST_BASE_URL}icons/logo.png`);
    });

    it('removes multiple leading slashes', () => {
        expect(publicUrl('///icons/logo.png'))
            .toBe(`${TEST_BASE_URL}icons/logo.png`);
    });

    it('works with empty path', () => {
        expect(publicUrl(''))
            .toBe(TEST_BASE_URL);
    });
});
