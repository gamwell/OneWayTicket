import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "../../lib/supabase";

type Ticket = {
  id: string;
  event_id: string | null;
  checked_in: boolean;
  updated_at: string;
  email?: string | null;
  name?: string | null;
};

type Event = {
  id: string;
  title: string;
};

type ScanLog = {
  id: string;
  ticket_id: string;
  scanned_by: string | null;
  status: string | null;
  scan_method: string | null;
  created_at: string;
};

type Stats = {
  total: number;
  checked_in: number;
  remaining: number;
};

export default function CheckinDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | "all">("all");

  const [stats, setStats] = useState<Stats>({
    total: 0,
    checked_in: 0,
    remaining: 0,
  });

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [entries, setEntries] = useState<Ticket[]>([]);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(false);

  // ------------------------------------------------------------
  // 🔥 Charger la liste des événements
  // ------------------------------------------------------------
  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from("events")
      .select("id, title")
      .order("date", { ascending: false });

    if (!error && data) {
      setEvents(data as Event[]);
    }
  }, []);

  // ------------------------------------------------------------
  // 🔥 Charger les stats + tickets + logs
  // ------------------------------------------------------------
  const fetchData = useCallback(
    async (eventId: string | "all") => {
      try {
        setLoading(true);

        // Tickets (tous ou par event)
        let ticketsQuery = supabase.from("tickets").select("*");
        if (eventId !== "all") {
          ticketsQuery = ticketsQuery.eq("event_id", eventId);
        }
        const { data: allTickets, error: ticketsErr } = await ticketsQuery;

        if (ticketsErr) throw ticketsErr;

        const all = (allTickets || []) as Ticket[];
        const checked = all.filter((t) => t.checked_in);

        const total = all.length;
        const checkedCount = checked.length;

        setStats({
          total,
          checked_in: checkedCount,
          remaining: total - checkedCount,
        });

        // Historique des entrées (tickets check-in)
        const sortedEntries = [...checked].sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );

        setTickets(all);
        setEntries(sortedEntries);

        // Scan logs (pour scanners actifs + timeline)
        let logsQuery = supabase
          .from("scan_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200);

        if (eventId !== "all") {
          // Si tu as event_id dans scan_logs, tu peux filtrer ici.
          // Sinon, on garde tous les logs.
        }

        const { data: logs, error: logsErr } = await logsQuery;

        if (logsErr) throw logsErr;

        setScanLogs((logs || []) as ScanLog[]);
      } catch (err) {
        console.error("Erreur chargement dashboard:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ------------------------------------------------------------
  // 🔥 Realtime : tickets + scan_logs
  // ------------------------------------------------------------
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchData(selectedEventId);

    const ticketsChannel = supabase
      .channel("tickets-checkin-advanced")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tickets" },
        () => fetchData(selectedEventId)
      )
      .subscribe();

    const logsChannel = supabase
      .channel("scan-logs-advanced")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scan_logs" },
        () => fetchData(selectedEventId)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsChannel);
      supabase.removeChannel(logsChannel);
    };
  }, [fetchData, selectedEventId]);

  // ------------------------------------------------------------
  // 🔥 Filtrage par recherche (ticket, email, nom)
  // ------------------------------------------------------------
  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) return entries;

    const term = searchTerm.toLowerCase();

    return entries.filter((t) => {
      const idMatch = t.id.toString().toLowerCase().includes(term);
      const emailMatch = (t.email || "").toLowerCase().includes(term);
      const nameMatch = (t.name || "").toLowerCase().includes(term);
      return idMatch || emailMatch || nameMatch;
    });
  }, [entries, searchTerm]);

  // ------------------------------------------------------------
  // 🔥 Scanners actifs (à partir des scan_logs)
  // ------------------------------------------------------------
  const activeScanners = useMemo(() => {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    const map = new Map<
      string,
      { scanned_by: string | null; scan_method: string | null; lastSeen: number; count: number }
    >();

    for (const log of scanLogs) {
      const key = `${log.scanned_by || "anon"}-${log.scan_method || "unknown"}`;
      const ts = new Date(log.created_at).getTime();

      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          scanned_by: log.scanned_by,
          scan_method: log.scan_method,
          lastSeen: ts,
          count: 1,
        });
      } else {
        existing.count += 1;
        if (ts > existing.lastSeen) existing.lastSeen = ts;
      }
    }

    return Array.from(map.values()).filter(
      (s) => now - s.lastSeen <= fiveMinutes
    );
  }, [scanLogs]);

  // ------------------------------------------------------------
  // 🔥 Export CSV
  // ------------------------------------------------------------
  const exportCsv = (type: "tickets" | "entries" | "logs") => {
    let rows: string[] = [];
    let filename = "export.csv";

    if (type === "tickets") {
      filename = "tickets.csv";
      rows.push("id,event_id,checked_in,updated_at,email,name");
      tickets.forEach((t) => {
        rows.push(
          [
            t.id,
            t.event_id || "",
            t.checked_in ? "1" : "0",
            t.updated_at,
            t.email || "",
            t.name || "",
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
        );
      });
    } else if (type === "entries") {
      filename = "entries.csv";
      rows.push("id,event_id,updated_at,email,name");
      entries.forEach((t) => {
        rows.push(
          [
            t.id,
            t.event_id || "",
            t.updated_at,
            t.email || "",
            t.name || "",
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
        );
      });
    } else if (type === "logs") {
      filename = "scan_logs.csv";
      rows.push("id,ticket_id,scanned_by,status,scan_method,created_at");
      scanLogs.forEach((l) => {
        rows.push(
          [
            l.id,
            l.ticket_id,
            l.scanned_by || "",
            l.status || "",
            l.scan_method || "",
            l.created_at,
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
        );
      });
    }

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ------------------------------------------------------------
  // 🔥 Mini “graphique” simple (barres)
  // ------------------------------------------------------------
  const checkedRatio = stats.total ? stats.checked_in / stats.total : 0;
  const remainingRatio = stats.total ? stats.remaining / stats.total : 0;

  // ------------------------------------------------------------
  // 🔥 UI
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#050816] text-white pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight">
              Tableau de bord <span className="text-cyan-400">Check‑in</span>
            </h1>
            <p className="text-xs text-white/50 uppercase tracking-[0.25em] mt-2">
              Monitoring temps réel des entrées
            </p>
          </div>

          <div className="flex flex-col md:items-end gap-3">
            {/* Filtre événement */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                Événement
              </span>
              <select
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm"
                value={selectedEventId}
                onChange={(e) =>
                  setSelectedEventId(e.target.value as string | "all")
                }
              >
                <option value="all">Tous les événements</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Export */}
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => exportCsv("tickets")}
                className="px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                Export Tickets
              </button>
              <button
                onClick={() => exportCsv("entries")}
                className="px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                Export Entrées
              </button>
              <button
                onClick={() => exportCsv("logs")}
                className="px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                Export Logs
              </button>
            </div>
          </div>
        </header>

        {/* STATS + MINI GRAPHIQUE + SCANNERS */}
        <section className="grid md:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <h2 className="text-xs uppercase tracking-[0.25em] text-white/50">
              Statistiques
            </h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-3xl font-black">{stats.total}</p>
                <p className="text-[10px] uppercase text-white/50 mt-1">
                  Billets
                </p>
              </div>
              <div>
                <p className="text-3xl font-black text-emerald-300">
                  {stats.checked_in}
                </p>
                <p className="text-[10px] uppercase text-white/50 mt-1">
                  Entrées
                </p>
              </div>
              <div>
                <p className="text-3xl font-black text-amber-300">
                  {stats.remaining}
                </p>
                <p className="text-[10px] uppercase text-white/50 mt-1">
                  Restants
                </p>
              </div>
            </div>
          </div>

          {/* Mini “graphique” */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <h2 className="text-xs uppercase tracking-[0.25em] text-white/50">
              Progression
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] text-white/60">
                <span>Entrées</span>
                <span>
                  {stats.checked_in} / {stats.total}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all"
                  style={{ width: `${checkedRatio * 100}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-white/60 mt-3">
                <span>Restants</span>
                <span>{stats.remaining}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all"
                  style={{ width: `${remainingRatio * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Scanners actifs */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-3">
            <h2 className="text-xs uppercase tracking-[0.25em] text-white/50">
              Scanners actifs (5 dernières minutes)
            </h2>
            {activeScanners.length === 0 && (
              <p className="text-xs text-white/50">
                Aucun scanner actif récemment.
              </p>
            )}
            <div className="space-y-2 max-h-40 overflow-auto pr-1">
              {activeScanners.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs bg-white/5 rounded-xl px-3 py-2"
                >
                  <div>
                    <p className="font-semibold">
                      {s.scan_method || "inconnu"}
                    </p>
                    <p className="text-[10px] text-white/50">
                      {s.scanned_by || "anonyme"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/60">
                      {new Date(s.lastSeen).toLocaleTimeString()}
                    </p>
                    <p className="text-[10px] text-emerald-300">
                      {s.count} scans
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RECHERCHE + HISTORIQUE */}
        <section className="grid md:grid-cols-[2fr,1.5fr] gap-8">
          {/* Historique des entrées */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4 gap-3">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">
                Historique des entrées
              </h2>
              <input
                type="text"
                placeholder="Rechercher par ticket, email, nom..."
                className="bg-black/40 border border-white/10 rounded-full px-4 py-2 text-xs w-full max-w-xs outline-none focus:border-cyan-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
              {filteredEntries.map((e) => (
                <div
                  key={e.id}
                  className="bg-black/40 border border-white/5 rounded-2xl px-4 py-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold">
                      Ticket #{e.id}
                    </p>
                    <p className="text-[10px] text-white/50">
                      {e.email || "Email inconnu"}
                    </p>
                    {e.name && (
                      <p className="text-[10px] text-white/50">
                        {e.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-emerald-300">
                      {new Date(e.updated_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {!loading && filteredEntries.length === 0 && (
                <p className="text-xs text-white/50 mt-4">
                  Aucune entrée trouvée.
                </p>
              )}

              {loading && (
                <p className="text-xs text-white/50 mt-4">
                  Chargement...
                </p>
              )}
            </div>
          </div>

          {/* Timeline des scans */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/70 mb-4">
              Timeline des scans
            </h2>

            <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
              {scanLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 text-xs"
                >
                  <div className="mt-1 w-2 h-2 rounded-full bg-emerald-300" />
                  <div className="flex-1">
                    <p className="font-semibold">
                      Ticket #{log.ticket_id}
                    </p>
                    <p className="text-[10px] text-white/60">
                      {log.scan_method || "inconnu"} —{" "}
                      {log.scanned_by || "anonyme"}
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-white/50">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}

              {scanLogs.length === 0 && !loading && (
                <p className="text-xs text-white/50">
                  Aucun scan enregistré pour le moment.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}