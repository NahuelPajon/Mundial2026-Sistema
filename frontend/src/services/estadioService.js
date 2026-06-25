import { apiFetch } from "./api";

export const estadioService = {
  getAll: async () => {
    try {
      return await apiFetch("/estadios");
    } catch (error) {
      console.error("Error al obtener estadios del backend:", error.message);
      return [
        { idEstadio: 1, nombre: "Estadio Azteca", localidad: "CDMX", paisDir: "México", aforo: 87523 },
        { idEstadio: 2, nombre: "MetLife Stadium", localidad: "East Rutherford, NJ", paisDir: "USA", aforo: 82500 },
        { idEstadio: 3, nombre: "SoFi Stadium", localidad: "Los Angeles", paisDir: "USA", aforo: 70000 }
      ];
    }
  },

  getById: async (id) => {
    return await apiFetch(`/estadios/${id}`);
  },

  getSectores: async (estadioId) => {
    try {
      return await apiFetch(`/estadios/${estadioId}/sectores`);
    } catch (error) {
      console.warn(`Backend /estadios/${estadioId}/sectores no disponible. Usando mock data:`, error.message);
      return [
        { idSector: "A", nombre: "General Inferior", capacidad: 12500, precioBase: 120, isVIP: false },
        { idSector: "B", nombre: "Lateral Media", capacidad: 8200, precioBase: 250, isVIP: false },
        { idSector: "C", nombre: "Club Premium", capacidad: 2100, precioBase: 850, isVIP: true },
        { idSector: "D", nombre: "Hospitality Suite", capacidad: 450, precioBase: 1200, isVIP: false }
      ];
    }
  },

  // Sin fallback: si el backend rechaza por jurisdicción, el error debe llegar al usuario
  updateSectorPrecio: async (estadioId, sectorId, precioBase) => {
    return await apiFetch(`/estadios/${estadioId}/sectores/${sectorId}`, {
      method: "PUT",
      body: JSON.stringify({ precioBase: Number(precioBase) })
    });
  }
};