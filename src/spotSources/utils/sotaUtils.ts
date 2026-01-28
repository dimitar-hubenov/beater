// src/spotSources/utils/sotaUtils.ts

/**
 * Extract additional information from summitDetails string
 */
function parseSummitDetails(details: string): {
    name?: string;
    altitude?: number;
    points?: number;
} {
    if (!details) return {};

    const parts = details.split(',');
    const result: { name?: string; altitude?: number; points?: number } = {};

    if (parts.length > 0) {
        result.name = parts[0].trim();
    }

    // Try to extract altitude (e.g., "3255m")
    for (const part of parts) {
        const trimmed = part.trim();

        // Look for altitude in meters
        const altitudeMatch = trimmed.match(/(\d+)\s*m/);
        if (altitudeMatch) {
            result.altitude = parseInt(altitudeMatch[1], 10);
        }

        // Look for points
        const pointsMatch = trimmed.match(/(\d+)\s*points?/);
        if (pointsMatch) {
            result.points = parseInt(pointsMatch[1], 10);
        }
    }

    return result;
}

/**
 * Parse summit code into components
 */
function parseSummitCode(summitCode: string): { prefix: string; number: string } | null {
    const match = summitCode.match(/^([A-Z]{1,2})-(\d+)$/i);
    if (match) {
        return {
            prefix: match[1].toUpperCase(),
            number: match[2]
        };
    }
    return null;
}

/**
 * Generate summit URL (for reference)
 */
function getSummitUrl(associationCode: string, summitCode: string): string {
    return `https://www.sotadata.org.uk/en/summit/${associationCode}/${summitCode}`;
}

/**
 * Generate activator URL
 */
function getActivatorUrl(activatorCallsign: string): string {
    const cleanCall = activatorCallsign.replace('/', '%2F');
    return `https://www.sotadata.org.uk/en/activator/${cleanCall}`;
}

/**
 * Extract points from summit details
 */
function extractPointsFromDetails(details: string): number | null {
    const parsed = parseSummitDetails(details);
    return parsed.points || null;
}

/**
 * Extract altitude from summit details
 */
function extractAltitudeFromDetails(details: string): number | null {
    const parsed = parseSummitDetails(details);
    return parsed.altitude || null;
}
