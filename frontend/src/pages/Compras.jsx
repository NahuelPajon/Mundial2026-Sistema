import React, { useState, useEffect } from "react";
import { ShoppingCart, CheckCircle, Calendar, Loader2, AlertCircle } from "lucide-react";
import { reporteService, formatCompra } from "../services/reporteService";

export default function Compras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await reporteService.getMisCompras();
        setCompras((data || []).map(formatCompra));
      } catch (err) {
        setError(err.message || "Error al cargar el historial de compras.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface">Historial de Compras</h1>
        <p className="text-sm text-on-surface-variant">
          Consulta el registro de tus transacciones y pagos del Mundial 2026
        </p>
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

      {!loading && !error && compras.length === 0 && (
        <div className="text-center py-12 glass-card rounded-xl">
          <ShoppingCart className="mx-auto text-on-surface-variant mb-3 opacity-50" size={48} />
          <p className="text-on-surface-variant">Aún no registrás compras en el sistema</p>
        </div>
      )}

      {!loading && !error && compras.length > 0 && (
        <div className="space-y-4">
          {compras.map((compra) => (
            <div
              key={compra.id}
              className="glass-card rounded-xl p-5 border border-white/5 hover:border-primary/20 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-primary">
                    {compra.id}
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                    <CheckCircle size={12} />
                    {compra.estado}
                  </span>
                </div>

                <p className="text-sm font-semibold text-white">{compra.detalle}</p>

                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {compra.fecha}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-data-mono text-lg text-tertiary font-bold">{compra.total}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
