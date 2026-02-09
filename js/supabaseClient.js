// js/supabaseClient.js

// Supabase JS (via CDN) est chargé dans index.html (voir plus bas).
// On initialise ici un client unique.

function getSupabaseConfig() {
  const cfg = window.__SUPABASE__;
  if (!cfg || !cfg.url || !cfg.anonKey) return null;
  return cfg;
}

window.getSupabaseClient = function getSupabaseClient() {
  const cfg = getSupabaseConfig();
  if (!cfg) return null;

  // supabase est exposé globalement par le CDN (@supabase/supabase-js)
  return window.supabase.createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: false },
  });
};
