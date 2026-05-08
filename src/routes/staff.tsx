import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

const STAFF = [
  { name: "Damien Cross", role: "CEO / Founder", color: "bg-gradient-blood" },
  { name: "Vera Halloway", role: "Head Admin", color: "bg-primary/30" },
  { name: "Ezra Knox", role: "Lead Developer", color: "bg-primary/30" },
  { name: "Mira Vance", role: "Community Manager", color: "bg-primary/20" },
  { name: "Soren Black", role: "Senior Moderator", color: "bg-primary/20" },
  { name: "Cassia Wren", role: "Whitelist Reviewer", color: "bg-primary/20" },
];

export const Route = createFileRoute("/staff")({
  head: () => ({ meta: [{ title: "Staff — Mystery Town" }] }),
  component: () => (
    <SiteLayout>
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h1 className="font-display text-5xl font-black text-center">Our <span className="text-primary text-glow">Staff</span></h1>
        <p className="text-center mt-4 text-muted-foreground">The ones keeping the lights on.</p>
        <div className="mt-12 grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {STAFF.map((s) => (
            <div key={s.name} className="rounded-xl border border-border bg-card/50 p-6 text-center hover:border-primary/60 hover:shadow-blood transition">
              <div className={`mx-auto h-20 w-20 rounded-full ${s.color} flex items-center justify-center font-display text-2xl font-black shadow-blood`}>
                {s.name.split(" ").map(n => n[0]).join("")}
              </div>
              <h3 className="mt-4 font-display text-lg">{s.name}</h3>
              <p className="text-sm text-primary uppercase tracking-widest mt-1">{s.role}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  ),
});
