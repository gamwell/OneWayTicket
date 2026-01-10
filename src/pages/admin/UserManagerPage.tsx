import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

// Typage corrigé : on définit d'abord le Profil
type Profile = {
  id: string; // ID du profil
  user_id: string; // Lien vers auth.users
  role: string;
  full_name: string | null;
  status_verification: string | null;
  profile_type: string | null;
  is_admin: boolean;
  // Optionnel : si vous avez besoin de l'email et que vous l'avez dupliqué dans profiles
  // sinon, Supabase ne permet pas de récupérer facilement l'email de auth.users via JS client
  email?: string; 
};

const UserManagerPage = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Erreur lors du chargement:", error.message);
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("user_id", userId); // Utilisez l'identifiant correct (user_id ou id selon votre schéma)

    if (!error) loadUsers();
  };

  const toggleAdmin = async (userId: string, current: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: !current })
      .eq("user_id", userId);

    if (!error) loadUsers();
  };

  if (loading)
    return <div className="text-white text-center mt-10">Chargement…</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white py-10 px-6">
      <h1 className="text-3xl font-bold mb-8">Gestion des utilisateurs</h1>

      <div className="space-y-4">
        {profiles.map((p) => (
          <div
            key={p.id}
            className="p-4 bg-slate-800 rounded-lg flex items-center justify-between border border-slate-700"
          >
            <div>
              <p className="font-semibold">{p.full_name || "Utilisateur sans nom"}</p>
              <p className="text-sm text-slate-400">Rôle : {p.role} | Type : {p.profile_type}</p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => updateRole(p.user_id, p.role === 'admin' ? 'user' : 'admin')}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition"
              >
                Changer Rôle
              </button>
              <button 
                onClick={() => toggleAdmin(p.user_id, p.is_admin)}
                className={`px-3 py-1 rounded text-sm transition ${p.is_admin ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}
              >
                {p.is_admin ? "Retirer Admin" : "Rendre Admin"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagerPage;