import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Prime RolePlay" },
      { name: "description", content: "The story behind Prime RolePlay: an ambitious hardcore RP & zombies SA-MP server built by passionate developers, writers and roleplayers since 2021." },
      { property: "og:title", content: "About — Prime RolePlay" },
      { property: "og:description", content: "Quality over chaos — meet the team and mission behind Prime RolePlay's hardcore RP & zombies SA-MP server." },
      { property: "og:url", content: "https://prime-roleplay.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://prime-roleplay.lovable.app/about" }],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="font-display text-5xl md:text-6xl font-black">About <span className="text-primary text-glow">Prime RolePlay</span></h1>
        <div className="mt-3 blood-divider" />
        <div className="mt-10 space-y-6 text-muted-foreground leading-relaxed text-lg">
          <p>Prime RolePlay began as a single quiet settlement on the edge of the dead world. Today it stands as one of the most ambitious roleplay & zombie survival servers on SA-MP, blending tense urban exploration with deep character storytelling.</p>
          <p>Built by a team of passionate developers, writers and roleplayers, we run on heavily modified <span className="text-foreground">SA-MP 0.3.7 R5</span> with hundreds of custom scripts: persistent properties, crafting, factions, dynamic infection, weather and a player-driven economy.</p>
          <p>Our mission is simple — quality over chaos. Every survivor is whitelisted. Every staff member is trained. Every story matters.</p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-4">
          {[
            { t: "Founded", v: "2021" },
            { t: "Core Team", v: "18 members" },
            { t: "Lines of code", v: "240,000+" },
          ].map((s) => (
            <div key={s.t} className="rounded-xl border border-border bg-card/50 p-6">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.t}</div>
              <div className="mt-1 font-display text-2xl text-primary">{s.v}</div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
