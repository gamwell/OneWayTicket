import { Shield, Database, Lock, Eye, UserCheck, FileText } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary-900 via-secondary-600 to-secondary-500 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-display font-bold mb-4">Politique de Confidentialité</h1>
          <p className="text-lg opacity-95">
            Protection de vos données personnelles et respect de votre vie privée
          </p>
          <p className="text-sm mt-4 opacity-90">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="w-6 h-6 text-secondary-600" />
            <h2 className="text-2xl font-display font-bold text-gray-900">Introduction</h2>
          </div>
          <div className="prose prose-gray max-w-none text-gray-700">
            <p>
              ONEWAYTICKET SAS, société par actions simplifiée au capital de 50 000 euros,
              immatriculée au RCS de Paris sous le numéro 123 456 789, dont le siège social est situé
              123 Avenue des Événements, 75001 Paris, France, accorde une grande importance à la protection
              de vos données personnelles.
            </p>
            <p className="mt-4">
              La présente politique de confidentialité a pour objectif de vous informer sur nos pratiques
              concernant la collecte, l'utilisation et le partage des informations que vous êtes amenés à
              nous fournir par l'intermédiaire de notre plateforme accessible à l'adresse{' '}
              <span className="font-semibold">www.onewayticket.fr</span>.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Database className="w-6 h-6 text-secondary-600" />
            <h2 className="text-2xl font-display font-bold text-gray-900">Données Collectées</h2>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Données d'identification</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Nom et prénom</li>
                <li>Adresse email</li>
                <li>Numéro de téléphone</li>
                <li>Adresse postale</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Données de connexion</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Adresse IP</li>
                <li>Logs de connexion</li>
                <li>Données de navigation</li>
                <li>Type de navigateur et système d'exploitation</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Données de transaction</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Historique des achats</li>
                <li>Informations de paiement (cryptées et sécurisées via Stripe)</li>
                <li>Billets et réservations</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Eye className="w-6 h-6 text-secondary-600" />
            <h2 className="text-2xl font-display font-bold text-gray-900">Finalités d'Utilisation</h2>
          </div>
          <div className="space-y-4 text-gray-700">
            <p>Vos données personnelles sont collectées et traitées pour les finalités suivantes :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Gestion de votre compte utilisateur et authentification</li>
              <li>Traitement de vos commandes et émission de billets</li>
              <li>Service client et support technique</li>
              <li>Envoi de communications relatives à vos réservations</li>
              <li>Amélioration de nos services et personnalisation de votre expérience</li>
              <li>Prévention de la fraude et sécurité de la plateforme</li>
              <li>Respect de nos obligations légales et réglementaires</li>
              <li>Statistiques et analyses (données anonymisées)</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Lock className="w-6 h-6 text-secondary-600" />
            <h2 className="text-2xl font-display font-bold text-gray-900">Sécurité des Données</h2>
          </div>
          <div className="prose prose-gray max-w-none text-gray-700">
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour
              garantir la sécurité de vos données personnelles :
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li>Chiffrement SSL/TLS pour toutes les communications</li>
              <li>Hébergement sécurisé chez Supabase avec certifications conformes</li>
              <li>Authentification renforcée et gestion des accès</li>
              <li>Sauvegardes régulières et plan de reprise d'activité</li>
              <li>Surveillance et détection des intrusions</li>
              <li>Formation de nos équipes aux bonnes pratiques de sécurité</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <UserCheck className="w-6 h-6 text-secondary-600" />
            <h2 className="text-2xl font-display font-bold text-gray-900">Vos Droits</h2>
          </div>
          <div className="prose prose-gray max-w-none text-gray-700">
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
              Informatique et Libertés, vous disposez des droits suivants :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Droit d'accès</h4>
                <p className="text-sm">Obtenir une copie de vos données personnelles</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Droit de rectification</h4>
                <p className="text-sm">Corriger vos données inexactes ou incomplètes</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Droit à l'effacement</h4>
                <p className="text-sm">Demander la suppression de vos données</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Droit à la limitation</h4>
                <p className="text-sm">Limiter le traitement de vos données</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Droit à la portabilité</h4>
                <p className="text-sm">Récupérer vos données dans un format structuré</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Droit d'opposition</h4>
                <p className="text-sm">S'opposer au traitement de vos données</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-secondary-50 rounded-lg border border-secondary-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Pour exercer vos droits,</span> contactez notre Délégué
                à la Protection des Données (DPO) :
              </p>
              <p className="text-sm text-secondary-600 mt-2">
                Sophie BERNARD - <a href="mailto:dpo@onewayticket.fr" className="underline">dpo@onewayticket.fr</a>
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Vous disposez également du droit d'introduire une réclamation auprès de la CNIL
                (Commission Nationale de l'Informatique et des Libertés).
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Conservation des Données</h2>
          <div className="prose prose-gray max-w-none text-gray-700">
            <p>
              Vos données personnelles sont conservées pendant la durée nécessaire aux finalités
              pour lesquelles elles ont été collectées :
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li><span className="font-semibold">Données de compte :</span> Durée de vie du compte + 1 an</li>
              <li><span className="font-semibold">Données de transaction :</span> 10 ans (obligations comptables)</li>
              <li><span className="font-semibold">Données de connexion :</span> 1 an maximum</li>
              <li><span className="font-semibold">Cookies :</span> 13 mois maximum</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Partage des Données</h2>
          <div className="prose prose-gray max-w-none text-gray-700">
            <p>
              Vos données personnelles peuvent être partagées avec :
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li><span className="font-semibold">Prestataires de services :</span> Stripe (paiements), Supabase (hébergement)</li>
              <li><span className="font-semibold">Organisateurs d'événements :</span> Uniquement les informations nécessaires à la gestion de votre participation</li>
              <li><span className="font-semibold">Autorités légales :</span> En cas de demande légale ou pour protéger nos droits</li>
            </ul>
            <p className="mt-4">
              Nous ne vendons jamais vos données personnelles à des tiers.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Contact</h2>
          <div className="prose prose-gray max-w-none text-gray-700">
            <p>
              Pour toute question concernant cette politique de confidentialité ou le traitement
              de vos données personnelles, vous pouvez nous contacter :
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold">ONEWAYTICKET SAS</p>
              <p className="text-sm mt-2">123 Avenue des Événements, 75001 Paris, France</p>
              <p className="text-sm mt-2">
                Email : <a href="mailto:dpo@onewayticket.fr" className="text-secondary-600 underline">dpo@onewayticket.fr</a>
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

export default PrivacyPage;
