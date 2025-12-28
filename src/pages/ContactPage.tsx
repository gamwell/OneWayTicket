import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      alert("Message envoyé avec succès ! Nous vous répondrons bientôt.");
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e1b4b 0%, #111827 100%)', 
      padding: '60px 20px',
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '15px' }}>
            Besoin d'<span style={{ color: '#10b981' }}>aide</span> ?
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px' }}>
            Notre équipe est à votre écoute pour toute question.
          </p>
        </header>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '40px' 
        }}>
          
          {/* Colonne 1 : Infos de contact (Style Orange) */}
          <div style={{ spaceY: '30px' }}>
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.03)', 
              padding: '30px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)' 
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MessageSquare style={{ color: '#f59e0b' }} /> Coordonnées
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px' }}>
                    <Mail style={{ color: '#f59e0b' }} size={20} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Email</p>
                    <p style={{ fontSize: '16px', fontWeight: '600' }}>contact@onewayticket.com</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                    <Phone style={{ color: '#10b981' }} size={20} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Téléphone</p>
                    <p style={{ fontSize: '16px', fontWeight: '600' }}>+33 1 23 45 67 89</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px' }}>
                    <MapPin style={{ color: '#3b82f6' }} size={20} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Bureau</p>
                    <p style={{ fontSize: '16px', fontWeight: '600' }}>Paris, Station F</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne 2 : Formulaire (Style Vert) */}
          <form onSubmit={handleSubmit} style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.05)', 
            backdropFilter: 'blur(10px)',
            padding: '40px', borderRadius: '24px', 
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Nom</label>
                <input type="text" required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Prénom</label>
                <input type="text" required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Email</label>
              <input type="email" required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Message</label>
              <textarea rows={4} required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none', resize: 'none' }}></textarea>
            </div>

            <button type="submit" disabled={loading} style={{ 
              backgroundColor: '#10b981', 
              color: '#1e1b4b', 
              padding: '14px', borderRadius: '12px', 
              border: 'none', fontWeight: 'bold', fontSize: '16px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              transition: 'all 0.3s'
            }}>
              {loading ? "Envoi..." : "Envoyer le message"} <Send size={18} />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}