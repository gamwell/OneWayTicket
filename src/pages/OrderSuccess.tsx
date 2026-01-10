import React from 'react';
import { InvoiceButton } from '../components/InvoiceButton';

const OrderSuccess: React.FC = () => {
  // Exemple d'ID (venant probablement de vos params d'URL ou d'un context)
  const currentOrderId: string = "CMD-8854"; 

  return (
    <div className="flex flex-col items-center gap-4 p-10">
      <h1 className="text-2xl font-bold">Commande confirmée !</h1>
      <p>Merci pour votre achat.</p>

      {/* Le composant est maintenant typé et sûr */}
      <InvoiceButton orderId={currentOrderId} />
    </div>
  );
};

export default OrderSuccess;