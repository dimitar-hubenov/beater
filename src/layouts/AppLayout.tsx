// src/layouts/AppLayout.tsx
import { Outlet, Link } from 'react-router-dom';
import { useI18n } from '../i18n/useI18n';
import { useState } from 'react';
import { FiltersContext } from '../context/FiltersContext';

export default function AppLayout() {
  const { t } = useI18n();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggleFilters = () => setFiltersOpen((prev) => !prev);

  return (
    <FiltersContext.Provider value={{ filtersOpen, setFiltersOpen }}>
      <div className="h-screen flex flex-col bg-(--bg-main) text-(--text-main)">
        {/* Global header */}
        <header
          className="
            sticky top-0 z-30
            h-12 px-4
            flex items-center justify-center
            bg-gray-900 border-b border-gray-800
            relative
          "
        >
          {/* Left‑side actions (Filters button) */}
          <div className="absolute inset-y-0 left-4 flex items-center">
            <button
              onClick={toggleFilters}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition"
              aria-expanded={filtersOpen}
              aria-controls="filters-panel"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18M3 12h12M3 18h6" />
              </svg>
              {t('filters.btnFilters.label')}
            </button>
          </div>

          {/* Centered title */}
          <div className="font-semibold tracking-wide text-white">
            📡 {t('app.title')}
          </div>

          {/* Right‑side actions (Settings link) */}
          <div className="absolute inset-y-0 right-4 flex items-center">
            <Link
              to="/settings"
              className="
                text-sm text-gray-400
                hover:text-white
                transition
              "
            >
              ⚙ {t('settings.btnSettings.label')}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </FiltersContext.Provider>
  );
}
