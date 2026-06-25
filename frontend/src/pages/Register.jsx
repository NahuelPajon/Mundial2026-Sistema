import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { UserPlus, AlertCircle, Loader2, Check } from "lucide-react";

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
    telefono: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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
        telefonos: [form.telefono],
      });

      setSuccess("Usuario registrado correctamente. Redirigiendo...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputFieldStyle = {
    backgroundColor: "#1f2022",
    border: "1px solid #43474e",
    color: "#e3e2e5",
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = "#D4AF37";
    e.target.style.boxShadow = "0 0 0 3px rgba(212, 175, 55, 0.15)";
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = "#43474e";
    e.target.style.boxShadow = "none";
  };

  return (
    <div
      className="min-h-screen px-5 py-8"
      style={{ backgroundColor: "#0d0e11" }}
    >
      <style>{`
        * {
          font-family: 'Montserrat', sans-serif;
        }
        
        .section-divider {
          border-color: #43474e;
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-8 space-y-3">
          <div className="flex justify-center">
            <UserPlus
              size={40}
              style={{ color: "#4ce346" }}
              className="drop-shadow-lg"
            />
          </div>
          <h1
            className="text-4xl font-black tracking-tight"
            style={{
              color: "#e3e2e5",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Registro
          </h1>
          <p className="text-base" style={{ color: "#c4c6cf" }}>
            Crea tu cuenta para acceder - Mundial 2026
          </p>
        </div>

        {/* FORM CONTAINER */}
        <div
          className="rounded-lg p-8 shadow-2xl space-y-6"
          style={{
            backgroundColor: "#292a2c",
            border: "1px solid #43474e",
          }}
        >
          {/* ALERTS */}
          {error && (
            <div
              className="p-4 rounded-lg flex gap-3 items-start"
              style={{
                backgroundColor: "rgba(255, 180, 171, 0.1)",
                border: "1px solid #ffb4ab",
              }}
            >
              <AlertCircle
                size={20}
                style={{ color: "#ffb4ab", flexShrink: 0, marginTop: "2px" }}
              />
              <span
                style={{ color: "#ffb4ab" }}
                className="text-sm leading-relaxed"
              >
                {error}
              </span>
            </div>
          )}

          {success && (
            <div
              className="p-4 rounded-lg flex gap-3 items-start"
              style={{
                backgroundColor: "rgba(76, 227, 70, 0.1)",
                border: "1px solid #4ce346",
              }}
            >
              <Check
                size={20}
                style={{ color: "#4ce346", flexShrink: 0, marginTop: "2px" }}
              />
              <span
                style={{ color: "#4ce346" }}
                className="text-sm leading-relaxed"
              >
                {success}
              </span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CREDENCIALES */}
            <div className="space-y-4 pb-6 section-divider border-b">
              <h3 className="text-lg font-bold" style={{ color: "#4ce346" }}>
                Credenciales
              </h3>

              <div>
                <label
                  className="text-sm block mb-2 font-semibold"
                  style={{ color: "#c4c6cf" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                  className="w-full px-4 py-3 text-base rounded transition"
                  style={inputFieldStyle}
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
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                  className="w-full px-4 py-3 text-base rounded transition"
                  style={inputFieldStyle}
                />
              </div>

              <div>
                <label
                  className="text-sm block mb-2 font-semibold"
                  style={{ color: "#c4c6cf" }}
                >
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                  className="w-full px-4 py-3 text-base rounded transition"
                  style={inputFieldStyle}
                />
              </div>
            </div>

            {/* DIRECCIÓN */}
            <div className="space-y-4 pb-6 section-divider border-b">
              <h3 className="text-lg font-bold" style={{ color: "#4ce346" }}>
                Domicilio
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="text-sm block mb-2 font-semibold"
                    style={{ color: "#c4c6cf" }}
                  >
                    País
                  </label>
                  <input
                    type="text"
                    name="paisDir"
                    placeholder="País"
                    value={form.paisDir}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    required
                    className="w-full px-4 py-3 text-base rounded transition"
                    style={inputFieldStyle}
                  />
                </div>
                <div>
                  <label
                    className="text-sm block mb-2 font-semibold"
                    style={{ color: "#c4c6cf" }}
                  >
                    Localidad
                  </label>
                  <input
                    type="text"
                    name="localidad"
                    placeholder="Ciudad"
                    value={form.localidad}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    required
                    className="w-full px-4 py-3 text-base rounded transition"
                    style={inputFieldStyle}
                  />
                </div>
              </div>

              <div>
                <label
                  className="text-sm block mb-2 font-semibold"
                  style={{ color: "#c4c6cf" }}
                >
                  Calle
                </label>
                <input
                  type="text"
                  name="calle"
                  placeholder="Nombre de la calle"
                  value={form.calle}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                  className="w-full px-4 py-3 text-base rounded transition"
                  style={inputFieldStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="text-sm block mb-2 font-semibold"
                    style={{ color: "#c4c6cf" }}
                  >
                    Número
                  </label>
                  <input
                    type="text"
                    name="numeroDir"
                    placeholder="Número"
                    value={form.numeroDir}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    required
                    className="w-full px-4 py-3 text-base rounded transition"
                    style={inputFieldStyle}
                  />
                </div>
                <div>
                  <label
                    className="text-sm block mb-2 font-semibold"
                    style={{ color: "#c4c6cf" }}
                  >
                    Código Postal
                  </label>
                  <input
                    type="text"
                    name="codPostal"
                    placeholder="CP"
                    value={form.codPostal}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    required
                    className="w-full px-4 py-3 text-base rounded transition"
                    style={inputFieldStyle}
                  />
                </div>
              </div>
            </div>

            {/* DOCUMENTO */}
            <div className="space-y-4 pb-6 section-divider border-b">
              <h3 className="text-lg font-bold" style={{ color: "#4ce346" }}>
                Identificación
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="text-sm block mb-2 font-semibold"
                    style={{ color: "#c4c6cf" }}
                  >
                    País del documento
                  </label>
                  <input
                    type="text"
                    name="docPais"
                    placeholder="País"
                    value={form.docPais}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    required
                    className="w-full px-4 py-3 text-base rounded transition"
                    style={inputFieldStyle}
                  />
                </div>
                <div>
                  <label
                    className="text-sm block mb-2 font-semibold"
                    style={{ color: "#c4c6cf" }}
                  >
                    Tipo
                  </label>
                  <select
                    name="docTipo"
                    value={form.docTipo}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    required
                    className="w-full px-4 py-3 text-base rounded transition appearance-none bg-white"
                    style={inputFieldStyle}
                  >
                    <option value="" disabled hidden>
                      CI o Pasaporte
                    </option>
                    <option value="CI">CI</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  className="text-sm block mb-2 font-semibold"
                  style={{ color: "#c4c6cf" }}
                >
                  Número de documento
                </label>
                <input
                  type="text"
                  name="docNumero"
                  placeholder="Número"
                  value={form.docNumero}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                  className="w-full px-4 py-3 text-base rounded transition"
                  style={inputFieldStyle}
                />
              </div>
            </div>

            {/* CONTACTO */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold" style={{ color: "#4ce346" }}>
                Contacto
              </h3>

              <div>
                <label
                  className="text-sm block mb-2 font-semibold"
                  style={{ color: "#c4c6cf" }}
                >
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  placeholder="+598 99 123 456"
                  value={form.telefono}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                  className="w-full px-4 py-3 text-base rounded transition"
                  style={inputFieldStyle}
                />
              </div>
            </div>

            {/* BOTÓN */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded font-bold text-base flex justify-center items-center gap-2 transition duration-200 hover:scale-105 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed mt-6"
              style={{
                backgroundColor: "#4ce346",
                color: "#001f3f",
                height: "56px",
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Registrando...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Crear Cuenta
                </>
              )}
            </button>
          </form>

          {/* LOGIN LINK */}
          <div className="text-center text-sm pt-4">
            <span style={{ color: "#c4c6cf" }}>¿Ya tienes cuenta? </span>
            <Link
              to="/login"
              className="font-bold transition hover:opacity-80"
              style={{ color: "#afc8f0" }}
            >
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
