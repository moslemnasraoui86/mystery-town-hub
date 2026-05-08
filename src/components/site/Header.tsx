import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Skull, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/news", label: "News" },
  { to: "/events", label: "Events" },
  { to: "/factions", label: "Factions" },
  { to: "/characters", label: "Roster" },
  { to: "/leaderboard", label: "Leaders" },
  { to: "/forum", label: "Forum" },
  { to: "/lore", label: "Lore" },
  { to: "/rules", label: "Rules" },
  { to: "/whitelist", label: "Whitelist" },
  { to: "/shop", label: "Shop" },
  { to: "/donate", label: "Donate" },
  { to: "/vote", label: "Vote" },
  { to: "/status", label: "Status" },
  { to: "/tickets", label: "Support" },
  { to: "/staff", label: "Staff" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, isStaff, signOut, profile } = useAuth();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Skull className="h-7 w-7 text-primary group-hover:rotate-12 transition-transform" />
          <span className="font-display font-black text-lg tracking-wider">
            MYSTERY <span className="text-primary text-glow">TOWN</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors"
              activeProps={{ className: "px-3 py-2 text-sm font-medium text-primary rounded-md" }}
            >
              {i.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
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
        <div className="lg:hidden border-t border-border bg-background/95 px-4 py-4 space-y-1">
          {NAV.map((i) => (
            <Link key={i.to} to={i.to} onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-md text-sm hover:bg-muted">
              {i.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border flex gap-2">
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
