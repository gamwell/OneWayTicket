import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="w-full bg-gradient-to-r from-[#FF7A00] to-[#FF3D00] text-white shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        
        {/* LOGO */}
        <Link to="/" className="text-2xl font-extrabold tracking-wide">
          ONEWAYTICKET
        </Link>

        {/* NAVIGATION */}
        <nav className="flex gap-6 font-semibold">
          <Link to="/" className="hover:opacity-80 transition">Accueil</Link>
          <Link to="/events" className="hover:opacity-80 transition">Événements</Link>
          <Link to="/events/music" className="hover:opacity-80 transition">Musique</Link>
          <Link to="/events/travel" className="hover:opacity-80 transition">Voyage</Link>
          <Link to="/events/cruise" className="hover:opacity-80 transition">Croisière</Link>
        </nav>

        {/* BOUTON */}
        <Link
          to="/auth/login"
          className="px-4 py-2 rounded-xl bg-white text-[#FF3D00] font-bold shadow hover:shadow-md transition"
        >
          Connexion
        </Link>
      </div>
    </header>
  );
};

export default Header;
