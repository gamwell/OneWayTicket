import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [prenom, setPrenom] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { prenom: prenom },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      alert("Inscription réussie ! Vérifiez vos e-mails pour confirmer votre compte.");
      navigate('/auth/login');
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '90vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #fffcf0 0%, #e0e7ff 100%)', // Même fond chaud que Login
      padding: '20px',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(10px)', 
        padding: '40px', 
        borderRadius: '24px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)', 
        width: '100%', 
        maxWidth: '420px',
        border: '1px solid rgba(255, 255, 255, 0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '15px', 
            borderRadius: '20px', 
            background: 'linear-gradient(to bottom right, #f59e0b, #ef4444)', 
            marginBottom: '15px' 
          }}>
            <UserPlus style={{ color: 'white', width: '30px', height: '30px' }} />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            Créer un compte
          </h2>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>Rejoignez l'aventure ONEWAYTICKET</p>
        </div>
        
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Prénom</label>
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: '12px', top: '12px', width: '18px', color: '#9ca3af' }} />
              <input
                type="text"
                required
                placeholder="Votre prénom"
                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #e5e7eb', borderRadius: '12px', outline: 'none' }}
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '12px', top: '12px', width: '18px', color: '#9ca3af' }} />
              <input
                type="email"
                required
                placeholder="votre@email.com"
                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #e5e7eb', borderRadius: '12px', outline: 'none' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '12px', top: '12px', width: '18px', color: '#9ca3af' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #e5e7eb', borderRadius: '12px', outline: 'none' }}
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
              background: 'linear-gradient(to right, #2563eb, #7c3aed)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              marginTop: '10px',
              boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)'
            }}
          >
            {loading ? "Création..." : "S'inscrire"}
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Déjà inscrit ?{' '}
            <Link to="/auth/login" style={{ color: '#f59e0b', fontWeight: 'bold', textDecoration: 'none' }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}