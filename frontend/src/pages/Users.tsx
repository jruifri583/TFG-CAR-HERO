import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  PlusIcon,
  X,
  Search,
} from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
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
  created_at?: string;
}

type SortField =
  | "email"
  | "nombre"
  | "rol_id"
  | "activo"
  | "created_at";

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async (searchValue = search) => {
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      if (sortField) {
        params.append("sort", sortField);
        params.append("order", sortOrder);
      }
      if (searchValue) params.append("search", searchValue);
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

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setCurrentPage(1);
    fetchUsers(value);
  }, 300);

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
      <div className="flex justify-end mb-4 gap-2 items-center">
        <div className="relative flex items-center">
          {!search && (
            <Search
              size={14}
              className="absolute left-2.5 text-muted-foreground pointer-events-none"
            />
          )}
          <Input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              debouncedSearch(e.target.value);
            }}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            className={`border-black rounded-md py-1.5 text-sm outline-none transition-all duration-300 bg-background
              ${search ? "pl-3" : "pl-8"}
              ${inputFocused || search ? "w-64" : "w-32"}
              focus:ring-2 focus:ring-ring`}
          />
          {search && (
            <button
              className="absolute right-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearch("");
                debouncedSearch("");
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <Button className="w-50" onClick={() => navigate("/users/nuevo")}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Añadir
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Imagen</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("email")}
            >
              Email{renderSortArrow("email")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("nombre")}
            >
              Nombre y Apellidos{renderSortArrow("nombre")}
            </TableHead>
            <TableHead className="hidden sm:table-cell">Teléfono</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("rol_id")}
            >
              Rol{renderSortArrow("rol_id")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("activo")}
            >
              Activo{renderSortArrow("activo")}
            </TableHead>
            <TableHead
              className="hidden sm:table-cell cursor-pointer"
              onClick={() => handleSort("created_at")}
            >
              Creado{renderSortArrow("created_at")}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/perfil/${user.id}`)}
            >
              <TableCell>
                <img
                  src={user.imagen ?? "/avatars/default_user.png"}
                  alt="Imagen de usuario"
                  className="w-10 h-10 rounded-full object-cover mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/avatars/default_user.png";
                  }}
                />
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {[user.nombre, user.apellidos].filter(Boolean).join(" ")}
              </TableCell>
              <TableCell className="hidden sm:table-cell">{user.telefono || "-"}</TableCell>
              <TableCell>{user.rol?.nombre || "-"}</TableCell>
              <TableCell>{user.activo ? "Sí" : "No"}</TableCell>
              <TableCell className="hidden sm:table-cell">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString("es-ES")
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
