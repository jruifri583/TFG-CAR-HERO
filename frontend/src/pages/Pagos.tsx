import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
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
  solicitud_id: number;
  importe: number | null;
  metodo_pago: { nombre: string } | null;
  estado_pago: { nombre: string } | null;
}

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchPagos = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay token de autenticación");

      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      if (sortField) {
        params.append("sort", sortField);
        params.append("order", sortOrder);
      }

      const res = await api.get(`/pagos?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
      <span className="text-4xl font-bold mb-4 inline-block">Pagos</span>

      <Table>
        <TableHeader>
          <TableRow>
            <TableCell
              className="cursor-pointer"
              onClick={() => handleSort("solicitud_id")}
            >
              Solicitud{renderSortArrow("solicitud_id")}
            </TableCell>
            <TableCell
              className="cursor-pointer"
              onClick={() => handleSort("importe")}
            >
              Importe{renderSortArrow("importe")}
            </TableCell>
            <TableCell
              className="cursor-pointer"
              onClick={() => handleSort("metodo_pago_id")}
            >
              Método de Pago{renderSortArrow("metodo_pago_id")}
            </TableCell>
            <TableCell
              className="cursor-pointer"
              onClick={() => handleSort("estado_pago_id")}
            >
              Estado de Pago{renderSortArrow("estado_pago_id")}
            </TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHeader>

        <TableBody>
          {(pagos ?? []).map((h) => (
            <TableRow key={h.solicitud_id}>
              <TableCell className="w-1/4">{h.solicitud_id}</TableCell>
              <TableCell className="w-1/4">{h.importe ?? "-"}</TableCell>
              <TableCell className="w-1/4">
                {h.metodo_pago?.nombre ?? "-"}
              </TableCell>
              <TableCell>{h.estado_pago?.nombre ?? "-"}</TableCell>
              <TableCell>{/* Acciones */}</TableCell>
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
