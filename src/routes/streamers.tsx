import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { Twitch } from "lucide-react";

export const Route = createFileRoute("/streamers")({
  head: () => ({ meta: [{ title: "Streamers — Prime RolePlay" }, { name: "description", content: "Watch Prime RolePlay live. Follow your favorites." }]}),
  component: () => (
    <PageShell icon={Twitch} title="Live" highlight="Streamers" description="Prime RolePlay streamers, ranked by recent activity.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {["NoxRP","CrimsonShade","DeadCityDan","HordeQueen","BunkerBob","MidnightMia"].map(n => (
          <div key={n} className="rounded-2xl border border-border bg-card/50 p-5 hover:border-primary/60 transition">
            <div className="h-10 w-10 rounded-full bg-gradient-blood" />
            <div className="mt-3 font-display text-lg">{n}</div>
            <div className="text-xs text-muted-foreground">Live · 248 viewers</div>
          </div>
        ))}
      </div>
    </PageShell>
  ),
});
