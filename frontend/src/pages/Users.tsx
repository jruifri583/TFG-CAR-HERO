import {
  Filter,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  PlusIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
import { ButtonGroup } from "@/components/ui/button-group";

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

type SortField =
  | "email"
  | "nombre"
  | "apellidos"
  | "telefono"
  | "rol_id"
  | "activo";

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [filters, setFilters] = useState({
    email: "",
    nombre: "",
    apellidos: "",
    telefono: "",
    activo: "",
  });

  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();

      params.append("page", currentPage.toString());

      if (sortField) {
        params.append("sort", sortField);
        params.append("order", sortOrder);
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await api.get(`/users?${params.toString()}`);

      setUsers(res.data.data);
      setTotalPages(res.data.meta?.last_page || res.data.last_page || 1);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, sortField, sortOrder]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const renderSortArrow = (field: SortField) => {
    if (sortField !== field)
      return <ArrowUpDown size={14} className="inline ml-1 opacity-40" />;
    return sortOrder === "asc" ? (
      <ArrowUp size={14} className="inline ml-1" />
    ) : (
      <ArrowDown size={14} className="inline ml-1" />
    );
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <>
      <div className="flex justify-end mb-4">
        <ButtonGroup>
          <Button className="w-50">
            <PlusIcon className="mr-2 h-4 w-4" />
            Añadir
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button className="w-50" variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtrar
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                <Input
                  type="text"
                  placeholder="Email"
                  value={filters.email}
                  onChange={(e) =>
                    setFilters({ ...filters, email: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />

                <Input
                  type="text"
                  placeholder="Nombre"
                  value={filters.nombre}
                  onChange={(e) =>
                    setFilters({ ...filters, nombre: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />

                <Input
                  type="text"
                  placeholder="Apellidos"
                  value={filters.apellidos}
                  onChange={(e) =>
                    setFilters({ ...filters, apellidos: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />

                <Input
                  type="text"
                  placeholder="Teléfono"
                  value={filters.telefono}
                  onChange={(e) =>
                    setFilters({ ...filters, telefono: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />

                <select
                  value={filters.activo}
                  onChange={(e) =>
                    setFilters({ ...filters, activo: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                >
                  <option value="">Activo</option>
                  <option value="1">Sí</option>
                  <option value="0">No</option>
                </select>

                <Button
                  className="w-full"
                  onClick={() => {
                    setCurrentPage(1);
                    fetchUsers();
                  }}
                >
                  Aplicar filtros
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </ButtonGroup>
      </div>

      {/* TABLA */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Imagen</TableHead>
            <TableHead onClick={() => handleSort("email")}>
              Email{renderSortArrow("email")}
            </TableHead>
            <TableHead onClick={() => handleSort("nombre")}>
              Nombre{renderSortArrow("nombre")}
            </TableHead>
            <TableHead onClick={() => handleSort("apellidos")}>
              Apellidos{renderSortArrow("apellidos")}
            </TableHead>
            <TableHead onClick={() => handleSort("telefono")}>
              Teléfono{renderSortArrow("telefono")}
            </TableHead>
            <TableHead onClick={() => handleSort("rol_id")}>
              Rol{renderSortArrow("rol_id")}
            </TableHead>
            <TableHead onClick={() => handleSort("activo")}>
              Activo{renderSortArrow("activo")}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              onClick={() => navigate(`/perfil/${user.id}`)}
            >
              <TableCell>
                <img
                  src={user.imagen ?? "/avatars/default_user.png"}
                  className="w-10 h-10 rounded-full"
                />
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

            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === i + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    goToPage(i + 1);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

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
