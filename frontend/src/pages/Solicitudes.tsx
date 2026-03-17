import { Search, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
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
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
  return format(new Date(iso), "dd MMM yyyy", { locale: es });
}

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/solicitudes`, {
          params: { page: currentPage, sort: sortField, order: sortOrder },
        });
        setSolicitudes(res.data.data);
        setTotalPages(res.data.meta?.last_page ?? res.data.last_page ?? 1);
      } catch (error) {
        console.error("Error cargando solicitudes:", error);
      }
    };
    fetch();
  }, [currentPage, sortField, sortOrder]);

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

  return (
    <>
      <span className="text-4xl font-bold mb-4 inline-block">Solicitudes</span>
      <div className="flex justify-end mb-4">
        <Button className="w-47" variant="outline">
          <Search className="mr-2 h-4 w-4" />
          Buscar
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Vehículo</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Empleado</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("estado_id")}
            >
              Estado{renderSortArrow("estado_id")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
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
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/solicitudes/${s.id}`)}
            >
              <TableCell className="text-sm font-medium">{s.id}</TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <img
                    src={s.vehiculo?.imagen ?? "/avatars/default_car.png"}
                    className="w-10 h-10 rounded object-cover shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/avatars/default_car.png";
                    }}
                  />
                  <div className="flex-1 text-center">
                    <p className="font-medium text-sm">
                      {s.vehiculo?.marca} {s.vehiculo?.modelo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.vehiculo?.matricula}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <img
                    src={s.cliente?.imagen ?? "/avatars/default_user.png"}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/avatars/default_user.png";
                    }}
                  />
                  <span className="text-sm flex-1 text-center">
                    {s.cliente?.nombre} {s.cliente?.apellidos}
                  </span>
                </div>
              </TableCell>

              <TableCell className="text-sm">
                {s.empleado ? (
                  `${s.empleado.nombre} ${s.empleado.apellidos}`
                ) : (
                  <span className="text-muted-foreground">Sin asignar</span>
                )}
              </TableCell>

              <TableCell>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${ESTADO_COLORS[s.estado.slug] ?? "bg-gray-100 text-gray-800"}`}
                >
                  {s.estado.nombre}
                </span>
              </TableCell>

              <TableCell className="text-sm">
                {fmt(s.fecha_programada)}
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
