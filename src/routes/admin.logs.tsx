import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollText } from "lucide-react";

export const Route = createFileRoute("/admin/logs")({ component: AdminLogs });

function AdminLogs() {
  const { data } = useQuery({
    queryKey: ["logs"],
    queryFn: async () => {
      const { data } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
      return data ?? [];
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-black flex items-center gap-2"><ScrollText className="h-7 w-7 text-primary" /> System Logs</h1>
      <div className="mt-8 rounded-2xl border border-border bg-card/50 overflow-hidden">
        <div className="max-h-[75vh] overflow-y-auto divide-y divide-border">
          {data?.length === 0 && <p className="p-6 text-muted-foreground text-center">No logs yet.</p>}
          {data?.map((l: any) => (
            <div key={l.id} className="p-3 flex gap-3 text-xs font-mono">
              <span className="text-muted-foreground shrink-0">{new Date(l.created_at).toLocaleString()}</span>
              <span className="text-primary font-bold">{l.action}</span>
              <span className="text-foreground/80 truncate">{l.target}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
