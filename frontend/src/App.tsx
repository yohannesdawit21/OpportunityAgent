import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RequireAnalysis } from './components/routes/RequireAnalysis';
import { AppProvider } from './context';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { NetworkPage } from './pages/NetworkPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ProfilePage } from './pages/ProfilePage';
import { ScanningPage } from './pages/ScanningPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OnboardingPage />} />
          <Route path="/onboarding" element={<Navigate to="/" replace />} />
          <Route
            path="/scanning"
            element={
              <RequireAnalysis mode="running-only">
                <ScanningPage />
              </RequireAnalysis>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAnalysis mode="complete-only">
                <DashboardPage />
              </RequireAnalysis>
            }
          />
          <Route
            path="/leads"
            element={
              <RequireAnalysis mode="complete-only">
                <LeadsPage />
              </RequireAnalysis>
            }
          />
          <Route
            path="/network"
            element={
              <RequireAnalysis mode="complete-only">
                <NetworkPage />
              </RequireAnalysis>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAnalysis mode="complete-only">
                <ProfilePage />
              </RequireAnalysis>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
