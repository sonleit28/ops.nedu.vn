import React, { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '@shared/config/supabase'
import { useAuthStore } from '@modules/auth/stores/useAuthStore'

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, isLoading } = useAuthStore()

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!cancelled && session) {
        navigate('/dashboard', { replace: true })
      }
    }
    run()

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return
      if (event === 'SIGNED_IN' && session) {
        navigate('/dashboard', { replace: true })
      }
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [navigate])

  if (!isLoading && !user) {
    // No session after Supabase processed the URL — send back to login
    const hasAuthParams = window.location.hash.includes('access_token') || window.location.search.includes('code=')
    if (!hasAuthParams) {
      return <Navigate to="/login" replace />
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div className="pl-spin" />
      <span style={{ color: 'var(--stone)', fontSize: 13 }}>Đang đăng nhập…</span>
    </div>
  )
}
