// src/layouts/SpotsLayout.tsx

import { useState, ReactNode } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useI18n } from '../i18n/useI18n';

type SpotsLayoutProps = {
    filters: ReactNode;
    content: ReactNode;
};

export default function SpotsLayout({ filters, content }: SpotsLayoutProps) {
    const { t } = useI18n();
    // Unified visibility state: panel hidden by default, togglable on all devices
    const [filtersOpen, setFiltersOpen] = useState(false);

    return (
        <div className="h-full flex overflow-hidden bg-(--bg-primary) text-(--text-primary)">
            {/* Mobile overlay */}
            {filtersOpen && (
                <div className="md:hidden">
                    <div
                        className="fixed inset-0 bg-black/50 z-10"
                        onClick={() => setFiltersOpen(false)}
                    />
                </div>
            )}

            {/* Filters panel */}
            {filtersOpen && (
                <aside id="filters-panel"
                    className="
                        w-80 shrink-0
                        bg-(--bg-panel)
                        border-r border-(--border)
                        fixed inset-y-0 left-0 z-30
                        md:static md:z-auto
                        flex flex-col h-full overflow-y-auto
                    "
                >
                    {/* Mobile close header */}
                    {(
                        <div
                            className="
                                sticky top-0 z-10
                                p-2
                                bg-(--bg-panel)
                                border-b border-(--border)
                            "
                        >
                            <button
                                onClick={() => setFiltersOpen(false)}
                                className="
                                    px-2 py-1 rounded
                                    bg-(--bg-btn)
                                    hover:bg-(--bg-btn-hover)
                                    transition
                                "
                            >
                                ✕ {t('filters.btnClose.label')}
                            </button>
                        </div>
                    )}

                    <div className="p-3 space-y-4">
                        {filters}
                    </div>
                </aside>
            )}

            {/* Main results area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile filters button */}
                { !filtersOpen && (
                    <div
                        className="
                            sticky top-0 z-10
                            p-2
                            bg-(--bg-main)
                            border-b border-(--border)
                        "
                    >
                        <button
                            onClick={() => setFiltersOpen(true)}
                            className="
                                px-3 py-1 rounded
                                bg-(--bg-btn)
                                hover:bg-(--bg-btn-hover)
                                transition
                            "
                            aria-expanded={filtersOpen}
                            aria-controls="filters-panel"
                        >
                            ☰ {t('filters.btnFilters.label')}
                        </button>
                    </div>
                )}

                {/* Results scroll */}
                <main className="flex-1 overflow-y-auto">
                    {content}
                </main>
            </div>
        </div>
    );
}
