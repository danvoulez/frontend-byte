"use client"

import { cn } from "@/lib/utils"
import type { ExecutionState } from "@/lib/mock-data"
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

const stateConfig: Record<ExecutionState, { label: string; icon: typeof CheckCircle2; className: string }> = {
  ACK: {
    label: "ACK",
    icon: CheckCircle2,
    className: "bg-ack/10 text-ack border-ack/20",
  },
  ASK: {
    label: "ASK",
    icon: AlertTriangle,
    className: "bg-ask/10 text-ask border-ask/20",
  },
  NACK: {
    label: "NACK",
    icon: XCircle,
    className: "bg-nack/10 text-nack border-nack/20",
  },
}

export function BadgeEstado({ state, size = "default" }: { state: ExecutionState; size?: "sm" | "default" | "lg" }) {
  const config = stateConfig[state]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-semibold",
        config.className,
        size === "sm" && "px-1.5 py-0.5 text-xs",
        size === "default" && "px-2 py-1 text-xs",
        size === "lg" && "px-3 py-1.5 text-sm"
      )}
      role="status"
      aria-label={`Estado: ${config.label}`}
    >
      <Icon className={cn(size === "sm" ? "h-3 w-3" : size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5")} aria-hidden="true" />
      {config.label}
    </span>
  )
}
