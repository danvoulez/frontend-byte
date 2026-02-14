
import { VerifyForm } from "@/components/receipt/VerifyForm";

export const dynamic = "force-dynamic";

export default function Page({ searchParams }: { searchParams?: Record<string,string> }) {
  const init = {
    cid: searchParams?.cid ?? "",
    publicKey: searchParams?.pk ?? searchParams?.publicKey ?? "",
    signature: searchParams?.sig ?? searchParams?.signature ?? "",
  };
  return (
    <div className="container max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Offline Verify</h1>
      <p className="text-sm opacity-80">
        Valide localmente uma <span className="font-mono">signature</span> Ed25519 sobre um <span className="font-mono">CID</span> canônico.
        Cole um <span className="font-mono">receipt JSON</span> para preencher automaticamente.
      </p>
      <VerifyForm initial={init} />
    </div>
  );
}
