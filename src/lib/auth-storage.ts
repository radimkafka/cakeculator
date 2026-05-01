import type { AuthState, GoogleUserProfile } from '#/types/auth'

const KEYS = {
  user: 'cakeculator-auth-user',
  token: 'cakeculator-auth-token',
  tokenExpiry: 'cakeculator-auth-token-expiry',
} as const

export function saveAuthState(
  user: GoogleUserProfile,
  accessToken: string,
  tokenExpiry: number,
): void {
  localStorage.setItem(KEYS.user, JSON.stringify(user))
  localStorage.setItem(KEYS.token, accessToken)
  localStorage.setItem(KEYS.tokenExpiry, String(tokenExpiry))
}

export function loadAuthState(): AuthState {
  const userJson = localStorage.getItem(KEYS.user)
  const token = localStorage.getItem(KEYS.token)
  const expiryStr = localStorage.getItem(KEYS.tokenExpiry)

  if (!userJson) {
    return { status: 'idle', user: null, accessToken: null, tokenExpiry: null }
  }

  const user = JSON.parse(userJson) as GoogleUserProfile
  const tokenExpiry = expiryStr ? Number(expiryStr) : null

  if (!token || !tokenExpiry || Date.now() >= tokenExpiry) {
    return { status: 'expired', user, accessToken: null, tokenExpiry: null }
  }

  return { status: 'authenticated', user, accessToken: token, tokenExpiry }
}

export function clearAuthState(): void {
  localStorage.removeItem(KEYS.user)
  localStorage.removeItem(KEYS.token)
  localStorage.removeItem(KEYS.tokenExpiry)
}
