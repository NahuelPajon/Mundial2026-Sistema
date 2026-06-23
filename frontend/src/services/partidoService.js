import { apiFetch } from "./api";

// Fallback de desarrollo para partidos programados
const MOCK_PARTIDOS = [
  {
    id: "p-1",
    equipoLocal: "MEX",
    equipoVisita: "ITA",
    fechaHora: "2026-06-15T20:00:00",
    estadio: "Estadio Azteca",
    localidad: "Ciudad de México",
    estado: "PROGRAMADO", // PROGRAMADO, EN CURSO, FINALIZADO
    sectoresHabilitados: ["Sector VIP", "General Norte"],
    golesLocal: null,
    golesVisita: null
  },
  {
    id: "p-2",
    equipoLocal: "USA",
    equipoVisita: "BRA",
    fechaHora: "2026-06-23T11:21:00", // Dinámico para simular el en curso
    estadio: "MetLife Stadium",
    localidad: "New Jersey, NJ",
    estado: "EN CURSO",
    minuto: "64'",
    golesLocal: 2,
    golesVisita: 1,
    sectoresHabilitados: ["Sector VIP", "Platea Baja", "General Norte"]
  },
  {
    id: "p-3",
    equipoLocal: "CAN",
    equipoVisita: "ARG",
    fechaHora: "2026-06-18T15:00:00",
    estadio: "BC Place",
    localidad: "Vancouver, Canada",
    estado: "PROGRAMADO",
    conflicto: "El estadio requiere 6 horas entre eventos para limpieza profunda de sectores VIP. El evento previo finaliza a las 12:30.",
    sectoresHabilitados: ["Sector VIP"]
  },
  {
    id: "p-4",
    equipoLocal: "ESP",
    equipoVisita: "FRA",
    fechaHora: "2026-06-12T12:30:00",
    estadio: "SoFi Stadium",
    localidad: "Los Angeles, LA",
    estado: "FINALIZADO",
    golesLocal: 1,
    golesVisita: 3,
    sectoresHabilitados: ["Sector VIP", "General Norte"]
  }
];

const MOCK_CONFLICTOS = [
  {
    id: "c-1",
    titulo: "ALERTA DE CONFLICTO DETECTADA",
    mensaje: "Traslape de horario en Estadio Azteca: El partido MEX vs USA coincide con el bloque de mantenimiento técnico (14:00 - 18:00)."
  }
];

export const partidoService = {
  /**
   * Obtiene todos los partidos programados
   */
  getPartidos: async () => {
    try {
      return await apiFetch("/partidos");
    } catch (error) {
      console.warn("Backend /partidos no disponible. Usando fallback local:", error.message);
      return MOCK_PARTIDOS;
    }
  },

  /**
   * Registra un nuevo partido en el sistema
   */
  createPartido: async (partidoData) => {
    try {
      return await apiFetch("/partidos", {
        method: "POST",
        body: JSON.stringify(partidoData)
      });
    } catch (error) {
      console.warn("Backend POST /partidos no disponible. Simulando creación local...");
      // Simular respuesta del backend
      const newPartido = {
        id: `p-${Math.floor(Math.random() * 1000 + 10)}`,
        equipoLocal: partidoData.equipoLocal,
        equipoVisita: partidoData.equipoVisita,
        fechaHora: partidoData.fechaHora,
        estadio: partidoData.estadio.split(",")[0].trim(),
        localidad: partidoData.estadio.split(",")[1]?.trim() || "Sede oficial",
        estado: "PROGRAMADO",
        sectoresHabilitados: ["Sector VIP", "General Norte"],
        golesLocal: null,
        golesVisita: null
      };
      
      return newPartido;
    }
  },

  /**
   * Obtiene las alertas de conflicto de horarios u otros problemas de mantenimiento
   */
  getConflictos: async () => {
    try {
      return await apiFetch("/partidos/conflictos");
    } catch (error) {
      console.warn("Backend /partidos/conflictos no disponible. Usando mock:", error.message);
      return MOCK_CONFLICTOS;
    }
  },

  /**
   * Habilita/deshabilita sectores específicos en un partido
   */
  updateSectoresPartido: async (partidoId, sectoresHabilitados) => {
    try {
      return await apiFetch(`/partidos/${partidoId}/sectores`, {
        method: "PUT",
        body: JSON.stringify({ sectoresHabilitados })
      });
    } catch (error) {
      console.warn(`Backend PUT /partidos/${partidoId}/sectores no disponible. Simulación local exitosa.`);
      return { success: true, sectoresHabilitados };
    }
  }
};
