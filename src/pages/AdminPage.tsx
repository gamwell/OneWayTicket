import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type EventRow = {
  id: number;
  title: string;
  category: string;
  date: string;
  location: string;
  price: string;
  image_url: string;
  user_id?: string;
};

type UserRow = {
  id: string;
  email?: string;
  role?: string;
  is_admin?: boolean;
  has_events?: boolean;
};

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"events" | "users">("events");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [eventsList, setEventsList] = useState<EventRow[]>([]);
  const [usersList, setUsersList] = useState<UserRow[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "Tech",
    date: "",
    location: "",
    price: "",
    image_url: "",
  });

  // --- 1. SÉCURITÉ & CHARGEMENT INITIAL ---
  useEffect(() => {
    if (!user) return;
    checkAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const checkAccess = async () => {
    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("role, is_admin")
        .eq("id", user!.id)
        .single();

      if (error) {
        console.error("Erreur profil admin:", error);
      }

      if (
        !profile ||
        (profile.role !== "superadmin" &&
          profile.role !== "admin" &&
          !profile.is_admin)
      ) {
        alert("Accès refusé. Réservé au staff.");
        navigate("/");
        return;
      }

      setCheckingAuth(false);
      await Promise.all([fetchEvents(), fetchUsers()]);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la vérification des droits.");
      navigate("/");
    }
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Erreur chargement événements:", error);
      return;
    }

    setEventsList((data as EventRow[]) || []);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users_with_email").select("*");
    if (error) {
      console.error("Erreur users:", error);
      return;
    }
    setUsersList((data as UserRow[]) || []);
  };

  // --- 2. LOGIQUE ÉVÉNEMENTS ---
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const eventData = { ...formData, user_id: user.id };

      if (editingId) {
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", editingId);
        if (error) throw error;
        alert("Événement modifié ! ✅");
      } else {
        const { error } = await supabase.from("events").insert([eventData]);
        if (error) throw error;
        alert("Événement créé ! 🚀");
      }

      setFormData({
        title: "",
        category: "Tech",
        date: "",
        location: "",
        price: "",
        image_url: "",
      });
      setEditingId(null);
      await Promise.all([fetchEvents(), fetchUsers()]);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm("Supprimer cet événement définitivement ?")) return;

    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      console.error(error);
      alert("Erreur lors de la suppression.");
      return;
    }
    await Promise.all([fetchEvents(), fetchUsers()]);
  };

  const handleEditEvent = (evt: EventRow) => {
    setEditingId(evt.id);
    setFormData({
      title: evt.title || "",
      category: evt.category || "Tech",
      date: evt.date || "",
      location: evt.location || "",
      price: evt.price || "",
      image_url: evt.image_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- 3. LOGIQUE UTILISATEURS ---
  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const isAdmin = newRole === "admin";

    const { error } = await supabase
      .from("user_profiles")
      .update({ role: newRole, is_admin: isAdmin })
      .eq("id", userId);

    if (error) {
      console.error(error);
      alert("Erreur modification droits");
    } else {
      fetchUsers();
    }
  };

  if (checkingAuth)
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
        Vérification des droits...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-24 px-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
            Super Dashboard 🚀
          </h1>
          <div className="bg-white/10 p-1 rounded-lg flex">
            <button
              onClick={() => setActiveTab("events")}
              className={`px-6 py-2 rounded-md transition-all ${
                activeTab === "events"
                  ? "bg-pink-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Événements
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-2 rounded-md transition-all ${
                activeTab === "users"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Utilisateurs
            </button>
          </div>
        </div>

        {/* --- ONGLET ÉVÉNEMENTS --- */}
        {activeTab === "events" && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white/5 border border-white/10 p-6 rounded-3xl h-fit sticky top-24">
              <h2 className="text-xl font-bold mb-4 text-pink-400">
                {editingId ? "Modifier" : "Ajouter"} un événement
              </h2>
              <form onSubmit={handleEventSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Titre"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 outline-none focus:border-pink-500"
                  required
                />
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 outline-none focus:border-pink-500"
                >
                  <option value="Tech">Tech</option>
                  <option value="Musique">Musique</option>
                  <option value="Sport">Sport</option>
                  <option value="Voyage">Voyage</option>
                  <option value="Théâtre">Théâtre</option>
                  <option value="Opéra">Opéra</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Prix"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="bg-black/30 border border-white/10 rounded-lg p-3 outline-none focus:border-pink-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="bg-black/30 border border-white/10 rounded-lg p-3 outline-none focus:border-pink-500"
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Lieu"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 outline-none focus:border-pink-500"
                  required
                />
                <input
                  type="text"
                  placeholder="URL Image"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 outline-none focus:border-pink-500"
                  required
                />
                <button
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg font-bold hover:opacity-90"
                >
                  {loading ? "..." : editingId ? "Sauvegarder" : "Créer"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        title: "",
                        category: "Tech",
                        date: "",
                        location: "",
                        price: "",
                        image_url: "",
                      });
                    }}
                    className="w-full py-2 text-sm text-gray-400"
                  >
                    Annuler
                  </button>
                )}
              </form>
            </div>

            <div className="lg:col-span-2 grid gap-4">
              {eventsList.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between hover:border-pink-500/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={evt.image_url}
                      alt={evt.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-bold">{evt.title}</h3>
                      <p className="text-sm text-gray-400">{evt.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditEvent(evt)}
                      className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              {eventsList.length === 0 && (
                <p className="text-gray-400 text-sm">
                  Aucun événement pour le moment.
                </p>
              )}
            </div>
          </div>
        )}

        {/* --- ONGLET UTILISATEURS --- */}
        {activeTab === "users" && (
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl mt-6">
            <h2 className="text-xl font-bold mb-4 text-blue-400">
              Utilisateurs
            </h2>
            <div className="space-y-3">
              {usersList.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between bg-black/30 border border-white/10 rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="font-semibold">
                      {u.email || "Sans email"}{" "}
                      {u.has_events && (
                        <span className="ml-2 text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                          Actif
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      Rôle : {u.role || "user"}{" "}
                      {u.is_admin && (
                        <span className="ml-2 text-[10px] text-yellow-300">
                          (Admin)
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleUserRole(u.id, u.role || "user")}
                    className="px-3 py-1 text-xs rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                  >
                    {u.role === "admin" ? "Retirer admin" : "Passer admin"}
                  </button>
                </div>
              ))}
              {usersList.length === 0 && (
                <p className="text-gray-400 text-sm">
                  Aucun utilisateur trouvé.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;