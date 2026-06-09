import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Skull, Users, Shield, Trophy, Zap, Heart, Hammer, Map, Radio, Briefcase, Pill, Car } from "lucide-react";

const FEATURES = [
  { i: Skull, t: "Dynamic Infection", d: "Smart hordes that adapt to player density and time of day." },
  { i: Users, t: "47+ Factions", d: "From the city PD to the Rust Mongers gang." },
  { i: Shield, t: "Whitelist System", d: "Story-driven character approval keeps the server quality high." },
  { i: Trophy, t: "Player Economy", d: "All money flows between players — no NPC cash sinks." },
  { i: Zap, t: "Real Crafting", d: "300+ recipes, weapon attachments, base building." },
  { i: Hammer, t: "Property System", d: "Buy, lock, decorate, defend your hideout." },
  { i: Map, t: "Expanded Map", d: "New zones beyond Los Santos: ports, tunnels, biolabs." },
  { i: Radio, t: "Faction Comms", d: "Encrypted radio frequencies and walkie-talkies." },
  { i: Briefcase, t: "20+ Jobs", d: "Mechanic, courier, trucker, miner, scavenger, journalist." },
  { i: Pill, t: "Medical RP", d: "Surgery, infections, prescriptions, therapy sessions." },
  { i: Car, t: "Vehicle Persistence", d: "Tuning, fuel, engine wear, theft mechanics." },
  { i: Heart, t: "Mental Health Sim", d: "Stress, fatigue, addiction systems for deep RP." },
];

export const Route = createFileRoute("/features")({
  head: () => ({ meta: [{ title: "Features — Prime RolePlay" }] }),
  component: () => (
    <SiteLayout>
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h1 className="font-display text-5xl md:text-6xl font-black text-center">Server <span className="text-primary text-glow">Features</span></h1>
        <p className="text-center mt-4 text-muted-foreground max-w-2xl mx-auto">Hundreds of systems. Here are the ones that matter.</p>
        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ i: Icon, t, d }) => (
            <div key={t} className="rounded-xl border border-border bg-card/50 p-6 hover:border-primary/60 hover:shadow-blood transition">
              <div className="h-11 w-11 rounded-lg bg-gradient-blood flex items-center justify-center"><Icon className="h-5 w-5 text-primary-foreground" /></div>
              <h3 className="mt-4 font-display text-lg">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  ),
});
