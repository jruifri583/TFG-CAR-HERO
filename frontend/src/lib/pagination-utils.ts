
export const getPaginationRange = (currentPage: number, totalPages: number, full = false) => {
  if (full) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const delta = 1;
  const range: (number | string)[] = [];
  const rangeWithDots: (number | string)[] = [];
  let l: number | undefined;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l !== undefined) {
      if (typeof i === "number" && i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (typeof i === "number" && i - l !== 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    if (typeof i === "number") l = i;
  }

  return rangeWithDots;
};
