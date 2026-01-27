// src/layouts/SpotsLayout.tsx

import { useState, useEffect, ReactNode } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

type SpotsLayoutProps = {
    filters: ReactNode;
    content: ReactNode;
};

export default function SpotsLayout({ filters, content }: SpotsLayoutProps) {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [filtersOpen, setFiltersOpen] = useState(isDesktop);

    // Sync when switching between mobile / desktop
    useEffect(() => {
        setFiltersOpen(isDesktop);
    }, [isDesktop]);

    return (
        <div className="h-full flex overflow-hidden bg-(--bg-primary) text-(--text-primary)">
            {/* Mobile overlay */}
            {filtersOpen && !isDesktop && (
                <div
                    className="fixed inset-0 bg-black/50 z-10"
                    onClick={() => setFiltersOpen(false)}
                />
            )}

            {/* Filters panel */}
            {filtersOpen && (
                <aside
                    className="
                        w-80 shrink-0
                        bg-(--bg-panel)
                        border-r border-(--border)
                        fixed inset-y-0 left-0 z-20
                        md:static md:z-auto
                        overflow-y-auto
                    "
                >
                    {/* Mobile close header */}
                    {!isDesktop && (
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
                                ✕ Close
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
                {!isDesktop && (
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
                        >
                            ☰ Filters
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
