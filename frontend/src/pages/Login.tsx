import { useState } from 'react';
import { useAuth } from '@/context/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardSinBorde } from "@/components/ui/card"; // Importante importar los componentes

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch {
      alert("Error al iniciar sesión. Revisa tus credenciales.");
    }
  };

  return (
    <div className="grid grid-cols-2 min-h-screen w-full bg-gray-100 ">
      <div className='bg-primary' style={{ backgroundImage: "url('/logo.png') no-repeat center center", backgroundSize: "contain" }}>
      </div>
      <div className="flex items-center justify-center p-8">
     <CardSinBorde className="w-full" >
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Car-Hero</CardTitle>
          <p className="text-center text-sm text-muted-foreground mt-2">Bienvenido de nuevo</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="tu@email.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <Button type="submit" className="w-full mt-4">
              Entrar
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <span>¿No tienes cuenta? </span>
            <button 
              onClick={() => navigate('/register')} 
              className="text-primary hover:underline font-medium"
            >
              Regístrate aquí
            </button>
          </div>
        </CardContent>
      </CardSinBorde> 
      </div>
    </div>
      

  );
}