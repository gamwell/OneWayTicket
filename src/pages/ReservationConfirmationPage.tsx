import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { supabase } from "../../supabaseClient";

export default function ReservationConfirmationPage() {
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;

  // 1️⃣ Charger la réservation depuis Supabase
  useEffect(() => {
    const fetchReservation = async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) {
        setReservation(data);
      }
    };

    fetchReservation();
  }, [id]);

  // 2️⃣ Envoyer l’email automatiquement (une seule fois)
  useEffect(() => {
    if (!reservation || emailSent) return;

    const sendEmail = async () => {
      try {
        await fetch(`${functionsUrl}/send-confirmation-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: reservation.email,
            name: reservation.name,
            reservationId: reservation.id,
            quantity: reservation.ticket_quantity,
          }),
        });

        setEmailSent(true);
      } catch (err) {
        console.error("Erreur envoi email:", err);
      }
    };

    sendEmail();
  }, [reservation, emailSent, functionsUrl]);

  if (!reservation) {
    return <p>Chargement de votre réservation…</p>;
  }

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>🎉 Réservation confirmée</h1>

      <p>
        Merci <strong>{reservation.name}</strong>, votre réservation est bien
        enregistrée.
      </p>

      <p>
        Numéro de réservation : <strong>{reservation.id}</strong>
      </p>

      <p>
        Nombre de tickets : <strong>{reservation.ticket_quantity}</strong>
      </p>

      <h2>🎟️ Votre QR Code</h2>

      <div style={{ margin: "2rem auto", width: 200 }}>
        <QRCode value={reservation.id} size={200} />
      </div>

      <p>
        Présentez ce QR code à l’entrée pour valider votre réservation.
      </p>

      {emailSent && (
        <p style={{ marginTop: "1rem", color: "green" }}>
          ✔️ Un email de confirmation vous a été envoyé.
        </p>
      )}
    </div>
  );
}