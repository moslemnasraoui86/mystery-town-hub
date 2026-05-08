import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { GitCommit } from "lucide-react";

export const Route = createFileRoute("/changelog")({
  head: () => ({ meta: [{ title: "Changelog — Mystery Town" }] }),
  component: CL,
});

const ENTRIES = [
  { v: "1.4.2", date: "2026-05-01", changes: ["Faction warfare overhaul", "New district: Old Refinery", "Reduced loot spawn in safe zones"] },
  { v: "1.4.1", date: "2026-04-15", changes: ["Hotfix: anti-cheat false positives", "Vehicle handling tweaks"] },
  { v: "1.4.0", date: "2026-04-01", changes: ["Patch 1.4 — Night of the Hunt", "AI director rewrite", "Ten new weapons"] },
  { v: "1.3.0", date: "2026-02-12", changes: ["Crafting system", "Player housing", "Voice radio"] },
];

function CL() {
  return (
    <SiteLayout>
      <section className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="font-display text-5xl font-black">Changelog</h1>
        <div className="mt-10 space-y-6">
          {ENTRIES.map(e => (
            <div key={e.v} className="rounded-2xl border border-border bg-card/50 p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl flex items-center gap-2"><GitCommit className="h-5 w-5 text-primary" /> v{e.v}</h2>
                <span className="text-xs text-muted-foreground">{e.date}</span>
              </div>
              <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                {e.changes.map(c => <li key={c}>— {c}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
