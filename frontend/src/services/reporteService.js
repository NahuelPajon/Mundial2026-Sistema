import { apiFetch } from "./api";

const pick = (obj, ...keys) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
  }
  return undefined;
};

export const reporteService = {
  getMisEntradasAsignadas: () => apiFetch("/reportes/mis-entradas"),
  getMisCompras: () => apiFetch("/reportes/mis-compras"),
};

export const formatCompra = (venta) => {
  const idVenta = pick(venta, "idVenta", "IdVenta");
  const fecha = new Date(pick(venta, "fecha", "Fecha") ?? Date.now());
  const monto = pick(venta, "montoTotal", "MontoTotal") ?? 0;
  const estado = pick(venta, "estado", "Estado") ?? "";
  const entradas = venta.entradas ?? venta.Entradas ?? [];
  const cantidad = pick(venta, "cantidadComprada", "CantidadComprada") ?? entradas.length;

  const primera = entradas[0];
  const detalle = primera
    ? `${cantidad} entrada(s) — ${pick(primera, "equipoLocalNombre", "EquipoLocalNombre") ?? ""} vs ${pick(primera, "equipoVisitanteNombre", "EquipoVisitanteNombre") ?? ""} (Sector ${pick(primera, "codigoSector", "CodigoSector") ?? ""})`
    : `${cantidad} entrada(s)`;

  return {
    id: `COMPRA-${idVenta}`,
    fecha: fecha.toLocaleDateString("es-UY", { day: "numeric", month: "long", year: "numeric" }),
    total: `$${Number(monto).toFixed(2)} USD`,
    detalle,
    estado: estado === "paga" ? "Completado" : estado,
  };
};
