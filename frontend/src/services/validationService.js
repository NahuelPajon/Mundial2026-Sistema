import { apiFetch } from "./api";

const DEVICE_KEY = "validador_dispositivo";

const pick = (obj, ...keys) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
  }
  return undefined;
};

export const validationService = {
  getSelectedDeviceId: () => {
    try {
      const stored = localStorage.getItem(DEVICE_KEY);
      return stored ? Number(stored) : null;
    } catch {
      return null;
    }
  },

  setSelectedDeviceId: (id) => {
    if (id == null) {
      localStorage.removeItem(DEVICE_KEY);
      return;
    }
    localStorage.setItem(DEVICE_KEY, String(id));
  },

  getMisDispositivos: async () => {
    const data = await apiFetch("/dispositivos/mis-dispositivos");
    return (data || []).map((d) => ({
      id: pick(d, "idDispositivo", "IdDispositivo"),
      descripcion: pick(d, "descripcion", "Descripcion") ?? "",
      emailFuncionario: pick(d, "emailFuncionario", "EmailFuncionario") ?? "",
    }));
  },

  fetchOfficialStats: async (email) => {
    const data = await apiFetch("/validacion/estadisticas");
    const dispositivos = (data?.dispositivos || []).map((d) => ({
      id: pick(d, "idDispositivo", "IdDispositivo"),
      descripcion: pick(d, "descripcion", "Descripcion") ?? "",
    }));

    const selectedId =
      validationService.getSelectedDeviceId() ??
      (dispositivos.length === 1 ? dispositivos[0].id : null);

    if (selectedId && !validationService.getSelectedDeviceId()) {
      validationService.setSelectedDeviceId(selectedId);
    }

    const selectedDevice = dispositivos.find((d) => d.id === selectedId);
    const validados = pick(data, "validados", "Validados") ?? 0;
    const username = email?.split("@")[0] ?? "Oficial";

    return {
      legajo: username.startsWith("funcionario")
        ? `OFICIAL ${username.replace("funcionario", "#")}`
        : username.toUpperCase(),
      nombre: username.charAt(0).toUpperCase() + username.slice(1),
      puerta: selectedDevice?.descripcion ?? "Sin dispositivo seleccionado",
      sectoresAsignados:
        dispositivos.length > 0
          ? dispositivos.map((d) => d.descripcion).join(" · ")
          : "Sin escáneres asignados",
      validados,
      total: Math.max(validados + 10, 10),
      dispositivos,
      selectedDeviceId: selectedId,
    };
  },

  validateTicketQR: async (qrCode, idDispositivo) => {
    const deviceId = idDispositivo ?? validationService.getSelectedDeviceId();

    const body = { qrCode: qrCode?.trim() };
    if (deviceId) body.idDispositivo = deviceId;

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
