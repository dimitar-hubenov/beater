import { vi } from 'vitest';

export function mockFetchOk(data: unknown) {
    vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve(data)
        } as any)
    ));
}

export function mockFetchError(status = 500) {
    vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
            ok: false,
            status
        } as any)
    ));
}
