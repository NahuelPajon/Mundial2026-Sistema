import { apiFetch } from "./api";

const pick = (obj, ...keys) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
  }
  return undefined;
};

export const adminService = {
  getDashboardStats: async () => {
    const data = await apiFetch("/reportes/resumen");
    return {
      totalTicketsSold: pick(data, "totalEntradasVendidas", "TotalEntradasVendidas") ?? 0,
      trendingPercent: 0,
      totalRevenue: pick(data, "recaudacionTotal", "RecaudacionTotal") ?? 0,
      commRate: (pick(data, "porcentajeComision", "PorcentajeComision") ?? 5) / 100,
      activeStadiums: pick(data, "estadiosActivos", "EstadiosActivos") ?? 0,
      totalStadiums: pick(data, "totalEstadios", "TotalEstadios") ?? 0,
      statusMessage: "All Systems Online",
    };
  },

  getTopMatches: async () => {
    const data = await apiFetch("/reportes/eventos-mas-vendidos?limit=4");
    return (data || []).map((ev) => ({
      id: pick(ev, "idEvento", "IdEvento"),
      local: pick(ev, "equipoLocal", "EquipoLocal") ?? "",
      visita: pick(ev, "equipoVisitante", "EquipoVisitante") ?? "",
      capacityPercent: Math.round(pick(ev, "porcentajeOcupacion", "PorcentajeOcupacion") ?? 0),
      estadio: pick(ev, "estadio", "Estadio") ?? "",
      entradasVendidas: pick(ev, "entradasVendidas", "EntradasVendidas") ?? 0,
    }));
  },

  getTopBuyers: async () => {
    const data = await apiFetch("/reportes/ranking-compradores?limit=5");
    return (data || []).map((buyer, index) => ({
      id: pick(buyer, "email", "Email") ?? index,
      nombre: pick(buyer, "nombre", "Nombre") ?? "",
      ticketsCount: pick(buyer, "cantidadEntradas", "CantidadEntradas") ?? 0,
      totalSpent: pick(buyer, "montoTotalGastado", "MontoTotalGastado") ?? 0,
      tier: "Comprador registrado",
      avatar: null,
    }));
  },
};
