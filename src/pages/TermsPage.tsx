import { FileText, AlertCircle, ShoppingCart, CreditCard, RefreshCw, Scale } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary-900 via-secondary-600 to-secondary-500 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <FileText className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-display font-bold mb-4">Conditions Générales d'Utilisation</h1>
          <p className="text-lg opacity-95">
            Conditions régissant l'utilisation de la plateforme ONEWAYTICKET
          </p>
          <p className="text-sm mt-4 opacity-90">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <AlertCircle className="w-6 h-6 text-secondary-600" />
            <h2 className="text-2xl font-display font-bold text-gray-900">Article 1 - Objet</h2>
          </div>
          <div className="prose prose-gray max-w-none text-gray-700">
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation
              de la plateforme ONEWAYTICKET, accessible à l'adresse www.onewayticket.fr, éditée par
              ONEWAYTICKET SAS.
            </p>
            <p className="mt-4">
              L'utilisation de la plateforme implique l'acceptation pleine et entière des présentes CGU.
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="w-6 h-6 text-secondary-600" />
            <h2 className="text-2xl font-display font-bold text-gray-900">Article 2 - Définitions</h2>
          </div>
          <div className="space-y-3 text-gray-700">
            <p><span className="font-semibold">Plateforme :</span> Le site web ONEWAYTICKET et ses services associés</p>
            <p><span className="font-semibold">Utilisateur :</span> Toute personne utilisant la plateforme</p>
            <p><span className="font-semibold">Client :</span> Utilisateur achetant des billets</p>
            <p><span className="font-semibold">Organisateur :</span> Utilisateur créant et gérant des événements</p>
            <p><span className="font-semibold">Événement :</span> Manifestation proposée par un organisateur sur la plateforme</p>
            <p><span className="font-semibold">Billet :</span> Titre d'accès à un événement acheté via la plateforme</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <ShoppingCart className="w-6 h-6 text-secondary-600" />
            <h2 className="text-2xl font-display font-bold text-gray-900">Article 3 - Inscription et Compte</h2>
          </div>
          <div className="prose prose-gray max-w-none text-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">3.1 Création de compte</h3>
            <p>
              Pour accéder à certains services, l'utilisateur doit créer un compte en fournissant
              des informations exactes, complètes et à jour. L'utilisateur s'engage à maintenir la
              confidentialité de ses identifiants.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">3.2 Conditions d'inscription</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Être âgé d'au moins 18 ans ou avoir l'autorisation d'un représentant légal</li>
              <li>Fournir des informations véridiques et complètes</li>
              <li>Ne créer qu'un seul compte par personne</li>
              <li>Ne pas usurper l'identité d'autrui</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">3.3 Responsabilité du compte</h3>
            <p>
              L'utilisateur est responsable de toutes les activités effectuées depuis son compte.
              En cas d'utilisation non autorisée, l'utilisateur doit immédiatement en informer
              ONEWAYTICKET.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <CreditCard className="w-6 h-6 text-secondary-600" />
            <h2 className="text-2xl font-display font-bold text-gray-900">Article 4 - Achat de Billets</h2>
          </div>
          <div className="prose prose-gray max-w-none text-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">4.1 Processus d'achat</h3>
            <p>
              L'achat de billets s'effectue en ligne via la plateforme. Le client sélectionne
              l'événement, le type de billet et procède au paiement sécurisé.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">4.2 Prix et frais</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Les prix sont affichés en euros, toutes taxes comprises (TTC)</li>
              <li>Des frais de service peuvent s'appliquer et seront clairement indiqués</li>
              <li>Les prix peuvent varier selon les catégories de billets</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">4.3 Paiement</h3>
            <p>
              Les paiements sont sécurisés et traités par notre partenaire Stripe. ONEWAYTICKET
              ne stocke aucune information bancaire. Les moyens de paiement acceptés incluent :
              cartes bancaires, cartes de crédit.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">4.4 Confirmation et billet électronique</h3>
            <p>
              Après validation du paiement, le client reçoit par email :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Une confirmation de commande</li>
              <li>Le(s) billet(s) électronique(s) au format PDF avec QR code</li>
              <li>Les conditions particulières de l'événement</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <RefreshCw className="w-6 h-6 text-secondary-600" />
            <h2 className="text-2xl font-display font-bold text-gray-900">Article 5 - Annulation et Remboursement</h2>
          </div>
          <div className="prose prose-gray max-w-none text-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">5.1 Droit de rétractation</h3>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <span className="font-semibold">Important :</span> Conformément à l'article L221-28 du
                Code de la consommation, le droit de rétractation de 14 jours ne s'applique pas aux
                billets d'événements dont la date est fixée.
              </p>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">5.2 Annulation par le client</h3>
            <p>
              Les billets achetés ne sont généralement ni repris ni échangés, sauf conditions
              particulières définies par l'organisateur de l'événement.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">5.3 Annulation par l'organisateur</h3>
            <p>
              En cas d'annulation d'un événement par l'organisateur :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Le client sera immédiatement informé par email</li>
              <li>Le remboursement intégral sera effectué sous 14 jours ouvrés</li>
              <li>Les frais de service seront également remboursés</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">5.4 Report d'événement</h3>
            <p>
              En cas de report, le billet reste valable pour la nouvelle date. Si le client ne
              peut y assister, les conditions de remboursement seront déterminées par l'organisateur.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Scale className="w-6 h-6 text-secondary-600" />
            <h2 className="text-2xl font-display font-bold text-gray-900">Article 6 - Responsabilités</h2>
          </div>
          <div className="prose prose-gray max-w-none text-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">6.1 Responsabilité de ONEWAYTICKET</h3>
            <p>
              ONEWAYTICKET agit en tant qu'intermédiaire entre les organisateurs et les clients.
              Notre responsabilité se limite à :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>La fourniture de la plateforme de billetterie</li>
              <li>Le traitement sécurisé des paiements</li>
              <li>L'émission des billets électroniques</li>
            </ul>
            <p className="mt-4">
              ONEWAYTICKET n'est pas responsable :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Du contenu, de la qualité ou du déroulement des événements</li>
              <li>Des actions ou omissions des organisateurs</li>
              <li>Des dommages directs ou indirects résultant de l'utilisation de la plateforme</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">6.2 Responsabilité de l'utilisateur</h3>
            <p>
              L'utilisateur s'engage à :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Utiliser la plateforme de manière loyale et conforme à sa destination</li>
              <li>Ne pas tenter de contourner les systèmes de sécurité</li>
              <li>Ne pas revendre les billets à un prix supérieur (sauf autorisation)</li>
              <li>Respecter les droits de propriété intellectuelle</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Article 7 - Propriété Intellectuelle</h2>
          <div className="prose prose-gray max-w-none text-gray-700">
            <p>
              Tous les éléments de la plateforme (textes, images, logos, vidéos, structure, etc.)
              sont protégés par le droit d'auteur, le droit des marques et/ou tout autre droit de
              propriété intellectuelle.
            </p>
            <p className="mt-4">
              Toute reproduction, représentation, modification ou exploitation non autorisée est
              strictement interdite et pourra donner lieu à des poursuites judiciaires.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Article 8 - Données Personnelles</h2>
          <div className="prose prose-gray max-w-none text-gray-700">
            <p>
              Le traitement de vos données personnelles est régi par notre{' '}
              <a href="/privacy" className="text-secondary-600 underline font-medium">
                Politique de Confidentialité
              </a>, qui fait partie intégrante des présentes CGU.
            </p>
            <p className="mt-4">
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression
              et d'opposition concernant vos données personnelles.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Article 9 - Modifications des CGU</h2>
          <div className="prose prose-gray max-w-none text-gray-700">
            <p>
              ONEWAYTICKET se réserve le droit de modifier les présentes CGU à tout moment.
              Les nouvelles conditions entreront en vigueur dès leur publication sur la plateforme.
            </p>
            <p className="mt-4">
              Les utilisateurs seront informés des modifications substantielles par email ou
              notification sur la plateforme.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Article 10 - Droit Applicable et Juridiction</h2>
          <div className="prose prose-gray max-w-none text-gray-700">
            <p>
              Les présentes CGU sont régies par le droit français. En cas de litige, et à défaut
              d'accord amiable, les tribunaux français seront seuls compétents.
            </p>
            <div className="mt-6 p-4 bg-secondary-50 rounded-lg border border-secondary-200">
              <p className="text-sm">
                <span className="font-semibold">Médiation :</span> Conformément à l'article L.612-1 du
                Code de la consommation, le client a le droit de recourir gratuitement à un médiateur
                de la consommation en vue de la résolution amiable du litige.
              </p>
              <p className="text-sm mt-2">
                Plateforme de résolution des litiges en ligne de la Commission européenne :{' '}
                <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-secondary-600 underline">
                  https://ec.europa.eu/consumers/odr
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Contact</h2>
          <div className="prose prose-gray max-w-none text-gray-700">
            <p>
              Pour toute question concernant les présentes CGU, vous pouvez nous contacter :
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold">ONEWAYTICKET SAS</p>
              <p className="text-sm mt-2">123 Avenue des Événements, 75001 Paris, France</p>
              <p className="text-sm mt-2">
                Email : <a href="mailto:contact@onewayticket.fr" className="text-secondary-600 underline">contact@onewayticket.fr</a>
              </p>
              <p className="text-sm mt-2">Téléphone : +33 1 23 45 67 89</p>
            </div>
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

export default TermsPage;
