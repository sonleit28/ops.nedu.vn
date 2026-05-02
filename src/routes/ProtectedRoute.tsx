import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@modules/auth/stores/useAuthStore'
import type { Role } from '@shared/types/auth'

// Roles cho phép truy cập ops portal — sync với BE OPS_ROLES
// (nedu-backend/src/modules/ops/constants.ts).
const OPS_ROLES: Role[] = ['consultant', 'leader', 'admin', 'owner']

export const ProtectedRoute: React.FC = () => {
  const { user, isLoading, logout } = useAuthStore()

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

  // User logged-in nhưng không có ops role → block dashboard.
  // Render forbidden inline + button logout (không auto-logout để
  // tránh loop khi auth-central trả token với role sai).
  if (!user.roles.some(r => OPS_ROLES.includes(r))) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 420, textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--stone2)', borderRadius: 12, padding: '32px 28px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🚫</div>
          <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Không có quyền truy cập</h1>
          <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 20 }}>
            Tài khoản <strong>{user.email}</strong> chưa được cấp quyền vào ops portal.
            Liên hệ leader / admin để được cấp role phù hợp.
          </p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => { void logout() }}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    )
  }

  return <Outlet />
}
