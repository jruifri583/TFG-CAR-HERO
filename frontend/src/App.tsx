// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import DashboardPage from "./pages/Dashboard";

function App() {
  return (
    // El AuthProvider DEBE envolver al Router
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Protegidas */}
          <Route path="/dashboard" element={<DashboardPage />}>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App