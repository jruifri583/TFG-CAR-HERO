import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { useRef } from "react";
import api from "@/lib/axios";

export default function Header() {
  const { user, setUser, isEditing, setIsEditing } = useAuth();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPerfilPage = location.pathname === "/perfil";

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("imagen", file);
    console.log("imagen:", user?.imagen);

    try {
      const res = await api.post("/me/imagen", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.user);
    } catch (error) {
      console.error("Error actualizando imagen:", error);
    }
  };

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
                  className="w-50"
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
