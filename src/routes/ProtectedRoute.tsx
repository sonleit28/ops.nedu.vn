import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@modules/auth/stores/useAuthStore'

export const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div className="pl-spin" />
        <span style={{ color: 'var(--stone)', fontSize: 13 }}>Đang tải…</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
