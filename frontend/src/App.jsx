import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Register from './pages/Register';
import UserDashboard from './pages/Dashboard';
import Entradas from './pages/Entradas';
import Compras from './pages/Compras';
import ComprarEntradas from './pages/ComprarEntradas';
import Perfil from './pages/Perfil';
import ConsolaValidacion from './pages/ConsolaValidacion';
import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminEstadios from './pages/AdminEstadios';
import AdminPartidos from './pages/AdminPartidos';
import { authService } from './services/authService';

// Guardia de ruta protegido con soporte de roles (RBAC)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
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
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      );

    case 'Funcionario':
      return <ConsolaValidacion />;

    default:
      authService.logout();
      return <Navigate to="/login" replace />;
  }
};

// Componente que decide qué Layout usar para el perfil según el rol del usuario
const ProfileLayoutRedirector = () => {
  const user = authService.getCurrentUser();

  if (user?.rol === 'Admin') {
    return (
      <AdminLayout>
        <Perfil />
      </AdminLayout>
    );
  }

  return (
    <UserLayout>
      <Perfil />
    </UserLayout>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Redirección raíz */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Registro */}
        <Route path="/register" element={<Register />} />

        {/* Dashboard según rol */}
        <Route path="/dashboard" element={<DashboardRedirector />} />

        {/* Rutas exclusivas del Usuario */}
        <Route
          path="/entradas"
          element={
            <ProtectedRoute allowedRoles={['Usuario']}>
              <UserLayout>
                <Entradas />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/compras"
          element={
            <ProtectedRoute allowedRoles={['Usuario']}>
              <UserLayout>
                <Compras />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute allowedRoles={['Usuario', 'Admin']}>
              <ProfileLayoutRedirector />
            </ProtectedRoute>
          }
        />

        {/* Rutas exclusivas del Administrador */}
        <Route
          path="/estadios"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout>
                <AdminEstadios />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/partidos"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout>
                <AdminPartidos />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Cualquier ruta inexistente */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
}