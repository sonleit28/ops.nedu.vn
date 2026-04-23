import { create } from 'zustand'

// Toast góc phải dưới — trước đây local trong App.tsx (hard-coded setTimeout).
// Lift lên đây để useLeadStream / useCatchUpNotifications push toast độc lập
// với App component. 1 toast hiển thị mỗi lúc; queue pending để stagger khi
// có nhiều toast dồn về (live: 1 lúc, rule n=1).

export interface Toast {
  id: string
  icon: string
  text: string
  sub: string
}

interface NotificationState {
  current: Toast | null
  queue: Toast[]
  push(toast: Omit<Toast, 'id'>): void
  dismiss(): void
}

// Thời gian hiển thị 1 toast trước khi dismiss + pop queue (ms).
// 3500ms khớp timing cũ + trigger mark-seen đúng spec ("seen khi toast hiển thị xong").
const TOAST_DURATION_MS = 3500

let timer: ReturnType<typeof setTimeout> | null = null

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  current: null,
  queue: [],
  push: (toast) => {
    const withId: Toast = { ...toast, id: crypto.randomUUID() }
    const state = get()
    if (state.current) {
      // Đang hiển thị 1 cái → xếp hàng.
      set({ queue: [...state.queue, withId] })
      return
    }
    // Free slot → hiển thị ngay, schedule dismiss.
    set({ current: withId })
    clearTimer()
    timer = setTimeout(() => get().dismiss(), TOAST_DURATION_MS)
  },
  dismiss: () => {
    clearTimer()
    const state = get()
    const [next, ...rest] = state.queue
    if (next) {
      set({ current: next, queue: rest })
      timer = setTimeout(() => get().dismiss(), TOAST_DURATION_MS)
    } else {
      set({ current: null })
    }
  },
}))
