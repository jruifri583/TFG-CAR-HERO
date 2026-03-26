import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown, Search } from "lucide-react";
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
import { Button } from "@/components/ui/button";

interface Historial {
  solicitud_id: number;
  fecha_itv: string | null;
  resolucion: { nombre: string } | null;
}

type SortField = "solicitud_id" | "fecha_itv" | "resolucion_id";

export default function HistorialPage() {
  const [loading, setLoading] = useState(true);
  const [historiales, setHistoriales] = useState<Historial[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const navigate = useNavigate();

  const fetchHistoriales = async () => {
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      if (sortField) {
        params.append("sort", sortField);
        params.append("order", sortOrder);
      }
      const res = await api.get(`/historiales?${params.toString()}`);
      setHistoriales(res.data.data);
      setTotalPages(res.data.last_page || res.data.meta?.last_page || 1);
    } catch (error) {
      console.error("Error cargando historiales:", error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex justify-end mb-4">
        <Button className="w-50" variant="outline">
          <Search className="mr-2 h-4 w-4" />
          Buscar
        </Button>
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
              <TableCell>{h.fecha_itv ?? "-"}</TableCell>
              <TableCell>{h.resolucion?.nombre ?? "-"}</TableCell>
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
