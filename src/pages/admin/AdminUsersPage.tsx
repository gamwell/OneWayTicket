import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const AdminUsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      const { data, error } = await supabase.from("profiles").select("*");

      if (error) {
        console.error("Erreur chargement utilisateurs :", error);
      } else {
        setUsers(data || []);
      }

      setLoading(false);
    };

    loadUsers();
  }, []);

  if (loading) return <div className="text-white text-center mt-10">Chargement…</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10">
      <h1 className="text-3xl font-bold mb-6">Utilisateurs</h1>

      <table className="w-full bg-slate-800 rounded-xl overflow-hidden">
        <thead className="bg-slate-700">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Rôle</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-slate-700">
              <td className="p-3">{u.id}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsersPage;