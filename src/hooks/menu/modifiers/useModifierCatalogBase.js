import { useCallback, useEffect, useMemo, useState } from "react";

import { getRestaurantSettings } from "../../../services/restaurant/restaurantSettings.service";
import { getBranchesByRestaurant } from "../../../services/restaurant/branch.service";
import { getMenuSections } from "../../../services/menu/menuSections.service";
import { getCategories } from "../../../services/menu/categories.service";
import { getModifierGroups } from "../../../services/menu/modifiers/modifierGroups.service";
import { getCatalogProducts } from "../../../services/menu/modifiers/modifierCatalog.service";

const normalizeArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  return [];
};

const sameId = (a, b) => {
  if (a === null || a === undefined || b === null || b === undefined) {
    return false;
  }

  return String(a) === String(b);
};

const normalizeId = (value) => {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : "";
};

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

export default function useModifierCatalogBase({
  restaurantId,
  allowedGroupAppliesTo = [],
  productFilter = null,
} = {}) {
  const [settings, setSettings] = useState(null);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");

  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");

  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");

  const [groups, setGroups] = useState([]);

  const [loadingSettings, setLoadingSettings] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  const [error, setError] = useState("");
  const [catalogVersion, setCatalogVersion] = useState(0);

  const productsAreByBranch = String(settings?.products_mode ?? "global") === "branch";
  const modifiersAreByBranch = String(settings?.modifiers_mode ?? "global") === "branch";
  const needsBranchSelector = productsAreByBranch || modifiersAreByBranch;

  const effectiveBranchId = useMemo(() => {
    if (!needsBranchSelector || branchId === "") {
      return null;
    }

    return Number(branchId);
  }, [branchId, needsBranchSelector]);

  const visibleCategories = useMemo(() => {
    if (sectionId === "") {
      return categories;
    }

    return categories.filter((category) => sameId(category?.section_id, sectionId));
  }, [categories, sectionId]);

  const filteredProducts = useMemo(() => {
    const activeProducts = products.filter((product) => {
      if (product?.status && String(product.status) !== "active") {
        return false;
      }

      if (typeof productFilter === "function" && !productFilter(product)) {
        return false;
      }

      return true;
    });

    if (categoryId !== "") {
      return activeProducts.filter((product) => sameId(product?.category_id, categoryId));
    }

    if (sectionId !== "") {
      const categoryIds = new Set(
        visibleCategories.map((category) => String(category?.id))
      );

      return activeProducts.filter((product) => {
        if (product?.category_id === null || product?.category_id === undefined) {
          return false;
        }

        return categoryIds.has(String(product.category_id));
      });
    }

    return activeProducts;
  }, [products, productFilter, categoryId, sectionId, visibleCategories]);

  const selectedProduct = useMemo(() => {
    if (selectedProductId === "") {
      return null;
    }

    return (
      filteredProducts.find((product) => sameId(product?.id, selectedProductId)) ??
      null
    );
  }, [filteredProducts, selectedProductId]);

  const filteredGroups = useMemo(() => {
    if (!Array.isArray(allowedGroupAppliesTo) || allowedGroupAppliesTo.length === 0) {
      return groups;
    }

    return groups.filter((group) =>
      allowedGroupAppliesTo.includes(String(group?.applies_to))
    );
  }, [groups, allowedGroupAppliesTo]);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const reloadCatalog = useCallback(() => {
    setCatalogVersion((current) => current + 1);
  }, []);

  const changeBranch = useCallback((value) => {
    setBranchId(normalizeId(value));
    setSectionId("");
    setCategoryId("");
    setSelectedProductId("");
    setError("");
  }, []);

  const changeSection = useCallback(
    (value) => {
      const nextSectionId = normalizeId(value);
      setSectionId(nextSectionId);

      if (categoryId !== "") {
        const currentCategory = categories.find((category) =>
          sameId(category?.id, categoryId)
        );

        if (
          !currentCategory ||
          (nextSectionId !== "" &&
            !sameId(currentCategory?.section_id, nextSectionId))
        ) {
          setCategoryId("");
        }
      }
    },
    [categories, categoryId]
  );

  const changeCategory = useCallback((value) => {
    setCategoryId(normalizeId(value));
  }, []);

  const changeProduct = useCallback((value) => {
    setSelectedProductId(normalizeId(value));
  }, []);

  useEffect(() => {
    let cancelled = false;

    setSettings(null);
    setBranches([]);
    setBranchId("");
    setSections([]);
    setSectionId("");
    setCategories([]);
    setCategoryId("");
    setProducts([]);
    setSelectedProductId("");
    setGroups([]);
    setError("");

    if (!restaurantId) {
      return () => {
        cancelled = true;
      };
    }

    const loadSettings = async () => {
      setLoadingSettings(true);

      try {
        const response = await getRestaurantSettings(restaurantId);

        if (!cancelled) {
          setSettings(response?.data ?? response ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            getErrorMessage(
              err,
              "No fue posible obtener la configuración del restaurante."
            )
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingSettings(false);
        }
      }
    };

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  useEffect(() => {
    let cancelled = false;

    if (!restaurantId || !settings || !needsBranchSelector) {
      if (!needsBranchSelector) {
        setBranches([]);
        setBranchId("");
      }

      return () => {
        cancelled = true;
      };
    }

    const loadBranches = async () => {
      setLoadingBranches(true);

      try {
        const response = await getBranchesByRestaurant(restaurantId);
        const rows = normalizeArray(response);

        if (cancelled) {
          return;
        }

        setBranches(rows);

        setBranchId((current) => {
          if (current !== "" && rows.some((branch) => sameId(branch?.id, current))) {
            return current;
          }

          return rows.length > 0 ? Number(rows[0].id) : "";
        });
      } catch (err) {
        if (!cancelled) {
          setBranches([]);
          setBranchId("");
          setError(
            getErrorMessage(
              err,
              "No fue posible obtener las sucursales del restaurante."
            )
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingBranches(false);
        }
      }
    };

    loadBranches();

    return () => {
      cancelled = true;
    };
  }, [restaurantId, settings, needsBranchSelector]);

  useEffect(() => {
    let cancelled = false;

    if (!restaurantId || !settings) {
      return () => {
        cancelled = true;
      };
    }

    if (needsBranchSelector && !effectiveBranchId) {
      return () => {
        cancelled = true;
      };
    }

    const loadCatalog = async () => {
      setLoadingCatalog(true);
      setError("");

      const productQuery = {
        status: "active",
        ...(productsAreByBranch && effectiveBranchId
          ? { branch_id: effectiveBranchId }
          : {}),
      };

      const modifierQuery =
        modifiersAreByBranch && effectiveBranchId
          ? { branch_id: effectiveBranchId }
          : {};

      try {
        const [sectionRows, categoryRows, productRows, groupResponse] =
          await Promise.all([
            getMenuSections(restaurantId, productQuery),
            getCategories(restaurantId, productQuery),
            getCatalogProducts(
              restaurantId,
              productsAreByBranch && effectiveBranchId
                ? { branch_id: effectiveBranchId }
                : {}
            ),
            getModifierGroups(restaurantId, modifierQuery),
          ]);

        if (cancelled) {
          return;
        }

        setSections(normalizeArray(sectionRows));
        setCategories(normalizeArray(categoryRows));
        setProducts(normalizeArray(productRows));
        setGroups(normalizeArray(groupResponse));
      } catch (err) {
        if (!cancelled) {
          setError(
            getErrorMessage(
              err,
              "No fue posible obtener la información necesaria para administrar los modificadores."
            )
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCatalog(false);
        }
      }
    };

    loadCatalog();

    return () => {
      cancelled = true;
    };
  }, [
    restaurantId,
    settings,
    needsBranchSelector,
    effectiveBranchId,
    productsAreByBranch,
    modifiersAreByBranch,
    catalogVersion,
  ]);

  useEffect(() => {
    if (categoryId === "") {
      return;
    }

    const categoryStillVisible = visibleCategories.some((category) =>
      sameId(category?.id, categoryId)
    );

    if (!categoryStillVisible) {
      setCategoryId("");
    }
  }, [categoryId, visibleCategories]);

  useEffect(() => {
    if (filteredProducts.length === 0) {
      if (selectedProductId !== "") {
        setSelectedProductId("");
      }

      return;
    }

    const selectedStillVisible = filteredProducts.some((product) =>
      sameId(product?.id, selectedProductId)
    );

    if (!selectedStillVisible) {
      setSelectedProductId(Number(filteredProducts[0].id));
    }
  }, [filteredProducts, selectedProductId]);

  return {
    settings,
    branches,
    branchId,
    effectiveBranchId,

    sections,
    sectionId,

    categories,
    categoryId,
    visibleCategories,

    products,
    filteredProducts,
    selectedProductId,
    selectedProduct,

    groups: filteredGroups,

    productsAreByBranch,
    modifiersAreByBranch,
    needsBranchSelector,

    loadingSettings,
    loadingBranches,
    loadingCatalog,
    loading: loadingSettings || loadingBranches || loadingCatalog,

    error,
    clearError,

    changeBranch,
    changeSection,
    changeCategory,
    changeProduct,
    reloadCatalog,
  };
}