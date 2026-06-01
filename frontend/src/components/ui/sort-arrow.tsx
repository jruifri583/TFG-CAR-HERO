import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

interface SortArrowProps {
  field: string;
  sortField: string | null;
  sortOrder: "asc" | "desc";
}

export function SortArrow({ field, sortField, sortOrder }: SortArrowProps) {
  if (sortField !== field) {
    return (
      <ArrowUpDown size={14} className="opacity-30 shrink-0 inline ml-1" />
    );
  }
  return sortOrder === "asc" ? (
    <ArrowUp size={14} className="text-primary shrink-0 inline ml-1" />
  ) : (
    <ArrowDown size={14} className="text-primary shrink-0 inline ml-1" />
  );
}
