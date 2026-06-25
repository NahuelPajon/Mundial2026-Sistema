import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { Link } from "react-router-dom";
import { LogIn, AlertCircle, Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-[#0b1220] text-white flex justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-[#111a2e] border border-gray-700 rounded-xl p-8 shadow-2xl space-y-6">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <LogIn className="text-lime-400" size={32} />
          </div>
          <h1 className="text-3xl font-bold">Mundial 2026</h1>
          <p className="text-sm text-gray-400">Acceso a tu cuenta</p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-lg flex gap-2">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Email</label>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full p-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-400 outline-none transition"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full p-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-400 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg border border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black transition font-semibold flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Accediendo...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* REGISTER LINK */}
        <div className="text-center text-sm">
          <span className="text-gray-400">¿No tienes cuenta? </span>
          <Link
            to="/register"
            className="text-lime-400 font-semibold hover:text-lime-300 transition"
          >
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
