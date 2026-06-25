import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Ticket, ShoppingCart, User, Bell, LogOut, Store, Check, X, Loader2 } from "lucide-react";
import { authService } from "../../services/authService";
import { apiFetch } from "../../services/api";

export default function UserLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [transferencias, setTransferencias] = useState([]);
  const [notifEnviadas, setNotifEnviadas] = useState([]); // transferencias enviadas respondidas
  const [procesando, setProcesando] = useState(null); // id de la transferencia en proceso
  const notifRef = useRef(null);

  const user = authService.getCurrentUser();
  const displayName = user && user.email
    ? user.email.split("@")[0].split(".")[0].charAt(0).toUpperCase() + user.email.split("@")[0].split(".")[0].slice(1)
    : "Aficionado";

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  // Cargar transferencias pendientes recibidas
  const cargarTransferencias = async () => {
    try {
      const [recibidas, enviadas] = await Promise.all([
        apiFetch("/transferencias?tipo=recibidas"),
        apiFetch("/transferencias?tipo=enviadas"),
      ]);
      setTransferencias(recibidas.filter((t) => t.estado?.toLowerCase() === "pendiente"));
      // Notificar al remitente sobre respuestas que aún no vio
      const respondidas = enviadas.filter((t) =>
        ["aceptada", "rechazada"].includes(t.estado?.toLowerCase())
      );
      // Filtrar las que el usuario ya descartó (guardadas en localStorage)
      const descartadas = JSON.parse(localStorage.getItem("notifs_descartadas") || "[]");
      const nuevas = respondidas.filter((t) => !descartadas.includes(t.idTransferencia));
      setNotifEnviadas(nuevas);
    } catch {
      // silencioso
    }
  };

  useEffect(() => {
    cargarTransferencias();
    // Polling cada 30 segundos para detectar nuevas transferencias
    const interval = setInterval(cargarTransferencias, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cerrar panel de notificaciones al hacer click afuera
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleAceptar = async (idTransferencia) => {
    try {
      setProcesando(idTransferencia);
      await apiFetch(`/transferencias/${idTransferencia}/aceptar`, { method: "POST" });
      setTransferencias((prev) => prev.filter((t) => t.idTransferencia !== idTransferencia));
      // Avisar al Dashboard que recargue sus tickets
      window.dispatchEvent(new CustomEvent("tickets-actualizados"));
    } catch (err) {
      alert(err.message || "Error al aceptar la transferencia.");
    } finally {
      setProcesando(null);
    }
  };

  const handleRechazar = async (idTransferencia) => {
    try {
      setProcesando(idTransferencia);
      await apiFetch(`/transferencias/${idTransferencia}/rechazar`, { method: "POST" });
      setTransferencias((prev) => prev.filter((t) => t.idTransferencia !== idTransferencia));
    } catch (err) {
      alert(err.message || "Error al rechazar la transferencia.");
    } finally {
      setProcesando(null);
    }
  };

  const navItems = [
    { path: "/dashboard", label: "Inicio", icon: LayoutDashboard },
    { path: "/entradas", label: "Entradas", icon: Ticket },
    { path: "/comprar", label: "Comprar", icon: Store },
    { path: "/compras", label: "Historial", icon: ShoppingCart },
    { path: "/perfil", label: "Perfil", icon: User },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md pb-32">
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md text-primary shadow-sm bg-surface-container-low border-b border-white/10 flex items-center justify-between px-margin-mobile h-touch-target">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="font-display-lg-mobile text-display-lg-mobile text-primary tracking-tighter hover:opacity-90">
            FIFA
          </Link>
        </div>

        <div className="flex items-center gap-4 relative">
          {/* ── Campanita ── */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors active:scale-95 duration-150 text-on-surface-variant hover:text-on-surface relative"
            >
              <Bell size={20} />
              {(transferencias.length > 0 || notifEnviadas.length > 0) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </button>

            {/* Panel de notificaciones */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-lg bg-surface-container-high border border-white/10 z-30 animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-semibold text-on-surface">Notificaciones</p>
                </div>

                {transferencias.length === 0 && notifEnviadas.length === 0 ? (
                  <div className="px-4 py-8 text-center text-on-surface-variant text-sm">
                    No tenés notificaciones pendientes.
                  </div>
                ) : (
                  <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
                    {/* Notificaciones de respuesta a transferencias enviadas */}
                    {notifEnviadas.map((t) => (
                      <div key={`env-${t.idTransferencia}`} className="px-4 py-3 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs text-on-surface-variant leading-relaxed">
                            {t.estado?.toLowerCase() === "aceptada" ? (
                              <>
                                <span className="font-semibold text-green-400">{t.emailDestino}</span>
                                {" aceptó tu transferencia ✓"}
                              </>
                            ) : (
                              <>
                                <span className="font-semibold text-error">{t.emailDestino}</span>
                                {" rechazó tu transferencia"}
                              </>
                            )}
                          </p>
                          <button
                            onClick={() => {
                              const descartadas = JSON.parse(localStorage.getItem("notifs_descartadas") || "[]");
                              localStorage.setItem("notifs_descartadas", JSON.stringify([...descartadas, t.idTransferencia]));
                              setNotifEnviadas((prev) => prev.filter((n) => n.idTransferencia !== t.idTransferencia));
                            }}
                            className="text-on-surface-variant hover:text-on-surface shrink-0"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-on-surface">
                          {t.equipoLocalNombre} vs {t.equipoVisitanteNombre}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {t.estadioNombre} · Sector {t.codigoSector}
                        </p>
                      </div>
                    ))}
                    {/* Transferencias pendientes de aceptar/rechazar */}
                    {transferencias.map((t) => (
                      <div key={t.idTransferencia} className="px-4 py-3 space-y-2">
                        <p className="text-xs text-on-surface-variant">
                          <span className="font-semibold text-primary">{t.emailOrigen}</span> quiere transferirte una entrada
                        </p>
                        <p className="text-sm font-semibold text-on-surface">
                          {t.equipoLocalNombre} vs {t.equipoVisitanteNombre}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {t.estadioNombre} · Sector {t.codigoSector}
                        </p>

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleAceptar(t.idTransferencia)}
                            disabled={procesando === t.idTransferencia}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                          >
                            {procesando === t.idTransferencia ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Check size={12} />
                            )}
                            Aceptar
                          </button>
                          <button
                            onClick={() => handleRechazar(t.idTransferencia)}
                            disabled={procesando === t.idTransferencia}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white/10 text-on-surface rounded-lg text-xs font-bold hover:bg-white/15 active:scale-95 transition-all disabled:opacity-50"
                          >
                            <X size={12} />
                            Rechazar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Avatar con Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-8 h-8 rounded-full overflow-hidden border border-primary/20 focus:outline-none hover:border-primary/50 transition-colors"
            >
              <img
                className="w-full h-full object-cover"
                alt="Avatar"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyFOusqJE6a4mqMxgVwLH2-KdXq27ipQZCVfisEwf8ERybxAHzMib_D8yEva6s04ANYlkwor4zY64qA90lPgIT4PsUmOPaX_j-ypgZ91kTEthyeIz5KD8_c-1HNh0iHJOUN61M_sfAoWSNud-QGxJ8kekJ8ZFq3u2ZOEqT_f-7uWVqjIOY0vKVjM04b0ETr2nPtEl3wDqyB-yBb5TX3nUTYluDeC39GkTEOPeugRczBQ5OQXMKJWkOY6n-f6AjB3Gt7hn9NB6fAREx"
              />
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-surface-container-high border border-white/10 py-1 z-20 animate-in fade-in slide-in-from-top-1 duration-100">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-margin-mobile max-w-5xl mx-auto space-y-stack-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full z-50 rounded-t-xl bg-surface/90 backdrop-blur-lg shadow-[0_-4px_12px_rgba(0,0,0,0.3)] bg-surface-container-highest border-t border-white/5 flex justify-around items-center h-20 pb-safe px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
                isActive
                  ? "bg-tertiary-container text-on-tertiary-container rounded-full px-4 py-1.5 font-bold"
                  : "text-on-surface-variant hover:text-on-surface px-4 py-1.5"
              }`}
            >
              <Icon size={20} className={isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"} />
              <span className="font-label-bold text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}