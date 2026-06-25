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
    return (data || []).map((ev) => {
      const vendidas = pick(ev, "entradasVendidas", "EntradasVendidas") ?? 0;
      const capacidad = pick(ev, "capacidadTotal", "CapacidadTotal") ?? 0;
      const porcentaje = capacidad > 0 ? Math.round((vendidas / capacidad) * 100) : 0;
      return {
        id: pick(ev, "idEvento", "IdEvento"),
        local: pick(ev, "equipoLocal", "EquipoLocal", "equipoLocalNombre", "EquipoLocalNombre") ?? "",
        visita: pick(ev, "equipoVisitante", "EquipoVisitante", "equipoVisitanteNombre", "EquipoVisitanteNombre") ?? "",
        capacityPercent: porcentaje,
        estadio: pick(ev, "estadio", "Estadio", "estadioNombre", "EstadioNombre") ?? "",
        entradasVendidas: vendidas,
        capacidadTotal: capacidad,
      };
    });
  },

  getTopBuyers: async () => {
    const data = await apiFetch("/reportes/ranking-compradores?limit=5");
    return (data || []).map((buyer, index) => {
      const email = pick(buyer, "email", "Email") ?? "";
      // Nombre derivado del email (parte antes del @)
      const nombre = email.split("@")[0].replace(".", " ").replace(/\b\w/g, c => c.toUpperCase());
      return {
        id: email || index,
        nombre,
        email,
        ticketsCount: pick(buyer, "cantidadEntradasCompradas", "CantidadEntradasCompradas", "cantidadEntradas", "CantidadEntradas") ?? 0,
        totalSpent: pick(buyer, "montoTotalGastado", "MontoTotalGastado") ?? 0,
        tier: "Comprador registrado",
        avatar: null,
      };
    });
  },
};