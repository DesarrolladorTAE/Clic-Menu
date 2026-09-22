import { useEffect, useMemo, useState } from "react";
import {
  Box, CircularProgress, Stack, Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";
import usePagination from "../../../hooks/usePagination";

import PreparedItemSettingsHeader from "../../../components/operation/prepared-items/PreparedItemSettingsHeader";
import PreparedItemInstructionsCard from "../../../components/operation/prepared-items/PreparedItemInstructionsCard";
import PreparedItemBranchSelectorCard from "../../../components/operation/prepared-items/PreparedItemBranchSelectorCard";
import PreparedItemGeneralSettingCard from "../../../components/operation/prepared-items/PreparedItemGeneralSettingCard";
import PreparedItemContextCard from "../../../components/operation/prepared-items/PreparedItemContextCard";
import PreparedItemFiltersCard from "../../../components/operation/prepared-items/PreparedItemFiltersCard";
import PreparedItemProductsPanel from "../../../components/operation/prepared-items/PreparedItemProductsPanel";
import PreparedItemPolicyDialog from "../../../components/operation/prepared-items/PreparedItemPolicyDialog";

import { getBranchesByRestaurant } from "../../../services/restaurant/branch.service";
import { getBranchCatalog } from "../../../services/restaurant/branchCatalog.service";
import { getMenuSections } from "../../../services/menu/menuSections.service";
import { getCategories } from "../../../services/menu/categories.service";
import {
  deletePreparedProductPolicy,
  getPreparedItemSetting,
  getPreparedProductPolicies,
  updatePreparedItemSetting,
  updatePreparedProductPolicy,
} from "../../../services/operation/prepared-items/preparedItemSettings.service";

const DEFAULT_REUSE_MINUTES = 15;

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;

  if (data?.message) return data.message;
  if (data?.error) return data.error;

  const validationErrors = data?.errors;

  if (validationErrors && typeof validationErrors === "object") {
    const firstGroup = Object.values(validationErrors)[0];

    if (Array.isArray(firstGroup) && firstGroup[0]) return firstGroup[0];
  }

  return error?.message || fallback;
}

