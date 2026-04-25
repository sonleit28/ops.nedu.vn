import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '@modules/auth/pages/LoginPage'
import { AuthCallbackPage } from '@modules/auth/pages/AuthCallbackPage'
import App from '../App'
import { useAuthStore } from '@modules/auth/stores/useAuthStore'
import { queryClient } from '@shared/config/query-client'
import { RouteTracker } from '@shared/analytics/RouteTracker'

// App.tsx owns the full v6 UI (topbar + panels + modals) — giữ nguyên từ commit ab61c17.
const AppLayout: React.FC = () => <App />

const AppInit: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initialize } = useAuthStore()
  useEffect(() => { initialize() }, [initialize])
  return <>{children}</>
}

export const AppRouter: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppInit>
          <RouteTracker />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth-callback" element={<AuthCallbackPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<AppLayout />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppInit>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
