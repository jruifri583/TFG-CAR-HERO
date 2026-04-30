import { Search, ArrowUp, ArrowDown, ArrowUpDown, X, PlusIcon, Clock, UserCheck, Truck, RotateCcw, CheckCircle, XCircle, ShieldCheck, Calendar } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
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
import { useAuth } from "@/context/useAuth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getPaginationRange } from "@/lib/pagination-utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import { toast } from "sonner";

interface Solicitud {
  id: number;
  direccion: string;
  fecha_programada: string | null;
  hora_recogida: string | null;
  hora_itv: string | null;
  hora_entrega: string | null;
  notas: string | null;
  cliente: { 
    id: number;
    nombre: string; 
    apellidos: string; 
    email: string;
    ciudad: string | null;
    codigo_postal: string | null;
    imagen: string | null 
  } | null;
  vehiculo: {
    matricula: string;
    marca: string;
    modelo: string;
    imagen: string | null;
  } | null;
  estado: { slug: string; nombre: string };
  resolucion?: { nombre: string } | null;
  empleado: { nombre: string; apellidos: string; imagen: string | null} | null;
  updated_at?: string;
}

const STATUS_ICONS: Record<string, any> = {
  pendiente: Clock,
  asignado: UserCheck,
  en_recogida: Truck,
  en_itv: Search,
  retornando: RotateCcw,
  finalizado: CheckCircle,
  cancelado: XCircle,
};