function normalizeCatalogRows(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function mergeProductsWithPolicies(catalogRows, policies) {
  const policyMap = new Map(
    policies.map((policy) => [Number(policy.product_id), policy])
  );

  return catalogRows
    .map((catalogRow) => {
      const product = catalogRow?.product || catalogRow;

      if (!product?.id) return null;

      return {
        product,
        catalog: catalogRow,
        policy: policyMap.get(Number(product.id)) || null,
      };
    })
    .filter(Boolean);
}

export default function PreparedItemSettingsPage() {
  const { restaurantId } = useParams();

  const [initialLoading, setInitialLoading] = useState(true);
  const [branchLoading, setBranchLoading] = useState(false);

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");

  const [rows, setRows] = useState([]);
  const [defaultMinutes, setDefaultMinutes] = useState(
    DEFAULT_REUSE_MINUTES
  );
  const [minutesInput, setMinutesInput] = useState(
    String(DEFAULT_REUSE_MINUTES)
  );
  const [settingSource, setSettingSource] = useState("default");
  const [savingSetting, setSavingSetting] = useState(false);

  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sectionId, setSectionId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [search, setSearch] = useState("");
  const [reusableFilter, setReusableFilter] = useState("all");
  const [onlyActiveProducts, setOnlyActiveProducts] = useState(true);
  
  const [savingMap, setSavingMap] = useState({});
  const [deletingMap, setDeletingMap] = useState({});

  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const [selectedPolicyRow, setSelectedPolicyRow] = useState(null);

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

    setAlertState((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const setSaving = (productId, value) => {
    setSavingMap((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const setDeleting = (productId, value) => {
    setDeletingMap((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const isSaving = (productId) => !!savingMap[productId];
  const isDeleting = (productId) => !!deletingMap[productId];

  const selectedBranch = useMemo(() => {
    return (
      branches.find(
        (branch) =>
          String(branch.id) === String(selectedBranchId)
      ) || null
    );
  }, [branches, selectedBranchId]);

  const visibleCategories = useMemo(() => {
    if (!sectionId) return categories;

    return categories.filter(
        (category) => String(category.section_id ?? "") === String(sectionId)
    );
  }, [categories, sectionId]);

  const categoryMap = useMemo(() => {
    return new Map(
        categories.map((category) => [
        String(category.id),
        category,
        ])
    );
  }, [categories]);

  const sectionMap = useMemo(() => {
    return new Map(
        sections.map((section) => [
        String(section.id),
        section,
        ])
    );
  }, [sections]);

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

  const loadBranchConfiguration = async (branchId) => {
    if (!branchId) {
        setRows([]);
        setSections([]);
        setCategories([]);
        setSectionId("");
        setCategoryId("");
        setDefaultMinutes(DEFAULT_REUSE_MINUTES);
        setMinutesInput(String(DEFAULT_REUSE_MINUTES));
        setSettingSource("default");

        return;
    }

    setBranchLoading(true);

    try {
      const [
        settingResponse,
        policiesResponse,
        catalogResponse,
      ] = await Promise.all([
        getPreparedItemSetting(
          effectiveRestaurantId,
          Number(branchId)
        ),
        getPreparedProductPolicies(
          effectiveRestaurantId,
          Number(branchId)
        ),
        getBranchCatalog(
          effectiveRestaurantId,
          Number(branchId)
        ),
      ]);

      const setting = settingResponse?.data || null;
      const nextMinutes =
        Number(setting?.default_reuse_minutes) ||
        DEFAULT_REUSE_MINUTES;

      const policies = Array.isArray(policiesResponse?.data)
        ? policiesResponse.data
        : [];

      const catalogRows = normalizeCatalogRows(catalogResponse);
      const catalogMode = catalogResponse?.mode || "global";

      const structureQuery =
        catalogMode === "branch"
            ? { status: "active", branch_id: Number(branchId) }
            : { status: "active" };

      const [sectionsResponse, categoriesResponse] = await Promise.all([
        getMenuSections(effectiveRestaurantId, structureQuery),
        getCategories(effectiveRestaurantId, structureQuery),
      ]);

      setSections(Array.isArray(sectionsResponse) ? sectionsResponse : []);
      setCategories(Array.isArray(categoriesResponse) ? categoriesResponse : []);

      setDefaultMinutes(nextMinutes);
      setMinutesInput(String(nextMinutes));
      setSettingSource(setting?.source || "default");
      setRows(
        mergeProductsWithPolicies(
            catalogRows,
            policies
        )
      );
    } catch (error) {
        setRows([]);
        setSections([]);
        setCategories([]);
        setSectionId("");
        setCategoryId("");

        showAlert({
            severity: "error",
            title: "Error",
            message: getErrorMessage(
            error,
            "No se pudo cargar la configuración de Preparación rápida."
            ),
        });
    } finally {
        setBranchLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      setInitialLoading(true);

      try {
        const branchResponse =
          await getBranchesByRestaurant(
            effectiveRestaurantId
          );

        if (!mounted) return;

        const safeBranches = Array.isArray(branchResponse)
          ? branchResponse
          : [];

        setBranches(safeBranches);

        const firstBranchId = safeBranches?.[0]?.id
          ? String(safeBranches[0].id)
          : "";

        setSelectedBranchId(firstBranchId);
      } catch (error) {
        if (!mounted) return;

        setBranches([]);
        setSelectedBranchId("");

        showAlert({
          severity: "error",
          title: "Error",
          message: getErrorMessage(
            error,
            "No se pudieron cargar las sucursales."
          ),
        });
      } finally {
        if (mounted) setInitialLoading(false);
      }
    };

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, [effectiveRestaurantId]);

  useEffect(() => {
    if (!selectedBranchId) {
      setRows([]);

      return;
    }

    loadBranchConfiguration(selectedBranchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows
        .filter((row) => {
            const product = row.product;
            const reusable = !!row.policy?.is_reusable;
            const hasCustomMinutes =
                reusable &&
                row.policy?.reuse_minutes !== null &&
                row.policy?.reuse_minutes !== undefined;

            const productCategoryId = String(
                product?.category_id ??
                product?.category?.id ??
                ""
        );

        const productCategory =
            categoryMap.get(productCategoryId) ||
            product?.category ||
            null;

        const productSectionId = String(
            productCategory?.section_id ?? ""
        );

        const productSection = sectionMap.get(productSectionId) || null;

        if (onlyActiveProducts && product?.status !== "active") return false;

        if (sectionId && productSectionId !== String(sectionId)) return false;
        if (categoryId && productCategoryId !== String(categoryId)) return false;

        if (reusableFilter === "reusable" && !reusable) return false;
        if (reusableFilter === "not_reusable" && reusable) return false;
        if (reusableFilter === "custom" && !hasCustomMinutes) return false;

        if (!query) return true;

        const name = (product?.name || "").toLowerCase();
        const description = (product?.description || "").toLowerCase();
        const category = (productCategory?.name || "").toLowerCase();
        const section = (productSection?.name || "").toLowerCase();

        return (
            name.includes(query) ||
            description.includes(query) ||
            category.includes(query) ||
            section.includes(query)
        );
    })
    .sort((a, b) => {
        const reusableA = a.policy?.is_reusable ? 1 : 0;
        const reusableB = b.policy?.is_reusable ? 1 : 0;

        if (reusableA !== reusableB) return reusableB - reusableA;

        return (a.product?.name || "").localeCompare(
            b.product?.name || "",
            "es",
            { sensitivity: "base" }
        );
    });
  }, [
    rows,
    search,
    reusableFilter,
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
    items: filteredRows,
    initialPage: 1,
    pageSize: 5,
    mode: "frontend",
  });

  const handleSaveGeneralSetting = async () => {
    if (!selectedBranchId || savingSetting) return;

    const minutes = Number(minutesInput);

    if (
      !Number.isInteger(minutes) ||
      minutes < 1
    ) {
      showAlert({
        severity: "error",
        title: "Revisa el tiempo",
        message:
          "El tiempo general debe ser un número entero mayor a cero.",
      });

      return;
    }

    setSavingSetting(true);

    try {
      const response =
        await updatePreparedItemSetting(
          effectiveRestaurantId,
          Number(selectedBranchId),
          {
            default_reuse_minutes: minutes,
          }
        );

      const setting = response?.data || null;
      const nextMinutes =
        Number(setting?.default_reuse_minutes) ||
        minutes;

      setDefaultMinutes(nextMinutes);
      setMinutesInput(String(nextMinutes));
      setSettingSource(
        setting?.source || "branch_setting"
      );

      showAlert({
        severity: "success",
        title: "Guardado",
        message:
          "El tiempo general se actualizó correctamente.",
      });
    } catch (error) {
      setMinutesInput(String(defaultMinutes));

      showAlert({
        severity: "error",
        title: "Error",
        message: getErrorMessage(
          error,
          "No se pudo guardar el tiempo general."
        ),
      });
    } finally {
      setSavingSetting(false);
    }
  };

  const handleTogglePolicy = async (row) => {
    const productId = row?.product?.id;

    if (
      !productId ||
      !selectedBranchId ||
      isSaving(productId)
    ) {
      return;
    }

    const previousPolicy = row.policy;
    const nextReusable =
      !previousPolicy?.is_reusable;

    const optimisticPolicy = {
      ...(previousPolicy || {}),
      product_id: productId,
      is_reusable: nextReusable,
      reuse_minutes: nextReusable
        ? previousPolicy?.reuse_minutes ?? null
        : null,
      uses_branch_default_reuse_minutes:
        nextReusable &&
        (previousPolicy?.reuse_minutes === null ||
          previousPolicy?.reuse_minutes === undefined),
    };

    setRows((prev) =>
      prev.map((currentRow) => {
        if (
          Number(currentRow.product?.id) !==
          Number(productId)
        ) {
          return currentRow;
        }

        return {
          ...currentRow,
          policy: optimisticPolicy,
        };
      })
    );

    setSaving(productId, true);

    try {
      const response =
        await updatePreparedProductPolicy(
          effectiveRestaurantId,
          Number(selectedBranchId),
          Number(productId),
          {
            is_reusable: nextReusable,
            reuse_minutes: nextReusable
              ? previousPolicy?.reuse_minutes ?? null
              : null,
          }
        );

      const savedPolicy = response?.data || null;

      setRows((prev) =>
        prev.map((currentRow) => {
          if (
            Number(currentRow.product?.id) !==
            Number(productId)
          ) {
            return currentRow;
          }

          return {
            ...currentRow,
            policy: savedPolicy,
          };
        })
      );

      if (
        selectedPolicyRow?.product?.id ===
        productId
      ) {
        setSelectedPolicyRow((prev) => ({
          ...prev,
          policy: savedPolicy,
        }));
      }

      showAlert({
        severity: "success",
        title: "Guardado",
        message: nextReusable
          ? "El producto ahora permite reutilización."
          : "El producto dejó de permitir reutilización.",
      });
    } catch (error) {
      setRows((prev) =>
        prev.map((currentRow) => {
          if (
            Number(currentRow.product?.id) !==
            Number(productId)
          ) {
            return currentRow;
          }

          return {
            ...currentRow,
            policy: previousPolicy,
          };
        })
      );

      showAlert({
        severity: "error",
        title: "Error",
        message: getErrorMessage(
          error,
          "No se pudo actualizar el producto."
        ),
      });
    } finally {
      setSaving(productId, false);
    }
  };

  const handleOpenPolicyDialog = (row) => {
    setSelectedPolicyRow(row);
    setPolicyDialogOpen(true);
  };

  const handleClosePolicyDialog = () => {
    if (!selectedPolicyRow) {
      setPolicyDialogOpen(false);

      return;
    }

    const productId =
      selectedPolicyRow.product?.id;

    if (
      isSaving(productId) ||
      isDeleting(productId)
    ) {
      return;
    }

    setPolicyDialogOpen(false);
    setSelectedPolicyRow(null);
  };

  const handleSavePolicy = async ({
    productId,
    isReusable,
    reuseMinutes,
    invalid,
  }) => {
    if (invalid) {
      showAlert({
        severity: "error",
        title: "Revisa el tiempo",
        message:
          "El tiempo particular debe ser un número entero mayor a cero.",
      });

      return;
    }

    if (
      !productId ||
      !selectedBranchId ||
      isSaving(productId)
    ) {
      return;
    }

    setSaving(productId, true);

    try {
      const response =
        await updatePreparedProductPolicy(
          effectiveRestaurantId,
          Number(selectedBranchId),
          Number(productId),
          {
            is_reusable: !!isReusable,
            reuse_minutes: isReusable
              ? reuseMinutes
              : null,
          }
        );

      const savedPolicy = response?.data || null;

      setRows((prev) =>
        prev.map((row) => {
          if (
            Number(row.product?.id) !==
            Number(productId)
          ) {
            return row;
          }

          return {
            ...row,
            policy: savedPolicy,
          };
        })
      );

      setPolicyDialogOpen(false);
      setSelectedPolicyRow(null);

      showAlert({
        severity: "success",
        title: "Guardado",
        message:
          "La configuración del producto se actualizó correctamente.",
      });
    } catch (error) {
      showAlert({
        severity: "error",
        title: "Error",
        message: getErrorMessage(
          error,
          "No se pudo guardar la configuración del producto."
        ),
      });
    } finally {
      setSaving(productId, false);
    }
  };

  const handleDeletePolicy = async (
    productId
  ) => {
    if (
      !productId ||
      !selectedBranchId ||
      isDeleting(productId)
    ) {
      return;
    }

    setDeleting(productId, true);

    try {
      await deletePreparedProductPolicy(
        effectiveRestaurantId,
        Number(selectedBranchId),
        Number(productId)
      );

      setRows((prev) =>
        prev.map((row) => {
          if (
            Number(row.product?.id) !==
            Number(productId)
          ) {
            return row;
          }

          return {
            ...row,
            policy: null,
          };
        })
      );

      setPolicyDialogOpen(false);
      setSelectedPolicyRow(null);

      showAlert({
        severity: "success",
        title: "Restablecido",
        message:
          "El producto volvió a su configuración inicial.",
      });
    } catch (error) {
      showAlert({
        severity: "error",
        title: "Error",
        message: getErrorMessage(
          error,
          "No se pudo restablecer la configuración del producto."
        ),
      });
    } finally {
      setDeleting(productId, false);
    }
  };

  const contextData = useMemo(() => {
    const reusableProducts = rows.filter(
      (row) => !!row.policy?.is_reusable
    ).length;

    const customMinutesProducts = rows.filter(
      (row) =>
        !!row.policy?.is_reusable &&
        row.policy?.reuse_minutes !== null &&
        row.policy?.reuse_minutes !== undefined
    ).length;

    return {
      defaultMinutes,
      totalProducts: rows.length,
      reusableProducts,
      customMinutesProducts,
    };
  }, [rows, defaultMinutes]);

  if (initialLoading) {
    return (
      <PageContainer>
        <Box
          sx={{
            minHeight: "60vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack
            spacing={2}
            alignItems="center"
          >
            <CircularProgress color="primary" />

            <Typography
              sx={{
                color: "text.secondary",
                fontSize: 14,
              }}
            >
              Cargando Preparación rápida...
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <PreparedItemSettingsHeader
          selectedBranch={selectedBranch}
        />

        <PreparedItemInstructionsCard />

        <PreparedItemBranchSelectorCard
          branches={branches}
          branchId={selectedBranchId}
          onChangeBranch={(nextBranchId) => {
            setSearch("");
            setSectionId("");
            setCategoryId("");
            setReusableFilter("all");
            setOnlyActiveProducts(true);
            setSelectedBranchId(String(nextBranchId));
          }}
          selectedBranch={selectedBranch}
          disabled={branchLoading}
        />

        <PreparedItemGeneralSettingCard
          branchId={selectedBranchId}
          minutes={minutesInput}
          onChangeMinutes={setMinutesInput}
          onSave={handleSaveGeneralSetting}
          saving={savingSetting}
          loading={branchLoading}
          source={settingSource}
        />

        <PreparedItemContextCard
          selectedBranch={selectedBranch}
          contextData={contextData}
        />

        <PreparedItemFiltersCard
            search={search}
            onChangeSearch={setSearch}
            reusableFilter={reusableFilter}
            onChangeReusableFilter={setReusableFilter}
            sections={sections}
            sectionId={sectionId}
            onChangeSection={handleSectionChange}
            categories={visibleCategories}
            categoryId={categoryId}
            onChangeCategory={setCategoryId}
            onlyActiveProducts={onlyActiveProducts}
            onChangeOnlyActiveProducts={setOnlyActiveProducts}
            filteredCount={filteredRows.length}
            totalCount={rows.length}
        />

        <PreparedItemProductsPanel
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
          onToggle={handleTogglePolicy}
          onConfigure={handleOpenPolicyDialog}
          isSaving={isSaving}
          selectedBranchId={selectedBranchId}
          defaultMinutes={defaultMinutes}
          loading={branchLoading}
        />
      </Stack>

      <PreparedItemPolicyDialog
        open={policyDialogOpen}
        row={selectedPolicyRow}
        defaultMinutes={defaultMinutes}
        saving={
          selectedPolicyRow
            ? isSaving(
                selectedPolicyRow.product?.id
              )
            : false
        }
        deleting={
          selectedPolicyRow
            ? isDeleting(
                selectedPolicyRow.product?.id
              )
            : false
        }
        onClose={handleClosePolicyDialog}
        onSave={handleSavePolicy}
        onDelete={handleDeletePolicy}
      />

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={3000}
      />
    </PageContainer>
  );
}