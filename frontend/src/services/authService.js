const API_URL = 'http://localhost:5053/api/auth/login';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await fetch(API_URL, {
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
        throw new Error(errorData.error || errorData.message || 'Usuario o contraseña incorrectos');
      }

      const userData = await response.json();
      
      localStorage.setItem("user_session", JSON.stringify(userData));
      return userData;

    } catch (error) {
      console.error('Error en authService.login:', error.message);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("user_session");
  },

  getCurrentUser: () => {
    const session = localStorage.getItem("user_session");
    return session ? JSON.parse(session) : null;
  },

  getToken: () => {
    const user = authService.getCurrentUser();
    return user ? user.token : null;
  }
};
