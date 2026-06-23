import { apiFetch } from "./api";

export const estadioService = {
  /**
   * Obtiene la lista de todos los estadios
   */
  getAll: async () => {
    try {
      return await apiFetch("/estadios");
    } catch (error) {
      console.error("Error al obtener estadios del backend:", error.message);
      // Fallback local en caso de que no haya conexión
      return [
        {
          idEstadio: 1,
          nombre: "Estadio Azteca",
          localidad: "CDMX",
          paisDir: "México",
          aforo: 87523
        },
        {
          idEstadio: 2,
          nombre: "MetLife Stadium",
          localidad: "East Rutherford, NJ",
          paisDir: "USA",
          aforo: 82500
        },
        {
          idEstadio: 3,
          nombre: "SoFi Stadium",
          localidad: "Los Angeles",
          paisDir: "USA",
          aforo: 70000
        }
      ];
    }
  },

  /**
   * Obtiene un estadio por su ID
   */
  getById: async (id) => {
    return await apiFetch(`/estadios/${id}`);
  }
};
