import { Link } from "@tanstack/react-router";
import { Home, Users, ClipboardCheck, MessagesSquare, UserSquare2 } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/forum", label: "Forum", icon: MessagesSquare },
  { to: "/whitelist", label: "Apply", icon: ClipboardCheck },
  { to: "/characters", label: "Roster", icon: Users },
  { to: "/account", label: "Me", icon: UserSquare2 },
] as const;

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/90 backdrop-blur-xl border-t border-primary/20 shadow-deep pb-[env(safe-area-inset-bottom)]">
      <ul className="flex items-stretch justify-around">
        {ITEMS.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.to} className="flex-1">
              <Link
                to={it.to}
                activeOptions={it.exact ? { exact: true } : undefined}
                className="group flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-colors"
                activeProps={{ className: "text-primary" }}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 group-hover:bg-primary/15 group-hover:-translate-y-0.5">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
