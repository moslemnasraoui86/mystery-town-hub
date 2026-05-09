import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Skull, LogOut, Shield, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

type Item = { to: string; label: string; desc?: string };
type Category = { label: string; items: Item[] };

const CATEGORIES: Category[] = [
  {
    label: "Community",
    items: [
      { to: "/news", label: "News", desc: "Latest announcements" },
      { to: "/events", label: "Events", desc: "Upcoming RP events" },
      { to: "/forum", label: "Forum", desc: "Discuss with players" },
      { to: "/leaderboard", label: "Leaderboard", desc: "Top survivors" },
      { to: "/gallery", label: "Gallery", desc: "Screenshots & art" },
    ],
  },
  {
    label: "Roleplay",
    items: [
      { to: "/factions", label: "Factions", desc: "Gangs & guilds" },
      { to: "/characters", label: "Roster", desc: "Character directory" },
      { to: "/lore", label: "Lore", desc: "World story" },
      { to: "/rules", label: "Rules", desc: "RP guidelines" },
      { to: "/whitelist", label: "Whitelist", desc: "Apply to play" },
    ],
  },
  {
    label: "Server",
    items: [
      { to: "/status", label: "Live Status", desc: "Players online & IP" },
      { to: "/features", label: "Features", desc: "What we offer" },
      { to: "/changelog", label: "Changelog", desc: "Patch notes" },
      { to: "/staff", label: "Staff Team", desc: "Meet the crew" },
    ],
  },
  {
    label: "Support",
    items: [
      { to: "/tickets", label: "Tickets", desc: "Get help" },
      { to: "/faq", label: "FAQ", desc: "Common questions" },
      { to: "/contact", label: "Contact", desc: "Send a message" },
      { to: "/about", label: "About", desc: "Who we are" },
    ],
  },
  {
    label: "Store",
    items: [
      { to: "/donate", label: "Donate", desc: "Support the server" },
      { to: "/shop", label: "Shop", desc: "VIP perks" },
      { to: "/vote", label: "Vote", desc: "Earn rewards" },
    ],
  },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [mobileCat, setMobileCat] = useState<string | null>(null);
  const { user, isStaff, signOut, profile } = useAuth();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <Skull className="h-7 w-7 text-primary group-hover:rotate-12 transition-transform" />
          <span className="font-display font-black text-lg tracking-wider">
            MYSTERY <span className="text-primary text-glow">TOWN</span>
          </span>
        </Link>

        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link
                to="/"
                className="inline-flex h-10 items-center px-4 text-sm font-semibold rounded-md hover:bg-muted/50 transition-colors"
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: true }}
              >
                Home
              </Link>
            </NavigationMenuItem>

            {CATEGORIES.map((cat) => (
              <NavigationMenuItem key={cat.label}>
                <NavigationMenuTrigger className="bg-transparent hover:bg-muted/50 data-[state=open]:bg-muted/50 font-semibold">
                  {cat.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[420px] gap-1 p-3 md:grid-cols-2 bg-background/95 backdrop-blur-xl border border-border rounded-xl">
                    {cat.items.map((it) => (
                      <li key={it.to}>
                        <Link
                          to={it.to}
                          className="block select-none rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/30"
                        >
                          <div className="text-sm font-bold mb-1">{it.label}</div>
                          {it.desc && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {it.desc}
                            </p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {user ? (
            <>
              {isStaff && (
                <Button variant="outline" size="sm" onClick={() => nav({ to: "/admin" })}>
                  <Shield className="h-4 w-4 mr-1" /> Admin
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => nav({ to: "/dashboard" })}>
                {profile?.username ?? "Account"}
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => nav({ to: "/login" })}>Login</Button>
              <Button size="sm" className="bg-gradient-blood shadow-blood" onClick={() => nav({ to: "/register" })}>
                Join
              </Button>
            </>
          )}
        </div>

        <button className="lg:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background/95 px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
          <Link to="/" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-sm font-semibold hover:bg-muted">
            Home
          </Link>
          {CATEGORIES.map((cat) => (
            <div key={cat.label} className="border-t border-border/50 pt-1">
              <button
                onClick={() => setMobileCat(mobileCat === cat.label ? null : cat.label)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-bold uppercase tracking-wider text-primary hover:bg-muted"
              >
                {cat.label}
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileCat === cat.label ? "rotate-180" : ""}`} />
              </button>
              {mobileCat === cat.label && (
                <div className="pl-3 space-y-1">
                  {cat.items.map((it) => (
                    <Link
                      key={it.to}
                      to={it.to}
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm hover:bg-muted"
                    >
                      {it.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="pt-3 border-t border-border flex gap-2">
            {user ? (
              <>
                {isStaff && <Button size="sm" className="flex-1" variant="outline" onClick={() => { setOpen(false); nav({ to: "/admin" }); }}>Admin</Button>}
                <Button size="sm" className="flex-1" onClick={() => { setOpen(false); nav({ to: "/dashboard" }); }}>Account</Button>
                <Button size="sm" variant="ghost" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { setOpen(false); nav({ to: "/login" }); }}>Login</Button>
                <Button size="sm" className="flex-1 bg-gradient-blood" onClick={() => { setOpen(false); nav({ to: "/register" }); }}>Join</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
