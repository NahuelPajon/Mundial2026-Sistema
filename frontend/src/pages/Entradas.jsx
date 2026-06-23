import React, { useState, useEffect } from "react";
import { Ticket, QrCode, MapPin, Loader2, AlertCircle, X } from "lucide-react";
import { ticketService } from "../services/ticketService";

export default function Entradas() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeQR, setActiveQR] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [countdown, setCountdown] = useState(30);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await ticketService.getActiveTickets();
      setTickets(data);
    } catch (err) {
      setError(err.message || "Error al cargar tus entradas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    let timer;
    if (activeQR) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            refreshQR(activeQR.id);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeQR]);

  const handleOpenQR = async (tkt) => {
    setActiveQR(tkt);
    setCountdown(30);
    try {
      const qrInfo = await ticketService.generateDynamicQR(tkt.id);
      setQrCodeData(qrInfo.qrCode);
    } catch {
      setQrCodeData(`FIFA-2026-${tkt.id}-${Math.floor(Date.now() / 1000)}`);
    }
  };

  const refreshQR = async (ticketId) => {
    try {
      const qrInfo = await ticketService.generateDynamicQR(ticketId);
      setQrCodeData(qrInfo.qrCode);
    } catch {
      setQrCodeData(`FIFA-2026-${ticketId}-${Math.floor(Date.now() / 1000)}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface">Mis Entradas</h1>
        <p className="text-sm text-on-surface-variant">Presenta tus códigos QR en las puertas de acceso de los estadios</p>
      </div>

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

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {tickets.length === 0 ? (
            <div className="col-span-2 text-center py-12 glass-card rounded-xl">
              <Ticket className="mx-auto text-on-surface-variant mb-3 opacity-50" size={48} />
              <p className="text-on-surface-variant">Aún no has adquirido entradas</p>
            </div>
          ) : (
            tickets.map((tkt) => (
              <div 
                key={tkt.id}
                className="glass-card rounded-xl overflow-hidden flex flex-col group border border-white/5 hover:border-primary/20 transition-all duration-300"
              >
                <div className={`h-1.5 ${tkt.isLive ? "bg-gradient-to-r from-primary to-tertiary" : "bg-white/10"}`}></div>
                <div className="p-5 flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">{tkt.fecha}</span>
                      {tkt.isLive && (
                        <span className="bg-error-container text-on-error-container text-[10px] px-2 py-0.5 rounded-full font-bold">
                          LIVE
                        </span>
                      )}
                    </div>

                    <div className="text-base font-bold text-white">
                      {tkt.equipoLocal} vs {tkt.equipoVisita}
                    </div>

                    <div className="space-y-1 text-sm text-on-surface-variant">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="flex-shrink-0" />
                        <span className="truncate">{tkt.estadio}</span>
                      </div>
                      <p>
                        Sector: <span className="font-semibold text-white">{tkt.sector}</span> • Fila: <span className="font-semibold text-white">{tkt.fila}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center md:border-l border-white/5 md:pl-5">
                    <button 
                      onClick={() => handleOpenQR(tkt)}
                      className="bg-primary-container text-on-primary-container hover:bg-primary-container/80 transition-colors p-4 rounded-xl flex flex-col items-center gap-2 w-full md:w-24 text-center"
                    >
                      <QrCode size={28} />
                      <span className="text-xs font-bold">Ver QR</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* QR Code Modal */}
      {activeQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm glass-card rounded-2xl p-6 text-center space-y-6 border border-white/10 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setActiveQR(null)}
              className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <h3 className="font-headline-sm text-lg text-white">Entrada Digital</h3>
              <p className="text-xs text-on-surface-variant">{activeQR.equipoLocal} vs {activeQR.equipoVisita}</p>
            </div>

            <div className="relative bg-white p-6 rounded-xl inline-block mx-auto shadow-2xl stadium-shadow overflow-hidden">
              <div className="absolute left-0 right-0 h-0.5 bg-tertiary shadow-[0_0_10px_#4ce346] active-pulse pointer-events-none" style={{
                top: "15%",
                animation: "scan 3s ease-in-out infinite"
              }}></div>
              <div className="w-48 h-48 flex items-center justify-center border-4 border-dashed border-slate-200 p-2">
                <QrCode size={144} className="text-slate-900 stroke-[1.25px]" />
              </div>
            </div>

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
            </div>

            <button 
              onClick={() => setActiveQR(null)}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-label-bold py-3 rounded-lg transition-transform"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
