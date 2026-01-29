// src/types/mode.ts

export type ModeGroup = string;

export type ModeInfo = {
    group: ModeGroup;
};

const MODE_INFO = {
    SSB: { group: 'SSB' as const },
    USB: { group: 'SSB' as const },
    LSB: { group: 'SSB' as const },
    CW: { group: 'CW' as const },
    FT8: { group: 'DIGI' as const },
    FT4: { group: 'DIGI' as const },
    RTTY: { group: 'DIGI' as const },
    PSK: { group: 'DIGI' as const },
    JT65: { group: 'DIGI' as const },
    JT9: { group: 'DIGI' as const },
    MSK144: { group: 'DIGI' as const },
    Q65: { group: 'DIGI' as const },
    JT65C: { group: 'DIGI' as const },
    FST4: { group: 'DIGI' as const },
    FST4W: { group: 'DIGI' as const },
    QRA64: { group: 'DIGI' as const },
    ISCAT: { group: 'DIGI' as const },
    JT4: { group: 'DIGI' as const },
    JT9A: { group: 'DIGI' as const },
    WSPR: { group: 'DIGI' as const },
    FM: { group: 'FM' as const },
    AM: { group: 'AM' as const },
    unknown: { group: 'unknown' as const },
} as const satisfies Record<string, ModeInfo>;

// Extract the types from the object
export type Mode = keyof typeof MODE_INFO;
export type ModeToggle = typeof MODE_INFO[Mode]['group'];

function isMode(mode: string): mode is Mode {
    return mode in MODE_INFO;
}

// Helper functions
export const ModeUtils = {

    parse(rawMode: string | null | undefined): Mode {
        if (rawMode == null || rawMode.trim() === '') {
            return 'unknown';
        }

        const normalized = rawMode.trim().toUpperCase();
        const modeKey = Object.keys(MODE_INFO).find(
            key => key.toUpperCase() === normalized
        ) as Mode | undefined;

        return modeKey || 'unknown';
    },

    getAllModes(): Mode[] {
        return Object.keys(MODE_INFO) as Mode[];
    },

    getAllTogglesArray(): ModeToggle[] {
        return Array.from(new Set(
            Object.values(MODE_INFO).map(info => info.group)
        ));
    },

    getToggleForMode(mode: Mode): ModeToggle | undefined {
        if (!isMode(mode)) { return undefined; }
        return MODE_INFO[mode].group;
    },

    getModesForToggle(toggle: ModeToggle): Mode[] {
        return (Object.entries(MODE_INFO) as [Mode, { group: ModeToggle }][])
            .filter(([, info]) => info.group === toggle)
            .map(([mode]) => mode);
    },

    getModeToggles(): { id: ModeToggle; modes: Mode[] }[] {
        const groups = new Set<ModeToggle>();
        Object.values(MODE_INFO).forEach(info => groups.add(info.group));

        return Array.from(groups).map(group => ({
            id: group,
            modes: this.getModesForToggle(group)
        }));
    },

    isModeInToggle(mode: Mode, toggle: ModeToggle): boolean | undefined {
        if (!isMode(mode)) { return undefined; }
        return MODE_INFO[mode].group === toggle;
    },    
};

// Pregenerated arrays
export const MODE_TOGGLES = ModeUtils.getModeToggles();
