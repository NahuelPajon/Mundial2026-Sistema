import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    paisDir: "",
    localidad: "",
    calle: "",
    numeroDir: "",
    codPostal: "",
    docPais: "",
    docTipo: "",
    docNumero: "",
    telefono: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);

      await authService.register({
        rol: "Usuario",
        email: form.email,
        password: form.password,
        paisDir: form.paisDir,
        localidad: form.localidad,
        calle: form.calle,
        numeroDir: form.numeroDir,
        codPostal: form.codPostal,
        docPais: form.docPais,
        docTipo: form.docTipo,
        docNumero: form.docNumero,
        telefonos: [form.telefono]
      });

      alert("Usuario registrado correctamente");

      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #d1d5db",
    boxSizing: "border-box",
    marginBottom: "14px"
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        padding: "16px"
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "32px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "550px"
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "24px",
            color: "#1f2937"
          }}
        >
          Registro Mundial 2026
        </h2>

        {error && (
          <div
            style={{
              color: "#dc2626",
              backgroundColor: "#fee2e2",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "16px"
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmar contraseña"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="paisDir"
            placeholder="País"
            value={form.paisDir}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="localidad"
            placeholder="Localidad"
            value={form.localidad}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="calle"
            placeholder="Calle"
            value={form.calle}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="numeroDir"
            placeholder="Número de puerta"
            value={form.numeroDir}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="codPostal"
            placeholder="Código Postal"
            value={form.codPostal}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="docPais"
            placeholder="País del documento"
            value={form.docPais}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="docTipo"
            placeholder="Tipo de documento (CI, Pasaporte...)"
            value={form.docTipo}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="docNumero"
            placeholder="Número de documento"
            value={form.docNumero}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={handleChange}
            required
            style={inputStyle}
          />

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
              fontWeight: "bold"
            }}
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "16px"
          }}
        >
          <span style={{ color: "#6b7280" }}>
            ¿Ya tienes una cuenta?{" "}
          </span>

          <Link
            to="/login"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: "bold"
            }}
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}