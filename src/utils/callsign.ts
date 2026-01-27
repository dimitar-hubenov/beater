// src/utils/callsign.ts

import { redirectDocument } from "react-router-dom";

/**
 * Fixed visual width for callsign rendering
 */
export const CALLSIGN_WIDTH = 15;

/**
 * Visual center column (0-based index)
 * The last digit of the core callsign is aligned here
 */
export const CALLSIGN_CENTER_COLUMN = 6;

export type ParsedCallsign = {
    raw: string;
    prefix?: string;
    core: string;
    suffix?: string;
};

/**
 * Parse a callsign into prefix / core / suffix.
 *
 * Rules:
 * - Core MUST contain at least one digit
 * - If only one '/', the part containing a digit is the core
 * - Prefix is before core, suffix is after core
 */
export function parseCallsign(raw: string): ParsedCallsign {
    const cleaned = raw.trim();

    if (!cleaned.includes('/')) {
        return { raw, core: cleaned };
    }

    const parts = cleaned.split('/');

    // Find the part that contains at least one digit → core
    const coreIndex = parts.findIndex(p => /\d/.test(p));

    // Fallback: treat everything as core
    if (coreIndex === -1) {
        return { raw, core: cleaned };
    }

    const core = parts[coreIndex];

    const prefix =
        coreIndex > 0
            ? parts.slice(0, coreIndex).join('/')
            : undefined;

    const suffix =
        coreIndex < parts.length - 1
            ? parts.slice(coreIndex + 1).join('/')
            : undefined;

    return {
        raw,
        prefix,
        core,
        suffix,
    };
}

/**
 * Format a callsign for monospace table display.
 *
 * - Fixed width
 * - Aligned by the last digit of the core
 * - Safe fallback if no digit is present
 */
export function formatCallsign(
    raw: string,
    width: number = CALLSIGN_WIDTH,
    centerColumn: number = CALLSIGN_CENTER_COLUMN
): string {
    if (!raw || raw.trim() === '') {
        return '';
    }

    const rawCallsign = raw.trim();
    if (rawCallsign.length >= width) {
        return rawCallsign; 
    }

    const { prefix, core, suffix } = parseCallsign(rawCallsign);

    let text = '';
    if (prefix) text += prefix + '/';
    text += core;
    if (suffix) text += '/' + suffix;

    // Find last digit in core (visual anchor)
    const match = core.match(/.*(\d)/);
    if (!match) {
        return padIfNeeded(text, width);
    }

    const lastDigit = match[1];
    const digitIndexInCore = core.lastIndexOf(lastDigit);

    const digitIndexInText =
        (prefix ? prefix.length + 1 : 0) + digitIndexInCore;

    const leftPadding = centerColumn - digitIndexInText;

    let result =
        ' '.repeat(Math.max(0, leftPadding)) + text;

    return padIfNeeded(result, width);
}

/**
 * Ensure exact width: pad right or trim
 */
function padIfNeeded(text: string, width: number): string {
    return text.padEnd(width, ' ');
}
