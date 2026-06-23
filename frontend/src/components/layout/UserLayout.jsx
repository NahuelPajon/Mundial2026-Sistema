import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Ticket, ShoppingCart, User, Bell, LogOut } from "lucide-react";
import { authService } from "../../services/authService";

export default function UserLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const user = authService.getCurrentUser();
  
  // Extraer un nombre amigable del email (ej: alejandro.perez@gmail.com -> Alejandro)
  const displayName = user && user.email 
    ? user.email.split("@")[0].split(".")[0].charAt(0).toUpperCase() + user.email.split("@")[0].split(".")[0].slice(1)
    : "Aficionado";

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard
    },
    {
      path: "/entradas",
      label: "Entradas",
      icon: Ticket
    },
    {
      path: "/compras",
      label: "Compras",
      icon: ShoppingCart
    },
    {
      path: "/perfil",
      label: "Perfil",
      icon: User
    }
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md pb-32">
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md text-primary shadow-sm bg-surface-container-low border-b border-white/10 flex items-center justify-between px-margin-mobile h-touch-target">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="font-display-lg-mobile text-display-lg-mobile text-primary tracking-tighter hover:opacity-90">
            FIFA
          </Link>
        </div>
        <div className="flex items-center gap-4 relative">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors active:scale-95 duration-150 text-on-surface-variant hover:text-on-surface">
            <Bell size={20} />
          </button>
          
          {/* Avatar con Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-8 h-8 rounded-full overflow-hidden border border-primary/20 focus:outline-none hover:border-primary/50 transition-colors"
            >
              <img 
                className="w-full h-full object-cover" 
                alt="Avatar" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyFOusqJE6a4mqMxgVwLH2-KdXq27ipQZCVfisEwf8ERybxAHzMib_D8yEva6s04ANYlkwor4zY64qA90lPgIT4PsUmOPaX_j-ypgZ91kTEthyeIz5KD8_c-1HNh0iHJOUN61M_sfAoWSNud-QGxJ8kekJ8ZFq3u2ZOEqT_f-7uWVqjIOY0vKVjM04b0ETr2nPtEl3wDqyB-yBb5TX3nUTYluDeC39GkTEOPeugRczBQ5OQXMKJWkOY6n-f6AjB3Gt7hn9NB6fAREx"
              />
            </button>
            
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-surface-container-high border border-white/10 py-1 z-20 animate-in fade-in slide-in-from-top-1 duration-100">
                  <div className="px-4 py-2 border-b border-white/5">
                    <p className="text-xs text-on-surface-variant">Sesión iniciada como</p>
                    <p className="text-sm font-semibold truncate text-primary">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-error hover:bg-white/5 flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={16} />
                    Cerrar Sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-margin-mobile max-w-5xl mx-auto space-y-stack-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full z-50 rounded-t-xl bg-surface/90 backdrop-blur-lg shadow-[0_-4px_12px_rgba(0,0,0,0.3)] bg-surface-container-highest border-t border-white/5 flex justify-around items-center h-20 pb-safe px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
                isActive 
                  ? "bg-tertiary-container text-on-tertiary-container rounded-full px-4 py-1.5 font-bold" 
                  : "text-on-surface-variant hover:text-on-surface px-4 py-1.5"
              }`}
            >
              <Icon size={20} className={isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"} />
              <span className="font-label-bold text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
