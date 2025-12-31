export default function Success() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">✅ Paiement réussi !</h1>
        <p className="text-gray-600">Ton billet a été acheté avec succès.</p>
        <a href="/" className="mt-6 inline-block px-6 py-3 bg-black text-white rounded-xl">
          Retour à l'accueil
        </a>
      </div>
    </div>
  )
}