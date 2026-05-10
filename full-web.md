# Mystery Town — Full Web Reference

> Single source of truth for the Mystery Town website: every page, every collection, every role, every integration. Keep this file updated when shipping new pages or features.

---

## 1. Stack

| Layer | Tech |
|---|---|
| Framework | TanStack Start v1 (React 19) |
| Bundler | Vite 7 |
| Styling | Tailwind v4 + shadcn/ui + custom design tokens (`src/styles.css`) |
| State / data | `@tanstack/react-query` |
| Backend (auth + relational) | Lovable Cloud (Supabase) |
| Backend (JSON document store) | **JSONBin via secure server proxy** |
| Hosting | Cloudflare Worker (edge) |

---

## 2. Storage model

Two storage layers run in parallel:

### 2.1 Lovable Cloud (Postgres + Auth)
Used for anything that needs **auth, RLS, queries, or relations**.

Tables: `profiles`, `user_roles`, `whitelist_applications`, `donations`, `contact_messages`, `tickets`, `ticket_replies`, `news`, `events`, `factions`, `characters`, `posts`, `bans`, `audit_logs`, `server_status`.

### 2.2 JSONBin (document mirror)
Used as a **single-file JSON database** that mirrors form submissions and stores schemaless content (broadcasts, roadmap items, generic records). The master key never reaches the browser — every read/write goes through TanStack server functions in `src/lib/jsonbin.functions.ts`:

- `appendRecord({ collection, record })`
- `listRecords({ collection })`
- `listAllCollections()`
- `deleteRecord({ collection, id })`
- `exportBin()` — full bin dump for backup

Bin shape:
```json
{ "collections": { "whitelist": [...], "donations": [...], "contact": [...], "broadcasts": [...] } }
```

Mirrored automatically from these forms: **whitelist**, **donate**, **contact**. New forms can mirror by calling `useJsonBinAppend()` from `@/lib/jsonbin-client`.

Secrets (server-only): `JSONBIN_MASTER_KEY`, `JSONBIN_BIN_ID`.

---

## 3. Roles

Stored in `user_roles` (separate from profiles) with enum `app_role = 'user' | 'admin' | 'ceo'`. The first-ever signup is auto-promoted to **ceo**.

| Role | Capabilities |
|---|---|
| user | Read public, submit forms, manage own tickets/characters |
| admin | All user caps + approve whitelist, manage news/events/factions, issue bans, reply to tickets |
| ceo | All admin caps + grant/revoke roles, delete users, full JSON DB access |

Role checks use `has_role(uid, role)` and `is_staff(uid)` SECURITY DEFINER functions to avoid recursive RLS.

---

## 4. Public pages (full list)

| Route | Purpose |
|---|---|
| `/` | Landing / hero |
| `/about` | Who we are |
| `/features` | What the server offers |
| `/news` , `/news/$id` | Announcements |
| `/events` | Upcoming RP events |
| `/forum` | Player discussions |
| `/leaderboard` | Top survivors |
| `/gallery` | Screenshots & art |
| `/discord` | Discord landing |
| `/factions` | Gang/guild directory |
| `/characters` | Character roster |
| `/lore` | World story |
| `/rules` | RP guidelines |
| `/whitelist` | Application form (mirrored to JSONBin) |
| `/wiki` | Player-built knowledge base |
| `/map` | Regions & risk tiers |
| `/status` | Live server status |
| `/changelog` | Recent commits |
| `/patches` | Versioned patch notes |
| `/roadmap` | Phased roadmap |
| `/staff` | Staff team |
| `/media` | Media hub (trailers, podcasts) |
| `/screenshots` | Hi-res screenshot vault |
| `/streamers` | Live streamers |
| `/partners` | Studios, hosts, creators |
| `/jobs` | Open roles |
| `/tickets` | Support tickets |
| `/faq` | Frequently asked |
| `/contact` | Contact form (mirrored to JSONBin) |
| `/donate` | Donation tiers (mirrored to JSONBin) |
| `/shop` | VIP perks |
| `/vote` | Vote-for-rewards |
| `/login`, `/register` | Auth |
| `/dashboard` | User dashboard |
| `/privacy`, `/terms` | Legal |

