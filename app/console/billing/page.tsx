"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { mockInvoices } from "@/lib/mock-data"
import {
  cancelPlan, upgradePlan, downgradePlan,
  updatePaymentMethod, downloadInvoice, exportAllInvoices,
} from "@/lib/actions"
import {
  CreditCard, Download, ArrowUpRight, TrendingUp, BarChart3, Calendar,
  AlertTriangle, Check, X, Zap, Loader2, ArrowDown, Shield, Users, Clock,
} from "lucide-react"
import Link from "next/link"

interface Plan {
  id: string
  name: string
  price: string
  priceNote: string
  executions: string
  retention: string
  features: string[]
  highlighted?: boolean
}

const plans: Plan[] = [
  {
    id: "free", name: "Free", price: "R$ 0", priceNote: "/mes",
    executions: "500/mes", retention: "7 dias",
    features: ["1 integracao", "Sem webhooks", "Suporte community"],
  },
  {
    id: "team", name: "Team", price: "R$ 990", priceNote: "/mes",
    executions: "10.000/mes", retention: "30 dias",
    features: ["Integracoes ilimitadas", "Webhooks", "RBAC", "Suporte prioritario"],
    highlighted: true,
  },
  {
    id: "enterprise", name: "Enterprise", price: "Sob consulta", priceNote: "",
    executions: "Ilimitado", retention: "365 dias",
    features: ["SSO/SAML", "SCIM", "SLA 99.99%", "Suporte dedicado", "Deploy on-prem"],
  },
]

const usageData = {
  currentPlan: "team" as string,
  currentPlanName: "Team",
  executions: { used: 7842, limit: 10000 },
  retention: "30 dias",
  billingCycle: "Mensal",
  nextBilling: "01/03/2026",
  paymentMethod: "Visa **** 4242",
  projectedUsage: 9200,
}

const statusColors: Record<string, string> = {
  paid: "bg-ack/10 text-ack",
  pending: "bg-ask/10 text-ask",
  overdue: "bg-nack/10 text-nack",
}
const statusLabels: Record<string, string> = {
  paid: "Pago", pending: "Pendente", overdue: "Atrasado",
}

