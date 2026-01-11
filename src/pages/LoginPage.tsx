import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
// Assurez-vous que ce fichier existe bien à cet endroit :
import { useAuth } from '../../contexts/AuthContext'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); // Pour afficher les erreurs proprement

  // On récupère les fonctions depuis le Contexte
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(''); // Reset erreur

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      
      // Si tout est bon, on redirige
      navigate('/'); 
    } catch (error: any) {
      console.error("Erreur de login:", error);
      setErrorMsg(error.message || "Erreur lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await signInWithGoogle();
      // Pas besoin de navigate ici, Google redirige souvent automatiquement
    } catch (error: any) {
      setErrorMsg("Erreur Google : " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-r from-gray-100 to-indigo-100 p-5">
      <div className="bg-white/80 backdrop-blur-lg p-10 rounded-2xl shadow-lg w-full max-w-md border border-white/30">
        <h2 className="text-3xl font-bold text-center mb-4">Connexion</h2>
        <p className="text-center text-gray-600 mb-8">Connectez-vous pour continuer</p>

        {/* Affichage des erreurs en rouge ici si besoin */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Votre email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-3 px-10 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Mot de passe"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3 px-10 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mt-4 py-3 border border-gray-300 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {loading ? 'Connexion...' : 'Se connecter avec Google'}
        </button>

        <p className="text-center mt-6 text-gray-600 text-sm">
          Pas de compte ?{' '}
          <Link to="/auth/register" className="text-indigo-600 font-semibold">
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}