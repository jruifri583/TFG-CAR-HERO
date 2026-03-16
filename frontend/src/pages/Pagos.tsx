import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
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

interface Pago {
  id: number;
  solicitud: number;
  importe: number | null;
  metodo_pago: { nombre: string } | null;
  created_at: string | null;
}

type SortField = "solicitud_id" | "importe" | "metodo_pago_id" | "created_at";

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const navigate = useNavigate();

  const fetchPagos = async () => {
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      if (sortField) {
        params.append("sort", sortField);
        params.append("order", sortOrder);
      }
      const res = await api.get(`/pagos?${params.toString()}`);
      setPagos(res.data.data ?? []);
      setTotalPages(res.data.meta?.last_page || res.data.last_page || 1);
    } catch (error) {
      console.error("Error cargando pagos:", error);
      setPagos([]);
    }
  };

  useEffect(() => {
    fetchPagos();
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

  return (
    <>
      <span className="text-4xl font-bold mb-4 inline-block">Pagos</span>

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
              onClick={() => handleSort("importe")}
            >
              Importe{renderSortArrow("importe")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("metodo_pago_id")}
            >
              Método de Pago{renderSortArrow("metodo_pago_id")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("created_at")}
            >
              Fecha de pago{renderSortArrow("created_at")}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {pagos.map((pago) => (
            <TableRow
              key={pago.id}
              className="cursor-pointer hover:bg-muted/50 h-14"
              onClick={() => navigate(`/solicitudes/${pago.solicitud}`)}
            >
              <TableCell>{pago.solicitud ?? "-"}</TableCell>
              <TableCell>{pago.importe ?? "-"}</TableCell>
              <TableCell>{pago.metodo_pago?.nombre ?? "-"}</TableCell>
              <TableCell>
                {pago.created_at
                  ? new Date(pago.created_at).toLocaleDateString("es-ES")
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
