import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { ExternalLink, ThumbsUp } from "lucide-react";

export const Route = createFileRoute("/vote")({
  head: () => ({ meta: [{ title: "Vote — Prime RolePlay" }] }),
  component: VotePage,
});

const SITES = [
  { name: "SA-MP Top List", url: "#", reward: "200 in-game cash" },
  { name: "GameTracker", url: "#", reward: "1 random skin crate" },
  { name: "ServerPact", url: "#", reward: "50 reputation" },
  { name: "TopG", url: "#", reward: "150 in-game cash" },
];

function VotePage() {
  return (
    <SiteLayout>
      <section className="max-w-3xl mx-auto px-4 py-20">
        <div className="flex items-center gap-3"><ThumbsUp className="h-8 w-8 text-primary" /><h1 className="font-display text-5xl font-black">Vote for us</h1></div>
        <p className="text-muted-foreground mt-3">Help Prime RolePlay climb the ranks. Vote daily for free in-game rewards.</p>
        <div className="mt-10 space-y-3">
          {SITES.map(s => (
            <div key={s.name} className="rounded-xl border border-border bg-card/50 p-5 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg">{s.name}</h3>
                <div className="text-xs text-primary">Reward: {s.reward}</div>
              </div>
              <Button asChild className="bg-gradient-blood"><a href={s.url}>Vote <ExternalLink className="ml-1 h-3 w-3" /></a></Button>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
