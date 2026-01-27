// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import SpotsPage from './pages/SpotsPage';
import SettingsPage from './pages/SettingsPage';
import { UserSettingsProvider } from './settings/UserSettingsProvider';
import { useUserSettings } from './settings/useUserSettings';
import { I18nProvider } from './i18n/I18nProvider';
import { SpotsRuntimeProvider } from './spotSources/SpotsRuntimeProvider';

function AppContent() {
  const { settings } = useUserSettings();

  return (
    <I18nProvider language={settings.language}>
      <SpotsRuntimeProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<SpotsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SpotsRuntimeProvider>
    </I18nProvider>
  );
}

function App() {
  return (
    <UserSettingsProvider>
      <AppContent />
    </UserSettingsProvider>
  );
}

export default App;
