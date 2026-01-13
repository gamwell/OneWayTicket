import React, { useState, useMemo, useCallback, useEffect, memo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

// ✅ ASSUREZ-VOUS QUE CE CHEMIN EST EXACT ET SAUVEGARDÉ
import { supabase } from "../lib/supabase"; 

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, profile, logout } = useAuth();
  const { cart } = useCart();

  const isAdmin = useMemo(() => {
    return (
      profile?.role === "admin" ||
      profile?.role === "superadmin" ||
      profile?.is_admin === true
    );
  }, [profile]);

  const fetchPendingVerifications = useCallback(async () => {
    // Sécurité supplémentaire : vérifier si supabase est bien défini
    if (!user || !isAdmin || !supabase) return; 

    try {
      const { count, error } = await supabase
        .from("user_profiles")
        .select("id", { count: "exact", head: true })
        .eq("verification_status", "pending");

      if (!error && count !== null) setPendingCount(count);
    } catch (err) {
      console.log("[Navbar] Erreur récupération notifications");
    }
  }, [isAdmin, user]);

  useEffect(() => {
    if (!user || !isAdmin || !supabase) {
      setPendingCount(0);
      return;
    }

    fetchPendingVerifications();

    const channel = supabase
      .channel("navbar-admin-notifs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_profiles" },
        () => fetchPendingVerifications()
      )
      .subscribe();

    return () => {
      // ✅ Correction : vérification avant suppression
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [isAdmin, user, fetchPendingVerifications]);

  const navigation = useMemo(() => {
    const links = [
      { name: "Accueil", href: "/" },
      { name: "Événements", href: "/events" },
    ];
    if (user) {
      links.push({ name: "Mes Billets", href: "/my-tickets" });
      if (isAdmin) links.push({ name: "Admin", href: "/admin" });
    }
    return links;
  }, [user, isAdmin]);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setIsOpen(false);
      navigate("/auth/login");
    } catch (error) {
      console.error("Erreur déconnexion :", error);
    }
  }, [logout, navigate]);

  return (
    <nav className="fixed top-0 z-[100] w-full bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all">
              <span className="text-white font-black text-xl italic">O</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-white hidden sm:block uppercase italic">
              OneWay<span className="text-cyan-400">Ticket</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-5 py-2 rounded-full text-base font-black uppercase tracking-[0.15em] transition-all ${
                  isActive(item.href)
                    ? "bg-white text-slate-900 shadow-xl"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                } ${item.name === "Admin" ? "text-pink-500" : ""}`}
              >
                {item.name}
                {item.name === "Admin" && pendingCount > 0 && (
                  <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-pink-500 animate-pulse"></span>
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/cart")} className="p-3 text-slate-400 hover:text-cyan-400 relative">
              <ShoppingCart size={22} />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 bg-pink-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-[#0f172a]">
                  {cart.length}
                </span>
              )}
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-2 pl-4 border-l border-white/10">
                <Link to="/profile" className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                  <User size={14} className="text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">
                    {/* ✅ Sécurité sur le split */}
                    {profile?.full_name ? profile.full_name.split(" ")[0] : "Profil"}
                  </span>
                </Link>
                <button onClick={handleLogout} className="p-3 text-slate-500 hover:text-rose-500">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/auth/login" className="hidden md:block px-8 py-3 bg-cyan-500 text-[#0f172a] rounded-2xl font-black text-sm uppercase tracking-[0.15em]">
                Connexion
              </Link>
            )}

            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-cyan-400 p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#0f172a] border-b border-white/10 p-6 space-y-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center justify-between p-4 rounded-2xl font-black uppercase text-xs tracking-widest ${
                isActive(item.href) ? "bg-white text-slate-900" : "text-slate-400 bg-white/5"
              }`}
            >
              {item.name}
              <ChevronRight size={18} />
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default memo(Navbar);