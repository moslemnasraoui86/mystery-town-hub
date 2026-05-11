DROP POLICY IF EXISTS "anyone send contact" ON public.contact_messages;

CREATE POLICY "visitors can send valid contact messages"
ON public.contact_messages
FOR INSERT
WITH CHECK (
  length(trim(name)) BETWEEN 2 AND 120
  AND length(trim(email)) BETWEEN 5 AND 254
  AND email LIKE '%@%'
  AND length(trim(subject)) BETWEEN 2 AND 160
  AND length(trim(body)) BETWEEN 5 AND 5000
);