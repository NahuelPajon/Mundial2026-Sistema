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
  },

  /**
   * Obtiene los sectores de un estadio específico con su aforo y precio base
   */
  getSectores: async (estadioId) => {
    try {
      return await apiFetch(`/estadios/${estadioId}/sectores`);
    } catch (error) {
      console.warn(`Backend /estadios/${estadioId}/sectores no disponible. Usando mock data:`, error.message);
      
      // Fallback con datos específicos del diseño
      return [
        {
          idSector: "A",
          nombre: "General Inferior",
          capacidad: 12500,
          precioBase: 120,
          isVIP: false
        },
        {
          idSector: "B",
          nombre: "Lateral Media",
          capacidad: 8200,
          precioBase: 250,
          isVIP: false
        },
        {
          idSector: "C",
          nombre: "Club Premium",
          capacidad: 2100,
          precioBase: 850,
          isVIP: true
        },
        {
          idSector: "D",
          nombre: "Hospitality Suite",
          capacidad: 450,
          precioBase: 1200,
          isVIP: false
        }
      ];
    }
  },

  /**
   * Actualiza el precio base de un sector específico
   */
  updateSectorPrecio: async (estadioId, sectorId, precioBase) => {
    try {
      return await apiFetch(`/estadios/${estadioId}/sectores/${sectorId}`, {
        method: "PUT",
        body: JSON.stringify({ precioBase: Number(precioBase) })
      });
    } catch (error) {
      console.warn(`Backend PUT /estadios/${estadioId}/sectores/${sectorId} no disponible. Simulación local exitosa.`);
      return { success: true, estadioId, sectorId, precioBase };
    }
  }
};
