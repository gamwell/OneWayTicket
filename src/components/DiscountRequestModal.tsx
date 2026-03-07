import { useState } from "react";
import { supabase } from "../supabaseClient";
import { X, Tag, Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface Props {
  userId: string;
  onClose: () => void;
  onDiscountApplied: (type: string, rate: number) => void;
}

const PROFILE_TYPES = [
  { id: 2, name: "Étudiant",         rate: 0.20, label: "-20%", color: "border-blue-500/40 bg-blue-500/10 text-blue-300" },
  { id: 3, name: "Senior (+65 ans)", rate: 0.25, label: "-25%", color: "border-teal-500/40 bg-teal-500/10 text-teal-300" },
];

export default function DiscountRequestModal({ userId, onClose, onDiscountApplied }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [justification, setJustification] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);

  // Vérifie si une demande existe déjà
  const checkExisting = async (profileTypeId: number) => {
    const { data } = await supabase
      .from("user_profiles")
      .select("discount_status, profile_type_id")
      .eq("id", userId)
      .maybeSingle();

    if (data?.discount_status === "approved" && data?.profile_type_id === profileTypeId) {
      // Déjà approuvé → applique directement
      const type = PROFILE_TYPES.find(p => p.id === profileTypeId);
      if (type) onDiscountApplied(type.name, type.rate);
      onClose();
      return true;
    }
    if (data?.discount_status === "pending") {
      setExistingStatus("pending");
      return true;
    }
    if (data?.discount_status === "rejected") {
      setExistingStatus("rejected");
      return true;
    }
    setExistingStatus(null);
    return false;
  };

  const handleSelectType = async (id: number) => {
    setSelected(id);
    setExistingStatus(null);
    await checkExisting(id);
  };

  const handleSubmit = async () => {
    if (!selected || !justification.trim()) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          profile_type_id: selected,
          discount_status: "pending",
          discount_justification: justification.trim(),
          discount_requested_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (!error) setSent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#1a0525] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors">
          <X size={20} />
        </button>

        {sent ? (
          /* ✅ Confirmation envoi */
          <div className="text-center py-4">
            <Clock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl font-black uppercase italic mb-2">Demande envoyée !</h2>
            <p className="text-white/50 text-sm mb-6">
              Votre demande de tarif réduit est en cours de validation par notre équipe. Une fois approuvée, la réduction sera automatiquement appliquée à vos prochains achats.
            </p>
            <p className="text-white/30 text-xs mb-6">
              Délai de traitement : 24–48h ouvrées
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-amber-400 text-black font-black uppercase rounded-2xl hover:bg-amber-300 transition-all"
            >
              Continuer sans réduction
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-500/20 rounded-2xl flex items-center justify-center">
                <Tag className="text-teal-400" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase italic">Tarif réduit</h2>
                <p className="text-white/40 text-xs">Choisissez votre profil</p>
              </div>
            </div>

            {/* Choix du profil */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {PROFILE_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleSelectType(type.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selected === type.id
                      ? type.color + " scale-[1.02]"
                      : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  <p className="font-black text-sm">{type.name}</p>
                  <p className={`text-xl font-black mt-1 ${selected === type.id ? "" : "text-white/30"}`}>
                    {type.label}
                  </p>
                </button>
              ))}
            </div>

            {/* État de la demande existante */}
            {existingStatus === "pending" && (
              <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-4">
                <Clock className="text-amber-400 flex-shrink-0" size={18} />
                <p className="text-amber-300 text-sm font-bold">
                  Demande déjà en attente de validation. Continuez votre achat au tarif normal.
                </p>
              </div>
            )}

            {existingStatus === "rejected" && (
              <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl mb-4">
                <AlertTriangle className="text-rose-400 flex-shrink-0" size={18} />
                <p className="text-rose-300 text-sm font-bold">
                  Votre dernière demande a été refusée. Contactez-nous si vous pensez qu'il s'agit d'une erreur.
                </p>
              </div>
            )}

            {/* Justificatif */}
            {selected && !existingStatus && (
              <div className="mb-6">
                <label className="text-white/50 text-xs uppercase tracking-wider font-bold mb-2 block">
                  Justificatif *
                </label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder={
                    selected === 2
                      ? "Ex : Carte étudiant 2024-2025, université Paris-Sorbonne, n° 123456..."
                      : "Ex : CNI n° 123456789, né(e) le 01/01/1958..."
                  }
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-teal-400/50 text-sm resize-none"
                />
                <p className="text-white/20 text-xs mt-1">
                  ⚠️ Ces informations seront vérifiées par notre équipe. Fausse déclaration = annulation de la réduction.
                </p>
              </div>
            )}

            {/* Boutons */}
            <div className="flex flex-col gap-3">
              {selected && !existingStatus && (
                <button
                  onClick={handleSubmit}
                  disabled={!justification.trim() || loading}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-white font-black uppercase rounded-2xl transition-all disabled:opacity-40"
                >
                  {loading ? "Envoi..." : "Envoyer la demande"}
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-3 bg-white/5 border border-white/10 text-white/50 font-bold uppercase rounded-2xl hover:bg-white/10 transition-all text-sm"
              >
                Continuer sans réduction
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
