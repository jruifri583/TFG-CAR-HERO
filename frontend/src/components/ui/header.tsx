import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/useAuth";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="h-45 flex flex-col relative">
      <div className="h-full w-full bg-gradiente">
        <div className=" flex gap-3 absolute top-1/2 right-0 -translate-y-1/2 -translate-x-1/8">
          <div className="flex flex-col self-center gap-3">
            <span className="text-4xl">
              Hola <strong>{user ? user.nombre : "Invitado"}</strong>
            </span>
            <Button asChild>
              <NavLink to="/perfil">Ver perfil</NavLink>
            </Button>
          </div>
          {
            <Avatar className="size-40 border-4 border-white rounded-full">
              <AvatarImage src="/default_user.png" />
              <AvatarFallback>CR</AvatarFallback>
            </Avatar>
          }
        </div>
      </div>
      <div className="bg-background h-full w-full"></div>
    </header>
  );
}
