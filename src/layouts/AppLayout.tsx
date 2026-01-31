// src/layouts/AppLayout.tsx
import { Outlet, Link } from 'react-router-dom';
import { useI18n } from '../i18n/useI18n';

export default function AppLayout() {
    const { t } = useI18n();

    return (
        <div className="h-screen flex flex-col bg-(--bg-main) text-(--text-main)">
            {/* Global header */}
            <header
                className="
                    sticky top-0 z-30
                    h-12 px-4
                    flex items-center justify-between
                    bg-gray-900 border-b border-gray-800
                "
            >
                {/* Left: App identity */}
                <div className="font-semibold tracking-wide">
                    📡 {t('app.title')}
                </div>

                {/* Right: Global actions */}
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
            </header>

            {/* Page content */}
            <div className="flex-1 overflow-hidden">
                <Outlet />
            </div>
        </div>
    );
}
