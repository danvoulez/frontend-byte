export default function ExecutionsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-32 rounded-md bg-muted" />
          <div className="mt-2 h-4 w-64 rounded-md bg-muted" />
        </div>
      </div>
      <div className="rounded-xl border bg-card">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="h-9 w-80 rounded-md bg-muted" />
          <div className="h-9 w-32 rounded-md bg-muted" />
          <div className="h-9 w-36 rounded-md bg-muted" />
          <div className="h-9 w-28 rounded-md bg-muted" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="h-5 w-12 rounded bg-muted" />
              <div className="h-4 w-48 rounded bg-muted" />
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="ml-auto h-4 w-28 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
