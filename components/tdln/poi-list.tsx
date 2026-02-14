"use client"

import { AlertTriangle, HelpCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PoIItem {
  id: string
  label: string
  helpUrl: string
  resolved: boolean
}

const mockPoIItems: PoIItem[] = [
  { id: "poi_1", label: "Certificado de origem do documento", helpUrl: "/docs?section=examples", resolved: false },
  { id: "poi_2", label: "Assinatura do responsavel legal", helpUrl: "/docs?section=examples", resolved: false },
  { id: "poi_3", label: "Comprovante de endereco atualizado", helpUrl: "/docs?section=examples", resolved: true },
]

export function PoIList() {
  return (
    <div className="rounded-lg border border-ask/20 bg-ask/5 p-4">
      <div className="flex items-center gap-2 text-ask">
        <AlertTriangle className="h-4 w-4" />
        <h3 className="text-sm font-semibold">Evidencias pendentes (PoI)</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Faltam evidencias para concluir a verificacao. Submeta os itens abaixo via API ou upload.
      </p>
      <ul className="mt-3 space-y-2" role="list">
        {mockPoIItems.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-md border bg-card px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${item.resolved ? "bg-ack" : "bg-ask"}`} />
              <span className={`text-sm ${item.resolved ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {item.label}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                <Link href={item.helpUrl}>
                  <HelpCircle className="mr-1 h-3 w-3" />
                  Ajuda
                  <ExternalLink className="ml-0.5 h-2.5 w-2.5" />
                </Link>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
