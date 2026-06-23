import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  LogOut, 
  Loader2,
  Lock
} from "lucide-react";
import { validacionService } from "../services/validacionService";
import { authService } from "../services/authService";

export default function ValidadorConsole() {
  const navigate = useNavigate();
  
  // Estados para estadísticas del turno
  const [valizados, setValizados] = useState(1240);
  const [total, setTotal] = useState(2800);
  const [progreso, setProgreso] = useState(45); // Empieza en 45%
  const [sectores, setSectores] = useState("Sectores A, B");
  const [loading, setLoading] = useState(false);

  // Estados para controlar overlays de escaneo
  const [activeOverlay, setActiveOverlay] = useState(null); // 'success', 'error', 'warning'
  const [overlayData, setOverlayData] = useState(null);

  const user = authService.getCurrentUser();
  const oficialName = user && user.email ? user.email.split("@")[0] : "Oficial";
  
  // Cargar estadísticas iniciales
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await validacionService.getProgresoTurno();
        setValizados(stats.valizados || 1240);
        setTotal(stats.total || 2800);
        setSectores(stats.sectoresAsignados || "Sectores A, B");
        
        // Calcular porcentaje inicial
        const pct = Math.round(((stats.valizados || 1240) / (stats.total || 2800)) * 100);
        setProgreso(pct);
      } catch (e) {
        console.error("Error al obtener stats del turno:", e);
      }
    };
    fetchStats();
  }, []);

  const triggerScanResult = async (type) => {
    if (activeOverlay) return; // Evitar clicks dobles mientras hay overlay

    // Haptic feedback simulado
    if ("vibrate" in navigator) {
      if (type === "success") navigator.vibrate(50);
      if (type === "error") navigator.vibrate([100, 50, 100]);
      if (type === "warning") navigator.vibrate(200);
    }

    if (type === "success") {
      setActiveOverlay("success");
      setOverlayData({
        titulo: "VALIDADO",
        mensaje: "ACCESO PERMITIDO",
        ubicacion: "SECTOR A - FILA 12 - ASIENTO 44"
      });
      
      // Incrementar contador y progreso
      setValizados(prev => {
        const nextValizados = prev + 1;
        const nextPct = Math.min(100, Math.round((nextValizados / total) * 100));
        setProgreso(nextPct);
        return nextValizados;
      });

    } else if (type === "error") {
      setActiveOverlay("error");
      setOverlayData({
        titulo: "ERROR",
        mensaje: "TICKET YA CONSUMIDO",
        ubicacion: `ID: ${Math.floor(100 + Math.random() * 900)}-001-FF2 | 14:02 PM`
      });
    } else if (type === "warning") {
      setActiveOverlay("warning");
      setOverlayData({
        titulo: "INCORRECTO",
        mensaje: "SECTOR EQUIVOCADO",
        ubicacion: "DIRIGIR A: PUERTA 12 (NORTE)"
      });
    }

    // Ocultar overlay después de 2 segundos
    setTimeout(() => {
      setActiveOverlay(null);
      setOverlayData(null);
    }, 2000);
  };

  const handleFinishShift = async () => {
    if (progreso < 100) return;

    try {
      setLoading(true);
      await validacionService.finalizarTurno();
      authService.logout();
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-on-surface font-body-md relative overflow-hidden select-none">
      
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md text-primary shadow-sm flex items-center justify-between px-margin-mobile h-touch-target bg-surface-container-low border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container border border-primary/20 flex items-center justify-center overflow-hidden">
            <img 
              className="w-full h-full object-cover" 
              alt="Oficial" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1S0nrZcuLKPeIx30phhW3MJlJlATFwJS45DmrxpIpTUseGhGcPwx3IskVd7ehxgLm9kzIkwNdOysxXD8v2muLVNskEN1GFsY7PthySf1_mv64oDbDgaUit0T3niQFDyIB_YsSb_CIsbdxbJPdOio43wAZArla-Ud1M_FrYW5G1UrDAZ-LidXeeJVGnPcm-S9H8dLMHM9QBTCJOrdkifK1DlODp3lUtRiFM9tEq6u7xI3rF8ndPulWmyYeEwMBrn87NOjg1lAVnSTD"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-label-bold text-[10px] leading-tight text-on-surface-variant uppercase tracking-wider">OFICIAL #2841</span>
            <span className="font-headline-sm text-sm leading-tight text-white capitalize">{oficialName}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="font-data-mono text-[9px] text-tertiary uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-tertiary rounded-full pulse-live"></span> EN VIVO
            </span>
            <span className="font-data-mono text-[10px] text-on-surface-variant font-medium">GATE 4-B | DEV_X9</span>
          </div>
          <button className="p-1.5 hover:bg-white/5 rounded-full text-on-surface-variant">
            <Bell size={18} />
          </button>
        </div>
      </header>

      {/* Viewport / Cam Feed simulation */}
      <main className="flex-1 mt-[48px] mb-[180px] relative overflow-hidden flex flex-col justify-between">
        
        {/* simulated camera feed background */}
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center opacity-65"
            style={{ 
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBambLcNxgfPaaXAAfBOwyaYn-0cXgiux4-HKWgYgEnHEtZ4K4PJ6QStcd0B4iAKVF9XGw8Xs5L_MJrmTzFXlFmCg0AmfAY8FYkUITyspaUBUNJ4UY0Q1UKgmlB2jTT47jYXwz_6mDlAO8LlAeFwHud67d69sQNWiwdZghRWq-mMg2cTW1d-4jaTgHQ_ePBByM7aoSRgqYqAdDGNhx801eNSvqOTiXrp6EZ8T7u-M1RBwWUIXzTmPsvpQgBDRV4l5TkJFLM7KY5Az-g')" 
            }}
          ></div>
          <div className="absolute inset-0 scanner-overlay"></div>
        </div>

        {/* Viewfinder Target Brackets */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 relative">
            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
            
            {/* moving scanner line */}
            <div className="absolute left-0 right-0 h-0.5 bg-tertiary shadow-[0_0_12px_#4ce346] scan-line pointer-events-none"></div>
          </div>
        </div>

        {/* Action simulations */}
        <div className="absolute inset-x-0 bottom-4 z-20 px-margin-mobile flex justify-center gap-3">
          <button 
            onClick={() => triggerScanResult("success")}
            className="flex-1 h-12 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 rounded-full font-label-bold text-emerald-400 text-xs shadow-lg active:scale-95 transition-all"
          >
            Simular OK
          </button>
          <button 
            onClick={() => triggerScanResult("error")}
            className="flex-1 h-12 bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-full font-label-bold text-red-400 text-xs shadow-lg active:scale-95 transition-all"
          >
            Simular Fallo
          </button>
          <button 
            onClick={() => triggerScanResult("warning")}
            className="flex-1 h-12 bg-amber-500/10 backdrop-blur-md border border-amber-500/30 rounded-full font-label-bold text-amber-400 text-xs shadow-lg active:scale-95 transition-all"
          >
            Simular Sector
          </button>
        </div>
      </main>

      {/* Floating Dashboard Panel (Bottom) */}
      <div className="fixed bottom-0 w-full z-40 bg-surface/95 backdrop-blur-xl border-t border-white/10 rounded-t-[32px] p-5 flex flex-col gap-5 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        
        {/* Shift progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="font-label-bold text-on-surface-variant uppercase tracking-widest text-[9px]">Asignación Actual</h3>
              <p className="text-sm font-bold text-white mt-0.5">{sectores}</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-tertiary">{progreso}%</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-tertiary progress-glow rounded-full transition-all duration-500"
              style={{ width: `${progreso}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-[9px] font-data-mono text-on-surface-variant">
            <span>{valizados.toLocaleString()} VALIDADOS</span>
            <span>{total.toLocaleString()} TOTAL</span>
          </div>
        </div>

        {/* Shift completion button */}
        <div className="space-y-2">
          <button 
            onClick={handleFinishShift}
            disabled={progreso < 100 || loading}
            className={`w-full h-12 rounded-xl font-label-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
              progreso >= 100 
                ? "bg-tertiary text-on-tertiary shadow-lg shadow-tertiary/20 cursor-pointer" 
                : "bg-white/5 border border-white/10 text-on-surface-variant/40 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : progreso >= 100 ? (
              <LogOut size={16} />
            ) : (
              <Lock size={16} className="opacity-50" />
            )}
            FINALIZAR TURNO
            {progreso >= 100 && <span className="ml-1">→</span>}
          </button>
          <p className="text-center text-[9px] text-on-surface-variant/50 font-medium">
            Completa el 100% de tus sectores para finalizar turno y sincronizar datos.
          </p>
        </div>
      </div>

      {/* FULLSCREEN SCANNING OVERLAYS */}
      {activeOverlay === "success" && overlayData && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-tertiary-container/95 text-on-tertiary-container p-10 text-center animate-in fade-in zoom-in-95 duration-150">
          <CheckCircle2 size={96} className="mb-4 text-tertiary fill-tertiary/10" />
          <h2 className="font-display-lg-mobile text-3xl uppercase font-extrabold mb-1 tracking-tighter text-white">{overlayData.titulo}</h2>
          <p className="font-headline-sm text-sm font-semibold text-tertiary">{overlayData.mensaje}</p>
          <p className="mt-8 font-data-mono bg-white/10 border border-white/5 px-4 py-2 rounded-lg text-xs font-bold text-white">
            {overlayData.ubicacion}
          </p>
        </div>
      )}

      {activeOverlay === "error" && overlayData && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-error-container/95 text-on-error-container p-10 text-center animate-in fade-in zoom-in-95 duration-150">
          <XCircle size={96} className="mb-4 text-error fill-error/10" />
          <h2 className="font-display-lg-mobile text-3xl uppercase font-extrabold mb-1 tracking-tighter text-white">{overlayData.titulo}</h2>
          <p className="font-headline-sm text-sm font-semibold text-error">{overlayData.mensaje}</p>
          <p className="mt-8 font-data-mono bg-white/10 border border-white/5 px-4 py-2 rounded-lg text-xs font-bold text-white">
            {overlayData.ubicacion}
          </p>
        </div>
      )}

      {activeOverlay === "warning" && overlayData && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-yellow-500 text-black p-10 text-center animate-in fade-in zoom-in-95 duration-150">
          <AlertTriangle size={96} className="mb-4 fill-black/10" />
          <h2 className="font-display-lg-mobile text-3xl uppercase font-extrabold mb-1 tracking-tighter">{overlayData.titulo}</h2>
          <p className="font-headline-sm text-sm font-bold">{overlayData.mensaje}</p>
          <p className="mt-8 font-data-mono bg-black/10 px-4 py-2 rounded-lg text-xs font-bold">
            {overlayData.ubicacion}
          </p>
        </div>
      )}

      <style>{`
        .scanner-overlay {
          background: linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.5) 100%);
        }
        .scan-line {
          animation: scanLineAnim 3s linear infinite;
        }
        @keyframes scanLineAnim {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .pulse-live {
          animation: pulseGreenAnim 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulseGreenAnim {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
