import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { logoutApi } from '@/UI/auth/MainComponents/core/auth-api'
import type { AuthUser, LoginResult } from '@/UI/auth/MainComponents/core/types'

const AUTH_TOKEN_KEY = 'onee_auth_token'
const AUTH_REFRESH_KEY = 'onee_refresh_token'
const AUTH_USER_KEY = 'onee_auth_user'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (result: LoginResult, rememberMe: boolean) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
  const raw =
    localStorage.getItem(AUTH_USER_KEY) ?? sessionStorage.getItem(AUTH_USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

function hasStoredToken(): boolean {
  return Boolean(
    localStorage.getItem(AUTH_TOKEN_KEY) ?? sessionStorage.getItem(AUTH_TOKEN_KEY),
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())
  const [isLoading] = useState(false)

  const login = useCallback((result: LoginResult, rememberMe: boolean) => {
    const storage = rememberMe ? localStorage : sessionStorage
    const otherStorage = rememberMe ? sessionStorage : localStorage

    otherStorage.removeItem(AUTH_TOKEN_KEY)
    otherStorage.removeItem(AUTH_REFRESH_KEY)
    otherStorage.removeItem(AUTH_USER_KEY)

    const authUser: AuthUser = {
      userName: result.userName,
      email: result.email,
      role: result.role,
    }

    storage.setItem(AUTH_TOKEN_KEY, result.token)
    storage.setItem(AUTH_REFRESH_KEY, result.refreshToken)
    storage.setItem(AUTH_USER_KEY, JSON.stringify(authUser))

    setUser(authUser)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutApi()
    } catch {
      // Always clear local session even if the API call fails.
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(AUTH_REFRESH_KEY)
      localStorage.removeItem(AUTH_USER_KEY)
      sessionStorage.removeItem(AUTH_TOKEN_KEY)
      sessionStorage.removeItem(AUTH_REFRESH_KEY)
      sessionStorage.removeItem(AUTH_USER_KEY)
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user) && hasStoredToken(),
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