---

## 5. Admin panel (`/admin/*`)

Sidebar layout in `src/routes/admin.tsx`. Gated by `isStaff`.

| Route | Purpose |
|---|---|
| `/admin` | Overview |
| `/admin/analytics` | KPI cards (users, apps, donations…) |
| `/admin/jsonbin` | **Live JSON DB browser + delete + full-bin export** |
| `/admin/users` | Users & roles (CEO can grant/revoke/delete) |
| `/admin/whitelist` | Approve/reject applications |
| `/admin/donations` | Manage donations |
| `/admin/messages` | Contact inbox |
| `/admin/news` | News editor |
| `/admin/events` | Event manager |
| `/admin/factions` | Faction manager |
| `/admin/tickets` | Support queue |
| `/admin/bans` | Ban list |
| `/admin/status` | Server status editor |
| `/admin/audit` | Audit log |
| `/admin/logs` | System logs |
| `/admin/reports` | Aggregated reports |
| `/admin/backups` | One-click JSONBin backup |
| `/admin/broadcast` | Push announcement (saves to JSONBin) |
| `/admin/permissions` | Role/capability matrix |
| `/admin/cron` | Scheduled jobs status |
| `/admin/media` | Media library |
| `/admin/roadmap` | Roadmap editor |
| `/admin/settings` | Project settings |

---

## 6. Navigation

Header (`src/components/site/Header.tsx`) renders categories permanently in the topbar (no hamburger). Categories: **Community, Roleplay, Server, Media, Support, Store** — each is a popover with icon-tile items.

Footer (`src/components/site/Footer.tsx`) has secondary links + legal.

---

## 7. Design system

- Color tokens in `oklch` defined in `src/styles.css`
- Gradient: `--gradient-blood` (primary → primary-glow)
- Shadow: `--shadow-blood` for emphasis
- Typography: display font for headlines, body font for prose
- Animations: `float`, `scale-in`, `pulse-blood`, `tilt-3d`, `perspective-tilt`

Never hardcode colors in components — always use semantic tokens.

---

## 8. Key files

```
src/
  lib/
    auth-context.tsx          # AuthProvider + useAuth
    jsonbin.functions.ts      # server fns: append/list/delete/export
    jsonbin-client.ts         # useJsonBinAppend() hook
  components/site/
    Header.tsx                # always-visible category bar
    Footer.tsx
    SiteLayout.tsx
    PageShell.tsx             # reusable page hero + grid
    ServerStatusBadge.tsx
  routes/
    __root.tsx                # root layout w/ providers
    index.tsx                 # landing
    admin.tsx                 # admin layout
    admin.*.tsx               # admin pages (incl. /admin/jsonbin)
    *.tsx                     # all public pages above
  integrations/supabase/
    client.ts                 # browser client (auto-generated)
    client.server.ts          # admin client (auto-generated)
    auth-middleware.ts        # requireSupabaseAuth
```

---

## 9. How to add a feature

1. Public page → drop a `.tsx` file in `src/routes/`. Use `PageShell` for consistent hero.
2. Form data → call `useJsonBinAppend()("collection_name", record)` to mirror to the JSON DB. The data appears in `/admin/jsonbin` instantly.
3. Relational data → migrate via the database tool. Always add RLS policies.
4. Add the page to the right Header category in `Header.tsx`.
5. Add to admin sidebar `NAV` array if it's an admin tool.

---

## 10. Security notes

- JSONBin master key lives **only** in server env (`process.env.JSONBIN_MASTER_KEY`). Never imported in browser code.
- RLS is enforced on every Supabase table. Roles checked via `is_staff()` / `has_role()`.
- Service role key (`client.server.ts`) only used in server functions.
- All form inputs validated with Zod both client- and server-side.
