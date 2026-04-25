import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { analytics } from './index'

/**
 * Mount inside <BrowserRouter> to fire `page_view` on every route change.
 * Render `null` — chỉ là một subscriber.
 */
export const RouteTracker: React.FC = () => {
  const location = useLocation()

  useEffect(() => {
    analytics.pageView(location.pathname + location.search, document.title)
  }, [location.pathname, location.search])

  return null
}
