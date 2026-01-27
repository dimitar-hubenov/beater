// src/pages/SpotsPage.jsx

import { useSpotsData } from '../hooks/useSpotsData';
import { useSpotFilters } from '../hooks/useSpotFilters';

import SpotsLayout from '../layouts/SpotsLayout';
import SpotsFilters from '../components/SpotsFilters';
import SpotsTable from '../components/SpotsTable';
import { useUserSettings } from '../settings/useUserSettings';

export default function SpotsPage() {
    const { spots, loading, error } = useSpotsData();
    const { settings } = useUserSettings();

    const {
        filters,
        filteredSpots,
        actions,
    } = useSpotFilters(
        spots, {
            qthLat: settings.qthLat ?? undefined,
            qthLon: settings.qthLon ?? undefined,
            alwaysShowSpotsWithoutDistance: settings.alwaysShowSpotsWithoutDistance,
        }
    );

    if (error) {
        return (
            <div className="p-4 text-red-400">
                {error.message || 'Failed to load spots'}
            </div>
        );
    }

    return (
        <SpotsLayout
            filters={
                <SpotsFilters
                    filters={filters}
                    actions={actions}
                />
            }
            content={
                <SpotsTable
                    spots={filteredSpots}
                    loading={loading}
                />
            }
        />
    );
}
