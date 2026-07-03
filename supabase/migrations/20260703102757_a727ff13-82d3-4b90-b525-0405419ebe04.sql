
-- 1) audit_logs: drop permissive client insert policy
DROP POLICY IF EXISTS "any insert audit" ON public.audit_logs;
CREATE POLICY "staff insert audit" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND auth.uid() = actor_id);

-- 2) profiles: restrict reads to authenticated users and scrub email-like usernames
DROP POLICY IF EXISTS "profiles readable by all" ON public.profiles;
CREATE POLICY "profiles readable by authenticated" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

UPDATE public.profiles
SET username = 'user_' || substr(id::text, 1, 8)
WHERE username ~ '@';

-- Prevent future email-as-username
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_username_not_email;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_not_email CHECK (username !~ '@');

-- 3) role_permissions: staff-only read
DROP POLICY IF EXISTS "role_perms read auth" ON public.role_permissions;
CREATE POLICY "role_perms read staff" ON public.role_permissions
  FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

-- Replace ALL policy (was using has_permission, which we're switching to invoker)
DROP POLICY IF EXISTS "role_perms manage" ON public.role_permissions;
CREATE POLICY "role_perms manage ceo" ON public.role_permissions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- 4) user_role_assignments: replace manage policy to not depend on definer function
DROP POLICY IF EXISTS "ura manage" ON public.user_role_assignments;
CREATE POLICY "ura manage ceo" ON public.user_role_assignments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- 5) user_roles: restrict SELECT to own rows or staff
DROP POLICY IF EXISTS "roles readable by all authenticated" ON public.user_roles;
CREATE POLICY "user_roles read own or staff" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

-- 6) Convert has_permission and user_permissions (if present) to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role IN ('ceo'::public.app_role, 'admin'::public.app_role)
    )
    OR EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      JOIN public.role_permissions rp ON rp.role_id = ura.role_id
      WHERE ura.user_id = _user_id AND rp.permission = _permission
    ),
    false
  )
$function$;

-- Revoke broad execute; grant only to authenticated (safe because SECURITY INVOKER)
REVOKE ALL ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated, service_role;

-- If user_permissions exists as SECURITY DEFINER, rewrite to invoker
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'user_permissions'
  ) THEN
    EXECUTE $f$
      CREATE OR REPLACE FUNCTION public.user_permissions(_user_id uuid)
      RETURNS SETOF text
      LANGUAGE sql
      STABLE
      SECURITY INVOKER
      SET search_path TO 'public'
      AS $inner$
        SELECT DISTINCT rp.permission
        FROM public.user_role_assignments ura
        JOIN public.role_permissions rp ON rp.role_id = ura.role_id
        WHERE ura.user_id = _user_id
      $inner$;
    $f$;
    EXECUTE 'REVOKE ALL ON FUNCTION public.user_permissions(uuid) FROM PUBLIC, anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.user_permissions(uuid) TO authenticated, service_role';
  END IF;
END $$;

-- 7) Realtime: restrict notification channel subscriptions to owner
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif topic own only" ON realtime.messages;
CREATE POLICY "notif topic own only" ON realtime.messages
  FOR SELECT TO authenticated
  USING (
    CASE
      WHEN realtime.topic() LIKE 'notif:%'
        THEN split_part(realtime.topic(), ':', 2) = auth.uid()::text
      ELSE true
    END
  );
