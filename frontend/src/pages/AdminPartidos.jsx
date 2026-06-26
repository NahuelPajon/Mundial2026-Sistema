import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Loader2,
  AlertCircle,
  Check,
  ArrowLeftRight,
  Trophy
} from "lucide-react";

import { partidoService } from "../services/partidoService";
import { estadioService } from "../services/estadioService";
import { equipoService } from "../services/equipoService";

export default function AdminPartidos() {
  const [partidos, setPartidos] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [equipos, setEquipos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [local, setLocal] = useState("");
  const [visita, setVisita] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [selectedStadium, setSelectedStadium] = useState("");
  const [selectedSectores, setSelectedSectores] = useState([]);
  const [stadiumSectores, setStadiumSectores] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      const [partidosData, stadiumsData, equiposData] = await Promise.all([
        partidoService.getPartidos(),
        estadioService.getAll(),
        equipoService.getAll()
      ]);

      setPartidos(partidosData);
      setStadiums(stadiumsData);
      setEquipos(equiposData);

      if (stadiumsData.length > 0) {
        setSelectedStadium(stadiumsData[0].idEstadio);
        const sectores = stadiumsData[0].sectores || [];
        setStadiumSectores(sectores);
        // Habilitar todos los sectores por defecto
        setSelectedSectores(sectores.map(s => s.codigo));
      }
    } catch {
      setError("Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStadiumChange = (stadiumId) => {
    setSelectedStadium(stadiumId);
    const stadium = stadiums.find(s => s.idEstadio === Number(stadiumId));
    const sectores = stadium?.sectores || [];
    setStadiumSectores(sectores);
    // Habilitar todos los sectores por defecto
    setSelectedSectores(sectores.map(s => s.codigo));
  };

  const handleCreatePartido = async (e) => {
    e.preventDefault();

    if (!local || !visita || !fechaHora || !selectedStadium) {
      setError("Completa todos los campos obligatorios");
      return;
    }

    if (selectedSectores.length === 0) {
      setError("Selecciona al menos un sector");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await partidoService.createPartido({
        fecha: fechaHora,
        estado: "programado",
        idEstadio: Number(selectedStadium),
        idEquipoLocal: Number(local),
        idEquipoVisitante: Number(visita),
        sectoresHabilitados: selectedSectores
      });

      await loadData();

      setLocal("");
      setVisita("");
      setFechaHora("");
      setSelectedSectores([]);

      setSuccessMsg("Partido creado correctamente");
      setTimeout(() => setSuccessMsg(""), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const swapTeams = () => {
    setLocal(visita);
    setVisita(local);
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]" style={{ backgroundColor: "#0d0e11" }}>
        <Loader2 className="animate-spin" size={28} style={{ color: "#4ce346" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 space-y-8">
      <style>{`
        * {
          font-family: 'Montserrat', sans-serif;
        }
        
        .select-field, .input-field {
          font-family: 'Montserrat', sans-serif;
          transition: all 0.2s ease;
        }
        
        .select-field:focus, .input-field:focus {
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15) !important;
        }

        .checkbox-custom:checked {
          accent-color: #4ce346;
        }
      `}</style>

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Trophy size={32} style={{ color: "#4ce346" }} />
        <div>
          <h2 className="text-3xl font-black" style={{ color: "#e3e2e5", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Gestión de Partidos
          </h2>
          <p className="text-base mt-1" style={{ color: "#c4c6cf" }}>
            Crea y administra los encuentros del torneo.
          </p>
        </div>
      </div>

      {/* ALERTAS */}
      {error && (
        <div 
          className="p-4 rounded-lg flex gap-3 items-start"
          style={{ 
            backgroundColor: "rgba(255, 180, 171, 0.1)",
            border: "1px solid #ffb4ab"
          }}
        >
          <AlertCircle size={20} style={{ color: "#ffb4ab", flexShrink: 0 }} />
          <span style={{ color: "#ffb4ab" }} className="text-sm">{error}</span>
        </div>
      )}

      {successMsg && (
        <div 
          className="p-4 rounded-lg flex gap-3 items-start"
          style={{ 
            backgroundColor: "rgba(76, 227, 70, 0.1)",
            border: "1px solid #4ce346"
          }}
        >
          <Check size={20} style={{ color: "#4ce346", flexShrink: 0 }} />
          <span style={{ color: "#4ce346" }} className="text-sm">{successMsg}</span>
        </div>
      )}

      {/* FORM */}
      <div className="rounded-lg p-8 space-y-6 shadow-lg" style={{ backgroundColor: "#292a2c", border: "1px solid #43474e" }}>

        <h3 className="text-lg font-bold" style={{ color: "#4ce346" }}>
          Crear nuevo partido
        </h3>

        {/* EQUIPOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">

          <div>
            <label className="text-sm block mb-2 font-semibold" style={{ color: "#c4c6cf" }}>Equipo local</label>
            <select
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              className="select-field w-full px-4 py-3 rounded text-base"
              style={{ 
                backgroundColor: "#1f2022",
                border: "1px solid #43474e",
                color: "#e3e2e5"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#D4AF37";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#43474e";
              }}
            >
              <option value="">Seleccionar equipo</option>
              {equipos.map(e => (
                <option key={e.idEquipo} value={e.idEquipo}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={swapTeams}
            className="px-4 py-3 rounded transition flex justify-center hover:scale-105"
            style={{ 
              backgroundColor: "#1f2022",
              border: "1px solid #43474e"
            }}
            title="Intercambiar equipos"
          >
            <ArrowLeftRight size={20} style={{ color: "#4ce346" }} />
          </button>

          <div>
            <label className="text-sm block mb-2 font-semibold" style={{ color: "#c4c6cf" }}>Equipo visitante</label>
            <select
              value={visita}
              onChange={(e) => setVisita(e.target.value)}
              className="select-field w-full px-4 py-3 rounded text-base"
              style={{ 
                backgroundColor: "#1f2022",
                border: "1px solid #43474e",
                color: "#e3e2e5"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#D4AF37";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#43474e";
              }}
            >
              <option value="">Seleccionar equipo</option>
              {equipos.map(e => (
                <option key={e.idEquipo} value={e.idEquipo}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* FECHA + ESTADIO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="text-sm block mb-2 font-semibold" style={{ color: "#c4c6cf" }}>Fecha y hora</label>
            <input
              type="datetime-local"
              value={fechaHora}
              onChange={(e) => setFechaHora(e.target.value)}
              className="input-field w-full px-4 py-3 rounded text-base"
              style={{ 
                backgroundColor: "#1f2022",
                border: "1px solid #43474e",
                color: "#e3e2e5"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#D4AF37";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#43474e";
              }}
            />
          </div>

          <div>
            <label className="text-sm block mb-2 font-semibold" style={{ color: "#c4c6cf" }}>Estadio</label>
            <select
              value={selectedStadium}
              onChange={(e) => handleStadiumChange(e.target.value)}
              className="select-field w-full px-4 py-3 rounded text-base"
              style={{ 
                backgroundColor: "#1f2022",
                border: "1px solid #43474e",
                color: "#e3e2e5"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#D4AF37";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#43474e";
              }}
            >
              {stadiums.map(s => (
                <option key={s.idEstadio} value={s.idEstadio}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* SECTORES */}
        {stadiumSectores.length > 0 && (
          <div>
            <label className="text-sm block mb-3 font-semibold" style={{ color: "#c4c6cf" }}>Sectores a habilitar</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-lg" style={{ backgroundColor: "#1f2022", border: "1px solid #43474e" }}>
              {stadiumSectores.map(s => (
                <label key={s.codigo} className="flex items-center gap-3 cursor-pointer hover:text-lime-400 transition px-3 py-2" style={{ color: "#c4c6cf" }}>
                  <input
                    type="checkbox"
                    checked={selectedSectores.includes(s.codigo)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSectores([...selectedSectores, s.codigo]);
                      } else {
                        setSelectedSectores(selectedSectores.filter(c => c !== s.codigo));
                      }
                    }}
                    className="checkbox-custom w-5 h-5 rounded cursor-pointer"
                    style={{ accentColor: "#4ce346" }}
                  />
                  <span className="text-sm font-medium">
                    {s.codigo} ({s.capacidadMaxima})
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* BOTÓN */}
        <button
          onClick={handleCreatePartido}
          disabled={submitting}
          className="w-full py-3 rounded font-bold text-base flex justify-center items-center gap-2 transition duration-200 hover:scale-105 active:scale-98 disabled:opacity-60"
          style={{ 
            backgroundColor: "#4ce346",
            color: "#001f3f",
            height: "56px"
          }}
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Creando...
            </>
          ) : (
            <>
              + Crear partido
            </>
          )}
        </button>
      </div>

      {/* LISTA */}
      <div className="space-y-3">
        {partidos.map(p => (
          <div
            key={p.id}
            className="rounded-lg p-5 flex flex-col md:flex-row md:justify-between md:items-center transition hover:scale-102"
            style={{ 
              backgroundColor: "#292a2c",
              border: "1px solid #43474e"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#4ce346";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(76, 227, 70, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#43474e";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div>
              <div className="font-bold text-lg" style={{ color: "#e3e2e5" }}>
                {p.equipoLocal} <span style={{ color: "#8e9198" }}>VS</span> {p.equipoVisita}
              </div>

              <div className="text-sm flex items-center gap-2 mt-2" style={{ color: "#c4c6cf" }}>
                <Calendar size={16} />
                {formatDate(p.fechaHora)}
              </div>

              <div className="text-sm flex items-center gap-2" style={{ color: "#c4c6cf" }}>
                <MapPin size={16} />
                {p.estadio}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}