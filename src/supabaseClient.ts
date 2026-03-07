import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("⛔️ ERREUR CRITIQUE : Les clés Supabase sont introuvables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'owt-auth',         // ✅ Clé unique pour éviter conflits
  },
  global: {
    headers: {
      'x-application-name': 'onewayticket',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}
