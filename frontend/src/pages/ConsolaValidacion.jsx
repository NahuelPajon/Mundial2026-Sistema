import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  LogOut,
  Loader2,
  QrCode,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { authService } from "../services/authService";
import { validationService } from "../services/validationService";
import QrCameraScanner from "../components/QrCameraScanner";

const EMPTY_STATS = {
  legajo: "—",
  nombre: "Cargando…",
  dispositivo: "—",
  dispositivoId: null,
  validados: 0,
  total: 10,
};

export default function ConsolaValidacion() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const [stats, setStats] = useState(EMPTY_STATS);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [showDropdown, setShowDropdown] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState(null);
  const [overlayData, setOverlayData] = useState({
    title: "",
    message: "",
    details: "",
  });
  const [manualCode, setManualCode] = useState("");

  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      setStatsError("");
      const data = await validationService.fetchOfficialStats(user?.email);
      setStats(data);
    } catch (err) {
      setStatsError(err.message || "No se pudieron cargar las estadísticas.");
    } finally {
      setLoadingStats(false);
    }
  }, [user?.email]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const progressPercentage = Math.min(
    100,
    Math.round((stats.validados / stats.total) * 100),
  );

  const isScanningPaused = activeOverlay !== null;

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const triggerValidation = useCallback(
    async (qrCode) => {
      if (activeOverlay === "validating" || !qrCode?.trim()) return;

      if (!stats.dispositivoId) {
        setOverlayData({
          title: "ERROR",
          message: "SIN DISPOSITIVO",
          details: "No tenés un escáner autorizado asignado",
        });
        setActiveOverlay("error");
        setTimeout(() => setActiveOverlay(null), 2500);
        return;
      }

      if ("vibrate" in navigator) navigator.vibrate(80);
      setActiveOverlay("validating");

      try {
        const response = await validationService.validateTicketQR(
          qrCode,
          stats.dispositivoId,
        );

        setOverlayData({
          title: response.title,
          message: response.message,
          details: response.details,
        });
        setActiveOverlay(response.status);

        if (response.status === "success") {
          await loadStats();
        }

        setTimeout(() => setActiveOverlay(null), 2500);
      } catch (err) {
        setOverlayData({
          title: "ERROR",
          message: "FALLO DE CONEXIÓN",
          details: err.message || "Error de red",
        });
        setActiveOverlay("error");
        setTimeout(() => setActiveOverlay(null), 2500);
      }
    },
    [activeOverlay, stats.dispositivoId, loadStats],
  );

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    triggerValidation(manualCode.trim());
    setManualCode("");
  };

  const handleCameraScan = useCallback(
    (decodedText) => {
      triggerValidation(decodedText);
    },
    [triggerValidation],
  );

  const handleFinalizarTurno = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-on-surface font-body-md select-none overflow-hidden relative">
      <header className="fixed top-0 w-full z-50 bg-surface/95 backdrop-blur-md text-primary shadow-sm flex items-center justify-between px-margin-mobile h-touch-target bg-surface-container-low border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 rounded-full bg-primary-container border border-primary/20 flex items-center justify-center overflow-hidden focus:outline-none hover:border-primary/50"
            >
              <img
                className="w-full h-full object-cover"
                alt="Oficial"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1S0nrZcuLKPeIx30phhW3MJlJlATFwJS45DmrxpIpTUseGhGcPwx3IskVd7ehxgLm9kzIkwNdOysxXD8v2muLVNskEN1GFsY7PthySf1_mv64oDbDgaUit0T3niQFDyIB_YsSb_CIsbdxbJPdOio43wAZArla-Ud1M_FrYW5G1UrDAZ-LidXeeJVGnPcm-S9H8dLMHM9QBTCJOrdkifK1DlODp3lUtRiFM9tEq6u7xI3rF8ndPulWmyYeEwMBrn87NOjg1lAVnSTD"
              />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                ></div>
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-surface-container-high border border-white/10 py-1 z-20">
                  <div className="px-4 py-2 border-b border-white/5">
                    <p className="text-xs text-on-surface-variant">
                      Sesión iniciada como
                    </p>
                    <p className="text-sm font-semibold truncate text-primary">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-error hover:bg-white/5 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Cerrar Sesión
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col text-left">
            <span className="font-label-bold text-[11px] leading-tight text-on-surface-variant">
              {stats.legajo}
            </span>
            <span className="font-headline-sm text-[15px] leading-tight text-white font-semibold">
              {stats.nombre}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end max-w-[140px]">
            <span className="font-data-mono text-[9px] text-tertiary uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-tertiary rounded-full pulse-live"></span>{" "}
              EN VIVO
            </span>
            <span className="font-data-mono text-[10px] text-on-surface-variant truncate w-full text-right">
              {stats.dispositivo}
            </span>
          </div>
          <button
            onClick={loadStats}
            disabled={loadingStats}
            className="text-on-surface-variant hover:text-white transition-colors disabled:opacity-50"
            title="Actualizar estadísticas"
          >
            <RefreshCw
              size={18}
              className={loadingStats ? "animate-spin" : ""}
            />
          </button>
          <button className="text-on-surface-variant hover:text-white transition-colors">
            <Bell size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 mt-[48px] mb-[280px] relative overflow-hidden bg-black flex flex-col">
        <div className="relative flex-1 w-full min-h-[320px]">
          <QrCameraScanner
            onScan={handleCameraScan}
            paused={isScanningPaused}
          />

          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 relative">
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
              {!isScanningPaused && (
                <div
                  className="absolute inset-x-0 h-0.5 bg-tertiary shadow-[0_0_12px_#4ce346]"
                  style={{
                    animation: "scan-animation 3s linear infinite",
                    top: "50%",
                  }}
                ></div>
              )}
            </div>
          </div>

          <style>{`
            @keyframes scan-animation {
              0% { top: 10%; }
              50% { top: 90%; }
              100% { top: 10%; }
            }
            .pulse-live { animation: pulse-live-anim 1.5s infinite; }
            @keyframes pulse-live-anim {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.2); opacity: 0.4; }
            }
          `}</style>

          <div className="relative z-10 w-full text-center pt-4 px-4 space-y-2">
            <span className="bg-black/60 backdrop-blur-md border border-white/5 text-xs text-on-surface px-4 py-2 rounded-full inline-flex items-center gap-1.5">
              <QrCode size={14} className="text-primary animate-pulse" />
              Apuntá la cámara al código QR del titular
            </span>
            {statsError && (
              <p className="text-xs text-error bg-error-container/20 px-3 py-1 rounded-full inline-block">
                {statsError}
              </p>
            )}
          </div>
        </div>

        <div className="relative z-20 mx-margin-mobile p-4 bg-surface/95 border border-white/10 rounded-xl shadow-2xl">
          <form onSubmit={handleManualSubmit} className="space-y-2">
            <label className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Smartphone size={14} />
              Token manual (si no se puede leer el QR)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Pegá o escribí el token hex del QR"
                className="flex-1 bg-surface-container border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary font-mono"
              />
              <button
                type="submit"
                disabled={!manualCode.trim() || isScanningPaused}
                className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
              >
                Validar
              </button>
            </div>
          </form>
        </div>

        {activeOverlay === "validating" && (
          <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md text-white p-10 text-center">
            <Loader2 className="animate-spin text-primary mb-4" size={48} />
            <h2 className="font-label-bold text-base tracking-widest text-primary uppercase">
              Consultando Ticket...
            </h2>
          </div>
        )}

        {activeOverlay === "success" && (
          <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-tertiary-container text-on-tertiary-container p-10 text-center">
            <CheckCircle
              size={120}
              className="mb-6 fill-tertiary stroke-on-tertiary-container"
            />
            <h2 className="font-display-lg-mobile uppercase mb-2">
              {overlayData.title}
            </h2>
            <p className="font-headline-sm tracking-wider">
              {overlayData.message}
            </p>
            <p className="mt-8 font-data-mono bg-white/10 px-4 py-2.5 rounded-lg text-sm">
              {overlayData.details}
            </p>
          </div>
        )}

        {activeOverlay === "error" && (
          <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-error-container text-on-error-container p-10 text-center">
            <XCircle
              size={120}
              className="mb-6 fill-error stroke-on-error-container"
            />
            <h2 className="font-display-lg-mobile uppercase mb-2">
              {overlayData.title}
            </h2>
            <p className="font-headline-sm tracking-wider">
              {overlayData.message}
            </p>
            <p className="mt-8 font-data-mono bg-white/10 px-4 py-2.5 rounded-lg text-sm">
              {overlayData.details}
            </p>
          </div>
        )}

        {activeOverlay === "warning" && (
          <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-amber-500 text-black p-10 text-center">
            <AlertTriangle
              size={120}
              className="mb-6 fill-black stroke-amber-500"
            />
            <h2 className="font-display-lg-mobile uppercase mb-2 text-black">
              {overlayData.title}
            </h2>
            <p className="font-headline-sm tracking-wider text-black">
              {overlayData.message}
            </p>
            <p className="mt-8 font-data-mono bg-black/10 px-4 py-2.5 rounded-lg text-sm font-bold">
              {overlayData.details}
            </p>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 w-full z-40 bg-surface/95 backdrop-blur-xl border-t border-white/10 rounded-t-[32px] p-margin-mobile flex flex-col gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-start gap-3 bg-surface-container/50 rounded-xl p-3 border border-white/5">
          <Smartphone size={18} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-left min-w-0">
            <p className="font-label-bold text-on-surface-variant uppercase tracking-widest text-[10px]">
              Dispositivo asignado
            </p>
            <p className="font-headline-sm text-sm text-on-surface font-bold truncate">
              {stats.dispositivo}
            </p>
            {stats.dispositivoId && (
              <p className="text-[10px] font-mono text-on-surface-variant mt-0.5">
                ID #{stats.dispositivoId}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <span className="font-label-bold text-on-surface-variant uppercase tracking-widest text-[10px]">
              Validaciones realizadas
            </span>
          </div>
          <div className="flex justify-between text-[11px] font-data-mono text-on-surface-variant">
            <span>{stats.validados.toLocaleString()} VALIDADOS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
