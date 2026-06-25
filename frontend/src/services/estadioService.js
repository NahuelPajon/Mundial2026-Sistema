import { apiFetch } from "./api";

export const estadioService = {
  getAll: async () => {
    return await apiFetch("/estadios");
  },

  getById: async (id) => {
    return await apiFetch(`/estadios/${id}`);
  }
};