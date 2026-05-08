
-- Add update/delete policies for staff on existing tables
CREATE POLICY "staff update donations" ON public.donations FOR UPDATE USING (public.is_staff(auth.uid()));
CREATE POLICY "staff delete donations" ON public.donations FOR DELETE USING (public.is_staff(auth.uid()));
CREATE POLICY "staff delete whitelist" ON public.whitelist_applications FOR DELETE USING (public.is_staff(auth.uid()));
CREATE POLICY "staff delete messages" ON public.contact_messages FOR DELETE USING (public.is_staff(auth.uid()));
CREATE POLICY "ceo delete profiles" ON public.profiles FOR DELETE USING (public.has_role(auth.uid(),'ceo'));

-- News
CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text,
  body text NOT NULL,
  cover_url text,
  author_id uuid,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "news read public" ON public.news FOR SELECT USING (published OR public.is_staff(auth.uid()));
CREATE POLICY "staff manage news" ON public.news FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Events
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  starts_at timestamptz NOT NULL,
  location text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events read all" ON public.events FOR SELECT USING (true);
CREATE POLICY "staff manage events" ON public.events FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Factions
CREATE TABLE public.factions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  tag text,
  description text,
  color text DEFAULT '#dc2626',
  recruiting boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.factions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "factions read all" ON public.factions FOR SELECT USING (true);
CREATE POLICY "staff manage factions" ON public.factions FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Characters (in-game)
CREATE TABLE public.characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  faction_id uuid REFERENCES public.factions(id) ON DELETE SET NULL,
  level int NOT NULL DEFAULT 1,
  bio text,
  alive boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "characters read all" ON public.characters FOR SELECT USING (true);
CREATE POLICY "users manage own char" ON public.characters FOR ALL USING (auth.uid() = user_id OR public.is_staff(auth.uid())) WITH CHECK (auth.uid() = user_id OR public.is_staff(auth.uid()));

-- Tickets
CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tickets read own or staff" ON public.tickets FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY "tickets create own" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tickets staff manage" ON public.tickets FOR UPDATE USING (public.is_staff(auth.uid()));
CREATE POLICY "tickets staff delete" ON public.tickets FOR DELETE USING (public.is_staff(auth.uid()));

-- Ticket replies
CREATE TABLE public.ticket_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "replies read related" ON public.ticket_replies FOR SELECT USING (
  EXISTS(SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR public.is_staff(auth.uid())))
);
CREATE POLICY "replies create related" ON public.ticket_replies FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS(SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR public.is_staff(auth.uid())))
);

-- Bans
CREATE TABLE public.bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reason text NOT NULL,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bans read own or staff" ON public.bans FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY "staff manage bans" ON public.bans FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Audit logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  target text,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read audit" ON public.audit_logs FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "any insert audit" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() = actor_id OR auth.uid() IS NOT NULL);

-- Server status (single row updated by staff)
CREATE TABLE public.server_status (
  id int PRIMARY KEY DEFAULT 1,
  online boolean NOT NULL DEFAULT true,
  players int NOT NULL DEFAULT 0,
  max_players int NOT NULL DEFAULT 200,
  ip text DEFAULT 'mt.sa-mp.com:7777',
  message text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT one_row CHECK (id = 1)
);
ALTER TABLE public.server_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "status read all" ON public.server_status FOR SELECT USING (true);
CREATE POLICY "staff update status" ON public.server_status FOR UPDATE USING (public.is_staff(auth.uid()));
CREATE POLICY "staff insert status" ON public.server_status FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
INSERT INTO public.server_status (id, online, players, max_players, message) VALUES (1, true, 87, 200, 'Servers running smoothly. Patch 1.4 live.') ON CONFLICT DO NOTHING;

-- Forum / community posts
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts read all" ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts create auth" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts owner or staff update" ON public.posts FOR UPDATE USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY "posts staff delete" ON public.posts FOR DELETE USING (public.is_staff(auth.uid()) OR auth.uid() = user_id);

-- Seed demo content
INSERT INTO public.factions (name, tag, description, color) VALUES
('Black Hand Syndicate', 'BHS', 'Smugglers ruling the docks. They built the gunways before the dead rose.', '#dc2626'),
('Iron Wardens', 'IW', 'Ex-military survivors enforcing order in the green zones.', '#22c55e'),
('Ash Cult', 'AC', 'Believe the dead are a cleansing. Dangerous and unpredictable.', '#a855f7');

INSERT INTO public.news (title, excerpt, body) VALUES
('Patch 1.4 — Night of the Hunt', 'Heavier zombies, new weapons, faction warfare overhaul.', 'Welcome to Patch 1.4. We rebuilt the AI director, added two new districts, and rebalanced economy. Read on for full notes...'),
('Server cluster upgraded', 'Performance is +40% better.', 'We migrated to a new datacenter. Ping is down across the board.'),
('Roleplay event: The Reckoning', 'Server-wide event this Saturday at 8 PM.', 'A massive horde converges on Mystery Town. Form alliances or perish.');

INSERT INTO public.events (title, description, starts_at, location) VALUES
('The Reckoning', 'Server-wide horde event. Alliances welcome.', now() + interval '3 days', 'Old Town Square'),
('Faction Tournament', 'Best-of-five faction PvP bracket.', now() + interval '10 days', 'Arena District'),
('Lore Night', 'Voice-acted radio drama, IC only.', now() + interval '17 days', 'Radio Tower');
