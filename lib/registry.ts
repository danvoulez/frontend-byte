
/* lib/registry.ts */
export type Hex = string;

export interface Receipt { cid: Hex; public_key: Hex; signature: Hex; }
export interface IngestRequest { value: unknown; sk_hex: Hex; }
export type JobState = "queued" | "running" | "done" | "error";
export interface IngestResponse { job_id: string; cid0: Hex; state: JobState; }
export interface JobStep { module_id: string; parent_cid: Hex; cid_out: Hex; receipt: Receipt; }
export interface JobResponse { job_id: string; cid0: Hex; head_cid: Hex; steps: JobStep[]; }
export type VerifyRequest = { receipt: Receipt } | { value: unknown; sk_hex?: Hex };
export interface VerifyResponse { ok: boolean; cid: Hex; }

const BASE_URL = process.env.NEXT_PUBLIC_REGISTRY_URL ?? "http://localhost:3000";
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Registry error ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export const ingest = (body: IngestRequest) => api<IngestResponse>("/v1/ingest", { method: "POST", body: JSON.stringify(body) });
export const getJob = (jobId: string) => api<JobResponse>(`/v1/jobs/${encodeURIComponent(jobId)}`);
export const verify = (body: VerifyRequest) => api<VerifyResponse>("/v1/verify", { method: "POST", body: JSON.stringify(body) });
