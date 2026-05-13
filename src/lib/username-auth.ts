// Username-only auth helper: maps a username to a synthetic email for Supabase.
// We never expose the synthetic domain to the user.
export const USERNAME_DOMAIN = "mt.local";
export const usernameToEmail = (u: string) => `${u.trim().toLowerCase()}@${USERNAME_DOMAIN}`;
