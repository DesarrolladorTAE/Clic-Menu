import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Box, CircularProgress, Stack, Typography } from "@mui/material";

import { getRestaurantSettings } from "../../services/restaurant/restaurantSettings.service";
import { getBranchesByRestaurant } from "../../services/restaurant/branch.service";
import { getCategories } from "../../services/menu/categories.service";

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductSatMapping,
  updateProductSatMapping,
  getProductImages,
  uploadProductImage,
  deleteProductImage,
  reorderProductImages,
} from "../../services/products/products.service";

import PageContainer from "../../components/common/PageContainer";
import AppAlert from "../../components/common/AppAlert";
import usePagination from "../../hooks/usePagination";

import ProductFormModal from "../../components/products/ProductFormModal";
import ProductsPageHeader from "../../components/products/productsPage/ProductsPageHeader";
import ProductsPageFilters from "../../components/products/productsPage/ProductsPageFilters";
import ProductsPageList from "../../components/products/productsPage/ProductsPageList";

const PAGE_SIZE = 4;

const DEFAULT_ALLOWED_PRODUCTS = {
  allowed_product_types: ["simple"],
  allowed_inventory_types: ["none"],
  allowed_combinations: [{ product_type: "simple", inventory_type: "none" }],
};

function apiErrorToMessage(e, fallback = "Ocurrió un error") {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors
      ? Object.entries(e.response.data.errors)
          .map(([k, arr]) =>
            `${k}: ${Array.isArray(arr) ? arr.join(", ") : String(arr)}`
          )
          .join("\n")
      : "") ||
    fallback
  );
}

function allowedInventoryTypesForProductType(productType) {
  if (productType === "composite") return ["none"];
  return ["ingredients", "product", "none"];
}

function normalizeInventoryForProductType(productType, inventoryType) {
  const allowed = allowedInventoryTypesForProductType(productType);
  return allowed.includes(inventoryType) ? inventoryType : allowed[0];
}

function planAllowsCombination(allowedProducts, productType, inventoryType) {
  const combos = allowedProducts?.allowed_combinations || [];

  return combos.some(
    (combo) =>
      combo.product_type === productType && combo.inventory_type === inventoryType
  );
}

function planAllowsComposite(allowedProducts) {
  return Boolean(
    allowedProducts?.allowed_product_types?.includes("composite") ||
      planAllowsCombination(allowedProducts, "composite", "none")
  );
}

function planAllowsRecipes(allowedProducts) {
  return planAllowsCombination(allowedProducts, "simple", "ingredients");
}

function defaultProductType(allowedProducts) {
  const types = allowedProducts?.allowed_product_types || ["simple"];
  return types.includes("simple") ? "simple" : types[0] || "simple";
}

function defaultInventoryType(allowedProducts, productType = "simple") {
  const combos = allowedProducts?.allowed_combinations || [];
  const found = combos.find((combo) => combo.product_type === productType);

  if (found?.inventory_type) return found.inventory_type;

  const allowed = allowedProducts?.allowed_inventory_types || ["none"];
  return allowed.includes("none") ? "none" : allowed[0] || "none";
}

