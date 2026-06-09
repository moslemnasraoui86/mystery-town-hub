import { createFileRoute, useNavigate, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { LayoutDashboard, Users, FileText, Heart, MessageSquare, Settings, ArrowLeft, Skull, Newspaper, Calendar, LifeBuoy, Ban, Swords, Activity, ScrollText, Database, BarChart3, Save, FileBarChart, Megaphone, ShieldCheck, Clock, Image, Map, KeyRound, UserCheck } from "lucide-react";
import type { PageKey } from "@/lib/permissions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Prime RolePlay" }] }),
  component: AdminLayout,
});

const NAV: { to: string; label: string; icon: any; exact?: boolean; key: PageKey }[] = [
  { to: "/admin",             label: "Overview",       icon: LayoutDashboard, exact: true, key: "admin.overview" },
  { to: "/admin/analytics",   label: "Analytics",      icon: BarChart3,       key: "admin.analytics" },
  { to: "/admin/jsonbin",     label: "JSON Database",  icon: Database,        key: "admin.jsonbin" },
  { to: "/admin/users",       label: "Users",          icon: Users,           key: "admin.users" },
  { to: "/admin/roles",       label: "Roles Manager",  icon: KeyRound,        key: "admin.roles" },
  { to: "/admin/whitelist",   label: "Whitelist",      icon: FileText,        key: "admin.whitelist" },
  { to: "/admin/characters",  label: "Char. Approvals",icon: UserCheck,       key: "admin.characters" },
  { to: "/admin/donations",   label: "Donations",      icon: Heart,           key: "admin.donations" },
  { to: "/admin/messages",    label: "Messages",       icon: MessageSquare,   key: "admin.messages" },
  { to: "/admin/news",        label: "News",           icon: Newspaper,       key: "admin.news" },
  { to: "/admin/events",      label: "Events",         icon: Calendar,        key: "admin.events" },
  { to: "/admin/factions",    label: "Factions",       icon: Swords,          key: "admin.factions" },
  { to: "/admin/tickets",     label: "Tickets",        icon: LifeBuoy,        key: "admin.tickets" },
  { to: "/admin/bans",        label: "Bans",           icon: Ban,             key: "admin.bans" },
  { to: "/admin/status",      label: "Server Status",  icon: Activity,        key: "admin.status" },
  { to: "/admin/audit",       label: "Audit Log",      icon: ScrollText,      key: "admin.audit" },
  { to: "/admin/logs",        label: "System Logs",    icon: ScrollText,      key: "admin.logs" },
  { to: "/admin/reports",     label: "Reports",        icon: FileBarChart,    key: "admin.reports" },
  { to: "/admin/backups",     label: "Backups",        icon: Save,            key: "admin.backups" },
  { to: "/admin/broadcast",   label: "Broadcast",      icon: Megaphone,       key: "admin.broadcast" },
  { to: "/admin/permissions", label: "Permissions",    icon: ShieldCheck,     key: "admin.permissions" },
  { to: "/admin/cron",        label: "Cron Jobs",      icon: Clock,           key: "admin.cron" },
  { to: "/admin/media",       label: "Media Library",  icon: Image,           key: "admin.media" },
  { to: "/admin/roadmap",     label: "Roadmap",        icon: Map,             key: "admin.roadmap" },
  { to: "/admin/settings",    label: "Settings",       icon: Settings,        key: "admin.settings" },
];

function AdminLayout() {
  const { user, isStaff, loading, canAccessPage } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: s => s.location.pathname });

  const visible = NAV.filter(n => canAccessPage(n.key));
  const hasAnyAdminAccess = isStaff || visible.length > 0;

  useEffect(() => {
    if (loading) return;
    if (!user) nav({ to: "/login" });
    else if (!hasAnyAdminAccess) nav({ to: "/dashboard" });
  }, [user, hasAnyAdminAccess, loading, nav]);

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading admin…</div>;
  if (!user || !hasAnyAdminAccess) return null;

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex flex-col w-64 border-r border-sidebar-border bg-sidebar p-4">
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <Skull className="h-7 w-7 text-primary" />
          <div>
            <div className="font-display font-black text-sm tracking-wider">PRIME ROLEPLAY</div>
            <div className="text-[10px] uppercase tracking-widest text-primary">Admin Panel</div>
          </div>
        </Link>
        <nav className="mt-6 space-y-1 flex-1 overflow-y-auto">
          {visible.map(n => {
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
        <div className="md:hidden border-b border-border bg-sidebar p-3 flex gap-2 overflow-x-auto">
          {visible.map(n => {
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
