import React from 'react';
import { Ticket, Users, Globe, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e1b4b 0%, #111827 100%)', // Fond sombre élégant
      padding: '60px 20px',
      color: 'white',
      fontFamily: 'sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Effets de lumière décoratifs pour la chaleur */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'rgba(245, 158, 11, 0.15)', filter: 'blur(100px)', borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '300px', height: '300px', background: 'rgba(16, 185, 129, 0.1)', filter: 'blur(80px)', borderRadius: '50%' }}></div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Section Titre */}
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ 
            display: 'inline-flex', padding: '12px', borderRadius: '15px', 
            background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '20px' 
          }}>
            <Ticket style={{ color: '#f59e0b' }} size={32} />
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px' }}>
            L'aventure <span style={{ color: '#f59e0b' }}>ONEWAYTICKET</span>
          </h1>
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto' }}>
            Plus qu'une billetterie, une porte ouverte vers vos plus beaux souvenirs. 
            Nous connectons les passionnés aux expériences qui comptent.
          </p>
        </header>

        {/* Grille de Valeurs (Style Glassmorphism) */}
        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '60px' 
        }}>
          {[
            { icon: <Users color="#10b981" />, title: "Communauté", text: "Nous plaçons l'humain au cœur de chaque événement." },
            { icon: <Globe color="#f59e0b" />, title: "Accessibilité", text: "Des tickets pour tous, partout, en un clic seulement." },
            { icon: <ShieldCheck color="#3b82f6" />, title: "Sécurité", text: "Une plateforme fiable et transparente pour vos achats." }
          ].map((item, index) => (
            <div key={index} style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', 
              padding: '30px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>{item.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: '1.5' }}>{item.text}</p>
            </div>
          ))}
        </div>

        {/* Section Histoire avec dégradé chaud */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
          padding: '40px', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '15px' }}>Notre Vision</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.8', marginBottom: '25px', maxWidth: '800px' }}>
            Fondée en 2025, ONEWAYTICKET est née de la volonté de simplifier l'accès à la culture et au divertissement. 
            Dans un monde qui va de plus en plus vite, nous croyons en la puissance du moment présent et de l'émotion partagée. 
            Chaque billet est un aller simple vers une nouvelle découverte.
          </p>
          <Link to="/events" style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f59e0b', 
            color: '#1e1b4b', padding: '12px 30px', borderRadius: '15px', fontWeight: 'bold', 
            textDecoration: 'none', transition: 'transform 0.2s'
          }}>
            Découvrir nos événements <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}