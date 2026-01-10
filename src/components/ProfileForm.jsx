import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ProfileForm({ userId }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    profile_type: 'particulier', // Valeur par défaut
    company_name: '',
    siret_number: '',
    billing_email: ''
  });

  // Charger les données existantes au démarrage
  useEffect(() => {
    async function getProfile() {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (data) setProfile(data);
      setLoading(false);
    }
    getProfile();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('user_profiles')
      .update(profile)
      .eq('user_id', userId);

    if (error) alert("Erreur : " + error.message);
    else alert("Profil mis à jour avec succès !");
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <input 
        type="text" placeholder="Prénom" 
        value={profile.first_name || ''} 
        onChange={e => setProfile({...profile, first_name: e.target.value})} 
      />
      
      <select 
        value={profile.profile_type} 
        onChange={e => setProfile({...profile, profile_type: e.target.value})}
      >
        <option value="particulier">Particulier</option>
        <option value="etudiant">Étudiant (Réduction)</option>
        <option value="retraite">Retraité (Réduction)</option>
        <option value="demandeur_emploi">Demandeur d'emploi (Réduction)</option>
        <option value="prive">Entreprise / Freelance</option>
        <option value="administratif">Organisme Public</option>
      </select>

      {/* Affichage conditionnel pour les Pros / Administrations */}
      {(profile.profile_type === 'prive' || profile.profile_type === 'administratif') && (
        <fieldset>
          <legend>Infos Professionnelles</legend>
          <input 
            placeholder="Nom de la structure" 
            value={profile.company_name || ''}
            onChange={e => setProfile({...profile, company_name: e.target.value})} 
          />
          <input 
            placeholder="SIRET" 
            value={profile.siret_number || ''}
            onChange={e => setProfile({...profile, siret_number: e.target.value})} 
          />
        </fieldset>
      )}

      {/* Message pour les réductions */}
      {['etudiant', 'retraite', 'demandeur_emploi'].includes(profile.profile_type) && (
        <div style={{ color: 'blue', fontSize: '0.8em' }}>
          * Un justificatif vous sera demandé pour valider votre tarif réduit.
        </div>
      )}

      <button type="submit">Enregistrer les modifications</button>
    </form>
  );
}