// src/pages/admin/CategoryManagerPage.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Category = {
  id: string;
  name: string;
  created_at: string;
};

const CategoryManagerPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const loadCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    setCategories((data || []) as Category[]);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const createCategory = async () => {
    if (!newCategory.trim()) return;

    await supabase.from("categories").insert([{ name: newCategory }]);
    setNewCategory("");
    loadCategories();
  };

  const updateCategory = async (id: string) => {
    if (!editingName.trim()) return;

    await supabase.from("categories").update({ name: editingName }).eq("id", id);

    setEditingId(null);
    setEditingName("");
    loadCategories();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Supprimer cette catégorie ?")) return;

    await supabase.from("categories").delete().eq("id", id);
    loadCategories();
  };

  if (loading)
    return <div className="text-white text-center mt-10">Chargement…</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white py-10 px-6">
      <h1 className="text-3xl font-bold mb-8">Gestion des catégories</h1>

      {/* Formulaire de création */}
      <div className="bg-slate-800 p-6 rounded-xl mb-10">
        <h2 className="text-xl font-semibold mb-4">Créer une catégorie</h2>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Nom de la catégorie"
            className="flex-1 p-3 rounded bg-slate-700"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />

          <button
            onClick={createCategory}
            className="px-4 py-2 bg-emerald-500 rounded hover:bg-emerald-400 font-semibold"
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Liste des catégories */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-slate-800 p-6 rounded-xl flex justify-between items-center"
          >
            {editingId === cat.id ? (
              <input
                type="text"
                className="p-2 rounded bg-slate-700"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
              />
            ) : (
              <p className="text-lg font-semibold">{cat.name}</p>
            )}

            <div className="flex gap-3">
              {editingId === cat.id ? (
                <button
                  onClick={() => updateCategory(cat.id)}
                  className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-400"
                >
                  Enregistrer
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingId(cat.id);
                    setEditingName(cat.name);
                  }}
                  className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-400"
                >
                  Modifier
                </button>
              )}

              <button
                onClick={() => deleteCategory(cat.id)}
                className="px-4 py-2 bg-red-500 rounded hover:bg-red-400"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          Aucune catégorie pour le moment.
        </p>
      )}
    </div>
  );
};

export default CategoryManagerPage;