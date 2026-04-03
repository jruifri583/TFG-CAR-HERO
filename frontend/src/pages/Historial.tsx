import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown, Search, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "use-debounce";

interface Historial {
  solicitud_id: number;
  fecha_itv: string | null;
  resolucion: { slug: string; nombre: string };
}

const RESOLUCION_COLORS: Record<string, string> = {
  desfavorable: "bg-red-100 text-red-800",
  favorable: "bg-green-100 text-green-800",
};

type SortField = "solicitud_id" | "fecha_itv" | "resolucion_id";

export default function HistorialPage() {
  const [loading, setLoading] = useState(true);
  const [historiales, setHistoriales] = useState<Historial[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const navigate = useNavigate();

  const fetchHistoriales = async (searchValue = search) => {
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      if (sortField) {
        params.append("sort", sortField);
        params.append("order", sortOrder);
      }
      if (searchValue) params.append("search", searchValue);
      const res = await api.get(`/historiales?${params.toString()}`);
      setHistoriales(res.data.data);
      setTotalPages(res.data.last_page || res.data.meta?.last_page || 1);
    } catch (error) {
      console.error("Error cargando historiales:", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setCurrentPage(1);
    fetchHistoriales(value);
  }, 300);

  useEffect(() => {
    fetchHistoriales();
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
            className={`border-black rounded-md py-1.5 text-sm outline-none transition-all duration-300 bg-background shadow-none
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
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("solicitud_id")}
            >
              Solicitud{renderSortArrow("solicitud_id")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("fecha_itv")}
            >
              Fecha{renderSortArrow("fecha_itv")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("resolucion_id")}
            >
              Resolución{renderSortArrow("resolucion_id")}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {historiales.map((h) => (
            <TableRow
              key={h.solicitud_id}
              className="cursor-pointer hover:bg-muted/50 h-14"
              onClick={() => navigate(`/solicitudes/${h.solicitud_id}`)}
            >
              <TableCell>{h.solicitud_id}</TableCell>
              <TableCell>
                {h.fecha_itv
                  ? new Date(h.fecha_itv).toLocaleDateString("es-ES")
                  : "-"}
              </TableCell>
              <TableCell>
                <span
                  className={`text-sm px-2 py-1 rounded-full font-medium capitalize ${RESOLUCION_COLORS[h.resolucion?.nombre] ?? "bg-gray-100 text-gray-800"}`}
                >
                  {h.resolucion?.nombre ?? "-"}
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
