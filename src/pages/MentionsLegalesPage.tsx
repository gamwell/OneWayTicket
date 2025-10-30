import { Building2, Mail, Phone, MapPin, User, Server } from 'lucide-react';

const MentionsLegalesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary-900 via-secondary-600 to-secondary-500 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-display font-bold mb-4">Mentions Légales</h1>
          <p className="text-lg opacity-95">
            Informations légales et contacts officiels
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-secondary-600" />
            <span>Éditeur du site</span>
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <p className="font-semibold text-gray-900">Raison sociale :</p>
              <p>ONEWAYTICKET SAS</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Capital social :</p>
              <p>50 000 €</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">SIRET :</p>
              <p>123 456 789 00010</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">RCS :</p>
              <p>Paris B 123 456 789</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Numéro TVA intracommunautaire :</p>
              <p>FR 12 123456789</p>
            </div>
            <div className="flex items-start space-x-2">
              <MapPin className="w-5 h-5 text-secondary-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Siège social :</p>
                <p>123 Avenue des Événements</p>
                <p>75001 Paris, France</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <User className="w-6 h-6 text-secondary-600" />
            <span>Directeur de la publication</span>
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <p className="font-semibold text-gray-900">Nom :</p>
              <p>Marie DUBOIS</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Fonction :</p>
              <p>Présidente - Directrice Générale</p>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-secondary-600" />
              <a href="mailto:direction@onewayticket.fr" className="text-secondary-600 hover:text-secondary-700">
                direction@onewayticket.fr
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Mail className="w-6 h-6 text-secondary-600" />
            <span>Contacts</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Support Client</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-secondary-600" />
                  <a href="mailto:support@onewayticket.fr" className="text-secondary-600 hover:text-secondary-700">
                    support@onewayticket.fr
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-secondary-600" />
                  <a href="tel:+33123456789" className="text-secondary-600 hover:text-secondary-700">
                    +33 1 23 45 67 89
                  </a>
                </div>
                <p className="text-gray-600">Lundi - Vendredi : 9h - 18h</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Service Commercial</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-secondary-600" />
                  <a href="mailto:commercial@onewayticket.fr" className="text-secondary-600 hover:text-secondary-700">
                    commercial@onewayticket.fr
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-secondary-600" />
                  <a href="tel:+33123456790" className="text-secondary-600 hover:text-secondary-700">
                    +33 1 23 45 67 90
                  </a>
                </div>
                <p className="text-gray-600">Lundi - Vendredi : 9h - 18h</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Webmaster / Support Technique</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-secondary-600" />
                  <span>Thomas MARTIN</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-secondary-600" />
                  <a href="mailto:webmaster@onewayticket.fr" className="text-secondary-600 hover:text-secondary-700">
                    webmaster@onewayticket.fr
                  </a>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Délégué à la Protection des Données (DPO)</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-secondary-600" />
                  <span>Sophie BERNARD</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-secondary-600" />
                  <a href="mailto:dpo@onewayticket.fr" className="text-secondary-600 hover:text-secondary-700">
                    dpo@onewayticket.fr
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Server className="w-6 h-6 text-secondary-600" />
            <span>Hébergement</span>
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <p className="font-semibold text-gray-900">Hébergeur :</p>
              <p>Supabase Inc.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Adresse :</p>
              <p>970 Toa Payoh North, #07-04</p>
              <p>Singapore 318992</p>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-secondary-600" />
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-secondary-600 hover:text-secondary-700">
                supabase.com
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Propriété intellectuelle</h2>
          <div className="prose prose-gray max-w-none text-gray-700">
            <p>
              L'ensemble du contenu du site ONEWAYTICKET (structure, textes, logos, images, vidéos, etc.)
              est la propriété exclusive de ONEWAYTICKET SAS, sauf mention contraire.
            </p>
            <p className="mt-4">
              Toute reproduction, représentation, modification, publication, transmission, dénaturation,
              totale ou partielle du site ou de son contenu, par quelque procédé que ce soit, et sur
              quelque support que ce soit est interdite sans l'autorisation écrite préalable de ONEWAYTICKET SAS.
            </p>
            <p className="mt-4">
              Marques et logos ONEWAYTICKET sont des marques déposées. Toute reproduction totale ou partielle
              de ces marques sans autorisation préalable et écrite de ONEWAYTICKET SAS est prohibée.
            </p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-secondary-50 rounded-lg border border-secondary-200">
          <p className="text-sm text-gray-600 text-center">
            Une réalisation{' '}
            <span className="font-semibold text-secondary-600">DigitBinary</span>
            {' '}- Shaping tomorrow, today
          </p>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegalesPage;
