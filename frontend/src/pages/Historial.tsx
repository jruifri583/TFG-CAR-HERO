import { Eye } from "lucide-react";
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

interface Historial {
  solicitud_id: number;
  fecha_itv: string | null;
  resolucion: { nombre: string } | null;
}

export default function HistorialPage() {
  const [historiales, setHistoriales] = useState<Historial[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const navigate = useNavigate();

  const fetchHistoriales = async () => {
    try {
      const res = await api.get(
        `/historiales?page=${currentPage}${
          sortField ? `&sort=${sortField}&order=${sortOrder}` : ""
        }`,
      );

      setHistoriales(res.data.data);
      setTotalPages(res.data.last_page || res.data.meta?.last_page || 1);
    } catch (error) {
      console.error("Error cargando historiales:", error);
    }
  };

  useEffect(() => {
    fetchHistoriales();
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
      <span className="text-4xl font-bold mb-4 inline-block">Historial</span>

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
            <TableHead className="w-1/5">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {historiales.map((h) => (
            <TableRow key={h.solicitud_id}>
              <TableCell className="w-1/4">{h.solicitud_id}</TableCell>
              <TableCell className="w-1/4">{h.fecha_itv ?? "-"}</TableCell>
              <TableCell className="w-1/4">
                {h.resolucion?.nombre ?? "-"}
              </TableCell>
              <TableCell>
                <button
                  onClick={() => navigate(`/historial/${h.solicitud_id}`)}
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Eye size={30} />
                </button>
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
