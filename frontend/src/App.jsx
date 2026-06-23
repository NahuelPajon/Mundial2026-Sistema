import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login'; // Importar con minúscula para coincidir con el nombre de archivo exacto
import UserDashboard from './pages/Dashboard';
import Entradas from './pages/Entradas';
import Compras from './pages/Compras';
import Perfil from './pages/Perfil';
import UserLayout from './components/layout/UserLayout';
import { authService } from './services/authService';

// Guardia de ruta protegido con soporte de roles (RBAC)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = authService.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    // Redirige al dashboard raíz que se encargará de enviarlo a su sección correspondiente
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Componente que decide qué Dashboard renderizar según el rol del usuario logueado
const DashboardRedirector = () => {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.rol) {
    case 'Usuario':
      return (
        <UserLayout>
          <UserDashboard />
        </UserLayout>
      );
    case 'Admin':
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-on-surface p-6 text-center">
          <div className="glass-card rounded-xl p-8 max-w-md w-full border border-white/10 space-y-6">
            <h1 className="text-2xl font-bold text-primary">⚽ Panel de Administrador</h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Bienvenido al portal de gestión de sedes, estadios, configuración de sectores y programación de partidos.
            </p>
            <div className="bg-primary-container/10 border border-primary-container/20 rounded-lg p-3 text-xs text-on-surface-variant">
              Rol Activo: <strong>{user.rol}</strong>
            </div>
            <button 
              onClick={() => { authService.logout(); window.location.reload(); }} 
              className="w-full bg-error-container text-on-error-container font-label-bold py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      );
    case 'Funcionario':
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-on-surface p-6 text-center">
          <div className="glass-card rounded-xl p-8 max-w-md w-full border border-white/10 space-y-6">
            <h1 className="text-2xl font-mono font-bold text-tertiary">📱 Consola de Validación</h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Consola optimizada para dispositivos móviles vinculada al legajo del funcionario para escanear y validar accesos QR.
            </p>
            <div className="bg-tertiary-container/10 border border-tertiary-container/20 rounded-lg p-3 text-xs text-on-surface-variant">
              Rol Activo: <strong>{user.rol}</strong>
            </div>
            <button 
              onClick={() => { authService.logout(); window.location.reload(); }} 
              className="w-full bg-error-container text-on-error-container font-label-bold py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      );
    default:
      authService.logout();
      return <Navigate to="/login" replace />;
  }
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* El enrutador de Dashboard redirige automáticamente según el rol */}
        <Route path="/dashboard" element={<DashboardRedirector />} />

        {/* Rutas exclusivas del Usuario (Consumidor) con su respectivo Layout */}
        <Route path="/entradas" element={
          <ProtectedRoute allowedRoles={['Usuario']}>
            <UserLayout>
              <Entradas />
            </UserLayout>
          </ProtectedRoute>
        } />

        <Route path="/compras" element={
          <ProtectedRoute allowedRoles={['Usuario']}>
            <UserLayout>
              <Compras />
            </UserLayout>
          </ProtectedRoute>
        } />

        <Route path="/perfil" element={
          <ProtectedRoute allowedRoles={['Usuario']}>
            <UserLayout>
              <Perfil />
            </UserLayout>
          </ProtectedRoute>
        } />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
