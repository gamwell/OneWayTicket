import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ✅ Service role = accès total, ignore RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Vérifier que l'appelant est bien admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Token invalide" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Vérifier is_admin
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.is_admin) {
      return new Response(JSON.stringify({ error: "Accès refusé" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Action : GET = liste, PATCH = valider/refuser
    if (req.method === "GET") {
      const { data, error } = await supabaseAdmin
        .from("user_profiles")
        .select("id, email, full_name, profile_type_id, profile_types(name), discount_justification, discount_requested_at, discount_status")
        .eq("discount_status", "pending")
        .order("discount_requested_at", { ascending: true });

      if (error) throw error;

      return new Response(JSON.stringify({ requests: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (req.method === "PATCH") {
      const { userId, action } = await req.json();

      if (!userId || !["approved", "rejected"].includes(action)) {
        return new Response(JSON.stringify({ error: "Paramètres invalides" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const { error } = await supabaseAdmin
        .from("user_profiles")
        .update({ discount_status: action })
        .eq("id", userId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, action }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Méthode non supportée" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
