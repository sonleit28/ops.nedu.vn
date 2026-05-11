const ACCESS_KEY = 'nlh_access_token'
const REFRESH_KEY = 'nlh_refresh_token'

export interface TokenPair {
  access_token: string
  refresh_token: string
}

export const tokenStorage = {
  getAccess(): string | null {
    return localStorage.getItem(ACCESS_KEY)
  },
  getRefresh(): string | null {
    return localStorage.getItem(REFRESH_KEY)
  },
  set(tokens: TokenPair) {
    localStorage.setItem(ACCESS_KEY, tokens.access_token)
    localStorage.setItem(REFRESH_KEY, tokens.refresh_token)
  },
  setAccess(token: string) {
    localStorage.setItem(ACCESS_KEY, token)
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
  has(): boolean {
    return !!localStorage.getItem(ACCESS_KEY)
  },
}
