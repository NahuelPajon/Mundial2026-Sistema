import React, { useState, useEffect } from "react";
import {
  Ticket,
  QrCode,
  ShoppingCart,
  Send,
  ChevronRight,
  MapPin,
  Compass,
  ExternalLink,
  AlertCircle,
  Loader2,
  HelpCircle,
  X,
  Check
} from "lucide-react";
import { ticketService } from "../services/ticketService";
import { authService } from "../services/authService";

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados para modales
  const [activeQR, setActiveQR] = useState(null); // Ticket para el cual se muestra el QR
  const [qrCodeData, setQrCodeData] = useState(null); // Datos del QR dinámico
  const [countdown, setCountdown] = useState(30);

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");

  const user = authService.getCurrentUser();
  const displayName = user && user.email
    ? user.email.split("@")[0].split(".")[0].charAt(0).toUpperCase() + user.email.split("@")[0].split(".")[0].slice(1)
    : "Aficionado";

  // Cargar tickets de la API / Servicio
  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await ticketService.getActiveTickets();
      setTickets(data);
      if (data.length > 0) {
        setSelectedTicketId(data[0].id);
      }
    } catch (err) {
      setError(err.message || "Error al cargar tus entradas. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // Timer para el QR Dinámico
  useEffect(() => {
    let timer;
    if (activeQR) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Cuando llega a 0, refrescamos el código QR dinámico
            refreshQR(activeQR.id);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeQR]);

  const handleOpenQR = async (ticket) => {
    setActiveQR(ticket);
    setCountdown(30);
    try {
      const qrInfo = await ticketService.generateDynamicQR(ticket.id);
      setQrCodeData(qrInfo.qrCode);
    } catch (err) {
      setQrCodeData(`FIFA-2026-${ticket.id}-${Math.floor(Date.now() / 1000)}`);
    }
  };

  const refreshQR = async (ticketId) => {
    try {
      const qrInfo = await ticketService.generateDynamicQR(ticketId);
      setQrCodeData(qrInfo.qrCode);
    } catch (err) {
      setQrCodeData(`FIFA-2026-${ticketId}-${Math.floor(Date.now() / 1000)}`);
    }
  };

  const handleCloseQR = () => {
    setActiveQR(null);
    setQrCodeData(null);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!selectedTicketId || !recipientEmail) return;

    try {
      setTransferring(true);
      setError("");
      setTransferSuccess("");

      await ticketService.transferTicket(selectedTicketId, recipientEmail);

      setTransferSuccess("¡Entrada transferida con éxito!");
      setRecipientEmail("");

      // Volver a cargar la lista de tickets
      setTimeout(() => {
        loadTickets();
        setTransferModalOpen(false);
        setTransferSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.message || "Hubo un error al transferir la entrada.");
    } finally {
      setTransferring(false);
    }
  };

  return (
    <>
      {/* Welcome Section */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="space-y-1">
          <p className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-widest">
            Dashboard de Aficionado
          </p>
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface">
            Hola, <span className="text-primary">{displayName}</span> 👋
          </h1>
        </div>
      </section>

      {/* My Assets / Hero Banner */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="md:col-span-2 glass-card rounded-xl p-stack-md flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:border-primary/20">
          <div className="relative z-10 space-y-stack-sm">
            <h3 className="font-headline-sm text-headline-sm flex items-center gap-2">
              <Ticket size={24} className="text-tertiary fill-tertiary" />
              Mis Activos
            </h3>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <span className="text-6xl font-extrabold text-white animate-pulse">--</span>
              ) : (
                <span className="text-6xl font-extrabold text-white">
                  {String(tickets.length).padStart(2, "0")}
                </span>
              )}
              <span className="font-label-bold text-on-surface-variant">Entradas Activas</span>
            </div>
          </div>
          <div className="relative z-10 pt-stack-md flex gap-stack-sm">
            <button
              onClick={() => tickets.length > 0 && handleOpenQR(tickets[0])}
              disabled={tickets.length === 0}
              className="bg-tertiary text-on-primary px-6 h-touch-target rounded-full font-label-bold active:scale-95 transition-transform flex items-center justify-center gap-2 stadium-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <QrCode size={20} />
              Mostrar Todos
            </button>
            <button className="border-2 border-white/20 text-white px-6 h-touch-target rounded-full font-label-bold hover:bg-white/5 active:scale-95 transition-colors">
              Ayuda
            </button>
          </div>
        </div>

        {/* Quick Access Chips */}
        <div className="flex flex-col gap-gutter">
          <button className="flex-1 glass-card rounded-xl p-gutter flex items-center justify-between hover:bg-primary-container/20 transition-all active:scale-95 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <ShoppingCart size={24} />
              </div>
              <div className="text-left">
                <p className="font-label-bold text-on-surface">Mis Compras</p>
                <p className="text-xs text-on-surface-variant">Historial de pagos</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-on-surface-variant" />
          </button>
          <button
            onClick={() => setTransferModalOpen(true)}
            className="flex-1 glass-card rounded-xl p-gutter flex items-center justify-between hover:bg-tertiary-container/20 transition-all active:scale-95 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-tertiary-container flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                <Send size={20} />
              </div>
              <div className="text-left">
                <p className="font-label-bold text-on-surface">Transferir</p>
                <p className="text-xs text-on-surface-variant">Enviar a un amigo</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-on-surface-variant" />
          </button>
        </div>
      </section>

      {/* Upcoming Matches */}
      <section className="space-y-stack-md">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md">Próximos Partidos</h2>
          <button className="text-primary font-label-bold flex items-center gap-1 hover:underline text-sm">
            Calendario completo
            <ExternalLink size={14} />
          </button>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        )}

        {error && (
          <div className="bg-error-container/20 border border-error-container text-error rounded-xl p-4 flex items-center gap-3">
            <AlertCircle size={24} />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Matches Grid */}
        {!loading && !error && (
          <div className="flex md:grid md:grid-cols-3 gap-gutter overflow-x-auto no-scrollbar pb-4 -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0">
            {tickets.length === 0 ? (
              <div className="col-span-3 text-center py-12 glass-card rounded-xl">
                <Ticket className="mx-auto text-on-surface-variant mb-3 opacity-50" size={48} />
                <p className="text-on-surface-variant">No tienes entradas activas</p>
              </div>
            ) : (
              tickets.map((tkt) => (
                <div
                  key={tkt.id}
                  className="flex-shrink-0 w-72 md:w-full glass-card rounded-xl overflow-hidden flex flex-col group hover:border-primary/30 transition-all duration-300"
                >
                  <div className={`h-2 ${tkt.isLive ? "bg-gradient-to-r from-primary to-tertiary" : "bg-white/5"}`}></div>
                  <div className="p-gutter space-y-4">
                    <div className="flex justify-between items-center text-xs font-label-bold text-on-surface-variant">
                      <span>{tkt.fecha}</span>
                      {tkt.isLive ? (
                        <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white active-pulse"></span> LIVE
                        </span>
                      ) : (
                        <span className="text-primary">{tkt.fase}</span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden">
                            <img className="w-full h-full object-cover" alt={tkt.equipoLocal} src={tkt.flagLocal} />
                          </div>
                          <span className="font-label-bold">{tkt.equipoLocal}</span>
                        </div>
                        <span className="font-data-mono text-primary">
                          {tkt.golesLocal !== null ? tkt.golesLocal : "-"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden">
                            <img className="w-full h-full object-cover" alt={tkt.equipoVisita} src={tkt.flagVisita} />
                          </div>
                          <span className="font-label-bold">{tkt.equipoVisita}</span>
                        </div>
                        <span className="font-data-mono text-primary">
                          {tkt.golesVisita !== null ? tkt.golesVisita : "-"}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-3 space-y-2">
                      <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                        <MapPin size={14} />
                        <span className="truncate">{tkt.estadio}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-on-surface-variant">
                          Sector: <span className="text-on-surface font-label-bold">{tkt.sector} • Fila {tkt.fila}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenQR(tkt)}
                      className="w-full bg-primary-container text-on-primary-container h-touch-target rounded-lg font-label-bold flex items-center justify-center gap-2 hover:bg-primary-container/80 transition-colors group-hover:scale-[1.02] active:scale-95 duration-150"
                    >
                      <QrCode size={18} />
                      Ver QR
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Live Stadium Feed Placeholder */}
      <section className="glass-card rounded-2xl overflow-hidden p-0 relative h-48 md:h-64 flex flex-col justify-end group border border-white/5 hover:border-white/10 transition-colors">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt="Estadio Azteca"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7YcSSt8K08-4kbwB8BXQFTWQzoXVVO99dyzxHImjFm9pNij7HCQRII72HR0qdp2WQtMDblo1wKdZJC87eb3nmi9pcWmEDf3hziKF1BWVk1-S10eKt01SpfmIC1uQTI5qTzzUwVjhwD2Adn-lWMf3MJ1-Flo7fEjGmHOS21UNmCuQCaxcTEG-nGK8co6In_DAhVkZJqMBEi1JDiNOVf7zmBuCP_CLViKLW72IHtdWp_aiqSaX4C_wQvQNR8OEan6zB66Hy4GPg0nt0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent"></div>
        </div>
        <div className="relative z-10 p-gutter flex items-center justify-between">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-white">Explora el Estadio Azteca</h3>
            <p className="text-sm text-on-surface-variant">Guía de acceso, servicios y mapa interactivo</p>
          </div>
          <button className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-full text-white hover:bg-white/20 transition-all active:scale-90 duration-150">
            <Compass size={24} />
          </button>
        </div>
      </section>

      {/* MODAL: QR DINÁMICO */}
      {activeQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm glass-card rounded-2xl p-6 text-center space-y-6 border border-white/10 animate-in zoom-in-95 duration-200">
            {/* Cerrar */}
            <button
              onClick={handleCloseQR}
              className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <h3 className="font-headline-sm text-lg text-white">Entrada Digital</h3>
              <p className="text-xs text-on-surface-variant">{activeQR.equipoLocal} vs {activeQR.equipoVisita}</p>
            </div>

            {/* Código QR Dinámico Visual */}
            <div className="relative bg-white p-6 rounded-xl inline-block mx-auto shadow-2xl stadium-shadow group overflow-hidden">
              {/* Línea Láser Animada de Escaneo */}
              <div className="absolute left-0 right-0 h-0.5 bg-tertiary shadow-[0_0_10px_#4ce346] active-pulse pointer-events-none" style={{
                top: "15%",
                animation: "scan 3s ease-in-out infinite"
              }}></div>

              {/* Estructura del QR simulada */}
              <div className="w-48 h-48 flex items-center justify-center border-4 border-dashed border-slate-200 p-2">
                <QrCode size={144} className="text-slate-900 stroke-[1.25px]" />
              </div>
            </div>

            <style>{`
              @keyframes scan {
                0%, 100% { top: 15%; opacity: 0.8; }
                50% { top: 85%; opacity: 1; }
              }
            `}</style>

            <div className="space-y-3">
              <div className="bg-surface/50 rounded-lg p-3 text-sm text-left inline-block w-full">
                <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                  <span>ESTADIO</span>
                  <span>UBICACIÓN</span>
                </div>
                <div className="flex justify-between font-semibold text-white">
                  <span className="truncate max-w-[150px]">{activeQR.estadio.split(",")[0]}</span>
                  <span>Sec {activeQR.sector} • Fila {activeQR.fila}</span>
                </div>
              </div>

              {/* Countdown Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-label-bold text-on-surface-variant px-1">
                  <span>Código de Seguridad Dinámico</span>
                  <span className="text-tertiary font-mono">{countdown}s</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-tertiary h-full rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(countdown / 30) * 100}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-on-surface-variant">El código QR cambia constantemente para evitar falsificaciones</p>
              </div>
            </div>

            <button
              onClick={handleCloseQR}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-label-bold py-3 rounded-lg active:scale-95 transition-transform"
            >
              Listo
            </button>
          </div>
        </div>
      )}

      {/* MODAL: TRANSFERIR ENTRADA */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md glass-card rounded-2xl p-6 border border-white/10 animate-in zoom-in-95 duration-200">
            {/* Cerrar */}
            <button
              onClick={() => setTransferModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <h3 className="font-headline-sm text-lg text-white mb-4 flex items-center gap-2">
              <Send size={20} className="text-tertiary" />
              Transferir Entrada
            </h3>

            {transferSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-tertiary/20 text-tertiary rounded-full flex items-center justify-center mx-auto">
                  <Check size={36} />
                </div>
                <p className="text-lg font-semibold text-white">{transferSuccess}</p>
                <p className="text-sm text-on-surface-variant">Notificando al destinatario...</p>
              </div>
            ) : (
              <form onSubmit={handleTransfer} className="space-y-4">
                {error && (
                  <div className="bg-error-container/20 border border-error-container text-error rounded-lg p-3 text-xs flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-label-bold text-on-surface-variant mb-2">
                    SELECCIONAR ENTRADA
                  </label>
                  <select
                    value={selectedTicketId}
                    onChange={(e) => setSelectedTicketId(e.target.value)}
                    required
                    className="w-full bg-surface-container-highest border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary"
                  >
                    {tickets.map((tkt) => (
                      <option key={tkt.id} value={tkt.id}>
                        {tkt.equipoLocal} vs {tkt.equipoVisita} - {tkt.estadio.split(",")[0]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-label-bold text-on-surface-variant mb-2">
                    EMAIL DEL DESTINATARIO
                  </label>
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="amigo@correo.com"
                    className="w-full bg-surface-container-highest border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary placeholder:text-on-surface-variant/40"
                  />
                </div>

                <div className="bg-primary-container/10 border border-primary-container/20 rounded-lg p-3 text-[11px] text-on-surface-variant leading-relaxed">
                  ⚠️ <strong>Importante:</strong> Al transferir la entrada, el destinatario recibirá un código único para reclamarla. Perderás el acceso a esta entrada permanentemente una vez que sea aceptada.
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTransferModalOpen(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-label-bold py-3 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={transferring || tickets.length === 0}
                    className="flex-1 bg-tertiary text-on-primary font-label-bold py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {transferring && <Loader2 className="animate-spin" size={16} />}
                    {transferring ? "Enviando..." : "Confirmar"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
