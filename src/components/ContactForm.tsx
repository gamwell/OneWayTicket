import { useState } from 'react';
import { sendContactEmail } from '../services/emailService'; // On suppose que ce fichier existe

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [honeypot, setHoneypot] = useState(""); // Anti-spam 🍯

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Vérification Anti-spam
    if (honeypot !== "") return;

    setStatus('loading');
    const formData = new FormData(e.currentTarget);
    
    try {
      await sendContactEmail(
        formData.get('name') as string,
        formData.get('email') as string,
        formData.get('message') as string
      );
      setStatus('success');
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Champ invisible pour les robots 🍯 */}
      <input 
        type="text" 
        style={{ display: 'none' }} 
        value={honeypot} 
        onChange={(e) => setHoneypot(e.target.value)} 
      />

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom complet</label>
        <input type="text" name="name" id="name" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email professionnel</label>
        <input type="email" name="email" id="email" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
      </div>
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
        <textarea name="message" id="message" rows={4} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
      </div>

      <button 
        type="submit" 
        disabled={status === 'loading'}
        className={`w-full py-3 px-4 rounded-md text-white font-medium transition ${
          status === 'loading' ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {status === 'loading' ? 'Envoi en cours...' : 'Envoyer le message'}
      </button>

      {status === 'success' && <p className="text-green-600 text-sm">Message envoyé avec succès !</p>}
      {status === 'error' && <p className="text-red-600 text-sm">Erreur lors de l'envoi. Réessayez.</p>}
    </form>
  );
}