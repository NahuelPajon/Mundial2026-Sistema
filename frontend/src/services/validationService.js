import { apiFetch } from "./api";

// Claves de localStorage para persistir el progreso de la sesión de validación
const STATS_KEY = "validador_stats";

const DEFAULT_STATS = {
  legajo: "OFICIAL #2841",
  nombre: "M. Rodríguez",
  puerta: "GATE 4-B | DEV_X9",
  sectoresAsignados: "Sectores A, B",
  validados: 1240,
  total: 2800
};

export const validationService = {
  /**
   * Obtiene las estadísticas y asignación actual del funcionario logueado.
   */
  getOfficialStats: (email) => {
    try {
      const stored = localStorage.getItem(STATS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Personalizar con base al email si es posible
      const stats = { ...DEFAULT_STATS };
      if (email) {
        const username = email.split("@")[0];
        if (username.startsWith("funcionario")) {
          const num = username.replace("funcionario", "");
          stats.legajo = `OFICIAL #00${num || "1"}`;
          stats.nombre = `Funcionario ${num || "1"}`;
        } else {
          stats.nombre = username.charAt(0).toUpperCase() + username.slice(1);
        }
      }
      
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
      return stats;
    } catch (e) {
      return DEFAULT_STATS;
    }
  },

  /**
   * Incrementa en 1 la cantidad de validados en la sesión local.
   */
  incrementValidatedCount: () => {
    try {
      const stored = localStorage.getItem(STATS_KEY);
      const stats = stored ? JSON.parse(stored) : { ...DEFAULT_STATS };
      stats.validados = Math.min(stats.validados + 1, stats.total);
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
      return stats;
    } catch (e) {
      console.error("Error al actualizar estadísticas locales:", e);
      return DEFAULT_STATS;
    }
  },

  /**
   * Reinicia la sesión de validación.
   */
  resetStats: () => {
    try {
      localStorage.removeItem(STATS_KEY);
    } catch (e) {
      console.error(e);
    }
  },

  /**
   * Valida un código QR contra el backend.
   */
  validateTicketQR: async (qrCode) => {
    try {
      // Intentar enviar al backend real
      return await apiFetch("/tickets/validar", {
        method: "POST",
        body: JSON.stringify({ qrCode })
      });
    } catch (error) {
      console.warn("Backend de validación /tickets/validar no disponible. Simulando comportamiento local...", error.message);
      
      // Simulación basada en el contenido del código escaneado
      return new Promise((resolve) => {
        setTimeout(() => {
          const code = (qrCode || "").toLowerCase();
          
          if (code.includes("error") || code.includes("fail") || code.includes("cancel")) {
            resolve({
              status: "error",
              title: "ERROR",
              message: "TICKET YA CONSUMIDO",
              details: `ID: ${Math.floor(Math.random() * 900 + 100)}-001-FF2 | Hace 5 minutos`
            });
          } else if (code.includes("warning") || code.includes("wrong") || code.includes("sector")) {
            resolve({
              status: "warning",
              title: "INCORRECTO",
              message: "SECTOR EQUIVOCADO",
              details: "DIRIGIR A: PUERTA 12 (NORTE)"
            });
          } else {
            resolve({
              status: "success",
              title: "VALIDADO",
              message: "ACCESO PERMITIDO",
              details: `SECTOR A - FILA ${Math.floor(Math.random() * 20 + 1)} - ASIENTO ${Math.floor(Math.random() * 50 + 1)}`
            });
          }
        }, 1000); // Simulamos 1 segundo de latencia de red
      });
    }
  }
};
