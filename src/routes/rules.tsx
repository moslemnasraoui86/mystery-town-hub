import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

const RULES = [
  { t: "1. Respect every player", d: "OOC harassment, racism, slurs or threats result in a permanent ban." },
  { t: "2. No metagaming", d: "Information learned OOC cannot be used IC. Period." },
  { t: "3. No powergaming", d: "Force only what is realistic. Allow others to react." },
  { t: "4. Value your life", d: "Your character must fear death like a real person would." },
  { t: "5. No RDM / VDM", d: "Random kills or vehicle deathmatch are bannable on first offense." },
  { t: "6. Roleplay zombies", d: "Even the dead deserve consistency — follow infection rules." },
  { t: "7. No cheats / mods", d: "Any client modifications giving advantage = permanent ban + IP ban." },
  { t: "8. Use proper channels", d: "OOC chat for OOC. /b for brackets. Never break immersion." },
  { t: "9. Report don't retaliate", d: "Use the ticket system. Staff exist for a reason." },
  { t: "10. Have fun, but not at others' expense", d: "If your fun ruins someone else's, it's not RP — it's trolling." },
];

export const Route = createFileRoute("/rules")({
  head: () => ({
    meta: [
      { title: "Server Rules — Prime RolePlay" },
      { name: "description", content: "The ten rules every Prime RolePlay survivor must follow: respect, no metagaming, no powergaming, no RDM/VDM, no cheats and how to report issues." },
      { property: "og:title", content: "Server Rules — Prime RolePlay" },
      { property: "og:description", content: "The code of conduct for Prime RolePlay RP — breaking these is the fastest way out." },
      { property: "og:url", content: "https://prime-roleplay.lovable.app/rules" },
    ],
    links: [{ rel: "canonical", href: "https://prime-roleplay.lovable.app/rules" }],
  }),
  component: () => (
    <SiteLayout>
      <section className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="font-display text-5xl font-black">Server <span className="text-primary text-glow">Rules</span></h1>
        <div className="blood-divider mt-3" />
        <p className="mt-6 text-muted-foreground">Breaking these is the fastest way out of Prime RolePlay.</p>
        <div className="mt-10 space-y-3">
          {RULES.map((r) => (
            <div key={r.t} className="rounded-lg border border-border bg-card/50 p-5 hover:border-primary/40 transition">
              <h3 className="font-display text-lg text-primary">{r.t}</h3>
              <p className="text-sm text-muted-foreground mt-1">{r.d}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  ),
});
