import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/audit")({ component: AdminAudit });

function AdminAudit() {
  const { data } = useQuery({ queryKey: ["audit"], queryFn: async () => (await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200)).data ?? [] });
  return (
    <div>
      <h1 className="font-display text-3xl font-black">Audit Log</h1>
      <div className="mt-8 rounded-xl border border-border bg-card/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="px-4 py-3">When</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Target</th></tr>
          </thead>
          <tbody>
            {data?.map(l => (
              <tr key={l.id} className="border-t border-border">
                <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(l.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-xs">{l.action}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{l.target}</td>
              </tr>
            ))}
            {data?.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">No audit entries yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
