import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { BookOpen } from "lucide-react";

const TOPICS = [
  { t: "Getting Started", d: "Install, connect, first 30 minutes." },
  { t: "Combat Mechanics", d: "Stamina, bleeding, headshots, melee." },
  { t: "Survival", d: "Hunger, thirst, infection, cures." },
  { t: "Crafting", d: "Recipes, workbenches, blueprints." },
  { t: "Factions", d: "Rep, allies, war declarations." },
  { t: "Vehicles", d: "Fuel, repairs, ramming." },
  { t: "Roleplay Rules", d: "FailRP, MetaGaming, PowerGaming." },
  { t: "Economy", d: "Currency, banks, black market." },
];

export const Route = createFileRoute("/wiki")({
  head: () => ({ meta: [{ title: "Wiki — Prime RolePlay" }, { name: "description", content: "Player-maintained wiki for Prime RolePlay mechanics and lore." }]}),
  component: () => (
    <PageShell icon={BookOpen} title="The" highlight="Wiki" description="Community-built. Staff-verified.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOPICS.map(t => (
          <Link key={t.t} to="/wiki" className="rounded-2xl border border-border bg-card/50 p-5 hover:border-primary/60 transition group">
            <div className="font-display text-lg group-hover:text-primary">{t.t}</div>
            <div className="text-sm text-muted-foreground mt-1">{t.d}</div>
          </Link>
        ))}
      </div>
    </PageShell>
  ),
});
