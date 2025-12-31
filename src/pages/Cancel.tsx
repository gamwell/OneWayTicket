export default function Cancel() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">❌ Paiement annulé</h1>
        <p className="text-gray-600">Tu as annulé le paiement.</p>
        <a href="/" className="mt-6 inline-block px-6 py-3 bg-black text-white rounded-xl">
          Réessayer
        </a>
      </div>
    </div>
  )
}