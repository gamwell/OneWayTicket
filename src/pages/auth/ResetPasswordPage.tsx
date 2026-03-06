import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white bg-[#0f172a] px-6">
        <h1 className="text-3xl font-bold mb-4">Mot de passe mis à jour</h1>
        <p className="text-slate-400 mb-6">
          Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
        </p>
        <a
          href="/auth/login"
          className="px-6 py-3 bg-cyan-500 rounded-xl font-bold"
        >
          Se connecter
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white bg-[#0f172a] px-6">
      <h1 className="text-3xl font-bold mb-6">Réinitialiser le mot de passe</h1>

      <form
        onSubmit={handleReset}
        className="w-full max-w-md bg-white/5 p-8 rounded-2xl border border-white/10 space-y-6"
      >
        <div>
          <label className="text-xs uppercase font-bold text-slate-400">
            Nouveau mot de passe
          </label>
          <input
            type="password"
            required
            className="w-full mt-2 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm font-bold">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-cyan-500 rounded-xl font-bold text-black flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Mettre à jour"}
        </button>
      </form>
    </div>
  );
}