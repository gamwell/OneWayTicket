import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
    <h2 className="text-white font-black uppercase tracking-wide mb-3 text-sm">{title}</h2>
    <div className="text-white/60 leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-[#1a0525] text-white pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-300 text-[10px] font-black uppercase tracking-widest mb-4">
            <BookOpen size={12} /> Légal
          </div>
          <h1 className="text-4xl font-black uppercase italic mb-2">Mentions Légales</h1>
          <p className="text-white/30 text-sm">Dernière mise à jour : 1er janvier 2025</p>
        </div>

        <div className="space-y-6">
          <Section title="Éditeur du site">
            <p><span className="text-white font-bold">Raison sociale :</span> OneWayTicket SAS</p>
            <p><span className="text-white font-bold">Forme juridique :</span> Société par Actions Simplifiée (SAS)</p>
            <p><span className="text-white font-bold">Capital social :</span> 10 000 €</p>
            <p><span className="text-white font-bold">RCS :</span> Paris B 123 456 789</p>
            <p><span className="text-white font-bold">N° TVA intracommunautaire :</span> FR 12 123456789</p>
            <p><span className="text-white font-bold">Siège social :</span> 12 Rue de la Paix, 75001 Paris, France</p>
          </Section>

          <Section title="Contact">
            <p><span className="text-white font-bold">Email :</span>{" "}
              <a href="mailto:contact@onewayticket.fr" className="text-rose-300 hover:underline">contact@onewayticket.fr</a>
            </p>
            <p><span className="text-white font-bold">Téléphone :</span>{" "}
              <a href="tel:+33142000000" className="text-rose-300 hover:underline">+33 1 42 00 00 00</a>
            </p>
            <p><span className="text-white font-bold">Directeur de la publication :</span> Alexandre Moreau</p>
          </Section>

          <Section title="Hébergement">
            <p><span className="text-white font-bold">Hébergeur frontend :</span> Vercel Inc., 340 Pine Street Suite 701, San Francisco, CA 94104, États-Unis</p>
            <p><span className="text-white font-bold">Hébergeur base de données :</span> Supabase Inc. — serveurs localisés dans l'Union Européenne (Frankfurt, Allemagne)</p>
          </Section>

          <Section title="Propriété intellectuelle">
            <p>L'ensemble du contenu de ce site (textes, images, logo, code, design) est la propriété exclusive de OneWayTicket SAS et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.</p>
            <p>Toute reproduction, représentation, modification ou exploitation non autorisée de tout ou partie de ces éléments est strictement interdite.</p>
          </Section>

          <Section title="Responsabilité">
            <p>OneWayTicket SAS s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, elle ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.</p>
            <p>OneWayTicket SAS décline toute responsabilité pour tout dommage résultant d'une intrusion frauduleuse d'un tiers ayant entraîné une modification des informations.</p>
          </Section>

          <Section title="Liens hypertextes">
            <p>Le site peut contenir des liens vers d'autres sites internet. OneWayTicket SAS n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.</p>
          </Section>

          <Section title="Droit applicable">
            <p>Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>
            <p>Pour toute réclamation : <a href="mailto:contact@onewayticket.fr" className="text-rose-300 hover:underline">contact@onewayticket.fr</a></p>
          </Section>
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest text-sm underline">← Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}
