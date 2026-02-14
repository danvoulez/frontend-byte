export default function ConsoleLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-40 rounded-md bg-muted" />
        <div className="mt-2 h-4 w-72 rounded-md bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-8 w-8 rounded-lg bg-muted" />
            </div>
            <div className="mt-4 h-8 w-20 rounded bg-muted" />
            <div className="mt-2 h-3 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-xl border bg-card p-6 lg:col-span-3">
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="mt-4 h-64 rounded bg-muted" />
        </div>
        <div className="rounded-xl border bg-card p-6 lg:col-span-2">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-5 w-12 rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
