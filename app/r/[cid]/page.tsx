
import { getJob } from "@/lib/registry";
import { ReceiptCard } from "@/components/receipt/ReceiptCard";

interface PageProps { params: { cid: string }; searchParams?: { job?: string }; }
export const dynamic = "force-dynamic";

export default async function Page({ params, searchParams }: PageProps) {
  const cid = params.cid;
  const jobId = searchParams?.job;
  let steps: any[] = [];
  try { if (jobId) { const job = await getJob(jobId); steps = job.steps ?? []; } } catch {}
  return (
    <div className="container max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Receipt Viewer</h1>
      <ReceiptCard cid={cid} status="ack" />
      {steps.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Receipt Chain</h2>
          {steps.map((s, i) => (
            <ReceiptCard key={i} cid={s.cid_out} parentCid={s.parent_cid} moduleId={s.module_id} publicKey={s.receipt?.public_key} signature={s.receipt?.signature} status="ack" />
          ))}
        </div>
      )}
    </div>
  );
}
