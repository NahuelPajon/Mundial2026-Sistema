import { apiFetch } from "./api";

export const eventoService = {
  /**
   * Obtiene todos los eventos disponibles (con sectores habilitados y sus costos).
   * GET /api/eventos
   */
  getAll: async () => {
    return await apiFetch("/eventos");
  },

  /**
   * Obtiene un evento específico por ID.
   * GET /api/eventos/:id
   */
  getById: async (id) => {
    return await apiFetch(`/eventos/${id}`);
  },

  /**
   * Obtiene la tasa de comisión vigente.
   * GET /api/ventas/tasa-comision
   */
  getTasaComision: async () => {
    return await apiFetch("/ventas/tasa-comision");
  },

  /**
   * Realiza la compra de entradas.
   * POST /api/ventas
   * Body: { entradas: [{ idEvento, codigoSector }] }
   */
  comprar: async (entradas) => {
    return await apiFetch("/ventas", {
      method: "POST",
      body: JSON.stringify({ entradas }),
    });
  },
};