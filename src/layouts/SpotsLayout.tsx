// src/layouts/SpotsLayout.tsx
import { ReactNode } from 'react';
import { useI18n } from '../i18n/useI18n';
import { useFilters } from '../context/FiltersContext';

type SpotsLayoutProps = {
  filters: ReactNode;
  content: ReactNode;
};

export default function SpotsLayout({ filters, content }: SpotsLayoutProps) {
  const { t } = useI18n();
  const { filtersOpen, setFiltersOpen } = useFilters();

  return (
    <div className="h-full flex overflow-hidden bg-(--bg-primary) text-(--text-primary)">
      {/* Mobile overlay – starts below the global header (h-12) */}
      {filtersOpen && (
        <div className="md:hidden">
          <div
            className="fixed top-12 inset-x-0 bottom-0 bg-black/50 z-10"
            onClick={() => setFiltersOpen(false)}
          />
        </div>
      )}

      {/* Filters panel – starts below the global header */}
      {filtersOpen && (
        <aside
          id="filters-panel"
          className={`
            w-80 shrink-0
            bg-(--bg-panel)
            border-r border-(--border)
            fixed top-12 inset-x-0 bottom-0 left-0 z-30
            md:static md:z-auto
            flex flex-col h-full overflow-y-auto
          `}
        >
          {/* Panel content */}
          <div className="p-3 space-y-4">{filters}</div>
        </aside>
      )}

      {/* Main results area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Results scroll */}
        <main className="flex-1 overflow-y-auto">{content}</main>
      </div>
    </div>
  );
}
