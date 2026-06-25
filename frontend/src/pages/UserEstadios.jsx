import React, { useState, useEffect } from "react";
import {
  MapPin,
  X,
  Loader2,
  AlertCircle,
  Users,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { estadioService } from "../services/estadioService";

// Imágenes por nombre de estadio (mismo criterio que AdminEstadios)
const getStadiumImage = (nombre) => {
  const n = (nombre || "").toLowerCase();
  if (n.includes("azteca"))
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuDbrB4zfVLd6b69SxWhHCO70R1YZc-kdVtt-Ww4Y28e64_q_p8IQGjs6zTeYJ4RANgMoZwpuhUw_U2WXnGPdT__PxDkbxIlIMQcS2r8fwppODzmcK2iAGAPS8Asy4VoqoTb1_-7vAlPSGIKaiuDk53XgU4yi_uqjlWAXiujcZgss45tQ9FM-O2na7wALkXG-FAhMitvy5oO0vAoSZp7Hpkl6nPnMuBa3zNVpVwRUDW6JU95JbNwmBY0tdwwRMriFdDH0l3obTzGPewo";
  if (n.includes("metlife"))
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuCjnoWfZH3ePz8MiK5pCRSQDmhaGdd4hGhwuzeOkrgb4PK1KSFawpdNgzaMKpWoqiCzfhohUFd9MfTUues0dcc7n4M4NcCD_pXdT--VZP0YCIU6pejbubj0i1xpca8BqFJoXgJ1D2crwWVBJXEZBLT-Ebqw64EQiJNFur8xkwtSYjCvidWMk64tc-BvsHTFfvPFAXuzCjBwsY4K23qfqvhNIXfcOHXYHqjB9Coc0Otf6bZjIFL3N01Gp_AMkf90rzM1GAnO-qjXoXHI";
  return "https://lh3.googleusercontent.com/aida-public/AB6AXuAg0YTPgF2uffCpA4GaRvYotBvem-xIL5w6kb9d9YcFGLpgQUZifh2EMoeBbs3s6Zs6dcHNiLmTaRfVJZ9FriQFglTzuYFfKn8cBtbmFcHmqGjLpuXqthGGVsr5VJz0O3wnv_wZWv9xCG9W77DD63VrF18Z0TVbhY-zfYCFYZKZ05U_0cKDtLqqCjryTSDNG98SCplMh_Dc5y4K01WsO1aRelgwDuN-Vz51c581A-h15-SKgFa7wyc87nl25N-dijGoUUz3IqmX95pu";
};

const getBadge = (nombre) => {
  const n = (nombre || "").toLowerCase();
  if (n.includes("azteca")) return { label: "Activo", type: "active" };
  if (n.includes("metlife")) return { label: "Sede Final", type: "final" };
  return { label: "95% Ready", type: "ready" };
};

export default function UserEstadios() {
  const navigate = useNavigate();
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedStadium, setSelectedStadium] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [loadingSectors, setLoadingSectors] = useState(false);
  const [sectorsError, setSectorsError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await estadioService.getAll();
        setStadiums(
          data.map((s) => ({
            ...s,
            imageUrl: getStadiumImage(s.nombre),
            ...getBadge(s.nombre),
          }))
        );
      } catch {
        setError("No se pudo cargar el listado de estadios.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleOpenStadium = async (stadium) => {
    setSelectedStadium(stadium);
    setSectorsError("");
    setSectors([]);
    try {
      setLoadingSectors(true);
      const data = await estadioService.getSectores(stadium.idEstadio);
      setSectors(data);
    } catch {
      setSectorsError("No se pudieron cargar los sectores de este estadio.");
    } finally {
      setLoadingSectors(false);
    }
  };

  return (
    <div className="space-y-stack-lg">
      {/* Header */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="space-y-1">
          <p className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-widest">
            Mundial 2026
          </p>
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface">
            Sedes del <span className="text-primary">Torneo</span>
          </h1>
          <p className="text-sm text-on-surface-variant">
            Explorá los estadios sede del Mundial 2026. Tocá uno para ver sectores y precios.
          </p>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="bg-error-container/20 border border-error-container text-error rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin text-primary" size={36} />
        </div>
      )}

      {/* Bento Grid de Estadios */}
      {!loading && !error && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {stadiums.map((stadium, index) => {
            const isLarge = index === 2;
            return (
              <div
                key={stadium.idEstadio}
                onClick={() => handleOpenStadium(stadium)}
                className={`relative group cursor-pointer overflow-hidden rounded-xl bg-surface-container-low border border-white/10 h-72 transition-all duration-300 active:scale-[0.98] shadow-sm hover:border-primary/30 ${
                  isLarge ? "md:col-span-2" : ""
                }`}
              >
                {/* Imagen de fondo */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${stadium.imageUrl}')` }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-dim/95 via-surface-dim/20 to-transparent" />

                {/* Badge */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-label-bold uppercase tracking-wider ${
                      stadium.type === "active"
                        ? "bg-tertiary text-on-tertiary animate-pulse"
                        : stadium.type === "final"
                        ? "bg-primary text-on-primary font-bold"
                        : "bg-surface-container-highest text-tertiary"
                    }`}
                  >
                    {stadium.label}
                  </span>
                </div>

                {/* Info inferior */}
                <div className="absolute bottom-0 left-0 w-full p-6 text-left">
                  <h2 className="font-display-lg-mobile text-2xl text-white font-extrabold">
                    {stadium.nombre}
                  </h2>
                  <div className="flex items-center gap-1.5 text-on-surface-variant text-sm mt-1">
                    <MapPin size={14} className="text-primary" />
                    <span>
                      {stadium.localidad}, {stadium.paisDir || "USA"}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 mt-4 border-t border-white/5 pt-3">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-outline">
                        Capacidad Total
                      </span>
                      <span className="font-data-mono text-sm font-bold text-white mt-0.5">
                        {new Intl.NumberFormat("es-ES").format(stadium.aforo)}
                      </span>
                    </div>
                    <div className="flex flex-col border-l border-white/10 pl-5">
                      <span className="text-[9px] uppercase tracking-wider text-outline">
                        Sectores
                      </span>
                      <span className="font-data-mono text-sm font-bold text-white mt-0.5">
                        A · B · C · D
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* CTA comprar entradas */}
      {!loading && !error && stadiums.length > 0 && (
        <section
          onClick={() => navigate("/comprar")}
          className="glass-card rounded-xl p-5 flex items-center justify-between cursor-pointer hover:border-tertiary/30 transition-all active:scale-[0.99] group"
        >
          <div>
            <p className="font-label-bold text-on-surface">¿Querés asistir?</p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Comprá tus entradas para los partidos del Mundial
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-tertiary-container flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
            <ShoppingCart size={22} />
          </div>
        </section>
      )}

      {/* Modal de Sectores */}
      {selectedStadium && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedStadium(null)}
          />
          <div className="relative w-full max-w-2xl bg-surface-container-high rounded-t-3xl md:rounded-xl shadow-2xl overflow-hidden border-t md:border border-white/10 flex flex-col z-10 max-h-[85vh] animate-in slide-in-from-bottom md:zoom-in-95 duration-200">
            {/* Header del modal */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="text-left">
                <h3 className="font-headline-sm text-lg text-primary font-bold">
                  {selectedStadium.nombre}
                </h3>
                <div className="flex items-center gap-1.5 text-on-surface-variant text-xs mt-0.5">
                  <MapPin size={12} />
                  <span>
                    {selectedStadium.localidad}, {selectedStadium.paisDir || "USA"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedStadium(null)}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/5 active:scale-90 transition-transform"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 overflow-y-auto space-y-3 max-h-[55vh]">
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
              {!loadingSectors &&
                !sectorsError &&
                sectors.map((sec) => (
                  <div
                    key={sec.idSector}
                    className={`glass-card p-4 rounded-xl flex items-center justify-between border transition-all duration-200 ${
                      sec.isVIP
                        ? "border-primary/40 bg-primary/5"
                        : "border-white/5"
                    }`}
                  >
                    {/* Sector badge + nombre */}
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center ${
                          sec.isVIP
                            ? "bg-primary text-on-primary"
                            : "bg-primary-container text-primary"
                        }`}
                      >
                        <span className="text-[9px] uppercase font-bold opacity-60">
                          Sect
                        </span>
                        <span className="font-headline-sm font-extrabold text-lg">
                          {sec.idSector}
                        </span>
                      </div>
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-label-bold text-sm text-on-surface">
                            {sec.nombre}
                          </span>
                          {sec.isVIP && (
                            <span className="bg-primary/20 px-2 py-0.5 rounded text-[9px] text-primary font-bold uppercase tracking-wider">
                              VIP
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-on-surface-variant text-xs mt-0.5">
                          <Users size={11} />
                          <span>
                            Capacidad:{" "}
                            {new Intl.NumberFormat("es-ES").format(
                              sec.capacidad
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Precio (solo lectura) */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-on-surface-variant text-[10px] justify-end mb-0.5">
                        <DollarSign size={10} />
                        <span className="uppercase tracking-wider">
                          Precio base
                        </span>
                      </div>
                      <span className="font-data-mono font-bold text-lg text-tertiary">
                        ${new Intl.NumberFormat("es-ES").format(sec.precioBase)}{" "}
                        <span className="text-xs font-normal text-on-surface-variant">
                          USD
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-5 bg-surface-container-highest border-t border-white/5 flex gap-3">
              <button
                onClick={() => setSelectedStadium(null)}
                className="flex-1 min-h-[48px] border border-white/20 text-white hover:bg-white/5 font-label-bold text-sm rounded-lg transition-all active:scale-95"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setSelectedStadium(null);
                  navigate("/comprar");
                }}
                className="flex-[2] min-h-[48px] bg-tertiary text-primary-container font-label-bold text-sm font-bold rounded-lg shadow-lg shadow-tertiary/20 transition-all hover:brightness-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={16} />
                Comprar Entradas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}