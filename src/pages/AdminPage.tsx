import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // États de navigation et chargement
  const [activeTab, setActiveTab] = useState<'events' | 'users'>('events');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Données récupérées
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);

  // Formulaire Événement
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '', category: 'Tech', date: '', location: '', price: '', image: ''
  });

  // --- 1. SÉCURITÉ & CHARGEMENT INITIAL ---
  useEffect(() => {
    checkAccess();
  }, [user]);

  const checkAccess = async () => {
    if (!user) return;
    
    // On vérifie si l'utilisateur est admin ou superadmin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, is_admin')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'superadmin' && profile.role !== 'admin' && !profile.is_admin)) {
      alert("Accès refusé. Réservé au staff.");
      navigate('/');
    } else {
      setCheckingAuth(false);
      fetchEvents();
      fetchUsers(); // Charge les utilisateurs ET l'info 'has_events'
    }
  };

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('id', { ascending: false });
    setEventsList(data || []);
  };

  const fetchUsers = async () => {
    // On appelle la vue SQL que tu viens de réparer
    const { data, error } = await supabase.from('users_with_email').select('*');
    if (error) console.error("Erreur users:", error);
    else setUsersList(data || []);
  };

  // --- 2. LOGIQUE ÉVÉNEMENTS ---
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // On ajoute l'ID de l'utilisateur qui crée l'événement
      const eventData = { ...formData, user_id: user?.id };

      if (editingId) {
        await supabase.from('events').update(eventData).eq('id', editingId);
        alert("Événement modifié ! ✅");
      } else {
        await supabase.from('events').insert([eventData]);
        alert("Événement créé ! 🚀");
      }
      setFormData({ title: '', category: 'Tech', date: '', location: '', price: '', image: '' });
      setEditingId(null);
      fetchEvents();
      fetchUsers(); // On rafraîchit pour mettre à jour le statut "Actif"
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (confirm("Supprimer cet événement définitivement ?")) {
      await supabase.from('events').delete().eq('id', id);
      fetchEvents();
      fetchUsers();
    }
  };

  const handleEditEvent = (evt: any) => {
    setEditingId(evt.id);
    setFormData({ 
      title: evt.title, category: evt.category, date: evt.date, 
      location: evt.location, price: evt.price, image: evt.image 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- 3. LOGIQUE UTILISATEURS ---
  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const isAdmin = newRole === 'admin';

    const { error } = await supabase
      .from('user_profiles')
      .update({ role: newRole, is_admin: isAdmin })
      .eq('id', userId);

    if (error) alert("Erreur modification droits");
    else fetchUsers();
  };

  if (checkingAuth) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Vérification des droits...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-24 px-4 pb-20">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
            Super Dashboard 🚀
          </h1>
          <div className="bg-white/10 p-1 rounded-lg flex">
            <button onClick={() => setActiveTab('events')} className={`px-6 py-2 rounded-md transition-all ${activeTab === 'events' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'}`}>Événements</button>
            <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-md transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Utilisateurs</button>
          </div>
        </div>

        {/* --- ONGLET ÉVÉNEMENTS --- */}
        {activeTab === 'events' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white/5 border border-white/10 p-6 rounded-3xl h-fit sticky top-24">
              <h2 className="text-xl font-bold mb-4 text-pink-400">{editingId ? 'Modifier' : 'Ajouter'} un événement</h2>
              <form onSubmit={handleEventSubmit} className="space-y-3">
                <input type="text" placeholder="Titre" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 outline-none focus:border-pink-500" required />
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 outline-none focus:border-pink-500">
                  <option value="Tech">Tech</option><option value="Musique">Musique</option><option value="Sport">Sport</option><option value="Voyage">Voyage</option><option value="Théâtre">Théâtre</option><option value="Opéra">Opéra</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Prix" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-black/30 border border-white/10 rounded-lg p-3 outline-none focus:border-pink-500" required />
                  <input type="text" placeholder="Date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-black/30 border border-white/10 rounded-lg p-3 outline-none focus:border-pink-500" required />
                </div>
                <input type="text" placeholder="Lieu" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 outline-none focus:border-pink-500" required />
                <input type="text" placeholder="URL Image" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 outline-none focus:border-pink-500" required />
                <button disabled={loading} className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg font-bold hover:opacity-90">{loading ? '...' : (editingId ? 'Sauvegarder' : 'Créer')}</button>
                {editingId && <button type="button" onClick={() => {setEditingId(null); setFormData({title:'', category:'Tech', date:'', location:'', price:'', image:''})}} className="w-full py-2 text-sm text-gray-400">Annuler</button>}
              </form>
            </div>

            <div className="lg:col-span-2 grid gap-4">
              {eventsList.map(evt => (
                <div key={evt.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between hover:border-pink-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <img src={evt.image} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    <div><h3 className="font-bold">{evt.title}</h3><p className="text-sm text-gray-400">{evt.date}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditEvent(evt)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">✏️</button>
                    <button onClick={() => handleDeleteEvent(evt.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ONGLET UTILISATEURS --- */}
        {activeTab === 'users' && (
          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-bold text-blue-400">Gestion du Staff</h2>
              <p className="text-sm text-gray-400">La colonne "Actif" indique si l'utilisateur a créé des événements.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/20 text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="p-4">Nom</th>
                    <th className="p-4">Email</th>
                    <th className="p-4 text-center">Actif ?</th> {/* Nouvelle colonne */}
                    <th className="p-4">Rôle</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usersList.map(u => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold">{u.full_name || 'Inconnu'}</td>
                      <td className="p-4 text-gray-400">{u.email}</td>
                      
                      {/* Affichage de la donnée récupérée grâce à ton script SQL */}
                      <td className="p-4 text-center">
                        {u.has_events === '✓' 
                          ? <span className="text-green-400 bg-green-400/10 px-2 py-1 rounded">Oui</span> 
                          : <span className="text-gray-600">-</span>}
                      </td>

                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          u.role === 'superadmin' ? 'bg-purple-500/20 text-purple-400' : 
                          (u.role === 'admin' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400')
                        }`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== 'superadmin' && (
                          <button 
                            onClick={() => toggleUserRole(u.id, u.role)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                              u.role === 'admin' ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                            }`}
                          >
                            {u.role === 'admin' ? 'Retirer Admin' : 'Nommer Admin'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPage;