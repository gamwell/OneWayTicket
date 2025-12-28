import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '90vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      // Fond chaud : Dégradé du Orange ambré vers le Bleu Profond
      background: 'linear-gradient(135deg, #FF9A8B 0%, #FF6A88 33%, #FF99AC 66%, #7c3aed 100%)',
      padding: '20px',
      fontFamily: 'sans-serif'
    }}>
      {/* Carte avec effet de flou (Glassmorphism) */}
      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.85)', 
        backdropFilter: 'blur(12px)', 
        padding: '40px', 
        borderRadius: '28px', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
        width: '100%', 
        maxWidth: '400px',
        border: '1px solid rgba(255, 255, 255, 0.4)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '16px', 
            borderRadius: '20px', 
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)', // Dégradé chaud icône
            marginBottom: '16px',
            boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.3)'
          }}>
            <LogIn style={{ color: 'white', width: '28px', height: '28px' }} />
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', margin: 0 }}>
            Bon retour
          </h2>
          <p style={{ color: '#4b5563', marginTop: '8px', fontSize: '15px' }}>
            Connectez-vous pour accéder à vos billets
          </p>
        </div>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '14px', top: '12px', width: '18px', color: '#9ca3af' }} />
              <input
                type="email"
                required
                placeholder="votre@email.com"
                style={{ 
                  width: '100%', padding: '12px 12px 12px 42px', border: '2px solid #f3f4f6', 
                  borderRadius: '14px', outline: 'none', fontSize: '15px', transition: '0.2s'
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '14px', top: '12px', width: '18px', color: '#9ca3af' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                style={{ 
                  width: '100%', padding: '12px 12px 12px 42px', border: '2px solid #f3f4f6', 
                  borderRadius: '14px', outline: 'none', fontSize: '15px', transition: '0.2s'
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '14px', 
              background: 'linear-gradient(to right, #1e1b4b, #312e81)', // Bleu nuit élégant
              color: 'white', 
              border: 'none', 
              borderRadius: '14px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '10px',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? "Chargement..." : "Se connecter"}
            {!loading && <ArrowRight style={{ width: '18px' }} />}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Pas encore de membre ?{' '}
            <Link to="/auth/register" style={{ color: '#f59e0b', fontWeight: 'bold', textDecoration: 'none', borderBottom: '2px solid #f59e0b' }}>
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}