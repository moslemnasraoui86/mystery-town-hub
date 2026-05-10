import { createFileRoute, useNavigate, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { LayoutDashboard, Users, FileText, Heart, MessageSquare, Settings, ArrowLeft, Skull, Newspaper, Calendar, LifeBuoy, Ban, Swords, Activity, ScrollText, Database, BarChart3, Save, FileBarChart, Megaphone, ShieldCheck, Clock, Image, Map } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Mystery Town" }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/jsonbin", label: "JSON Database", icon: Database },
  { to: "/admin/users", label: "Users & Roles", icon: Users },
  { to: "/admin/whitelist", label: "Whitelist", icon: FileText },
  { to: "/admin/donations", label: "Donations", icon: Heart },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/news", label: "News", icon: Newspaper },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/factions", label: "Factions", icon: Swords },
  { to: "/admin/tickets", label: "Tickets", icon: LifeBuoy },
  { to: "/admin/bans", label: "Bans", icon: Ban },
  { to: "/admin/status", label: "Server Status", icon: Activity },
  { to: "/admin/audit", label: "Audit Log", icon: ScrollText },
  { to: "/admin/logs", label: "System Logs", icon: ScrollText },
  { to: "/admin/reports", label: "Reports", icon: FileBarChart },
  { to: "/admin/backups", label: "Backups", icon: Save },
  { to: "/admin/broadcast", label: "Broadcast", icon: Megaphone },
  { to: "/admin/permissions", label: "Permissions", icon: ShieldCheck },
  { to: "/admin/cron", label: "Cron Jobs", icon: Clock },
  { to: "/admin/media", label: "Media Library", icon: Image },
  { to: "/admin/roadmap", label: "Roadmap", icon: Map },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const { user, isStaff, loading } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: s => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) nav({ to: "/login" });
    else if (!isStaff) nav({ to: "/dashboard" });
  }, [user, isStaff, loading, nav]);

  if (!user || !isStaff) return null;

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex flex-col w-64 border-r border-sidebar-border bg-sidebar p-4">
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <Skull className="h-7 w-7 text-primary" />
          <div>
            <div className="font-display font-black text-sm tracking-wider">MYSTERY TOWN</div>
            <div className="text-[10px] uppercase tracking-widest text-primary">Admin Panel</div>
          </div>
        </Link>
        <nav className="mt-6 space-y-1 flex-1">
          {NAV.map(n => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link key={n.to} to={n.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  active ? "bg-gradient-blood text-primary-foreground shadow-blood" : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}>
                <Icon className="h-4 w-4" />{n.label}
              </Link>
            );
          })}
        </nav>
        <Link to="/" className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Back to site
        </Link>
      </aside>

      <main className="flex-1 min-w-0">
        {/* Mobile top nav */}
        <div className="md:hidden border-b border-border bg-sidebar p-3 flex gap-2 overflow-x-auto">
          {NAV.map(n => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={`shrink-0 px-3 py-1.5 rounded-md text-xs ${active ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                {n.label}
              </Link>
            );
          })}
        </div>
        <div className="p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
