import React, { useState, useEffect } from "react";
import { ShoppingCart, CheckCircle, Clock, XCircle, Calendar, Loader2, AlertCircle, CreditCard } from "lucide-react";
import { apiFetch } from "../services/api";

export default function Compras() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        return (
          <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
            <CheckCircle size={12} /> Completado
          </span>
        );
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

  const resumenEntradas = (venta) => {
    if (venta.entradas?.length > 0) {
      const e = venta.entradas[0];
      return `${venta.entradas.length} Entrada${venta.entradas.length > 1 ? "s" : ""} - ${e.equipoLocalNombre} vs ${e.equipoVisitanteNombre} (Sector ${e.codigoSector})`;
    }
    return `${venta.cantidadComprada} Entrada${venta.cantidadComprada > 1 ? "s" : ""}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface">Historial de Compras</h1>
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
          {ventas.map((venta) => (
            <div
              key={venta.idVenta}
              className="glass-card rounded-xl p-5 border border-white/5 hover:border-primary/20 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-primary">
                    COMPRA-{venta.idVenta}
                  </span>
                  {estadoBadge(venta.estado)}
                </div>

                <p className="text-sm font-semibold text-white">{resumenEntradas(venta)}</p>

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

              <div className="text-left md:text-right border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                <p className="text-xs text-on-surface-variant">Monto Total</p>
                <p className="text-xl font-bold text-white mt-0.5">${Number(venta.montoTotal).toFixed(2)} USD</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
