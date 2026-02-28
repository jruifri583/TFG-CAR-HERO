import { useAuth } from "@/context/useAuth";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Users,
  Car,
  FileText,
  ClipboardList,
  History,
  LogOut,
} from "lucide-react";

const menu = [
  { label: "Solicitudes", icon: FileText, to: "/solicitudes" },
  { label: "Usuarios", icon: Users, to: "/users" },
  { label: "Vehículos", icon: Car, to: "/vehiculos" },
  { label: "Pagos", icon: ClipboardList, to: "/pagos", badge: 10 },
  { label: "Historial", icon: History, to: "/historial" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    console.log("Token actual:", token);
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-70 bg-primary text-white flex flex-col h-screen">
      {/* Logo */}
      <div className="bg-[url('/logo.png')] bg-no-repeat bg-center bg-contain w-70 h-70 mb-6" />

      {/* Menú principal */}
      <nav className="px-4 space-y-2">
        {menu.map(({ label, icon: Icon, to = "#", badge }) => (
          <NavLink
            key={label}
            to={to}
            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-accent"
          >
            <div className="flex items-center gap-3">
              <Icon size={18} />
              <span>{label}</span>
            </div>
            {badge && (
              <span className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="mt-auto px-4 py-4 border-t border-blue-600">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-left"
        >
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
