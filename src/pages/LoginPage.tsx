import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';  // ✅ Chemin corrigé

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (error: any) {
      alert('Erreur : ' + error.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error: any) {
      alert('Erreur Google : ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-r from-gray-100 to-indigo-100 p-5">
      <div className="bg-white/80 backdrop-blur-lg p-10 rounded-2xl shadow-lg w-full max-w-md border border-white/30">
        <h2 className="text-3xl font-bold text-center mb-4">Connexion</h2>
        <p className="text-center text-gray-600 mb-8">Connectez-vous pour continuer</p>

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
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mt-4 py-3 border border-gray-300 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
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
