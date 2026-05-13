export type PageKey =
  | "admin.overview" | "admin.analytics" | "admin.users" | "admin.whitelist"
  | "admin.donations" | "admin.messages" | "admin.news" | "admin.events"
  | "admin.factions" | "admin.tickets" | "admin.bans" | "admin.status"
  | "admin.audit" | "admin.logs" | "admin.reports" | "admin.backups"
  | "admin.broadcast" | "admin.permissions" | "admin.cron" | "admin.media"
  | "admin.roadmap" | "admin.jsonbin" | "admin.settings" | "admin.roles" | "admin.characters";

export const PAGES: { key: PageKey; label: string; path: string }[] = [
  { key: "admin.overview",    label: "Overview",            path: "/admin" },
  { key: "admin.analytics",   label: "Analytics",           path: "/admin/analytics" },
  { key: "admin.jsonbin",     label: "JSON Database",       path: "/admin/jsonbin" },
  { key: "admin.users",       label: "Users & Roles",       path: "/admin/users" },
  { key: "admin.roles",       label: "Roles Manager",       path: "/admin/roles" },
  { key: "admin.whitelist",   label: "Whitelist",           path: "/admin/whitelist" },
  { key: "admin.donations",   label: "Donations",           path: "/admin/donations" },
  { key: "admin.messages",    label: "Messages",            path: "/admin/messages" },
  { key: "admin.news",        label: "News",                path: "/admin/news" },
  { key: "admin.events",      label: "Events",              path: "/admin/events" },
  { key: "admin.factions",    label: "Factions",            path: "/admin/factions" },
  { key: "admin.tickets",     label: "Tickets",             path: "/admin/tickets" },
  { key: "admin.bans",        label: "Bans",                path: "/admin/bans" },
  { key: "admin.status",      label: "Server Status",       path: "/admin/status" },
  { key: "admin.audit",       label: "Audit Log",           path: "/admin/audit" },
  { key: "admin.logs",        label: "System Logs",         path: "/admin/logs" },
  { key: "admin.reports",     label: "Reports",             path: "/admin/reports" },
  { key: "admin.backups",     label: "Backups",             path: "/admin/backups" },
  { key: "admin.broadcast",   label: "Broadcast",           path: "/admin/broadcast" },
  { key: "admin.permissions", label: "Permissions Ref",     path: "/admin/permissions" },
  { key: "admin.cron",        label: "Cron Jobs",           path: "/admin/cron" },
  { key: "admin.media",       label: "Media Library",       path: "/admin/media" },
  { key: "admin.roadmap",     label: "Roadmap",             path: "/admin/roadmap" },
  { key: "admin.characters",  label: "Character Approvals", path: "/admin/characters" },
  { key: "admin.settings",    label: "Settings",            path: "/admin/settings" },
];

export const ACTIONS = [
  { key: "roles.manage",  label: "Manage roles & assignments" },
  { key: "users.edit",    label: "Edit user profiles" },
  { key: "users.delete",  label: "Delete users" },
];

export const pagePerm = (k: string) => `page:${k}`;
export const actionPerm = (k: string) => `action:${k}`;
