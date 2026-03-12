import { Search, Plus, Eye, Pencil } from "lucide-react";
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
import { useNavigate } from "react-router-dom";

interface Vehiculo {
  id: number;
  imagen: string | null;
  matricula: string;
  vin: string;
  marca: string;
  modelo: string;
  año: number | null;
}

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const navigate = useNavigate();

  const fetchVehiculos = async () => {
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      if (sortField) {
        params.append("sort", sortField);
        params.append("order", sortOrder);
      }
      const res = await api.get(`/vehiculos?${params.toString()}`);
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
            <TableHead>Imagen</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("matricula")}
            >
              Matrícula{renderSortArrow("matricula")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("vin")}
            >
              VIN{renderSortArrow("vin")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("marca")}
            >
              Marca{renderSortArrow("marca")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("modelo")}
            >
              Modelo{renderSortArrow("modelo")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("año")}
            >
              Año{renderSortArrow("año")}
            </TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {vehiculos.map((vehiculo) => (
            <TableRow key={vehiculo.id}>
              <TableCell>
                <img
                  src={vehiculo.imagen ?? "/avatars/default_car.png"}
                  className="w-10 h-10 rounded object-cover mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/avatars/default_car.png";
                  }}
                />
              </TableCell>
              <TableCell>{vehiculo.matricula}</TableCell>
              <TableCell>{vehiculo.vin}</TableCell>
              <TableCell>{vehiculo.marca}</TableCell>
              <TableCell>{vehiculo.modelo}</TableCell>
              <TableCell>{vehiculo.año ?? "-"}</TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => navigate(`/vehiculos/${vehiculo.id}`)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="Ver"
                  >
                    <Eye size={30} />
                  </button>
                  <button
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="Editar"
                  >
                    <Pencil size={30} />
                  </button>
                </div>
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
