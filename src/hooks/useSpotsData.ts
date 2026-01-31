// src/hooks/useSpotsData.ts
import { useEffect, useMemo, useState } from 'react';
import type { Spot } from '../types/spot';
import type { SpotSource } from '../types/spotSource';
import type { SpotSourceProvider } from '../spotSources/types';
import { useUserSettings } from '../settings/useUserSettings';

import { PotaProgram } from '../spotSources/sourcePota';
import { SotaProgram } from '../spotSources/sourceSota';
import { WwffProgram } from '../spotSources/sourceWwff';

import { resolveReferenceCoordinates } from '../references/referenceStore';
import { useI18n } from '../i18n/useI18n';

const PROGRAM_PROVIDERS: Record<SpotSource, SpotSourceProvider> = {
    POTA: PotaProgram,
    SOTA: SotaProgram,
    WWFF: WwffProgram,
};

async function enrichSpotsWithCoordinates(
    spots: Spot[]
): Promise<Spot[]> {
    return Promise.all(
        spots.map(async spot => {
            if (
                spot.latitude != null &&
                spot.longitude != null
            ) {
                return spot;
            }

            if (!spot.reference) {
                return spot;
            }

            try {
                const coords = await resolveReferenceCoordinates(
                    spot.program,
                    spot.reference,
                    spot
                );

                if (!coords) return spot;

                return {
                    ...spot,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                };
            } catch {
                return spot;
            }
        })
    );
}

export function useSpotsData() {
    const { t } = useI18n();
    const { settings } = useUserSettings();

    const [spots, setSpots] = useState<Spot[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const enabledProviders = useMemo(() => {
        return settings.enabledPrograms
            .map(p => PROGRAM_PROVIDERS[p])
            .filter(Boolean);
    }, [settings.enabledPrograms]);

    const fetchSpots = async () => {
        if (enabledProviders.length === 0) {
            setSpots([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const results = await Promise.allSettled(
                enabledProviders.map(p => p.fetchSpots())
            );

            const merged = results
                .filter(
                    (r): r is PromiseFulfilledResult<Spot[]> =>
                        r.status === 'fulfilled'
                )
                .flatMap(r => r.value);

            const enriched = await enrichSpotsWithCoordinates(merged);

            setSpots(enriched);
        } catch (e) {
            let err = e as Error;
            if (!(e instanceof Error)) {
                err = new Error(t('spots.fetch.errorDefault'));
            }
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpots();

        const interval = setInterval(
            fetchSpots,
            settings.programRefreshInterval * 1000
        );

        return () => clearInterval(interval);
    }, [
        enabledProviders,
        settings.programRefreshInterval,
    ]);

    return { spots, loading, error };
}
