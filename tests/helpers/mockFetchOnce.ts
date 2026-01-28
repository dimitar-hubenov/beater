import { vi } from 'vitest';

export function mockFetchOnceOk(data: unknown) {
    vi.stubGlobal('fetch', vi.fn()
        .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(data)
        } as any)
    );
}

export function mockFetchOnceError(status = 500) {
    vi.stubGlobal('fetch', vi.fn()
        .mockResolvedValueOnce({
            ok: false,
            status
        } as any)
    );
}
