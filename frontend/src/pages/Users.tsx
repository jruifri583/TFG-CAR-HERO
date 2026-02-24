import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import api from "@/lib/axios";

interface User {
  id: number;
  imagen: string | null;
  email: string;
  nombre: string;
  apellidos: string | null;
  telefono: string | null;
  rol?: { nombre: string; slug: string };
  activo: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get(`/users?page=${currentPage}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        console.log("Respuesta API:", res.data);

        // 🔥 IMPORTANTE: ajusta esto si tu estructura cambia
        setUsers(res.data.data);
        setTotalPages(res.data.last_page);

      } catch (error) {
        console.error("Error cargando usuarios:", error);
      }
    };

    fetchUsers();
  }, [currentPage]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <>
      <span className="text-4xl font-bold mb-4 inline-block">
        Usuarios
      </span>

      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Imagen</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Apellidos</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Rol</TableCell>
            <TableCell>Activo</TableCell>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                {user.imagen ? (
                  <img
                    src={user.imagen}
                    alt="Imagen de usuario"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : "-"}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.nombre}</TableCell>
              <TableCell>{user.apellidos || "-"}</TableCell>
              <TableCell>{user.telefono || "-"}</TableCell>
              <TableCell>{user.rol?.nombre || "-"}</TableCell>
              <TableCell>{user.activo ? "Sí" : "No"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 🔹 PAGINACIÓN */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>

            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  goToPage(currentPage - 1);
                }}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;

              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === page}
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  goToPage(currentPage + 1);
                }}
              />
            </PaginationItem>

          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}