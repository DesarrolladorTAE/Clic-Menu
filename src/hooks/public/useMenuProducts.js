// src/pages/public/hooks/useMenuProducts.js
// indexación y filtrado de productos (categorías, búsqueda, expanded variants)
// Objetivo: sacar del Page la lógica de “armar arrays” sin tocar el resultado.

import { useMemo } from "react";

export function useMenuProducts({ sections, categoryFilter, q, expanded }) {
  const categoryNameById = useMemo(() => {
    const map = new Map();
    for (const s of sections || []) {
      for (const c of s?.categories || []) {
        if (c?.id) map.set(Number(c.id), c?.name || "");
      }
    }
    return map;
  }, [sections]);

  const categoryOptions = useMemo(() => {
    const opts = [{ value: "all", label: "Todos" }];
    const seen = new Set();
    for (const s of sections || []) {
      for (const c of s?.categories || []) {
        if (!c?.id || seen.has(c.id)) continue;
        seen.add(c.id);
        opts.push({ value: String(c.id), label: c.name || "Categoría" });
      }
    }
    return opts;
  }, [sections]);

  const allProducts = useMemo(() => {
    const out = [];
    for (const s of sections || []) {
      for (const c of s?.categories || []) {
        const catName = c?.name || "";
        for (const p of c?.products || []) out.push({ ...p, __categoryName: catName });
      }
    }
    return out;
  }, [sections]);

  const productIndex = useMemo(() => {
    const m = new Map();
    for (const p of allProducts || []) m.set(Number(p.id), p);
    return m;
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    const needle = (q || "").trim().toLowerCase();
    const catId = categoryFilter === "all" ? null : Number(categoryFilter);

    const matchText = (txt) => {
      if (!needle) return true;
      return String(txt || "").toLowerCase().includes(needle);
    };

    return (allProducts || []).filter((p) => {
      if (catId && Number(p.category_id) !== catId) return false;
      if (!needle) return true;

      const title = p.display_name || p.name;
      if (matchText(title)) return true;

      const vars = Array.isArray(p.variants) ? p.variants : [];
      return vars.some((v) => matchText(v?.name || v?.display_name));
    });
  }, [allProducts, categoryFilter, q]);

  return {
    categoryNameById,
    categoryOptions,
    allProducts,
    productIndex,
    filteredProducts,
  };
}