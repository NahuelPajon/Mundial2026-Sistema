import React, { useState, useEffect, useCallback } from "react";
import { Ticket, QrCode, MapPin, Loader2, AlertCircle, X, Copy, Check } from "lucide-react";
import { ticketService } from "../services/ticketService";

export default function Entradas() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeQR, setActiveQR] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [copied, setCopied] = useState(false);

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

  const refreshQR = useCallback(async (ticketId) => {
    const qrInfo = await ticketService.generateDynamicQR(ticketId);
    setQrCodeData(qrInfo.qrCode);
    setCountdown(qrInfo.expiresIn ?? 30);
    return qrInfo;
  }, []);

  useEffect(() => {
    let timer;
    if (activeQR) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            refreshQR(activeQR.id).catch(() => {});
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeQR, refreshQR]);

  const handleOpenQR = async (tkt) => {
    setActiveQR(tkt);
    setCopied(false);
    try {
      await refreshQR(tkt.id);
    } catch (err) {
      setError(err.message || "No se pudo generar el QR.");
      setActiveQR(null);
    }
  };

  const handleCopyToken = async () => {
    if (!qrCodeData) return;
    try {
      await navigator.clipboard.writeText(qrCodeData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const maxCountdown = 30;

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
                        Sector: <span className="font-semibold text-white">{tkt.sector}</span> • Fila:{" "}
                        <span className="font-semibold text-white">{tkt.fila}</span>
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

      {activeQR && qrCodeData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm glass-card rounded-2xl p-6 text-center space-y-6 border border-white/10 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setActiveQR(null);
                setQrCodeData(null);
              }}
              className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <h3 className="font-headline-sm text-lg text-white">Entrada Digital</h3>
              <p className="text-xs text-on-surface-variant">
                {activeQR.equipoLocal} vs {activeQR.equipoVisita}
              </p>
            </div>

            <div className="relative bg-white p-4 rounded-xl inline-block mx-auto shadow-2xl stadium-shadow overflow-hidden">
              <img
                src={ticketService.getQrImageUrl(qrCodeData, 192)}
                alt="Código QR dinámico"
                className="w-48 h-48 object-contain"
              />
            </div>

            <div className="bg-surface/50 rounded-lg p-3 text-sm text-left inline-block w-full">
              <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                <span>ESTADIO</span>
                <span>UBICACIÓN</span>
              </div>
              <div className="flex justify-between font-semibold text-white">
                <span className="truncate max-w-[150px]">{activeQR.estadio.split(",")[0]}</span>
                <span>
                  Sec {activeQR.sector} • Fila {activeQR.fila}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-surface/50 rounded-lg px-3 py-2">
                <code className="text-[10px] text-on-surface-variant truncate flex-1 text-left">
                  {qrCodeData.slice(0, 24)}…
                </code>
                <button
                  onClick={handleCopyToken}
                  className="text-primary hover:text-white transition-colors p-1"
                  title="Copiar token para prueba manual"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>

              <div className="flex justify-between text-xs font-label-bold text-on-surface-variant px-1">
                <span>Código de Seguridad Dinámico</span>
                <span className="text-tertiary font-mono">{countdown}s</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-tertiary h-full rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / maxCountdown) * 100}%` }}
                ></div>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveQR(null);
                setQrCodeData(null);
              }}
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
