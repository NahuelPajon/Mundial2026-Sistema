import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Map, 
  Award, 
  Users, 
  ChevronRight, 
  Loader2, 
  AlertCircle 
} from "lucide-react";
import { adminService } from "../services/adminService";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [topMatches, setTopMatches] = useState([]);
  const [topBuyers, setTopBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [statsData, topMatchesData, topBuyersData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getTopMatches(),
        adminService.getTopBuyers()
      ]);
      
      setStats(statsData);
      setTopMatches(topMatchesData);
      setTopBuyers(topBuyersData);
    } catch (err) {
      console.error(err);
      setError("Error al cargar la información del panel del administrador.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (value) => {
    if (value >= 1.0e+9) return `$${(value / 1.0e+9).toFixed(1)}B`;
    if (value >= 1.0e+6) return `$${(value / 1.0e+6).toFixed(1)}M`;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-on-surface">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-on-surface-variant font-label-bold">Cargando panel del administrador...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-container/20 border border-error-container text-error rounded-xl p-6 flex flex-col items-center gap-4 max-w-lg mx-auto mt-12 text-center">
        <AlertCircle size={48} className="text-error" />
        <div>
          <h3 className="font-headline-sm">Error en la carga</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <button 
          onClick={loadData}
          className="bg-error text-on-error px-6 py-2.5 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-stack-md animate-in fade-in duration-500">
      
      {/* Welcome Section */}
      <section className="pt-6">
        <div className="flex flex-col gap-1 text-left">
          <p className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-widest text-[10px]">
            Sede Principal Administrador
          </p>
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">
            Resumen General
          </h1>
        </div>
      </section>

      {/* Summary Statistics Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Total Tickets */}
        <div className="glass-card p-5 rounded-xl flex flex-col justify-between h-40 relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
          <div className="absolute -right-4 -top-4 opacity-5 text-on-surface group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <span className="material-symbols-outlined text-[120px]">confirmation_number</span>
          </div>
          <div>
            <p className="font-label-bold text-xs text-on-surface-variant uppercase tracking-wide">Total Tickets Sold</p>
            <h2 className="font-display-lg-mobile text-3xl text-primary font-extrabold mt-2">
              {stats?.totalTicketsSold ? new Intl.NumberFormat("es-ES").format(stats.totalTicketsSold) : "0"}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 mt-auto">
            <TrendingUp className="text-tertiary" size={16} />
            <p className="text-tertiary font-data-mono text-xs">+{stats?.trendingPercent}% vs last week</p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="glass-card p-5 rounded-xl flex flex-col justify-between h-40 border-l-4 border-tertiary relative overflow-hidden group hover:border-white/10 transition-all duration-300">
          <div>
            <p className="font-label-bold text-xs text-on-surface-variant uppercase tracking-wide">Total Revenue (5% Comm.)</p>
            <h2 className="font-display-lg-mobile text-3xl text-white font-extrabold mt-2">
              {formatCurrency(stats?.totalRevenue || 0)}
            </h2>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <p className="text-on-surface-variant font-data-mono text-xs">
              Comm: {formatCurrency((stats?.totalRevenue || 0) * (stats?.commRate || 0.05))}
            </p>
            <DollarSign className="text-primary group-hover:scale-110 transition-transform" size={18} />
          </div>
        </div>

        {/* Active Stadiums */}
        <div className="glass-card p-5 rounded-xl flex flex-col justify-between h-40 relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
          <div>
            <p className="font-label-bold text-xs text-on-surface-variant uppercase tracking-wide">Active Stadiums</p>
            <div className="flex items-baseline gap-2 mt-2">
              <h2 className="font-display-lg-mobile text-3xl text-primary font-extrabold">
                {stats?.activeStadiums || 0}
              </h2>
              <span className="text-on-surface-variant font-body-md text-sm">
                / {stats?.totalStadiums || 0} Operating
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-auto">
            <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></div>
            <p className="text-tertiary font-label-bold text-xs uppercase tracking-wider">{stats?.statusMessage}</p>
          </div>
        </div>
      </section>

      {/* Main Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-md">
        
        {/* Sales Chart Representation */}
        <section className="glass-card p-6 rounded-xl space-y-6 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-headline-sm text-base md:text-lg text-white font-bold">Partidos con más ventas</h3>
            <button 
              onClick={() => navigate("/partidos")}
              className="text-primary font-label-bold text-xs hover:underline flex items-center gap-1"
            >
              Ver todos <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="space-y-6 flex-1 flex flex-col justify-around">
            {topMatches.map((match, index) => {
              // Colores de barra variados para mejor estética premium
              const colors = ["bg-tertiary", "bg-primary", "bg-secondary", "bg-secondary-container"];
              const barColor = colors[index % colors.length];

              return (
                <div key={match.id} className="space-y-2 text-left">
                  <div className="flex justify-between font-label-bold text-sm">
                    <span className="text-on-surface font-semibold">{match.local} vs {match.visita}</span>
                    <span className="text-primary font-mono">{match.capacityPercent}% Capacity</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${barColor} rounded-full transition-all duration-1000`} 
                      style={{ width: `${match.capacityPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-on-surface-variant font-data-mono text-xs">{match.estadio}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Top Buyers Section */}
        <section className="glass-card p-6 rounded-xl space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-headline-sm text-base md:text-lg text-white font-bold">Ranking de Mayores Compradores</h3>
            <Award className="text-primary" size={20} />
          </div>
          
          <div className="space-y-3">
            {topBuyers.map((buyer) => (
              <div 
                key={buyer.id} 
                className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg hover:bg-surface-container transition-all group border border-white/5 hover:border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/40 group-hover:border-tertiary transition-colors bg-primary-container flex items-center justify-center">
                    {buyer.avatar ? (
                      <img 
                        className="w-full h-full object-cover" 
                        alt={buyer.nombre} 
                        src={buyer.avatar} 
                      />
                    ) : (
                      <Users size={20} className="text-primary" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-label-bold text-sm font-semibold text-on-surface">{buyer.nombre}</p>
                    <p className="text-on-surface-variant text-xs">{buyer.ticketsCount} Tickets Adquiridos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-data-mono text-sm text-tertiary font-bold">{formatCurrency(buyer.totalSpent)}</p>
                  <span className="text-[9px] uppercase font-bold text-on-surface-variant/80 tracking-wider">
                    {buyer.tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* System Map/Location Preview */}
      <section className="glass-card rounded-xl overflow-hidden h-64 relative group border border-white/5 hover:border-white/10 transition-all duration-300">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-102 pointer-events-none" 
          style={{ 
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCn35DqhkIhhtnQM1w5HqT-wgbrzRpOPoAf9DCNN2GCK56EMcK5G0xhP8KuQE6LnSDiO4Gc1SXEyMxjd611_XwsCEnH1AnX-0y70LdVPGaDHwdZIbzanArycbgS9Rwq79YCRTlUeHzrK5q4zXz1P4q0vckSMAIG6-_aYiND7ft3ng895wJiUJaiq7jAfKfkCS6wGNA67ncW9ESkMg8WX5OjNZhGZ00cjFICJ4GQjRp2fk7uFmqraBP9YywNk-PTnDqdaqZxsZgzkEE8')` 
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-surface-dim/40 to-transparent z-10"></div>
        
        <div className="absolute bottom-6 left-6 z-20 text-left">
          <h3 className="font-headline-sm text-lg text-white font-bold">Stadium Network Status</h3>
          <p className="text-on-surface-variant font-body-md text-xs mt-1">Live monitoring of all 16 host venues.</p>
        </div>
        
        <div className="absolute top-6 right-6 z-20">
          <button 
            onClick={() => navigate("/estadios")}
            className="bg-tertiary text-primary-container px-6 py-2.5 rounded-full font-label-bold text-sm hover:brightness-105 active:scale-95 transition-all shadow-lg shadow-tertiary/20"
          >
            Check All Stadiums
          </button>
        </div>
      </section>

    </div>
  );
}
