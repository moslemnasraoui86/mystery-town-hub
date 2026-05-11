CREATE POLICY "ceo update profiles"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));