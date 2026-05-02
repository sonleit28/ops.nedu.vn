export const env = {
  VITE_API_URL: import.meta.env.VITE_API_URL as string,
  VITE_AUTH_CENTRAL_URL: import.meta.env.VITE_AUTH_CENTRAL_URL as string,
  VITE_ENABLE_MOCKING: import.meta.env.VITE_ENABLE_MOCKING === 'true',
  VITE_GA4_ID: (import.meta.env.VITE_GA4_ID as string | undefined) ?? '',
  VITE_CLARITY_ID: (import.meta.env.VITE_CLARITY_ID as string | undefined) ?? '',
  IS_DEV: import.meta.env.DEV,
}
