import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase"; 
import { 
  TrendingUp, Ticket, Users, DollarSign, Loader2, Plus, 
  Sparkles, LogOut, Calendar, MapPin, Edit, Trash2,
  Shield, ShieldAlert, User, CheckCircle2, UserPlus, Copy, X, Mail
} from "lucide-react";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // États Dashboard
  const [stats, setStats] = useState({ totalRevenue: 0, totalTickets: 0, totalUsers: 0 });
  const [events, setEvents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]); // Liste des utilisateurs
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // État pour la Modal d'Invitation
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      if (!supabase) return;

      // 1. ID de l'admin connecté
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      // 2. STATS
      const { data: ticketsData } = await supabase.from("tickets").select(`final_price`);
      const tickets = ticketsData || [];
      const revenue = tickets.reduce((acc, t: any) => acc + (Number(t.final_price) || 0), 0);
      
      // 3. ÉVÉNEMENTS
      const { data: eventsData } = await supabase.from('events').select('*').order('date', { ascending: true });

      // 4. UTILISATEURS & RÔLES (MÉTHODE TABLE SÉPARÉE)
      // A. On récupère les profils
      const { data: profiles } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false });
      // B. On récupère les rôles
      const { data: rolesData } = await supabase.from('user_roles').select('*');

      // C. On fusionne pour savoir qui est admin
      const mergedUsers = (profiles || []).map(profile => {
        const roleEntry = rolesData?.find(r => r.user_id === profile.id);
        const isAdmin = roleEntry?.role_name === 'admin';
        return { 
            ...profile, 
            role: isAdmin ? 'admin' : 'member' 
        };
      });

      setStats({
        totalRevenue: revenue,
        totalTickets: tickets.length,
        totalUsers: mergedUsers.length || 0,
      });

      setEvents(eventsData || []);
      setUsers(mergedUsers);

    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdminData(); }, [fetchAdminData]);

  // --- ACTIONS ÉVÉNEMENTS ---
  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("⚠️ Supprimer cet événement est irréversible. Continuer ?")) return;
    try {
      await supabase.from('events').delete().eq('id', id);
      fetchAdminData(); // Rafraîchir
    } catch (error) { alert("Erreur suppression event."); }
  };

  // --- ACTIONS UTILISATEURS (Promotion/Rétrogradation) ---
  const toggleUserRole = async (userId: string, currentRole: string) => {
    if (userId === currentUserId) return alert("Sécurité : Vous ne pouvez pas modifier vos propres droits.");
    
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    const actionText = newRole === 'admin' ? "PROMOUVOIR Admin" : "RÉTROGRADER Membre";

    if (!window.confirm(`Voulez-vous vraiment ${actionText} cet utilisateur ?`)) return;

    try {
      if (newRole === 'admin') {
        // Ajouter dans la table user_roles
        const { error } = await supabase.from('user_roles').insert([{ user_id: userId, role_name: 'admin' }]);
        if (error) throw error;
      } else {
        // Supprimer de la table user_roles
        const { error } = await supabase.from('user_roles').delete().eq('user_id', userId);
        if (error) throw error;
      }
      
      // Mise à jour locale (Optimistic UI)
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));

    } catch (error: any) { 
        console.error(error);
        alert("Erreur : " + error.message); 
    }
  };

  // --- LOGIQUE INVITATION ---
  const handleCopyLink = () => {
    const link = `${window.location.origin}/auth/register`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMail = () => {
    const subject = "Invitation Admin OneWayTicket";
    const body = `Bonjour,\n\nJe t'invite à rejoindre l'équipe Admin de OneWayTicket.\n\n1. Crée ton compte ici : ${window.location.origin}/auth/register\n2. Préviens-moi une fois inscrit pour que je valide tes droits.\n\nCordialement.`;
    window.location.href = `mailto:${inviteEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#1a0525] flex items-center justify-center">
      <Loader2 className="animate-spin text-amber-300" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen text-white pt-28 px-6 pb-20 relative overflow-hidden" style={{ backgroundColor: '#1a0525' }}>
      
      {/* AMBIANCE */}
      <div className="fixed inset-0 z-[0] pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}></div>
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-rose-500/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-500/10 blur-[150px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* --- EN-TÊTE --- */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-4 text-amber-200">
              <Sparkles size={10} className="text-amber-300" /> Super Admin
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
              Dashboard <span className="text-amber-300">Global</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
             {/* BOUTON INVITER (NOUVEAU) */}
            <button onClick={() => setShowInviteModal(true)} className="px-5 py-4 bg-teal-500/10 border border-teal-500/30 text-teal-300 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-teal-500/20 transition-all flex items-center gap-2">
              <UserPlus size={18} /> Inviter Admin
            </button>

            <button onClick={() => navigate("/admin/events/new")} className="px-5 py-4 bg-gradient-to-r from-amber-300 to-rose-500 text-[#1a0525] rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2">
              <Plus size={18} /> Créer Event
            </button>

            <button onClick={handleLogout} className="px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-500/20 hover:text-rose-200 transition-all flex items-center gap-2">
               <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* --- STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 group">
            <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 w-fit mb-4"><DollarSign size={24} /></div>
            <p className="text-4xl font-black italic text-white mb-1">{stats.totalRevenue}€</p>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Revenu Total</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 group">
            <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400 w-fit mb-4"><Ticket size={24} /></div>
            <p className="text-4xl font-black italic text-white mb-1">{stats.totalTickets}</p>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Billets Vendus</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 group">
            <div className="p-3 bg-rose-500/20 rounded-2xl text-rose-400 w-fit mb-4"><Users size={24} /></div>
            <p className="text-4xl font-black italic text-white mb-1">{stats.totalUsers}</p>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Membres Inscrits</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* --- LISTE ÉVÉNEMENTS (GAUCHE) --- */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
            <h2 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3 text-white">
               <TrendingUp className="text-amber-300" /> Events <span className="text-white/20 text-sm not-italic font-normal">({events.length})</span>
            </h2>
            <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {events.map((event) => (
                <div key={event.id} className="bg-black/20 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                  <img src={event.image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-white/5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white line-clamp-1">{event.title}</h3>
                    <span className="text-[10px] text-amber-300 font-bold">{event.price}€</span>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/admin/events/edit/${event.id}`} className="p-2 bg-white/5 hover:text-teal-300 rounded-lg"><Edit size={16} /></Link>
                    <button onClick={() => handleDeleteEvent(event.id)} className="p-2 bg-white/5 hover:text-rose-300 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- GESTION UTILISATEURS (DROITE) - NOUVEAU --- */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
            <h2 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3 text-white">
               <Shield className="text-rose-400" /> Droits Admin <span className="text-white/20 text-sm not-italic font-normal">({users.length})</span>
            </h2>
            <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {users.map((u) => {
                const isAdmin = u.role === 'admin';
                return (
                  <div key={u.id} className={`border rounded-2xl p-4 flex items-center gap-4 ${isAdmin ? 'bg-amber-500/5 border-amber-500/20' : 'bg-black/20 border-white/5'}`}>
                    
                    {/* Icône */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-white/30'}`}>
                      {isAdmin ? <ShieldAlert size={18} /> : <User size={18} />}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 overflow-hidden">
                      <h3 className="text-sm font-bold text-white truncate">{u.full_name || "Sans nom"}</h3>
                      <p className="text-[10px] text-white/40 truncate">{u.email}</p>
                      <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${isAdmin ? 'bg-amber-500 text-[#1a0525]' : 'bg-white/10 text-white/50'}`}>
                        {isAdmin ? 'Admin' : 'Membre'}
                      </span>
                    </div>

                    {/* Bouton Action */}
                    {u.id !== currentUserId && (
                      <button onClick={() => toggleUserRole(u.id, u.role)} 
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase border transition-all hover:scale-105 ${isAdmin ? 'border-rose-500/30 text-rose-300 hover:bg-rose-500/10' : 'border-teal-500/30 text-teal-300 hover:bg-teal-500/10'}`}>
                        {isAdmin ? 'Rétrograder' : 'Promouvoir'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL D'INVITATION --- */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowInviteModal(false)}></div>
          <div className="bg-[#2a0a2e] border border-white/20 rounded-[2rem] p-8 max-w-md w-full relative z-10 shadow-2xl animate-in zoom-in duration-300">
            <button onClick={() => setShowInviteModal(false)} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/50 hover:text-white"><X size={18} /></button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-500/30">
                <UserPlus className="text-teal-300" size={32} />
              </div>
              <h3 className="text-2xl font-black italic uppercase text-white">Ajouter un <span className="text-teal-300">Admin</span></h3>
              <p className="text-white/60 text-xs mt-2">Envoyez ce lien à votre collaborateur. Une fois inscrit, il apparaîtra dans la liste pour être promu.</p>
            </div>

            <div className="space-y-4">
              <div className="bg-black/30 rounded-xl p-4 border border-white/10 flex items-center justify-between gap-3">
                <code className="text-xs text-teal-300 truncate font-mono">{window.location.origin}/auth/register</code>
                <button onClick={handleCopyLink} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70">
                  {copied ? <CheckCircle2 size={18} className="text-green-400" /> : <Copy size={18} />}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#2a0a2e] px-2 text-white/40 font-bold">OU PAR EMAIL</span></div>
              </div>

              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Email du collaborateur..." 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-300 outline-none"
                />
                <button onClick={handleSendMail} className="px-4 bg-teal-500/20 border border-teal-500/30 text-teal-300 rounded-xl hover:bg-teal-500/30 transition-all">
                  <Mail size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }`}</style>
    </div>
  );
};

export default AdminDashboardPage;