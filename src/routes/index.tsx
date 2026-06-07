import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Skull, Users, Shield, Trophy, Zap, Heart, ChevronRight, Crosshair, Radio } from "lucide-react";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mystery Town — Hardcore RP & Zombies SA-MP Server" },
      { name: "description", content: "Welcome to Mystery Town: a hardcore RP & zombies SA-MP server with deep economy, factions, and atmospheric lore." },
      { property: "og:url", content: "https://mystery-town-nexus.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://mystery-town-nexus.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Mystery Town",
          url: "https://mystery-town-nexus.lovable.app/",
          description: "Hardcore RP & zombies SA-MP server with deep economy, factions and atmospheric lore.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Mystery Town",
          url: "https://mystery-town-nexus.lovable.app/",
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img src={hero} alt="Mystery Town at night" width={1920} height={1080}
          className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="relative max-w-7xl mx-auto px-4 py-32 md:py-44">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-xs font-medium text-primary mb-6">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse-blood" />
            Server Online — 134/200 players
          </div>
          <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl leading-[0.95] max-w-4xl">
            SURVIVE THE <span className="text-primary text-glow">DEAD</span>.<br />
            LIVE THE <span className="text-primary text-glow">ROLE</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Mystery Town is a hardcore SA-MP RP & zombies experience. Build a character, join a faction, fight for scraps under a blood moon.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-gradient-blood shadow-blood text-base">
              <Link to="/whitelist">Apply for Whitelist <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link to="/about">Discover the World</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { v: 12000, suffix: "+", l: "Active Survivors" },
            { v: 47, suffix: "", l: "Factions" },
            { v: 200, suffix: "", l: "Player slots" },
            { v: 99.9, suffix: "%", l: "Uptime", decimals: 1 },
          ].map((s) => (
            <div key={s.l} className="text-center group">
              <div className="font-display text-3xl md:text-4xl font-black text-primary text-glow group-hover:scale-110 transition-transform duration-500">
                <AnimatedCounter value={s.v} suffix={s.suffix} decimals={s.decimals ?? 0} />
              </div>
              <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>


      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-black">A WORLD <span className="text-primary">REWRITTEN</span></h2>
          <div className="mt-3 blood-divider" />
          <p className="mt-4 text-muted-foreground">Every system rebuilt from the ground up for deep, persistent roleplay.</p>
        </div>

        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { i: Skull, t: "Hardcore Zombies", d: "Day/night infection cycles, hordes that learn, and rare mutated variants that hunt at dawn." },
            { i: Users, t: "Faction Warfare", d: "Police, gangs, scavengers, doctors. Forge alliances or burn them down." },
            { i: Shield, t: "Whitelist Only", d: "Quality over chaos. Every player passes a story-driven character review." },
            { i: Trophy, t: "Dynamic Economy", d: "Trade scrap, weapons and territory. Player-driven black markets." },
            { i: Zap, t: "Custom Scripts", d: "0.3.7 R5 with hundreds of bespoke systems: crafting, jobs, properties." },
            { i: Heart, t: "Caring Staff", d: "Active 24/7 with a transparent ticket and appeal system." },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="group relative rounded-xl border border-border bg-card/50 p-6 hover:border-primary/60 transition-all hover:shadow-blood hover:-translate-y-1">
              <div className="h-12 w-12 rounded-lg bg-gradient-blood flex items-center justify-center shadow-blood">
                <Icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mt-5 font-display text-xl">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/10 p-10 md:p-16">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Crosshair className="h-10 w-10 text-primary mb-4" />
              <h2 className="font-display text-3xl md:text-4xl font-black">Ready to enter Mystery Town?</h2>
              <p className="mt-3 text-muted-foreground">Create an account, write your character, and step into the fog.</p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Button asChild size="lg" className="bg-gradient-blood shadow-blood">
                <Link to="/register">Create Account</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/donate"><Radio className="mr-2 h-4 w-4" />Support the Server</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
