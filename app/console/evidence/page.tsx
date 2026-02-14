"use client"

import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"
import { CIDChip } from "@/components/tdln/cid-chip"
import { mockEvidence } from "@/lib/mock-data"
import { pinMirror, retryEvidenceFetch } from "@/lib/actions"
import {
  Search, Lock, RefreshCw, ExternalLink, Database, ChevronDown, Star, Globe,
  Activity, Loader2, Pin, Signal, SignalHigh, SignalLow, SignalMedium,
} from "lucide-react"

interface Mirror {
  id: string
  url: string
  status: "online" | "degraded" | "offline"
  latency: number
  preferred: boolean
  uptime: number  // percentage 0-100
  lastChecked: string
}

// Richer mock mirrors per CID
const mirrorsByCid: Record<string, Mirror[]> = {
  "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi": [
    { id: "m1", url: "https://ipfs.io/ipfs/bafybeig...", status: "online", latency: 42, preferred: true, uptime: 99.8, lastChecked: "2026-02-12T10:30:00Z" },
    { id: "m2", url: "https://gateway.pinata.cloud/ipfs/bafybeig...", status: "online", latency: 87, preferred: false, uptime: 99.5, lastChecked: "2026-02-12T10:30:00Z" },
    { id: "m3", url: "https://cloudflare-ipfs.com/ipfs/bafybeig...", status: "degraded", latency: 165, preferred: false, uptime: 97.2, lastChecked: "2026-02-12T10:28:00Z" },
    { id: "m4", url: "https://dweb.link/ipfs/bafybeig...", status: "online", latency: 53, preferred: false, uptime: 99.9, lastChecked: "2026-02-12T10:30:00Z" },
  ],
  "bafybeihkoviema7g3gxyt6la7vd5ho32uj4yz3pdufml5tz7pzq7v55uru": [
    { id: "m5", url: "https://arweave.net/tx/abc123", status: "online", latency: 120, preferred: true, uptime: 99.9, lastChecked: "2026-02-12T10:30:00Z" },
    { id: "m6", url: "https://ipfs.io/ipfs/bafybeih...", status: "offline", latency: 0, preferred: false, uptime: 85.3, lastChecked: "2026-02-12T10:15:00Z" },
    { id: "m7", url: "https://w3s.link/ipfs/bafybeih...", status: "online", latency: 76, preferred: false, uptime: 99.1, lastChecked: "2026-02-12T10:30:00Z" },
  ],
}

function LatencyBar({ latency, maxLatency = 200 }: { latency: number; maxLatency?: number }) {
  const pct = Math.min((latency / maxLatency) * 100, 100)
  const color = latency <= 60 ? "bg-ack" : latency <= 120 ? "bg-ask" : "bg-nack"
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-mono tabular-nums text-muted-foreground">{latency}ms</span>
    </div>
  )
}

function StatusIcon({ status }: { status: Mirror["status"] }) {
  if (status === "online") return <SignalHigh className="h-3.5 w-3.5 text-ack" />
  if (status === "degraded") return <SignalMedium className="h-3.5 w-3.5 text-ask" />
  return <SignalLow className="h-3.5 w-3.5 text-nack" />
}

function UptimeIndicator({ uptime }: { uptime: number }) {
  const color = uptime >= 99 ? "text-ack" : uptime >= 95 ? "text-ask" : "text-nack"
  return <span className={`text-[10px] font-mono tabular-nums ${color}`}>{uptime.toFixed(1)}%</span>
}

