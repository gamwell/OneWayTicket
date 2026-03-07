import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
    <h2 className="text-white font-black uppercase tracking-wide mb-3 text-sm">{title}</h2>
    <div className="text-white/60 leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#1a0525] text-white pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-300 text-[10px] font-black uppercase tracking-widest mb-4">
            <Shield size={12} /> Confidentialité
          </div>
          <h1 className="text-4xl font-black uppercase italic mb-2">Privacy Policy</h1>
          <p className="text-white/30 text-sm">Dernière mise à jour : 1er janvier 2025</p>
        </div>

        <div className="space-y-6">
          <Section title="1. Responsable du traitement">
            <p>OneWayTicket SAS — 12 Rue de la Paix, 75001 Paris, France</p>
            <p>Email DPO : <a href="mailto:privacy@onewayticket.fr" className="text-teal-300 hover:underline">privacy@onewayticket.fr</a></p>
          </Section>

          <Section title="2. Données collectées">
            <p>Lors de votre utilisation de la plateforme, nous collectons les données suivantes :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-white/50">
              <li>Nom, prénom, adresse email lors de l'inscription</li>
              <li>Données de paiement (traitées exclusivement par Stripe — jamais stockées chez nous)</li>
              <li>Historique des achats et billets</li>
              <li>Données de navigation (cookies, adresse IP)</li>
            </ul>
          </Section>

          <Section title="3. Finalités du traitement">
            <ul className="space-y-1 list-disc list-inside text-white/50">
              <li>Gestion des comptes utilisateurs et des commandes</li>
              <li>Envoi des billets et confirmations par email</li>
              <li>Amélioration de nos services et personnalisation</li>
              <li>Respect de nos obligations légales et comptables</li>
            </ul>
          </Section>

          <Section title="4. Base légale">
            <p>Le traitement de vos données repose sur l'exécution du contrat (achat de billets), votre consentement (communications marketing) et nos obligations légales.</p>
          </Section>

          <Section title="5. Durée de conservation">
            <p>Vos données sont conservées pendant la durée de votre relation contractuelle avec OneWayTicket, puis archivées pendant 5 ans conformément aux obligations légales françaises.</p>
          </Section>

          <Section title="6. Partage des données">
            <p>Vos données ne sont jamais vendues. Elles peuvent être partagées avec :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-white/50">
              <li>Stripe (traitement des paiements)</li>
              <li>Supabase (hébergement des données — serveurs UE)</li>
              <li>Les organisateurs des événements pour la gestion des accès</li>
            </ul>
          </Section>

          <Section title="7. Vos droits (RGPD)">
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-white/50">
              <li>Droit d'accès à vos données personnelles</li>
              <li>Droit de rectification ou de suppression</li>
              <li>Droit à la portabilité de vos données</li>
              <li>Droit d'opposition au traitement</li>
              <li>Droit d'introduire une réclamation auprès de la CNIL</li>
            </ul>
            <p className="mt-3">Pour exercer ces droits : <a href="mailto:privacy@onewayticket.fr" className="text-teal-300 hover:underline">privacy@onewayticket.fr</a></p>
          </Section>

          <Section title="8. Cookies">
            <p>Notre site utilise des cookies techniques nécessaires au fonctionnement et des cookies analytiques anonymisés. Aucun cookie publicitaire tiers n'est utilisé.</p>
          </Section>
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="text-teal-400 hover:text-teal-300 font-bold uppercase tracking-widest text-sm underline">← Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}
