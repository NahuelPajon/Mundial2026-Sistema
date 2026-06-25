import { apiFetch } from "./api";

const mapSectoresFromApi = (sectores) => {
  return (sectores || []).map((sector) => ({
    idSector: sector.codigo,
    nombre: `Sector ${sector.codigo}`,
    capacidad: sector.capacidadMaxima,
    precioBase: sector.costo,
    entradasDisponibles: sector.entradasDisponibles,
    isVIP: sector.codigo?.toLowerCase() === "vip"
  }));
};

export const estadioService = {
  getAll: async () => {
    return await apiFetch("/estadios");
  },

  getById: async (id) => {
    return await apiFetch(`/estadios/${id}`);
  },

  getSectores: async (id) => {
    const estadio = await apiFetch(`/estadios/${id}`);
    return mapSectoresFromApi(estadio.sectores);
  },

  create: async (data) => {
    return await apiFetch("/estadios", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  updateSectorPrecio: async (idEstadio, codigo, costo) => {
    return await apiFetch(`/estadios/${idEstadio}/sectores/${codigo}`, {
      method: "PUT",
      body: JSON.stringify({ costo: Number(costo) })
    });
  }
};