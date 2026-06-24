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
    setLoading(false);

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
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f3f4f6",
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "32px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "24px",
            color: "#1f2937",
          }}
        >
          Mundial 2026 - Acceso
        </h2>

        {error && (
          <div
            style={{
              color: "#dc2626",
              backgroundColor: "#fee2e2",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                color: "#4b5563",
                fontSize: "14px",
              }}
            >
            </label>
            Email
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Email address"
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                color: "#4b5563",
                fontSize: "14px",
              }}
            >
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>
        <div
          style={{
            textAlign: "center",
            marginTop: "16px",
          }}
        >
          <span style={{ color: "#6b7280", fontSize: "14px" }}>
            ¿No tienes cuenta?{" "}
          </span>

          <Link
            to="/register"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Registrarse
          </Link>
        </div>
        <p
          style={{
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "12px",
            marginTop: "16px",
          }}
        ></p>
      </div>
    </div>
  );
}
