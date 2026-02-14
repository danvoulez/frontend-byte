"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Key, RotateCcw, Plus, Globe, Clock, Download, Trash2, Copy, Check,
  AlertTriangle, Eye, EyeOff, Webhook, Shield, Loader2,
} from "lucide-react"
import {
  createApiKey, rotateApiKey, revokeApiKey,
  createWebhook, testWebhook,
  saveRegionSettings, requestDataExport, deleteTenant,
} from "@/lib/actions"

interface KeyData {
  id: string; name: string; prefix: string; created: string; lastUsed: string; status: string
}

const initialKeys: KeyData[] = [
  { id: "key_001", name: "Producao", prefix: "tdln_k_live_a1b2...", created: "2026-01-15", lastUsed: "2026-02-10T14:32:00Z", status: "active" },
  { id: "key_002", name: "Staging", prefix: "tdln_k_test_z9y8...", created: "2026-01-20", lastUsed: "2026-02-09T18:00:00Z", status: "active" },
  { id: "key_003", name: "CI/CD (rotacionada)", prefix: "tdln_k_ci_q7w8...", created: "2025-12-01", lastUsed: "2026-01-30", status: "rotated" },
]

const initialWebhooks = [
  { id: "wh_001", url: "https://api.empresa.com/tdln/events", events: ["execution.created", "execution.completed"], status: "active" as const },
  { id: "wh_002", url: "https://slack.empresa.com/hooks/tdln", events: ["execution.nack"], status: "active" as const },
]

const AVAILABLE_EVENTS = ["execution.created", "execution.completed", "execution.nack", "policy.updated"]

