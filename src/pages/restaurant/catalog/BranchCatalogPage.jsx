import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";
import usePagination from "../../../hooks/usePagination";

import CatalogHeader from "../../../components/catalog/CatalogHeader";
import CatalogInstructionsCard from "../../../components/catalog/CatalogInstructionsCard";
import CatalogBranchSelectorCard from "../../../components/catalog/CatalogBranchSelectorCard";
import CatalogContextCard from "../../../components/catalog/CatalogContextCard";
import CatalogFiltersCard from "../../../components/catalog/CatalogFiltersCard";
import CatalogProductsPanel from "../../../components/catalog/CatalogProductsPanel";

import { getRestaurantSubscriptionStatus } from "../../../services/restaurant/restaurant.service";
import { getRestaurantSettings } from "../../../services/restaurant/restaurantSettings.service";
import { getBranchesByRestaurant } from "../../../services/restaurant/branch.service";
import { getMenuSections } from "../../../services/menu/menuSections.service";
import { getCategories } from "../../../services/menu/categories.service";
import {
  getBranchCatalog,
  upsertProductOverride,
  deleteProductOverride,
} from "../../../services/restaurant/branchCatalog.service";

export default function BranchCatalogPage() {
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [savingMap, setSavingMap] = useState({});
  const [mode, setMode] = useState("global");

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");

  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sectionId, setSectionId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [onlyActiveProducts, setOnlyActiveProducts] = useState(true);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const effectiveRestaurantId = Number(restaurantId);

  const showAlert = ({
    severity = "error",
    title = "Error",
    message = "",
  }) => {
    setAlertState({
      open: true,
      severity,
      title,
      message,
    });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const setSaving = (productId, v) =>
    setSavingMap((prev) => ({ ...prev, [productId]: v }));

  const isSaving = (productId) => !!savingMap[productId];

  const selectedBranch = useMemo(() => {
    return (
      branches.find((b) => String(b.id) === String(selectedBranchId)) || null
    );
  }, [branches, selectedBranchId]);

  const visibleCategories = useMemo(() => {
    if (!sectionId) return categories;

    return categories.filter(
      (category) => String(category.section_id ?? "") === String(sectionId)
    );
  }, [categories, sectionId]);

  const categoryMap = useMemo(() => {
    return new Map(categories.map((category) => [String(category.id), category]));
  }, [categories]);

  const sectionMap = useMemo(() => {
    return new Map(sections.map((section) => [String(section.id), section]));
  }, [sections]);

  const modeHelp =
    mode === "global"
      ? "Modo global: esta sucursal decide qué productos del catálogo global vende."
      : "Modo por sucursal: esta sucursal decide qué productos de su propio catálogo vende.";

  const loadBranchesAndMode = async () => {
    const st = await getRestaurantSubscriptionStatus(effectiveRestaurantId);
    if (st?.is_operational !== true) {
      throw new Error(
        "Este restaurante está bloqueado. Contrata un plan para operar."
      );
    }

    const settings = await getRestaurantSettings(effectiveRestaurantId);
    const pm = settings?.products_mode || "global";
    setMode(pm);

    const loadedBranches = await getBranchesByRestaurant(effectiveRestaurantId);
    const safeBranches = Array.isArray(loadedBranches) ? loadedBranches : [];
    setBranches(safeBranches);

    return {
      mode: pm,
      branches: safeBranches,
    };
  };

  const loadCatalogStructure = async (branchIdToLoad, catalogMode = mode) => {
    if (!branchIdToLoad) {
      setSections([]);
      setCategories([]);
      setSectionId("");
      setCategoryId("");
      return;
    }

    const query =
      catalogMode === "branch"
        ? { status: "active", branch_id: Number(branchIdToLoad) }
        : { status: "active" };

    const [sectionsResponse, categoriesResponse] = await Promise.all([
      getMenuSections(effectiveRestaurantId, query),
      getCategories(effectiveRestaurantId, query),
    ]);

    setSections(Array.isArray(sectionsResponse) ? sectionsResponse : []);
    setCategories(Array.isArray(categoriesResponse) ? categoriesResponse : []);
  };

  const loadCatalog = async (branchIdToLoad) => {
    if (!branchIdToLoad) {
      setRows([]);
      setSections([]);
      setCategories([]);
      setSectionId("");
      setCategoryId("");
      return;
    }

    const res = await getBranchCatalog(
      effectiveRestaurantId,
      Number(branchIdToLoad)
    );

    const nextMode = res?.mode || mode || "global";

    setMode(nextMode);
    setRows(Array.isArray(res?.data) ? res.data : []);
    await loadCatalogStructure(branchIdToLoad, nextMode);
  };

  const loadAll = async () => {
    setLoading(true);

    try {
      const data = await loadBranchesAndMode();

      const firstBranchId = data.branches?.[0]?.id
        ? String(data.branches[0].id)
        : "";

      setSectionId("");
      setCategoryId("");

      if (!firstBranchId) {
        setSelectedBranchId("");
        setRows([]);
        setSections([]);
        setCategories([]);
        setLoading(false);
        return;
      }

      if (String(selectedBranchId) === firstBranchId) {
        await loadCatalog(firstBranchId);
        setLoading(false);
        return;
      }

      setSelectedBranchId(firstBranchId);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: e?.response?.data?.message || e?.message || "No se pudo cargar el catálogo",
      });

      setRows([]);
      setSections([]);
      setCategories([]);
      setSectionId("");
      setCategoryId("");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  useEffect(() => {
    if (!selectedBranchId) {
      setRows([]);
      setSections([]);
      setCategories([]);
      setSectionId("");
      setCategoryId("");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        await loadCatalog(selectedBranchId);
      } catch (e) {
        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message || e?.message || "No se pudo cargar el catálogo",
        });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId]);

  const handleSectionChange = (nextSectionId) => {
    const nextValue = String(nextSectionId || "");
    setSectionId(nextValue);

    if (!nextValue || !categoryId) return;

    const categoryStillExists = categories.some(
      (category) =>
        String(category.id) === String(categoryId) &&
        String(category.section_id ?? "") === nextValue
    );

    if (!categoryStillExists) setCategoryId("");
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows
      .filter((r) => {
        const p = r.product;
        const productCategoryId = String(p?.category_id ?? p?.category?.id ?? "");
        const productCategory = categoryMap.get(productCategoryId) || p?.category || null;
        const productSectionId = String(productCategory?.section_id ?? "");
        const productSection = sectionMap.get(productSectionId) || null;

        if (onlyActiveProducts && p?.status !== "active") return false;
        if (sectionId && productSectionId !== String(sectionId)) return false;
        if (categoryId && productCategoryId !== String(categoryId)) return false;
        if (!q) return true;

        const name = (p?.name || "").toLowerCase();
        const desc = (p?.description || "").toLowerCase();
        const cat = (productCategory?.name || p?.category?.name || "").toLowerCase();
        const section = (productSection?.name || "").toLowerCase();

        return (
          name.includes(q) ||
          desc.includes(q) ||
          cat.includes(q) ||
          section.includes(q)
        );
      })
      .sort((a, b) => {
        const ea = a?.effective?.is_enabled ? 1 : 0;
        const eb = b?.effective?.is_enabled ? 1 : 0;
        if (ea !== eb) return eb - ea;

        return (a?.product?.name || "").localeCompare(b?.product?.name || "", "es", {
          sensitivity: "base",
        });
      });
  }, [
    rows,
    search,
    onlyActiveProducts,
    sectionId,
    categoryId,
    categoryMap,
    sectionMap,
  ]);

  const {
    page,
    nextPage,
    prevPage,
    total,
    totalPages,
    startItem,
    endItem,
    hasPrev,
    hasNext,
    paginatedItems,
  } = usePagination({
    items: filtered,
    initialPage: 1,
    pageSize: 5,
    mode: "frontend",
  });

  const onToggle = async (row) => {
    const productId = row.product?.id;
    if (!productId || !selectedBranchId) return;
    if (isSaving(productId)) return;

    const prevEnabled = !!row.effective?.is_enabled;
    const nextEnabled = !prevEnabled;

    setRows((prev) =>
      prev.map((r) => {
        if (r.product?.id !== productId) return r;
        return {
          ...r,
          effective: {
            ...(r.effective || {}),
            is_enabled: nextEnabled,
          },
        };
      })
    );

    setSaving(productId, true);

    try {
      if (nextEnabled) {
        await upsertProductOverride(
          effectiveRestaurantId,
          Number(selectedBranchId),
          productId,
          { is_enabled: true }
        );
      } else {
        if (mode === "branch") {
          await upsertProductOverride(
            effectiveRestaurantId,
            Number(selectedBranchId),
            productId,
            { is_enabled: false }
          );
        } else {
          if (row.override) {
            await deleteProductOverride(
              effectiveRestaurantId,
              Number(selectedBranchId),
              productId
            );
          }
        }
      }

      const refreshed = await getBranchCatalog(
        effectiveRestaurantId,
        Number(selectedBranchId)
      );
      setRows(Array.isArray(refreshed?.data) ? refreshed.data : []);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Catálogo actualizado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message || e?.message || "No se pudo actualizar el catálogo",
      });

      try {
        const refreshed = await getBranchCatalog(
          effectiveRestaurantId,
          Number(selectedBranchId)
        );
        setRows(Array.isArray(refreshed?.data) ? refreshed.data : []);
      } catch {
        setRows((prev) =>
          prev.map((r) => {
            if (r.product?.id !== productId) return r;
            return {
              ...r,
              effective: {
                ...(r.effective || {}),
                is_enabled: prevEnabled,
              },
            };
          })
        );
      }
    } finally {
      setSaving(productId, false);
    }
  };

  const contextData = useMemo(() => {
    const enabledCount = rows.filter((r) => !!r?.effective?.is_enabled).length;
    const activeProductsCount = rows.filter(
      (r) => r?.product?.status === "active"
    ).length;

    return {
      totalRows: rows.length,
      enabledCount,
      activeProductsCount,
      mode,
    };
  }, [rows, mode]);

  if (loading) {
    return (
      <PageContainer>
        <Box
          sx={{
            minHeight: "60vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="primary" />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Cargando catálogo…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <CatalogHeader
          selectedBranch={selectedBranch}
          mode={mode === "branch" ? "Por sucursal" : "Global"}
          modeHelp={modeHelp}
        />

        <CatalogInstructionsCard />

        <CatalogBranchSelectorCard
          branches={branches}
          branchId={selectedBranchId}
          onChangeBranch={(nextBranchId) => {
            setSectionId("");
            setCategoryId("");
            setSelectedBranchId(String(nextBranchId));
          }}
          selectedBranch={selectedBranch}
        />

        <CatalogContextCard
          selectedBranch={selectedBranch}
          contextData={contextData}
        />

        <CatalogFiltersCard
          search={search}
          onChangeSearch={setSearch}
          sections={sections}
          sectionId={sectionId}
          onChangeSection={handleSectionChange}
          categories={visibleCategories}
          categoryId={categoryId}
          onChangeCategory={setCategoryId}
          onlyActiveProducts={onlyActiveProducts}
          onChangeOnlyActiveProducts={setOnlyActiveProducts}
          filteredCount={filtered.length}
          totalCount={rows.length}
        />

        <CatalogProductsPanel
          rows={paginatedItems}
          total={total}
          page={page}
          totalPages={totalPages}
          startItem={startItem}
          endItem={endItem}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={prevPage}
          onNext={nextPage}
          onToggle={onToggle}
          isSaving={isSaving}
          selectedBranchId={selectedBranchId}
        />
      </Stack>

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={4000}
      />
    </PageContainer>
  );
}
