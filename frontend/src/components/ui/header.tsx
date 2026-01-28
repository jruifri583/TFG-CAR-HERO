
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="h-64 bg-white px-6 flex  justify-between shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {<Avatar>
            <AvatarImage src="/default_user.png" />
            <AvatarFallback>CR</AvatarFallback>
          </Avatar>}
          <span className="text-sm">
            Hola <strong>Carlos</strong>
          </span>
        </div>
        <div>
        <Button size="sm">
          Ver perfil
        </Button>
        </div>
      </div>
    </header>
  );
}
