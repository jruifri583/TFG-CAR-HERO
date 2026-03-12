import { Eye, Pencil, Search } from "lucide-react";
import { Plus } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
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
import { useNavigate } from "react-router-dom";

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
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay token de autenticación");

      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      if (sortField) {
        params.append("sort", sortField);
        params.append("order", sortOrder);
      }

      const res = await api.get(`/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(res.data.data);
      setTotalPages(res.data.meta?.last_page || res.data.last_page || 1);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, sortField, sortOrder]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const renderSortArrow = (field: string) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  return (
    <>
      <span className="text-4xl font-bold mb-4 inline-block">Usuarios</span>
      <div className="flex justify-end mb-4">
        <ButtonGroup>
          <Button className="w-47" variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
          <Button className="w-47">
            <Plus className="mr-2 h-4 w-4" />
            Añadir
          </Button>
        </ButtonGroup>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/8">Imagen</TableHead>
            <TableHead
              className="cursor-pointer w-1/8"
              onClick={() => handleSort("email")}
            >
              Email{renderSortArrow("email")}
            </TableHead>
            <TableHead
              className="cursor-pointer w-1/8"
              onClick={() => handleSort("nombre")}
            >
              Nombre{renderSortArrow("nombre")}
            </TableHead>
            <TableHead
              className="cursor-pointer w-1/8"
              onClick={() => handleSort("apellidos")}
            >
              Apellidos{renderSortArrow("apellidos")}
            </TableHead>
            <TableHead
              className="cursor-pointer w-1/8"
              onClick={() => handleSort("telefono")}
            >
              Teléfono{renderSortArrow("telefono")}
            </TableHead>
            <TableHead
              className="cursor-pointer w-1/8"
              onClick={() => handleSort("rol_id")}
            >
              Rol{renderSortArrow("rol_id")}
            </TableHead>
            <TableHead
              className="cursor-pointer w-1/8"
              onClick={() => handleSort("activo")}
            >
              Activo{renderSortArrow("activo")}
            </TableHead>
            <TableHead className="w-1/8">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="flex items-center justify-center">
                {user.imagen ? (
                  <img
                    src={user.imagen}
                    alt="Imagen de usuario"
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/avatars/default_user.png";
                    }}
                  />
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.nombre}</TableCell>
              <TableCell>{user.apellidos || "-"}</TableCell>
              <TableCell>{user.telefono || "-"}</TableCell>
              <TableCell>{user.rol?.nombre || "-"}</TableCell>
              <TableCell>{user.activo ? "Sí" : "No"}</TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => navigate(`/perfil/${user.id}`)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="Ver"
                  >
                    <Eye size={30} />
                  </button>
                  <button
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="Editar"
                  >
                    <Pencil size={30} />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* PAGINACIÓN */}
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
