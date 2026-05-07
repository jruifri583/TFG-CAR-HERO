import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { useHeader } from "@/context/HeaderContext";
import { useRef } from "react";
import api from "@/lib/axios";

const dominio = import.meta.env.VITE_API_URL || "";

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

  const getAvatarFontSize = (text?: string) => {
    if (!text) return "text-3xl md:text-8xl";
    const len = text.length;
    if (len <= 2) return "text-3xl md:text-8xl";
    if (len === 3) return "text-2xl md:text-6xl font-black italic";
    return "text-xl md:text-4xl font-black italic";
  };

  const avatarText = headerData?.avatar || headerData?.nombre?.charAt(0) || "";
  const dynamicFontSize = getAvatarFontSize(avatarText);

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
      <header className="h-40 md:h-56 flex flex-col relative overflow-hidden shrink-0">
        <div className="h-1/2 w-full bg-gradiente" />
        <div className="h-1/2 w-full bg-background" />
        <div className="absolute inset-0 flex items-center justify-end px-4 md:px-12">
          <div className="flex gap-4 md:gap-6 items-center group">
            <div className="flex flex-col gap-1 md:gap-2 text-right items-end -translate-y-4 md:-translate-y-6 relative">
              <span className="text-xl sm:text-2xl md:text-4xl text-foreground font-bold">
                {headerData.nombre}
              </span>
              {headerData.matricula && (
                <span className="text-[10px] md:text-sm font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded inline-block">
                  {headerData.matricula}
                </span>
              )}
              {headerData.subtitulo && (
                <span className="text-[10px] md:text-sm text-muted-foreground line-clamp-1 max-w-[150px] sm:max-w-[250px] md:max-w-none">
                  {headerData.subtitulo}
                </span>
              )}

              {/* Botón absoluto para no desplazar el título */}
              {headerData.isEditing && (
                <div className="absolute top-full right-0 mt-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleExternalImageChange}
                  />
                  <Button
                    variant="outline"
                    className="w-full md:w-50 transition-opacity duration-300 whitespace-nowrap"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Cambiar imagen
                  </Button>
                </div>
              )}
            </div>
            {headerData.imagen ? (
              <Avatar className="size-24 md:size-40 border-2 md:border-4 border-white rounded-full transition-all shadow-md shrink-0">
                <AvatarImage 
                  src={headerData.imagen.startsWith("/avatars/") ? dominio + headerData.imagen : headerData.imagen} 
                  className="object-cover" 
                />
                <AvatarFallback className={`bg-slate-100 text-blue-900 ${dynamicFontSize} font-black`}>
                  {avatarText}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className={`size-24 md:size-40 border-2 md:border-4 border-white rounded-full bg-slate-100 flex items-center justify-center text-blue-900 ${dynamicFontSize} font-black shrink-0 shadow-md`}>
                {avatarText}
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Header rutas con imagen específica
  if (routeConfig && !isDashboard && !isPerfilPage) {
    return (
      <header className="h-40 md:h-56 flex flex-col relative overflow-hidden shrink-0">
        <div className="h-1/2 w-full bg-gradiente" />
        <div className="h-1/2 w-full bg-background" />
        <div className="absolute inset-0 flex items-center justify-end px-4 md:px-12">
          <div className="flex gap-4 md:gap-6 items-center">
            <div className="flex flex-col gap-1 md:gap-2 text-right items-end -translate-y-4 md:-translate-y-6">
              <span className="text-xl sm:text-2xl md:text-4xl text-foreground font-bold">
                {routeConfig.titulo}
              </span>
            </div>
            <Avatar className={`size-24 md:size-40 border-white rounded-full shadow-md shrink-0 ${routeConfig.titulo === 'Mensajes' ? 'border' : 'border-2 md:border-4'}`}>
              <AvatarImage src={routeConfig.imagen} className="object-cover" />
              <AvatarFallback>--</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
    );
  }

  // Header normal usuario (dashboard, perfil propio)
  return (
    <header className="h-40 md:h-56 flex flex-col relative overflow-hidden shrink-0">
      <div className="h-1/2 w-full bg-gradiente" />
      <div className="h-1/2 w-full bg-background" />
      <div className="absolute inset-0 flex items-center justify-end px-4 md:px-12">
        <div className="flex gap-4 md:gap-6 items-center group">
          <div className="flex flex-col gap-1 md:gap-2 text-right items-end -translate-y-4 md:-translate-y-6 relative">
            <span className="text-xl sm:text-2xl md:text-4xl text-foreground">
              Hola <strong>{user ? user.nombre || user.email.split("@")[0] : ""}</strong>
            </span>

            <div className="absolute top-full right-0 mt-3">
              {!isPerfilPage ? (
                <Button asChild className="w-full md:w-50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
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
                    className="w-full md:w-50 transition-opacity duration-300 whitespace-nowrap"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Cambiar imagen
                  </Button>
                </>
              ) : null}
            </div>
          </div>
          <Avatar className="size-24 md:size-40 border-2 md:border-4 border-white rounded-full shadow-md shrink-0">
            <AvatarImage
              src={user?.imagen ?? dominio + "/avatars/default_user.png"}
              className="object-cover"
            />
            <AvatarFallback className="bg-slate-100 text-blue-900 text-3xl md:text-8xl font-black">CR</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
