import React, { useState, useEffect } from "react";
import { ShoppingCart, CheckCircle, Clock, XCircle, Calendar, Loader2, AlertCircle, CreditCard, ChevronDown, ChevronUp, Ticket, MapPin,
} from "lucide-react";
import { apiFetch } from "../services/api";

export default function Compras() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await apiFetch("/ventas/mis-compras");
        setVentas(data);
      } catch (err) {
        setError(err.message || "Error al cargar el historial de compras.");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant gap-3">
        <Loader2 className="animate-spin" size={32} />
        <p>Cargando historial…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-error gap-3">
        <AlertCircle size={32} />
        <p>{error}</p>
      </div>
    );
  }

  const estadoBadge = (estado) => {
    switch (estado?.toLowerCase()) {
      case "paga":
      case "confirmada":
        return (
          <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
            <CheckCircle size={12} /> Completado
          </span>
        );
      case "pendiente":
        return (
          <span className="bg-yellow-500/10 text-yellow-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
            <Clock size={12} /> Pendiente
          </span>
        );
      default:
        return (
          <span className="bg-white/10 text-on-surface-variant text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
            <XCircle size={12} /> {estado}
          </span>
        );
    }
  };

  const formatFecha = (fechaStr) =>
    new Date(fechaStr).toLocaleDateString("es-UY", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  // Agrupa las entradas por partido (id_evento) para mostrarlas organizadas
  const agruparPorPartido = (entradas) => {
    const map = {};
    for (const e of entradas) {
      const key = e.idEvento;
      if (!map[key]) {
        map[key] = {
          idEvento: e.idEvento,
          local: e.equipoLocalNombre,
          visitante: e.equipoVisitanteNombre,
          estadio: e.estadioNombre,
          fecha: e.eventoFecha,
          entradas: [],
        };
      }
      map[key].entradas.push(e);
    }
    return Object.values(map);
  };

  // Título compacto para cuando la tarjeta está cerrada
  const tituloCompacto = (venta) => {
    const partidos = agruparPorPartido(venta.entradas ?? []);
    if (partidos.length === 0)
      return `${venta.cantidadComprada} Entrada${venta.cantidadComprada > 1 ? "s" : ""}`;
    if (partidos.length === 1) {
      const p = partidos[0];
      const sectores = [...new Set(venta.entradas.map((e) => e.codigoSector))].join(", ");
      return `${venta.entradas.length} Entrada${venta.entradas.length > 1 ? "s" : ""} · ${p.local} vs ${p.visitante} (Sector ${sectores})`;
    }
    return `${venta.entradas.length} Entradas · ${partidos.length} partidos distintos`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface">
          Historial de Compras
        </h1>
        <p className="text-sm text-on-surface-variant">
          Consulta el registro de tus transacciones y pagos del Mundial 2026
        </p>
      </div>

      {ventas.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant">
          <ShoppingCart size={40} className="mx-auto mb-3 opacity-40" />
          <p>Todavía no realizaste ninguna compra.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ventas.map((venta) => {
            const isOpen = !!expanded[venta.idVenta];
            const partidos = agruparPorPartido(venta.entradas ?? []);

            return (
              <div
                key={venta.idVenta}
                className="glass-card rounded-xl border border-white/5 hover:border-primary/20 transition-all duration-300 overflow-hidden"
              >
                
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-primary">
                        COMPRA-{venta.idVenta}
                      </span>
                      {estadoBadge(venta.estado)}
                    </div>

                    <p className="text-sm font-semibold text-white">
                      {tituloCompacto(venta)}
                    </p>

                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatFecha(venta.fecha)}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard size={12} />
                        Comisión {Number(venta.porcentajeComision).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Monto + botón expandir */}
                  <div className="flex items-center gap-4">
                    <div className="text-left md:text-right border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                      <p className="text-xs text-on-surface-variant">Monto Total</p>
                      <p className="text-xl font-bold text-white mt-0.5">
                        ${Number(venta.montoTotal).toFixed(2)} USD
                      </p>
                    </div>
                    <button
                      onClick={() => toggleExpand(venta.idVenta)}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors text-on-surface-variant hover:text-on-surface flex-shrink-0"
                      title={isOpen ? "Ocultar detalle" : "Ver detalle"}
                    >
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                
                {isOpen && (
                  <div className="border-t border-white/5 px-5 pb-5 pt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {partidos.map((partido) => (
                      <div key={partido.idEvento}>
                        {/* Sub-cabecera del partido */}
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-primary">
                            {partido.local} vs {partido.visitante}
                          </p>
                          <span className="text-xs text-on-surface-variant">
                            {partido.fecha
                              ? new Date(partido.fecha).toLocaleDateString("es-UY", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : ""}
                          </span>
                        </div>

                        {partido.estadio && (
                          <p className="text-xs text-on-surface-variant flex items-center gap-1 mb-2">
                            <MapPin size={11} />
                            {partido.estadio}
                          </p>
                        )}

                        {/* Fila por entrada */}
                        <div className="space-y-1">
                          {partido.entradas.map((e) => (
                            <div
                              key={e.idEntrada}
                              className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2"
                            >
                              <span className="flex items-center gap-2 text-xs text-on-surface-variant">
                                <Ticket size={13} className="text-tertiary" />
                                Entrada #{e.idEntrada} · Sector{" "}
                                <span className="font-bold text-white">{e.codigoSector}</span>
                                {e.consumida && (
                                  <span className="ml-1 text-[10px] bg-error/20 text-error px-1.5 py-0.5 rounded-full">
                                    Usada
                                  </span>
                                )}
                              </span>
                              <span className="text-xs font-semibold text-white">
                                ${Number(e.costo).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Resumen financiero */}
                    <div className="border-t border-white/5 pt-3 space-y-1 text-sm">
                      <div className="flex justify-between text-on-surface-variant">
                        <span>Subtotal</span>
                        <span>${Number(venta.subtotal).toFixed(2)} USD</span>
                      </div>
                      <div className="flex justify-between text-on-surface-variant">
                        <span>Comisión ({Number(venta.porcentajeComision).toFixed(0)}%)</span>
                        <span>${Number(venta.comision).toFixed(2)} USD</span>
                      </div>
                      <div className="flex justify-between font-bold text-white pt-1 border-t border-white/5">
                        <span>Total</span>
                        <span>${Number(venta.montoTotal).toFixed(2)} USD</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}