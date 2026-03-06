import React, { useState } from "react";
import { supabase } from "../lib/supabase";

interface ReservationData {
  id?: string;
  name: string;
  email: string;
  ticket_quantity: number;
}

const TICKET_PRICE_CENTS = 2000; // 20€ par ticket

const ReservationForm = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      if (!name || !email || quantity < 1) {
        alert("Veuillez remplir tous les champs correctement.");
        return;
      }

      // 1️⃣ Création de la réservation dans Supabase
      const newReservation: ReservationData = {
        name,
        email,
        ticket_quantity: quantity,
      };

      const { data, error } = await supabase
        .from("reservations")
        .insert([newReservation])
        .select()
        .single();

      if (error || !data) {
        console.error("Erreur Supabase :", error);
        alert("Erreur lors de la création de la réservation.");
        return;
      }

      const reservationId = data.id as string;
      const baseUrl = window.location.origin;

      // 2️⃣ Appel de l’Edge Function Stripe pour créer la Checkout Session
      const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
      if (!functionsUrl) {
        console.error("VITE_SUPABASE_FUNCTIONS_URL manquant dans les env.");
        alert("Configuration serveur incomplète.");
        return;
      }

      const response = await fetch(
        `${functionsUrl}/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reservationId,
            email,
            quantity,
            priceInCents: TICKET_PRICE_CENTS,
            baseUrl,
          }),
        }
      );

      if (!response.ok) {
        console.error("Erreur HTTP Stripe:", response.status);
        alert("Erreur lors de la création de la session de paiement.");
        return;
      }

      const json = await response.json();
      if (!json?.url) {
        console.error("Réponse Stripe invalide:", json);
        alert("Impossible de récupérer l’URL de paiement.");
        return;
      }

      // 3️⃣ Redirection vers Stripe Checkout
      window.location.href = json.url;
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        maxWidth: "400px",
        margin: "auto",
      }}
    >
      <h2 style={{ marginBottom: "15px" }}>Réserver un ticket</h2>

      <form onSubmit={handleReservation}>
        <div style={{ marginBottom: "10px" }}>
          <label>Nom : </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Email : </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Nombre de tickets : </label>
          <input
            type="number"
            value={quantity}
            min={1}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setQuantity(isNaN(val) ? 1 : val);
            }}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <p style={{ marginBottom: "10px", fontSize: "14px" }}>
          Total : <strong>{(quantity * TICKET_PRICE_CENTS) / 100} €</strong>
        </p>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Redirection vers le paiement..." : "Payer avec Stripe"}
        </button>
      </form>
    </div>
  );
};

export default ReservationForm;