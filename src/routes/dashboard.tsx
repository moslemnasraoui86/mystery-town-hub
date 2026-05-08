import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skull, Shield, FileText, Heart } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Mystery Town" }] }),
  component: Dash,
});

function Dash() {
  const { user, profile, roles, loading, isStaff } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!loading && !user) nav({ to: "/login" }); }, [user, loading, nav]);
  if (!user) return null;

  return (
    <SiteLayout>
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-blood flex items-center justify-center shadow-blood">
            <Skull className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black">Welcome, {profile?.display_name ?? profile?.username}</h1>
            <div className="flex gap-2 mt-1">
              {roles.map(r => (
                <span key={r} className={`text-xs px-2 py-0.5 rounded-full uppercase font-bold tracking-widest ${
                  r === "ceo" ? "bg-gradient-blood text-primary-foreground" :
                  r === "admin" ? "bg-primary/30 text-primary" :
                  "bg-muted text-muted-foreground"
                }`}>{r}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-4">
          <Link to="/whitelist" className="rounded-xl border border-border bg-card/50 p-6 hover:border-primary/60 hover:shadow-blood transition">
            <FileText className="h-8 w-8 text-primary" />
            <h3 className="mt-3 font-display text-lg">Whitelist</h3>
            <p className="text-sm text-muted-foreground mt-1">Apply or check status.</p>
          </Link>
          <Link to="/donate" className="rounded-xl border border-border bg-card/50 p-6 hover:border-primary/60 hover:shadow-blood transition">
            <Heart className="h-8 w-8 text-primary" />
            <h3 className="mt-3 font-display text-lg">Donate</h3>
            <p className="text-sm text-muted-foreground mt-1">Support development.</p>
          </Link>
          {isStaff && (
            <Link to="/admin" className="rounded-xl border border-primary/40 bg-gradient-to-br from-card to-primary/10 p-6 hover:border-primary hover:shadow-blood transition">
              <Shield className="h-8 w-8 text-primary" />
              <h3 className="mt-3 font-display text-lg">Admin Panel</h3>
              <p className="text-sm text-muted-foreground mt-1">Manage server.</p>
            </Link>
          )}
        </div>

        <div className="mt-8">
          <Button variant="outline" asChild><Link to="/">Back to site</Link></Button>
        </div>
      </section>
    </SiteLayout>
  );
}
