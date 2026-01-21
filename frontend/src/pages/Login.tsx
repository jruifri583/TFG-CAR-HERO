import { useState,useEffect } from 'react';
import { useAuth } from '@/context/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardHeader, CardTitle, CardSinBorde } from "@/components/ui/card"; // Importante importar los componentes

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

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  if (token) {
    localStorage.setItem("token", token);
    window.history.replaceState({}, document.title, "/"); // limpia query
    navigate("/dashboard");
  }
}, [navigate]);


  return (
    <div className="grid grid-cols-2 min-h-screen w-full ">
      <div className="bg-primary bg-[url('/logo.png')] bg-no-repeat bg-center" >
      </div>
      <div className="flex flex-col items-center justify-center p-8">
        <div className="bg-[url('/logoLinea.png')] bg-no-repeat bg-center bg-contain w-100 h-40 mb-6" ></div>
     <CardSinBorde className="w-full max-w-md mx-auto" >
        <CardHeader>
          <CardTitle className="text-3xl font-bold ">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Introduce tu email"
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
                placeholder="Introduce tu contraseña"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <Button type="submit" className="w-full mt-4">
              Entrar
            </Button>
            <Button
            type="button"
              onClick={() => window.location.href = "http://localhost:4000/api/auth/google"}
                className="w-full mt-4 bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 flex items-center justify-center gap-2"
                  >
                <div className="bg-[url('/google.png')] w-6 h-6 bg-center bg-contain bg-no-repeat" />
                  Continuar con Google
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