import { Ticket, Target, Users, Heart } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary-900 via-secondary-600 to-secondary-500 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6">
            <Ticket className="w-10 h-10 text-secondary-500" />
          </div>
          <h1 className="text-5xl font-display font-bold mb-6">À propos de ONEWAYTICKET</h1>
          <p className="text-xl opacity-95">
            Votre plateforme de billetterie événementielle moderne et sécurisée
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-6">Notre Mission</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-4">
            ONEWAYTICKET est né d'une vision simple : rendre l'accès aux événements facile, rapide et sécurisé pour tous.
            Que vous soyez un passionné de concerts, un amateur de conférences ou un organisateur d'événements,
            nous sommes là pour simplifier votre expérience.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Notre plateforme combine les dernières technologies web avec une interface intuitive pour offrir
            une expérience utilisateur exceptionnelle, de la découverte d'un événement jusqu'à l'entrée avec votre billet numérique.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-6">
              <Target className="w-8 h-8 text-secondary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Innovation</h3>
            <p className="text-gray-600">
              Nous utilisons les technologies les plus récentes pour offrir une expérience moderne et performante.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 rounded-full mb-6">
              <Users className="w-8 h-8 text-accent-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Communauté</h3>
            <p className="text-gray-600">
              Nous créons des ponts entre les organisateurs d'événements et les participants du monde entier.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
              <Heart className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Passion</h3>
            <p className="text-gray-600">
              Chaque événement est unique, et nous mettons notre cœur à rendre chaque expérience mémorable.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-accent-50 to-secondary-50 rounded-xl p-8 mb-12">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-6">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparence</h3>
              <p className="text-gray-600">
                Des prix clairs, sans frais cachés. Vous savez toujours exactement ce que vous payez.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sécurité</h3>
              <p className="text-gray-600">
                Vos données et paiements sont protégés par les meilleures technologies de sécurité.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Simplicité</h3>
              <p className="text-gray-600">
                Une interface intuitive qui rend la réservation de billets rapide et agréable.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Support</h3>
              <p className="text-gray-600">
                Une équipe dédiée disponible pour vous aider à chaque étape de votre parcours.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Rejoignez-nous !</h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Que vous soyez un utilisateur à la recherche d'événements passionnants ou un organisateur
            souhaitant partager vos créations, ONEWAYTICKET est fait pour vous.
          </p>
          <a
            href="/auth/register"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-accent-500 to-secondary-500 text-white rounded-lg font-semibold hover:from-accent-600 hover:to-secondary-600 transition-all shadow-lg"
          >
            <span>Créer un compte gratuit</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
