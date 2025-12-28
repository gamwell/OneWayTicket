import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Contactez-nous
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Une question ? Une suggestion ? Notre équipe est là pour vous aider.
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg grid grid-cols-1 md:grid-cols-2">
          {/* Informations */}
          <div className="p-8 bg-blue-700 text-white">
            <h3 className="text-2xl font-bold mb-8">Nos Coordonnées</h3>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <Mail className="h-6 w-6 mt-1 mr-4" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-blue-200">support@evenement.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-6 w-6 mt-1 mr-4" />
                <div>
                  <p className="font-medium">Téléphone</p>
                  <p className="text-blue-200">+33 1 23 45 67 89</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-6 w-6 mt-1 mr-4" />
                <div>
                  <p className="font-medium">Bureau</p>
                  <p className="text-blue-200">
                    123 Avenue de la Tech<br />
                    75000 Paris, France
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire (Visuel uniquement pour l'instant) */}
          <div className="p-8">
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom complet</label>
                <input type="text" id="name" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea id="message" rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
              </div>
              <button type="button" className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                Envoyer le message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}