
"use client";

import * as React from "react";
import * as ed from "@noble/ed25519";
import { ReceiptCard } from "./ReceiptCard";

type Hex = string;
type Status = "idle" | "ack" | "nack" | "ask";

function isHex(s: string, len?: number) {
  return /^[0-9a-f]+$/i.test(s) && (len ? s.length === len : true);
}

async function verifyEd25519(hexCid: string, hexSig: string, hexPk: string): Promise<boolean> {
  try {
    if (!isHex(hexCid, 64) || !isHex(hexSig, 128) || !isHex(hexPk, 64)) return false;
    const msg = Uint8Array.from(Buffer.from(hexCid, "hex"));
    const sig = Uint8Array.from(Buffer.from(hexSig, "hex"));
    const pk  = Uint8Array.from(Buffer.from(hexPk, "hex"));
    return await ed.verify(sig, msg, pk);
  } catch {
    return false;
  }
}

function fieldHint(ok: boolean|undefined, expect: string) {
  if (ok === undefined) return null;
  return <span className={ok ? "text-[var(--ack)] text-xs" : "text-[var(--nack)] text-xs"}>{ok ? "OK" : `Esperado: ${expect}`}</span>;
}

export function VerifyForm(props: { initial?: { cid?: string; publicKey?: string; signature?: string } }) {
  const [cid, setCid] = React.useState<string>(props.initial?.cid ?? "");
  const [publicKey, setPublicKey] = React.useState<string>(props.initial?.publicKey ?? "");
  const [signature, setSignature] = React.useState<string>(props.initial?.signature ?? "");
  const [status, setStatus] = React.useState<Status>("idle");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string|undefined>(undefined);

  const okCid = cid ? isHex(cid, 64) : undefined;
  const okPk  = publicKey ? isHex(publicKey, 64) : undefined;
  const okSig = signature ? isHex(signature, 128) : undefined;

  // Paste JSON receipt to autofill
  const onPasteReceipt = (e: React.ClipboardEvent<HTMLTextAreaElement|HTMLInputElement>) => {
    try {
      const t = e.clipboardData.getData("text");
      const j = JSON.parse(t);
      if (j && typeof j === "object") {
        const rc = (j as any).receipt ?? j;
        if (rc.cid && rc.public_key && rc.signature) {
          setCid(String(rc.cid).replace(/^0x/i, ""));
          setPublicKey(String(rc.public_key).replace(/^0x/i, ""));
          setSignature(String(rc.signature).replace(/^0x/i, ""));
          e.preventDefault();
        }
      }
    } catch {}
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(undefined);
    try {
      const ok = await verifyEd25519(cid.trim(), signature.trim(), publicKey.trim());
      setStatus(ok ? "ack" : "nack");
    } catch (e:any) {
      setStatus("nack");
      setErr(e?.message || "Failed to verify");
    } finally {
      setBusy(false);
    }
  };

  const makeShareUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("cid", cid);
    url.searchParams.set("pk", publicKey);
    url.searchParams.set("sig", signature);
    return url.toString();
  };
  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(makeShareUrl());
    } catch {}
  };

  const disabled = busy || !(cid && publicKey && signature && okCid && okPk && okSig);

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-1.5">
          <label className="text-sm font-medium">CID (hex 64)</label>
          <input
            className="rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 py-2 font-mono text-sm"
            value={cid}
            onChange={(e)=>setCid(e.target.value.trim())}
            onPaste={onPasteReceipt}
            placeholder="64-hex"
            spellCheck={false}
          />
          {fieldHint(okCid, "64 hex chars")}
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium">Public Key (hex 64)</label>
          <input
            className="rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 py-2 font-mono text-sm"
            value={publicKey}
            onChange={(e)=>setPublicKey(e.target.value.trim())}
            onPaste={onPasteReceipt}
            placeholder="64-hex (Ed25519)"
            spellCheck={false}
          />
          {fieldHint(okPk, "64 hex chars")}
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium">Signature (hex 128)</label>
          <textarea
            className="rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 py-2 font-mono text-sm min-h-[100px]"
            value={signature}
            onChange={(e)=>setSignature(e.target.value.trim())}
            onPaste={onPasteReceipt}
            placeholder="128-hex"
            spellCheck={false}
          />
          {fieldHint(okSig, "128 hex chars")}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={disabled}
            className="rounded-md bg-[var(--button)] text-[var(--button-foreground)] px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {busy ? "Verificando..." : "Verificar offline"}
          </button>
          <button
            type="button"
            onClick={onCopyLink}
            className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            disabled={!cid || !publicKey || !signature}
            title="Copiar URL com parâmetros"
          >
            Copiar link
          </button>
          {err && <span className="text-[var(--nack)] text-sm">{err}</span>}
        </div>
      </form>

      {status !== "idle" && (
        <ReceiptCard
          cid={cid}
          publicKey={publicKey}
          signature={signature}
          status={status === "ack" ? "ack" : status === "ask" ? "ask" : "nack"}
        />
      )}
    </div>
  );
}
