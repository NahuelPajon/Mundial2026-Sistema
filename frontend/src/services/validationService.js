import { apiFetch } from "./api";

const pick = (obj, ...keys) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
  }
  return undefined;
};

export const validationService = {
  fetchOfficialStats: async (email) => {
    const data = await apiFetch("/validacion/estadisticas");
    const dispositivos = (data?.dispositivos || []).map((d) => ({
      id: pick(d, "idDispositivo", "IdDispositivo"),
      descripcion: pick(d, "descripcion", "Descripcion") ?? "",
    }));

    const dispositivo = dispositivos[0] ?? null;
    const validados = pick(data, "validados", "Validados") ?? 0;
    const username = email?.split("@")[0] ?? "Oficial";

    return {
      legajo: username.startsWith("funcionario")
        ? `OFICIAL ${username.replace("funcionario", "#")}`
        : username.toUpperCase(),
      nombre: username.charAt(0).toUpperCase() + username.slice(1),
      dispositivo: dispositivo?.descripcion ?? "Sin dispositivo asignado",
      dispositivoId: dispositivo?.id ?? null,
      validados,
      total: Math.max(validados + 10, 10),
    };
  },

  validateTicketQR: async (qrCode, idDispositivo) => {
    const body = { qrCode: qrCode?.trim() };
    if (idDispositivo) body.idDispositivo = idDispositivo;

    const data = await apiFetch("/tickets/validar", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return {
      status: pick(data, "status", "Status") ?? "error",
      title: pick(data, "title", "Title") ?? "ERROR",
      message: pick(data, "message", "Message") ?? "Error de validación",
      details: pick(data, "details", "Details") ?? "",
      idValidacion: pick(data, "idValidacion", "IdValidacion"),
      idEntrada: pick(data, "idEntrada", "IdEntrada"),
    };
  },
};
