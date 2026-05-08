import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Wifi, Users, Server } from "lucide-react";

export const Route = createFileRoute("/status")({
  head: () => ({ meta: [{ title: "Server Status — Mystery Town" }] }),
  component: StatusPage,
});

function StatusPage() {
  const { data } = useQuery({
    queryKey: ["status-page"],
    queryFn: async () => (await supabase.from("server_status").select("*").eq("id", 1).maybeSingle()).data,
    refetchInterval: 10000,
  });
  return (
    <SiteLayout>
      <section className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="font-display text-5xl font-black flex items-center gap-3"><Activity className="h-10 w-10 text-primary" /> Server Status</h1>
        {data && (
          <div className="mt-10 space-y-4">
            <div className="rounded-2xl border border-border bg-card/50 p-6 flex items-center gap-4">
              <span className={`h-4 w-4 rounded-full ${data.online ? "bg-green-400 animate-pulse" : "bg-destructive"}`} />
              <div>
                <div className="font-display text-2xl">{data.online ? "Online" : "Offline"}</div>
                <div className="text-xs text-muted-foreground">Updated {new Date(data.updated_at).toLocaleString()}</div>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-card/50 p-5"><Users className="h-5 w-5 text-primary" /><div className="mt-3 font-display text-3xl">{data.players}/{data.max_players}</div><div className="text-xs uppercase tracking-widest text-muted-foreground">Players</div></div>
              <div className="rounded-xl border border-border bg-card/50 p-5"><Wifi className="h-5 w-5 text-primary" /><div className="mt-3 font-mono text-sm break-all">{data.ip}</div><div className="text-xs uppercase tracking-widest text-muted-foreground">IP</div></div>
              <div className="rounded-xl border border-border bg-card/50 p-5"><Server className="h-5 w-5 text-primary" /><div className="mt-3 font-display text-xl">SA-MP 0.3.7</div><div className="text-xs uppercase tracking-widest text-muted-foreground">Version</div></div>
            </div>
            {data.message && <div className="rounded-xl border border-primary/40 bg-primary/5 p-5 text-sm">{data.message}</div>}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
