import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  AlertTriangle, 
  PlusCircle, 
  Clock, 
  MapPin, 
  Edit2, 
  Info, 
  RotateCcw,
  Loader2, 
  AlertCircle,
  Check,
  Plus
} from "lucide-react";
import { partidoService } from "../services/partidoService";
import { estadioService } from "../services/estadioService";

export default function AdminPartidos() {
  const [partidos, setPartidos] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [conflictos, setConflictos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Formulario nuevo partido
  const [local, setLocal] = useState("");
  const [visita, setVisita] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [selectedStadium, setSelectedStadium] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Controlar visualización del formulario en celular
  const [showMobileForm, setShowMobileForm] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [partidosData, stadiumsData, conflictosData] = await Promise.all([
        partidoService.getPartidos(),
        estadioService.getAll(),
        partidoService.getConflictos()
      ]);
      setPartidos(partidosData);
      setStadiums(stadiumsData);
      setConflictos(conflictosData);
      if (stadiumsData.length > 0) {
        setSelectedStadium(`${stadiumsData[0].nombre}, ${stadiumsData[0].localidad}`);
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar los datos de partidos y sedes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePartido = async (e) => {
    e.preventDefault();
    if (!local.trim() || !visita.trim() || !fechaHora || !selectedStadium) {
      setError("Todos los campos del formulario de partido son requeridos.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccessMsg("");

      const nuevo = await partidoService.createPartido({
        equipoLocal: local.trim().toUpperCase(),
        equipoVisita: visita.trim().toUpperCase(),
        fechaHora,
        estadio: selectedStadium
      });

      setPartidos(prev => [nuevo, ...prev]);
      setSuccessMsg(`¡Partido ${nuevo.equipoLocal} vs ${nuevo.equipoVisita} programado!`);
      
      // Limpiar campos
      setLocal("");
      setVisita("");
      setFechaHora("");
      setShowMobileForm(false);

      setTimeout(() => {
        setSuccessMsg("");
      }, 2500);

    } catch (err) {
      console.error(err);
      setError("No se pudo programar el encuentro.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSector = async (partidoId, sectorName) => {
    const updatedPartidos = partidos.map(p => {
      if (p.id === partidoId) {
        const existe = p.sectoresHabilitados.includes(sectorName);
        const nuevosSectores = existe
          ? p.sectoresHabilitados.filter(s => s !== sectorName)
          : [...p.sectoresHabilitados, sectorName];
        
        // Llamada silenciosa a la API para persistir
        partidoService.updateSectoresPartido(partidoId, nuevosSectores);

        return {
          ...p,
          sectoresHabilitados: nuevosSectores
        };
      }
      return p;
    });

    setPartidos(updatedPartidos);
  };

  const handleIgnorarConflicto = (partidoId) => {
    // Quitar alerta de conflicto localmente para ese partido
    setPartidos(prev => prev.map(p => {
      if (p.id === partidoId) {
        const { conflicto, ...sinConflicto } = p;
        return sinConflicto;
      }
      return p;
    }));
  };

  const handleDismissConflictoBanner = (conflictoId) => {
    setConflictos(prev => prev.filter(c => c.id !== conflictoId));
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const options = { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" };
    return date.toLocaleDateString("es-ES", options).replace(",", " •");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-on-surface">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-on-surface-variant font-label-bold">Cargando partidos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-stack-md animate-in fade-in duration-500 pb-12 relative text-left">
      
      {/* Header Section */}
      <section className="pt-6">
        <h2 className="font-display-lg-mobile text-display-lg-mobile text-primary font-bold">
          Gestión de Partidos
        </h2>
        <p className="text-on-surface-variant font-body-md mt-2">
          Configura el calendario oficial, estadios y disponibilidad de sectores para el torneo.
        </p>
      </section>

      {/* Conflict Alert Banner (Dynamic) */}
      {conflictos.map((conf) => (
        <div 
          key={conf.id}
          className="glass-card rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 border-l-4 border-error shadow-[0_0_15px_rgba(255,180,171,0.15)] animate-in slide-in-from-top duration-300"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-error text-3xl animate-bounce" size={28} />
            <div className="text-left">
              <h4 className="font-label-bold text-label-bold text-error uppercase tracking-wider">
                {conf.titulo}
              </h4>
              <p className="text-on-surface-variant text-sm mt-0.5">{conf.mensaje}</p>
            </div>
          </div>
          <div className="mt-3 md:mt-0 ml-0 md:ml-auto flex gap-2">
            <button 
              onClick={() => handleDismissConflictoBanner(conf.id)}
              className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg font-label-bold text-xs transition-colors"
            >
              Ignorar
            </button>
            <button 
              onClick={() => {
                setShowMobileForm(true);
                // Enfocar el input de fecha u hora
                document.getElementById("datetime-input")?.focus();
              }}
              className="bg-error-container text-on-error-container px-4 py-2 rounded-lg font-label-bold text-xs hover:brightness-105 active:scale-95 transition-transform"
            >
              Ver Detalles
            </button>
          </div>
        </div>
      ))}

      {error && (
        <div className="bg-error-container/20 border border-error-container text-error rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="bg-tertiary-container/20 border border-tertiary-container text-tertiary rounded-xl p-4 flex items-center gap-3 animate-in fade-in">
          <Check size={20} />
          <p className="text-sm font-semibold">{successMsg}</p>
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        
        {/* New Match Form - Responsive View */}
        <div className={`lg:col-span-4 glass-card rounded-xl p-6 h-fit sticky top-24 ${
          showMobileForm ? "block fixed inset-0 z-50 overflow-y-auto lg:relative lg:block bg-background/95 lg:bg-surface/60" : "hidden lg:block"
        }`}>
          {showMobileForm && (
            <div className="flex justify-end lg:hidden mb-4">
              <button 
                onClick={() => setShowMobileForm(false)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          )}

          <h3 className="font-headline-sm text-headline-sm text-primary mb-6 flex items-center gap-2 font-bold border-b border-white/5 pb-2">
            <PlusCircle className="text-tertiary" size={20} />
            Nuevo Partido
          </h3>

          <form onSubmit={handleCreatePartido} className="space-y-5">
            <div className="space-y-2">
              <label className="font-label-bold text-xs text-on-surface-variant block uppercase tracking-wider">
                Encuentro
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  className="bg-surface-container-highest border border-white/5 rounded-lg p-3 text-on-surface focus:outline-none focus:border-tertiary text-sm placeholder:text-on-surface-variant/40" 
                  placeholder="Local (ej: MEX)" 
                  type="text"
                  required
                />
                <input 
                  value={visita}
                  onChange={(e) => setVisita(e.target.value)}
                  className="bg-surface-container-highest border border-white/5 rounded-lg p-3 text-on-surface focus:outline-none focus:border-tertiary text-sm placeholder:text-on-surface-variant/40" 
                  placeholder="Visitante (ej: ITA)" 
                  type="text"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label-bold text-xs text-on-surface-variant block uppercase tracking-wider">
                Fecha y Hora
              </label>
              <input 
                id="datetime-input"
                value={fechaHora}
                onChange={(e) => setFechaHora(e.target.value)}
                className="w-full bg-surface-container-highest border border-white/5 rounded-lg p-3 text-on-surface focus:outline-none focus:border-tertiary text-sm" 
                type="datetime-local"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-label-bold text-xs text-on-surface-variant block uppercase tracking-wider">
                Sede
              </label>
              <select 
                value={selectedStadium}
                onChange={(e) => setSelectedStadium(e.target.value)}
                className="w-full bg-surface-container-highest border border-white/5 rounded-lg p-3 text-on-surface focus:outline-none focus:border-tertiary text-sm text-white"
                required
              >
                {stadiums.map((st) => (
                  <option key={st.idEstadio} value={`${st.nombre}, ${st.localidad}`}>
                    {st.nombre} ({st.localidad})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-tertiary text-primary-container font-headline-sm text-sm font-bold py-4 rounded-xl shadow-lg hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="animate-spin" size={16} />}
                Programar Encuentro
              </button>
            </div>
          </form>
        </div>

        {/* Scheduled Matches List */}
        <div className="lg:col-span-8 space-y-gutter">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-lg text-primary font-bold">
              Partidos Programados
            </h3>
            <span className="bg-surface-container-high px-3 py-1 rounded-full text-xs font-label-bold text-on-surface-variant">
              Junio 2026
            </span>
          </div>

          <div className="space-y-4">
            {partidos.length === 0 ? (
              <div className="text-center py-12 glass-card rounded-xl">
                <Calendar className="mx-auto text-on-surface-variant mb-3 opacity-50" size={48} />
                <p className="text-on-surface-variant">No hay partidos programados</p>
              </div>
            ) : (
              partidos.map((partido) => {
                const isEnCurso = partido.estado === "EN CURSO";
                const isFinalizado = partido.estado === "FINALIZADO";
                const hasConflicto = !!partido.conflicto;

                return (
                  <div 
                    key={partido.id}
                    className={`glass-card rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden transition-all duration-300 border border-white/5 hover:border-white/10 ${
                      isFinalizado ? "opacity-60 grayscale-[0.3]" : ""
                    } ${
                      hasConflicto ? "border-2 border-error/30 bg-error-container/5" : ""
                    }`}
                  >
                    {/* Status vertical color bar */}
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${
                      isEnCurso 
                        ? "bg-tertiary" 
                        : isFinalizado 
                          ? "bg-outline" 
                          : hasConflicto 
                            ? "bg-error" 
                            : "bg-primary"
                    }`}></div>

                    {/* Match Card Content */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      
                      {/* Left: Teams and Status */}
                      <div className="text-left">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          {isEnCurso ? (
                            <span className="bg-tertiary-container text-on-tertiary-container font-label-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-bold animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                              EN CURSO
                            </span>
                          ) : isFinalizado ? (
                            <span className="bg-surface-container-highest text-outline font-label-bold text-[10px] px-2 py-0.5 rounded font-bold">
                              FINALIZADO
                            </span>
                          ) : (
                            <span className="bg-primary-container text-primary font-label-bold text-[10px] px-2 py-0.5 rounded font-bold">
                              PROGRAMADO
                            </span>
                          )}

                          {isEnCurso && (
                            <span className="text-tertiary font-data-mono text-xs font-semibold">{partido.minuto || "64'"}</span>
                          )}

                          {hasConflicto && (
                            <span className="flex items-center text-error gap-1 font-label-bold text-[10px] font-bold">
                              <AlertCircle size={12} /> CONFLICTO DE HORARIO
                            </span>
                          )}
                        </div>

                        <h4 className="font-display-lg-mobile text-2xl text-white font-extrabold mt-2 tracking-tight">
                          {partido.equipoLocal} vs {partido.equipoVisita}
                        </h4>

                        <p className="text-on-surface-variant flex items-center gap-1 mt-1.5 text-xs">
                          {isEnCurso ? (
                            <>
                              <MapPin size={12} className="text-primary" />
                              <span>{partido.estadio} • {partido.localidad}</span>
                            </>
                          ) : (
                            <>
                              <Clock size={12} className="text-primary" />
                              <span>{formatDate(partido.fechaHora)}</span>
                            </>
                          )}
                        </p>
                      </div>

                      {/* Right: Score or Stadium Details */}
                      <div className="text-right flex flex-col items-end min-w-[120px]">
                        {isEnCurso || isFinalizado ? (
                          <p className="font-display-lg-mobile text-3xl font-extrabold text-white tracking-wider">
                            {partido.golesLocal} - {partido.golesVisita}
                          </p>
                        ) : (
                          <>
                            <p className="font-label-bold text-sm text-on-surface font-semibold">{partido.estadio}</p>
                            <p className="text-xs text-on-surface-variant mt-0.5">{partido.localidad}</p>
                          </>
                        )}
                        {isFinalizado && (
                          <p className="text-[10px] text-on-surface-variant font-bold mt-1 uppercase tracking-wide">
                            {formatDate(partido.fechaHora).split("•")[0]}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Sectors and Actions */}
                    {!isFinalizado && (
                      <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
                        
                        {/* Conflict Detail Box */}
                        {hasConflicto && (
                          <div className="bg-error/10 p-3 rounded-lg flex items-start gap-2.5 text-left border border-error/10">
                            <Info size={16} className="text-error mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-on-surface-variant italic leading-relaxed">
                              {partido.conflicto}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-4 items-center justify-between">
                          
                          {/* Config Sectors Checkboxes */}
                          <div className="flex gap-4 flex-wrap">
                            {["Sector VIP", "General Norte"].map(secName => {
                              const isChecked = partido.sectoresHabilitados.includes(secName);
                              return (
                                <label 
                                  key={secName} 
                                  className={`flex items-center gap-2 cursor-pointer text-xs font-semibold select-none ${
                                    isChecked ? "text-tertiary" : "text-on-surface-variant hover:text-white"
                                  }`}
                                >
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleSector(partido.id, secName)}
                                    className="w-4 h-4 rounded border border-white/10 bg-surface-container-highest text-tertiary focus:ring-0 cursor-pointer"
                                  />
                                  <span>{secName}</span>
                                </label>
                              );
                            })}
                          </div>

                          {/* Quick Actions */}
                          <div className="flex gap-2">
                            {hasConflicto ? (
                              <>
                                <button 
                                  onClick={() => handleIgnorarConflicto(partido.id)}
                                  className="bg-white/5 hover:bg-white/10 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all active:scale-95 border border-white/5"
                                >
                                  Ignorar
                                </button>
                                <button 
                                  onClick={() => {
                                    // Simulación de reprogramar, por ej: cargar los equipos en el form y enfocar fecha
                                    setLocal(partido.equipoLocal);
                                    setVisita(partido.equipoVisita);
                                    setShowMobileForm(true);
                                    document.getElementById("datetime-input")?.focus();
                                  }}
                                  className="bg-error text-on-error text-xs px-3.5 py-1.5 rounded-lg font-bold hover:brightness-105 active:scale-95 transition-transform"
                                >
                                  Reprogramar
                                </button>
                              </>
                            ) : (
                              <button 
                                className="text-primary hover:bg-primary/10 hover:text-white p-2 rounded-lg transition-colors flex items-center justify-center border border-white/5 hover:border-primary/20"
                                title="Editar partido"
                              >
                                <Edit2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Floating Action Button (Mobile Contextual to open programming form) */}
      <button 
        onClick={() => setShowMobileForm(true)}
        className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-tertiary text-primary-container rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-all z-40"
      >
        <Plus size={28} />
      </button>

    </div>
  );
}
