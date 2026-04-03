import { Search, ArrowUp, ArrowDown, ArrowUpDown, X, PlusIcon } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/useAuth";
import { CardContent, CardSinBorde } from "@/components/ui/card";
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

interface Vehiculo {
  id: number;
  imagen: string | null;
  matricula: string;
  marca: string;
  modelo: string;
  año: number | null;
  kilometros: number | null;
}

type SortField = "matricula" | "marca" | "año";

export default function VehiculosPage() {
  const { user } = useAuth();
  const role = user?.rol?.slug ?? "";
  const [loading, setLoading] = useState(true);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const navigate = useNavigate();

  const fetchVehiculos = async (searchValue = search) => {
    try {
      const params = new URLSearchParams();

      if (role === "administrador") {
        params.append("page", currentPage.toString());

        if (sortField) {
          params.append("sort", sortField);
          params.append("order", sortOrder);
        }
      }

      if (searchValue) params.append("search", searchValue);

      const res = await api.get(`/vehiculos?${params.toString()}`);

      if (role === "administrador") {
        setVehiculos(res.data.data);
        setTotalPages(res.data.meta?.last_page || 1);
      } else {
        setVehiculos(res.data.data ?? res.data);
      }
    } catch (error) {
      console.error("Error cargando vehiculos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehiculos();
  }, [currentPage, sortField, sortOrder]);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setCurrentPage(1);
    fetchVehiculos(value);
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
    <div>
      {role === "administrador" && (
        <AdminList
          vehiculos={vehiculos}
          search={search}
          setSearch={setSearch}
          debouncedSearch={debouncedSearch}
          inputFocused={inputFocused}
          setInputFocused={setInputFocused}
          handleSort={handleSort}
          renderSortArrow={renderSortArrow}
          totalPages={totalPages}
          currentPage={currentPage}
          goToPage={goToPage}
          navigate={navigate}
        />
      )}
      {role === "cliente" && (
        <ClienteList
          vehiculos={vehiculos}
          navigate={navigate}
          search={search}
          setSearch={setSearch}
          debouncedSearch={debouncedSearch}
          inputFocused={inputFocused}
          setInputFocused={setInputFocused}
          user={user}
        />
      )}
    </div>
  );
}

interface AdminListProps {
  vehiculos: Vehiculo[];
  search: string;
  setSearch: (v: string) => void;
  debouncedSearch: (v: string) => void;
  inputFocused: boolean;
  setInputFocused: (v: boolean) => void;
  handleSort: (field: SortField) => void;
  renderSortArrow: (field: SortField) => React.ReactNode;
  totalPages: number;
  currentPage: number;
  goToPage: (page: number) => void;
  navigate: (path: string) => void;
}

function AdminList({
  vehiculos,
  search,
  setSearch,
  debouncedSearch,
  inputFocused,
  setInputFocused,
  handleSort,
  renderSortArrow,
  totalPages,
  currentPage,
  goToPage,
  navigate,
}: AdminListProps) {
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
              className={`border-black rounded-l-md rounded-r-none py-1.5 text-sm outline-none transition-all duration-300 bg-background shadow-none
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
          <Button
            className="w-50 px-4"
            variant="default"
            onClick={() => navigate("/users")}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Añadir
          </Button>
        </ButtonGroup>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Imagen</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("matricula")}
            >
              Matrícula{renderSortArrow("matricula")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("marca")}
            >
              Marca y Modelo{renderSortArrow("marca")}
            </TableHead>
            <TableHead
              className="hidden sm:table-cell cursor-pointer"
              onClick={() => handleSort("año")}
            >
              Año{renderSortArrow("año")}
            </TableHead>
            <TableHead className="hidden sm:table-cell">Kilómetros</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {vehiculos.map((vehiculo) => (
            <TableRow
              key={vehiculo.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/vehiculos/${vehiculo.id}`)}
            >
              <TableCell>
                <img
                  src={vehiculo.imagen ?? "/avatars/default_car.png"}
                  className="w-10 h-10 rounded-full object-cover mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/avatars/default_car.png";
                  }}
                />
              </TableCell>
              <TableCell>{vehiculo.matricula}</TableCell>
              <TableCell>
                {[vehiculo.marca, vehiculo.modelo].filter(Boolean).join(" ")}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {vehiculo.año ?? "-"}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {vehiculo.kilometros != null
                  ? vehiculo.kilometros.toLocaleString("es-ES") + " km"
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

interface ClienteListProps {
  vehiculos: Vehiculo[];
  navigate: (path: string) => void;
  search: string;
  setSearch: (v: string) => void;
  debouncedSearch: (v: string) => void;
  inputFocused: boolean;
  setInputFocused: (v: boolean) => void;
  user: any;
}

function ClienteList({
  vehiculos,
  navigate,
  search,
  setSearch,
  debouncedSearch,
  inputFocused,
  setInputFocused,
  user,
}: ClienteListProps) {
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
              className={`border-black rounded-l-md rounded-r-none py-1.5 text-sm outline-none transition-all duration-300 bg-background shadow-none
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
          <Button
            className="w-50 px-4"
            variant="default"
            onClick={() => navigate(`/perfil/${user?.id}/nuevo-vehiculo`)}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Añadir
          </Button>
        </ButtonGroup>
      </div>
      <div className="flex flex-wrap gap-6 justify-center md:justify-start">
        {vehiculos.map((vehiculo) => (
          <CardSinBorde
            key={vehiculo.id}
            className="overflow-hidden shadow-md hover:shadow-lg transition cursor-pointer w-full p-0 rounded-lg w-52 h-72"
            onClick={() => navigate(`/vehiculos/${vehiculo.id}`)}
          >
            {/* Imagen a pantalla completa */}
            <div className="w-full aspect-square overflow-hidden">
              <img
                src={vehiculo.imagen ?? "/avatars/default_car.png"}
                className="object-cover w-full h-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/avatars/default_car.png";
                }}
              />
            </div>

            <CardContent className="p-4 space-y-1">
              <h2 className="text-lg font-semibold">
                {vehiculo.marca} {vehiculo.modelo}
              </h2>

              <p className="text-sm text-muted-foreground">
                <span className="font-medium">{vehiculo.matricula}</span>
              </p>
            </CardContent>
          </CardSinBorde>
        ))}
      </div>
    </>
  );
}
