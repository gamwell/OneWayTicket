// CHEMIN : src/components/ReservationForm.tsx

import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; 

// En TypeScript, on définit la forme des données
interface ReservationData {
  name: string;
  email: string;
  ticket_quantity: number;
}

const ReservationForm = () => {
  // On indique le type des states (ex: <string>)
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();

    const newReservation: ReservationData = {
      name,
      email,
      ticket_quantity: quantity
    };

    const { data, error } = await supabase
      .from("reservations")
      .insert([newReservation]);

    if (error) {
      console.error("Erreur :", error);
      alert("Erreur : " + error.message);
    } else {
      console.log("Succès :", data);
      alert("Réservation confirmée !");
      setName('');
      setEmail('');
      setQuantity(1);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Réserver un ticket</h2>
      <form onSubmit={handleReservation}>
        <div style={{ marginBottom: '10px' }}>
          <label>Nom : </label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Email : </label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Nombre de tickets : </label>
          <input 
            type="number" 
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            min="1" 
          />
        </div>

        <button type="submit">Valider la réservation</button>
      </form>
    </div>
  );
};

export default ReservationForm;