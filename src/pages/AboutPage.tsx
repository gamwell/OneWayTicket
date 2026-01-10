import React from 'react';
// Si vous n'avez pas lucide-react, retirez les icônes de l'import et du code
import { Rocket, Users, Shield, Globe } from 'lucide-react';

const AboutPage = () => {
  return (
    // "flex-grow" ici aussi pour s'assurer qu'il remplit l'espace du main
    <div className="flex-grow w-full bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] pt-24 pb-20 px-6">
      
      <div className="max-w-4xl mx-auto text-center">
        
        {/* Titre */}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-white">
          L'aventure <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">ONEWAYTICKET</span>
        </h1>
        
        <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
          Plus qu'une billetterie, une porte ouverte vers vos plus beaux souvenirs.
          Nous connectons les passionnés aux expériences qui comptent.
        </p>

        {/* Grille de valeurs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <Users className="w-10 h-10 text-pink-500 mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2">Communauté</h3>
            <p className="text-sm text-gray-400">L'humain au cœur de l'événement.</p>
          </div>
          
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
             <Globe className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2">Accessibilité</h3>
            <p className="text-sm text-gray-400">Des tickets partout, pour tous.</p>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
             <Shield className="w-10 h-10 text-purple-500 mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2">Sécurité</h3>
            <p className="text-sm text-gray-400">Paiements 100% sécurisés.</p>
          </div>
        </div>

        {/* Section Vision */}
        <div className="bg-slate-900/80 p-8 rounded-2xl border border-slate-700">
           <div className="flex justify-center mb-4">
             <Rocket className="text-yellow-400 w-8 h-8" />
           </div>
           <h2 className="text-2xl font-bold mb-4">Notre Vision</h2>
           <p className="text-gray-300">
             Fondée par <strong>William Chenatlia</strong>, notre mission est de simplifier l'accès à la culture dans un monde digital.
           </p>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;