export default function EvidencePage() {
  const [query, setQuery] = useState("")
  const [expandedCid, setExpandedCid] = useState<string | null>(null)
  const [mirrors, setMirrors] = useState(mirrorsByCid)
  const [retrying, setRetrying] = useState<string | null>(null)
  const [pinning, setPinning] = useState<string | null>(null)

  const filtered = mockEvidence.filter((e) =>
    query ? e.cid.includes(query) || e.url.includes(query) : true
  )

  const handlePin = useCallback(async (cid: string, mirrorId: string, mirrorUrl: string) => {
    setPinning(mirrorId)
    const result = await pinMirror(cid, mirrorUrl)
    if (result.ok) {
      setMirrors((prev) => {
        const updated = { ...prev }
        if (updated[cid]) {
          updated[cid] = updated[cid].map((m) => ({
            ...m,
            preferred: m.id === mirrorId,
          }))
        }
        return updated
      })
    }
    setPinning(null)
  }, [])

  const handleRetry = useCallback(async (cid: string) => {
    setRetrying(cid)
    await retryEvidenceFetch(cid)
    setRetrying(null)
  }, [])

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Evidencias</h1>
          <p className="mt-1 text-sm text-muted-foreground">Busque e gerencie evidencias por CID ou URL. Gerencie mirrors e verifique a saude dos resolvers.</p>
        </div>

        {/* Health summary */}
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Mirrors online", value: Object.values(mirrors).flat().filter((m) => m.status === "online").length, total: Object.values(mirrors).flat().length, color: "text-ack" },
            { label: "Latencia media", value: `${Math.round(Object.values(mirrors).flat().filter((m) => m.latency > 0).reduce((a, m) => a + m.latency, 0) / Object.values(mirrors).flat().filter((m) => m.latency > 0).length)}ms`, total: null, color: "text-foreground" },
            { label: "Uptime medio", value: `${(Object.values(mirrors).flat().reduce((a, m) => a + m.uptime, 0) / Object.values(mirrors).flat().length).toFixed(1)}%`, total: null, color: "text-foreground" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className={`text-lg font-bold tabular-nums ${stat.color}`}>
                    {stat.value}{stat.total !== null ? <span className="text-xs font-normal text-muted-foreground">/{stat.total}</span> : null}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por CID ou URL..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            aria-label="Buscar evidencias"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((ev) => {
            const evMirrors = mirrors[ev.cid] ?? []
            return (
              <Card key={ev.cid}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <CIDChip cid={ev.cid} />
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      ev.status === "fetched" ? "bg-ack/10 text-ack" :
                      ev.status === "protected" ? "bg-muted text-muted-foreground" :
                      "bg-nack/10 text-nack"
                    }`}>
                      {ev.status === "protected" && <Lock className="h-3 w-3" />}
                      {ev.status === "fetched" ? "Obtido" : ev.status === "protected" ? "AEAD/protegido" : "Falha"}
                    </span>
                  </div>
                  <p className="mt-2 truncate text-xs text-muted-foreground">{ev.url}</p>
                  {ev.mime && <p className="mt-1 text-xs text-muted-foreground">MIME: {ev.mime}</p>}

                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                      <ExternalLink className="mr-1 h-3 w-3" />Abrir
                    </Button>
                    {ev.status === "failed" && (
                      <Button
                        variant="outline" size="sm" className="h-7 text-xs bg-transparent"
                        disabled={retrying === ev.cid}
                        onClick={() => handleRetry(ev.cid)}
                      >
                        {retrying === ev.cid ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-1 h-3 w-3" />}
                        Tentar Novamente
                      </Button>
                    )}
                  </div>

                  {/* Mirrors collapsible */}
                  {ev.status === "fetched" && evMirrors.length > 0 && (
                    <Collapsible
                      open={expandedCid === ev.cid}
                      onOpenChange={(open) => setExpandedCid(open ? ev.cid : null)}
                      className="mt-3"
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-full justify-between text-xs">
                          <span className="flex items-center gap-1.5">
                            <Globe className="h-3 w-3" />
                            Resolucoes & Mirrors ({evMirrors.length})
                            {evMirrors.some((m) => m.status !== "online") && (
                              <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-ask" />
                            )}
                          </span>
                          <ChevronDown className={`h-3 w-3 transition-transform ${expandedCid === ev.cid ? "rotate-180" : ""}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 space-y-2">
                        {evMirrors
                          .sort((a, b) => (b.preferred ? 1 : 0) - (a.preferred ? 1 : 0) || a.latency - b.latency)
                          .map((mirror) => (
                          <div key={mirror.id} className={`rounded-md border p-2.5 transition-colors ${
                            mirror.preferred ? "border-ack/30 bg-ack/5" : "bg-muted/30"
                          } ${mirror.status === "offline" ? "opacity-60" : ""}`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                  <StatusIcon status={mirror.status} />
                                  <p className="truncate text-xs font-medium text-foreground">{mirror.url}</p>
                                  {mirror.preferred && (
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Pin className="h-3 w-3 shrink-0 fill-ack text-ack" />
                                      </TooltipTrigger>
                                      <TooltipContent className="text-xs">Mirror preferido</TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  {mirror.latency > 0 ? (
                                    <LatencyBar latency={mirror.latency} />
                                  ) : (
                                    <span className="text-[10px] text-nack">Indisponivel</span>
                                  )}
                                  <span className="text-[10px] text-muted-foreground">Uptime:</span>
                                  <UptimeIndicator uptime={mirror.uptime} />
                                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                                    {mirror.status === "online" ? "Online" : mirror.status === "degraded" ? "Degradado" : "Offline"}
                                  </Badge>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                  Verificado: {new Date(mirror.lastChecked).toLocaleString("pt-BR")}
                                </p>
                              </div>
                              {!mirror.preferred && mirror.status !== "offline" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 shrink-0 gap-1 px-2 text-[10px] bg-transparent"
                                  disabled={pinning === mirror.id}
                                  onClick={() => handlePin(ev.cid, mirror.id, mirror.url)}
                                >
                                  {pinning === mirror.id ? (
                                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                  ) : (
                                    <Pin className="h-2.5 w-2.5" />
                                  )}
                                  Preferir
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Database className="h-8 w-8 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-semibold text-foreground">Nenhuma evidencia encontrada</h2>
              <p className="mt-1 text-sm text-muted-foreground">Tente buscar por outro CID ou URL.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}
