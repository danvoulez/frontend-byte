"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { mockTeam, type TeamMember } from "@/lib/mock-data"
import { inviteTeamMember, changeRole, removeMember, resetMFA } from "@/lib/actions"
import { useAuth } from "@/lib/auth-context"
import { hasPermission, type Role } from "@/lib/rbac"
import {
  Users, UserPlus, Shield, ShieldCheck, Key, Lock, Mail, MoreHorizontal,
  Check, X, AlertTriangle, Loader2, Globe, Fingerprint, Network, FileKey2, Copy,
} from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

const roleDescriptions: Record<string, string> = {
  Owner: "Acesso total, incluindo faturamento e exclusao de tenant.",
  Admin: "Gerencia equipe, politicas e integracoes. Sem acesso a faturamento.",
  Operator: "Cria e gerencia execucoes. Sem acesso a politicas ou equipe.",
  Auditor: "Acesso somente leitura a execucoes, evidencias e auditorias.",
}

const roleBadgeVariants: Record<string, string> = {
  Owner: "bg-foreground text-background",
  Admin: "bg-muted text-foreground",
  Operator: "bg-muted text-foreground",
  Auditor: "bg-muted text-muted-foreground",
}

// Mock SSO configuration
const ssoConfig = {
  enabled: false,
  provider: null as string | null,
  entityId: "https://app.tdln.io/saml/metadata",
  acsUrl: "https://app.tdln.io/saml/acs",
  sloUrl: "https://app.tdln.io/saml/slo",
  scimEndpoint: "https://app.tdln.io/scim/v2",
  scimToken: null as string | null,
}

