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

interface Solicitud {
  id: number;
  imagen: string | null;
  matricula: string;
  vin: string;
}

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        // 🔹 Obtener token del localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No hay token guardado, redirigiendo a login...");
          return;
        }

        // 🔹 Llamada a la API con Bearer
        const res = await api.get(`/api/solicitudes?page=${currentPage}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Estructura de la respuesta:", res.data);

        setSolicitudes(res.data.data);

        setTotalPages(
          res.data.meta ? res.data.meta.last_page : res.data.last_page,
        );
      } catch (error) {
        console.error("Error cargando solicitudes:", error);
      }
    };

    fetchSolicitudes();
  }, [currentPage]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <>
      <span className="text-4xl font-bold mb-4 inline-block">Solicitudes</span>

      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Imagen</TableCell>
            <TableCell>Matricula</TableCell>
            <TableCell>Vin</TableCell>
          </TableRow>
        </TableHeader>

        <TableBody>
          {solicitudes?.map((solicitud) => (
            <TableRow key={solicitud.id}>
              <TableCell>
                {solicitud.imagen ? (
                  <img
                    src={solicitud.imagen}
                    alt="Imagen de solicitud"
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "http://localhost:8000/avatars/default_car.png";
                    }}
                  />
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>{solicitud.matricula}</TableCell>
              <TableCell>{solicitud.vin}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 🔹 PAGINACIÓN */}
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
