"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  role: "Owner" | "Admin" | "Operator" | "Auditor"
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo user for prototype -- replace with real backend auth
const DEMO_USER: User = {
  id: "u_001",
  name: "Maria Silva",
  email: "maria@empresa.com",
  role: "Owner",
}

const PROTECTED_PREFIXES = ["/console"]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Hydrate session from cookie on mount
  useEffect(() => {
    const session = document.cookie
      .split("; ")
      .find((c) => c.startsWith("tdln_session="))
    if (session) {
      setUser(DEMO_USER)
    }
    setIsLoading(false)
  }, [])

  // Redirect if accessing protected route without session
  useEffect(() => {
    if (isLoading) return
    const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
    if (isProtected && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [user, isLoading, pathname, router])

  const login = async (email: string, password: string) => {
    setError(null)
    setIsLoading(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800))
    if (email && password.length >= 4) {
      document.cookie = "tdln_session=demo; path=/; max-age=86400; SameSite=Lax"
      setUser({ ...DEMO_USER, email })
      setIsLoading(false)
    } else {
      setError("Credenciais invalidas. Tente novamente.")
      setIsLoading(false)
      throw new Error("invalid_credentials")
    }
  }

  const logout = () => {
    document.cookie = "tdln_session=; path=/; max-age=0"
    setUser(null)
    router.replace("/login")
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
