import { type AuthState, type GoogleUserProfile, GoogleUserProfileSchema } from '#/types/auth'

const KEYS = {
  user: 'cakeculator-auth-user',
  token: 'cakeculator-auth-token',
  tokenExpiry: 'cakeculator-auth-token-expiry',
} as const

const LOGGED_OUT: AuthState = {
  status: 'idle',
  user: null,
  accessToken: null,
  tokenExpiry: null,
}

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

  if (!userJson) return LOGGED_OUT

  let userRaw: unknown
  try {
    userRaw = JSON.parse(userJson)
  } catch {
    console.warn('[cakeculator] invalid auth user JSON in storage; using defaults')
    return LOGGED_OUT
  }

  const userResult = GoogleUserProfileSchema.safeParse(userRaw)
  if (!userResult.success) {
    console.warn(
      '[cakeculator] invalid auth user shape in storage; using defaults',
      userResult.error.issues,
    )
    return LOGGED_OUT
  }
  const user = userResult.data

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
