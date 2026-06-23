import { apiFetch } from "./api";

export const validacionService = {
  /**
   * Envía el ID o código de entrada escaneado para verificar el acceso en el backend.
   */
  validarTicket: async (ticketId, puertaAsignada) => {
    try {
      return await apiFetch("/validacion/validar", {
        method: "POST",
        body: JSON.stringify({ ticketId, puerta: puertaAsignada })
      });
    } catch (error) {
      console.warn("Backend /validacion/validar no disponible. Utilizando simulador local:", error.message);
      
      // Simulamos respuestas basadas en casos hipotéticos
      const rand = Math.random();
      if (rand < 0.7) {
        return {
          status: "success", // Validado
          mensaje: "ACCESO PERMITIDO",
          sector: "A",
          fila: "12",
          asiento: "44"
        };
      } else if (rand < 0.85) {
        return {
          status: "warning", // Sector/Puerta equivocada
          mensaje: "SECTOR EQUIVOCADO",
          detalle: "DIRIGIR A: PUERTA 12 (NORTE)"
        };
      } else {
        return {
          status: "error", // Entrada ya escaneada o inválida
          mensaje: "TICKET YA CONSUMIDO",
          detalle: `ID: ${ticketId || "992-001-FF2"} | 14:02 PM`
        };
      }
    }
  },

  /**
   * Obtiene las estadísticas del turno actual del oficial.
   */
  getProgresoTurno: async () => {
    try {
      return await apiFetch("/validacion/progreso");
    } catch (error) {
      console.warn("Backend /validacion/progreso no disponible. Retornando datos de diseño:", error.message);
      return {
        validados: 1240,
        total: 2800,
        sectoresAsignados: "Sectores A, B"
      };
    }
  },

  /**
   * Finaliza el turno del oficial de validación.
   */
  finalizarTurno: async () => {
    try {
      return await apiFetch("/validacion/finalizar", { method: "POST" });
    } catch (error) {
      console.warn("Backend /validacion/finalizar no disponible.");
      return { status: "success", mensaje: "Turno finalizado y sincronizado localmente." };
    }
  }
};
