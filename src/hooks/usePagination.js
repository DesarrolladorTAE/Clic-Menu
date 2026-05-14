import { useEffect, useMemo, useState } from "react";

export default function usePagination({
  items = [],
  initialPage = 1,
  pageSize = 5,
  mode = "frontend",
  serverMeta = null,
  resetKey = null,
  resetOnItemsChange = false,
}) {
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage, resetKey]);

  const frontendTotal = items.length;
  const frontendTotalPages = Math.max(1, Math.ceil(frontendTotal / pageSize));

  useEffect(() => {
    if (mode !== "frontend") return;

    if (resetOnItemsChange) {
      setPage(initialPage);
      return;
    }

    if (page > frontendTotalPages) {
      setPage(frontendTotalPages);
    }
  }, [
    mode,
    page,
    frontendTotalPages,
    initialPage,
    resetOnItemsChange,
  ]);

  const paginatedItems = useMemo(() => {
    if (mode !== "frontend") return items;

    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize, mode]);

  const total =
    mode === "backend"
      ? Number(serverMeta?.total || 0)
      : frontendTotal;

  const perPage =
    mode === "backend"
      ? Number(serverMeta?.perPage || pageSize)
      : pageSize;

  const currentPage =
    mode === "backend"
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