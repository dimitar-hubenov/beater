// src/components/SpotsTable.tsx
import type { ReactNode } from 'react';
import { useState, useMemo } from 'react';
import { SpotUI } from '../types/spot';
import type { SpotSource } from '../types/spotSource';
import { formatTimeAge } from '../utils/time';
import { useUserSettings } from '../settings/useUserSettings';
import { sortSpots, getInitialSortConfig, getNextSortDirection, type SortConfig } from '../utils/spotSorting';
import { formatCallsign } from '../utils/callsign';
import { DistanceUnit } from '../types/userSettings';
import { useI18n } from '../i18n/useI18n';

type Column<T> = {
    key: string;
    label: string;
    sortable: boolean;
    render: (row: T) => ReactNode;
    align?: 'left' | 'center' | 'right';
    className?: string;
};

type SpotsTableProps = {
    spots: SpotUI[];
    loading: boolean;
};

export default function SpotsTable({ spots, loading = false }: SpotsTableProps) {
    const { t } = useI18n();

    const { settings } = useUserSettings();
    const showDistance = Boolean(settings.qthLat && settings.qthLon);

    const [sortConfig, setSortConfig] = useState<SortConfig>(getInitialSortConfig());

    const handleSort = (key: string) => {
        const col = columns.find(c => c.key === key);
        if (!col?.sortable) return;

        setSortConfig(currentConfig => {
            const nextDirection = getNextSortDirection(
                currentConfig.key,
                key,
                currentConfig.direction
            );

            return {
                key,
                direction: nextDirection
            };
        });
    };

    const sortedSpots = useMemo(() => {
        return sortSpots(spots, sortConfig);
    }, [spots, sortConfig]);

    if (spots.length === 0) {
        if (loading) {
            return (
                <div className={`min-h-screen flex items-center justify-center`}>
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-(--text-primary)">{t('spots.results.loading.message')}</p>
                    </div>
                </div>
            );
        }

        // not loading, but list is empty
        return (
            <div className="p-12 text-center">
                <div className="text-(--text-primary) mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-(--text-primary) mb-2">{t('spots.results.noSpots.title')}</h3>
                <p className="text-(--text-muted)">{t('spots.results.noSpots.message')}</p>
            </div>
        );
    }

    // contant is needed for conditional column
    const distanceColumn: Column<SpotUI> = 
        { key: 'distance', label: t('spots.results.tableColumns.distance.label'), sortable: true, render: s => formatDistance(s.distanceKm, settings.distanceUnit), align: 'right', className: 'w-1' };

    const columns: Column<SpotUI>[] = [
        { key: 'activator', label: t('spots.results.tableColumns.activator.label'), sortable: true, render: s => formatCallsign(s.activator), align: 'center', className: 'font-mono w-1' },
        { key: 'program', label: t('spots.results.tableColumns.program.label'), sortable: true, render: s => <ProgramBadge program={s.program} />, className: 'w-1' },
        { key: 'reference', label: t('spots.results.tableColumns.reference.label'), sortable: true, render: s => s.reference, align: 'center', className: 'font-mono w-1' },
        { key: 'frequency', label: t('spots.results.tableColumns.frequency.label'), sortable: true, render: s => formatFreq(s.frequency), align: 'right', className: 'font-mono w-1' },
        { key: 'mode', label: t('spots.results.tableColumns.mode.label'), sortable: true, render: s => s.mode, align: 'center', className: 'w-1' },
        ...(showDistance ? [distanceColumn] : []),
        { key: 'time', label: t('spots.results.tableColumns.time.label'), sortable: true, render: s => formatTimeAge(s.time), align: 'right', className: 'w-1 ' },
        { key: 'spotter', label: t('spots.results.tableColumns.spotter.label'), sortable: true, render: s => s.spotter, align: 'center', className: 'font-mono w-1' },
        { key: 'comments', label: t('spots.results.tableColumns.comments.label'), sortable: false, render: s => s.comments, className: 'truncate max-w-[24rem]' }
    ];

    return (
        <table className="w-full table-auto border-separate border-spacing-0 text-sm">
            <thead>
                <tr>
                    {columns.map(col => (
                        <th
                            key={col.key}
                            onClick={col.sortable ? () => handleSort(col.key) : undefined}
                            className={`
                                sticky top-0 z-20
                                border-b border-gray-700
                                px-2 py-2 text-sm
                                text-left
                                ${col.sortable ? 'cursor-pointer' : 'cursor-default'}
                                ${
                                    col.sortable && sortConfig.key === col.key
                                        ? 'bg-blue-900 text-white shadow-inner'
                                        : col.sortable
                                            ? 'bg-gray-800 text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                                            : 'bg-gray-800 text-gray-500'
                                }
                            `}
                        >
                            <div className="flex items-center justify-between">
                                <span>{col.label}</span>

                                {col.sortable && (
                                    <span
                                        className={`
                                            ml-2 w-4 text-center text-sm font-bold
                                            ${sortConfig.key === col.key
                                                ? 'text-blue-300'
                                                : 'text-gray-500'}
                                        `}
                                    >
                                        {sortConfig.key === col.key
                                            ? sortConfig.direction === 'asc'
                                                ? '↑'
                                                : '↓'
                                            : '↕'}
                                    </span>
                                )}
                            </div>
                        </th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {sortedSpots.map(spot => (
                    <tr key={spot.id} className="hover:bg-(--table-row-hover)">
                        {columns.map(col => (
                            <td
                                key={col.key}
                                className={`
                                    px-1.5 py-1.5 border-b border-gray-700
                                    whitespace-pre text-nowrap
                                    ${col.align === 'right'
                                        ? 'text-right'
                                        : col.align === 'center'
                                            ? 'text-center'
                                            : 'text-left'}
                                    ${col.className ?? ''}
                                `}
                            >
                                {col.render(spot)}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

/* ---------- helpers ---------- */

function formatFreq(freq: number | null | undefined): string {
    if (freq == null || isNaN(freq)) return '—';

    const mhz = Math.floor(freq / 1000);
    const khzTotal = freq % 1000;
    const khz = Math.floor(khzTotal);
    const hundredHz = Math.round((khzTotal - khz) * 10);

    return `${mhz}.${khz.toString().padStart(3, '0')}.${hundredHz}`;
}

function formatDistance(
    distanceKm: number | null | undefined,
    unit: DistanceUnit,
): string {
    if (distanceKm == null) return '—';
    if (unit === 'mi') {
        return `${(distanceKm * 0.621371).toFixed(0)} mi`;
    }

    return `${distanceKm.toFixed(0)} km`;
}

function ProgramBadge({ program }: { program: SpotSource }) {
    const colors = {
        POTA: 'bg-green-700',
        SOTA: 'bg-blue-700',
        WWFF: 'bg-purple-700',
    };

    return (
        <span
            className={`px-2 py-0.5 rounded text-xs text-white font-mono ${colors[program] ?? 'bg-gray-600'}`}
        >
            {program}
        </span>
    );
}
