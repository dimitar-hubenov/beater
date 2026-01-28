/**
 * Additional utility functions for WWFF
 */
export const WwffUtils = {
    /**
     * Generate URL to WWFF database for this reference
     */
    getDatabaseUrl(reference: string): string {
        return `https://wwff.co/ffma/show.php?ffma=${reference}`;
    },

    /**
     * Parse reference into components
     */
    parseReference(reference: string): { countryCode: string; ffmaNumber: string } | null {
        const match = reference.match(/^([A-Z0-9]+)FF-(\d+)$/);
        if (match) {
            return {
                countryCode: match[1],
                ffmaNumber: match[2]
            };
        }
        return null;
    },

    /**
     * Extract country code from WWFF reference
     */
    getCountryCodeFromReference(reference: string): string {
        if (!reference) return '';

        const match = reference.match(/^([A-Z0-9]+)FF-/);
        return match ? match[1] : '';
    },

    /**
     * Get country name from country code
     */
    getCountryName(countryCode: string): string {
        const countryNames: Record<string, string> = {
            'K': 'United States',
            'DL': 'Germany',
            'OH': 'Finland',
            'SP': 'Poland',
            'OK': 'Czech Republic',
            'I': 'Italy',
            'TA': 'Turkey',
            '9A': 'Croatia',
            'Z3': 'North Macedonia',
            'DQ': 'Germany (Special)',
            'VK': 'Australia',
            'ZL': 'New Zealand',
            'VE': 'Canada',
            'G': 'England',
            'GW': 'Wales',
            'GM': 'Scotland',
            'GI': 'Northern Ireland',
            'F': 'France',
            'EA': 'Spain',
            'CT': 'Portugal',
            'ON': 'Belgium',
            'PA': 'Netherlands',
            'SM': 'Sweden',
            'LA': 'Norway',
            'OZ': 'Denmark',
            'HB': 'Switzerland',
            'OE': 'Austria',
            'HA': 'Hungary',
            'YU': 'Serbia',
            'Z': 'South Africa',
            'VU': 'India',
            'JA': 'Japan',
            'HL': 'South Korea',
            'BV': 'Taiwan',
            'PY': 'Brazil',
            'LU': 'Argentina',
            'CE': 'Chile',
            'OA': 'Peru',
            'HC': 'Ecuador',
            'HK': 'Colombia',
            'YV': 'Venezuela',
            'PJ': 'Netherlands Antilles',
        };

        return countryNames[countryCode] || countryCode;
    }
};