import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../features/auth/LoginPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { TopBar } from '../shared/components/TopBar';
import { KpiPanel } from '../features/kpi/KpiPanel';

const AppLayout: React.FC = () => {
  const [showKpi, setShowKpi] = React.useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-900">
      <TopBar onKpiClick={() => setShowKpi(true)} />
      <DashboardPage />
      {showKpi && <KpiPanel onClose={() => setShowKpi(false)} />}
    </div>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<AppLayout />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
