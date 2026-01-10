import { Mail, Phone, MapPin } from 'lucide-react';
import ContactForm from '../components/ContactForm'; // On importe notre nouveau composant

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Contactez Quarksy Digital
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Une question sur nos services ? Notre équipe vous répond sous 24h.
          </p>
        </div>

        <div className="bg-white shadow-2xl overflow-hidden rounded-2xl grid grid-cols-1 md:grid-cols-2">
          {/* Informations (Gauche) */}
          <div className="p-10 bg-blue-700 text-white flex flex-col justify-center">
            <h3 className="text-2xl font-bold mb-8">Nos Coordonnées</h3>
            
            <div className="space-y-8">
              <div className="flex items-start">
                <Mail className="h-6 w-6 mt-1 mr-4 text-blue-300" />
                <div>
                  <p className="font-semibold text-lg">Email</p>
                  <p className="text-blue-100">contact@quarksydigital.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-6 w-6 mt-1 mr-4 text-blue-300" />
                <div>
                  <p className="font-semibold text-lg">Téléphone</p>
                  <p className="text-blue-100">+33 7 00 00 00 00</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-6 w-6 mt-1 mr-4 text-blue-300" />
                <div>
                  <p className="font-semibold text-lg">Bureau</p>
                  <p className="text-blue-100">
                    Basé à Paris<br />
                    France
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire (Droite) */}
          <div className="p-10">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h3>
            <ContactForm /> 
          </div>
        </div>
      </div>
    </div>
  );
}