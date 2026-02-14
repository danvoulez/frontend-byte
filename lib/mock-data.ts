export type ExecutionState = "ACK" | "NACK" | "ASK"

export interface Execution {
  id: string
  state: ExecutionState
  cid: string
  title: string
  origin: string
  timestamp: string
  integration: string
}

export interface SIRPNode {
  step: "INTENT" | "DELIVERY" | "EXECUTION" | "RESULT"
  signer: string
  timestamp: string
  verified: boolean
  algorithm: string
  hash: string
}

export interface Proof {
  type: string
  algorithm: string
  cid: string
  signer: string
  timestamp: string
  data?: string
}

export interface Evidence {
  cid: string
  url: string
  status: "fetched" | "pending" | "failed" | "protected"
  mime?: string
}

export interface AuditEntry {
  id: string
  user: string
  action: string
  target: string
  timestamp: string
  ip: string
  cid?: string
  diff?: Record<string, unknown>
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: "Owner" | "Admin" | "Operator" | "Auditor"
  mfa: boolean
  lastActive: string
}

export interface PolicyRule {
  id: string
  name: string
  failType: "hard" | "soft"
  threshold: string
  description: string
  enabled: boolean
}

export interface PolicyRevision {
  version: string
  date: string
  author: string
  notes: string
}

export interface PolicyPack {
  id: string
  name: string
  enabled: boolean
  version: string
  category: string
  rules: number
  description: string
  rulesList: PolicyRule[]
  revisions: PolicyRevision[]
}

export interface Invoice {
  id: string
  date: string
  amount: string
  status: "paid" | "pending" | "overdue"
}

// Mock Executions
export const mockExecutions: Execution[] = [
  {
    id: "exec_001",
    state: "ACK",
    cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    title: "Transacao financeira #4821",
    origin: "api-gateway",
    timestamp: "2026-02-10T14:32:00Z",
    integration: "SDK Node.js",
  },
  {
    id: "exec_002",
    state: "NACK",
    cid: "bafybeihkoviema7g3gxyt6la7vd5ho32uj4yz3pdufml5tz7pzq7v55uru",
    title: "Verificacao KYC usuario #1293",
    origin: "webhook-handler",
    timestamp: "2026-02-10T14:28:00Z",
    integration: "Nginx Gateway",
  },
  {
    id: "exec_003",
    state: "ASK",
    cid: "bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq",
    title: "Contrato digital #892",
    origin: "api-gateway",
    timestamp: "2026-02-10T14:15:00Z",
    integration: "SDK Python",
  },
  {
    id: "exec_004",
    state: "ACK",
    cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzaa",
    title: "Auditoria compliance Q1",
    origin: "cron-worker",
    timestamp: "2026-02-10T13:45:00Z",
    integration: "SDK Rust",
  },
  {
    id: "exec_005",
    state: "ACK",
    cid: "bafybeihkoviema7g3gxyt6la7vd5ho32uj4yz3pdufml5tz7pzq7v55fbb",
    title: "Pagamento fornecedor #3301",
    origin: "api-gateway",
    timestamp: "2026-02-10T13:20:00Z",
    integration: "SDK Node.js",
  },
  {
    id: "exec_006",
    state: "NACK",
    cid: "bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhcc",
    title: "Exportacao dados LGPD #102",
    origin: "webhook-handler",
    timestamp: "2026-02-10T12:58:00Z",
    integration: "Envoy Gateway",
  },
  {
    id: "exec_007",
    state: "ACK",
    cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdd",
    title: "Assinatura contrato SaaS",
    origin: "api-gateway",
    timestamp: "2026-02-10T12:30:00Z",
    integration: "SDK Node.js",
  },
  {
    id: "exec_008",
    state: "ASK",
    cid: "bafybeihkoviema7g3gxyt6la7vd5ho32uj4yz3pdufml5tz7pzq7v55fee",
    title: "Revisao politica AML #47",
    origin: "manual",
    timestamp: "2026-02-10T11:45:00Z",
    integration: "Console",
  },
]

