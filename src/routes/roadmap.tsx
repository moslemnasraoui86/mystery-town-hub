import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { Map, CheckCircle2, Circle, Clock } from "lucide-react";

export const Route = createFileRoute("/roadmap")({
  head: () => ({ meta: [
    { title: "Roadmap — Mystery Town" },
    { name: "description", content: "Where Mystery Town is heading: shipped features, in-progress work, and what's next." },
  ]}),
  component: RoadmapPage,
});

const PHASES = [
  { status: "done", title: "Foundation", items: ["Whitelist system", "Faction infrastructure", "Server status API", "Auth & roles"] },
  { status: "doing", title: "Q2 — Living World", items: ["Dynamic horde events", "Persistent crafting", "Black market economy", "Radio frequencies"] },
  { status: "next", title: "Q3 — Apocalypse", items: ["Weather system", "Survivor camps", "Faction wars 2.0", "Mod manager"] },
  { status: "next", title: "Q4 — Beyond", items: ["Mobile companion app", "Custom map regions", "Streamer tools", "Tournament mode"] },
];

function RoadmapPage() {
  return (
    <PageShell icon={Map} title="The" highlight="Roadmap" description="Public roadmap. We ship in the open.">
      <div className="space-y-6">
        {PHASES.map((p, i) => {
          const Icon = p.status === "done" ? CheckCircle2 : p.status === "doing" ? Clock : Circle;
          return (
            <div key={i} className="rounded-2xl border border-border bg-card/50 p-6">
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${p.status === "done" ? "text-green-400" : p.status === "doing" ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                <h2 className="font-display text-2xl">{p.title}</h2>
                <span className="ml-auto text-xs uppercase tracking-widest text-muted-foreground">{p.status}</span>
              </div>
              <ul className="mt-4 grid sm:grid-cols-2 gap-2">
                {p.items.map(x => <li key={x} className="text-sm text-muted-foreground flex gap-2"><span className="text-primary">✦</span>{x}</li>)}
              </ul>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
