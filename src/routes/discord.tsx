import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { MessagesSquare, Users, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/discord")({
  head: () => ({ meta: [{ title: "Discord — Mystery Town" }, { name: "description", content: "Join the Mystery Town Discord — events, factions, support, friends." }]}),
  component: () => (
    <PageShell icon={MessagesSquare} title="Join the" highlight="Discord" description="6,400+ survivors. Voice chat, faction channels, staff-only office hours.">
      <div className="grid md:grid-cols-3 gap-5">
        {[
          { icon: Users, title: "6,400 members", desc: "Active across timezones, factions, and languages." },
          { icon: Bell, title: "Live events", desc: "Pinged when a horde drops or staff goes live." },
          { icon: MessagesSquare, title: "Roleplay scenes", desc: "Plan, recap, and clip your stories." },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="rounded-2xl border border-border bg-card/50 p-6">
              <Icon className="h-6 w-6 text-primary" />
              <div className="mt-3 font-display text-lg">{c.title}</div>
              <div className="text-sm text-muted-foreground mt-1">{c.desc}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-10 text-center">
        <Button size="lg" className="bg-gradient-blood shadow-blood">Open Discord invite</Button>
      </div>
    </PageShell>
  ),
});
