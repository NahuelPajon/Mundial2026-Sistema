import { apiFetch } from "./api";

export const equipoService = {
  getAll: async () => {
    return await apiFetch("/equipos");
  },

  getById: async (id) => {
    return await apiFetch(`/equipos/${id}`);
  }
};