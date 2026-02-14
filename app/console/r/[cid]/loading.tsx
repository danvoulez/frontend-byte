export default function ReceiptLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
      </div>
      <div className="rounded-xl border p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-64 rounded bg-muted" />
            <div className="h-4 w-80 rounded bg-muted" />
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border p-6">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="mt-4 flex items-center justify-between">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="h-3 w-16 rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-5">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-2/3 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border p-5">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-9 w-full rounded-md bg-muted" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
