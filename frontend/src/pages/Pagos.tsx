import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search,
  PlusIcon,
  X,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "use-debounce";

interface Pago {
  id: number;
  solicitud: number;
  importe: number | null;
  metodo_pago: { nombre: string } | null;
  created_at: string | null;
}

type SortField = "solicitud_id" | "importe" | "metodo_pago_id" | "created_at";

export default function PagosPage() {
  const [loading, setLoading] = useState(true);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const navigate = useNavigate();

  const fetchPagos = async (searchValue = search) => {
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      if (sortField) {
        params.append("sort", sortField);
        params.append("order", sortOrder);
      }
      if (searchValue) params.append("search", searchValue);
      const res = await api.get(`/pagos?${params.toString()}`);
      setPagos(res.data.data ?? []);
      setTotalPages(res.data.meta?.last_page || res.data.last_page || 1);
    } catch (error) {
      console.error("Error cargando pagos:", error);
      setPagos([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setCurrentPage(1);
    fetchPagos(value);
  }, 300);

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
      return <ArrowUpDown size={14} className="opacity-30 shrink-0 inline ml-1" />;
    return sortOrder === "asc" ? (
      <ArrowUp size={14} className="text-primary shrink-0 inline ml-1" />
    ) : (
      <ArrowDown size={14} className="text-primary shrink-0 inline ml-1" />
    );
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <>
      <div className="flex justify-end mb-4 items-center">
        <ButtonGroup>
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
              className={`border-black rounded-l-md rounded-r-none py-1.5 text-sm outline-none transition-all duration-300 bg-background shadow-none
                ${search ? "pl-3" : "pl-8"}
                ${inputFocused || search ? "w-50" : "w-32"}
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
          <Button className="w-50" onClick={() => navigate("/pagos/nuevo")}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Añadir
          </Button>
        </ButtonGroup>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer text-center w-[150px]"
              onClick={() => handleSort("solicitud_id")}
            >
              Solicitud{renderSortArrow("solicitud_id")}
            </TableHead>
            <TableHead
              className="cursor-pointer text-center w-[200px]"
              onClick={() => handleSort("importe")}
            >
              Importe{renderSortArrow("importe")}
            </TableHead>
            <TableHead
              className="hidden sm:table-cell cursor-pointer text-center w-[250px]"
              onClick={() => handleSort("metodo_pago_id")}
            >
              Método de Pago{renderSortArrow("metodo_pago_id")}
            </TableHead>
            <TableHead
              className="hidden sm:table-cell cursor-pointer text-center w-[180px]"
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
              <TableCell className="text-center">
                <span className="font-semibold text-slate-700">{pago.solicitud ?? "-"}</span>
              </TableCell>
              <TableCell className="text-center font-bold text-slate-800">
                {pago.importe != null
                  ? Number(pago.importe) % 1 === 0
                    ? Number(pago.importe).toLocaleString("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 0 })
                    : Number(pago.importe).toLocaleString("es-ES", { style: "currency", currency: "EUR" })
                  : "-"}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-center">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold ring-1 ring-primary/20">
                  {pago.metodo_pago?.nombre || "-"}
                </span>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-center">
                <span className="text-xs font-semibold text-slate-500">
                  {pago.created_at
                    ? new Date(pago.created_at).toLocaleDateString("es-ES", { day: '2-digit', month: 'long', year: 'numeric' })
                    : "-"}
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