// Mock SIRP Timeline
export const mockSIRPNodes: SIRPNode[] = [
  {
    step: "INTENT",
    signer: "client:sdk-node@2.1.0",
    timestamp: "2026-02-10T14:31:58.120Z",
    verified: true,
    algorithm: "Ed25519",
    hash: "sha256:a1b2c3d4e5f6...",
  },
  {
    step: "DELIVERY",
    signer: "gateway:nginx@1.25.0",
    timestamp: "2026-02-10T14:31:58.250Z",
    verified: true,
    algorithm: "HMAC-SHA256",
    hash: "sha256:f6e5d4c3b2a1...",
  },
  {
    step: "EXECUTION",
    signer: "engine:tdln-core@3.0.1",
    timestamp: "2026-02-10T14:31:59.001Z",
    verified: true,
    algorithm: "Ed25519",
    hash: "sha256:1a2b3c4d5e6f...",
  },
  {
    step: "RESULT",
    signer: "engine:tdln-core@3.0.1",
    timestamp: "2026-02-10T14:32:00.000Z",
    verified: true,
    algorithm: "Ed25519",
    hash: "sha256:6f5e4d3c2b1a...",
  },
]

// Mock Proofs
export const mockProofs: Proof[] = [
  {
    type: "Capsule INTENT",
    algorithm: "Ed25519",
    cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    signer: "client:sdk-node@2.1.0",
    timestamp: "2026-02-10T14:31:58.120Z",
  },
  {
    type: "Receipt DELIVERY",
    algorithm: "HMAC-SHA256",
    cid: "bafybeihkoviema7g3gxyt6la7vd5ho32uj4yz3pdufml5tz7pzq7v55uru",
    signer: "gateway:nginx@1.25.0",
    timestamp: "2026-02-10T14:31:58.250Z",
  },
  {
    type: "Receipt EXECUTION",
    algorithm: "Ed25519",
    cid: "bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq",
    signer: "engine:tdln-core@3.0.1",
    timestamp: "2026-02-10T14:31:59.001Z",
  },
  {
    type: "Capsule RESULT",
    algorithm: "Ed25519",
    cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzaa",
    signer: "engine:tdln-core@3.0.1",
    timestamp: "2026-02-10T14:32:00.000Z",
  },
]

