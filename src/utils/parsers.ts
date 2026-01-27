// src/utils/parsers.ts

export function parseNumber(value: unknown): number | null {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

export function parseOptionalNumber(value: unknown): number | undefined {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
}

export function parseNonEmptyString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const s = value.trim();
    return s.length > 0 ? s : null;
}
