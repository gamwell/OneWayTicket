import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react'; // Importation de l'icône pour le badge
import './Hero.css';

const Hero: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        
        {/* --- BADGE AGRANDI POUR L'ACCESSIBILITÉ --- */}
        <div className="badge-official">
          <span className="badge-icon">
            <Sparkles size={18} className="text-amber-300" />
          </span>
          <span className="badge-text">AGENDA OFFICIEL</span>
        </div>

        {/* --- TITRE (SANS FOND BORDEAUX) --- */}
        <h1 className="hero-main-title">
          <span className="line-white">EXPLORER</span>
          <br />
          <span className="line-gradient">L'AVENTURE</span>
        </h1>

        <div className="hero-content-footer">
          <p className="hero-tagline">
            "Le passeport pour vos souvenirs les plus précieux.<br />
            Commencez l'extraordinaire."
          </p>
          <Link to="/events" className="hero-cta-btn">
            DÉCOUVRIR
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;