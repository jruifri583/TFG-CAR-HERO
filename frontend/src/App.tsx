// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { HeaderProvider } from "@/context/HeaderContext";
import MainLayout from "@/components/ui/MainLayout";
import ProtectedRoute from "@/components/ui/ProtectedRoute";

import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import DashboardPage from "@/pages/Dashboard";
import UsersPage from "@/pages/Users";
import VehiculosPage from "@/pages/Vehiculos";
import SolicitudesPage from "@/pages/Solicitudes";
import HistorialPage from "@/pages/Historial";
import PagosPage from "@/pages/Pagos";
import PerfilPage from "@/pages/Perfil";
import SolicitudDetailPage from "@/pages/SolicitudDetail";
import VehiculoDetailPage from "@/pages/VehiculoDetail";
import ContactoPage from "@/pages/Contacto";
import NuevoVehiculoPage from "@/pages/NuevoVehiculo";
import NuevaSolicitudPage from "@/pages/NuevaSolicitud";
import NuevoUserPage from "@/pages/NuevoUser";
import NuevoPagoPage from "./pages/NuevoPago";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/contacto" element={<ContactoPage />} />

          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <HeaderProvider>
                <MainLayout />
              </HeaderProvider>
            }
          >
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute
                  roles={["administrador", "empleado", "cliente"]}
                >
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Solo ADMIN */}
            <Route
              path="/users"
              element={
                <ProtectedRoute roles={["administrador"]}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/nuevo"
              element={
                <ProtectedRoute roles={["administrador"]}>
                  <NuevoUserPage />
                </ProtectedRoute>
              }
            />

            {/* ADMIN + CLIENTE */}
            <Route
              path="/vehiculos"
              element={
                <ProtectedRoute roles={["administrador", "cliente"]}>
                  <VehiculosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vehiculos/:id"
              element={
                <ProtectedRoute roles={["administrador", "cliente"]}>
                  <VehiculoDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil/:userId/nuevo-vehiculo"
              element={
                <ProtectedRoute roles={["cliente"]}>
                  <NuevoVehiculoPage />
                </ProtectedRoute>
              }
            />

            {/* ADMIN + EMPLEADO + CLIENTE */}
            <Route
              path="/solicitudes"
              element={
                <ProtectedRoute
                  roles={["administrador", "empleado", "cliente"]}
                >
                  <SolicitudesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/solicitudes/:id"
              element={
                <ProtectedRoute
                  roles={["administrador", "empleado", "cliente"]}
                >
                  <SolicitudDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil/:userId/nueva-solicitud"
              element={
                <ProtectedRoute roles={["cliente"]}>
                  <NuevaSolicitudPage />
                </ProtectedRoute>
              }
            />

            {/* ADMIN + EMPLEADO + CLIENTE */}
            <Route
              path="/historial"
              element={
                <ProtectedRoute
                  roles={["administrador", "empleado", "cliente"]}
                >
                  <HistorialPage />
                </ProtectedRoute>
              }
            />

            {/* Solo ADMIN */}
            <Route
              path="/pagos"
              element={
                <ProtectedRoute roles={["administrador"]}>
                  <PagosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pagos/nuevo"
              element={
                <ProtectedRoute roles={["administrador"]}>
                  <NuevoPagoPage />
                </ProtectedRoute>
              }
            />

            {/* Perfil accesible a todos */}
            <Route
              path="/perfil"
              element={
                <ProtectedRoute
                  roles={["administrador", "empleado", "cliente"]}
                >
                  <PerfilPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil/:id"
              element={
                <ProtectedRoute
                  roles={["administrador", "empleado", "cliente"]}
                >
                  <PerfilPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
