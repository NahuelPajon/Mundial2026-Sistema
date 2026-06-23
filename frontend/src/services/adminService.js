import { apiFetch } from "./api";

// Fallback de desarrollo para estadísticas generales e insights
const MOCK_STATS = {
  totalTicketsSold: 1240500,
  trendingPercent: 12.5,
  totalRevenue: 452800000,
  commRate: 0.05,
  activeStadiums: 16,
  totalStadiums: 16,
  statusMessage: "All Systems Online"
};

const MOCK_TOP_MATCHES = [
  {
    id: "m-1",
    local: "Mexico",
    visita: "Argentina",
    capacityPercent: 98,
    estadio: "Azteca, CDMX"
  },
  {
    id: "m-2",
    local: "USA",
    visita: "England",
    capacityPercent: 92,
    estadio: "SoFi, LA"
  },
  {
    id: "m-3",
    local: "Canada",
    visita: "Brazil",
    capacityPercent: 85,
    estadio: "BC Place, Vancouver"
  },
  {
    id: "m-4",
    local: "Spain",
    visita: "Morocco",
    capacityPercent: 79,
    estadio: "MetLife, NJ"
  }
];

const MOCK_TOP_BUYERS = [
  {
    id: "u-1",
    nombre: "Ricardo Mendoza",
    ticketsCount: 24,
    totalSpent: 12450.00,
    tier: "Top Tier VIP",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCw-oKB3dyXZ9ZMLSaNEJTRzW3t8BaVr8fOlG0x0K_iqI372pCkSOW-D-Hi9O-eZTRsJ6TsB6Dsp40ZHbMc1lR5SmilGvLRITYOCLtYasXk31C-VdlWei9oFOkTacS1h8BZAJwTa1vAWHXyoN8xS3UXJ4WEr7fNltSpfmE8OG-IPI2YSrOnMkLLVFM_K0izZriKFhagwyP2z9TcfYpCMhoiWE6C4OB1gARmC1X0bOW7nJ95CD3_PShr7HjVNjXTJxgYweT9UakgTDkO"
  },
  {
    id: "u-2",
    nombre: "Sarah Jenkins",
    ticketsCount: 18,
    totalSpent: 9200.00,
    tier: "Corporate Account",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTfJeQdRmkDhSbuCcMZQAA0LFmEtnIzVuolJ4Sh89kimWxfmMPtAIVW_XX1hgd8jTRdxJNlwUEhK58rUnvVRaMBqroe4gu2_mVuYuDUXs3LENXL0_L0mZ558rN9QqfxKkggeTcXilRTlQSdvr7IPSXCTJlTLc8bqfQcqJCL8FEKn7qxVD3tAQepee1MGQVm3zfk6IJDtNxMdKpuD1EUySrRyrdiwUrd9Dg610adz4vEk_CGFZsKn2J0LP2-a6eJ_rAs9On3q5Ct0Hh"
  },
  {
    id: "u-3",
    nombre: "Kenji Tanaka",
    ticketsCount: 15,
    totalSpent: 7800.00,
    tier: "Club Member",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzXpwAKsdTiASck1x9I16BD-PWZDhuJRaPaLW0867mVI5_jHlkT349metlnmIlgRBlZjUKOuVJMX75O7xk2pA7hcqjCSt0cLYucjWY8nAQuTKNoUOQQK26SX1pCw8w9MYq7Xp_MyUtg-JkbF-CcOP-vrNKheDg9f9ZlvbCK65Kpw9SttkVLYFwViXWXPofs43mSDQUYlVxY0skVj_pSEAofLn_LaCn5u_tGgsIg2DJkHeJDGqQGGbfSMfrty4J-ZBIBfynlfFxU3I7"
  }
];

export const adminService = {
  /**
   * Obtiene estadísticas de ventas y estado general para el panel del administrador.
   */
  getDashboardStats: async () => {
    try {
      return await apiFetch("/admin/stats");
    } catch (error) {
      console.warn("Backend /admin/stats no disponible. Usando mock:", error.message);
      return MOCK_STATS;
    }
  },

  /**
   * Obtiene la lista de partidos con más ventas y su nivel de capacidad.
   */
  getTopMatches: async () => {
    try {
      return await apiFetch("/admin/top-matches");
    } catch (error) {
      console.warn("Backend /admin/top-matches no disponible. Usando mock:", error.message);
      return MOCK_TOP_MATCHES;
    }
  },

  /**
   * Obtiene el ranking de los mayores compradores de entradas.
   */
  getTopBuyers: async () => {
    try {
      return await apiFetch("/admin/top-buyers");
    } catch (error) {
      console.warn("Backend /admin/top-buyers no disponible. Usando mock:", error.message);
      return MOCK_TOP_BUYERS;
    }
  }
};
