import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { useHeader } from "@/context/HeaderContext";
import { useRef } from "react";
import api from "@/lib/axios";

const ROUTE_CONFIG: Record<string, { imagen: string; titulo: string }> = {
  "/vehiculos": { imagen: "/avatars/default_car.png", titulo: "Vehículos" },
  "/historial": { imagen: "/avatars/historial.png", titulo: "Historial" },
  "/pagos": { imagen: "/avatars/pagos.png", titulo: "Pagos" },
  "/solicitudes": { imagen: "/avatars/solicitudes.png", titulo: "Solicitudes" },
  "/users": { imagen: "/avatars/default_user.png", titulo: "Usuarios" },
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

  // Header con contexto (detalle vehículo o perfil ajeno)
  if (headerData) {
    return (
      <header className="h-45 flex flex-col relative">
        <div className="h-full w-full bg-gradiente">
          <div className="flex gap-3 absolute top-1/2 right-0 -translate-y-1/2 -translate-x-1/8">
            <div className="flex flex-col self-center gap-3">
              <span className="text-4xl">
                <strong>{headerData.nombre}</strong>
              </span>
              {headerData.subtitulo && (
                <span className="text-sm text-muted-foreground">
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
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Cambiar imagen
                  </Button>
                </>
              ) : (
                <div className="h-9" />
              )}
            </div>
            <Avatar className="size-40 border-4 border-white rounded-full">
              <AvatarImage
                src={headerData.imagen ?? "/avatars/default_user.png"}
              />
              <AvatarFallback>VH</AvatarFallback>
            </Avatar>
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
          <div className="flex gap-3 absolute top-1/2 right-0 -translate-y-1/2 -translate-x-1/8">
            <div className="flex flex-col self-center gap-3">
              <span className="text-4xl">
                <strong>{routeConfig.titulo}</strong>
              </span>
              <div className="h-9" />
            </div>
            <Avatar className="size-40 border-4 border-white rounded-full">
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
        <div className="flex gap-3 absolute top-1/2 right-0 -translate-y-1/2 -translate-x-1/8">
          <div className="flex flex-col self-center gap-3">
            <span className="text-4xl">
              Hola{" "}
              <strong>
                {user ? user.nombre || user.email.split("@")[0] : ""}
              </strong>
            </span>
            {!isPerfilPage ? (
              <Button asChild>
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
                  onClick={() => fileInputRef.current?.click()}
                >
                  Cambiar imagen
                </Button>
              </>
            ) : (
              <div className="h-9" />
            )}
          </div>
          <Avatar className="size-40 border-4 border-white rounded-full">
            <AvatarImage src={user?.imagen ?? "/avatars/default_user.png"} />
            <AvatarFallback>CR</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="bg-background h-full w-full"></div>
    </header>
  );
}
