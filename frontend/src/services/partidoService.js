import { apiFetch } from "./api";

export const partidoService = {
  getPartidos: async () => {
    const eventos = await apiFetch("/eventos");

    return eventos.map(e => ({
      id: e.idEvento,
      equipoLocal: e.equipoLocalNombre,
      equipoVisita: e.equipoVisitanteNombre,
      fechaHora: e.fecha,
      estadio: e.estadioNombre,
      estado: e.estado?.toUpperCase(),
      sectoresHabilitados: e.sectoresHabilitados || [],
      golesLocal: null,
      golesVisita: null,
      conflicto: null
    }));
  },

  createPartido: async (data) => {
    return await apiFetch("/eventos", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  updateSectoresPartido: async (idEvento, sectores) => {
    return await apiFetch(`/eventos/${idEvento}/sectores`, {
      method: "PUT",
      body: JSON.stringify({ sectoresHabilitados: sectores })
    });
  },

  getConflictos: async () => {
    return [];
  }
};