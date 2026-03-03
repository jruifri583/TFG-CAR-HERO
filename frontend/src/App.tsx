// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import MainLayout from "@/components/ui/MainLayout";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import DashboardPage from "@/pages/Dashboard";
import UsersPage from "@/pages/Users";
import VehiculosPage from "@/pages/Vehiculos";
import SolicitudesPage from "@/pages/Solicitudes";
import HistorialPage from "@/pages/Historial";
import PagosPage from "@/pages/Pagos";
import PagoDetailPage from "@/pages/PagoDetail";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<MainLayout />}>
            {/* Protegidas */}
            <Route path="/dashboard" element={<DashboardPage />}></Route>
            <Route path="/users" element={<UsersPage />}></Route>
            <Route path="/vehiculos" element={<VehiculosPage />}></Route>
            <Route path="/solicitudes" element={<SolicitudesPage />}></Route>
            <Route path="/historial" element={<HistorialPage />}></Route>
            <Route path="/pagos" element={<PagosPage />}></Route>
            <Route path="/pagos/:id" element={<PagoDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
