import { Link } from "react-router-dom"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink
} from "@/components/ui/navigation-menu"

<NavigationMenu>
  <NavigationMenuItem>
    <NavigationMenuLink asChild>
      <Link to="/dashboard/users">
        Usuarios
      </Link>
    </NavigationMenuLink>
  </NavigationMenuItem>
</NavigationMenu>
