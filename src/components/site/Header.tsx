import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Menu, X, Skull, LogOut, Shield, ChevronDown,
  Users, Newspaper, CalendarDays, MessagesSquare, Trophy, Image as ImageIcon,
  Swords, UserSquare2, BookOpen, ScrollText, ClipboardCheck,
  Server, Sparkles, GitCommitHorizontal, Crown,
  LifeBuoy, HelpCircle, Mail, Info,
  HeartHandshake, ShoppingBag, ThumbsUp,
  Home as HomeIcon,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

type Item = { to: string; label: string; desc: string; icon: LucideIcon };
type Category = { label: string; icon: LucideIcon; items: Item[] };

const CATEGORIES: Category[] = [
  {
    label: "Community",
    icon: Users,
    items: [
      { to: "/news", label: "News", desc: "Latest announcements", icon: Newspaper },
      { to: "/events", label: "Events", desc: "Upcoming RP events", icon: CalendarDays },
      { to: "/forum", label: "Forum", desc: "Discuss with players", icon: MessagesSquare },
      { to: "/leaderboard", label: "Leaderboard", desc: "Top survivors", icon: Trophy },
      { to: "/gallery", label: "Gallery", desc: "Screenshots & art", icon: ImageIcon },
    ],
  },
  {
    label: "Roleplay",
    icon: Swords,
    items: [
      { to: "/factions", label: "Factions", desc: "Gangs & guilds", icon: Swords },
      { to: "/characters", label: "Roster", desc: "Character directory", icon: UserSquare2 },
      { to: "/lore", label: "Lore", desc: "World story", icon: BookOpen },
      { to: "/rules", label: "Rules", desc: "RP guidelines", icon: ScrollText },
      { to: "/whitelist", label: "Whitelist", desc: "Apply to play", icon: ClipboardCheck },
    ],
  },
  {
    label: "Server",
    icon: Server,
    items: [
      { to: "/status", label: "Live Status", desc: "Players online & IP", icon: Server },
      { to: "/features", label: "Features", desc: "What we offer", icon: Sparkles },
      { to: "/changelog", label: "Changelog", desc: "Patch notes", icon: GitCommitHorizontal },
      { to: "/staff", label: "Staff Team", desc: "Meet the crew", icon: Crown },
    ],
  },
  {
    label: "Support",
    icon: LifeBuoy,
    items: [
      { to: "/tickets", label: "Tickets", desc: "Get help", icon: LifeBuoy },
      { to: "/faq", label: "FAQ", desc: "Common questions", icon: HelpCircle },
      { to: "/contact", label: "Contact", desc: "Send a message", icon: Mail },
      { to: "/about", label: "About", desc: "Who we are", icon: Info },
    ],
  },
  {
    label: "Store",
    icon: ShoppingBag,
    items: [
      { to: "/donate", label: "Donate", desc: "Support the server", icon: HeartHandshake },
      { to: "/shop", label: "Shop", desc: "VIP perks", icon: ShoppingBag },
      { to: "/vote", label: "Vote", desc: "Earn rewards", icon: ThumbsUp },
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
          <span className="font-display font-black text-lg tracking-wider hidden sm:inline">
            MYSTERY <span className="text-primary text-glow">TOWN</span>
          </span>
        </Link>

        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList className="gap-1">
            <NavigationMenuItem>
              <Link
                to="/"
                className="inline-flex h-10 items-center gap-2 px-3 text-sm font-semibold rounded-md hover:bg-muted/50 transition-colors"
                activeProps={{ className: "text-primary bg-primary/10" }}
                activeOptions={{ exact: true }}
              >
                <HomeIcon className="h-4 w-4" />
                Home
              </Link>
            </NavigationMenuItem>

            {CATEGORIES.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <NavigationMenuItem key={cat.label}>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-muted/50 data-[state=open]:bg-primary/10 data-[state=open]:text-primary font-semibold gap-2">
                    <CatIcon className="h-4 w-4" />
                    {cat.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[460px] gap-1 p-3 md:grid-cols-2 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-blood">
                      {cat.items.map((it) => {
                        const ItIcon = it.icon;
                        return (
                          <li key={it.to}>
                            <Link
                              to={it.to}
                              className="group flex items-start gap-3 select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/30"
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <ItIcon className="h-4 w-4" />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-bold mb-1">{it.label}</span>
                                <span className="block text-xs text-muted-foreground line-clamp-2">
                                  {it.desc}
                                </span>
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              );
            })}
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
          <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold hover:bg-muted">
            <HomeIcon className="h-4 w-4 text-primary" /> Home
          </Link>
          {CATEGORIES.map((cat) => {
            const CatIcon = cat.icon;
            return (
              <div key={cat.label} className="border-t border-border/50 pt-1">
                <button
                  onClick={() => setMobileCat(mobileCat === cat.label ? null : cat.label)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-bold uppercase tracking-wider text-primary hover:bg-muted"
                >
                  <span className="flex items-center gap-2"><CatIcon className="h-4 w-4" />{cat.label}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileCat === cat.label ? "rotate-180" : ""}`} />
                </button>
                {mobileCat === cat.label && (
                  <div className="pl-3 space-y-1">
                    {cat.items.map((it) => {
                      const ItIcon = it.icon;
                      return (
                        <Link
                          key={it.to}
                          to={it.to}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted"
                        >
                          <ItIcon className="h-4 w-4 text-primary/80" /> {it.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
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
