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
      <div className="flex justify-center items-center min-h-[60vh] bg-[#0b1220] text-white">
        <Loader2 className="animate-spin text-lime-400" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-white px-6 py-8 space-y-8">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Trophy className="text-lime-400" />
        <div>
          <h2 className="text-2xl font-bold">Gestión de Partidos</h2>
          <p className="text-sm text-gray-400">
            Crea y administra los encuentros del torneo.
          </p>
        </div>
      </div>

      {/* ALERTAS */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-lg flex gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-lime-500/10 border border-lime-500/30 text-lime-300 p-3 rounded-lg flex gap-2">
          <Check size={18} />
          {successMsg}
        </div>
      )}

      {/* FORM */}
      <div className="bg-[#111a2e] border border-gray-700 rounded-xl p-6 space-y-5 shadow-lg">

        <h3 className="text-lime-400 font-semibold text-lg">
          Crear nuevo partido
        </h3>

        {/* EQUIPOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">

          <div>
            <label className="text-sm text-gray-400">Equipo local</label>
            <select
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              className="w-full mt-1 p-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white focus:border-lime-400 outline-none"
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
            className="p-3 border border-gray-700 rounded-lg bg-[#0b1220] hover:border-lime-400 transition flex justify-center"
          >
            <ArrowLeftRight className="text-lime-400" />
          </button>

          <div>
            <label className="text-sm text-gray-400">Equipo visitante</label>
            <select
              value={visita}
              onChange={(e) => setVisita(e.target.value)}
              className="w-full mt-1 p-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white focus:border-lime-400 outline-none"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          <div>
            <label className="text-sm text-gray-400">Fecha y hora</label>
            <input
              type="datetime-local"
              value={fechaHora}
              onChange={(e) => setFechaHora(e.target.value)}
              className="w-full mt-1 p-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white focus:border-lime-400 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Estadio</label>
            <select
              value={selectedStadium}
              onChange={(e) => handleStadiumChange(e.target.value)}
              className="w-full mt-1 p-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white focus:border-lime-400 outline-none"
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
            <label className="text-sm text-gray-400">Sectores a habilitar</label>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 bg-[#0a0f1a] p-4 rounded-lg border border-gray-700">
              {stadiumSectores.map(s => (
                <label key={s.codigo} className="flex items-center gap-2 cursor-pointer hover:text-lime-400 transition">
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
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-sm">
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
          className="w-full py-3 rounded-lg border border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black transition flex justify-center items-center gap-2"
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
            className="bg-[#111a2e] border border-gray-700 rounded-xl p-4 flex flex-col md:flex-row md:justify-between md:items-center hover:border-lime-400 transition"
          >
            <div>
              <div className="font-semibold text-lg">
                {p.equipoLocal} <span className="text-gray-500">VS</span> {p.equipoVisita}
              </div>

              <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                <Calendar size={14} />
                {formatDate(p.fechaHora)}
              </div>

              <div className="text-sm text-gray-400 flex items-center gap-2">
                <MapPin size={14} />
                {p.estadio}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}