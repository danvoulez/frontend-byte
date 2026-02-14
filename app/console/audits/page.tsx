"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { JsonDiff } from "@/components/tdln/json-diff"
import { mockAuditLog } from "@/lib/mock-data"
import { Search, Download, Shield, ChevronDown, ChevronRight } from "lucide-react"
import { toast } from "sonner"

const actionLabels: Record<string, string> = {
  "execution.create": "Execucao criada",
  "execution.download_bundle": "Bundle baixado",
  "policy.update": "Politica atualizada",
  "team.invite": "Convite enviado",
  "key.rotate": "Chave rotacionada",
  "integration.create": "Integracao criada",
}

const actionColors: Record<string, string> = {
  "execution.create": "bg-ack/10 text-ack border-ack/20",
  "execution.download_bundle": "bg-muted text-muted-foreground border-border",
  "policy.update": "bg-ask/10 text-ask border-ask/20",
  "team.invite": "bg-muted text-muted-foreground border-border",
  "key.rotate": "bg-nack/10 text-nack border-nack/20",
  "integration.create": "bg-ack/10 text-ack border-ack/20",
}

export default function AuditsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const filtered = mockAuditLog.filter((entry) =>
    searchQuery
      ? entry.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.target.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  )

  const handleExport = () => {
    const headers = ["ID", "Usuario", "Acao", "Alvo", "CID", "IP", "Timestamp", "Diff"]
    const rows = filtered.map((e) => [
      e.id, e.user, e.action, e.target, e.cid || "", e.ip,
      new Date(e.timestamp).toISOString(),
      e.diff ? JSON.stringify(e.diff) : "",
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.setAttribute("href", URL.createObjectURL(blob))
    link.setAttribute("download", "tdln-audit-log.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`${filtered.length} registros exportados.`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Auditorias</h1>
          <p className="mt-1 text-sm text-muted-foreground">Log imutavel de todas as acoes no tenant.</p>
        </div>
        <Button variant="outline" size="sm" className="bg-transparent" onClick={handleExport}>
          <Download className="mr-1.5 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por usuario, acao, alvo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Filtrar auditorias"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Usuario</TableHead>
                <TableHead>Acao</TableHead>
                <TableHead>Alvo</TableHead>
                <TableHead>CID</TableHead>
                <TableHead>IP</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry) => {
                const isExpanded = expandedRow === entry.id
                const hasDiff = entry.diff && Object.keys(entry.diff).length > 0
                const colorClass = actionColors[entry.action] || "bg-muted text-muted-foreground border-border"

                return (
                  <>
                    <TableRow
                      key={entry.id}
                      className={`transition-colors ${hasDiff ? "cursor-pointer hover:bg-muted/50" : ""} ${isExpanded ? "bg-muted/30" : ""}`}
                      onClick={() => hasDiff && setExpandedRow(isExpanded ? null : entry.id)}
                    >
                      <TableCell className="w-8 px-2">
                        {hasDiff ? (
                          isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-foreground">{entry.user}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium ${colorClass}`}>
                          {actionLabels[entry.action] || entry.action}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">{entry.target}</span>
                      </TableCell>
                      <TableCell>
                        {entry.cid ? (
                          <span className="font-mono text-xs text-muted-foreground">{entry.cid}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">--</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">{entry.ip}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString("pt-BR")}
                        </span>
                      </TableCell>
                    </TableRow>
                    {isExpanded && hasDiff && (
                      <TableRow key={`${entry.id}_diff`}>
                        <TableCell colSpan={7} className="bg-muted/10 p-4">
                          <JsonDiff diff={entry.diff as Record<string, unknown>} />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>Log imutavel -- registros nao podem ser alterados ou excluidos</span>
        </div>
        <span>{filtered.length} registros</span>
      </div>
    </div>
  )
}
