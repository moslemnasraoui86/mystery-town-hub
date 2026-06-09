import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

const ROLES = [
  { title: "Senior Game Dev (SA-MP)", type: "Volunteer + revenue share", region: "Remote" },
  { title: "Lore Writer", type: "Part-time", region: "Remote" },
  { title: "Community Moderator", type: "Volunteer", region: "EU/NA" },
  { title: "Voice Actor — Faction Leaders", type: "Contract", region: "Remote" },
];

export const Route = createFileRoute("/jobs")({
  head: () => ({ meta: [{ title: "Careers — Prime RolePlay" }, { name: "description", content: "Open roles at Prime RolePlay." }]}),
  component: () => (
    <PageShell icon={Briefcase} title="Open" highlight="Roles" description="Help shape the apocalypse. Most positions are remote.">
      <div className="space-y-3">
        {ROLES.map(r => (
          <div key={r.title} className="rounded-2xl border border-border bg-card/50 p-5 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[12rem]">
              <div className="font-display text-lg">{r.title}</div>
              <div className="text-xs text-muted-foreground">{r.type} · {r.region}</div>
            </div>
            <Button asChild variant="outline"><Link to="/contact">Apply</Link></Button>
          </div>
        ))}
      </div>
    </PageShell>
  ),
});
