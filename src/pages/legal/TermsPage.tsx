import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#1a0525] text-white pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 text-[10px] font-black uppercase tracking-widest mb-4">
            <FileText size={12} /> Conditions Générales
          </div>
          <h1 className="text-4xl font-black uppercase italic mb-2">CGU & CGV</h1>
          <p className="text-white/30 text-sm">Dernière mise à jour : 1er janvier 2025</p>
        </div>

        <div className="space-y-8 text-white/60 leading-relaxed">

          <Section title="1. Présentation de la société">
            <p>OneWayTicket SAS, société par actions simplifiée au capital de 10 000 €, immatriculée au RCS de Paris sous le numéro 123 456 789, dont le siège social est situé au 12 Rue de la Paix, 75001 Paris, France.</p>
            <p className="mt-2">Email : <a href="mailto:contact@onewayticket.fr" className="text-amber-300 hover:underline">contact@onewayticket.fr</a> — Tél : +33 1 42 00 00 00</p>
          </Section>

          <Section title="2. Objet">
            <p>Les présentes Conditions Générales d'Utilisation (CGU) et Conditions Générales de Vente (CGV) régissent l'utilisation de la plateforme OneWayTicket accessible à l'adresse quarksydigital.com, ainsi que l'achat de billets pour des événements proposés sur cette plateforme.</p>
          </Section>

          <Section title="3. Accès au service">
            <p>L'accès à la plateforme est ouvert à toute personne physique majeure disposant d'un accès Internet. L'utilisation de certains services nécessite la création d'un compte utilisateur. L'utilisateur s'engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants.</p>
          </Section>

          <Section title="4. Conditions d'achat">
            <p>Toute commande de billet effectuée sur la plateforme est ferme et définitive. Le paiement est sécurisé via Stripe. Une confirmation d'achat est envoyée par email avec le QR code correspondant dans les minutes suivant la transaction.</p>
            <p className="mt-2">Les prix affichés sont en euros TTC. OneWayTicket se réserve le droit de modifier les tarifs à tout moment.</p>
          </Section>

          <Section title="5. Politique d'annulation et remboursement">
            <p>Conformément à l'article L221-28 du Code de la consommation, les billets pour des événements culturels ou de loisirs ne bénéficient pas du droit de rétractation de 14 jours. Aucun remboursement ne sera accordé sauf en cas d'annulation de l'événement par l'organisateur.</p>
          </Section>

          <Section title="6. Propriété intellectuelle">
            <p>L'ensemble des éléments de la plateforme (logo, design, contenus, code source) est la propriété exclusive de OneWayTicket SAS. Toute reproduction sans autorisation est interdite.</p>
          </Section>

          <Section title="7. Responsabilité">
            <p>OneWayTicket agit en qualité d'intermédiaire technique entre les organisateurs d'événements et les acheteurs. La responsabilité de OneWayTicket ne saurait être engagée en cas d'annulation, modification ou report d'un événement décidé par son organisateur.</p>
          </Section>

          <Section title="8. Droit applicable">
            <p>Les présentes CGU/CGV sont soumises au droit français. Tout litige sera soumis aux tribunaux compétents de Paris.</p>
          </Section>

        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="text-amber-400 hover:text-amber-300 font-bold uppercase tracking-widest text-sm underline">
            ← Retour à l'accueil
          </Link>
        </div>

      </div>
    </div>
  );
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
    <h2 className="text-white font-black uppercase tracking-wide mb-3 text-sm">{title}</h2>
    {children}
  </div>
);
