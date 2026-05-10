import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { MapIcon } from "lucide-react";

const REGIONS = [
  { name: "Old Town", risk: "Low", note: "Safe zone, traders, staging area." },
  { name: "The Docks", risk: "Med", note: "Smugglers, fishing, faction skirmishes." },
  { name: "The Hollows", risk: "High", note: "Permanent night, dense undead." },
  { name: "Reactor 4", risk: "Lethal", note: "Loot tier S. You will not return." },
];

export const Route = createFileRoute("/map")({
  head: () => ({ meta: [{ title: "Map & Regions — Mystery Town" }, { name: "description", content: "Mystery Town's interactive map and region risk tiers." }]}),
  component: () => (
    <PageShell icon={MapIcon} title="The" highlight="Map" description="Four regions. One way out. Choose carefully.">
      <div className="aspect-[16/8] rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-background flex items-center justify-center text-muted-foreground">Interactive map placeholder</div>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {REGIONS.map(r => (
          <div key={r.name} className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="font-display text-xl">{r.name}</div>
            <div className={`text-xs uppercase tracking-widest mt-1 ${r.risk==="Lethal"?"text-destructive":r.risk==="High"?"text-primary":"text-muted-foreground"}`}>Risk: {r.risk}</div>
            <p className="text-sm text-muted-foreground mt-3">{r.note}</p>
          </div>
        ))}
      </div>
    </PageShell>
  ),
});