export default function BillingPage() {
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [downgradeOpen, setDowngradeOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [upgradeTarget, setUpgradeTarget] = useState<Plan | null>(null)
  const [downgradeTarget, setDowngradeTarget] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(false)

  const usagePercent = Math.round((usageData.executions.used / usageData.executions.limit) * 100)
  const projectedPercent = Math.round((usageData.projectedUsage / usageData.executions.limit) * 100)
  const isNearLimit = usagePercent >= 75

  const handleUpgrade = async () => {
    if (!upgradeTarget) return
    setLoading(true)
    await upgradePlan(upgradeTarget.id)
    setLoading(false)
    setUpgradeOpen(false)
    setUpgradeTarget(null)
  }

  const handleDowngrade = async () => {
    if (!downgradeTarget) return
    setLoading(true)
    await downgradePlan(downgradeTarget.id)
    setLoading(false)
    setDowngradeOpen(false)
    setDowngradeTarget(null)
  }

  const handleCancel = async () => {
    setLoading(true)
    await cancelPlan()
    setLoading(false)
    setCancelOpen(false)
  }

  const handlePayment = async () => {
    setLoading(true)
    await updatePaymentMethod("4242")
    setLoading(false)
    setPaymentOpen(false)
  }

  const openPlanChange = (plan: Plan) => {
    const currentIndex = plans.findIndex((p) => p.id === usageData.currentPlan)
    const targetIndex = plans.findIndex((p) => p.id === plan.id)
    if (targetIndex > currentIndex) {
      setUpgradeTarget(plan)
      setUpgradeOpen(true)
    } else if (targetIndex < currentIndex) {
      setDowngradeTarget(plan)
      setDowngradeOpen(true)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Faturamento</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie seu plano, uso e metodos de pagamento.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportAllInvoices()}>
            <Download className="mr-1.5 h-4 w-4" />Exportar faturas
          </Button>
        </div>
      </div>

      {/* Near limit alert */}
      {isNearLimit && (
        <div className="flex items-center gap-4 rounded-xl border border-ask/20 bg-ask/5 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ask/10">
            <AlertTriangle className="h-5 w-5 text-ask" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Voce esta usando {usagePercent}% do seu limite mensal</p>
            <p className="text-xs text-muted-foreground">Projecao: {usageData.projectedUsage.toLocaleString("pt-BR")} execucoes. Considere fazer upgrade.</p>
          </div>
          <Button size="sm" variant="outline" className="shrink-0 bg-transparent" onClick={() => { setUpgradeTarget(plans[2]); setUpgradeOpen(true) }}>
            <Zap className="mr-1.5 h-3.5 w-3.5" />Upgrade
          </Button>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Plano atual</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">{usageData.currentPlanName}</span>
              <Badge variant="secondary" className="text-xs">Ativo</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">R$ 990/mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Execucoes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{usageData.executions.used.toLocaleString("pt-BR")}</div>
            <p className="mt-1 text-xs text-muted-foreground">de {usageData.executions.limit.toLocaleString("pt-BR")}/mes</p>
            <Progress value={usagePercent} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projecao</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{usageData.projectedUsage.toLocaleString("pt-BR")}</div>
            <p className="mt-1 text-xs text-muted-foreground">estimativa ({projectedPercent}%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Proxima fatura</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{usageData.nextBilling}</div>
            <p className="mt-1 text-xs text-muted-foreground">Ciclo {usageData.billingCycle.toLowerCase()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Plan comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground">Comparar planos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = plan.id === usageData.currentPlan
              return (
                <div key={plan.id} className={`relative rounded-xl border p-5 ${
                  isCurrent ? "border-ack/40 bg-ack/5" : plan.highlighted ? "border-foreground/20" : ""
                }`}>
                  {isCurrent && (
                    <Badge className="absolute -top-2.5 left-4 bg-ack text-ack-foreground text-[10px]">Atual</Badge>
                  )}
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.priceNote}</span>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BarChart3 className="h-3.5 w-3.5" />{plan.executions}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />{plan.retention}
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3 w-3 shrink-0 text-ack" />{f}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5">
                    {isCurrent ? (
                      <Button variant="outline" size="sm" className="w-full bg-transparent" disabled>Plano atual</Button>
                    ) : plan.id === "enterprise" ? (
                      <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                        <Link href="/contact">Falar com vendas</Link>
                      </Button>
                    ) : (
                      <Button
                        variant={plans.findIndex((p) => p.id === plan.id) > plans.findIndex((p) => p.id === usageData.currentPlan) ? "default" : "outline"}
                        size="sm"
                        className={plans.findIndex((p) => p.id === plan.id) > plans.findIndex((p) => p.id === usageData.currentPlan) ? "" : "bg-transparent"}
                        onClick={() => openPlanChange(plan)}
                      >
                        {plans.findIndex((p) => p.id === plan.id) > plans.findIndex((p) => p.id === usageData.currentPlan) ? (
                          <><ArrowUpRight className="mr-1 h-3.5 w-3.5" />Upgrade</>
                        ) : (
                          <><ArrowDown className="mr-1 h-3.5 w-3.5" />Downgrade</>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payment + Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-foreground">Metodo de pagamento</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <CreditCard className="h-6 w-6 text-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{usageData.paymentMethod}</p>
                <p className="text-xs text-muted-foreground">Expira em 12/2028</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setPaymentOpen(true)}>Alterar</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-foreground">Detalhes do plano</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {[
                { label: "Execucoes/mes", value: usageData.executions.limit.toLocaleString("pt-BR") },
                { label: "Integracoes", value: "Ilimitadas" },
                { label: "Retencao", value: usageData.retention },
                { label: "RBAC", value: "check" },
                { label: "Webhooks", value: "check" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{row.label}</span>
                  {row.value === "check" ? (
                    <span className="inline-flex items-center gap-1 font-medium text-ack"><Check className="h-3.5 w-3.5" />Incluido</span>
                  ) : (
                    <span className="font-medium text-foreground">{row.value}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground">Historico de faturas</CardTitle>
          <Button variant="outline" size="sm" className="h-8 text-xs bg-transparent" onClick={() => exportAllInvoices()}>
            <Download className="mr-1.5 h-3 w-3" />Exportar tudo
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fatura</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell><span className="font-mono text-sm text-foreground">{inv.id}</span></TableCell>
                  <TableCell><span className="text-sm text-muted-foreground">{new Date(inv.date).toLocaleDateString("pt-BR")}</span></TableCell>
                  <TableCell><span className="text-sm font-medium text-foreground">{inv.amount}</span></TableCell>
                  <TableCell><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[inv.status]}`}>{statusLabels[inv.status]}</span></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => downloadInvoice(inv.id)}>
                      <Download className="mr-1 h-3 w-3" />PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cancel section */}
      <Card className="border-destructive/20">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Cancelar plano</p>
            <p className="text-xs text-muted-foreground">Ao cancelar, voce voltara para Free no proximo ciclo.</p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive bg-transparent" onClick={() => setCancelOpen(true)}>
            Cancelar plano
          </Button>
        </CardContent>
      </Card>

      {/* ── Upgrade Dialog ──────────────────────────── */}
      <Dialog open={upgradeOpen} onOpenChange={(o) => { if (!o) { setUpgradeOpen(false); setUpgradeTarget(null) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade para {upgradeTarget?.name}</DialogTitle>
            <DialogDescription>Seu plano sera alterado imediatamente. O valor sera proporcional ao periodo restante.</DialogDescription>
          </DialogHeader>
          {upgradeTarget && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plano atual</span>
                  <span className="text-sm font-medium text-foreground">{usageData.currentPlanName}</span>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4 text-ack" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Novo plano</span>
                  <span className="text-sm font-bold text-foreground">{upgradeTarget.name}</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">O que muda:</p>
                {upgradeTarget.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 shrink-0 text-ack" />{f}
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setUpgradeOpen(false); setUpgradeTarget(null) }}>Cancelar</Button>
            <Button onClick={handleUpgrade} disabled={loading}>
              {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <ArrowUpRight className="mr-1.5 h-4 w-4" />}
              Confirmar upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Downgrade Dialog ────────────────────────── */}
      <Dialog open={downgradeOpen} onOpenChange={(o) => { if (!o) { setDowngradeOpen(false); setDowngradeTarget(null) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Downgrade para {downgradeTarget?.name}?</DialogTitle>
            <DialogDescription>O downgrade sera aplicado no proximo ciclo de faturamento.</DialogDescription>
          </DialogHeader>
          {downgradeTarget && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-ask/20 bg-ask/5 p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-ask" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Voce perdera acesso a:</p>
                    <ul className="mt-2 space-y-1">
                      {plans.find((p) => p.id === usageData.currentPlan)?.features
                        .filter((f) => !downgradeTarget.features.includes(f))
                        .map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <X className="h-3 w-3 shrink-0 text-nack" />{f}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm text-muted-foreground">Ativo ate</span>
                <span className="text-sm font-medium text-foreground">{usageData.nextBilling}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDowngradeOpen(false); setDowngradeTarget(null) }}>Manter plano</Button>
            <Button variant="destructive" onClick={handleDowngrade} disabled={loading}>
              {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <ArrowDown className="mr-1.5 h-4 w-4" />}
              Confirmar downgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Cancel Dialog ───────────────────────────── */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar plano {usageData.currentPlanName}?</DialogTitle>
            <DialogDescription>Seu plano sera reduzido para Free no proximo ciclo ({usageData.nextBilling}). Suas execucoes existentes continuarao acessiveis.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="rounded-lg border border-nack/20 bg-nack/5 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-nack" />
                <div>
                  <p className="text-sm font-medium text-foreground">Ao cancelar voce perdera:</p>
                  <ul className="mt-2 space-y-1">
                    <li className="flex items-center gap-2 text-xs text-muted-foreground"><X className="h-3 w-3 text-nack" />Integracoes ilimitadas</li>
                    <li className="flex items-center gap-2 text-xs text-muted-foreground"><X className="h-3 w-3 text-nack" />Webhooks</li>
                    <li className="flex items-center gap-2 text-xs text-muted-foreground"><X className="h-3 w-3 text-nack" />RBAC avancado</li>
                    <li className="flex items-center gap-2 text-xs text-muted-foreground"><X className="h-3 w-3 text-nack" />30 dias de retencao (reduz para 7)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Manter plano</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={loading}>
              {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              Confirmar cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Payment Dialog ──────────────────────────── */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar metodo de pagamento</DialogTitle>
            <DialogDescription>Atualize o cartao de credito. A alteracao sera aplicada na proxima fatura.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="card-number" className="text-sm font-medium text-foreground">Numero do cartao</label>
              <input id="card-number" placeholder="4242 4242 4242 4242" className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiry" className="text-sm font-medium text-foreground">Validade</label>
                <input id="expiry" placeholder="MM/AA" className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              <div>
                <label htmlFor="cvc" className="text-sm font-medium text-foreground">CVC</label>
                <input id="cvc" placeholder="123" className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancelar</Button>
            <Button onClick={handlePayment} disabled={loading}>
              {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              Salvar cartao
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
