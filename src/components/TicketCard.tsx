import React from "react";

interface TicketCardProps {
  ticket: {
    id: string;
    event_id: string;
    qr_code: string;
    created_at: string;
  };
}

export default function TicketCard({ ticket }: TicketCardProps) {
  return (
    <div className="bg-white shadow p-6 rounded-lg text-center">
      <h2 className="text-xl font-bold mb-4">Billet #{ticket.id}</h2>

      {/* QR CODE */}
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket.qr_code}`}
        alt="QR Code"
        className="mx-auto mb-4"
      />

      {/* INFOS DU TICKET */}
      <p className="text-gray-600 mb-2">
        <strong>Événement :</strong> {ticket.event_id}
      </p>

      <p className="text-gray-600 mb-2">
        <strong>Date d’achat :</strong>{" "}
        {new Date(ticket.created_at).toLocaleString()}
      </p>

      <p className="text-gray-600">
        Présentez ce QR code à l’entrée de l’événement.
      </p>
    </div>
  );
}