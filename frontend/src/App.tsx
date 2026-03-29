// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { HeaderProvider } from "@/context/HeaderContext";
import MainLayout from "@/components/ui/MainLayout";
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/contacto" element={<ContactoPage />} />
          <Route
            path="/"
            element={
              <HeaderProvider>
                <MainLayout />
              </HeaderProvider>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/nuevo" element={<NuevoUserPage />} />
            <Route path="/vehiculos" element={<VehiculosPage />} />
            <Route path="/vehiculos/:id" element={<VehiculoDetailPage />} />
            <Route
              path="/perfil/:userId/nuevo-vehiculo"
              element={<NuevoVehiculoPage />}
            />
            <Route path="/solicitudes" element={<SolicitudesPage />} />
            <Route path="/solicitudes/:id" element={<SolicitudDetailPage />} />
            <Route
              path="/perfil/:userId/nueva-solicitud"
              element={<NuevaSolicitudPage />}
            />
            <Route path="/historial" element={<HistorialPage />} />
            <Route path="/pagos" element={<PagosPage />} />
            <Route path="/pagos/nuevo" element={<NuevoPagoPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/perfil/:id" element={<PerfilPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
