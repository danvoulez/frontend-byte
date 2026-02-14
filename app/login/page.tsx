"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Shield, ArrowRight, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react"

function LoginForm() {
  const { login, error: authError, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/console"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const error = localError || authError

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    if (!email || !password) {
      setLocalError("Preencha todos os campos.")
      return
    }
    setSubmitting(true)
    try {
      await login(email, password)
      router.replace(redirect)
    } catch {
      // error handled by auth context
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
              <Shield className="h-5 w-5 text-background" />
            </div>
          </Link>
          <h1 className="mt-6 text-xl font-bold tracking-tight text-foreground">Entrar no TDLN</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acesse o console de verificacao criptografica.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-nack/20 bg-nack/5 px-4 py-3 text-sm text-nack">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="maria@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Senha</label>
              <button type="button" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Esqueceu a senha?
              </button>
            </div>
            <div className="relative mt-1.5">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting || isLoading}
            className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Entrar
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider + SSO */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">ou</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <button
          type="button"
          className="mt-4 flex h-10 w-full items-center justify-center rounded-md border bg-transparent text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Continuar com SSO / SAML
        </button>

        {/* Demo hint */}
        <div className="mt-6 rounded-lg border bg-muted/50 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">
            Demo: use qualquer email e senha com 4+ caracteres.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Nao tem conta?{" "}
          <Link href="/onboarding" className="font-medium text-foreground hover:underline">
            Comece agora
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
