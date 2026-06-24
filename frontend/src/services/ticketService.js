import { apiFetch } from "./api";

const pick = (obj, ...keys) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
  }
  return undefined;
};

const normalizeTicket = (raw) => ({
  id: pick(raw, "id", "Id", "idEntrada", "IdEntrada"),
  fecha: pick(raw, "fecha", "Fecha") ?? "",
  isLive: pick(raw, "isLive", "IsLive") ?? false,
  equipoLocal: pick(raw, "equipoLocal", "EquipoLocal") ?? "",
  equipoVisita: pick(raw, "equipoVisita", "EquipoVisita") ?? "",
  estadio: pick(raw, "estadio", "Estadio") ?? "",
  sector: pick(raw, "sector", "Sector", "codigoSector", "CodigoSector") ?? "",
  fila: pick(raw, "fila", "Fila") ?? "—",
});

const normalizeQr = (raw) => ({
  qrCode: pick(raw, "qrCode", "QrCode") ?? "",
  expiresIn: pick(raw, "expiresIn", "ExpiresIn") ?? 30,
  expiraEn: pick(raw, "expiraEn", "ExpiraEn"),
});

export const ticketService = {
  getActiveTickets: async () => {
    const data = await apiFetch("/tickets/activas");
    return (data || []).map(normalizeTicket);
  },

  generateDynamicQR: async (ticketId) => {
    const data = await apiFetch(`/tickets/${ticketId}/qr`);
    return normalizeQr(data);
  },

  getQrImageUrl: (token, size = 200) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(token)}`,

  transferTicket: async (ticketId, targetEmail) =>
    apiFetch("/transferencias", {
      method: "POST",
      body: JSON.stringify({
        idEntrada: Number(ticketId),
        emailDestino: targetEmail.trim(),
      }),
    }),
};
