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
    telefono: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
        telefonos: [form.telefono]
      });

      setSuccess("Usuario registrado correctamente. Redirigiendo...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-8 space-y-2">
          <div className="flex justify-center">
            <UserPlus className="text-lime-400" size={32} />
          </div>
          <h1 className="text-3xl font-bold">Registro - Mundial 2026</h1>
          <p className="text-sm text-gray-400">Crea tu cuenta para acceder</p>
        </div>

        {/* FORM CONTAINER */}
        <div className="bg-[#111a2e] border border-gray-700 rounded-xl p-8 shadow-2xl space-y-6">
          
          {/* ALERTS */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-lg flex gap-2">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-lime-500/10 border border-lime-500/30 text-lime-300 p-3 rounded-lg flex gap-2">
              <Check size={18} className="flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* CREDENCIALES */}
            <div className="space-y-4 pb-4 border-b border-gray-700">
              <h3 className="text-lime-400 font-semibold">Credenciales</h3>
              
              <div>
                <label className="text-sm text-gray-400 block mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-400 outline-none transition"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-400 outline-none transition"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Confirmar contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-400 outline-none transition"
                />
              </div>
            </div>

            {/* DIRECCIÓN */}
            <div className="space-y-4 pb-4 border-b border-gray-700">
              <h3 className="text-lime-400 font-semibold">Domicilio</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">País</label>
                  <input
                    type="text"
                    name="paisDir"
                    placeholder="País"
                    value={form.paisDir}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-400 outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Localidad</label>
                  <input
                    type="text"
                    name="localidad"
                    placeholder="Ciudad"
                    value={form.localidad}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-400 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Calle</label>
                <input
                  type="text"
                  name="calle"
                  placeholder="Nombre de la calle"
                  value={form.calle}
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-400 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Número</label>
                  <input
                    type="text"
                    name="numeroDir"
                    placeholder="Número"
                    value={form.numeroDir}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-400 outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Código Postal</label>
                  <input
                    type="text"
                    name="codPostal"
                    placeholder="CP"
                    value={form.codPostal}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-400 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* DOCUMENTO */}
            <div className="space-y-4 pb-4 border-b border-gray-700">
              <h3 className="text-lime-400 font-semibold">Identificación</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">País del documento</label>
                  <input
                    type="text"
                    name="docPais"
                    placeholder="País"
                    value={form.docPais}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-400 outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Tipo</label>
                  <input
                    type="text"
                    name="docTipo"
                    placeholder="CI, Pasaporte..."
                    value={form.docTipo}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-400 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Número de documento</label>
                <input
                  type="text"
                  name="docNumero"
                  placeholder="Número"
                  value={form.docNumero}
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-400 outline-none transition"
                />
              </div>
            </div>

            {/* CONTACTO */}
            <div className="space-y-4">
              <h3 className="text-lime-400 font-semibold">Contacto</h3>
              
              <div>
                <label className="text-sm text-gray-400 block mb-2">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  placeholder="+598 99 123 456"
                  value={form.telefono}
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-400 outline-none transition"
                />
              </div>
            </div>

            {/* BOTÓN */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg border border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black transition font-semibold flex justify-center items-center gap-2 disabled:opacity-50 mt-6"
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
            <span className="text-gray-400">¿Ya tienes cuenta? </span>
            <Link
              to="/login"
              className="text-lime-400 font-semibold hover:text-lime-300 transition"
            >
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}