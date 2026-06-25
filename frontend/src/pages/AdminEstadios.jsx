import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Loader2,
  AlertCircle,
  Check,
  ArrowLeftRight,
  Trophy,
  Plus
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
      }
    } catch (err) {
      setError("Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePartido = async (e) => {
    e.preventDefault();

    if (!local || !visita || !fechaHora || !selectedStadium) {
      setError("Completa todos los campos");
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
        sectoresHabilitados: []
      });

      await loadData();

      setLocal("");
      setVisita("");
      setFechaHora("");

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
      <div className="flex justify-center items-center min-h-[60vh] text-on-surface-variant">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-stack-md animate-in fade-in duration-300">

      {/* HEADER */}
      <div className="pt-6">
        <h1 className="text-display-lg-mobile text-primary font-bold">
          Gestión de Partidos
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Crear y administrar encuentros del torneo
        </p>
      </div>

      {/* ALERTAS */}
      {error && (
        <div className="bg-error-container/20 border border-error-container text-error rounded-xl p-4 flex gap-3">
          <AlertCircle size={18} />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-tertiary-container/20 border border-tertiary-container text-tertiary rounded-xl p-4 flex gap-3">
          <Check size={18} />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {/* FORM */}
      <div className="bg-surface-container-low border border-white/5 rounded-xl p-5 space-y-5">

        <div className="flex items-center gap-2 text-primary font-bold">
          <Plus size={18} />
          Crear partido
        </div>

        {/* EQUIPOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">

          <div>
            <label className="text-xs text-on-surface-variant">Local</label>
            <select
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              className="w-full mt-1 p-3 rounded-lg bg-surface-container border border-white/10 text-on-surface focus:border-primary outline-none"
            >
              <option value="">Seleccionar</option>
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
            className="h-[46px] mt-5 flex items-center justify-center rounded-lg bg-surface-container border border-white/10 text-on-surface-variant hover:text-primary transition"
          >
            <ArrowLeftRight size={18} />
          </button>

          <div>
            <label className="text-xs text-on-surface-variant">Visitante</label>
            <select
              value={visita}
              onChange={(e) => setVisita(e.target.value)}
              className="w-full mt-1 p-3 rounded-lg bg-surface-container border border-white/10 text-on-surface focus:border-primary outline-none"
            >
              <option value="">Seleccionar</option>
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
            <label className="text-xs text-on-surface-variant">Fecha</label>
            <input
              type="datetime-local"
              value={fechaHora}
              onChange={(e) => setFechaHora(e.target.value)}
              className="w-full mt-1 p-3 rounded-lg bg-surface-container border border-white/10 text-on-surface focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-on-surface-variant">Estadio</label>
            <select
              value={selectedStadium}
              onChange={(e) => setSelectedStadium(e.target.value)}
              className="w-full mt-1 p-3 rounded-lg bg-surface-container border border-white/10 text-on-surface focus:border-primary outline-none"
            >
              {stadiums.map(s => (
                <option key={s.idEstadio} value={s.idEstadio}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* BOTÓN */}
        <button
          onClick={handleCreatePartido}
          disabled={submitting}
          className="w-full bg-tertiary text-primary-container rounded-lg py-3 font-bold hover:brightness-110 transition flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="animate-spin" size={16} />}
          {submitting ? "Creando..." : "Crear partido"}
        </button>

      </div>

      {/* LISTA */}
      <div className="space-y-3">
        {partidos.map(p => (
          <div
            key={p.id}
            className="bg-surface-container-low border border-white/5 rounded-xl p-4"
          >
            <div className="font-semibold text-on-surface">
              {p.equipoLocal} <span className="text-on-surface-variant">vs</span> {p.equipoVisita}
            </div>

            <div className="text-sm text-on-surface-variant flex items-center gap-2 mt-1">
              <Calendar size={14} />
              {formatDate(p.fechaHora)}
            </div>

            <div className="text-sm text-on-surface-variant flex items-center gap-2">
              <MapPin size={14} />
              {p.estadio}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}