// Mock Evidence
export const mockEvidence: Evidence[] = [
  { cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", url: "https://ipfs.io/ipfs/bafybeig...", status: "fetched", mime: "application/json" },
  { cid: "bafybeihkoviema7g3gxyt6la7vd5ho32uj4yz3pdufml5tz7pzq7v55uru", url: "https://arweave.net/tx/abc123", status: "fetched", mime: "application/pdf" },
  { cid: "bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq", url: "https://storage.tdln.io/e/...", status: "protected", mime: "application/octet-stream" },
]

// Mock Audit Log
export const mockAuditLog: AuditEntry[] = [
  { id: "aud_001", user: "maria@empresa.com", action: "execution.create", target: "exec_001", timestamp: "2026-02-10T14:32:00Z", ip: "189.45.32.100", cid: "bafybeigdyrzt..." },
  { id: "aud_002", user: "carlos@empresa.com", action: "policy.update", target: "pack_sanctions_aml", timestamp: "2026-02-10T14:00:00Z", ip: "189.45.32.101", diff: { "rules.ofac.threshold": { from: 0.7, to: 0.85 }, "rules.ofac.enabled": { from: false, to: true }, "version": { from: "2.3.0", to: "2.3.1" } } },
  { id: "aud_003", user: "ana@empresa.com", action: "team.invite", target: "joao@empresa.com", timestamp: "2026-02-10T13:45:00Z", ip: "189.45.32.102" },
  { id: "aud_004", user: "sistema", action: "key.rotate", target: "api_key_prod_01", timestamp: "2026-02-10T12:00:00Z", ip: "internal", diff: { "key.fingerprint": { from: "sha256:a1b2...old", to: "sha256:f6e5...new" }, "key.algorithm": { from: "RSA-2048", to: "Ed25519" } } },
  { id: "aud_005", user: "maria@empresa.com", action: "execution.download_bundle", target: "exec_001", timestamp: "2026-02-10T11:30:00Z", ip: "189.45.32.100", cid: "bafybeigdyrzt..." },
  { id: "aud_006", user: "carlos@empresa.com", action: "integration.create", target: "webhook_slack", timestamp: "2026-02-10T10:00:00Z", ip: "189.45.32.101", diff: { "url": { from: null, to: "https://hooks.slack.com/services/..." }, "events": { from: null, to: ["execution.ack", "execution.nack"] } } },
]

// Mock Team
export const mockTeam: TeamMember[] = [
  { id: "u_001", name: "Maria Silva", email: "maria@empresa.com", role: "Owner", mfa: true, lastActive: "2026-02-10T14:32:00Z" },
  { id: "u_002", name: "Carlos Oliveira", email: "carlos@empresa.com", role: "Admin", mfa: true, lastActive: "2026-02-10T14:00:00Z" },
  { id: "u_003", name: "Ana Santos", email: "ana@empresa.com", role: "Operator", mfa: false, lastActive: "2026-02-10T13:45:00Z" },
  { id: "u_004", name: "Joao Pereira", email: "joao@empresa.com", role: "Auditor", mfa: true, lastActive: "2026-02-09T18:00:00Z" },
]

// Mock Policy Packs
export const mockPolicyPacks: PolicyPack[] = [
  {
    id: "pack_001", name: "Sanctions AML", enabled: true, version: "2.3.1", category: "Financeiro", rules: 24,
    description: "Verificacao de sancoes e anti-lavagem de dinheiro com listas OFAC, EU e ONU.",
    rulesList: [
      { id: "r_001", name: "Verificacao OFAC", failType: "hard", threshold: "0.85", description: "Bloqueia se score de match com lista OFAC >= threshold.", enabled: true },
      { id: "r_002", name: "Lista EU Sanctions", failType: "hard", threshold: "0.80", description: "Bloqueia se match com lista de sancoes da Uniao Europeia.", enabled: true },
      { id: "r_003", name: "PEP Screening", failType: "soft", threshold: "0.70", description: "Registra alerta se score PEP >= threshold. Nao bloqueia execucao.", enabled: true },
      { id: "r_004", name: "Adverse Media", failType: "soft", threshold: "0.65", description: "Registra alerta para midia adversa associada ao sujeito.", enabled: true },
      { id: "r_005", name: "ONU Consolidated List", failType: "hard", threshold: "0.85", description: "Bloqueia se match com lista consolidada das Nacoes Unidas.", enabled: false },
    ],
    revisions: [
      { version: "2.3.1", date: "2026-01-15", author: "Compliance Team", notes: "Ajuste de threshold OFAC de 0.80 para 0.85. Aprovado para producao." },
      { version: "2.3.0", date: "2025-11-20", author: "Compliance Team", notes: "Adicionada regra de ONU Consolidated List (soft). Revisao trimestral." },
      { version: "2.2.0", date: "2025-08-10", author: "Maria Silva", notes: "Migracao para novo provedor de dados OFAC. Testes aprovados." },
    ],
  },
  {
    id: "pack_002", name: "AI Safety", enabled: true, version: "1.1.0", category: "IA", rules: 12,
    description: "Guardrails para outputs de modelos de IA incluindo toxicidade, bias e alucinacao.",
    rulesList: [
      { id: "r_010", name: "Toxicidade de output", failType: "hard", threshold: "0.90", description: "Bloqueia resposta se score de toxicidade >= threshold.", enabled: true },
      { id: "r_011", name: "Deteccao de bias", failType: "soft", threshold: "0.75", description: "Registra alerta para respostas com potencial vies.", enabled: true },
      { id: "r_012", name: "Alucinacao factual", failType: "soft", threshold: "0.80", description: "Registra alerta se score de alucinacao >= threshold.", enabled: true },
      { id: "r_013", name: "PII Leakage", failType: "hard", threshold: "0.95", description: "Bloqueia se dados pessoais detectados no output.", enabled: true },
    ],
    revisions: [
      { version: "1.1.0", date: "2026-02-01", author: "AI Team", notes: "Adicionada regra de PII Leakage. Threshold de toxicidade ajustado." },
      { version: "1.0.0", date: "2025-10-01", author: "AI Team", notes: "Versao inicial com regras de toxicidade, bias e alucinacao." },
    ],
  },
  {
    id: "pack_003", name: "SLA Compliance", enabled: false, version: "1.0.0", category: "Operacional", rules: 8,
    description: "Monitoramento de conformidade com SLAs contratuais e tempos de resposta.",
    rulesList: [
      { id: "r_020", name: "Tempo de resposta p99", failType: "soft", threshold: "500ms", description: "Alerta se latencia p99 exceder threshold.", enabled: true },
      { id: "r_021", name: "Uptime mensal", failType: "hard", threshold: "99.9%", description: "Bloqueia se uptime ficar abaixo do SLA contratual.", enabled: true },
      { id: "r_022", name: "Error rate", failType: "soft", threshold: "1%", description: "Alerta se taxa de erro exceder threshold.", enabled: true },
    ],
    revisions: [
      { version: "1.0.0", date: "2025-09-01", author: "Ops Team", notes: "Versao inicial. Pack desativado ate conclusao de testes." },
    ],
  },
  {
    id: "pack_004", name: "Data Residency", enabled: true, version: "1.2.0", category: "Privacidade", rules: 6,
    description: "Verificacao de residencia de dados conforme LGPD, GDPR e regulacoes locais.",
    rulesList: [
      { id: "r_030", name: "Dados no territorio", failType: "hard", threshold: "BR", description: "Bloqueia se dados processados fora do territorio configurado.", enabled: true },
      { id: "r_031", name: "Transferencia internacional", failType: "hard", threshold: "block", description: "Bloqueia transferencias para paises sem acordo de adequacao.", enabled: true },
      { id: "r_032", name: "Criptografia em transito", failType: "soft", threshold: "TLS 1.3", description: "Alerta se conexao usar protocolo inferior ao configurado.", enabled: true },
    ],
    revisions: [
      { version: "1.2.0", date: "2026-01-10", author: "DPO", notes: "Atualizado para conformidade com novas diretrizes ANPD." },
      { version: "1.1.0", date: "2025-07-15", author: "DPO", notes: "Adicionada regra de criptografia em transito." },
    ],
  },
  {
    id: "pack_005", name: "PCI DSS", enabled: false, version: "3.0.0", category: "Financeiro", rules: 32,
    description: "Conformidade com padroes de seguranca de dados para industria de cartoes de pagamento.",
    rulesList: [
      { id: "r_040", name: "PAN Masking", failType: "hard", threshold: "full", description: "Bloqueia se PAN nao mascarado detectado em logs ou respostas.", enabled: true },
      { id: "r_041", name: "Criptografia de dados", failType: "hard", threshold: "AES-256", description: "Bloqueia se dados de cartao nao criptografados com AES-256.", enabled: true },
      { id: "r_042", name: "Access logging", failType: "soft", threshold: "all", description: "Alerta se acessos a dados de cartao nao estiverem logados.", enabled: true },
      { id: "r_043", name: "Key rotation", failType: "soft", threshold: "90d", description: "Alerta se chaves de criptografia nao rotacionadas em 90 dias.", enabled: true },
    ],
    revisions: [
      { version: "3.0.0", date: "2025-12-01", author: "Security Team", notes: "Atualizacao para PCI DSS v4.0. Pack aguardando ativacao." },
    ],
  },
]

// Mock Invoices
export const mockInvoices: Invoice[] = [
  { id: "inv_001", date: "2026-02-01", amount: "R$ 2.490,00", status: "paid" },
  { id: "inv_002", date: "2026-01-01", amount: "R$ 2.490,00", status: "paid" },
  { id: "inv_003", date: "2025-12-01", amount: "R$ 1.990,00", status: "paid" },
  { id: "inv_004", date: "2025-11-01", amount: "R$ 1.990,00", status: "paid" },
]

// Dashboard metrics
export const mockMetrics = {
  executionsToday: 1247,
  ackPercentage: 94.2,
  p99Latency: 142,
  activeIntegrations: 4,
  weeklyData: [
    { day: "Seg", executions: 980, ack: 920 },
    { day: "Ter", executions: 1120, ack: 1050 },
    { day: "Qua", executions: 1340, ack: 1280 },
    { day: "Qui", executions: 1100, ack: 1020 },
    { day: "Sex", executions: 1247, ack: 1175 },
    { day: "Sab", executions: 420, ack: 405 },
    { day: "Dom", executions: 280, ack: 270 },
  ],
}
