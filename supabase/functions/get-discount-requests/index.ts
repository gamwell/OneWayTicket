import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ✅ Vérifier admin via JWT decode (sans re-vérification)
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    let userId: string;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.sub;
      if (!userId) throw new Error("sub manquant");
    } catch {
      return new Response(JSON.stringify({ error: "Token invalide" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: profile } = await supabaseAdmin.from("user_profiles").select("is_admin").eq("id", userId).maybeSingle();
    if (!profile?.is_admin) return new Response(JSON.stringify({ error: "Accès refusé" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // GET — liste des demandes pending
    if (req.method === "GET") {
      const { data, error } = await supabaseAdmin
        .from("user_profiles")
        .select("id, email, full_name, profile_type_id, discount_justification, discount_requested_at, discount_status, document_url")
        .eq("discount_status", "pending")
        .order("discount_requested_at", { ascending: true });

      if (error) throw error;

      // Générer signed URLs pour les documents
      const requestsWithUrls = await Promise.all((data || []).map(async (r: any) => {
        let documentSignedUrl = null;
        if (r.document_url) {
          const { data: signed } = await supabaseAdmin.storage
            .from("justificatifs")
            .createSignedUrl(r.document_url, 3600); // 1h
          documentSignedUrl = signed?.signedUrl || null;
        }
        return { ...r, documentSignedUrl };
      }));

      return new Response(JSON.stringify({ requests: requestsWithUrls }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // PATCH — valider ou refuser
    if (req.method === "PATCH") {
      const { userId, action } = await req.json();
      if (!userId || !["approved", "rejected"].includes(action)) {
        return new Response(JSON.stringify({ error: "Paramètres invalides" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Récupérer email + profil avant update
      const { data: userProfile } = await supabaseAdmin
        .from("user_profiles")
        .select("email, full_name, profile_type_id")
        .eq("id", userId)
        .maybeSingle();

      const { error } = await supabaseAdmin
        .from("user_profiles")
        .update({ discount_status: action })
        .eq("id", userId);
      if (error) throw error;

      // Envoyer email de notification
      if (userProfile?.email) {
        const profileName = userProfile.profile_type_id === 2
          ? "Étudiant (-20%)"
          : userProfile.profile_type_id === 3
          ? "Senior (-25%)"
          : "Tarif réduit";

        const firstName = userProfile.full_name?.split(" ")[0] || "cher(e) client(e)";

        const subject = action === "approved"
          ? "✅ Votre tarif réduit a été validé — ONEWAYTICKET"
          : "❌ Votre demande de tarif réduit — ONEWAYTICKET";

        const text = action === "approved"
          ? `Bonjour ${firstName},\n\nBonne nouvelle ! Votre demande de tarif réduit "${profileName}" a été validée par notre équipe.\n\nVotre réduction sera automatiquement appliquée lors de votre prochain achat sur ONEWAYTICKET.\n\nMerci de votre confiance,\nL'équipe ONEWAYTICKET\nhttps://quarksydigital.com`
          : `Bonjour ${firstName},\n\nNous avons étudié votre demande de tarif réduit "${profileName}", mais nous ne sommes pas en mesure de la valider en l'état.\n\nSi vous pensez qu'il s'agit d'une erreur ou souhaitez soumettre un nouveau justificatif, contactez-nous à contact@onewayticket.fr.\n\nCordialement,\nL'équipe ONEWAYTICKET\nhttps://quarksydigital.com`;

        // Appel à la fonction send-email existante
        await supabaseAdmin.functions.invoke("send-email", {
          body: { to: userProfile.email, subject, text },
        });
      }

      return new Response(JSON.stringify({ success: true, action }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
