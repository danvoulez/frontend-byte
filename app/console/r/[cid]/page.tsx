"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BadgeEstado } from "@/components/tdln/badge-estado"
import { CIDChip } from "@/components/tdln/cid-chip"
import { TimelineSIRP } from "@/components/tdln/timeline-sirp"
import { CardProva } from "@/components/tdln/card-prova"
import { PoIList } from "@/components/tdln/poi-list"
import { QRCode } from "@/components/tdln/qr-code"
import {
  mockExecutions,
  mockSIRPNodes,
  mockProofs,
  mockEvidence,
} from "@/lib/mock-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Copy,
  Download,
  ExternalLink,
  QrCode,
  Printer,
  Shield,
  ArrowLeft,
  WifiOff,
  RefreshCw,
  Lock,
  Check,
  AlertTriangle,
  XCircle,
  Loader2,
  FileText,
} from "lucide-react"
import { toast } from "sonner"

export default function ReceiptDetailPage({ params }: { params: { cid: string } }) {
  const { cid } = params
  const [copiedLink, setCopiedLink] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [pdfState, setPdfState] = useState<"idle" | "generating" | "ready">("idle")

  const execution = mockExecutions.find((e) => e.cid === cid) || mockExecutions[0]
  const isASK = execution.state === "ASK"
  const isNACK = execution.state === "NACK"

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/r/${execution.cid}`
    : `/r/${execution.cid}`

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(publicUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleGeneratePDF = async () => {
    setPdfState("generating")
    await new Promise((r) => setTimeout(r, 2200))
    setPdfState("ready")
    toast.success("PDF gerado com sucesso.")
  }

  const handleDownloadPDF = () => {
    toast.success("Download do PDF iniciado.")
    setPdfState("idle")
  }

  // State-aware banner colors using semantic tokens
  const bannerStyles = {
    ACK: "border-ack/20 bg-ack/5",
    ASK: "border-ask/20 bg-ask/5",
    NACK: "border-nack/20 bg-nack/5",
  }

  const iconBgStyles = {
    ACK: "bg-ack/10",
    ASK: "bg-ask/10",
    NACK: "bg-nack/10",
  }

  const iconColorStyles = {
    ACK: "text-ack",
    ASK: "text-ask",
    NACK: "text-nack",
  }

  // ASK/NACK microcopy
  const stateMessage = {
    ACK: "Decisao verificada criptograficamente. Todas as politicas foram atendidas.",
    ASK: `Verificacao incompleta: ${execution.title}. Submeta as evidencias pendentes para prosseguir.`,
    NACK: `Verificacao rejeitada: regras de politica nao atendidas para "${execution.title}".`,
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/console/executions">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar para execucoes
        </Link>
      </Button>

      {/* State Banner */}
      <div className={`rounded-xl border p-6 transition-colors ${bannerStyles[execution.state]}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBgStyles[execution.state]}`}>
              {execution.state === "ACK" && <Check className={`h-6 w-6 ${iconColorStyles.ACK}`} />}
              {execution.state === "ASK" && <AlertTriangle className={`h-6 w-6 ${iconColorStyles.ASK}`} />}
              {execution.state === "NACK" && <XCircle className={`h-6 w-6 ${iconColorStyles.NACK}`} />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-foreground">{execution.title}</h1>
                <BadgeEstado state={execution.state} size="default" />
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {stateMessage[execution.state]}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="bg-transparent" onClick={handleCopyLink}>
              {copiedLink ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
              {copiedLink ? "Copiado" : "Copiar Link"}
            </Button>
            <Button variant="outline" size="sm" className="bg-transparent" onClick={() => toast.success("Download do bundle .zip iniciado.")}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Baixar Bundle
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <span className="text-xs text-muted-foreground">CID</span>
          <div className="mt-1">
            <CIDChip cid={execution.cid} />
          </div>
        </div>
      </div>

      {/* Main content: 3 columns */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left column: Timeline */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Timeline SIRP</CardTitle>
            </CardHeader>
            <CardContent>
              <TimelineSIRP nodes={mockSIRPNodes} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Rastreabilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Requisitante</span>
                  <span className="font-mono text-xs text-foreground">maria@empresa.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Origem</span>
                  <span className="text-xs text-foreground">{execution.origin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Integracao</span>
                  <span className="text-xs text-foreground">{execution.integration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Idempotency Key</span>
                  <span className="font-mono text-xs text-foreground">idk_a1b2c3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timestamp</span>
                  <span className="text-xs text-foreground">{new Date(execution.timestamp).toLocaleString("pt-BR")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center column: Proofs */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Provas Criptograficas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockProofs.map((proof) => (
                <CardProva key={proof.type} proof={proof} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Evidence + ASK/NACK specific */}
        <div className="lg:col-span-4 space-y-6">
          {/* Evidence */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Evidencias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockEvidence.map((ev) => (
                  <div key={ev.cid} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <CIDChip cid={ev.cid} />
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        ev.status === "fetched" ? "bg-ack/10 text-ack" :
                        ev.status === "protected" ? "bg-muted text-muted-foreground" :
                        ev.status === "pending" ? "bg-ask/10 text-ask" :
                        "bg-nack/10 text-nack"
                      }`}>
                        {ev.status === "protected" && <Lock className="h-3 w-3" />}
                        {ev.status === "fetched" ? "Obtido" : ev.status === "protected" ? "AEAD/protegido" : ev.status === "pending" ? "Pendente" : "Falha"}
                      </span>
                    </div>
                    <p className="mt-1.5 truncate text-xs text-muted-foreground">{ev.url}</p>
                    {ev.mime && (
                      <p className="mt-0.5 text-[10px] font-mono text-muted-foreground/60">{ev.mime}</p>
                    )}
                    {ev.status === "failed" && (
                      <div className="mt-2">
                        <p className="text-xs text-nack">Falha ao obter evidencia.</p>
                        <Button variant="outline" size="sm" className="mt-1 h-7 text-xs bg-transparent" onClick={() => toast.info("Tentando obter evidencia novamente...")}>
                          <RefreshCw className="mr-1 h-3 w-3" />
                          Tentar Novamente
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ASK - PoI */}
          {isASK && <PoIList />}

          {/* NACK - Violations */}
          {isNACK && (
            <Card className="border-nack/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-nack">
                  <XCircle className="h-4 w-4" />
                  Violacoes de politica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="rounded-md border border-nack/10 bg-nack/5 p-3">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-nack/20 px-1.5 py-0.5 text-[10px] font-bold text-nack">HARD</span>
                      <p className="text-sm font-medium text-foreground">Threshold de risco excedido</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Score 0.92 excede limite 0.85 da politica Sanctions AML v2.3.1</p>
                    <Link href="/console/policies" className="mt-1.5 inline-flex items-center text-xs font-medium text-foreground hover:underline">
                      Ver politica <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                  <div className="rounded-md border border-nack/10 bg-nack/5 p-3">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-ask/20 px-1.5 py-0.5 text-[10px] font-bold text-ask">SOFT</span>
                      <p className="text-sm font-medium text-foreground">Documento de identidade expirado</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">KYC Compliance v1.0.0 -- documento vencido ha 45 dias</p>
                    <Link href="/console/policies" className="mt-1.5 inline-flex items-center text-xs font-medium text-foreground hover:underline">
                      Ver politica <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Share / Audit */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Compartilhar & Auditar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" onClick={() => setQrOpen(true)}>
                  <QrCode className="mr-2 h-4 w-4" />
                  Gerar QR Code
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" asChild>
                  <Link href={`/verify/offline?cid=${execution.cid}`}>
                    <WifiOff className="mr-2 h-4 w-4" />
                    Abrir Verificador Offline
                  </Link>
                </Button>
                {pdfState === "idle" && (
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" onClick={handleGeneratePDF}>
                    <FileText className="mr-2 h-4 w-4" />
                    Gerar PDF
                  </Button>
                )}
                {pdfState === "generating" && (
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando PDF...
                  </Button>
                )}
                {pdfState === "ready" && (
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" onClick={handleDownloadPDF}>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar PDF
                  </Button>
                )}
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" onClick={() => { window.print() }}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QR Code dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code do Recibo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="rounded-xl border bg-background p-3">
              <QRCode value={publicUrl} size={192} />
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Escaneie para verificar o recibo
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground/60 break-all">
                {execution.cid.slice(0, 32)}...
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-transparent" onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success("Link publico copiado.") }}>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copiar link
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent" asChild>
                <Link href={`/r/${execution.cid}`} target="_blank">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Abrir publico
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