export default function SettingsPage() {
  const [region, setRegion] = useState("br-south")
  const [retention, setRetention] = useState("30")
  const [keys, setKeys] = useState(initialKeys)
  const [webhooks] = useState(initialWebhooks)
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null)

  // Key creation: "shown once" flow
  const [newKeyOpen, setNewKeyOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyLoading, setNewKeyLoading] = useState(false)
  const [createdSecret, setCreatedSecret] = useState<string | null>(null)
  const [createdPrefix, setCreatedPrefix] = useState<string | null>(null)
  const [showSecret, setShowSecret] = useState(false)
  const [secretCopied, setSecretCopied] = useState(false)

  // Key rotation
  const [rotateTarget, setRotateTarget] = useState<KeyData | null>(null)
  const [rotateLoading, setRotateLoading] = useState(false)
  const [rotatedSecret, setRotatedSecret] = useState<string | null>(null)

  // Webhooks
  const [newWhOpen, setNewWhOpen] = useState(false)
  const [whUrl, setWhUrl] = useState("")
  const [whEvents, setWhEvents] = useState<string[]>([])
  const [whLoading, setWhLoading] = useState(false)
  const [testingWh, setTestingWh] = useState<string | null>(null)

  // Danger zone
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [savingRegion, setSavingRegion] = useState(false)

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedIdx(id)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const handleCreateKey = async () => {
    setNewKeyLoading(true)
    const result = await createApiKey(newKeyName)
    setNewKeyLoading(false)
    if (result.ok && result.data) {
      setCreatedSecret(result.data.secret)
      setCreatedPrefix(result.data.prefix)
      setKeys((prev) => [
        { id: result.data!.id, name: newKeyName, prefix: result.data!.prefix, created: result.data!.created, lastUsed: "Nunca", status: "active" },
        ...prev,
      ])
    }
  }

  const handleRotateKey = async () => {
    if (!rotateTarget) return
    setRotateLoading(true)
    const result = await rotateApiKey(rotateTarget.id, rotateTarget.name)
    setRotateLoading(false)
    if (result.ok && result.data) {
      setRotatedSecret(result.data.newSecret)
      setKeys((prev) => prev.map((k) => k.id === rotateTarget.id ? { ...k, status: "rotating", prefix: result.data!.newPrefix } : k))
    }
  }

  const handleRevoke = async (key: KeyData) => {
    await revokeApiKey(key.id, key.name)
    setKeys((prev) => prev.filter((k) => k.id !== key.id))
  }

  const closeCreateDialog = () => {
    setNewKeyOpen(false)
    setNewKeyName("")
    setCreatedSecret(null)
    setCreatedPrefix(null)
    setShowSecret(false)
    setSecretCopied(false)
  }

  const closeRotateDialog = () => {
    setRotateTarget(null)
    setRotatedSecret(null)
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Configuracoes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Chaves de API, webhooks, regioes e preferencias do tenant.</p>
        </div>

        <Tabs defaultValue="keys">
          <TabsList>
            <TabsTrigger value="keys">Chaves de API</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="region">Regiao & Retencao</TabsTrigger>
            <TabsTrigger value="export">Exportar dados</TabsTrigger>
          </TabsList>

          {/* ── API Keys ────────────────────────────────── */}
          <TabsContent value="keys" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Secrets so sao exibidos uma vez na criacao ou rotacao.</p>
              <Button size="sm" onClick={() => setNewKeyOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" />Nova chave
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Prefixo</TableHead>
                      <TableHead>Criada</TableHead>
                      <TableHead>Ultimo uso</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[120px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell><span className="text-sm font-medium text-foreground">{key.name}</span></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="font-mono text-xs text-muted-foreground">{key.prefix}</code>
                            <button onClick={() => handleCopy(key.prefix, key.id)} className="text-muted-foreground hover:text-foreground" aria-label="Copiar prefixo">
                              {copiedIdx === key.id ? <Check className="h-3 w-3 text-ack" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell><span className="text-xs text-muted-foreground">{new Date(key.created).toLocaleDateString("pt-BR")}</span></TableCell>
                        <TableCell><span className="text-xs text-muted-foreground">{key.lastUsed === "Nunca" ? "Nunca" : new Date(key.lastUsed).toLocaleString("pt-BR")}</span></TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            key.status === "active" ? "bg-ack/10 text-ack" :
                            key.status === "rotating" ? "bg-ask/10 text-ask" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {key.status === "active" ? "Ativa" : key.status === "rotating" ? "Grace 24h" : "Rotacionada"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setRotateTarget(key)} disabled={key.status !== "active"}>
                                  <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Rotacionar chave</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleRevoke(key)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Revogar permanentemente</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="rounded-lg border border-ask/20 bg-ask/5 p-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-ask" />
                <div>
                  <p className="text-sm font-medium text-ask">Rotacao de chaves</p>
                  <p className="text-xs text-muted-foreground">Ao rotacionar, a chave antiga continuara funcionando por 24h (grace period). Atualize suas integracoes antes desse prazo.</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Webhooks ────────────────────────────────── */}
          <TabsContent value="webhooks" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Receba notificacoes em tempo real sobre eventos no TDLN.</p>
              <Button size="sm" onClick={() => setNewWhOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" />Novo endpoint
              </Button>
            </div>

            {webhooks.map((wh) => (
              <Card key={wh.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Webhook className="h-4 w-4 shrink-0 text-foreground" />
                        <code className="truncate font-mono text-sm text-foreground">{wh.url}</code>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {wh.events.map((ev) => (<Badge key={ev} variant="secondary" className="text-xs">{ev}</Badge>))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1 rounded-full bg-ack/10 px-2 py-0.5 text-xs font-medium text-ack">Ativo</span>
                      <Button
                        variant="outline" size="sm" className="h-7 text-xs bg-transparent"
                        disabled={testingWh === wh.id}
                        onClick={async () => { setTestingWh(wh.id); await testWebhook(wh.url); setTestingWh(null) }}
                      >
                        {testingWh === wh.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                        Testar
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Secret: whs_••••••••</span>
                    <span>Ultimas entregas: 100% sucesso</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ── Region & Retention ───────────────────────── */}
          <TabsContent value="region" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground"><Globe className="h-4 w-4" />Regiao de dados</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Define onde seus dados e execucoes sao processados e armazenados.</p>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="br-south">BR Brasil Sul (Sao Paulo)</SelectItem>
                      <SelectItem value="us-east">US US East (Virginia)</SelectItem>
                      <SelectItem value="eu-west">EU EU West (Frankfurt)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Alterar a regiao pode afetar a latencia. Dados existentes nao sao migrados automaticamente.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground"><Clock className="h-4 w-4" />Retencao de dados</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Periodo de retencao para execucoes e evidencias.</p>
                  <Select value={retention} onValueChange={setRetention}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 dias (Free)</SelectItem>
                      <SelectItem value="30">30 dias (Team)</SelectItem>
                      <SelectItem value="90">90 dias</SelectItem>
                      <SelectItem value="365">365 dias (Enterprise)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Seu plano atual permite ate 30 dias de retencao.</p>
                </CardContent>
              </Card>
            </div>
            <Button disabled={savingRegion} onClick={async () => { setSavingRegion(true); await saveRegionSettings(region, retention); setSavingRegion(false) }}>
              {savingRegion ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              Salvar configuracoes
            </Button>
          </TabsContent>

          {/* ── Export ───────────────────────────────────── */}
          <TabsContent value="export" className="mt-6 space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground"><Download className="h-4 w-4" />Exportar dados</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Exporte todos os seus dados a qualquer momento. Sem vendor lock-in.</p>
                {[
                  { label: "Execucoes e recibos", desc: "Todas as execucoes, CIDs e metadados", format: "JSON / CSV" },
                  { label: "Evidencias", desc: "Todas as evidencias indexadas (exceto protegidas)", format: "JSON" },
                  { label: "Audit log", desc: "Log completo de auditoria imutavel", format: "JSON / CSV" },
                  { label: "Politicas e regras", desc: "Configuracao de packs e regras", format: "JSON" },
                  { label: "Export completo", desc: "Todos os dados acima em um unico bundle", format: "ZIP" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="secondary" className="text-xs">{item.format}</Badge>
                      <Button variant="outline" size="sm" className="bg-transparent" onClick={() => requestDataExport(item.label)}>
                        <Download className="mr-1.5 h-3.5 w-3.5" />Exportar
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardHeader><CardTitle className="flex items-center gap-2 text-sm font-medium text-destructive"><Trash2 className="h-4 w-4" />Zona de perigo</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Excluir permanentemente este tenant e todos os dados associados. Esta acao nao pode ser desfeita.</p>
                <Button variant="outline" size="sm" className="mt-4 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive bg-transparent" onClick={() => setDeleteOpen(true)}>Excluir tenant</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ── Create Key dialog: "shown once" pattern ─── */}
        <Dialog open={newKeyOpen} onOpenChange={(open) => { if (!open) closeCreateDialog() }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{createdSecret ? "Chave criada com sucesso" : "Criar nova chave de API"}</DialogTitle>
              <DialogDescription>
                {createdSecret
                  ? "Copie o secret abaixo. Ele nao sera exibido novamente."
                  : "O secret sera exibido apenas uma vez. Copie e armazene em local seguro."}
              </DialogDescription>
            </DialogHeader>

            {!createdSecret ? (
              <>
                <div className="py-4">
                  <Label htmlFor="key-name">Nome da chave</Label>
                  <Input id="key-name" placeholder="Ex: Producao, Staging, CI/CD" className="mt-1.5" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={closeCreateDialog}>Cancelar</Button>
                  <Button onClick={handleCreateKey} disabled={!newKeyName || newKeyLoading}>
                    {newKeyLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Key className="mr-1.5 h-4 w-4" />}
                    Criar chave
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <div className="space-y-4 py-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Prefixo (publico)</Label>
                    <code className="mt-1 block rounded-md bg-muted p-2.5 font-mono text-xs text-foreground">{createdPrefix}</code>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Secret (copie agora)</Label>
                    <div className="relative mt-1">
                      <code className="block rounded-md border-2 border-ask/30 bg-ask/5 p-2.5 pr-20 font-mono text-xs text-foreground break-all">
                        {showSecret ? createdSecret : createdSecret.replace(/./g, "\u2022")}
                      </code>
                      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowSecret((p) => !p)}>
                          {showSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={async () => { await navigator.clipboard.writeText(createdSecret); setSecretCopied(true) }}>
                          {secretCopied ? <Check className="h-3 w-3 text-ack" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-md border border-nack/20 bg-nack/5 p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-nack" />
                      <p className="text-xs text-muted-foreground">Este secret <strong className="text-foreground">nao sera exibido novamente</strong>. Se perder o acesso, sera necessario rotacionar a chave.</p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={closeCreateDialog}>
                    {secretCopied ? <Check className="mr-1.5 h-4 w-4" /> : null}
                    {secretCopied ? "Copiado, fechar" : "Fechar"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Rotate Key dialog ─────────────────────────── */}
        <Dialog open={!!rotateTarget} onOpenChange={(open) => { if (!open) closeRotateDialog() }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{rotatedSecret ? "Chave rotacionada" : `Rotacionar "${rotateTarget?.name}"?`}</DialogTitle>
              <DialogDescription>
                {rotatedSecret
                  ? "Copie o novo secret abaixo. A chave antiga funcionara por mais 24h."
                  : "Uma nova chave sera gerada. A chave antiga permanecera ativa por 24h (grace period)."}
              </DialogDescription>
            </DialogHeader>

            {!rotatedSecret ? (
              <DialogFooter>
                <Button variant="outline" onClick={closeRotateDialog}>Cancelar</Button>
                <Button onClick={handleRotateKey} disabled={rotateLoading}>
                  {rotateLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-1.5 h-4 w-4" />}
                  Rotacionar
                </Button>
              </DialogFooter>
            ) : (
              <>
                <div className="space-y-3 py-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Novo secret</Label>
                    <div className="relative mt-1">
                      <code className="block rounded-md border-2 border-ask/30 bg-ask/5 p-2.5 pr-12 font-mono text-xs text-foreground break-all">{rotatedSecret}</code>
                      <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2" onClick={() => navigator.clipboard.writeText(rotatedSecret)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-md border border-ask/20 bg-ask/5 p-3">
                    <p className="text-xs text-muted-foreground">Grace period: <strong className="text-foreground">24 horas</strong>. Atualize suas integracoes antes do prazo.</p>
                  </div>
                </div>
                <DialogFooter><Button onClick={closeRotateDialog}>Fechar</Button></DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Webhook Endpoint dialog ───────────────────── */}
        <Dialog open={newWhOpen} onOpenChange={setNewWhOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo endpoint de webhook</DialogTitle>
              <DialogDescription>Adicione uma URL para receber notificacoes de eventos do TDLN.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="wh-url">URL do endpoint</Label>
                <Input id="wh-url" placeholder="https://api.empresa.com/tdln/webhook" className="mt-1.5" value={whUrl} onChange={(e) => setWhUrl(e.target.value)} />
              </div>
              <div>
                <Label>Eventos</Label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {AVAILABLE_EVENTS.map((ev) => (
                    <Badge
                      key={ev}
                      variant={whEvents.includes(ev) ? "default" : "secondary"}
                      className="cursor-pointer text-xs"
                      onClick={() => setWhEvents((prev) => prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev])}
                    >
                      {ev}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setNewWhOpen(false); setWhUrl(""); setWhEvents([]) }}>Cancelar</Button>
              <Button
                onClick={async () => { setWhLoading(true); await createWebhook(whUrl, whEvents); setWhLoading(false); setNewWhOpen(false); setWhUrl(""); setWhEvents([]) }}
                disabled={!whUrl || whEvents.length === 0 || whLoading}
              >
                {whLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                Criar endpoint
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Delete Tenant dialog ──────────────────────── */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir tenant permanentemente?</DialogTitle>
              <DialogDescription>Esta acao e irreversivel. Todos os dados serao excluidos permanentemente.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label className="text-sm text-foreground">Digite <strong>excluir permanentemente</strong> para confirmar:</Label>
              <Input className="mt-2" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="excluir permanentemente" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDeleteOpen(false); setDeleteConfirmText("") }}>Cancelar</Button>
              <Button
                variant="destructive"
                disabled={deleteConfirmText !== "excluir permanentemente" || deleteLoading}
                onClick={async () => { setDeleteLoading(true); await deleteTenant(); setDeleteLoading(false); setDeleteOpen(false); setDeleteConfirmText("") }}
              >
                {deleteLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                Excluir permanentemente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
