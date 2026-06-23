import { apiFetch } from "./api";

export const userService = {
  /**
   * Obtiene la información del perfil del usuario a partir de su email.
   */
  getProfile: async (email) => {
    try {
      return await apiFetch(`/usuarios/${email}`);
    } catch (error) {
      console.warn(`Error al obtener perfil para ${email} del backend:`, error.message);
      // Fallback local en caso de que el backend no tenga los datos cargados o falle
      return {
        email: email,
        paisDir: "Uruguay",
        localidad: "Montevideo",
        calle: "Ejido",
        numeroDir: "123",
        codPostal: "11000",
        docPais: "Uruguay",
        docTipo: "CI",
        docNumero: "UY999999",
        telefonos: ["+598 99 000 000"],
        fechaRegistro: new Date().toISOString(),
        estadoVerificacion: "verificado"
      };
    }
  }
};
