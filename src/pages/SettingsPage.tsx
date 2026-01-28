// src/pages/SettingsPage.tsx
import { useNavigate } from 'react-router-dom';
import { useUserSettings } from '../settings/useUserSettings';
import { DistanceUnit, Theme } from '../types/userSettings';
import { LanguageUtils, type Language } from '../types/language';
import { SpotSource } from '../types/spotSource';
import { formatSeconds } from '../utils/time';
import { validateGrid, gridToPoint, pointToGrid } from '@hamlog/maidenhead';

export default function SettingsPage() {
    const navigate = useNavigate();
    const { settings, actions } = useUserSettings();

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-xl mx-auto p-4 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Settings</h1>
                    <button
                        onClick={() => navigate('/')}
                        className="px-3 py-2 rounded bg-gray-800 border border-gray-700"
                    >
                        ← Back
                    </button>
                </div>

                {/* Sections */}
                <SettingsSection title="Programs Fetch">
                    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 alpha gap-4">
                        {[
                            { key: 'POTA', label: 'POTA', title: "Parks on the Air" },
                            { key: 'SOTA', label: 'SOTA', title: "Summits on the Air" },
                            { key: 'WWFF', label: 'WWFF', title: "World Wide Flora Fauna" },
                        ].map(({ key, label, title }) => (
                            <button
                                key={key}
                                data-active={settings.enabledPrograms.includes(key as SpotSource)}
                                onClick={() => actions.toggleProgram(key as SpotSource)}
                                title={title}
                                className={`btn btn-dark btn-sm`}
                            >
                                {label}
                            </button>
                            )
                        )}
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-(--label-text)">
                            <span>Refresh interval</span>
                            <span>
                                {formatSeconds(settings.programRefreshInterval)}
                            </span>
                        </div>

                        {/* Slider */}
                        <input
                            id="refreshSourcesIntervalSlider"
                            type="range"
                            min={60}
                            max={300}
                            step={10}
                            value={settings.programRefreshInterval ?? 0}
                            onChange={e => {
                                const value = Number(e.target.value);
                                actions.setProgramRefreshInterval(value);
                            }}
                            className="w-full mb-2"
                        />

                        {/* Numeric input */}
                        <input
                            id="refreshSourcesIntervalInput"
                            type="number"
                            min={60}
                            max={300}
                            placeholder="Minutes"
                            value={settings.programRefreshInterval ?? ''}
                            onChange={e => {
                                const value = Number(e.target.value);
                                actions.setProgramRefreshInterval(value);
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
                </SettingsSection>

                <SettingsSection title="Distance">
                    <div className="flex items-end gap-4">
                        {/* QTH input */}
                        <div className="flex flex-col w-1/4 min-w-32">
                            <label htmlFor="settingsQth" className="text-xs text-(--label-text) pb-1">QTH (Grid)</label>
                            <input
                                id="settingsQth"
                                type="text"
                                value={settings.qthGrid ?? ''}
                                onChange={e => {
                                    actions.setQthGrid(e.target.value);
                                }}
                                placeholder="AB12cd"
                                className="
                                    px-2 py-1.5 rounded
                                    bg-(--input-bg) text-sm
                                    border border-(--input-border)
                                    focus:outline-none focus:ring
                                "
                            />
                        </div>

                        {/* Status */}
                        <div className="flex-1 flex items-center text-sm text-gray-400 min-h-9">
                            <QthStatus
                                grid={settings.qthGrid}
                                lat={settings.qthLat}
                                lon={settings.qthLon}
                            />
                        </div>

                        {/* Unit switch */}
                        <div className="flex flex-col items-start">
                            <label htmlFor="distanceUnitSwitch" className="text-xs text-(--label-text) pb-1">Units</label>
                            <DistanceUnitSwitch
                                value={settings.distanceUnit}
                                onChange={actions.setDistanceUnit}
                            />
                        </div>
                    </div>
                </SettingsSection>

                <SettingsSection title="Language">
                    <LanguageSelector
                        value={settings.language}
                        onChange={actions.setLanguage}
                    />
                </SettingsSection>

                <SettingsSection title="Appearance">
                    <ThemeSelector
                        value={settings.theme}
                        onChange={actions.setTheme}
                    />
                </SettingsSection>
            </div>
        </div>
    );
}


function SettingsSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-2">
            <h2 className="text-sm text-gray-400">{title}</h2>
            {children}
        </div>
    );
}

function QthStatus({
    grid,
    lat,
    lon,
}: {
    grid: string | null;
    lat?: number | null;
    lon?: number | null;
}) {
    if (!grid) {
        return <span>No QTH set</span>;
    }

    if (!validateGrid(grid)) {
        return <span className="text-yellow-400">Invalid grid square</span>;
    }

    if (lat == null || lon == null) {
        return <span className="text-yellow-400">Invalid grid square</span>;
    }

    return (
        <a 
            href={`https://www.google.com/maps?q=${lat},${lon}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:underline"
        >
            <span className="text-green-400">
                Lat {lat.toFixed(6)}, Lon {lon.toFixed(6)}
            </span>
        </a>
    );
}

function DistanceUnitSwitch({
    value,
    onChange,
}: {
    value: DistanceUnit;
    onChange: (unit: DistanceUnit) => void;
}) {
    const checked = value === 'mi';

    return (
        <div className="flex items-center gap-3">
            <span
                className={`text-sm ${value === 'km' ? 'text-white font-semibold' : 'text-gray-400'
                    }`}
            >
                km
            </span>

            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    id="distanceUnitSwitch"
                    type="checkbox"
                    checked={checked}
                    onChange={e => onChange(e.target.checked ? 'mi' : 'km')}
                    className="sr-only peer"
                    aria-label="Distance unit"
                    aria-valuetext={checked ? 'Miles' : 'Kilometers'}
                />

                {/* track */}
                <div
                    className="
                        w-11 h-6 rounded-full
                        bg-gray-700
                        peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500
                    "
                />

                {/* thumb */}
                <div
                    className="
                        absolute left-1 top-1
                        w-4 h-4 rounded-full
                        bg-white
                        transition-transform
                        peer-checked:translate-x-5
                    "
                />
            </label>

            <span
                className={`text-sm ${value === 'mi' ? 'text-white font-semibold' : 'text-gray-400'
                    }`}
            >
                mi
            </span>
        </div>
    );
}

function ThemeSelector({ value, onChange }: { value: Theme; onChange: (theme: Theme) => void }) {
    return (
        <select
            id="themeSelector"
            value={value}
            onChange={e => onChange(e.target.value as Theme)}
            className="w-full px-3 py-2 rounded bg-(--bg-muted) border border-(--border)"
        >
            <option value="system">System</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
        </select>
    );
}

function LanguageSelector({ value, onChange }: { value: Language; onChange: (lang: Language) => void }) {
    const languages = LanguageUtils.getAvailableLanguages();
    return (
        <select
            id="languageSelector"
            value={value}
            onChange={e => onChange(e.target.value as Language)}
            className="w-full px-3 py-2 rounded bg-(--bg-muted) border border-(--border)"
        >
            {languages.map(lang => (
                <option key={lang} value={lang}>{LanguageUtils.getLabel(lang)}</option>
            ))}
        </select>
    );
}