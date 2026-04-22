export const env = {
  VITE_API_URL: import.meta.env.VITE_API_URL as string,
  VITE_AUTH_CENTRAL_URL: import.meta.env.VITE_AUTH_CENTRAL_URL as string,
  VITE_ENABLE_MOCKING: import.meta.env.VITE_ENABLE_MOCKING === 'true',
}
