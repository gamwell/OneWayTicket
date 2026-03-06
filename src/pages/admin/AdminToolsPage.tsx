import { Link } from "react-router-dom";
import { QrCode, Smartphone, WifiOff, BarChart3 } from "lucide-react";

export default function AdminToolsPage() {
  const tools = [
    {
      title: "Scan Standard",
      icon: <QrCode className="w-10 h-10" />,
      link: "/admin/scan",
      color: "bg-blue-600/20 border-blue-600/40 text-blue-300",
    },
    {
      title: "Scan Mobile",
      icon: <Smartphone className="w-10 h-10" />,
      link: "/admin/scan/mobile",
      color: "bg-green-600/20 border-green-600/40 text-green-300",
    },
    {
      title: "Scan Hors‑ligne",
      icon: <WifiOff className="w-10 h-10" />,
      link: "/admin/scan/offline",
      color: "bg-yellow-600/20 border-yellow-600/40 text-yellow-300",
    },
    {
      title: "Dashboard Check‑in",
      icon: <BarChart3 className="w-10 h-10" />,
      link: "/admin/checkin-dashboard",
      color: "bg-purple-600/20 border-purple-600/40 text-purple-300",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white py-16 px-6">
      <h1 className="text-4xl font-black text-center mb-12 uppercase tracking-wide">
        Outils Organisateur
      </h1>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {tools.map((tool) => (
          <Link
            key={tool.title}
            to={tool.link}
            className={`p-8 rounded-3xl border shadow-xl flex flex-col items-center gap-4 hover:scale-[1.04] hover:shadow-2xl transition-all backdrop-blur-xl ${tool.color}`}
          >
            {tool.icon}
            <h2 className="text-xl font-bold">{tool.title}</h2>
          </Link>
        ))}
      </div>

      <p className="text-center text-white/30 text-xs mt-12">
        OneWayTicket — Admin Tools
      </p>
    </div>
  );
}