export default function TeamPage() {
  const { user } = useAuth()
  const role: Role = user?.role ?? "Auditor"
  const canWrite = hasPermission(role, "team.write")

  const [members] = useState<TeamMember[]>(mockTeam)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("Operator")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [enforceMFA, setEnforceMFA] = useState(false)

  // Role change dialog
  const [roleTarget, setRoleTarget] = useState<TeamMember | null>(null)
  const [newRole, setNewRole] = useState("")
  const [roleLoading, setRoleLoading] = useState(false)

  // SSO state
  const [ssoIdpUrl, setSsoIdpUrl] = useState("")
  const [ssoCert, setSsoCert] = useState("")
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleInvite = async () => {
    setInviteLoading(true)
    await inviteTeamMember(inviteEmail, inviteRole)
    setInviteLoading(false)
    setInviteOpen(false)
    setInviteEmail("")
  }

  const handleRoleChange = async () => {
    if (!roleTarget) return
    setRoleLoading(true)
    await changeRole(roleTarget.id, roleTarget.name, newRole)
    setRoleLoading(false)
    setRoleTarget(null)
    setNewRole("")
  }

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Equipe & RBAC</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie membros, papeis, SSO e controles de acesso.</p>
        </div>
        {canWrite && (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><UserPlus className="mr-1.5 h-4 w-4" />Convidar membro</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convidar membro</DialogTitle>
                <DialogDescription>Envie um convite por email. O membro recebera acesso conforme o papel selecionado.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="invite-email">Email</Label>
                  <Input id="invite-email" type="email" placeholder="nome@empresa.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="invite-role">Papel</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="mt-1.5" id="invite-role"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Operator">Operator</SelectItem>
                      <SelectItem value="Auditor">Auditor</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-muted-foreground">{roleDescriptions[inviteRole]}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancelar</Button>
                <Button onClick={handleInvite} disabled={!inviteEmail || inviteLoading}>
                  {inviteLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Mail className="mr-1.5 h-4 w-4" />}
                  Enviar convite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Membros</TabsTrigger>
          <TabsTrigger value="security">Seguranca</TabsTrigger>
          <TabsTrigger value="sso">SSO & SAML</TabsTrigger>
          <TabsTrigger value="permissions">Permissoes</TabsTrigger>
        </TabsList>

        {/* ── Members ─────────────────────────────── */}
        <TabsContent value="members" className="mt-6 space-y-4">
          {/* Role overview cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(["Owner", "Admin", "Operator", "Auditor"] as const).map((r) => {
              const count = members.filter((m) => m.role === r).length
              return (
                <Card key={r}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      {r === "Owner" ? <Shield className="h-5 w-5 text-foreground" /> :
                       r === "Admin" ? <ShieldCheck className="h-5 w-5 text-foreground" /> :
                       r === "Operator" ? <Users className="h-5 w-5 text-foreground" /> :
                       <Key className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{r}</p>
                      <p className="text-xs text-muted-foreground">{count} membro{count !== 1 ? "s" : ""}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-sm font-medium text-foreground">Membros da equipe</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membro</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>MFA</TableHead>
                    <TableHead>Ultimo acesso</TableHead>
                    {canWrite && <TableHead className="w-[60px]" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
                            {member.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${roleBadgeVariants[member.role]}`}>{member.role}</span>
                      </TableCell>
                      <TableCell>
                        {member.mfa ? (
                          <span className="inline-flex items-center gap-1 text-xs text-ack"><Check className="h-3.5 w-3.5" />Ativo</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><X className="h-3.5 w-3.5" />Inativo</span>
                        )}
                      </TableCell>
                      <TableCell><span className="text-xs text-muted-foreground">{new Date(member.lastActive).toLocaleString("pt-BR")}</span></TableCell>
                      {canWrite && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" /><span className="sr-only">Acoes para {member.name}</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setRoleTarget(member); setNewRole(member.role) }}>Alterar papel</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => resetMFA(member.id, member.name)}>Resetar MFA</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => removeMember(member.id, member.name)}>Remover membro</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Security ────────────────────────────── */}
        <TabsContent value="security" className="mt-6 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium text-foreground">Seguranca de acesso</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Exigir MFA para todos</p>
                    <p className="text-xs text-muted-foreground">Membros sem MFA serao forcados a configurar no proximo login.</p>
                  </div>
                </div>
                <Switch checked={enforceMFA} onCheckedChange={setEnforceMFA} disabled={!canWrite} aria-label="Exigir MFA para todos" />
              </div>
              {!members.every((m) => m.mfa) && enforceMFA && (
                <div className="flex items-start gap-3 rounded-lg border border-ask/20 bg-ask/5 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-ask" />
                  <p className="text-xs text-muted-foreground">{members.filter((m) => !m.mfa).length} membro(s) ainda nao configurou MFA e sera(ao) notificado(s).</p>
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-5 w-5 text-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Sessao maxima</p>
                    <p className="text-xs text-muted-foreground">Defina o tempo maximo de uma sessao ativa antes de exigir novo login.</p>
                  </div>
                </div>
                <Select defaultValue="24h" disabled={!canWrite}>
                  <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4h">4 horas</SelectItem>
                    <SelectItem value="8h">8 horas</SelectItem>
                    <SelectItem value="24h">24 horas</SelectItem>
                    <SelectItem value="7d">7 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">IP allowlist</p>
                    <p className="text-xs text-muted-foreground">Restrinja acesso apenas a IPs autorizados.</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">Enterprise</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SSO & SAML ──────────────────────────── */}
        <TabsContent value="sso" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* SAML Config */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <FileKey2 className="h-4 w-4" />SAML 2.0
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">Enterprise</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Configure Single Sign-On com SAML 2.0 para login centralizado via seu Identity Provider.</p>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Entity ID (Service Provider)</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 rounded-md bg-muted p-2 font-mono text-xs text-foreground">{ssoConfig.entityId}</code>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleCopy(ssoConfig.entityId, "entity")}>
                        {copiedField === "entity" ? <Check className="h-3 w-3 text-ack" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">ACS URL</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 rounded-md bg-muted p-2 font-mono text-xs text-foreground">{ssoConfig.acsUrl}</code>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleCopy(ssoConfig.acsUrl, "acs")}>
                        {copiedField === "acs" ? <Check className="h-3 w-3 text-ack" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">SLO URL</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 rounded-md bg-muted p-2 font-mono text-xs text-foreground">{ssoConfig.sloUrl}</code>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleCopy(ssoConfig.sloUrl, "slo")}>
                        {copiedField === "slo" ? <Check className="h-3 w-3 text-ack" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <p className="text-xs font-medium text-foreground">Configuracao do Identity Provider</p>
                  <div>
                    <Label htmlFor="idp-url" className="text-xs text-muted-foreground">IdP SSO URL</Label>
                    <Input id="idp-url" placeholder="https://login.empresa.com/saml/sso" className="mt-1" value={ssoIdpUrl} onChange={(e) => setSsoIdpUrl(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="idp-cert" className="text-xs text-muted-foreground">Certificado X.509 (PEM)</Label>
                    <textarea
                      id="idp-cert"
                      placeholder={"-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"}
                      className="mt-1 w-full rounded-md border bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      rows={4}
                      value={ssoCert}
                      onChange={(e) => setSsoCert(e.target.value)}
                    />
                  </div>
                  <Button size="sm" disabled={!ssoIdpUrl || !ssoCert}>
                    Salvar configuracao SAML
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* SCIM Config */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Network className="h-4 w-4" />SCIM Provisioning
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">Enterprise</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Provisione e desprovicione usuarios automaticamente via SCIM 2.0 a partir do seu Identity Provider.</p>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">SCIM Base URL</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 rounded-md bg-muted p-2 font-mono text-xs text-foreground">{ssoConfig.scimEndpoint}</code>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleCopy(ssoConfig.scimEndpoint, "scim")}>
                        {copiedField === "scim" ? <Check className="h-3 w-3 text-ack" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Bearer Token</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 rounded-md bg-muted p-2 font-mono text-xs text-muted-foreground">
                        {ssoConfig.scimToken ? ssoConfig.scimToken : "Gere um token para habilitar SCIM"}
                      </code>
                    </div>
                    <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                      <Key className="mr-1.5 h-3.5 w-3.5" />Gerar token SCIM
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border border-ask/20 bg-ask/5 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-ask" />
                    <div>
                      <p className="text-xs font-medium text-foreground">Provisionamento automatico</p>
                      <p className="text-xs text-muted-foreground">Usuarios criados via SCIM receberao o papel Operator por padrao. Admins podem alterar apos o provisionamento.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground">Providers compativeis</p>
                  <div className="flex flex-wrap gap-2">
                    {["Okta", "Azure AD", "Google Workspace", "OneLogin", "JumpCloud"].map((p) => (
                      <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">SSO/SAML e SCIM estao disponiveis no plano Enterprise.</p>
            <Button variant="outline" size="sm" className="mt-2 bg-transparent" asChild>
              <Link href="/contact">Falar com vendas</Link>
            </Button>
          </div>
        </TabsContent>

        {/* ── Permissions ─────────────────────────── */}
        <TabsContent value="permissions" className="mt-6">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium text-foreground">Permissoes por papel</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recurso</TableHead>
                    <TableHead className="text-center">Owner</TableHead>
                    <TableHead className="text-center">Admin</TableHead>
                    <TableHead className="text-center">Operator</TableHead>
                    <TableHead className="text-center">Auditor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { resource: "Execucoes (leitura)", owner: true, admin: true, operator: true, auditor: true },
                    { resource: "Criar execucoes", owner: true, admin: true, operator: true, auditor: false },
                    { resource: "Evidencias", owner: true, admin: true, operator: true, auditor: true },
                    { resource: "Politicas (editar)", owner: true, admin: true, operator: false, auditor: false },
                    { resource: "Integracoes", owner: true, admin: true, operator: false, auditor: false },
                    { resource: "Auditorias", owner: true, admin: true, operator: false, auditor: true },
                    { resource: "Equipe & RBAC", owner: true, admin: true, operator: false, auditor: false },
                    { resource: "Faturamento", owner: true, admin: false, operator: false, auditor: false },
                    { resource: "Configuracoes", owner: true, admin: true, operator: false, auditor: false },
                    { resource: "SSO / SAML", owner: true, admin: false, operator: false, auditor: false },
                    { resource: "Excluir tenant", owner: true, admin: false, operator: false, auditor: false },
                  ].map((row) => (
                    <TableRow key={row.resource}>
                      <TableCell className="text-sm text-foreground">{row.resource}</TableCell>
                      {[row.owner, row.admin, row.operator, row.auditor].map((allowed, i) => (
                        <TableCell key={i} className="text-center">
                          {allowed ? <Check className="mx-auto h-4 w-4 text-ack" /> : <X className="mx-auto h-4 w-4 text-muted-foreground/40" />}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Role Change Dialog ────────────────────── */}
      <Dialog open={!!roleTarget} onOpenChange={(o) => { if (!o) { setRoleTarget(null); setNewRole("") } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar papel de {roleTarget?.name}</DialogTitle>
            <DialogDescription>Selecione o novo papel. A alteracao e imediata.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
                {roleTarget?.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{roleTarget?.name}</p>
                <p className="text-xs text-muted-foreground">{roleTarget?.email}</p>
              </div>
            </div>
            <div>
              <Label>Novo papel</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecionar papel" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Operator">Operator</SelectItem>
                  <SelectItem value="Auditor">Auditor</SelectItem>
                </SelectContent>
              </Select>
              {newRole && <p className="mt-1 text-xs text-muted-foreground">{roleDescriptions[newRole]}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRoleTarget(null); setNewRole("") }}>Cancelar</Button>
            <Button onClick={handleRoleChange} disabled={!newRole || newRole === roleTarget?.role || roleLoading}>
              {roleLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              Alterar papel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
