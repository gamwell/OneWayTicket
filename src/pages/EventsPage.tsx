import React from 'react';
import { Calendar, MapPin, Tag, ArrowRight, Star } from 'lucide-react';

const events = [
  { id: 1, title: "Festival Aurore Sonore", date: "28 Janv 2026", location: "Marseille", price: "45€", category: "Musique", color: "#f59e0b" },
  { id: 2, title: "Nuit de l'Innovation", date: "11 Fév 2026", location: "Paris Station F", price: "Gratuit", category: "Tech", color: "#10b981" },
  { id: 3, title: "Gala des Arts", date: "05 Mars 2026", location: "Lyon", price: "25€", category: "Art", color: "#ec4899" },
];

export default function EventsPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      // DÉGRADÉ DEMANDÉ : Orange, Rosé, Bleu vers Vert
      background: 'linear-gradient(135deg, #f59e0b 0%, #fb7185 25%, #4338ca 60%, #10b981 100%)',
      padding: '60px 20px',
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* En-tête avec Glassmorphism léger */}
        <header style={{ 
          textAlign: 'center', 
          marginBottom: '60px',
          padding: '40px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '30px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '15px', letterSpacing: '-1px' }}>
            Explorer les <span style={{ color: '#fb7185' }}>Événements</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', fontWeight: '500' }}>
            Vivez des moments uniques sous de nouvelles couleurs.
          </p>
        </header>

        {/* Grille d'événements */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '30px' 
        }}>
          {events.map((event) => (
            <div key={event.id} style={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.6)', 
              backdropFilter: 'blur(20px)',
              borderRadius: '28px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              transition: 'transform 0.3s ease',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}>
              {/* Image de fond dégradée pour chaque carte */}
              <div style={{ 
                height: '200px', 
                background: `linear-gradient(135deg, ${event.color} 0%, rgba(0,0,0,0.4) 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '50%' }}>
                   <Star size={18} fill="white" />
                </div>
                <Tag style={{ width: '60px', height: '60px', opacity: 0.4 }} />
              </div>

              <div style={{ padding: '30px' }}>
                <div style={{ 
                  display: 'inline-block', 
                  padding: '6px 14px', 
                  borderRadius: '12px', 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: event.color,
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '20px',
                  border: `1px solid ${event.color}`
                }}>
                  {event.category}
                </div>

                <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>{event.title}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'rgba(255,255,255,0.7)', fontSize: '15px', marginBottom: '25px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={18} style={{ color: '#fb7185' }} /> {event.date}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={18} style={{ color: '#10b981' }} /> {event.location}
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  borderTop: '1px solid rgba(255,255,255,0.1)', 
                  paddingTop: '25px' 
                }}>
                  <span style={{ fontSize: '26px', fontWeight: '900' }}>{event.price}</span>
                  <button style={{ 
                    padding: '12px 24px',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'linear-gradient(to right, #f59e0b, #fb7185)',
                    color: 'white',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 10px 20px rgba(251, 113, 133, 0.3)'
                  }}>
                    Réserver <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}