const getResolucionClass = (nombre: string) => {
  const n = nombre.toLowerCase();
  if (n.includes("favorable") && !n.includes("desfavorable")) return "bg-green-100 text-green-700 border-green-200";
  if (n.includes("desfavorable")) return "bg-red-100 text-red-700 border-red-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

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
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const role = user?.rol?.slug;

  const isProfileComplete = () => {
    return !!(user?.apellidos && user?.telefono && user?.direccion && user?.ciudad && user?.codigo_postal);
  };

  const handleNuevaSolicitud = async () => {
    if (role === "cliente") {
      if (!isProfileComplete()) {
        toast.error("Por favor, completa tus datos personales en el perfil antes de solicitar servicio.");
        return;
      }
      try {
        const res = await api.get('/vehiculos');
        const vehiculos = res.data?.data ?? res.data ?? [];
        if (vehiculos.length === 0) {
          toast.error("Añade al menos un vehículo a tu perfil para poder solicitar un servicio.");
          return;
        }
        navigate(`/perfil/${user?.id}/nueva-solicitud`);
      } catch (error) {
         console.error(error);
         toast.error("Ocurrió un error al verificar tus vehículos.");
      }
    } else {
      navigate("/solicitudes/nuevo");
    }
  };

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
      <div className="flex justify-end mb-4 items-center w-full flex-wrap gap-2 pb-2">
        <ButtonGroup className="max-w-full">
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
        ${inputFocused || search ? "w-44 md:w-64" : "w-28 md:w-32"}
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
            <Button onClick={handleNuevaSolicitud} className="px-3 sm:px-4 shrink-0">
              <PlusIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Añadir</span>
            </Button>
        )}
        </ButtonGroup>
      </div>

      {role === "cliente" ? (
        <div className="grid grid-cols-1 gap-4">
          {solicitudes.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-slate-500 font-medium italic">No tienes solicitudes registradas.</p>
            </div>
          ) : (
            solicitudes?.map((s) => {
              const isCancelled = s.estado?.slug === "cancelado";
              return (
                <Card 
                  key={s.id}
                  className={`overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group bg-slate-50/50 ${
                    onSelect && selectedId === s.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() =>
                    onSelect ? onSelect(s.id) : navigate(`/solicitudes/${s.id}`)
                  }
                >
                  <CardContent className="p-4 lg:p-6 text-slate-800">
                    <div className="flex md:items-center gap-4 w-full">
                      <span className="text-xl font-black text-slate-400 shrink-0 select-none mt-1 md:mt-0">
                        {s.id}
                      </span>
                      <div className="flex flex-col md:flex-row flex-wrap md:flex-nowrap justify-between gap-y-6 gap-x-4 w-full min-w-0">
                        
                        {/* Bloque 1: Vehículo */}
                        <div className="flex items-center gap-4 min-w-0">
                          <img 
                            src={s.vehiculo?.imagen ?? "/avatars/default_car.png"} 
                            className="w-12 h-12 lg:w-14 lg:h-14 object-cover rounded-full shadow-sm border-2 border-white shrink-0"
                          />
                          <div className="min-w-0">
                            <h3 className="font-black text-sm lg:text-base leading-tight truncate">
                              {s.vehiculo?.marca} {s.vehiculo?.modelo}
                            </h3>
                            <p className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-widest font-mono font-bold truncate">
                              {s.vehiculo?.matricula}
                            </p>
                          </div>
                        </div>

                      {/* Estado */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 lg:w-14 flex items-center justify-center shrink-0">
                          <div className="relative flex items-center justify-center shrink-0">
                            {(() => {
                              const Icon = STATUS_ICONS[s.estado?.slug || ""] || Clock;
                              return <Icon size={28} className={`z-10 ${isCancelled ? "text-red-500" : "text-primary"}`} />;
                            })()}
                            <div className={`absolute w-4 h-4 rounded-full z-0 opacity-20 ${isCancelled ? "bg-red-500" : "bg-primary animate-ping"}`} />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter leading-none mb-1">Estado</p>
                          <h4 className={`text-xs font-black uppercase italic truncate ${isCancelled ? "text-red-600" : "text-slate-900"}`}>
                            {s.estado?.nombre}
                          </h4>
                        </div>
                      </div>

                      {/* Empleado */}
                      <div className="flex items-center gap-4 min-w-0">
                        {s.empleado ? (
                          <>
                            <div className="w-12 lg:w-14 flex items-center justify-center shrink-0">
                               <img src={s.empleado.imagen ?? "/avatars/default_user.png"} className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover border-2 border-white shadow-sm shrink-0" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter leading-none mb-1">Empleado</p>
                              <p className="text-xs font-black italic truncate">{s.empleado.nombre}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-12 lg:w-14 flex items-center justify-center shrink-0">
                              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                                 <UserCheck size={20} className="text-slate-300" />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter leading-none mb-1">Empleado</p>
                              <p className="text-[10px] text-muted-foreground italic font-medium leading-none">Asignando...</p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Resolución */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 lg:w-14 flex items-center justify-center shrink-0">
                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                            <ShieldCheck size={22} className="text-slate-400" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter leading-none mb-1.5">Resolución</p>
                          <div className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-widest italic leading-none ${getResolucionClass(s.resolucion?.nombre || "Pendiente")}`}>
                            {s.resolucion?.nombre || "Pendiente"}
                          </div>
                        </div>
                      </div>

                      {/* Actualizado */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 lg:w-14 flex items-center justify-center shrink-0">
                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                            <Calendar size={22} className="text-slate-400" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter leading-none mb-1">Actualizado</p>
                          <p className="text-xs font-bold text-slate-700 italic leading-none truncate">
                             {s.updated_at ? format(new Date(s.updated_at), "dd MMM yyyy", { locale: es }) : "-"}
                          </p>
                        </div>
                      </div>

                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      ) : (
        solicitudes.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl w-full">
            <p className="text-slate-500 font-medium italic">No se han encontrado solicitudes.</p>
          </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-[70px]">ID</TableHead>
              <TableHead className="text-center min-w-[200px] hidden md:table-cell">Vehículo</TableHead>
              <TableHead className="text-center min-w-0 md:min-w-[200px]">Cliente</TableHead>
              <TableHead className="text-center min-w-[150px] hidden md:table-cell">Empleado</TableHead>
              {!sinPago && (
                <TableHead
                  className="cursor-pointer text-center w-[130px] hidden md:table-cell"
                  onClick={() => handleSort("estado_id")}
                >
                  Estado{renderSortArrow("estado_id")}
                </TableHead>
              )}
              <TableHead
                className="cursor-pointer text-center min-w-0 md:w-[180px]"
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
                  className={`cursor-pointer transition-colors h-14 ${
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

                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shrink-0">
                        <img
                          src={s.vehiculo?.imagen ?? "/avatars/default_car.png"}
                          className="w-full h-full rounded-full shadow-sm object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/avatars/default_car.png";
                          }}
                        />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm text-slate-800">
                          {s.vehiculo?.marca} {s.vehiculo?.modelo}
                        </p>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-tight">
                          {s.vehiculo?.matricula}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
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
                      <span className="text-sm font-medium">
                        {s.cliente?.nombre} {s.cliente?.apellidos}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-center text-sm hidden md:table-cell">
                    {s.empleado ? (
                      <span className="font-medium">{s.empleado.nombre} {s.empleado.apellidos}</span>
                    ) : (
                      <span className="text-muted-foreground italic">Sin asignar</span>
                    )}
                  </TableCell>

                  {!sinPago && (
                    <TableCell className="hidden md:table-cell">
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
        )
      )}

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
            {getPaginationRange(currentPage, totalPages, !isMobile).map((page, index) => {
              if (page === "...") {
                return (
                  <PaginationItem key={`dots-${index}`}>
                    <span className="px-2">...</span>
                  </PaginationItem>
                );
              }
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === page}
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(Number(page));
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
