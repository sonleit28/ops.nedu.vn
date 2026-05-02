// Vite mode: 'development' khi npm run dev, 'production' khi vite build.
// Chỉ 2 mode hợp lệ — không có 'staging' (chưa có pipeline tương ứng).
//
// Vite spec yêu cầu env var phía client phải có prefix VITE_*. Trong
// file này drop prefix khi expose ra ngoài để consumer đọc gọn:
// VITE_API_URL → env.API_URL, VITE_GA4_ID → env.GA4_ID, ...
const MODE = import.meta.env.MODE

export const env = {
  API_URL: import.meta.env.VITE_API_URL as string,
  AUTH_CENTRAL_URL: import.meta.env.VITE_AUTH_CENTRAL_URL as string,
  GA4_ID: (import.meta.env.VITE_GA4_ID as string | undefined) ?? '',
  CLARITY_ID: (import.meta.env.VITE_CLARITY_ID as string | undefined) ?? '',
  IS_DEV: MODE !== 'production',
  IS_PROD: MODE === 'production',
  IS_MOCK: import.meta.env.VITE_ENABLE_MOCKING === 'true',
}
