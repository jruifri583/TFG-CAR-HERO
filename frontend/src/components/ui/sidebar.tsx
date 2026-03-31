import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/context/useAuth";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import {
  Users,
  Car,
  FileText,
  CreditCard,
  History,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth(); // ← IMPORTANTE: obtenemos el usuario
  const [contadores, setContadores] = useState<
    Record<string, number | undefined>
  >({});
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const RUTA_CONTADOR: Record<string, string> = {
    "/solicitudes": "solicitudes",
    "/users": "usuarios",
    "/vehiculos": "vehiculos",
    "/pagos": "pagos",
    "/historial": "historial",
  };

  // 🔥 Menú base con iconos y rutas
  const fullMenu = [
    {
      key: "Solicitudes",
      label: "Solicitudes",
      icon: FileText,
      to: "/solicitudes",
      badge: contadores.solicitudes,
    },
    {
      key: "Usuarios",
      label: "Usuarios",
      icon: Users,
      to: "/users",
      badge: contadores.usuarios,
    },
    {
      key: "Vehículos",
      label: "Vehículos",
      icon: Car,
      to: "/vehiculos",
      badge: contadores.vehiculos,
    },
    {
      key: "Pagos",
      label: "Pagos",
      icon: CreditCard,
      to: "/pagos",
      badge: contadores.pagos,
    },
    {
      key: "Historial",
      label: "Historial",
      icon: History,
      to: "/historial",
      badge: contadores.historial,
    },
  ];

  // 🔥 Qué ve cada rol
  const menuByRole: Record<string, string[]> = {
    administrador: [
      "Solicitudes",
      "Usuarios",
      "Vehículos",
      "Pagos",
      "Historial",
    ],
    empleado: ["Solicitudes", "Historial"],
    cliente: ["Solicitudes", "Vehículos", "Historial"],
  };

  // 🔥 Filtrar menú según rol
  const role = user?.rol?.slug ?? "";
  const allowedKeys = menuByRole[role] ?? [];
  const menu = fullMenu.filter((item) => allowedKeys.includes(item.key));

  // ------------------------------
  // CONTADORES Y RESPONSIVE
  // ------------------------------

  useEffect(() => {
    const desde = localStorage.getItem("last_login");
    api
      .get("/contadores", { params: { desde } })
      .then((res) => setContadores(res.data));
  }, []);

  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const key = RUTA_CONTADOR[location.pathname];
    if (key) {
      setContadores((prev) => ({ ...prev, [key]: 0 }));
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside
      className={`bg-primary text-white flex flex-col h-screen transition-all duration-300 ${
        collapsed ? "w-16" : "w-70"
      }`}
    >
      {/* Logo */}
      <NavLink to="/dashboard">
        <div
          className={`bg-[url('/logo.png')] bg-no-repeat bg-center bg-contain mb-6 transition-all duration-300 ${
            collapsed ? "w-16 h-16 mt-4" : "w-70 h-70"
          }`}
        />
      </NavLink>

      {/* Menú principal */}
      <nav className="px-2 space-y-2">
        {menu.map(({ label, icon: Icon, to, badge }) => (
          <NavLink
            key={label}
            to={to}
            className="relative flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent"
          >
            <div className="relative shrink-0">
              <Icon size={20} />
              {collapsed && badge != null && badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full leading-none">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </div>

            {!collapsed && (
              <>
                <span className="flex-1 text-sm">{label}</span>
                {badge != null && badge > 0 && (
                  <span className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="mt-auto px-2 py-4 border-t border-blue-600">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-left"
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span className="text-sm">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
