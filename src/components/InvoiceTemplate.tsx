interface InvoiceProps {
  id: string;
  amount: number;
  clientName: string;
}

export const InvoiceTemplate = ({ id, amount, clientName }: InvoiceProps) => {
  return (
    <div 
      id="invoice-capture" 
      style={{ 
        padding: '40px', 
        width: '210mm', // Largeur A4
        minHeight: '297mm', 
        backgroundColor: '#fff',
        color: '#333',
        fontFamily: 'Arial'
      }}
    >
      <h2>FACTURE : {id}</h2>
      <hr />
      <p><strong>Client :</strong> {clientName}</p>
      <p><strong>Montant payé :</strong> {amount} €</p>
      <p>Statut : <span style={{ color: 'green' }}>Payé via Stripe</span></p>
    </div>
  );
};