import { useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-2xl">
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}