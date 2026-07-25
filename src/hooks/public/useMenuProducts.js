// src/hooks/public/useMenuProducts.js
// indexación y filtrado de productos (categorías, búsqueda, expanded variants)
// Objetivo: sacar del Page la lógica de “armar arrays” sin tocar el resultado.

import { useMemo } from "react";

export function useMenuProducts({
  sections,
  categoryFilter,
  q,
  expanded,
  selectedSectionId,
}) {
  /**
   * Determina qué secciones debe utilizar este hook.
   *
   * Compatibilidad temporal:
   * - Si selectedSectionId no fue enviado, se conservan todas las secciones.
   * - Si fue enviado, se utiliza únicamente la sección seleccionada.
   */
  const scopedSections = useMemo(() => {
    const sourceSections = Array.isArray(sections) ? sections : [];

    /**
     * Mesero y cajero todavía no enviarán selectedSectionId.
     * En esos casos se conserva el comportamiento anterior.
     */
    if (selectedSectionId === undefined) {
      return sourceSections;
    }

    /**
     * El consumidor ya maneja secciones, pero todavía no tiene
     * una selección válida. No debemos mostrar todas como respaldo.
     */
    if (selectedSectionId === null || selectedSectionId === "") {
      return [];
    }

    const selectedSection = sourceSections.find(
      (section) =>
        section?.id !== null &&
        section?.id !== undefined &&
        String(section.id) === String(selectedSectionId)
    );

    /**
     * Si la sección desapareció del payload, se devuelve vacío
     * mientras el hook de selección establece la primera disponible.
     */
    return selectedSection ? [selectedSection] : [];
  }, [sections, selectedSectionId]);

  const categoryNameById = useMemo(() => {
    const map = new Map();

    for (const section of scopedSections) {
      for (const category of section?.categories || []) {
        if (category?.id) {
          map.set(Number(category.id), category?.name || "");
        }
      }
    }

    return map;
  }, [scopedSections]);

  const categoryOptions = useMemo(() => {
    const opts = [{ value: "all", label: "Todos" }];
    const seen = new Set();

    for (const section of scopedSections) {
      for (const category of section?.categories || []) {
        if (!category?.id) continue;

        const categoryKey = String(category.id);

        if (seen.has(categoryKey)) continue;

        seen.add(categoryKey);

        opts.push({
          value: categoryKey,
          label: category.name || "Categoría",
        });
      }
    }

    return opts;
  }, [scopedSections]);

  const allProducts = useMemo(() => {
    const out = [];

    for (const section of scopedSections) {
      for (const category of section?.categories || []) {
        const categoryName = category?.name || "";

        for (const product of category?.products || []) {
          out.push({
            ...product,
            __categoryName: categoryName,
          });
        }
      }
    }

    return out;
  }, [scopedSections]);

  const productIndex = useMemo(() => {
    const map = new Map();

    for (const product of allProducts || []) {
      map.set(Number(product.id), product);
    }

    return map;
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    const needle = (q || "").trim().toLowerCase();
    const categoryId =
      categoryFilter === "all" ? null : Number(categoryFilter);

    const matchText = (text) => {
      if (!needle) return true;

      return String(text || "")
        .toLowerCase()
        .includes(needle);
    };

    return (allProducts || []).filter((product) => {
      if (
        categoryId &&
        Number(product.category_id) !== categoryId
      ) {
        return false;
      }

      if (!needle) {
        return true;
      }

      const title = product.display_name || product.name;

      if (matchText(title)) {
        return true;
      }

      const variants = Array.isArray(product.variants)
        ? product.variants
        : [];

      return variants.some((variant) =>
        matchText(variant?.name || variant?.display_name)
      );
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