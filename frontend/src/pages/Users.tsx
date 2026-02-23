import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import api from "@/lib/axios"; 

interface User {
  id: number;
  email: string;
  nombre: string;
  apellidos: string | null;
  nif: string | null;
  telefono: string | null;
  direccion: string | null;
  imagen: string | null;
  rol_id: number;
  rol?: { nombre: string; slug: string }; 
  activo: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUsers(res.data);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <>
      <span className="text-4xl font-bold mb-4 inline-block">Usuarios</span>

      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Apellidos</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Dirección</TableCell>
            <TableCell>Rol</TableCell>
            <TableCell>Activo</TableCell>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.nombre}</TableCell>
              <TableCell>{user.apellidos || "-"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.telefono || "-"}</TableCell>
              <TableCell>{user.direccion || "-"}</TableCell>
              <TableCell>{user.rol?.nombre || "-"}</TableCell>
              <TableCell>{user.activo ? "Sí" : "No"}</TableCell>
            </TableRow>
          ))}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={7}>
              Total: {users.length} usuario{users.length !== 1 ? "s" : ""}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </>
  );
}