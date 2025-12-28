import { Users, Calendar, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* En-tête Hero */}
      <div className="relative bg-blue-700 py-16 sm:py-24">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Notre Mission
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-blue-100">
            Simplifier la connexion entre les organisateurs passionnés et le public en quête d'expériences inoubliables.
          </p>
        </div>
      </div>

      {/* Section Contenu */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="text-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white mx-auto">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-lg font-medium text-gray-900">Événements Variés</h3>
            <p className="mt-2 text-base text-gray-500">
              Des concerts aux conférences tech, nous rassemblons le meilleur de la culture et du divertissement.
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white mx-auto">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-lg font-medium text-gray-900">Communauté</h3>
            <p className="mt-2 text-base text-gray-500">
              Rejoignez des milliers de passionnés et partagez des moments uniques ensemble.
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white mx-auto">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-lg font-medium text-gray-900">Qualité Garantie</h3>
            <p className="mt-2 text-base text-gray-500">
              Nous sélectionnons rigoureusement nos partenaires pour vous assurer la meilleure expérience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}