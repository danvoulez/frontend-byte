"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockPolicyPacks, type PolicyPack } from "@/lib/mock-data"
import { ShieldCheck, ChevronRight, BookOpen, Settings2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function PoliciesPage() {
  const [packs, setPacks] = useState(mockPolicyPacks)
  const [selectedPack, setSelectedPack] = useState<PolicyPack | null>(null)

  const togglePack = (id: string) => {
    setPacks((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Politicas & Packs</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gerencie regras de verificacao e packs de compliance.</p>
      </div>

      {/* Vertical Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground">Presets por Vertical</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "FinTech / Banking", packs: ["Sanctions AML", "KYC Compliance", "PCI DSS"] },
              { name: "HealthTech", packs: ["HIPAA", "LGPD Health", "FDA Compliance"] },
              { name: "E-commerce", packs: ["PCI DSS", "Fraud Detection", "GDPR"] },
              { name: "AI/ML Services", packs: ["AI Safety", "Model Audit", "Bias Detection"] },
            ].map((vertical) => (
              <button
                key={vertical.name}
                className="rounded-lg border bg-card p-3 text-left transition-colors hover:bg-muted/50"
                onClick={() => { toast.success(`Preset "${vertical.name}" aplicado. ${vertical.packs.length} packs recomendados ativados.`) }}
              >
                <p className="text-sm font-semibold text-foreground">{vertical.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{vertical.packs.length} packs recomendados</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Pack list */}
        <div className="lg:col-span-2 space-y-3">
          {packs.map((pack) => (
            <button
              key={pack.id}
              onClick={() => setSelectedPack(pack)}
              className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                selectedPack?.id === pack.id ? "border-foreground bg-muted ring-1 ring-foreground" : "bg-card hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <ShieldCheck className="h-5 w-5 text-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{pack.name}</p>
                  <p className="text-xs text-muted-foreground">{pack.category} &middot; v{pack.version}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Switch
                  checked={pack.enabled}
                  onCheckedChange={() => togglePack(pack.id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`${pack.enabled ? "Desativar" : "Ativar"} ${pack.name}`}
                />
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>

        {/* Pack detail */}
        <div className="lg:col-span-3">
          {selectedPack ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-foreground">{selectedPack.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{selectedPack.description}</p>
                  </div>
                  <Badge variant={selectedPack.enabled ? "default" : "secondary"}>
                    {selectedPack.enabled ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border bg-muted/50 p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{selectedPack.rules}</p>
                    <p className="text-xs text-muted-foreground">Regras</p>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">v{selectedPack.version}</p>
                    <p className="text-xs text-muted-foreground">Versao</p>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{selectedPack.category}</p>
                    <p className="text-xs text-muted-foreground">Categoria</p>
                  </div>
                </div>

                {/* Rules from data */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Regras ({selectedPack.rulesList.length})</h3>
                    <div className="flex gap-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="inline-block h-2 w-2 rounded-sm bg-nack" /> Hard: bloqueia
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block h-2 w-2 rounded-sm bg-ask" /> Soft: alerta
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {selectedPack.rulesList.map((rule) => (
                      <div key={rule.id} className={`flex items-center justify-between rounded-md border p-3 ${!rule.enabled ? "opacity-50" : ""}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{rule.name}</p>
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              rule.failType === "hard" ? "bg-nack/15 text-nack" : "bg-ask/15 text-ask"
                            }`}>
                              {rule.failType === "hard" ? "HARD" : "SOFT"}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{rule.description}</p>
                          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/60">threshold: {rule.threshold}</p>
                        </div>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => {
                            setPacks((prev) => prev.map((p) => {
                              if (p.id !== selectedPack.id) return p
                              return {
                                ...p,
                                rulesList: p.rulesList.map((r) => r.id === rule.id ? { ...r, enabled: !r.enabled } : r),
                              }
                            }))
                            // Sync the selected pack view
                            setSelectedPack((prev) => {
                              if (!prev) return prev
                              return {
                                ...prev,
                                rulesList: prev.rulesList.map((r) => r.id === rule.id ? { ...r, enabled: !r.enabled } : r),
                              }
                            })
                          }}
                          aria-label={`${rule.enabled ? "Desativar" : "Ativar"} regra ${rule.name}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Revision History */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Historico de Revisoes</h3>
                  <div className="mt-3 space-y-2">
                    {selectedPack.revisions.map((rev, i) => (
                      <div key={rev.version} className={`rounded-lg border p-3 ${i === 0 ? "border-foreground/10 bg-muted/30" : ""}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-foreground">v{rev.version}</span>
                          <span className="text-xs text-muted-foreground">{rev.date}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          <strong className="text-foreground">{rev.author}</strong>: {rev.notes}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast.info(`Editor de regras para "${selectedPack.name}" sera disponibilizado em breve.`)}>
                    <Settings2 className="mr-1.5 h-4 w-4" />
                    Configurar
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/docs">
                      <BookOpen className="mr-1.5 h-4 w-4" />
                      Documentacao
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ShieldCheck className="h-8 w-8 text-muted-foreground" />
                <h2 className="mt-4 text-lg font-semibold text-foreground">Selecione um pack</h2>
                <p className="mt-1 text-sm text-muted-foreground">Clique em um pack a esquerda para ver detalhes.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
