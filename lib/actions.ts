"use client"

import { toast } from "sonner"

// ── Types ────────────────────────────────────────────────────────
export interface ActionResult<T = void> {
  ok: boolean
  data?: T
  error?: string
}

interface CreatedKey {
  id: string
  name: string
  prefix: string
  secret: string        // shown exactly once
  created: string
}

interface WebhookEndpoint {
  id: string
  url: string
  events: string[]
  secret: string
}

// ── Helper ───────────────────────────────────────────────────────
async function call<T>(
  endpoint: string,
  body: Record<string, unknown>,
  _opts?: { method?: string }
): Promise<ActionResult<T>> {
  // Simulate network + backend latency
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 600))
  
  // In production: const res = await fetch(`/api${endpoint}`, { method, body: JSON.stringify(body), ... })
  // For now we return mock results keyed by endpoint
  return { ok: true, data: undefined as unknown as T }
}

function randomHex(len: number) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join("")
}

// ── API Keys ─────────────────────────────────────────────────────
export async function createApiKey(name: string): Promise<ActionResult<CreatedKey>> {
  const result = await call<CreatedKey>("/keys", { name })
  if (!result.ok) {
    toast.error(result.error ?? "Erro ao criar chave de API.")
    return result
  }
  const secret = `tdln_sk_live_${randomHex(32)}`
  return {
    ok: true,
    data: {
      id: `key_${randomHex(6)}`,
      name,
      prefix: `tdln_k_live_${randomHex(4)}...`,
      secret,
      created: new Date().toISOString(),
    },
  }
}

export async function rotateApiKey(keyId: string, keyName: string): Promise<ActionResult<{ newPrefix: string; newSecret: string; gracePeriod: string }>> {
  const result = await call("/keys/rotate", { keyId })
  if (!result.ok) {
    toast.error(result.error ?? "Erro ao rotacionar chave.")
    return { ok: false, error: result.error }
  }
  const newSecret = `tdln_sk_live_${randomHex(32)}`
  toast.success(`Chave "${keyName}" rotacionada. Grace period: 24h.`)
  return {
    ok: true,
    data: {
      newPrefix: `tdln_k_live_${randomHex(4)}...`,
      newSecret,
      gracePeriod: "24h",
    },
  }
}

export async function revokeApiKey(keyId: string, keyName: string): Promise<ActionResult> {
  const result = await call("/keys/revoke", { keyId })
  if (!result.ok) {
    toast.error(result.error ?? "Erro ao revogar chave.")
    return result
  }
  toast.success(`Chave "${keyName}" revogada permanentemente.`)
  return { ok: true }
}

// ── Webhooks ─────────────────────────────────────────────────────
export async function createWebhook(url: string, events: string[]): Promise<ActionResult<WebhookEndpoint>> {
  const result = await call<WebhookEndpoint>("/webhooks", { url, events })
  if (!result.ok) {
    toast.error(result.error ?? "Erro ao criar webhook.")
    return result
  }
  toast.success("Endpoint de webhook criado com sucesso.")
  return {
    ok: true,
    data: {
      id: `wh_${randomHex(6)}`,
      url,
      events,
      secret: `whsec_${randomHex(24)}`,
    },
  }
}

export async function testWebhook(url: string): Promise<ActionResult<{ status: number; latency: number }>> {
  const start = Date.now()
  const result = await call("/webhooks/test", { url })
  const latency = Date.now() - start
  if (!result.ok) {
    toast.error(`Ping falhou para ${url}.`)
    return { ok: false, error: "timeout" }
  }
  toast.success(`Ping enviado para ${url}. Status: 200 OK (${latency}ms).`)
  return { ok: true, data: { status: 200, latency } }
}

// ── Settings ─────────────────────────────────────────────────────
export async function saveRegionSettings(region: string, retention: string): Promise<ActionResult> {
  const result = await call("/settings/region", { region, retention })
  if (!result.ok) {
    toast.error("Erro ao salvar configuracoes.")
    return result
  }
  toast.success("Configuracoes de regiao e retencao salvas com sucesso.")
  return { ok: true }
}

export async function requestDataExport(dataType: string): Promise<ActionResult> {
  const result = await call("/export", { dataType })
  if (!result.ok) {
    toast.error("Erro ao iniciar exportacao.")
    return result
  }
  toast.success(`Exportacao de "${dataType}" iniciada. Voce recebera o arquivo por email.`)
  return { ok: true }
}

