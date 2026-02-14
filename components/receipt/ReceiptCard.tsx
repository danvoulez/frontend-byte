
import * as React from "react";

export type StepStatus = "ack" | "ask" | "nack";
export interface ReceiptCardProps {
  cid: string; moduleId?: string; parentCid?: string; signature?: string; publicKey?: string; status?: StepStatus; rightSlot?: React.ReactNode;
}
export function ReceiptCard({ cid, moduleId, parentCid, signature, publicKey, status = "ack", rightSlot }: ReceiptCardProps) {
  const statusChip = { ack: { label: "ACK", className: "bg-[var(--ack)] text-white" }, ask: { label: "ASK", className: "bg-[var(--ask)] text-black" }, nack:{ label: "NACK", className: "bg-[var(--nack)] text-white" } }[status];
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 flex items-start justify-between gap-4">
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusChip.className}`}>{statusChip.label}</span>
          {moduleId && <span className="font-mono text-xs opacity-80">{moduleId}</span>}
        </div>
        <div><span className="font-semibold">CID:</span> <span className="font-mono break-all">{cid}</span></div>
        {parentCid && <div><span className="font-semibold">Parent:</span> <span className="font-mono break-all">{parentCid}</span></div>}
        {publicKey && <div><span className="font-semibold">PK:</span> <span className="font-mono break-all">{publicKey}</span></div>}
        {signature && <div><span className="font-semibold">Signature:</span> <span className="font-mono break-all">{signature}</span></div>}
      </div>
      {rightSlot ? <div>{rightSlot}</div> : null}
    </div>
  );
}
