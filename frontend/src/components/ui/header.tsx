import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { useHeader } from "@/context/HeaderContext";
import { useRef } from "react";
import api from "@/lib/axios";

const dominio = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ROUTE_CONFIG: Record<string, { imagen: string; titulo: string }> = {
  "/vehiculos": {
    imagen: dominio + "/avatars/default_car.png",
    titulo: "Vehículos",
  },
  "/historial": {
    imagen: dominio + "/avatars/historial.png",
    titulo: "Historial",
  },
  "/pagos": { imagen: dominio + "/avatars/pagos.png", titulo: "Pagos" },
  "/solicitudes": {
    imagen: dominio + "/avatars/solicitudes.png",
    titulo: "Solicitudes",
  },
  "/users": {
    imagen: dominio + "/avatars/default_user.png",
    titulo: "Usuarios",
  },
  "/mensajes": {
    imagen: dominio + "/avatars/mensajes.png",
    titulo: "Mensajes",
  },
};

export default function Header() {
  const { user, setUser, isEditing } = useAuth();
  const { headerData, onImageChange } = useHeader();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPerfilPage = location.pathname === "/perfil";
  const isDashboard = location.pathname === "/dashboard";

  const routeConfig = Object.entries(ROUTE_CONFIG).find(([path]) =>
    location.pathname.startsWith(path),
  )?.[1];

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("imagen", file);
    try {
      const res = await api.post("/me/imagen", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.user);
    } catch (error) {
      console.error("Error actualizando imagen:", error);
    }
  };

  const handleExternalImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !onImageChange) return;
    onImageChange(file);
  };

  if (headerData) {
    return (
      <header className="h-45 flex flex-col relative">
        <div className="h-full w-full bg-gradiente">
          <div className="flex gap-4 md:gap-6 absolute top-1/2 right-4 md:right-12 -translate-y-1/2">
            <div className="flex flex-col self-center gap-2 md:gap-4 text-right items-end">
              <span className="text-2xl md:text-4xl text-foreground">
                <strong>{headerData.nombre}</strong>
              </span>
              {headerData.matricula && (
                <span className="text-[10px] md:text-sm font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded inline-block mt-1">
                  {headerData.matricula}
                </span>
              )}
              {headerData.subtitulo && (
                <span className="text-xs md:text-sm text-muted-foreground line-clamp-1 max-w-[200px] md:max-w-none">
                  {headerData.subtitulo}
                </span>
              )}
              {headerData.isEditing ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleExternalImageChange}
                  />
                  <Button
                    variant="outline"
                    className="w-50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Cambiar imagen
                  </Button>
                </>
              ) : (
                <div className="h-9" />
              )}
            </div>
            {headerData.imagen ? (
              <Avatar className="size-24 md:size-40 border-2 md:border-4 border-white rounded-full transition-all shadow-sm">
                <AvatarImage src={headerData.imagen} />
                <AvatarFallback className="bg-slate-100 text-blue-900 text-4xl md:text-8xl font-black border-none ring-0">
                  {headerData.avatar || headerData.nombre.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="size-24 md:size-40 border-2 md:border-4 border-white rounded-full bg-slate-100 flex items-center justify-center text-blue-900 text-4xl md:text-8xl font-black shrink-0 transition-all shadow-sm">
                {headerData.avatar || headerData.nombre.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className="bg-background h-full w-full"></div>
      </header>
    );
  }

  // Header rutas con imagen específica
  if (routeConfig && !isDashboard && !isPerfilPage) {
    return (
      <header className="h-45 flex flex-col relative">
        <div className="h-full w-full bg-gradiente">
          <div className="flex gap-4 md:gap-6 absolute top-1/2 right-4 md:right-12 -translate-y-1/2">
            <div className="flex flex-col self-center gap-2 md:gap-4 text-right items-end">
              <span className="text-2xl md:text-4xl text-foreground">
                <strong>{routeConfig.titulo}</strong>
              </span>
              <div className="h-4 md:h-9" />
            </div>
            <Avatar className="size-24 md:size-40 border-2 md:border-4 border-white rounded-full transition-all shadow-sm">
              <AvatarImage src={routeConfig.imagen} />
              <AvatarFallback>--</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="bg-background h-full w-full"></div>
      </header>
    );
  }

  // Header normal usuario (dashboard, perfil propio)
  return (
    <header className="h-45 flex flex-col relative">
      <div className="h-full w-full bg-gradiente">
        <div className="flex gap-4 md:gap-6 absolute top-1/2 right-4 md:right-12 -translate-y-1/2">
          <div className="flex flex-col self-center gap-2 md:gap-4 text-right items-end">
            <span className="text-2xl md:text-4xl text-foreground">
              Hola{" "}
              <strong>
                {user ? user.nombre || user.email.split("@")[0] : ""}
              </strong>
            </span>
            {!isPerfilPage ? (
              <Button asChild className="w-full md:w-50 h-8 md:h-10 text-xs md:text-sm">
                <NavLink to="/perfil">Ver perfil</NavLink>
              </Button>
            ) : isEditing ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <Button
                  variant="outline"
                  className="w-full md:w-50 h-8 md:h-10 text-xs md:text-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Cambiar imagen
                </Button>
              </>
            ) : (
              <div className="h-4 md:h-9" />
            )}
          </div>
          <Avatar className="size-24 md:size-40 border-2 md:border-4 border-white rounded-full transition-all shadow-sm">
            <AvatarImage
              src={user?.imagen ?? dominio + "/avatars/default_user.png"}
            />
            <AvatarFallback>CR</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="bg-background h-full w-full"></div>
    </header>
  );
}
