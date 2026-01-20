import { useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: "", apellidos: "", email: "", nif: "",
    password: "", password_confirmation: "", rol_id: 1 // Por defecto usuario
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/register", formData);
      alert("Registro completado. Ahora puedes hacer login.");
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al registrar");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader><CardTitle className="text-2xl text-center">Crear Cuenta ITV</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input onChange={e => setFormData({...formData, nombre: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Apellidos</Label>
              <Input onChange={e => setFormData({...formData, apellidos: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>NIF</Label>
              <Input onChange={e => setFormData({...formData, nif: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input type="password" onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div className="space-y-2">
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