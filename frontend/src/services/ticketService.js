import { apiFetch } from "./api";

// Datos de respaldo estructurados idénticamente a lo que devolvería la base de datos
const MOCK_TICKETS = [
  {
    id: "tkt-001",
    fecha: "15 JUN • 18:00",
    isLive: true,
    equipoLocal: "México",
    equipoVisita: "USA",
    flagLocal: "https://lh3.googleusercontent.com/aida-public/AB6AXuD60ATZPvRwWVigcKfbdD-Gu8jIbK1ec5OtV8r4sVl9zvq2EQuYlfAHki2Q1L04Z0eOKRtcWBzoo-SnEyfw9o_zxBqy2VHEE35qIr-zBot59EnDtWkYPx9j4ZjoHrtPsMsnTpAfen0BIZNP7O9EoVGVqbP1NbQ79IEWh_k4hXIfJfKDS8cCehnweaE18oirgkDpW9HoTPHzAuRghfffzWXNUu4MTp7P8iMRIyC9Rx_PmEYMk4cLqxaaUWBeURWe5n70l6zucNkMmPyg",
    flagVisita: "https://lh3.googleusercontent.com/aida-public/AB6AXuBbwS0tqdMrAUmxY-qcDcI8iiQuZyLo1Zn7k-QzRrUYEXco8O79UjBRa-P-TzcmFBcXE43G5W0rblW4pprYUW_ErC1rBAiVBRlQK-uw7ZycxafsEWa1520NcA1kYXhg-d4ueTnPaFhl3cDR7zuAqPaQcAb7KmqacWaF2qcWP3Mtu8Xx-Sd5oAklxpvEJzXu4nGeD5gcSEDBlyhviOg0L9QNt4K8wbSBtotMK5owkYmLXSySpmPK9HBTAR4SxKgRViwDNK_UHbmt1HyY",
    golesLocal: 0,
    golesVisita: 0,
    estadio: "Estadio Azteca, CDMX",
    sector: "A4",
    fila: "12",
    qrCodeUrl: "generar_qr_dinamico"
  },
  {
    id: "tkt-002",
    fecha: "18 JUN • 20:00",
    isLive: false,
    fase: "FASE DE GRUPOS",
    equipoLocal: "Brasil",
    equipoVisita: "España",
    flagLocal: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3EZGoi6u_wpZbii1m3XqyeoPvZ5B2d11XhiKXIFEiPJebU4aZ-id5O9g6tQh7I3OCgmWNb2yMi2uLhgKS-Zgl291IYEmkWQi-p-Qmjd_28iTdAKCyM1gjZBEA_ERi66-tvbBizf-8g0KDYuoApDa2goRZfwLxqCHYi2NDL-elwA_Bb2F0Gs90Jz-tVIJvCvHqzDMvYYup3fFkdObrOJjZ9HV08q2oLTpb7xfwPD6F95B-tLWWiRmNpaQC9tDSXWEQOQ1ucQmJUS80",
    flagVisita: "https://lh3.googleusercontent.com/aida-public/AB6AXuAs6Mzlf9cK1IeO3Xiaz7dbKU5bvlxgMe-zQVGb5WnGAT2j6RO7Wj9VYP-gR0A2e9-v6Ispc5J5XLBHfXZxN2XhygQHdIuU0l8IG-66u9c8v1srtvTZYYA_3EWAwMllCakHpjImtToDc5V2DQYdO5mOaRhVV89TpTU9W88QF449EM4xQfCN4l6tPOsSzXZ2253b_P_cX5n_aMCbY7rhWnVPNNQG0190audVX-PKFC_R2ivHNNEAyQROFO-I9c1pn7zoLYC25loJroBa",
    golesLocal: null,
    golesVisita: null,
    estadio: "MetLife Stadium, NJ",
    sector: "G10",
    fila: "04",
    qrCodeUrl: "generar_qr_dinamico"
  },
  {
    id: "tkt-003",
    fecha: "22 JUN • 16:00",
    isLive: false,
    fase: "FASE DE GRUPOS",
    equipoLocal: "Argentina",
    equipoVisita: "Francia",
    flagLocal: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBUISujsJ_RxejBEF_ATOWYSS4u3-J87Do2cz6tndg_BZkBg7B7fUTzqnddYQDVWjXeRUlwFfNLRoR9Uh55DEQIxyQg2g-lzS6uiCAnhAFL4ZSpYrvmNDJNi6r6IOC6_DVdecmIV6uL2iRjsCwU3xh2C1ItNfjsEspevpQ88rJdIoD9HIfVqqkGzT9bHIwJ2FqMgNM0WXLqb3PZrwTVXI8MBOy_tjoRKFyIYhLZfOA5zn_UM25EaiKjzmWpk1OLe_QIWpwut63a6ui",
    flagVisita: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGP1TRymQwWLDwkvO3EYcGPkdmr74WczlvFJruhhUbiZr5D7uTCSQfLyCr66VPpTgL1JcTyhWHuoAWxii2oXgDtPtpjesLqnxSINd_Y6QoQ5EVRcJztELHR-SahbVlIANU4hfTojoFoyDz8AMupa9iv9RFD_uis2UuTijYy6sBdPPSeUyig_1H8xX3x142YqkUq6I0tZ2T4EgFqib-n1yWrcqXEhfnQrBe0rBdBQcraQA2hqyU8WBd4tJ4zSYmBFL-aNLsIL-VwLbY",
    golesLocal: null,
    golesVisita: null,
    estadio: "SoFi Stadium, LA",
    sector: "C22",
    fila: "20",
    qrCodeUrl: "generar_qr_dinamico"
  }
];

export const ticketService = {
  /**
   * Obtiene las entradas activas del usuario logueado.
   */
  getActiveTickets: async () => {
    try {
      // Intentamos llamar al backend real
      return await apiFetch("/tickets/activas");
    } catch (error) {
      console.warn("Backend /tickets/activas no disponible o error. Usando fallback de desarrollo:", error.message);
      // Fallback temporal para la visualización del diseño base
      return MOCK_TICKETS;
    }
  },

  /**
   * Generar el QR dinámico de una entrada
   */
  generateDynamicQR: async (ticketId) => {
    try {
      return await apiFetch(`/tickets/${ticketId}/qr`);
    } catch (error) {
      console.warn(`Backend QR no disponible para ticket ${ticketId}. Simulando generación local...`);
      // Generamos un código dinámico simulado con timestamp para simular validez
      const timestamp = Math.floor(Date.now() / 1000);
      return {
        qrCode: `FIFA-2026-${ticketId}-${timestamp}`,
        expiresIn: 30 // segundos
      };
    }
  },

  /**
   * Transferir una entrada a otro usuario
   */
  transferTicket: async (ticketId, targetEmail) => {
    return await apiFetch(`/tickets/${ticketId}/transferir`, {
      method: "POST",
      body: JSON.stringify({ email: targetEmail })
    });
  }
};
