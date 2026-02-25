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

interface Vehiculo {
  id: number;
  imagen: string | null;
  matricula: string;
  vin: string;
}

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchVehiculos = async () => {
      try {
        const res = await api.get(`/vehiculos?page=${currentPage}`);

        console.log("Estructura de la respuesta:", res.data);

        setVehiculos(res.data.data);

        setTotalPages(
          res.data.meta ? res.data.meta.last_page : res.data.last_page,
        );
      } catch (error) {
        console.error("Error cargando vehiculos:", error);
      }
    };

    fetchVehiculos();
  }, [currentPage]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <>
      <span className="text-4xl font-bold mb-4 inline-block">Vehículos</span>

      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Imagen</TableCell>
            <TableCell>Matricula</TableCell>
            <TableCell>Vin</TableCell>
          </TableRow>
        </TableHeader>

        <TableBody>
          {vehiculos?.map((vehiculo) => (
            <TableRow key={vehiculo.id}>
              <TableCell>
                {vehiculo.imagen ? (
                  <img
                    src={vehiculo.imagen}
                    alt="Imagen de vehiculo"
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
              <TableCell>{vehiculo.matricula}</TableCell>
              <TableCell>{vehiculo.vin}</TableCell>
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
