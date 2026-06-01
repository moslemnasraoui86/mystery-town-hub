import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://mystery-town-nexus.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const PUBLIC_ROUTES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/features", changefreq: "monthly", priority: "0.7" },
  { path: "/lore", changefreq: "monthly", priority: "0.6" },
  { path: "/factions", changefreq: "weekly", priority: "0.7" },
  { path: "/map", changefreq: "monthly", priority: "0.6" },
  { path: "/rules", changefreq: "monthly", priority: "0.7" },
  { path: "/faq", changefreq: "monthly", priority: "0.7" },
  { path: "/whitelist", changefreq: "monthly", priority: "0.9" },
  { path: "/news", changefreq: "weekly", priority: "0.8" },
  { path: "/patches", changefreq: "weekly", priority: "0.7" },
  { path: "/roadmap", changefreq: "weekly", priority: "0.6" },
  { path: "/events", changefreq: "weekly", priority: "0.6" },
  { path: "/characters", changefreq: "weekly", priority: "0.6" },
  { path: "/leaderboard", changefreq: "daily", priority: "0.5" },
  { path: "/gallery", changefreq: "weekly", priority: "0.5" },
  { path: "/screenshots", changefreq: "weekly", priority: "0.5" },
  { path: "/media", changefreq: "monthly", priority: "0.5" },
  { path: "/streamers", changefreq: "weekly", priority: "0.5" },
  { path: "/discord", changefreq: "monthly", priority: "0.6" },
  { path: "/forum", changefreq: "weekly", priority: "0.5" },
  { path: "/shop", changefreq: "monthly", priority: "0.5" },
  { path: "/donate", changefreq: "monthly", priority: "0.6" },
  { path: "/vote", changefreq: "monthly", priority: "0.5" },
  { path: "/jobs", changefreq: "monthly", priority: "0.5" },
  { path: "/partners", changefreq: "monthly", priority: "0.4" },
  { path: "/staff", changefreq: "monthly", priority: "0.5" },
  { path: "/status", changefreq: "daily", priority: "0.4" },
  { path: "/tickets", changefreq: "monthly", priority: "0.4" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
  { path: "/changelog", changefreq: "monthly", priority: "0.4" },
  { path: "/wiki", changefreq: "weekly", priority: "0.5" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/login", changefreq: "yearly", priority: "0.3" },
  { path: "/register", changefreq: "yearly", priority: "0.4" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = PUBLIC_ROUTES.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
