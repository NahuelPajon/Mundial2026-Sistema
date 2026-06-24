const API_BASE_URL = 'http://localhost:5053/api/auth';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
          errorData.message ||
          'Usuario o contraseña incorrectos'
        );
      }

      const userData = await response.json();

      localStorage.setItem(
        'user_session',
        JSON.stringify(userData)
      );

      return userData;
    } catch (error) {
      console.error('Error en authService.login:', error.message);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          'Error al registrar usuario'
        );
      }

      return data;
    } catch (error) {
      console.error('Error en authService.register:', error.message);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('user_session');
  },

  getCurrentUser: () => {
    const session = localStorage.getItem('user_session');
    return session ? JSON.parse(session) : null;
  },

  getToken: () => {
    const user = authService.getCurrentUser();
    return user ? user.token : null;
  }
};
