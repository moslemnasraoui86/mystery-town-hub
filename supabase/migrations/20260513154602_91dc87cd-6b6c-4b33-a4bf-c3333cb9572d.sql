
-- Normalize existing names: replace spaces/invalid chars with underscore, ensure two parts
UPDATE public.characters
SET name = (
  CASE
    WHEN name ~ '^[A-Z][a-zA-Z]{1,30}_[A-Z][a-zA-Z]{1,30}$' THEN name
    ELSE 'Survivor_' || substr(replace(regexp_replace(initcap(name), '[^a-zA-Z]', '', 'g'), ' ', ''), 1, 20)
  END
);
-- Make sure no empty second part
UPDATE public.characters SET name = name || 'X' WHERE name ~ '_$';

ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reviewer_notes text,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- approve all existing so they don't disappear
UPDATE public.characters SET status = 'approved' WHERE status = 'pending';

-- One character per user (delete extras keeping oldest)
DELETE FROM public.characters c
USING public.characters c2
WHERE c.user_id = c2.user_id AND c.created_at > c2.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS characters_user_id_unique ON public.characters(user_id);

ALTER TABLE public.characters DROP CONSTRAINT IF EXISTS characters_name_format;
ALTER TABLE public.characters
  ADD CONSTRAINT characters_name_format
  CHECK (name ~ '^[A-Z][a-zA-Z]{1,30}_[A-Z][a-zA-Z]{1,30}$');

ALTER TABLE public.characters DROP CONSTRAINT IF EXISTS characters_status_check;
ALTER TABLE public.characters
  ADD CONSTRAINT characters_status_check
  CHECK (status IN ('pending','approved','rejected'));

DROP POLICY IF EXISTS "characters read all" ON public.characters;
DROP POLICY IF EXISTS "characters read approved or own or staff" ON public.characters;
CREATE POLICY "characters read approved or own or staff"
  ON public.characters FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id OR is_staff(auth.uid()));

DROP POLICY IF EXISTS "users manage own char" ON public.characters;
DROP POLICY IF EXISTS "users insert own char" ON public.characters;
DROP POLICY IF EXISTS "users update own pending char" ON public.characters;
DROP POLICY IF EXISTS "staff manage characters" ON public.characters;
DROP POLICY IF EXISTS "users delete own pending" ON public.characters;

CREATE POLICY "users insert own char"
  ON public.characters FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "users update own pending char"
  ON public.characters FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "staff manage characters"
  ON public.characters FOR ALL
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "users delete own pending"
  ON public.characters FOR DELETE
  USING (auth.uid() = user_id AND status = 'pending');
