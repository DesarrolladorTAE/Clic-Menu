import { useEffect, useMemo, useState } from "react";

/**
 * Hook reutilizable de paginación.
 *
 * Soporta:
 * - modo frontend: recibe un arreglo completo en `items`
 * - modo backend: recibe metadatos externos en `serverMeta`
 *
 * serverMeta esperado:
 * {
 *   page: 1,
 *   perPage: 5,
 *   total: 23
 * }
 */
export default function usePagination({
  items = [],
  initialPage = 1,
  pageSize = 5,
  mode = "frontend", // "frontend" | "backend"
  serverMeta = null,
}) {
  const [page, setPage] = useState(initialPage);

  // Si cambia la data fuente, volvemos a página 1 en frontend
  useEffect(() => {
    if (mode === "frontend") {
      setPage(initialPage);
    }
  }, [items, initialPage, mode]);

  const frontendTotal = items.length;
  const frontendTotalPages = Math.max(1, Math.ceil(frontendTotal / pageSize));

  useEffect(() => {
    if (mode !== "frontend") return;
    if (page > frontendTotalPages) {
      setPage(frontendTotalPages);
    }
  }, [page, frontendTotalPages, mode]);

  const paginatedItems = useMemo(() => {
    if (mode !== "frontend") return items;
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize, mode]);

  const total = mode === "backend"
    ? Number(serverMeta?.total || 0)
    : frontendTotal;

  const perPage = mode === "backend"
    ? Number(serverMeta?.perPage || pageSize)
    : pageSize;

  const currentPage = mode === "backend"
    ? Number(serverMeta?.page || page || 1)
    : page;

  const totalPages = Math.max(
    1,
    mode === "backend"
      ? Math.ceil(total / perPage)
      : frontendTotalPages
  );

  const startItem = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const endItem = total === 0 ? 0 : Math.min(currentPage * perPage, total);

  const goToPage = (nextPage) => {
    const safePage = Math.min(Math.max(1, nextPage), totalPages);
    setPage(safePage);
    return safePage;
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return {
    page: currentPage,
    setPage: goToPage,
    nextPage,
    prevPage,
    pageSize: perPage,
    total,
    totalPages,
    startItem,
    endItem,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
    paginatedItems,
  };
}