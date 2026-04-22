import React, { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@modules/auth/stores/useAuthStore'

/**
 * Handles the redirect back from auth-central after OAuth.
 * auth-central returns tokens in the URL fragment:
 *   /auth-callback#access_token=...&refresh_token=...&token_type=Bearer
 * Fragments are never sent to the server, so tokens stay client-side only.
 */
export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate()
  const { acceptTokens } = useAuthStore()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const hash = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash
      const params = new URLSearchParams(hash)
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')
      const err = params.get('error')

      if (err || !access_token || !refresh_token) {
        if (!cancelled) setFailed(true)
        return
      }

      try {
        await acceptTokens({ access_token, refresh_token })
        if (cancelled) return
        // Wipe the fragment from history so tokens aren't visible in the URL bar.
        window.history.replaceState(null, '', '/auth-callback')
        navigate('/dashboard', { replace: true })
      } catch {
        if (!cancelled) setFailed(true)
      }
    }

    run()
    return () => { cancelled = true }
  }, [acceptTokens, navigate])

  if (failed) return <Navigate to="/login" replace />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div className="pl-spin" />
      <span style={{ color: 'var(--stone)', fontSize: 13 }}>Đang đăng nhập…</span>
    </div>
  )
}
