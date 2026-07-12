import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

type AuthResponse = Promise<{ error: string | null }>

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => AuthResponse
  signUp: (email: string, password: string) => AuthResponse
  signOut: () => AuthResponse
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function getAuthErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) return error.message

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }

  return fallback
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const initializeSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (!isMounted) return

        if (error) {
          console.error('Failed to restore Supabase session:', error.message)
          setSession(null)
          setUser(null)
        } else {
          setSession(data.session)
          setUser(data.session?.user ?? null)
        }
      } catch (error) {
        if (isMounted) {
          console.error('Unexpected auth initialization error:', error)
          setSession(null)
          setUser(null)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initializeSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    const signIn = async (email: string, password: string) => {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error ? error.message : null }
      } catch (error) {
        return { error: getAuthErrorMessage(error, 'Unable to sign in. Please try again.') }
      }
    }

    const signUp = async (email: string, password: string) => {
      try {
        const { error } = await supabase.auth.signUp({ email, password })
        return { error: error ? error.message : null }
      } catch (error) {
        return { error: getAuthErrorMessage(error, 'Unable to create your account. Please try again.') }
      }
    }

    const signOut = async () => {
      try {
        const { error } = await supabase.auth.signOut()
        return { error: error ? error.message : null }
      } catch (error) {
        return { error: getAuthErrorMessage(error, 'Unable to sign out. Please try again.') }
      }
    }

    return {
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
    }
  }, [loading, session, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
