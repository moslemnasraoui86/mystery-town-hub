import { Palette, Droplet, Moon, Flame, Mountain } from "lucide-react";
import { useTheme, type ThemeName } from "@/lib/theme-context";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const META: Record<ThemeName, { label: string; swatch: string; icon: typeof Droplet }> = {
  blood:    { label: "Prime Blue", swatch: "oklch(0.62 0.20 255)", icon: Droplet },
  midnight: { label: "Midnight", swatch: "oklch(0.55 0.20 260)", icon: Moon },
  ember:    { label: "Ember",    swatch: "oklch(0.68 0.18 50)",  icon: Flame },
  ash:      { label: "Ash",      swatch: "oklch(0.65 0.02 200)", icon: Mountain },
};

export function ThemeToggle() {
  const { theme, setTheme, themes } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Change theme"
          className="inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <Palette className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl border-primary/30 animate-scale-in">
        {themes.map((t) => {
          const m = META[t];
          const Icon = m.icon;
          return (
            <DropdownMenuItem
              key={t}
              onClick={() => setTheme(t)}
              className={`flex items-center gap-3 cursor-pointer ${theme === t ? "bg-primary/10 text-primary font-bold" : ""}`}
            >
              <span className="h-5 w-5 rounded-full ring-2 ring-border shadow" style={{ background: m.swatch }} />
              <Icon className="h-4 w-4" />
              <span>{m.label}</span>
              {theme === t && <span className="ml-auto text-xs">✓</span>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
