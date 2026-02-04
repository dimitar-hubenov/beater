// src/utils/frequency.ts

export function formatFrequency(freqKhz: number | null | undefined): string {
    if (freqKhz == null || Number.isNaN(freqKhz)) {
        return '—';
    }

    if (freqKhz < 0) {
        return '—';
    }

    const mhz = Math.floor(freqKhz / 1000);

    const remainderKhz = freqKhz % 1000;
    const khz = Math.floor(remainderKhz);

    // tenth of kHz (100 Hz resolution)
    let hundredHz = Math.round((remainderKhz - khz) * 10);

    // Handle rounding overflow (e.g. 14.9999 → 15.000.0)
    let finalKhz = khz;
    let finalMhz = mhz;

    if (hundredHz === 10) {
        hundredHz = 0;
        finalKhz += 1;

        if (finalKhz === 1000) {
            finalKhz = 0;
            finalMhz += 1;
        }
    }

    return `${finalMhz}.${finalKhz.toString().padStart(3, '0')}.${hundredHz}`;
}