export default function ProductsPage() {
  const nav = useNavigate();
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [pageBusy, setPageBusy] = useState(false);
  const [err, setErr] = useState("");

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const [settings, setSettings] = useState(null);
  const productsMode = settings?.products_mode || "global";
  const requiresBranch = productsMode === "branch";

  const [allowedProducts, setAllowedProducts] = useState(DEFAULT_ALLOWED_PRODUCTS);

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");

  const effectiveBranchId = useMemo(() => {
    if (!requiresBranch) return null;
    return branchId ? Number(branchId) : null;
  }, [requiresBranch, branchId]);

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [products, setProducts] = useState([]);

  const [statusFilter, setStatusFilter] = useState("active");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);

  const reqRef = useRef(0);

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
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

  const listParams = useMemo(() => {
    const p = {};

    if (requiresBranch && effectiveBranchId) {
      p.branch_id = effectiveBranchId;
    }

    if (categoryId) {
      p.category_id = categoryId;
    }

    if (statusFilter === "active" || statusFilter === "inactive") {
      p.include_inactive = true;
      p.status = statusFilter;
    }

    if (statusFilter === "all") {
      p.include_inactive = true;
    }

    return p;
  }, [requiresBranch, effectiveBranchId, categoryId, statusFilter]);

  const loadProducts = async ({ silent = false } = {}) => {
    const myReq = ++reqRef.current;

    if (!silent) setPageBusy(true);

    try {
      const res = await getProducts(restaurantId, listParams);
      if (myReq !== reqRef.current) return;

      setAllowedProducts(res?.allowed_products || DEFAULT_ALLOWED_PRODUCTS);
      setProducts(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      if (myReq !== reqRef.current) return;
      setErr(apiErrorToMessage(e, "No se pudieron cargar los productos"));
    } finally {
      if (myReq !== reqRef.current) return;
      setPageBusy(false);
    }
  };

  const loadAll = async () => {
    setErr("");
    setLoading(true);

    try {
      const st = await getRestaurantSettings(restaurantId);
      setSettings(st);

      let br = [];
      let chosenBranchId = null;

      if (st?.products_mode === "branch") {
        br = await getBranchesByRestaurant(restaurantId);
        setBranches(br || []);

        chosenBranchId = branchId
          ? Number(branchId)
          : br?.[0]?.id
          ? Number(br[0].id)
          : null;

        if (!branchId && chosenBranchId) {
          setBranchId(String(chosenBranchId));
        }
      } else {
        setBranches([]);
        setBranchId("");
      }

      const catQuery =
        st?.products_mode === "branch" && chosenBranchId
          ? { status: "active", branch_id: chosenBranchId }
          : { status: "active" };

      const cats = await getCategories(restaurantId, catQuery);
      setCategories(cats || []);

      const firstCatId = cats?.[0]?.id ? String(cats[0].id) : "";
      const nextCategoryId = categoryId || firstCatId || "";

      if (!categoryId && firstCatId) {
        setCategoryId(firstCatId);
      }

      const prodQuery =
        st?.products_mode === "branch" && chosenBranchId
          ? {
              branch_id: chosenBranchId,
              category_id: nextCategoryId || undefined,
              include_inactive:
                statusFilter === "all" || statusFilter === "inactive",
              status:
                statusFilter === "active" || statusFilter === "inactive"
                  ? statusFilter
                  : undefined,
            }
          : {
              category_id: nextCategoryId || undefined,
              include_inactive:
                statusFilter === "all" || statusFilter === "inactive",
              status:
                statusFilter === "active" || statusFilter === "inactive"
                  ? statusFilter
                  : undefined,
            };

      const res = await getProducts(restaurantId, prodQuery);

      setAllowedProducts(res?.allowed_products || DEFAULT_ALLOWED_PRODUCTS);
      setProducts(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      setErr(apiErrorToMessage(e, "No se pudo cargar productos"));
    } finally {
      setLoading(false);
      setPageBusy(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  useEffect(() => {
    if (loading) return;
    if (requiresBranch && !effectiveBranchId) return;

    (async () => {
      try {
        if (requiresBranch && effectiveBranchId) {
          const cats = await getCategories(restaurantId, {
            status: "active",
            branch_id: effectiveBranchId,
          });

          setCategories(cats || []);

          const exists = (cats || []).some(
            (c) => String(c.id) === String(categoryId)
          );

          if (!exists) {
            const first = cats?.[0]?.id ? String(cats[0].id) : "";
            setCategoryId(first);
            return;
          }
        }

        await loadProducts({ silent: true });
      } catch {
        // silencio administrativo
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, requiresBranch, effectiveBranchId]);

  useEffect(() => {
    if (loading) return;
    if (requiresBranch && !effectiveBranchId) return;

    const t = setTimeout(() => {
      loadProducts({ silent: true });
    }, 120);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listParams, restaurantId]);

  const openCreateModal = () => {
    setErr("");

    const pt = defaultProductType(allowedProducts);
    const it = defaultInventoryType(allowedProducts, pt);

    setModalProduct({
      id: null,
      category_id: categoryId || categories?.[0]?.id || "",
      name: "",
      description: "",
      status: "active",
      product_type: pt,
      inventory_type: it,
      plan_meta: {
        is_compatible_with_plan: true,
        blocked_by_plan: false,
        can_edit_basic_fields: true,
        can_edit_type_inventory: true,
        can_activate: true,
        can_edit_recipes: planAllowsRecipes(allowedProducts),
        can_edit_components: planAllowsComposite(allowedProducts),
        blocked_reason: null,
      },
    });

    setModalOpen(true);
  };

  const onEdit = async (p) => {
    setErr("");

    try {
      const fresh = await getProduct(restaurantId, p.id);

      setModalProduct({
        id: fresh.id,
        category_id: String(fresh.category_id),
        name: fresh.name || "",
        description: fresh.description || "",
        status: fresh.status || "active",
        product_type: fresh.product_type || "simple",
        inventory_type:
          fresh.inventory_type ||
          normalizeInventoryForProductType(fresh.product_type || "simple", "none"),
        plan_meta: fresh.plan_meta || p.plan_meta || null,
      });

      setModalOpen(true);
    } catch (e) {
      setErr(apiErrorToMessage(e, "No se pudo cargar producto"));
    }
  };

  const onDelete = async (p) => {
    const ok = window.confirm(`¿Eliminar producto?\n\n${p.name}`);
    if (!ok) return;

    const snapshot = products;
    setProducts((prev) => prev.filter((x) => x.id !== p.id));

    try {
      setErr("");
      await deleteProduct(restaurantId, p.id);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Producto eliminado correctamente.",
      });
    } catch (e) {
      setProducts(snapshot);
      setErr(apiErrorToMessage(e, "No se pudo eliminar"));
    }
  };

  const buildBranchQuery = () => {
    if (requiresBranch && effectiveBranchId) {
      return `?branch_id=${encodeURIComponent(effectiveBranchId)}`;
    }
    return "";
  };

  const onVariants = (p) => {
    if (!p?.id) return;

    nav(
      `/owner/restaurants/${restaurantId}/operation/menu/products/${p.id}/variants`,
      {
        state: {
          product_name: p?.name || "",
          products_mode: productsMode,
          branch_id: effectiveBranchId,
        },
      }
    );
  };

  const onRecipes = (p) => {
    if (!p?.id) return;

    nav(
      `/owner/restaurants/${restaurantId}/operation/menu/products/${p.id}/recipes`,
      {
        state: {
          product_name: p?.name || "",
          products_mode: productsMode,
          branch_id: effectiveBranchId,
        },
      }
    );
  };

  const onComponents = (p) => {
    if (!p?.id) return;

    nav(
      `/owner/restaurants/${restaurantId}/operation/menu/products/${p.id}/components${buildBranchQuery()}`,
      {
        state: {
          product_name: p?.name || "",
          products_mode: productsMode,
          branch_id: effectiveBranchId,
        },
      }
    );
  };

  const onToggleStatus = async (row) => {
    if (row?.plan_meta?.can_activate === false && row.status !== "active") {
      showAlert({
        severity: "warning",
        title: "Bloqueado por plan",
        message:
          row?.plan_meta?.blocked_reason ||
          "Este producto no puede activarse con el plan actual.",
      });
      return;
    }

    const nextStatus = row.status === "active" ? "inactive" : "active";
    const snapshot = products;

    setProducts((prev) =>
      prev.map((x) => (x.id === row.id ? { ...x, status: nextStatus } : x))
    );

    try {
      await updateProduct(restaurantId, row.id, {
        category_id: Number(row.category_id),
        name: row.name,
        description: row.description || null,
        status: nextStatus,
      });

      showAlert({
        severity: "success",
        title: "Estado actualizado",
        message:
          nextStatus === "active"
            ? "El producto quedó activo."
            : "El producto quedó inactivo.",
      });

      await loadProducts({ silent: true });
    } catch (e) {
      setProducts(snapshot);
      setErr(apiErrorToMessage(e, "No se pudo actualizar estado"));
    }
  };

  const pagination = usePagination({
    items: products,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

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
              Cargando productos…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <ProductsPageHeader
          restaurantId={restaurantId}
          productsMode={productsMode}
          pageBusy={pageBusy}
          allowedProducts={allowedProducts}
          onBack={() => nav(`/owner/restaurants/${restaurantId}/operation/menu`)}
          onCreate={openCreateModal}
        />

        <ProductsPageFilters
          requiresBranch={requiresBranch}
          branches={branches}
          branchId={branchId}
          onBranchChange={setBranchId}
          err={err}
          categories={categories}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          productsCount={products.length}
        />

        <ProductsPageList
          products={products}
          productsMode={productsMode}
          allowedProducts={allowedProducts}
          pagination={pagination}
          onCreate={openCreateModal}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          onComponents={onComponents}
          onVariants={onVariants}
          onRecipes={onRecipes}
        />
      </Stack>

      <ProductFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalProduct(null);
        }}
        restaurantId={restaurantId}
        productsMode={productsMode}
        requiresBranch={requiresBranch}
        effectiveBranchId={effectiveBranchId}
        categories={categories}
        initialData={modalProduct}
        allowedProducts={allowedProducts}
        getProduct={getProduct}
        createProduct={createProduct}
        updateProduct={updateProduct}
        getProductSatMapping={getProductSatMapping}
        updateProductSatMapping={updateProductSatMapping}
        getProductImages={getProductImages}
        uploadProductImage={uploadProductImage}
        deleteProductImage={deleteProductImage}
        reorderProductImages={reorderProductImages}
        onSaved={async () => {
          await loadProducts({ silent: true });
          showAlert({
            severity: "success",
            title: "Hecho",
            message: modalProduct?.id
              ? "Producto actualizado correctamente."
              : "Producto creado correctamente.",
          });
        }}
      />

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