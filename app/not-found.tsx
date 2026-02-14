import Link from "next/link"
import { Shield } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Shield className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground">404</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Pagina nao encontrada
        </p>
        <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
          O recurso que voce procura nao existe ou foi movido. Verifique a URL ou volte ao inicio.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar ao inicio
          </Link>
          <Link
            href="/console"
            className="inline-flex items-center justify-center rounded-md border bg-transparent px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Ir ao Console
          </Link>
        </div>
      </div>
    </div>
  )
}
