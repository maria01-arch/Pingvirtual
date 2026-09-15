import { createClient } from "@supabase/supabase-js";

// NEVER import this into anything that runs in the browser or into a
// regular request handler that has a user session - it bypasses Row Level
// Security entirely. Use it only from the Paystack webhook, which is a
// server-to-server call with no user cookies to authenticate with.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase admin client is missing URL or service role key.");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
