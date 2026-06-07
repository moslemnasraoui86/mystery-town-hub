import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { useRouterState } from "@tanstack/react-router";

export function SiteLayout({ children }: { children: ReactNode }) {
  const location = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main key={location} className="flex-1 animate-fade-in pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileNav />
    </div>
  );
}
