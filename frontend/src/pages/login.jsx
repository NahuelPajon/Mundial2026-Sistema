import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { Link } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await authService.login(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-on-surface">
      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[1rem] border border-outline bg-surface-container-highest/95 p-8 stadium-shadow backdrop-blur-sm">
        <div className="pointer-events-none absolute -right-16 top-6 h-48 w-48 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="relative z-10">
          <p className="text-sm font-label-bold uppercase tracking-[0.22em] text-primary">Apex Arena</p>
          <h1 className="mt-4 text-display-lg-mobile font-display-lg text-on-surface">Bienvenido de nuevo</h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Accede a tu cuenta para consultar entradas, validar acceso y disfrutar de la experiencia del Mundial 2026.
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-error bg-error-container/20 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-label-bold uppercase tracking-[0.18em] text-on-surface-variant">
                Email
              </label>
              <input
                id="login-email"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Correo electrónico"
                required
                className="w-full rounded-xl border border-outline bg-surface-container-low px-4 py-4 text-on-surface placeholder:text-on-surface-variant focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm font-label-bold uppercase tracking-[0.18em] text-on-surface-variant">
                Contraseña
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-outline bg-surface-container-low px-4 py-4 text-on-surface placeholder:text-on-surface-variant focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-[56px] w-full items-center justify-center rounded-xl bg-tertiary text-primary-container text-body-md font-bold shadow-lg shadow-tertiary/20 transition duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-surface-container-low"
            >
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2 text-center text-sm text-on-surface-variant">
            <span>¿No tienes cuenta?</span>
            <Link to="/register" className="font-label-bold text-primary transition hover:text-primary-fixed">
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
