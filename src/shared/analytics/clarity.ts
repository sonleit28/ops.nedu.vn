import Clarity from '@microsoft/clarity'

let initialized = false

export const clarity = {
  load(id: string) {
    if (!id || initialized) return
    Clarity.init(id)
    initialized = true
  },

  identify(userId: string, sessionId?: string, pageId?: string, friendlyName?: string) {
    if (!initialized) return
    Clarity.identify(userId, sessionId, pageId, friendlyName)
  },

  setTag(key: string, value: string | string[]) {
    if (!initialized) return
    Clarity.setTag(key, value)
  },

  event(name: string) {
    if (!initialized) return
    Clarity.event(name)
  },

  /**
   * Force prioritize current session for recording. Dùng cho hành động
   * quan trọng cần xem lại (vd: enrollment confirm flow).
   */
  upgrade(reason: string) {
    if (!initialized) return
    Clarity.upgrade(reason)
  },
}
