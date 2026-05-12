## Goal

Replace the hard-coded `user / admin / ceo` enum with a **dynamic roles system** that the CEO can manage from the admin dashboard. Each custom role carries a set of **page permissions**; the admin sidebar and route guards hide/block any page the user doesn't have permission for. The Users page gets a role assignment UI.

---

## 1. Database changes (migration)

New tables (keep `app_role` enum + `user_roles` for backwards compatibility with existing `ceo`/`admin`/`user`):

```text
roles
  id uuid pk
  name text unique         -- e.g. "Whitelister", "News Editor"
  slug text unique         -- machine key, e.g. "whitelister"
  description text
  color text               -- badge color
  is_system boolean        -- true for ceo/admin/user, cannot be deleted
  created_at timestamptz

role_permissions
  role_id uuid fk roles
  permission text          -- e.g. "page:admin.whitelist", "action:roles.manage"
  unique (role_id, permission)

user_role_assignments
  user_id uuid
  role_id uuid fk roles
  assigned_by uuid
  created_at timestamptz
  unique (user_id, role_id)
```

Seed `roles` with `ceo`, `admin`, `user` (`is_system = true`). CEO gets all permissions, admin gets all `page:admin.*` except `roles.manage` / `users.delete`, user gets none.

New SECURITY DEFINER helpers (avoid RLS recursion):

- `has_permission(_user_id uuid, _permission text) returns boolean`
  — checks `user_role_assignments → role_permissions` OR legacy `user_roles` (ceo/admin → all).
- `user_permissions(_user_id uuid) returns setof text` — list for the client.
- Keep `is_staff` and `has_role` working (treat anyone with any admin page permission as staff).

RLS:
- `roles`, `role_permissions`: readable by authenticated; write only when `has_permission(uid, 'roles.manage')`.
- `user_role_assignments`: readable by self + staff; write only with `roles.manage`.

---

## 2. Permission catalog (frontend constant)

Single source of truth in `src/lib/permissions.ts`:

```text
PAGES = [
  { key: "admin.overview",   label: "Overview",     path: "/admin" },
  { key: "admin.analytics",  label: "Analytics",    path: "/admin/analytics" },
  { key: "admin.users",      label: "Users & Roles",path: "/admin/users" },
  { key: "admin.whitelist",  label: "Whitelist",    path: "/admin/whitelist" },
  { key: "admin.donations",  label: "Donations",    path: "/admin/donations" },
  { key: "admin.messages",   label: "Messages",     path: "/admin/messages" },
  { key: "admin.news",       label: "News",         path: "/admin/news" },
  { key: "admin.events",     label: "Events",       path: "/admin/events" },
  { key: "admin.factions",   label: "Factions",     path: "/admin/factions" },
  { key: "admin.tickets",    label: "Tickets",      path: "/admin/tickets" },
  { key: "admin.bans",       label: "Bans",         path: "/admin/bans" },
  { key: "admin.status",     label: "Server Status",path: "/admin/status" },
  { key: "admin.audit",      label: "Audit Log",    path: "/admin/audit" },
  { key: "admin.logs",       label: "System Logs",  path: "/admin/logs" },
  { key: "admin.reports",    label: "Reports",      path: "/admin/reports" },
  { key: "admin.backups",    label: "Backups",      path: "/admin/backups" },
  { key: "admin.broadcast",  label: "Broadcast",    path: "/admin/broadcast" },
  { key: "admin.permissions",label: "Permissions",  path: "/admin/permissions" },
  { key: "admin.cron",       label: "Cron Jobs",    path: "/admin/cron" },
  { key: "admin.media",      label: "Media",        path: "/admin/media" },
  { key: "admin.roadmap",    label: "Roadmap",      path: "/admin/roadmap" },
  { key: "admin.jsonbin",    label: "JSON Database",path: "/admin/jsonbin" },
  { key: "admin.settings",   label: "Settings",     path: "/admin/settings" },
]

ACTIONS = [
  "roles.manage",      // create/edit/delete roles, assign to users
  "users.edit",        // edit user profiles
  "users.delete",      // delete users
]
```

Each permission is `page:<key>` or `action:<key>`.

---

## 3. Auth context update (`src/lib/auth-context.tsx`)

- Load `permissions: string[]` from `user_permissions(uid)` alongside roles.
- Expose `hasPerm(perm)` and `canAccessPage(pageKey)` helpers.
- `isCeo` / `isStaff` still derived from roles for backwards compat.

---

## 4. Admin sidebar + guards (`src/routes/admin.tsx`)

- Filter `NAV` array: `NAV.filter(n => canAccessPage(n.key))`.
- In the `useEffect` redirect: allow access if user has ANY `page:admin.*` permission (not just `isStaff`).
- Per-page guard helper for individual admin route components: redirect to `/admin` if no permission for that page key.

---

## 5. New admin page: `/admin/roles` (role manager)

`src/routes/admin.roles.tsx` — gated by `roles.manage`.

- List all roles with badge color + member count + permission count.
- "Create role" dialog: name, slug, description, color, checkbox grid of all PAGES + ACTIONS.
- "Edit role" dialog (same form, prefilled). System roles: name/slug locked, permissions still editable except `ceo` (all locked on).
- Delete role (system roles disabled). On delete, cascade `user_role_assignments` and `role_permissions`.

Add to sidebar under "Permissions" → rename existing static `admin.permissions` to "Permission Reference" and add new "Roles" entry.

---

## 6. Users page upgrades (`src/routes/admin.users.tsx`)

- Replace the two hard-coded `Make admin` / `Make ceo` buttons with a **"Manage roles"** popover/dialog per user:
  - Lists all available roles with checkboxes (current assignments pre-checked).
  - Save → diff, insert/delete `user_role_assignments` rows.
  - Show assigned role badges (color from `roles.color`) in the row.
- Keep existing edit / delete / search / stats. Stats: Total / Staff (any admin perm) / CEO.
- Gate edit & delete behind `users.edit` / `users.delete` permissions instead of `isCeo`.

---

## 7. Public site visibility

Header categories already public; no change needed there. The hide-if-no-access rule applies to admin pages only (per the user's example "Whitelister sees Whitelist page").

---

## Files

**New**
- `supabase/migrations/<ts>_dynamic_roles.sql`
- `src/lib/permissions.ts`
- `src/routes/admin.roles.tsx`

**Edited**
- `src/lib/auth-context.tsx` — load permissions, expose helpers
- `src/routes/admin.tsx` — filter nav, permission-based guard, add Roles entry
- `src/routes/admin.users.tsx` — role assignment dialog, dynamic role badges
- `src/routeTree.gen.ts` — register `/admin/roles`

---

## Out of scope (confirm before building)

- Migrating existing per-table RLS policies (`is_staff(...)`) to per-permission checks. Current plan keeps `is_staff` semantics so existing pages keep working; new role permissions only gate **page visibility** in the admin UI. Tell me if you want true per-table permission RLS too — that's a much larger migration touching every policy.
