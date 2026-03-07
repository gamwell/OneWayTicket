import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "../../supabaseClient";

// ✅ Types alignés sur ton SQL
type Ticket = {
  id: string;
  event_id: string | null;
  scanned_at: string | null; // Changé de checked_in/updated_at
  holder_name: string | null; // Ton SQL utilise holder_name
  user_id: string | null;
  final_price: number;
};

type ScanLog = {
  id: string;
  ticket_id: string;
  scanned_by: string | null;
  scanned_at: string; // Ton SQL utilise scanned_at
};

export default function CheckinDashboard() {
  const [selectedEventId, setSelectedEventId] = useState<string | "all">("all");
  const [stats, setStats] = useState({ total: 0, scanned: 0, remaining: 0 });
  const [entries, setEntries] = useState<Ticket[]>([]);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(false);

  // --- CHARGEMENT DES DONNÉES ---
  const fetchData = useCallback(async (eventId: string | "all") => {
    try {
      setLoading(true);

      // 1. Récupération des Tickets
      let query = supabase.from("tickets").select("*");
      if (eventId !== "all") query = query.eq("event_id", eventId);
      
      const { data: allTickets } = await query;
      const all = (allTickets || []) as Ticket[];
      
      // ✅ Logique : Un ticket est "scanné" si scanned_at n'est pas NULL
      const scannedTickets = all.filter((t) => t.scanned_at !== null);

      setStats({
        total: all.length,
        scanned: scannedTickets.length,
        remaining: all.length - scannedTickets.length,
      });

      // Tri des dernières entrées par date de scan
      setEntries(scannedTickets.sort((a, b) => 
        new Date(b.scanned_at!).getTime() - new Date(a.scanned_at!).getTime()
      ));

      // 2. Récupération des Logs
      const { data: logs } = await supabase
        .from("scan_logs")
        .select("*")
        .order("scanned_at", { ascending: false })
        .limit(50);

      setScanLogs((logs || []) as ScanLog[]);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- TEMPS RÉEL (REALTIME) ---
  useEffect(() => {
    fetchData(selectedEventId);

    // Écoute les scans (Updates sur la table tickets)
    const channel = supabase
      .channel('checkin-realtime')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'tickets' }, 
        () => fetchData(selectedEventId)
      )
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'scan_logs' }, 
        () => fetchData(selectedEventId)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedEventId, fetchData]);

  return (
    <div className="min-h-screen bg-[#050816] text-white pt-24 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* DASHBOARD HEADER */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black uppercase italic text-cyan-400">Live Control</h1>
            <p className="text-white/30 text-xs tracking-[0.3em] uppercase">Flux de scan en direct</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-black text-white">{stats.scanned}<span className="text-white/20">/{stats.total}</span></p>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Entrées validées</p>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
            style={{ width: `${(stats.scanned / stats.total) * 100}%` }}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* DERNIÈRES ENTRÉES */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-6 text-white/50">Derniers accès</h2>
            <div className="space-y-3">
              {entries.slice(0, 6).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 animate-in slide-in-from-right duration-500">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 font-bold">
                      OK
                    </div>
                    <div>
                      <p className="text-sm font-bold">{ticket.holder_name || "Anonyme"}</p>
                      <p className="text-[10px] text-white/30">ID: {ticket.id.slice(0,8)}</p>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-white/50">
                    {new Date(ticket.scanned_at!).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* TIMELINE TECHNIQUE */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-6 text-white/50">Logs Scanners</h2>
            <div className="space-y-4">
              {scanLogs.slice(0, 8).map((log) => (
                <div key={log.id} className="flex gap-4 border-l-2 border-cyan-500/30 pl-4 py-1">
                  <div className="flex-1">
                    <p className="text-[11px] font-medium text-white/80">Scan réussi sur <span className="text-cyan-400">#{log.ticket_id.slice(0,8)}</span></p>
                    <p className="text-[9px] text-white/40 uppercase">Par: {log.scanned_by || "App Mobile"}</p>
                  </div>
                  <p className="text-[10px] font-mono text-cyan-500/60">{new Date(log.scanned_at).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}