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
  created_at?: string;
}

type SortField =
  | "email"
  | "nombre"
  | "rol_id"
  | "activo"
  | "created_at";

export default function UsersPage({
  isSelector = false,
  onSelect,
  selectedId,
}: {
  isSelector?: boolean;
  onSelect?: (id: number) => void;
  selectedId?: number | null;
} = {}) {
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
      return <ArrowUpDown size={14} className="opacity-30 shrink-0 inline ml-1" />;
    return sortOrder === "asc" ? (
      <ArrowUp size={14} className="text-primary shrink-0 inline ml-1" />
    ) : (
      <ArrowDown size={14} className="text-primary shrink-0 inline ml-1" />
    );
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <>
      <div className="flex justify-end mb-4 items-center">
        <ButtonGroup>
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
              className={`border-black py-1.5 text-sm outline-none transition-all duration-300 bg-background shadow-none
                ${!isSelector ? "rounded-l-md rounded-r-none" : "rounded-md"}
                ${search ? "pl-3" : "pl-8"}
                ${inputFocused || search ? "w-50" : "w-32"}
                focus-visible:ring-0`}
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
          {!isSelector && (
            <Button className="w-50" onClick={() => navigate("/users/nuevo")}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Añadir
            </Button>
          )}
        </ButtonGroup>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-[80px]">Imagen</TableHead>
            <TableHead
              className="cursor-pointer text-center w-[220px]"
              onClick={() => handleSort("email")}
            >
              Email{renderSortArrow("email")}
            </TableHead>
            <TableHead
              className="cursor-pointer text-center w-[200px]"
              onClick={() => handleSort("nombre")}
            >
              Nombre y Apellidos{renderSortArrow("nombre")}
            </TableHead>
            <TableHead className="hidden sm:table-cell text-center w-[120px]">Teléfono</TableHead>
            <TableHead
              className="cursor-pointer text-center w-[120px]"
              onClick={() => handleSort("rol_id")}
            >
              Rol{renderSortArrow("rol_id")}
            </TableHead>
            <TableHead
              className="cursor-pointer text-center w-[100px]"
              onClick={() => handleSort("activo")}
            >
              Activo{renderSortArrow("activo")}
            </TableHead>
            <TableHead
              className="hidden sm:table-cell cursor-pointer text-center w-[140px]"
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
              className={`cursor-pointer transition-colors h-14 ${
                isSelector && selectedId === user.id
                  ? "bg-primary/10"
                  : "hover:bg-muted/50"
              }`}
              onClick={() =>
                isSelector && onSelect
                  ? onSelect(user.id)
                  : navigate(`/perfil/${user.id}`)
              }
            >
              <TableCell className="text-center">
                <img
                  src={user.imagen ?? "/avatars/default_user.png"}
                  alt="Imagen de usuario"
                  className="w-10 h-10 rounded-full shadow-sm object-cover mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/avatars/default_user.png";
                  }}
                />
              </TableCell>
              <TableCell className="text-center">
                <span className="text-sm text-slate-500 font-medium truncate inline-block max-w-[150px]">
                  {user.email}
                </span>
              </TableCell>
              <TableCell className="text-center font-medium truncate">
                {[user.nombre, user.apellidos].filter(Boolean).join(" ")}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-center">
                {user.telefono || "-"}
              </TableCell>
              <TableCell className="text-center">
                <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold">
                   {user.rol?.nombre || "-"}
                </span>
              </TableCell>
              <TableCell className="text-center">
                {user.activo ? (
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block"/>
                ) : (
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block"/>
                )}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-center">
                <span className="text-xs font-semibold text-slate-500 lowercase">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString("es-ES", { day: '2-digit', month: 'long', year: 'numeric' })
                    : "-"}
                </span>
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
                disabled={currentPage === 1}
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) goToPage(currentPage - 1);
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
                disabled={currentPage === totalPages}
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) goToPage(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}
