import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { GitCommitHorizontal } from "lucide-react";

const NOTES = [
  { v: "1.4.0", date: "2026-05-01", changes: ["New horde event: Bloodmoon", "Faction reputation rework", "Crafting recipes balance"] },
  { v: "1.3.2", date: "2026-04-12", changes: ["Anti-cheat improvements", "Vehicle physics tweaks", "Bug fixes (37)"] },
  { v: "1.3.0", date: "2026-03-20", changes: ["Permadeath toggle for casual zones", "Black market beta", "Radio system v2"] },
];

export const Route = createFileRoute("/patches")({
  head: () => ({ meta: [{ title: "Patch Notes — Prime RolePlay" }, { name: "description", content: "Every change, every version." }]}),
  component: () => (
    <PageShell icon={GitCommitHorizontal} title="Patch" highlight="Notes" description="The blow-by-blow account of every server update.">
      <div className="space-y-4">
        {NOTES.map(n => (
          <div key={n.v} className="rounded-2xl border border-border bg-card/50 p-6">
            <div className="flex items-center gap-3">
              <span className="font-display text-2xl">v{n.v}</span>
              <span className="text-xs text-muted-foreground">{n.date}</span>
            </div>
            <ul className="mt-3 space-y-1">
              {n.changes.map(c => <li key={c} className="text-sm text-muted-foreground flex gap-2"><span className="text-primary">→</span>{c}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </PageShell>
  ),
});
