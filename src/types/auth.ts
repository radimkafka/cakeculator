export type GoogleUserProfile = {
  sub: string
  name: string
  email: string
  picture?: string
}

export type AuthState = {
  status: 'idle' | 'loading' | 'authenticated' | 'expired'
  user: GoogleUserProfile | null
  accessToken: string | null
  tokenExpiry: number | null
}
