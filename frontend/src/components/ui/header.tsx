
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="h-64 flex flex-col relative">
      
          

        
          <div className="bg-amber-300 h-full w-full">
            {<Avatar className="size-32 absolute top-1/2 right-0 -translate-y-1/2 -translate-x-1/2">
            <AvatarImage src="/default_user.png" />
            <AvatarFallback>CR</AvatarFallback>
          </Avatar>}
          <span className="text-sm">
            Hola <strong>Carlos</strong>
          </span>
        </div>
        <div className="bg-amber-400 h-full w-full">
        <Button size="sm">
          Ver perfil
        </Button>
        </div>
    
    
    </header>
  );
}
