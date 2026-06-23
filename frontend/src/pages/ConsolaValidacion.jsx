import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  LogOut, 
  Loader2, 
  QrCode, 
  Keyboard 
} from "lucide-react";
import { authService } from "../services/authService";
import { validationService } from "../services/validationService";

export default function ConsolaValidacion() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  
  // Cargar estadísticas iniciales del oficial
  const [stats, setStats] = useState(() => {
    return validationService.getOfficialStats(user?.email);
  });
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState(null); // 'success', 'error', 'warning', 'validating'
  const [overlayData, setOverlayData] = useState({ title: "", message: "", details: "" });
  const [manualCode, setManualCode] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const progressPercentage = Math.round((stats.validados / stats.total) * 100);
  const isTurnoFinalizable = progressPercentage >= 100;

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const triggerValidation = async (typeOrCode) => {
    // Si ya hay una validación en curso, ignoramos
    if (activeOverlay === "validating") return;

    // Vibrar dispositivo (simulación háptica)
    if ("vibrate" in navigator) {
      if (typeOrCode === "success") navigator.vibrate(50);
      else if (typeOrCode === "error") navigator.vibrate([100, 50, 100]);
      else if (typeOrCode === "warning") navigator.vibrate(200);
      else navigator.vibrate(80);
    }

    setActiveOverlay("validating");

    // Realizar validación asíncrona mediante el servicio
    try {
      const response = await validationService.validateTicketQR(typeOrCode);
      
      setOverlayData({
        title: response.title,
        message: response.message,
        details: response.details
      });
      setActiveOverlay(response.status);

      // Si la validación fue exitosa, incrementamos el contador
      if (response.status === "success") {
        const updatedStats = validationService.incrementValidatedCount();
        setStats(updatedStats);
      }

      // Cerrar el overlay después de 2.5 segundos
      setTimeout(() => {
        setActiveOverlay(null);
      }, 2500);

    } catch (err) {
      setOverlayData({
        title: "ERROR",
        message: "FALLO DE CONEXIÓN",
        details: err.message || "Error de red"
      });
      setActiveOverlay("error");
      setTimeout(() => {
        setActiveOverlay(null);
      }, 2500);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    triggerValidation(manualCode.trim());
    setManualCode("");
    setShowManualInput(false);
  };

  const handleFinalizarTurno = () => {
    if (!isTurnoFinalizable) return;
    alert("Turno finalizado con éxito. Sincronizando registros con FIFA Cloud...");
    validationService.resetStats();
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-on-surface font-body-md select-none overflow-hidden relative">
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/95 backdrop-blur-md text-primary shadow-sm flex items-center justify-between px-margin-mobile h-touch-target bg-surface-container-low border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* Avatar con Dropdown de Logout */}
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
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-surface-container-high border border-white/10 py-1 z-20 animate-in fade-in slide-in-from-top-1 duration-100">
                  <div className="px-4 py-2 border-b border-white/5">
                    <p className="text-xs text-on-surface-variant">Sesión iniciada como</p>
                    <p className="text-sm font-semibold truncate text-primary">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-error hover:bg-white/5 flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={16} />
                    Cerrar Sesión
                  </button>
                </div>
              </>
            )}
          </div>
          
          <div className="flex flex-col text-left">
            <span className="font-label-bold text-[11px] leading-tight text-on-surface-variant">{stats.legajo}</span>
            <span className="font-headline-sm text-[15px] leading-tight text-white font-semibold">{stats.nombre}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="font-data-mono text-[9px] text-tertiary uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-tertiary rounded-full pulse-live"></span> EN VIVO
            </span>
            <span className="font-data-mono text-[11px] text-on-surface-variant">{stats.puerta}</span>
          </div>
          <button className="text-on-surface-variant hover:text-white transition-colors">
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area (Camera Scanner Simulator) */}
      <main className="flex-1 mt-[48px] mb-[180px] relative overflow-hidden bg-black flex flex-col">
        {/* Virtual Viewfinder */}
        <div className="relative flex-1 w-full h-full flex flex-col justify-between">
          
          {/* Simulated Camera Feed Background */}
          <div className="absolute inset-0 z-0">
            <div 
              className="w-full h-full bg-cover bg-center opacity-65"
              style={{ 
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBambLcNxgfPaaXAAfBOwyaYn-0cXgiux4-HKWgYgEnHEtZ4K4PJ6QStcd0B4iAKVF9XGw8Xs5L_MJrmTzFXlFmCg0AmfAY8FYkUITyspaUBUNJ4UY0Q1UKgmlB2jTT47jYXwz_6mDlAO8LlAeFwHud67d69sQNWiwdZghRWq-mMg2cTW1d-4jaTgHQ_ePBByM7aoSRgqYqAdDGNhx801eNSvqOTiXrp6EZ8T7u-M1RBwWUIXzTmPsvpQgBDRV4l5TkJFLM7KY5Az-g')`
              }}
            ></div>
            <div className="absolute inset-0 scanner-overlay"></div>
          </div>

          {/* Viewfinder Brackets */}
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 relative">
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
              
              {/* Scan Laser Line */}
              <div className="absolute inset-x-0 h-0.5 bg-tertiary shadow-[0_0_12px_#4ce346] scan-line" style={{
                position: "absolute",
                animation: "scan-animation 3s linear infinite"
              }}></div>
            </div>
          </div>

          <style>{`
            @keyframes scan-animation {
              0% { top: 0%; }
              50% { top: 100%; }
              100% { top: 0%; }
            }
            .pulse-live {
              animation: pulse-live-anim 1.5s infinite;
            }
            @keyframes pulse-live-anim {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.2); opacity: 0.4; }
            }
          `}</style>

          {/* Top Instruction Banner */}
          <div className="relative z-10 w-full text-center pt-6 px-4">
            <span className="bg-black/60 backdrop-blur-md border border-white/5 text-xs text-on-surface px-4 py-2 rounded-full inline-flex items-center gap-1.5">
              <QrCode size={14} className="text-primary animate-pulse" />
              Alinea el código QR dentro del visor
            </span>
          </div>

          {/* Manual Input Trigger Form */}
          {showManualInput ? (
            <div className="relative z-20 mx-margin-mobile p-4 bg-surface/90 border border-white/10 rounded-xl mb-6 shadow-2xl animate-in slide-in-from-bottom-2">
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-primary">Ingreso Manual de Entrada</span>
                  <button 
                    type="button" 
                    onClick={() => setShowManualInput(false)}
                    className="text-on-surface-variant hover:text-white"
                  >
                    Cancelar
                  </button>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Código de ticket (ej: error, warning, ok)"
                    className="flex-1 bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                    autoFocus
                  />
                  <button 
                    type="submit"
                    className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
                  >
                    Validar
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Simulation & Option Buttons */
            <div className="relative z-20 inset-x-0 pb-6 px-margin-mobile flex justify-center gap-3 flex-wrap">
              <button 
                onClick={() => triggerValidation("success")}
                className="h-12 px-5 bg-surface/85 backdrop-blur-md border border-white/10 rounded-full font-label-bold text-xs text-emerald-400 hover:text-emerald-300 hover:bg-surface active:scale-95 transition-all flex items-center gap-1"
              >
                <CheckCircle size={14} /> Sim. OK
              </button>
              <button 
                onClick={() => triggerValidation("error")}
                className="h-12 px-5 bg-surface/85 backdrop-blur-md border border-white/10 rounded-full font-label-bold text-xs text-error hover:text-red-400 hover:bg-surface active:scale-95 transition-all flex items-center gap-1"
              >
                <XCircle size={14} /> Sim. Fallo
              </button>
              <button 
                onClick={() => triggerValidation("warning")}
                className="h-12 px-5 bg-surface/85 backdrop-blur-md border border-white/10 rounded-full font-label-bold text-xs text-amber-400 hover:text-amber-300 hover:bg-surface active:scale-95 transition-all flex items-center gap-1"
              >
                <AlertTriangle size={14} /> Sim. Sector
              </button>
              <button 
                onClick={() => setShowManualInput(true)}
                className="h-12 w-12 bg-surface/85 backdrop-blur-md border border-white/10 rounded-full text-primary hover:text-white hover:bg-surface active:scale-95 transition-all flex items-center justify-center"
                title="Ingresar código manual"
              >
                <Keyboard size={18} />
              </button>
            </div>
          )}
        </div>

        {/* --- VALIDATING STATE SCREEN OVERLAY --- */}
        {activeOverlay === "validating" && (
          <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md text-white p-10 text-center animate-in fade-in duration-100">
            <Loader2 className="animate-spin text-primary mb-4" size={48} />
            <h2 className="font-label-bold text-base tracking-widest text-primary uppercase">Consultando Ticket...</h2>
            <p className="text-xs text-on-surface-variant mt-2 font-mono">FIFA Secure Network</p>
          </div>
        )}

        {/* --- STATUS SCREEN OVERLAYS (check, error, warning) --- */}
        {activeOverlay === "success" && (
          <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-tertiary-container text-on-tertiary-container p-10 text-center animate-in zoom-in-95 duration-200">
            <CheckCircle size={120} className="mb-6 fill-tertiary stroke-on-tertiary-container" />
            <h2 className="font-display-lg-mobile text-display-lg-mobile uppercase mb-2 leading-none">{overlayData.title}</h2>
            <p className="font-headline-sm text-headline-sm tracking-wider">{overlayData.message}</p>
            <p className="mt-8 font-data-mono bg-white/10 px-4 py-2.5 rounded-lg border border-white/10 text-sm">
              {overlayData.details}
            </p>
          </div>
        )}

        {activeOverlay === "error" && (
          <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-error-container text-on-error-container p-10 text-center animate-in zoom-in-95 duration-200">
            <XCircle size={120} className="mb-6 fill-error stroke-on-error-container" />
            <h2 className="font-display-lg-mobile text-display-lg-mobile uppercase mb-2 leading-none">{overlayData.title}</h2>
            <p className="font-headline-sm text-headline-sm tracking-wider">{overlayData.message}</p>
            <p className="mt-8 font-data-mono bg-white/10 px-4 py-2.5 rounded-lg border border-white/10 text-sm">
              {overlayData.details}
            </p>
          </div>
        )}

        {activeOverlay === "warning" && (
          <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-amber-500 text-black p-10 text-center animate-in zoom-in-95 duration-200">
            <AlertTriangle size={120} className="mb-6 fill-black stroke-amber-500" />
            <h2 className="font-display-lg-mobile text-display-lg-mobile uppercase mb-2 leading-none text-black">{overlayData.title}</h2>
            <p className="font-headline-sm text-headline-sm tracking-wider text-black">{overlayData.message}</p>
            <p className="mt-8 font-data-mono bg-black/10 px-4 py-2.5 rounded-lg border border-black/15 text-sm font-bold">
              {overlayData.details}
            </p>
          </div>
        )}
      </main>

      {/* Validation Dashboard Panel */}
      <div className="fixed bottom-0 w-full z-40 bg-surface/95 backdrop-blur-xl border-t border-white/10 rounded-t-[32px] p-margin-mobile flex flex-col gap-6 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        
        {/* Progress Info */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-end">
            <div className="text-left">
              <h3 className="font-label-bold text-on-surface-variant uppercase tracking-widest text-[10px]">
                Asignación Actual
              </h3>
              <p className="font-headline-sm text-sm md:text-base text-on-surface font-bold">
                {stats.sectoresAsignados}
              </p>
            </div>
            <div className="text-right">
              <span className="font-display-lg-mobile text-[24px] text-tertiary font-extrabold">
                {progressPercentage}%
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-4 bg-surface-container-highest rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-tertiary progress-glow rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-[11px] font-data-mono text-on-surface-variant">
            <span>{stats.validados.toLocaleString()} VALIDADOS</span>
            <span>{stats.total.toLocaleString()} TOTAL</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={handleFinalizarTurno}
            disabled={!isTurnoFinalizable}
            id="finish-btn"
            className={`w-full h-[64px] rounded-xl font-label-bold text-sm tracking-wide flex items-center justify-center gap-3 transition-all duration-300 ${
              isTurnoFinalizable
                ? "bg-tertiary text-on-primary font-bold shadow-lg shadow-tertiary/20 active:scale-95 cursor-pointer"
                : "bg-white/5 border border-white/10 text-on-surface opacity-40 cursor-not-allowed"
            }`}
          >
            <LogOut size={18} />
            FINALIZAR TURNO
            {isTurnoFinalizable && <span className="ml-1">→</span>}
          </button>
          <p className="text-center text-[10px] text-on-surface-variant/60 font-medium">
            Completa el 100% de tus sectores para finalizar turno.
          </p>
        </div>
      </div>
    </div>
  );
}
