import { NavLink } from "react-router-dom";
import {
  Users,
  Car,
  FileText,
  ClipboardList,
  RotateCcw,
} from "lucide-react";

const menu = [
  { label: "Usuarios", icon: Users, to: "/users" },
  { label: "Vehículos", icon: Car, to: "/vehiculos"},
  { label: "Solicitudes", icon: FileText, to: "/solicitudes" },
  { label: "Órdenes", icon: ClipboardList, badge: 10 },
  { label: "Historial", icon: RotateCcw },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-primary text-white flex flex-col">
      {/* Logo */}
      <div className="bg-[url('/logo.png')] bg-no-repeat bg-center bg-contain w-64 h-64 mb-6"></div>

      {/* Menu */}
      <nav className="flex-1 px-4 space-y-2">
        {menu.map(({ label, icon: Icon, to = "#", badge }) => (
          <NavLink
            key={label}
            to={to}
            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-blue-500"
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

      {/* Footer */}
      <div className="p-4 border-t border-blue-500 text-sm">
        Carlos Ruiz
      </div>
    </aside>
  );
}
