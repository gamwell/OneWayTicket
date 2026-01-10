// src/pages/admin/UserManagerPage.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type UserRow = {
  id: string;
  email: string;
  profiles?: {
    role: string;
    full_name?: string;
    status_verification?: string;
    profile_type?: string;
    is_admin?: boolean;
  };
};

const UserManagerPage = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    const { data } = await supabase
      .from("users")
      .select(`
        id,
        email,
        profiles (
          role,
          full_name,
          status_verification,
          profile_type,
          is_admin
        )
      `)
      .order("email", { ascending: true });

    setUsers((data || []) as UserRow[]);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateRole = async (userId: string, newRole: string) => {
    await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("user_id", userId);

    loadUsers();
  };

  const toggleAdmin = async (userId: string, current: boolean) => {
    await supabase
      .from("profiles")
      .update({ is_admin: !current })
      .eq("user_id", userId);

    loadUsers();
  };

  if (loading)
    return <div className="text-white text-center mt-10">Chargement…</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white py-10 px-6">
      <h1 className="text-3xl font-bold mb-8">Gestion des utilisateurs</h1>

      <div className="space-y-4">
        {users.map((u) => (
          <div
            key={u.id}
           