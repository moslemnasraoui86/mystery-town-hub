import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileBarChart } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({ component: AdminReports });

function AdminReports() {
  const { data } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const { data: w } = await supabase.from("whitelist_applications").select("status");
      const grouped = { pending: 0, approved: 0, rejected: 0 } as Record<string, number>;
      (w ?? []).forEach((x: any) => grouped[x.status] = (grouped[x.status] ?? 0) + 1);
      return grouped;
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-black flex items-center gap-2"><FileBarChart className="h-7 w-7 text-primary" /> Reports</h1>
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        {data && Object.entries(data).map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{k}</div>
            <div className="font-display text-4xl font-black mt-2">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
