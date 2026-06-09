import { Link } from "@tanstack/react-router";
import { Skull } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-background/80">
      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2">
            <Skull className="h-6 w-6 text-primary" />
            <span className="font-display font-black tracking-wider">PRIME ROLEPLAY</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            A hardcore RP & zombies SA-MP server. Survive. Trade. Roleplay.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm mb-3 text-primary">Server</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/features" className="hover:text-foreground">Features</Link></li>
            <li><Link to="/rules" className="hover:text-foreground">Rules</Link></li>
            <li><Link to="/staff" className="hover:text-foreground">Staff</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm mb-3 text-primary">Community</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/whitelist" className="hover:text-foreground">Whitelist</Link></li>
            <li><Link to="/donate" className="hover:text-foreground">Donate</Link></li>
            <li><Link to="/gallery" className="hover:text-foreground">Gallery</Link></li>
            <li><Link to="/faq" className="hover:text-foreground">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm mb-3 text-primary">Connect</h4>
          <p className="text-sm text-muted-foreground">IP: <span className="text-foreground font-mono">play.primeroleplay.rp:7777</span></p>
          <p className="text-sm text-muted-foreground mt-2">Discord: primeroleplay</p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Prime RolePlay RP. All rights reserved.
      </div>
    </footer>
  );
}
