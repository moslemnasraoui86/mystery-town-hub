import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { SiteLayout } from "./SiteLayout";

export function PageShell({
  icon: Icon,
  eyebrow,
  title,
  highlight,
  description,
  children,
}: {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-primary">
            <Icon className="h-3 w-3" /> {eyebrow ?? title}
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-black mt-5 leading-tight">
            {title}{highlight && <> <span className="text-primary text-glow">{highlight}</span></>}
          </h1>
          {description && <p className="mt-4 max-w-2xl text-muted-foreground">{description}</p>}
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-14">{children}</section>
    </SiteLayout>
  );
}

export function FeatureGrid({ items }: { items: { icon: LucideIcon; title: string; desc: string }[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <div key={i} className="group rounded-2xl border border-border bg-card/50 p-6 hover:border-primary/60 transition hover:-translate-y-1">
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg">{it.title}</h3>
            <p className="text-sm text-muted-foreground mt-1.5">{it.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
