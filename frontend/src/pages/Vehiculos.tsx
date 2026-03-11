import { Search } from "lucide-react";
import { Plus } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
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
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchVehiculos = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay token de autenticación");

      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      if (sortField) {
        params.append("sort", sortField);
        params.append("order", sortOrder);
      }

      const res = await api.get(`/vehiculos?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setVehiculos(res.data.data);
      setTotalPages(res.data.meta?.last_page || res.data.last_page || 1);
    } catch (error) {
      console.error("Error cargando vehiculos:", error);
    }
  };

  useEffect(() => {
    fetchVehiculos();
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
      <span className="text-4xl font-bold mb-4 inline-block">Vehículos</span>
      <div className="flex justify-end mb-4">
        <ButtonGroup>
          <Button className="w-47" variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
          <Button className="w-47">
            <Plus className="mr-2 h-4 w-4" />
            Añadir
          </Button>
        </ButtonGroup>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/5">Imagen</TableHead>
            <TableHead
              className="cursor-pointer w-1/5"
              onClick={() => handleSort("matricula")}
            >
              Matrícula{renderSortArrow("matricula")}
            </TableHead>
            <TableHead
              className="cursor-pointer w-1/5"
              onClick={() => handleSort("vin")}
            >
              VIN{renderSortArrow("vin")}
            </TableHead>
            <TableHead className="w-1/5">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {vehiculos.map((vehiculo) => (
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
              <TableCell>{/* Botones de acciones */}</TableCell>
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
