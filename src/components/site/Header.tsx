import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Skull, LogOut, Shield,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const { user, isStaff, signOut, profile } = useAuth();
  const nav = useNavigate();
  const [openCat, setOpenCat] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/75 border-b border-border shadow-deep">
      {/* Row 1: brand + auth */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group shrink-0 perspective-tilt">
          <span className="relative">
            <Skull className="h-8 w-8 text-primary group-hover:rotate-[18deg] group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_12px_oklch(0.55_0.22_27/0.7)]" />
            <span className="absolute inset-0 rounded-full bg-primary/30 blur-xl animate-pulse-blood -z-10" />
          </span>
          <span className="font-display font-black text-base sm:text-lg tracking-wider">
            MYSTERY <span className="text-primary text-glow">TOWN</span>
          </span>
        </Link>

        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-2 px-3 h-9 text-sm font-semibold rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
          activeProps={{ className: "text-primary bg-primary/10" }}
          activeOptions={{ exact: true }}
        >
          <HomeIcon className="h-4 w-4" />
          Home
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <>
              {isStaff && (
                <Button variant="outline" size="sm" onClick={() => nav({ to: "/admin" })} className="hidden sm:inline-flex">
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
              <Button size="sm" className="bg-gradient-blood shadow-blood hover:scale-105 transition-transform" onClick={() => nav({ to: "/register" })}>
                Join
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Row 2: ALWAYS-VISIBLE category bar (scrollable on mobile) */}
      <div className="border-t border-border/60 bg-background/40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-2">
            {CATEGORIES.map((cat) => {
              const CatIcon = cat.icon;
              const isOpen = openCat === cat.label;
              return (
                <Popover
                  key={cat.label}
                  open={isOpen}
                  onOpenChange={(o) => setOpenCat(o ? cat.label : null)}
                >
                  <PopoverTrigger asChild>
                    <button
                      className={`group relative flex items-center gap-2 px-3 sm:px-4 h-10 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-all duration-300 border ${
                        isOpen
                          ? "bg-primary/15 text-primary border-primary/40 shadow-blood"
                          : "border-transparent hover:bg-primary/10 hover:text-primary hover:border-primary/30 hover:-translate-y-0.5"
                      }`}
                    >
                      <span className={`flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary transition-all duration-500 ${isOpen ? "rotate-12 scale-110" : "group-hover:rotate-12 group-hover:scale-110 group-hover:animate-float"}`}>
                        <CatIcon className="h-3.5 w-3.5" />
                      </span>
                      {cat.label}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    sideOffset={10}
                    className="w-[92vw] max-w-[480px] p-3 bg-background/95 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-blood animate-scale-in tilt-3d"
                  >
                    <div className="grid gap-1 sm:grid-cols-2">
                      {cat.items.map((it) => {
                        const ItIcon = it.icon;
                        return (
                          <Link
                            key={it.to}
                            to={it.to}
                            onClick={() => setOpenCat(null)}
                            className="group flex items-start gap-3 rounded-xl p-3 outline-none transition-all duration-300 hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/40 hover:translate-x-1 hover:-translate-y-0.5"
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-blood text-primary-foreground shadow-blood transition-transform duration-500 group-hover:rotate-[14deg] group-hover:scale-110">
                              <ItIcon className="h-5 w-5" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-bold mb-0.5">{it.label}</span>
                              <span className="block text-xs text-muted-foreground line-clamp-2">
                                {it.desc}
                              </span>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
