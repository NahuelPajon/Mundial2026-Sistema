import React, { useState, useEffect } from "react";
import { User, ShieldCheck, Mail, MapPin, Phone, Award, Loader2, AlertCircle } from "lucide-react";
import { userService } from "../services/userService";
import { authService } from "../services/authService";

export default function Perfil() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = authService.getCurrentUser();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !user.email) {
        setError("No se pudo identificar la sesión activa.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await userService.getProfile(user.email);
        setProfile(data);
      } catch (err) {
        setError(err.message || "Error al cargar la información del perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface">Mi Perfil</h1>
        <p className="text-sm text-on-surface-variant">Revisa tus datos personales y estado de verificación de identidad</p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      )}

      {error && (
        <div className="bg-error-container/20 border border-error-container text-error rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={24} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {!loading && !error && profile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Resumen del Usuario */}
          <div className="md:col-span-1 glass-card rounded-xl p-6 text-center space-y-4 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30 relative">
              <img 
                className="w-full h-full object-cover" 
                alt="Avatar" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyFOusqJE6a4mqMxgVwLH2-KdXq27ipQZCVfisEwf8ERybxAHzMib_D8yEva6s04ANYlkwor4zY64qA90lPgIT4PsUmOPaX_j-ypgZ91kTEthyeIz5KD8_c-1HNh0iHJOUN61M_sfAoWSNud-QGxJ8kekJ8ZFq3u2ZOEqT_f-7uWVqjIOY0vKVjM04b0ETr2nPtEl3wDqyB-yBb5TX3nUTYluDeC39GkTEOPeugRczBQ5OQXMKJWkOY6n-f6AjB3Gt7hn9NB6fAREx"
              />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">
                {profile.email.split("@")[0].split(".")[0].toUpperCase()}
              </h2>
              <p className="text-xs text-on-surface-variant flex items-center justify-center gap-1">
                <Mail size={12} />
                {profile.email}
              </p>
            </div>

            <div className="w-full pt-2">
              {profile.estadoVerificacion === "verificado" ? (
                <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-emerald-500/25">
                  <ShieldCheck size={14} />
                  Identidad Verificada
                </span>
              ) : (
                <span className="bg-amber-500/10 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-amber-500/25">
                  <AlertCircle size={14} />
                  Verificación Pendiente
                </span>
              )}
            </div>
          </div>

          {/* Detalles e Información Personal */}
          <div className="md:col-span-2 space-y-6">
            {/* Sección Documento */}
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <Award size={18} className="text-primary" />
                Documento de Identificación
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">TIPO DE DOCUMENTO</p>
                  <p className="font-semibold text-white">{profile.docTipo}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">NÚMERO DE DOCUMENTO</p>
                  <p className="font-semibold text-white">{profile.docNumero}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">PAÍS EMISOR</p>
                  <p className="font-semibold text-white">{profile.docPais}</p>
                </div>
              </div>
            </div>

            {/* Sección Dirección */}
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <MapPin size={18} className="text-primary" />
                Dirección Declarada
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="sm:col-span-2">
                  <p className="text-xs text-on-surface-variant mb-1">CALLE Y NÚMERO</p>
                  <p className="font-semibold text-white">
                    {profile.calle} {profile.numeroDir}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">CÓDIGO POSTAL</p>
                  <p className="font-semibold text-white">{profile.codPostal}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">LOCALIDAD / CIUDAD</p>
                  <p className="font-semibold text-white">{profile.localidad}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">PAÍS</p>
                  <p className="font-semibold text-white">{profile.paisDir}</p>
                </div>
              </div>
            </div>

            {/* Sección Contacto */}
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <Phone size={18} className="text-primary" />
                Información de Contacto
              </h3>
              <div className="text-sm">
                <p className="text-xs text-on-surface-variant mb-2">TELÉFONOS REGISTRADOS</p>
                {profile.telefonos && profile.telefonos.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.telefonos.map((tel, idx) => (
                      <span key={idx} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg font-semibold text-white text-xs">
                        {tel}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-on-surface-variant text-xs italic">No hay teléfonos registrados</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
