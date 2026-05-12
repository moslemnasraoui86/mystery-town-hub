
-- Roles registry
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  color text NOT NULL DEFAULT '#dc2626',
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission text NOT NULL,
  UNIQUE (role_id, permission)
);

CREATE TABLE public.user_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role_id)
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;

-- Permission check helper. CEO/admin in legacy user_roles get everything.
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role IN ('ceo'::app_role, 'admin'::app_role)
    )
    OR EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      JOIN public.role_permissions rp ON rp.role_id = ura.role_id
      WHERE ura.user_id = _user_id AND rp.permission = _permission
    ),
    false
  )
$$;

CREATE OR REPLACE FUNCTION public.user_permissions(_user_id uuid)
RETURNS SETOF text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT rp.permission
  FROM public.user_role_assignments ura
  JOIN public.role_permissions rp ON rp.role_id = ura.role_id
  WHERE ura.user_id = _user_id
$$;

GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.user_permissions(uuid) TO public, anon, authenticated;

-- RLS policies
CREATE POLICY "roles read auth" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "roles manage" ON public.roles FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'action:roles.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'action:roles.manage'));

CREATE POLICY "role_perms read auth" ON public.role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "role_perms manage" ON public.role_permissions FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'action:roles.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'action:roles.manage'));

CREATE POLICY "ura read self or staff" ON public.user_role_assignments FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY "ura manage" ON public.user_role_assignments FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'action:roles.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'action:roles.manage'));

-- Seed system roles
INSERT INTO public.roles (name, slug, description, color, is_system) VALUES
  ('CEO',   'ceo',   'Full access to everything',         '#dc2626', true),
  ('Admin', 'admin', 'Administrative access',             '#f59e0b', true),
  ('User',  'user',  'Default role for registered users', '#64748b', true);

-- Seed CEO with all known permissions
INSERT INTO public.role_permissions (role_id, permission)
SELECT r.id, p.perm FROM public.roles r CROSS JOIN (VALUES
  ('page:admin.overview'),('page:admin.analytics'),('page:admin.users'),
  ('page:admin.whitelist'),('page:admin.donations'),('page:admin.messages'),
  ('page:admin.news'),('page:admin.events'),('page:admin.factions'),
  ('page:admin.tickets'),('page:admin.bans'),('page:admin.status'),
  ('page:admin.audit'),('page:admin.logs'),('page:admin.reports'),
  ('page:admin.backups'),('page:admin.broadcast'),('page:admin.permissions'),
  ('page:admin.cron'),('page:admin.media'),('page:admin.roadmap'),
  ('page:admin.jsonbin'),('page:admin.settings'),('page:admin.roles'),
  ('action:roles.manage'),('action:users.edit'),('action:users.delete')
) p(perm)
WHERE r.slug = 'ceo';

-- Admin: all pages except roles + sensitive actions
INSERT INTO public.role_permissions (role_id, permission)
SELECT r.id, p.perm FROM public.roles r CROSS JOIN (VALUES
  ('page:admin.overview'),('page:admin.analytics'),('page:admin.users'),
  ('page:admin.whitelist'),('page:admin.donations'),('page:admin.messages'),
  ('page:admin.news'),('page:admin.events'),('page:admin.factions'),
  ('page:admin.tickets'),('page:admin.bans'),('page:admin.status'),
  ('page:admin.audit'),('page:admin.logs'),('page:admin.reports'),
  ('page:admin.backups'),('page:admin.broadcast'),('page:admin.permissions'),
  ('page:admin.cron'),('page:admin.media'),('page:admin.roadmap'),
  ('page:admin.jsonbin'),('page:admin.settings'),
  ('action:users.edit')
) p(perm)
WHERE r.slug = 'admin';

-- Backfill: assign system roles to existing users based on legacy user_roles
INSERT INTO public.user_role_assignments (user_id, role_id)
SELECT ur.user_id, r.id
FROM public.user_roles ur
JOIN public.roles r ON r.slug = ur.role::text
ON CONFLICT DO NOTHING;
