import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react'
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'
import type { AuthState, GoogleUserProfile } from '#/types/auth'
import { clearAuthState, loadAuthState, saveAuthState } from '#/lib/auth-storage'

type AuthAction =
  | { type: 'LOGIN'; user: GoogleUserProfile; accessToken: string; tokenExpiry: number }
  | { type: 'LOGOUT' }
  | { type: 'TOKEN_EXPIRED' }
  | { type: 'LOADING' }

type AuthContextValue = {
  state: AuthState
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const NOOP_AUTH: AuthContextValue = {
  state: { status: 'idle', user: null, accessToken: null, tokenExpiry: null },
  login: () => {},
  logout: () => {},
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        status: 'authenticated',
        user: action.user,
        accessToken: action.accessToken,
        tokenExpiry: action.tokenExpiry,
      }
    case 'LOGOUT':
      return { status: 'idle', user: null, accessToken: null, tokenExpiry: null }
    case 'TOKEN_EXPIRED':
      return { ...state, status: 'expired', accessToken: null, tokenExpiry: null }
    case 'LOADING':
      return { ...state, status: 'loading' }
  }
}

function AuthProviderInner({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, undefined, loadAuthState)

  const handleLoginSuccess = useCallback(
    async (accessToken: string, expiresIn: number) => {
      const tokenExpiry = Date.now() + expiresIn * 1000

      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (!res.ok) {
        console.error('Failed to fetch user profile:', res.status)
        dispatch({ type: 'TOKEN_EXPIRED' })
        return
      }

      const user = (await res.json()) as GoogleUserProfile

      saveAuthState(user, accessToken, tokenExpiry)
      dispatch({ type: 'LOGIN', user, accessToken, tokenExpiry })
    },
    [],
  )

  const requestToken = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid profile email',
    onSuccess: (tokenResponse) => {
      handleLoginSuccess(tokenResponse.access_token, tokenResponse.expires_in)
    },
    onError: (error) => {
      console.error('Google login error:', error)
      dispatch({ type: 'TOKEN_EXPIRED' })
    },
  })

  const login = useCallback(() => {
    dispatch({ type: 'LOADING' })
    requestToken()
  }, [requestToken])

  const logout = useCallback(() => {
    clearAuthState()
    dispatch({ type: 'LOGOUT' })
  }, [])

  // Token expiry timer — attempt silent re-auth, fall back to expired state
  useEffect(() => {
    if (!state.tokenExpiry || !state.accessToken) return

    const remaining = state.tokenExpiry - Date.now()
    if (remaining <= 0) {
      requestToken({ prompt: '' })
      return
    }

    const timer = setTimeout(() => {
      requestToken({ prompt: '' })
    }, remaining)

    return () => clearTimeout(timer)
  }, [state.tokenExpiry, state.accessToken, requestToken])

  // If status is expired on mount (loaded from storage), attempt silent re-auth
  useEffect(() => {
    if (state.status === 'expired') {
      requestToken({ prompt: '' })
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value: AuthContextValue = {
    state,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  if (!clientId) {
    // No client ID configured — render children without auth
    return <>{children}</>
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </GoogleOAuthProvider>
  )
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext) ?? NOOP_AUTH
}
