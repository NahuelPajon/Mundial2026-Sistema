import React from "react";
import { ShoppingCart, CheckCircle, CreditCard, Calendar } from "lucide-react";

export default function Compras() {
  // Historial de compras mockeado para la interfaz
  const compras = [
    {
      id: "COMPRA-89312",
      fecha: "12 de Mayo, 2026",
      total: "$150.00 USD",
      metodoPago: "Visa ending in 4242",
      detalle: "1 Entrada - México vs USA (Sector A4, Fila 12)",
      estado: "Completado"
    },
    {
      id: "COMPRA-74190",
      fecha: "05 de Mayo, 2026",
      total: "$120.00 USD",
      metodoPago: "Mastercard ending in 5555",
      detalle: "1 Entrada - Brasil vs España (Sector G10, Fila 04)",
      estado: "Completado"
    },
    {
      id: "COMPRA-65109",
      fecha: "02 de Mayo, 2026",
      total: "$200.00 USD",
      metodoPago: "Paypal (alejandro***@gmail.com)",
      detalle: "1 Entrada - Argentina vs Francia (Sector C22, Fila 20)",
      estado: "Completado"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface">Historial de Compras</h1>
        <p className="text-sm text-on-surface-variant">Consulta el registro de tus transacciones y pagos del Mundial 2026</p>
      </div>

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
                <span className="flex items-center gap-1">
                  <CreditCard size={12} />
                  {compra.metodoPago}
                </span>
              </div>
            </div>

            <div className="text-left md:text-right border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
              <p className="text-xs text-on-surface-variant">Monto Total</p>
              <p className="text-xl font-bold text-white mt-0.5">{compra.total}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