export async function deleteTenant(): Promise<ActionResult> {
  const result = await call("/tenant/delete", {})
  if (!result.ok) {
    toast.error("Erro ao solicitar exclusao.")
    return result
  }
  toast.success("Solicitacao de exclusao registrada. Sua conta sera removida em 48h.")
  return { ok: true }
}

// ── Billing ──────────────────────────────────────────────────────
export async function updatePaymentMethod(cardLast4: string): Promise<ActionResult> {
  const result = await call("/billing/payment", { cardLast4 })
  if (!result.ok) {
    toast.error("Erro ao atualizar metodo de pagamento.")
    return result
  }
  toast.success("Metodo de pagamento atualizado com sucesso.")
  return { ok: true }
}

export async function cancelPlan(): Promise<ActionResult> {
  const result = await call("/billing/cancel", {})
  if (!result.ok) {
    toast.error("Erro ao agendar cancelamento.")
    return result
  }
  toast.success("Cancelamento agendado para o proximo ciclo.")
  return { ok: true }
}

export async function upgradePlan(planId: string): Promise<ActionResult> {
  const result = await call("/billing/upgrade", { planId })
  if (!result.ok) {
    toast.error("Erro ao processar upgrade.")
    return result
  }
  toast.success(`Upgrade para plano ${planId} realizado com sucesso!`)
  return { ok: true }
}

export async function downgradePlan(planId: string): Promise<ActionResult> {
  const result = await call("/billing/downgrade", { planId })
  if (!result.ok) {
    toast.error("Erro ao processar downgrade.")
    return result
  }
  toast.success(`Downgrade para plano ${planId} agendado para o proximo ciclo.`)
  return { ok: true }
}

// ── Team ─────────────────────────────────────────────────────────
export async function inviteTeamMember(email: string, role: string): Promise<ActionResult> {
  const result = await call("/team/invite", { email, role })
  if (!result.ok) {
    toast.error("Erro ao enviar convite.")
    return result
  }
  toast.success(`Convite enviado para ${email} com papel ${role}.`)
  return { ok: true }
}

export async function changeRole(memberId: string, memberName: string, newRole: string): Promise<ActionResult> {
  const result = await call("/team/role", { memberId, newRole })
  if (!result.ok) {
    toast.error("Erro ao alterar papel.")
    return result
  }
  toast.success(`Papel de ${memberName} alterado para ${newRole}.`)
  return { ok: true }
}

export async function removeMember(memberId: string, memberName: string): Promise<ActionResult> {
  const result = await call("/team/remove", { memberId })
  if (!result.ok) {
    toast.error("Erro ao remover membro.")
    return result
  }
  toast.success(`${memberName} removido da equipe.`)
  return { ok: true }
}

export async function resetMFA(memberId: string, memberName: string): Promise<ActionResult> {
  const result = await call("/team/reset-mfa", { memberId })
  if (!result.ok) {
    toast.error("Erro ao resetar MFA.")
    return result
  }
  toast.success(`MFA resetado para ${memberName}. Sera solicitado novo setup no proximo login.`)
  return { ok: true }
}

// ── Evidence ─────────────────────────────────────────────────────
export async function pinMirror(cid: string, mirrorUrl: string): Promise<ActionResult> {
  const result = await call("/evidence/pin-mirror", { cid, mirrorUrl })
  if (!result.ok) {
    toast.error("Erro ao definir mirror preferido.")
    return result
  }
  toast.success(`Mirror definido como preferido.`)
  return { ok: true }
}

export async function retryEvidenceFetch(cid: string): Promise<ActionResult> {
  const result = await call("/evidence/retry", { cid })
  if (!result.ok) {
    toast.error("Falha ao obter evidencia. Tente novamente mais tarde.")
    return result
  }
  toast.success("Evidencia obtida com sucesso.")
  return { ok: true }
}

// ── Invoices ─────────────────────────────────────────────────────
export async function downloadInvoice(invoiceId: string): Promise<ActionResult> {
  const result = await call("/billing/invoice/download", { invoiceId })
  if (!result.ok) {
    toast.error("Erro ao baixar fatura.")
    return result
  }
  toast.success(`Download da fatura ${invoiceId} iniciado.`)
  return { ok: true }
}

export async function exportAllInvoices(): Promise<ActionResult> {
  const result = await call("/billing/invoices/export", {})
  if (!result.ok) {
    toast.error("Erro ao exportar faturas.")
    return result
  }
  toast.success("Exportacao iniciada. Voce recebera todas as faturas por email.")
  return { ok: true }
}
