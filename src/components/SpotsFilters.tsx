// src/components/SpotsFilters.jsx
import type { SpotFilterActions } from '../hooks/useSpotFilters';
import type { SpotFilters } from '../types/spotFilters';
import { useUserSettings } from '../settings/useUserSettings';
import { BAND_TOGGLES } from '../types/band';
import { MODE_TOGGLES } from '../types/mode';
import { 
    formatDistance, 
    getDistanceValue, 
    getDistanceDisplayUnit, 
    getDistanceMaxRange, 
    convertDistanceToKm 
} from '../utils/distance';

type SpotsFiltersProps = {
    filters: SpotFilters;
    actions: SpotFilterActions;
};

export default function SpotsFilters({ filters, actions } : SpotsFiltersProps) {
    const { settings } = useUserSettings();
    const displayDistance =
        filters.maxDistanceKm == null
            ? null
            : getDistanceValue(filters.maxDistanceKm, settings.distanceUnit);
    return (
        <div className="p-3 space-y-4">
            
            {/* ACTIVATOR CALLSIGN */}
            <label className="block text-sm text-(--label-text)">
                Activator
                <input
                    id="activator"
                    type="text"
                    value={filters.activator}
                    onChange={e => actions.setActivator(e.target.value)}
                    placeholder="e.g. LZ1, *ABC, DL*"
                    className="
                        mt-1 w-full px-2 py-1 rounded
                        bg-(--input-bg) text-sm text-(--input-text)
                        border border-(--input-border)
                        focus:border-(--input-border-focus)
                        focus:outline-none focus:ring
                        "
                />
            </label>
            
            {/* REFERENCE */}
            <label className="block text-sm text-(--label-text)">
                Reference
                <input
                    id="reference"
                    type="text"
                    value={filters.reference}
                    onChange={e => actions.setReference(e.target.value)}
                    placeholder="e.g. LZ1, *ABC, DL*"
                    className="
                        mt-1 w-full px-2 py-1 rounded
                        bg-(--input-bg) text-sm text-(--input-text)
                        border border-(--input-border)
                        focus:border-(--input-border-focus)
                        focus:outline-none focus:ring
                        "
                />
            </label>
            
            {/* BAND TOGGLES */}
            <div className="space-y-1">
                <h3 className="text-sm text-(--label-text)">Bands</h3>
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 alpha">
                    {BAND_TOGGLES.map((toggle) => {
                        const isActive = toggle.bands.every(b => filters.bands.includes(b));
                        return (
                            <button
                                key={toggle.id}
                                onClick={() => actions.toggleBand(toggle.id)}
                                data-active={isActive}
                                className={`
                                    btn btn-dark btn-sm
                                `}
                            >
                                {toggle.id}
                            </button>
                        );
                    })}
                </div>
            </div>
            
            {/* MODE TOGGLES */}
            <div className="space-y-1 ">
                <h3 className="text-sm text-(--label-text)">Modes</h3>
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 alpha">
                    {MODE_TOGGLES.map((toggle) => {
                        const isActive = toggle.modes.every(m => filters.modes.includes(m));
                        return (
                            <button
                                key={toggle.id}
                                onClick={() => actions.toggleMode(toggle.id)}
                                data-active={isActive}
                                className={`
                                    btn btn-dark btn-sm
                                `}
                            >
                                {toggle.id}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* AGE */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-(--label-text)">
                    <span>Max age</span>
                    <span>
                        {filters.maxAgeMinutes == null
                            ? 'Off'
                            : `${filters.maxAgeMinutes} min`}
                    </span>
                </div>

                {/* Slider */}
                <input
                    id="ageFilterSlider"
                    type="range"
                    min={0}
                    max={30}
                    step={5}
                    value={filters.maxAgeMinutes ?? 0}
                    onChange={e => {
                        const value = Number(e.target.value);
                        actions.setMaxAge(value === 0 ? null : value);
                    }}
                    className="w-full mb-2"
                />

                {/* Numeric input */}
                <input
                    id="ageFilterInput"
                    type="number"
                    min={1}
                    max={30}
                    placeholder="Minutes"
                    value={filters.maxAgeMinutes ?? ''}
                    onChange={e => {
                        const value = e.target.value;
                        actions.setMaxAge(
                            value === '' ? null : Number(value)
                        );
                    }}
                    className="
                        mt-1 w-full px-2 py-1 rounded
                        bg-(--input-bg) text-sm text-(--input-text)
                        border border-(--input-border)
                        focus:border-(--input-border-focus)
                        focus:outline-none focus:ring
                    "
                />
            </div>

            {/* DISTANCE */}
            {settings.qthLat && settings.qthLon && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-(--label-text)">
                        <span>Max distance</span>
                        <span>
                            {filters.maxDistanceKm == null
                                ? 'Off'
                                : formatDistance(filters.maxDistanceKm, settings.distanceUnit)}
                        </span>
                    </div>

                    {/* Slider */}
                    <input
                        id="distanceFilterSlider"
                        type="range"
                        min={0}
                        max={getDistanceMaxRange(settings.distanceUnit)}
                        step={settings.distanceUnit === 'mi' ? 50 : 100}
                        value={displayDistance ?? 0}
                        onChange={e => {
                            const raw = Number(e.target.value);

                            actions.setMaxDistance(
                                raw === 0
                                    ? null
                                    : convertDistanceToKm(raw, settings.distanceUnit) // store in km
                            );
                        }}
                        className="w-full mb-2"
                    />

                    {/* Numeric input */}
                    <input
                        id="distanceFilterInput"
                        type="number"
                        min={1}
                        max={getDistanceMaxRange(settings.distanceUnit)}
                        placeholder={getDistanceDisplayUnit(settings.distanceUnit)}
                        value={displayDistance ?? ''}
                        onChange={e => {
                            const raw = Number(e.target.value);

                            actions.setMaxDistance(
                                raw === 0
                                    ? null
                                    : convertDistanceToKm(raw, settings.distanceUnit) // store in km
                            );
                        }}
                        className="
                            mt-1 w-full px-2 py-1 rounded
                            bg-(--input-bg) text-sm text-(--input-text)
                            border border-(--input-border)
                            focus:border-(--input-border-focus)
                            focus:outline-none focus:ring
                        "
                    />
                </div>
            )}
            
        </div>
    );
}
