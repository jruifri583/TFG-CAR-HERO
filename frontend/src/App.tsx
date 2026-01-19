import { Button } from "@/components/ui/button"
import { CardLogin } from "@/components/ui/CardLogin"
import { Label } from "@/components/ui/Label"
import { Input } from "@/components/ui/Input"


const App = () => {
  return (
    <div>
      <CardLogin>
        <Label htmlFor="email">Email*</Label>
        <Input id="email" type="email" placeholder="Enter your email" />
        <Label htmlFor="password">Contraseña*</Label>
        <Input id="password" type="password" placeholder="Crear una contraseña" />
        <Label htmlFor="password">Repite contraseña*</Label>
        <Input id="password" type="password" placeholder="Confirmar contraseña" />
        <Button>Registrarse</Button>
        <Button variant="outline">Registrarse con Google</Button>
      </CardLogin>

    </div>
  )

  
}


export default App