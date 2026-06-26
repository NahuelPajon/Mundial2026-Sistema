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
    <div 
      className="min-h-screen flex justify-center items-center px-5 py-8"
      style={{ backgroundColor: "#0d0e11" }}
    >
      <style>{`
        * {
          font-family: 'Montserrat', sans-serif;
        }
        
        .input-field {
          font-family: 'Montserrat', sans-serif;
          transition: all 0.2s ease;
        }
        
        .input-field:focus {
          box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
        }
      `}</style>

      <div 
        className="w-full max-w-md rounded-lg p-8 space-y-6 shadow-2xl"
        style={{ 
          backgroundColor: "#292a2c",
          border: "1px solid #43474e"
        }}
      >
        
        {/* HEADER */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <LogIn size={40} style={{ color: "#4ce346" }} className="drop-shadow-lg" />
          </div>
          <h1 
            className="text-4xl font-black tracking-tight"
            style={{ 
              color: "#e3e2e5",
              fontWeight: 800,
              letterSpacing: "-0.02em"
            }}
          >
            Mundial 2026
          </h1>
          <p 
            className="text-base"
            style={{ color: "#c4c6cf" }}
          >
            Acceso a tu cuenta
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div 
            className="p-4 rounded-lg flex gap-3 items-start"
            style={{ 
              backgroundColor: "rgba(255, 180, 171, 0.1)",
              border: "1px solid #ffb4ab"
            }}
          >
            <AlertCircle size={20} style={{ color: "#ffb4ab", flexShrink: 0, marginTop: "2px" }} />
            <span style={{ color: "#ffb4ab" }} className="text-sm leading-relaxed">{error}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label 
              className="text-sm block mb-2 font-semibold"
              style={{ color: "#c4c6cf" }}
            >
              Email
            </label>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tu@email.com"
              required
              className="input-field w-full px-4 py-3 text-base rounded transition"
              style={{ 
                backgroundColor: "#1f2022",
                border: "1px solid #43474e",
                color: "#e3e2e5"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#D4AF37";
                e.target.style.boxShadow = "0 0 0 3px rgba(212, 175, 55, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#43474e";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <label 
              className="text-sm block mb-2 font-semibold"
              style={{ color: "#c4c6cf" }}
            >
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input-field w-full px-4 py-3 text-base rounded transition"
              style={{ 
                backgroundColor: "#1f2022",
                border: "1px solid #43474e",
                color: "#e3e2e5"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#D4AF37";
                e.target.style.boxShadow = "0 0 0 3px rgba(212, 175, 55, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#43474e";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded font-bold text-base flex justify-center items-center gap-2 transition duration-200 hover:scale-105 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed touch-target"
            style={{ 
              backgroundColor: "#4ce346",
              color: "#001f3f",
              height: "56px"
            }}
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
        <div className="text-center text-sm pt-2">
          <span style={{ color: "#c4c6cf" }}>¿No tienes cuenta? </span>
          <Link
            to="/register"
            className="font-bold transition hover:opacity-80"
            style={{ color: "#afc8f0" }}
          >
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
