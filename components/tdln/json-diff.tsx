"use client"

interface DiffEntry {
  from: unknown
  to: unknown
}

interface JsonDiffProps {
  diff: Record<string, DiffEntry | unknown>
}

function formatValue(val: unknown): string {
  if (val === null) return "null"
  if (val === undefined) return "undefined"
  if (typeof val === "object") return JSON.stringify(val, null, 0)
  return String(val)
}

function isDiffEntry(val: unknown): val is DiffEntry {
  return val !== null && typeof val === "object" && "from" in (val as Record<string, unknown>) && "to" in (val as Record<string, unknown>)
}

export function JsonDiff({ diff }: JsonDiffProps) {
  const entries = Object.entries(diff)

  return (
    <div className="rounded-lg border bg-card font-mono text-xs">
      <div className="border-b px-3 py-2">
        <span className="text-[10px] font-sans font-medium text-muted-foreground uppercase tracking-wider">Diff</span>
      </div>
      <div className="divide-y">
        {entries.map(([key, value]) => {
          if (isDiffEntry(value)) {
            return (
              <div key={key} className="px-3 py-2">
                <span className="text-muted-foreground">{key}</span>
                <div className="mt-1 flex flex-col gap-0.5">
                  <div className="flex items-start gap-1.5">
                    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-nack/15 text-[10px] font-bold text-nack">-</span>
                    <span className="break-all text-nack">{formatValue(value.from)}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-ack/15 text-[10px] font-bold text-ack">+</span>
                    <span className="break-all text-ack">{formatValue(value.to)}</span>
                  </div>
                </div>
              </div>
            )
          }
          // Non-diff entry, just show value
          return (
            <div key={key} className="px-3 py-2">
              <span className="text-muted-foreground">{key}: </span>
              <span className="text-foreground">{formatValue(value)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
