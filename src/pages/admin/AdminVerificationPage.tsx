import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  ShieldCheck, CheckCircle, XCircle, ExternalLink, 
  User, FileText, Loader2, Search, AlertCircle 
} from 'lucide-react';

const AdminVerificationPage = () => {
  const [pendingProfiles, setPendingProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchPendingProfiles();
  }, []);

  const fetchPendingProfiles = async () => {
    try {
      setLoading(true);
      // Récupération des profils en attente avec le nom de leur profil cible
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id, full_name, email, document_url, verification_status,
          profile_types ( name )
        `)
        .eq('verification_status', 'pending');

      if (error) throw error;
      setPendingProfiles(data || []);
    } catch (error) {
      console.error("Erreur de chargement :", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (userId: string, newStatus: 'verified' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ verification_status: newStatus })
        .eq('id', userId);

      if (error) throw error;
      
      // Mise à jour locale de la liste
      setPendingProfiles(prev => prev.filter(p => p.id !== userId));
    } catch (error) {
      alert("Erreur lors de la mise à jour");
    }
  };

  const getDocUrl = (path: string) => {
    const { data } = supabase.storage.from('documents').getPublicUrl(path);
    return data.publicUrl;
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-cyan-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Validation <span className="text-cyan-400">Profils</span></h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Vérification des justificatifs de tarifs réduits</p>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold text-slate-400">
            {pendingProfiles.length} Demande(s) en attente
          </div>
        </div>

        {/* LISTE DES DEMANDES */}
        {pendingProfiles.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {pendingProfiles.map((profile) => (
              <div key={profile.id} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.07] transition-all backdrop-blur-xl">
                
                {/* Infos Utilisateur */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-cyan-400 border border-white/5">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="font-black italic uppercase text-white">{profile.full_name || "Nom inconnu"}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{profile.email}</p>
                  </div>
                </div>

                {/* Profil Demandé */}
                <div className="flex flex-col items-center md:items-start px-6 border-x border-white/5">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Type demandé</p>
                  <span className="px-3 py-1 bg-pink-500/10 text-pink-500 rounded-full text-[10px] font-black uppercase border border-pink-500/20">
                    {profile.profile_types?.name}
                  </span>
                </div>

                {/* Justificatif */}
                <div className="flex-1 flex justify-center">
                  <a 
                    href={getDocUrl(profile.document_url)} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-xl text-[10px] font-black uppercase hover:bg-cyan-500/20 transition-all border border-cyan-500/20"
                  >
                    <FileText size={16} /> Voir le document <ExternalLink size={12} />
                  </a>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => updateStatus(profile.id, 'rejected')}
                    className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                    title="Rejeter"
                  >
                    <XCircle size={24} />
                  </button>
                  <button 
                    onClick={() => updateStatus(profile.id, 'verified')}
                    className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500/20 border border-emerald-500/20 transition-all shadow-lg shadow-emerald-500/10"
                    title="Valider"
                  >
                    <CheckCircle size={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 border border-dashed border-white/10 rounded-[3rem] p-20 text-center">
            <ShieldCheck size={48} className="mx-auto text-slate-800 mb-4" />
            <p className="text-slate-500 font-black italic uppercase tracking-widest text-sm">Toutes les demandes ont été traitées</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVerificationPage;