import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardSinBorde, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import axios from "axios";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "", password: "", password_confirmation: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/register", formData);
      alert("Registro completado. Ahora puedes hacer login.");
    } catch (error: unknown) {
  if (axios.isAxiosError(error)) {
    alert(error.response?.data?.message ?? "Error al registrar");
  } else if (error instanceof Error) {
    alert(error.message);
  } else {
    alert("Error inesperado");
  }
    }
  };

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  if (token) {
    localStorage.setItem("token", token);
    window.history.replaceState({}, document.title, "/");
    navigate("/dashboard"); // redirige al dashboard
  }
}, [navigate]);

  return (
    <div className="grid grid-cols-2 min-h-screen w-full ">
      <div className="bg-primary bg-[url('/logo.png')] bg-no-repeat bg-center" >
      </div>
      <div className="flex flex-col items-center justify-center p-8">
        <div className="bg-[url('/logoLinea.png')] bg-no-repeat bg-center bg-contain w-100 h-40 mb-6" ></div>
     <CardSinBorde className="w-full max-w-md mx-auto" >
        <CardHeader><CardTitle className="text-2xl text-center">Crear Cuenta</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <Label>Email</Label>
              <Input type="email" onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-4">
              <Label>Contraseña</Label>
              <Input type="password" onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div className="space-y-4">
              <Label>Confirmar Contraseña</Label>
              <Input type="password" onChange={e => setFormData({...formData, password_confirmation: e.target.value})} />
            </div>
            <Button type="submit" className="md:col-span-2 w-full mt-4">Registrarse</Button>
            <Button
            type="button"
              onClick={() => window.location.href = "http://localhost:8000/auth/google"}
                className="w-full mt-4 bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 flex items-center justify-center gap-2"
                  >
                <div className="bg-[url('/google.png')] w-6 h-6 bg-center bg-contain bg-no-repeat" />
                  Registrarse con Google
                </Button>
          </form>
        </CardContent>
      </CardSinBorde> 
      </div>
    </div>
      

  );

}