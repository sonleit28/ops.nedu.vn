type GtagFn = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: GtagFn
  }
}

let measurementId = ''

export const ga4 = {
  load(id: string) {
    if (!id || window.gtag) return
    measurementId = id

    window.dataLayer = window.dataLayer || []
    const gtag: GtagFn = (...args) => {
      window.dataLayer!.push(args)
    }
    window.gtag = gtag

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
    document.head.appendChild(script)

    gtag('js', new Date())
    // SPA: tự fire page_view, không để gtag tự fire lúc load.
    gtag('config', id, { send_page_view: false })
  },

  pageView(path: string, title?: string) {
    if (!window.gtag || !measurementId) return
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
      page_location: window.location.origin + path,
    })
  },

  identify(userId: string, properties?: Record<string, unknown>) {
    if (!window.gtag || !measurementId) return
    window.gtag('config', measurementId, {
      user_id: userId,
      send_page_view: false,
      ...(properties ? { user_properties: properties } : {}),
    })
  },

  reset() {
    if (!window.gtag || !measurementId) return
    window.gtag('config', measurementId, { user_id: null, send_page_view: false })
  },

  event(name: string, params?: Record<string, unknown>) {
    if (!window.gtag) return
    window.gtag('event', name, params ?? {})
  },
}
