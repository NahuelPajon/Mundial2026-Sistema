import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  X,
  Tag,
} from "lucide-react";
import { eventoService } from "../services/eventoService";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatFecha = (fechaStr) => {
  const d = new Date(fechaStr);
  return d.toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const estadoBadge = (estado) => {
  switch (estado?.toLowerCase()) {
    case "programado":
      return (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
          Programado
        </span>
      );
    case "en_curso":
      return (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 animate-pulse">
          En curso
        </span>
      );
    case "finalizado":
      return (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-on-surface-variant">
          Finalizado
        </span>
      );
    case "cancelado":
      return (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-error/20 text-error">
          Cancelado
        </span>
      );
    default:
      return (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-on-surface-variant">
          {estado}
        </span>
      );
  }
};

const esComprable = (estado) =>
  ["programado", "en_curso"].includes(estado?.toLowerCase());

// ─── Componente Principal ───────────────────────────────────────────────────

export default function ComprarEntradas() {
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────────────────────
  const [eventos, setEventos] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [errorEventos, setErrorEventos] = useState("");

  const [tasaComision, setTasaComision] = useState(null);

  // Evento seleccionado para ver detalle / comprar
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  // Carrito: [{ idEvento, codigoSector, nombreEvento, nombreSector, costo }]
  const [carrito, setCarrito] = useState([]);

  // Modal de confirmación
  const [modalOpen, setModalOpen] = useState(false);
  const [comprando, setComprando] = useState(false);
  const [compraExitosa, setCompraExitosa] = useState(null); // resultado

  const MAX_ENTRADAS = 5;

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoadingEventos(true);
        const [evts, tasa] = await Promise.all([
          eventoService.getAll(),
          eventoService.getTasaComision().catch(() => null),
        ]);
        setEventos(evts);
        setTasaComision(tasa);
      } catch (err) {
        setErrorEventos(err.message || "Error al cargar los eventos.");
      } finally {
        setLoadingEventos(false);
      }
    };
    cargar();
  }, []);

  // ── Carrito ────────────────────────────────────────────────────────────────
  const agregarAlCarrito = (evento, codigoSector, costoSector) => {
    if (carrito.length >= MAX_ENTRADAS) return;

    setCarrito((prev) => [
      ...prev,
      {
        idEvento: evento.idEvento,
        codigoSector,
        nombreEvento: `${evento.equipoLocalNombre} vs ${evento.equipoVisitanteNombre}`,
        estadioNombre: evento.estadioNombre,
        costo: costoSector,
        key: `${evento.idEvento}-${codigoSector}-${Date.now()}`,
      },
    ]);
  };

  const quitarDelCarrito = (key) => {
    setCarrito((prev) => prev.filter((i) => i.key !== key));
  };

  const subtotal = carrito.reduce((s, i) => s + i.costo, 0);
  const comisionPct = tasaComision?.porcentaje ?? 5;
  const comision = subtotal * (comisionPct / 100);
  const total = subtotal + comision;

  // ── Compra ─────────────────────────────────────────────────────────────────
  const confirmarCompra = async () => {
    try {
      setComprando(true);
      const payload = carrito.map((i) => ({
        idEvento: i.idEvento,
        codigoSector: i.codigoSector,
      }));
      const resultado = await eventoService.comprar(payload);
      setCompraExitosa(resultado);
      setCarrito([]);
    } catch (err) {
      setCompraExitosa({ error: err.message });
    } finally {
      setComprando(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loadingEventos) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant gap-3">
        <Loader2 className="animate-spin" size={32} />
        <p>Cargando eventos disponibles…</p>
      </div>
    );
  }

  if (errorEventos) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-error gap-3">
        <AlertCircle size={32} />
        <p>{errorEventos}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-surface-container-high rounded-lg text-sm hover:bg-white/10 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-stack-lg">
      {/* ── Encabezado ── */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Comprar Entradas</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Seleccioná un evento y elegí tu sector
        </p>
      </div>

      {/* ── Carrito flotante (si hay items) ── */}
      {carrito.length > 0 && (
        <div className="sticky top-20 z-30 bg-surface-container-highest border border-primary/30 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <ShoppingCart size={18} />
              <span>
                Mi carrito ({carrito.length}/{MAX_ENTRADAS})
              </span>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs bg-primary text-on-primary px-3 py-1.5 rounded-full font-bold hover:opacity-90 active:scale-95 transition-all"
            >
              Ver resumen →
            </button>
          </div>

          {/* Items compactos */}
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {carrito.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between text-xs bg-surface-container p-2 rounded-lg"
              >
                <span className="truncate text-on-surface">
                  {item.nombreEvento} — Sector{" "}
                  <strong>{item.codigoSector}</strong>
                </span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-primary font-semibold">
                    ${item.costo.toFixed(2)}
                  </span>
                  <button
                    onClick={() => quitarDelCarrito(item.key)}
                    className="text-error hover:opacity-80"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-sm font-semibold border-t border-white/10 pt-2">
            <span className="text-on-surface-variant">Total estimado</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* ── Lista de Eventos ── */}
      <div className="space-y-4">
        {eventos.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant">
            <Calendar size={40} className="mx-auto mb-3 opacity-40" />
            <p>No hay eventos disponibles en este momento.</p>
          </div>
        ) : (
          eventos.map((evento) => {
            const comprable = esComprable(evento.estado);
            const expandido = eventoSeleccionado?.idEvento === evento.idEvento;

            return (
              <div
                key={evento.idEvento}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  comprable
                    ? "border-white/10 bg-surface-container-low hover:border-white/20"
                    : "border-white/5 bg-surface-container-low opacity-60"
                }`}
              >
                {/* Cabecera del evento */}
                <button
                  className="w-full text-left p-4 flex items-center justify-between gap-4"
                  onClick={() =>
                    comprable &&
                    setEventoSeleccionado(expandido ? null : evento)
                  }
                  disabled={!comprable}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {estadoBadge(evento.estado)}
                      {!comprable && (
                        <span className="text-xs text-on-surface-variant">
                          No disponible para compra
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-on-surface text-base leading-tight">
                      {evento.equipoLocalNombre}{" "}
                      <span className="text-on-surface-variant font-normal">
                        vs
                      </span>{" "}
                      {evento.equipoVisitanteNombre}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-on-surface-variant flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatFecha(evento.fecha)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {evento.estadioNombre}
                      </span>
                    </div>
                  </div>
                  {comprable && (
                    <ChevronRight
                      size={20}
                      className={`text-on-surface-variant shrink-0 transition-transform duration-200 ${
                        expandido ? "rotate-90" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Panel de sectores (expandido) */}
                {expandido && comprable && (
                  <div className="border-t border-white/10 px-4 pb-4 pt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-3">
                      Sectores habilitados
                    </p>

                    {evento.sectoresHabilitados.length === 0 ? (
                      <p className="text-sm text-on-surface-variant text-center py-4">
                        No hay sectores habilitados para este evento.
                      </p>
                    ) : (
                      <SectoresEvento
                        evento={evento}
                        carrito={carrito}
                        onAgregar={agregarAlCarrito}
                        onQuitar={quitarDelCarrito}
                        maxEntradas={MAX_ENTRADAS}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Modal de Confirmación ── */}
      {modalOpen && (
        <ModalConfirmacion
          carrito={carrito}
          subtotal={subtotal}
          comision={comision}
          total={total}
          comisionPct={comisionPct}
          comprando={comprando}
          compraExitosa={compraExitosa}
          onQuitarItem={quitarDelCarrito}
          onConfirmar={confirmarCompra}
          onCerrar={() => {
            setModalOpen(false);
            if (compraExitosa && !compraExitosa.error) {
              setCompraExitosa(null);
              navigate("/entradas");
            } else {
              setCompraExitosa(null);
            }
          }}
        />
      )}
    </div>
  );
}

// ─── Sub-componente: Sectores de un evento ──────────────────────────────────

function SectoresEvento({ evento, carrito, onAgregar, onQuitar, maxEntradas }) {
  // Para cada sector habilitado necesitamos el costo.
  // El backend devuelve sectoresHabilitados como string[] (códigos).
  // El costo lo pedimos al backend de estadios via endpoint /estadios/:id/sectores,
  // pero para evitar una llamada extra usamos el campo costo del sector si viene
  // en el evento. Como el EventoResponse sólo trae los códigos, hacemos una
  // llamada ligera al endpoint de sectores del estadio.

  const [sectores, setSectores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        // GET /api/estadios/:id — devuelve estadio con sus sectores (costo incluido)
        const { apiFetch } = await import("../services/api");
        const estadio = await apiFetch(`/estadios/${evento.idEstadio}`);
        // Filtrar solo los habilitados para este evento
        const habilitados = estadio.sectores.filter((s) =>
          evento.sectoresHabilitados.includes(s.codigo)
        );
        setSectores(habilitados);
      } catch {
        // Si no hay endpoint de sectores, construir con lo que tenemos (sin costo)
        setSectores(
          evento.sectoresHabilitados.map((cod) => ({
            codigo: cod,
            costo: null,
            capacidadMaxima: null,
            entradasDisponibles: null,
          }))
        );
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [evento]);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="animate-spin text-primary" size={20} />
      </div>
    );
  }

  const itemsEnCarritoParaEvento = carrito.filter(
    (i) => i.idEvento === evento.idEvento
  );

  return (
    <div className="grid gap-2">
      {sectores.map((sector) => {
        const yaEnCarrito = itemsEnCarritoParaEvento.filter(
          (i) => i.codigoSector === sector.codigo
        );
        const cantidadEnCarrito = yaEnCarrito.length;
        const carritoLleno = carrito.length >= maxEntradas;
        const sinDisponibles =
          sector.entradasDisponibles !== null &&
          sector.entradasDisponibles <= 0;

        return (
          <div
            key={sector.codigo}
            className={`flex items-center justify-between p-3 rounded-xl border ${
              sinDisponibles
                ? "border-white/5 bg-surface-container opacity-50"
                : "border-white/10 bg-surface-container"
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-on-surface">
                  Sector {sector.codigo}
                </span>
                {sinDisponibles && (
                  <span className="text-xs text-error font-semibold">
                    Agotado
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-on-surface-variant">
                {sector.costo !== null ? (
                  <span className="flex items-center gap-1 text-primary font-semibold">
                    <Tag size={11} />${Number(sector.costo).toFixed(2)}
                  </span>
                ) : (
                  <span className="text-on-surface-variant italic text-xs">
                    Precio no disponible
                  </span>
                )}
                {sector.entradasDisponibles !== null && (
                  <span>
                    {sector.entradasDisponibles} disponibles
                  </span>
                )}
              </div>
            </div>

            {/* Controles +/- */}
            {!sinDisponibles && sector.costo !== null && (
              <div className="flex items-center gap-2 shrink-0 ml-3">
                {cantidadEnCarrito > 0 && (
                  <>
                    <button
                      onClick={() => onQuitar(yaEnCarrito[cantidadEnCarrito - 1].key)}
                      className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all"
                    >
                      <Minus size={14} className="text-on-surface" />
                    </button>
                    <span className="text-on-surface font-bold w-4 text-center">
                      {cantidadEnCarrito}
                    </span>
                  </>
                )}
                <button
                  onClick={() =>
                    onAgregar(evento, sector.codigo, Number(sector.costo))
                  }
                  disabled={carritoLleno}
                  className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all ${
                    carritoLleno
                      ? "bg-white/5 text-on-surface-variant cursor-not-allowed"
                      : "bg-primary text-on-primary hover:opacity-90"
                  }`}
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Sub-componente: Modal de confirmación ───────────────────────────────────

function ModalConfirmacion({
  carrito,
  subtotal,
  comision,
  total,
  comisionPct,
  comprando,
  compraExitosa,
  onQuitarItem,
  onConfirmar,
  onCerrar,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!comprando ? onCerrar : undefined}
      />

      <div className="relative w-full sm:max-w-md bg-surface-container-highest rounded-t-3xl sm:rounded-2xl border border-white/10 shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        {/* ── Estado: éxito ── */}
        {compraExitosa && !compraExitosa.error ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2
              size={48}
              className="mx-auto text-green-400"
            />
            <h2 className="text-xl font-bold text-on-surface">
              ¡Compra exitosa!
            </h2>
            <p className="text-on-surface-variant text-sm">
              Tus entradas ya están disponibles en la sección{" "}
              <strong>Mis Entradas</strong>.
            </p>
            <p className="text-xs text-on-surface-variant">
              Compra #{compraExitosa.idVenta} · Total $
              {Number(compraExitosa.montoTotal).toFixed(2)}
            </p>
            <button
              onClick={onCerrar}
              className="w-full mt-2 py-3 bg-primary text-on-primary rounded-2xl font-bold hover:opacity-90 active:scale-95 transition-all"
            >
              Ver mis entradas
            </button>
          </div>
        ) : compraExitosa?.error ? (
          /* ── Estado: error ── */
          <div className="text-center py-6 space-y-3">
            <AlertCircle size={48} className="mx-auto text-error" />
            <h2 className="text-xl font-bold text-on-surface">
              Error en la compra
            </h2>
            <p className="text-sm text-on-surface-variant">
              {compraExitosa.error}
            </p>
            <button
              onClick={onCerrar}
              className="w-full mt-2 py-3 bg-surface-container-high text-on-surface rounded-2xl font-bold hover:bg-white/10 active:scale-95 transition-all"
            >
              Cerrar
            </button>
          </div>
        ) : (
          /* ── Estado: resumen ── */
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-on-surface">
                Confirmar compra
              </h2>
              <button
                onClick={onCerrar}
                disabled={comprando}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-on-surface-variant"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="space-y-2">
              {carrito.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between bg-surface-container p-3 rounded-xl text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-on-surface font-medium truncate">
                      {item.nombreEvento}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {item.estadioNombre} · Sector {item.codigoSector}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span className="text-primary font-semibold">
                      ${item.costo.toFixed(2)}
                    </span>
                    <button
                      onClick={() => onQuitarItem(item.key)}
                      disabled={comprando}
                      className="text-error hover:opacity-80"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desglose de precios */}
            <div className="border-t border-white/10 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Comisión ({comisionPct}%)</span>
                <span>${comision.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-on-surface text-base pt-1 border-t border-white/10">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            {carrito.length >= 5 && (
              <p className="text-xs text-on-surface-variant text-center">
                Máximo de 5 entradas por transacción alcanzado.
              </p>
            )}

            <button
              onClick={onConfirmar}
              disabled={comprando || carrito.length === 0}
              className="w-full py-3.5 bg-primary text-on-primary rounded-2xl font-bold text-base hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {comprando ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Procesando…
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Confirmar compra
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
