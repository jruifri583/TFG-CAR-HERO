import { Search, ArrowUp, ArrowDown, ArrowUpDown, X, PlusIcon } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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

interface Solicitud {
  id: number;
  direccion: string;
  fecha_programada: string | null;
  hora_recogida: string | null;
  hora_itv: string | null;
  hora_entrega: string | null;
  notas: string | null;
  cliente: { nombre: string; apellidos: string; imagen: string | null } | null;
  vehiculo: {
    matricula: string;
    marca: string;
    modelo: string;
    imagen: string | null;
  } | null;
  estado: { slug: string; nombre: string };
  empleado: { nombre: string; apellidos: string } | null;
}

const ESTADO_COLORS: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  asignado: "bg-blue-100 text-blue-800",
  en_recogida: "bg-orange-100 text-orange-800",
  en_itv: "bg-purple-100 text-purple-800",
  retornando: "bg-indigo-100 text-indigo-800",
  cancelado: "bg-red-100 text-red-800",
  finalizado: "bg-green-100 text-green-800",
};

type SortField = "fecha_programada" | "estado_id" | "created_at";
type SortOrder = "asc" | "desc";

function fmt(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("es-ES", { day: '2-digit', month: 'long', year: 'numeric' });
}

interface Props {
  sinPago?: boolean;
  onSelect?: (id: number) => void;
  selectedId?: number;
}

export default function SolicitudesPage({
  sinPago = false,
  onSelect,
  selectedId,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [inputFocused, setInputFocused] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchSolicitudes = async (searchValue = search) => {
    try {
      const res = await api.get(`/solicitudes`, {
        params: {
          page: currentPage,
          sort: sortField,
          order: sortOrder,
          ...(sinPago && { sin_pago: 1 }),
          ...(searchValue && { search: searchValue }),
        },
      });
      setSolicitudes(res.data.data);
      setTotalPages(res.data.meta?.last_page ?? res.data.last_page ?? 1);
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setCurrentPage(1);
    fetchSolicitudes(value);
  }, 300);

  useEffect(() => {
    fetchSolicitudes();
  }, [currentPage, sortField, sortOrder, sinPago]);

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

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <>
      <div className="flex justify-end mb-4 gap-2 items-center">
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
        ${!sinPago ? "rounded-l-md rounded-r-none" : "rounded-md"}
        ${search ? "pl-3" : "pl-8"}
        ${inputFocused || search ? "w-64" : "w-32"}
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
        {!sinPago && (
            <Button className="w-50" onClick={() => navigate("/solicitudes/nuevo")}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Añadir
            </Button>
        )}
        </ButtonGroup>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-[70px]">ID</TableHead>
            <TableHead className="text-center min-w-[200px]">Vehículo</TableHead>
            <TableHead className="text-center min-w-[200px]">Cliente</TableHead>
            <TableHead className="text-center min-w-[150px]">Empleado</TableHead>
            {!sinPago && (
              <TableHead
                className="cursor-pointer text-center w-[130px]"
                onClick={() => handleSort("estado_id")}
              >
                Estado{renderSortArrow("estado_id")}
              </TableHead>
            )}
            <TableHead
              className="cursor-pointer text-center w-[180px]"
              onClick={() => handleSort("fecha_programada")}
            >
              Fecha programada{renderSortArrow("fecha_programada")}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {solicitudes?.map((s) => (
            <TableRow
              key={s.id}
              className={`cursor-pointer transition-colors ${
                onSelect && selectedId === s.id
                  ? "bg-primary/10"
                  : "hover:bg-muted/50"
              }`}
              onClick={() =>
                onSelect ? onSelect(s.id) : navigate(`/solicitudes/${s.id}`)
              }
            >
              <TableCell 
                className="text-center text-sm font-medium border-l-4 border-transparent"
              >
                {s.id}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-3 w-[180px] mx-auto">
                  <div className="w-10 h-10 shrink-0">
                    <img
                      src={s.vehiculo?.imagen ?? "/avatars/default_car.png"}
                      className="w-full h-full rounded shadow-sm object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/avatars/default_car.png";
                      }}
                    />
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="font-bold text-sm text-slate-800 truncate">
                      {s.vehiculo?.marca} {s.vehiculo?.modelo}
                    </p>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-tight">
                      {s.vehiculo?.matricula}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-3 w-[160px] mx-auto">
                  <div className="w-8 h-8 shrink-0">
                    <img
                      src={s.cliente?.imagen ?? "/avatars/default_user.png"}
                      className="w-full h-full rounded-full shadow-sm object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/avatars/default_user.png";
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium truncate">
                    {s.cliente?.nombre} {s.cliente?.apellidos}
                  </span>
                </div>
              </TableCell>

              <TableCell className="text-center text-sm">
                {s.empleado ? (
                  <span className="font-medium">{s.empleado.nombre} {s.empleado.apellidos}</span>
                ) : (
                  <span className="text-muted-foreground italic">Sin asignar</span>
                )}
              </TableCell>

              {!sinPago && (
                <TableCell>
                  <span
                    className={`text-sm px-2 py-1 rounded-full font-medium capitalize ${ESTADO_COLORS[s.estado.slug] ?? "bg-gray-100 text-gray-800"}`}
                  >
                    {s.estado.nombre}
                  </span>
                </TableCell>
              )}

              <TableCell className="text-center">
                <span className="text-xs font-semibold text-slate-500">
                  {fmt(s.fecha_programada)}
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
