import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Settings, 
  X, 
  DollarSign, 
  Loader2, 
  AlertCircle, 
  Check,
  Plus
} from "lucide-react";
import { estadioService } from "../services/estadioService";

export default function AdminEstadios() {
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados para modal
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [loadingSectors, setLoadingSectors] = useState(false);
  const [sectorsError, setSectorsError] = useState("");
  
  // Estado de edición de precios
  const [editedPrices, setEditedPrices] = useState({}); // { [sectorId]: price }
  const [savingSectors, setSavingSectors] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  const loadStadiums = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await estadioService.getAll();
      
      // Mapeamos imágenes y etiquetas premium que no vienen de la BD para que coincida con el diseño
      const mappedStadiums = data.map(stadium => {
        let imageUrl = "";
        let badge = "";
        let badgeType = ""; // 'active', 'final', 'none'
        
        const name = stadium.nombre.toLowerCase();
        if (name.includes("azteca")) {
          imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDbrB4zfVLd6b69SxWhHCO70R1YZc-kdVtt-Ww4Y28e64_q_p8IQGjs6zTeYJ4RANgMoZwpuhUw_U2WXnGPdT__PxDkbxIlIMQcS2r8fwppODzmcK2iAGAPS8Asy4VoqoTb1_-7vAlPSGIKaiuDk53XgU4yi_uqjlWAXiujcZgss45tQ9FM-O2na7wALkXG-FAhMitvy5oO0vAoSZp7Hpkl6nPnMuBa3zNVpVwRUDW6JU95JbNwmBY0tdwwRMriFdDH0l3obTzGPewo";
          badge = "Activo";
          badgeType = "active";
        } else if (name.includes("metlife")) {
          imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCjnoWfZH3ePz8MiK5pCRSQDmhaGdd4hGhwuzeOkrgb4PK1KSFawpdNgzaMKpWoqiCzfhohUFd9MfTUues0dcc7n4M4NcCD_pXdT--VZP0YCIU6pejbubj0i1xpca8BqFJoXgJ1D2crwWVBJXEZBLT-Ebqw64EQiJNFur8xkwtSYjCvidWMk64tc-BvsHTFfvPFAXuzCjBwsY4K23qfqvhNIXfcOHXYHqjB9Coc0Otf6bZjIFL3N01Gp_AMkf90rzM1GAnO-qjXoXHI";
          badge = "Sede Final";
          badgeType = "final";
        } else {
          imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuAg0YTPgF2uffCpA4GaRvYotBvem-xIL5w6kb9d9YcFGLpgQUZifh2EMoeBbs3s6Zs6dcHNiLmTaRfVJZ9FriQFglTzuYFfKn8cBtbmFcHmqGjLpuXqthGGVsr5VJz0O3wnv_wZWv9xCG9W77DD63VrF18Z0TVbhY-zfYCFYZKZ05U_0cKDtLqqCjryTSDNG98SCplMh_Dc5y4K01WsO1aRelgwDuN-Vz51c581A-h15-SKgFa7wyc87nl25N-dijGoUUz3IqmX95pu";
          badge = "95% Ready";
          badgeType = "ready";
        }
        
        return {
          ...stadium,
          imageUrl,
          badge,
          badgeType
        };
      });

      setStadiums(mappedStadiums);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el listado de estadios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStadiums();
  }, []);

  const handleOpenSectors = async (stadium) => {
    setSelectedStadium(stadium);
    setSectorsError("");
    setSaveSuccess("");
    setEditedPrices({});
    
    try {
      setLoadingSectors(true);
      const data = await estadioService.getSectores(stadium.idEstadio);
      setSectors(data);
      
      // Inicializar el estado de precios editados
      const initialPrices = {};
      data.forEach(sec => {
        initialPrices[sec.idSector] = sec.precioBase;
      });
      setEditedPrices(initialPrices);
      
    } catch (err) {
      console.error(err);
      setSectorsError("Error al cargar los sectores del estadio seleccionado.");
    } finally {
      setLoadingSectors(false);
    }
  };

  const handlePriceChange = (sectorId, val) => {
    setEditedPrices(prev => ({
      ...prev,
      [sectorId]: val
    }));
  };

  const handleSavePrices = async () => {
    if (!selectedStadium) return;
    
    try {
      setSavingSectors(true);
      setSectorsError("");
      setSaveSuccess("");
      
      // Realizar peticiones en paralelo para actualizar cada sector editado
      const promises = Object.keys(editedPrices).map(sectorId => {
        const originalSector = sectors.find(s => s.idSector === sectorId);
        if (originalSector && originalSector.precioBase !== Number(editedPrices[sectorId])) {
          return estadioService.updateSectorPrecio(
            selectedStadium.idEstadio, 
            sectorId, 
            editedPrices[sectorId]
          );
        }
        return Promise.resolve();
      });
      
      await Promise.all(promises);
      
      setSaveSuccess("¡Configuración de sectores actualizada con éxito!");
      
      // Recargar sectores para reflejar datos actualizados
      const updatedSectors = await estadioService.getSectores(selectedStadium.idEstadio);
      setSectors(updatedSectors);
      
      setTimeout(() => {
        setSaveSuccess("");
        setSelectedStadium(null); // Cerrar modal después de un momento
      }, 1500);

    } catch (err) {
  console.error(err);

  setSectorsError(
    err?.message ||
    "Ocurrió un error al guardar los cambios en los sectores."
  );
} finally {
      setSavingSectors(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-on-surface">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-on-surface-variant font-label-bold">Cargando gestión de sedes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-stack-md animate-in fade-in duration-500">
      
      {/* Header */}
      <section className="pt-6">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">
            Gestión de Sedes
          </h1>
          <p className="text-on-surface-variant font-body-md">
            Administra estadios y configura parámetros de sectores para el torneo.
          </p>
        </div>
      </section>

      {error && (
        <div className="bg-error-container/20 border border-error-container text-error rounded-xl p-4 flex items-center gap-3 max-w-lg mx-auto">
          <AlertCircle size={24} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Stadium Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-12">
        {stadiums.map((stadium, index) => {
          // El tercer estadio se expande en pantallas medianas/grandes para dar efecto bento grid
          const isLarge = index === 2 || stadium.nombre.toLowerCase().includes("mercedes");
          
          return (
            <div 
              key={stadium.idEstadio}
              onClick={() => handleOpenSectors(stadium)}
              className={`relative group cursor-pointer overflow-hidden rounded-xl bg-surface-container-low border border-white/10 h-80 transition-all duration-300 active:scale-98 shadow-sm hover:border-primary/30 ${
                isLarge ? "md:col-span-2" : ""
              }`}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${stadium.imageUrl}')` }}
              ></div>
              
              {/* Dark Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-surface-dim/95 via-surface-dim/20 to-transparent"></div>
              
              {/* Top Badge (Active/Sede Final) */}
              {stadium.badge && (
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-label-bold uppercase tracking-wider ${
                    stadium.badgeType === "active" 
                      ? "bg-tertiary text-on-tertiary animate-pulse" 
                      : stadium.badgeType === "final"
                        ? "bg-primary text-on-primary font-bold"
                        : "bg-surface-container-highest text-tertiary"
                  }`}>
                    {stadium.badge}
                  </span>
                </div>
              )}

              {/* Bottom Details */}
              <div className="absolute bottom-0 left-0 w-full p-6 text-left">
                <div className="flex flex-col gap-1">
                  <h2 className="font-display-lg-mobile text-2xl text-white font-extrabold flex items-center gap-2">
                    {stadium.nombre}
                    <Settings size={18} className="text-white/40 group-hover:text-primary transition-colors group-hover:rotate-45" />
                  </h2>
                  <div className="flex items-center gap-1.5 text-on-surface-variant text-sm">
                    <MapPin size={14} className="text-primary" />
                    <span>{stadium.localidad}, {stadium.paisDir || "USA"}</span>
                  </div>
                  
                  <div className="flex items-center gap-6 mt-4 border-t border-white/5 pt-3">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-outline">Capacidad Total</span>
                      <span className="font-data-mono text-sm font-bold text-white mt-0.5">
                        {new Intl.NumberFormat("es-ES").format(stadium.aforo)}
                      </span>
                    </div>
                    <div className="flex flex-col border-l border-white/10 pl-5">
                      <span className="text-[9px] uppercase tracking-wider text-outline">
                        {stadium.badgeType === "ready" ? "Estado Prep" : "Sectores"}
                      </span>
                      <span className={`font-data-mono text-sm font-bold mt-0.5 ${
                        stadium.badgeType === "ready" ? "text-tertiary" : "text-white"
                      }`}>
                        {stadium.badgeType === "ready" ? "95% Ready" : "12 Zonas"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Floating Action Button (Optional Visual Polish) */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-tertiary text-primary-container rounded-full shadow-[0_8px_24px_rgba(76,227,70,0.3)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40">
        <Plus size={28} />
      </button>

      {/* Sector Details Modal */}
      {selectedStadium && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => !savingSectors && setSelectedStadium(null)}></div>
          
          <div className="relative w-full max-w-2xl bg-surface-container-high rounded-t-3xl md:rounded-xl shadow-2xl overflow-hidden border-t md:border border-white/10 flex flex-col z-10 max-h-[85vh] animate-in slide-in-from-bottom md:zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="text-left">
                <h3 className="font-headline-sm text-lg text-primary font-bold">
                  Sectores: {selectedStadium.nombre}
                </h3>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                  Configuración de Precios y Aforo del Sede
                </p>
              </div>
              <button 
                onClick={() => !savingSectors && setSelectedStadium(null)}
                disabled={savingSectors}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/5 active:scale-90 transition-transform"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 max-h-[50vh]">
              {loadingSectors && (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="animate-spin text-primary" size={32} />
                </div>
              )}

              {sectorsError && (
                <div className="bg-error-container/20 border border-error-container text-error rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle size={20} />
                  <p className="text-sm font-semibold">{sectorsError}</p>
                </div>
              )}

              {saveSuccess && (
                <div className="bg-tertiary-container/20 border border-tertiary-container text-tertiary rounded-xl p-4 flex items-center gap-3">
                  <Check size={20} />
                  <p className="text-sm font-semibold">{saveSuccess}</p>
                </div>
              )}

              {!loadingSectors && !sectorsError && sectors.map((sec) => (
                <div 
                  key={sec.idSector}
                  className={`glass-card p-4 rounded-xl flex items-center justify-between group hover:border-tertiary/40 border border-white/5 transition-all duration-300 ${
                    sec.isVIP ? "border-2 border-primary" : ""
                  }`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center ${
                      sec.isVIP ? "bg-primary text-on-primary" : "bg-primary-container text-primary"
                    }`}>
                      <span className="text-[9px] uppercase font-bold opacity-60">Sect</span>
                      <span className="font-headline-sm font-extrabold text-lg">{sec.idSector}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-bold text-sm font-semibold text-on-surface">{sec.nombre}</span>
                      <span className="text-on-surface-variant font-data-mono text-xs mt-0.5">
                        Capacidad: {new Intl.NumberFormat("es-ES").format(sec.capacidad)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {sec.isVIP && (
                      <div className="bg-primary/20 px-2.5 py-1 rounded text-[9px] text-primary font-bold uppercase tracking-wider">
                        VIP
                      </div>
                    )}
                    <div className="text-right flex items-center gap-2">
                      <div className="relative rounded-lg bg-surface-container border border-white/10 flex items-center px-3 py-1.5 focus-within:border-tertiary transition-colors w-32">
                        <span className="text-xs text-on-surface-variant mr-1">$</span>
                        <input 
                          type="number"
                          value={editedPrices[sec.idSector] !== undefined ? editedPrices[sec.idSector] : sec.precioBase}
                          onChange={(e) => handlePriceChange(sec.idSector, e.target.value)}
                          disabled={savingSectors}
                          className="w-full bg-transparent border-none text-right font-data-mono font-bold text-sm p-0 focus:outline-none focus:ring-0 text-white"
                        />
                        <span className="text-[10px] text-outline ml-1 font-bold">USD</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-surface-container-highest flex gap-4 border-t border-white/5">
              <button 
                onClick={() => setSelectedStadium(null)}
                disabled={savingSectors}
                className="flex-1 min-h-[52px] border border-white/20 text-white hover:bg-white/5 font-label-bold text-sm rounded-lg uppercase tracking-wide transition-all active:scale-95 disabled:opacity-50"
              >
                Cerrar
              </button>
              <button 
                onClick={handleSavePrices}
                disabled={savingSectors || loadingSectors || sectorsError}
                className="flex-[2] min-h-[52px] bg-tertiary text-primary-container font-label-bold text-sm font-bold rounded-lg uppercase tracking-wide shadow-lg shadow-tertiary/20 transition-all hover:brightness-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingSectors && <Loader2 className="animate-spin" size={16} />}
                {savingSectors ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}