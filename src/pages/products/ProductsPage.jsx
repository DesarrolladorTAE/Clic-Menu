import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getRestaurantSettings } from "../../services/restaurantSettings.service";
import { getBranchesByRestaurant } from "../../services/branch.service";
import { getCategories } from "../../services/categories.service";

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductImages,
  uploadProductImage,
  deleteProductImage,
  reorderProductImages,
} from "../../services/products.service";

import { changeProductType } from "../../services/catalog/products/productType.service";
import { changeInventoryType } from "../../services/catalog/products/productInventoryType.service";

// UI en español, values en inglés (BD)
const PRODUCT_TYPES = [
  { value: "simple", label: "Simple" },
  { value: "composite", label: "Compuesto" },
];

const INVENTORY_TYPES = [
  { value: "ingredients", label: "Ingredientes" },
  { value: "product", label: "Producto" },
  { value: "none", label: "Sin inventario" },
];

// Helpers
function labelFromOptions(options, value, fallback = "—") {
  const v = value ?? "";
  const found = options.find((x) => x.value === v);
  return found ? found.label : fallback;
}

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

// === Reglas UI (parte 2) ===
function allowedInventoryTypesForProductType(productType) {
  if (productType === "composite") return ["none"];
  return ["ingredients", "product"];
}

function normalizeInventoryForProductType(productType, inventoryType) {
  const allowed = allowedInventoryTypesForProductType(productType);
  return allowed.includes(inventoryType) ? inventoryType : allowed[0];
}

function getModeKey(productType, inventoryType) {
  const pt = productType || "simple";
  const it = inventoryType || (pt === "composite" ? "none" : "ingredients");
  return `${pt}:${it}`;
}

function buttonsRules(productType, inventoryType) {
  const key = getModeKey(productType, inventoryType);
  const rules = { recipes: false, variants: false, components: false };

  if (key === "simple:ingredients") {
    rules.recipes = true;
    rules.variants = true;
  }
  if (key === "simple:product") {
    rules.variants = true;
  }
  if (key === "composite:none") {
    rules.components = true;
  }
  return rules;
}

export default function ProductsPage() {
  const nav = useNavigate();
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // settings + mode
  const [settings, setSettings] = useState(null);
  const productsMode = settings?.products_mode || "global";
  const requiresBranch = productsMode === "branch";

  // branches
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState(""); // string para <select>

  const effectiveBranchId = useMemo(() => {
    if (!requiresBranch) return null;
    return branchId ? Number(branchId) : null;
  }, [requiresBranch, branchId]);

  // categories / products
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [products, setProducts] = useState([]);

  // filtros estado
  const [includeInactive, setIncludeInactive] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive

  const [form, setForm] = useState({
    id: null,
    category_id: "",
    name: "",
    description: "",
    status: "active",
    product_type: "simple",
    inventory_type: "ingredients",
  });

  // images
  const [images, setImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const fileInputRef = useRef(null);

  const selectedProductId = form.id;

  const maxImages = 6;
  const canUploadMore = images.length < maxImages;

  const listParams = useMemo(() => {
    const p = {};
    if (requiresBranch && effectiveBranchId) p.branch_id = effectiveBranchId;
    if (categoryId) p.category_id = categoryId;

    if (includeInactive) {
      p.include_inactive = true;
      if (statusFilter === "active" || statusFilter === "inactive") p.status = statusFilter;
    }

    return p;
  }, [requiresBranch, effectiveBranchId, categoryId, includeInactive, statusFilter]);

  const resetForm = () => {
    setErr("");
    setForm({
      id: null,
      category_id: categoryId || "",
      name: "",
      description: "",
      status: "active",
      product_type: "simple",
      inventory_type: "ingredients",
    });
    setImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const loadImages = async (productId) => {
    if (!productId) return;
    setImagesLoading(true);
    try {
      const imgs = await getProductImages(restaurantId, productId);
      setImages(imgs);
    } catch (e) {
      setErr(apiErrorToMessage(e, "No se pudieron cargar imágenes"));
    } finally {
      setImagesLoading(false);
    }
  };

  const reloadProducts = async () => {
    const list = await getProducts(restaurantId, listParams);
    setProducts(list || []);
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

        if (!branchId && chosenBranchId) setBranchId(String(chosenBranchId));
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
      const effectiveCategoryId = categoryId || firstCatId;

      if (!categoryId && firstCatId) setCategoryId(firstCatId);

      const prodQuery =
        st?.products_mode === "branch" && chosenBranchId
          ? { ...listParams, branch_id: chosenBranchId, category_id: effectiveCategoryId || undefined }
          : { ...listParams, category_id: effectiveCategoryId || undefined };

      const list = await getProducts(restaurantId, prodQuery);
      setProducts(list || []);

      setForm((p) => ({
        ...p,
        category_id: p.category_id || effectiveCategoryId || "",
      }));
    } catch (e) {
      setErr(apiErrorToMessage(e, "No se pudo cargar productos"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line
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

          const exists = (cats || []).some((c) => String(c.id) === String(categoryId));
          if (!exists) {
            const first = cats?.[0]?.id ? String(cats[0].id) : "";
            setCategoryId(first);
            setForm((p) => ({ ...p, category_id: p.category_id || first || "" }));
          }
        }

        await reloadProducts();
      } catch {
        // silencioso
      }
    })();
    // eslint-disable-next-line
  }, [listParams, restaurantId, requiresBranch, effectiveBranchId]);

  // ======= Selectores inteligentes =======
  const inventoryOptions = useMemo(() => {
    const allowed = allowedInventoryTypesForProductType(form.product_type);
    return INVENTORY_TYPES.filter((x) => allowed.includes(x.value));
  }, [form.product_type]);

  const onChangeProductType = async (nextType) => {
    setErr("");

    const prevType = form.product_type || "simple";
    const prevInventory = form.inventory_type || "ingredients";

    const nextInventory = normalizeInventoryForProductType(nextType, prevInventory);

    setForm((p) => ({
      ...p,
      product_type: nextType,
      inventory_type: nextInventory,
    }));

    if (!form.id) return;

    try {
      const res = await changeProductType(restaurantId, form.id, nextType);
      const updated = res?.data || res || null;

      setForm((p) => ({
        ...p,
        product_type: updated?.product_type || nextType,
        inventory_type:
          updated?.inventory_type ||
          normalizeInventoryForProductType(updated?.product_type || nextType, p.inventory_type),
        status: updated?.status || p.status,
      }));

      await reloadProducts();
    } catch (e) {
      setForm((p) => ({
        ...p,
        product_type: prevType,
        inventory_type: prevInventory,
      }));
      setErr(apiErrorToMessage(e, "No se pudo cambiar el tipo de producto"));
    }
  };

  const onChangeInventoryType = async (nextInventory) => {
    setErr("");

    const prevInventory = form.inventory_type || "ingredients";
    const productType = form.product_type || "simple";

    const allowed = allowedInventoryTypesForProductType(productType);
    if (!allowed.includes(nextInventory)) {
      const forced = allowed[0];
      setForm((p) => ({ ...p, inventory_type: forced }));
      return;
    }

    setForm((p) => ({ ...p, inventory_type: nextInventory }));

    if (!form.id) return;

    try {
      const res = await changeInventoryType(restaurantId, form.id, nextInventory);
      const updated = res?.data || res || null;

      setForm((p) => ({
        ...p,
        inventory_type: updated?.inventory_type || nextInventory,
        status: updated?.status || p.status,
      }));

      await reloadProducts();
    } catch (e) {
      setForm((p) => ({ ...p, inventory_type: prevInventory }));
      setErr(apiErrorToMessage(e, "No se pudo cambiar el tipo de inventario"));
    }
  };

  // ✅ CLAVE: CREATE vs UPDATE payload
  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (requiresBranch && !effectiveBranchId) return setErr("Selecciona una sucursal.");
    if (!form.category_id) return setErr("Selecciona categoría");
    if (!form.name?.trim()) return setErr("Nombre obligatorio");

    const pt = form.product_type || "simple";
    const it = normalizeInventoryForProductType(pt, form.inventory_type || "ingredients");

    try {
      let saved = null;

      if (form.id) {
        const updatePayload = {
          category_id: Number(form.category_id),
          name: form.name.trim(),
          description: form.description?.trim() || null,
          status: form.status,
        };

        saved = await updateProduct(restaurantId, form.id, updatePayload);
      } else {
        const createPayload = {
          category_id: Number(form.category_id),
          name: form.name.trim(),
          description: form.description?.trim() || null,
          status: form.status,
          product_type: pt,
          inventory_type: it,
          is_global: productsMode === "global",
          branch_id: productsMode === "branch" ? effectiveBranchId : null,
        };

        saved = await createProduct(restaurantId, createPayload);
      }

      await reloadProducts();

      setForm((p) => ({
        ...p,
        id: saved.id,
        category_id: String(saved.category_id),
        name: saved.name ?? p.name,
        description: saved.description ?? p.description,
        product_type: saved.product_type || p.product_type || "simple",
        inventory_type: saved.inventory_type || p.inventory_type || "ingredients",
        status: saved.status || p.status || "active",
      }));

      await loadImages(saved.id);
    } catch (e2) {
      setErr(apiErrorToMessage(e2, "No se pudo guardar producto"));
    }
  };

  const onEdit = async (p) => {
    setErr("");
    try {
      const fresh = await getProduct(restaurantId, p.id);
      setForm({
        id: fresh.id,
        category_id: String(fresh.category_id),
        name: fresh.name || "",
        description: fresh.description || "",
        status: fresh.status || "active",
        product_type: fresh.product_type || "simple",
        inventory_type:
          fresh.inventory_type ||
          normalizeInventoryForProductType(fresh.product_type || "simple", "ingredients"),
      });
      await loadImages(fresh.id);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      setErr(apiErrorToMessage(e, "No se pudo cargar producto"));
    }
  };

  const onDelete = async (p) => {
    if (!confirm("¿Eliminar producto?")) return;
    try {
      setErr("");
      await deleteProduct(restaurantId, p.id);

      await reloadProducts();
      if (form.id === p.id) resetForm();
    } catch (e) {
      setErr(apiErrorToMessage(e, "No se pudo eliminar"));
    }
  };

  // Navegación
  const buildBranchQuery = () => {
    if (requiresBranch && effectiveBranchId) return `?branch_id=${encodeURIComponent(effectiveBranchId)}`;
    return "";
  };

  const onVariants = (p) => {
    if (!p?.id) return;
    nav(`/owner/restaurants/${restaurantId}/products/${p.id}/variants`, {
      state: { product_name: p?.name || "", products_mode: productsMode, branch_id: effectiveBranchId },
    });
  };

  const onRecipes = (p) => {
    if (!p?.id) return;
    nav(`/owner/restaurants/${restaurantId}/products/${p.id}/recipes`, {
      state: { product_name: p?.name || "", products_mode: productsMode, branch_id: effectiveBranchId },
    });
  };

  const onComponents = (p) => {
    if (!p?.id) return;
    nav(`/owner/restaurants/${restaurantId}/products/${p.id}/components${buildBranchQuery()}`, {
      state: { product_name: p?.name || "", products_mode: productsMode, branch_id: effectiveBranchId },
    });
  };

  // ====== IMÁGENES ======
  // 1) React debe usar img.public_url (contrato Laravel)
  const imageSrc = (img) => img?.public_url || img?.url || "";

  const onUpload = async (file) => {
    if (!selectedProductId) return setErr("Primero guarda el producto");
    if (!file) return;

    if (!canUploadMore) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return setErr(`Ya tienes ${maxImages} imágenes.`);
    }

    setErr("");
    try {
      await uploadProductImage(restaurantId, selectedProductId, file, images.length);
      await loadImages(selectedProductId);
    } catch (e) {
      // Manejo específico del límite (422)
      const msg = apiErrorToMessage(e, "No se pudo subir imagen");
      setErr(msg);
    } finally {
      // reset del input file para permitir subir el mismo archivo otra vez
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onRemoveImage = async (imageId) => {
    if (!selectedProductId) return;
    if (!confirm("¿Eliminar imagen?")) return;

    try {
      await deleteProductImage(restaurantId, selectedProductId, imageId);
      await loadImages(selectedProductId);
    } catch (e) {
      setErr(apiErrorToMessage(e, "No se pudo eliminar imagen"));
    }
  };

  const moveImage = async (index, dir) => {
    if (!selectedProductId) return;
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= images.length) return;

    const copy = [...images];
    [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];

    const items = copy.map((img, i) => ({ id: img.id, sort_order: i }));
    setImages(copy);

    try {
      const updated = await reorderProductImages(restaurantId, selectedProductId, items);
      setImages(updated);
    } catch (e) {
      setErr(apiErrorToMessage(e, "No se pudo reordenar"));
      await loadImages(selectedProductId);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Cargando productos...</div>;

  const formRules = buttonsRules(form.product_type, form.inventory_type);

  return (
    <div style={{ maxWidth: 1100, margin: "30px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Productos</h2>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Restaurante: <strong>{restaurantId}</strong> · Modo: <strong>{productsMode}</strong>
          </div>
        </div>

        <button
          onClick={() => nav(`/owner/restaurants/${restaurantId}/menu`)}
          style={{ padding: "10px 14px", cursor: "pointer" }}
        >
          ← Volver a Menú
        </button>
      </div>

      {requiresBranch && (
        <div style={{ marginTop: 14, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
          <div style={{ fontWeight: 700 }}>Sucursal</div>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            style={{ marginTop: 8, padding: 10, width: "100%", borderRadius: 8 }}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name || `Sucursal ${b.id}`}
              </option>
            ))}
          </select>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
            Estás en modo “por sucursal”. Aquí administras el catálogo base de ESTA sucursal.
          </div>
        </div>
      )}

      {err && (
        <div style={{ marginTop: 12, background: "#ffe5e5", padding: 10, whiteSpace: "pre-line" }}>
          {err}
        </div>
      )}

      {/* filtros */}
      <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Categoría</div>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            style={{ padding: 10, borderRadius: 8 }}
            disabled={!categories.length}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Inactivos</div>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => {
                const v = e.target.checked;
                setIncludeInactive(v);
                if (!v) setStatusFilter("all");
              }}
            />
            Incluir
          </label>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Filtro estado</div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: 10, borderRadius: 8 }}
            disabled={!includeInactive}
          >
            <option value="all">Todos</option>
            <option value="active">Solo activos</option>
            <option value="inactive">Solo inactivos</option>
          </select>
        </div>

        <button
          onClick={resetForm}
          style={{ marginLeft: "auto", padding: "10px 14px", cursor: "pointer" }}
        >
          + Nuevo producto
        </button>
      </div>

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "420px 1fr", gap: 14 }}>
        {/* Form */}
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>
            {form.id ? "Editar producto" : "Crear producto"}
          </div>

          <form onSubmit={onSubmit}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Categoría</div>
              <select
                value={form.category_id || categoryId}
                onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
                style={{ width: "100%", padding: 10, borderRadius: 8 }}
                disabled={!categories.length}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Nombre</div>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Descripción</div>
              <input
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Status</div>
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  style={{ width: "100%", padding: 10, borderRadius: 8 }}
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                  Nota: Laravel puede rechazar “active” si faltan receta/componentes.
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Tipo</div>
                <div style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fafafa" }}>
                  {productsMode === "global" ? "Global (catálogo base)" : "Sucursal (catálogo base)"}
                </div>
              </div>
            </div>

            {/* tipo + inventario */}
            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Tipo de producto</div>
                <select
                  value={form.product_type}
                  onChange={(e) => onChangeProductType(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8 }}
                >
                  {PRODUCT_TYPES.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Tipo de inventario</div>
                <select
                  value={form.inventory_type}
                  onChange={(e) => onChangeInventoryType(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8 }}
                >
                  {inventoryOptions.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>

                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                  {getModeKey(form.product_type, form.inventory_type) === "simple:ingredients" &&
                    "Descuenta ingredientes (requiere receta)."}
                  {getModeKey(form.product_type, form.inventory_type) === "simple:product" &&
                    "Descuenta stock del producto (no usa receta)."}
                  {getModeKey(form.product_type, form.inventory_type) === "composite:none" &&
                    "No descuenta directo. Los componentes descuentan por su propia lógica."}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="submit" style={{ padding: "10px 12px", cursor: "pointer", borderRadius: 8 }}>
                Guardar
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!form.id) return setErr("Guarda el producto primero.");
                  onComponents({ id: form.id, name: form.name });
                }}
                disabled={!form.id || !formRules.components}
                style={{
                  padding: "10px 12px",
                  cursor: !form.id || !formRules.components ? "not-allowed" : "pointer",
                  borderRadius: 8,
                  background: form.id && formRules.components ? "#fff2cc" : "#f3f3f3",
                  border: "1px solid #ddd",
                  fontWeight: 900,
                  opacity: form.id && formRules.components ? 1 : 0.6,
                }}
              >
                Componentes
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!form.id) return setErr("Guarda el producto primero.");
                  onVariants({ id: form.id, name: form.name });
                }}
                disabled={!form.id || !formRules.variants}
                style={{
                  padding: "10px 12px",
                  cursor: !form.id || !formRules.variants ? "not-allowed" : "pointer",
                  borderRadius: 8,
                  background: form.id && formRules.variants ? "#f0f0ff" : "#f3f3f3",
                  border: "1px solid #cfcfff",
                  fontWeight: 900,
                  opacity: form.id && formRules.variants ? 1 : 0.6,
                }}
              >
                Variantes
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!form.id) return setErr("Guarda el producto primero.");
                  onRecipes({ id: form.id, name: form.name });
                }}
                disabled={!form.id || !formRules.recipes}
                style={{
                  padding: "10px 12px",
                  cursor: !form.id || !formRules.recipes ? "not-allowed" : "pointer",
                  borderRadius: 8,
                  background: form.id && formRules.recipes ? "#e8fff3" : "#f3f3f3",
                  border: "1px solid #b8f0ce",
                  fontWeight: 900,
                  opacity: form.id && formRules.recipes ? 1 : 0.6,
                }}
              >
                Recetas
              </button>
            </div>
          </form>

          {/* Images */}
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #eee" }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>
              Imágenes (máx {maxImages})
              {imagesLoading && <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>cargando...</span>}
            </div>

            {!form.id ? (
              <div style={{ fontSize: 12, opacity: 0.8 }}>Guarda el producto para poder subir imágenes.</div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    disabled={!canUploadMore}
                    onChange={(e) => onUpload(e.target.files?.[0])}
                  />
                  {!canUploadMore && (
                    <span style={{ fontSize: 12, color: "#a10000" }}>
                      Ya tienes {maxImages} imágenes.
                    </span>
                  )}
                </div>

                <div
                  style={{
                    marginTop: 10,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                    gap: 10,
                  }}
                >
                  {images.map((img, idx) => (
                    <div
                      key={img.id}
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: 10,
                        padding: 8,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: "1 / 1",
                          overflow: "hidden",
                          borderRadius: 8,
                          border: "1px solid #eee",
                          background: "#fafafa",
                        }}
                      >
                        <img
                          src={imageSrc(img)}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          loading="lazy"
                          onError={(ev) => {
                            // fallback visual si el archivo no existe o se rompe la URL
                            ev.currentTarget.style.display = "none";
                            const parent = ev.currentTarget.parentElement;
                            if (parent && !parent.querySelector(".img-fallback")) {
                              const d = document.createElement("div");
                              d.className = "img-fallback";
                              d.style.height = "100%";
                              d.style.display = "grid";
                              d.style.placeItems = "center";
                              d.style.fontSize = "12px";
                              d.style.opacity = "0.7";
                              d.innerText = "Sin imagen";
                              parent.appendChild(d);
                            }
                          }}
                        />
                      </div>

                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => moveImage(idx, -1)}
                          style={{ flex: 1, padding: "8px 10px", cursor: "pointer" }}
                          disabled={idx === 0}
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveImage(idx, 1)}
                          style={{ flex: 1, padding: "8px 10px", cursor: "pointer" }}
                          disabled={idx === images.length - 1}
                        >
                          ↓
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveImage(img.id)}
                        style={{ width: "100%", padding: "8px 10px", cursor: "pointer", background: "#ffe5e5" }}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* List */}
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Listado</div>

          {products.length === 0 ? (
            <div style={{ opacity: 0.8 }}>No hay productos en este filtro.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {products.map((p) => {
                const pt = p.product_type || "simple";
                const it = p.inventory_type || normalizeInventoryForProductType(pt, "ingredients");

                const ptLabel = labelFromOptions(PRODUCT_TYPES, pt, pt);
                const itLabel = labelFromOptions(INVENTORY_TYPES, it, it);
                const rules = buttonsRules(pt, it);

                return (
                  <div
                    key={p.id}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 10,
                      padding: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 900 }}>{p.name}</div>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>
                        Estado: <strong>{p.status}</strong> · Tipo:{" "}
                        <strong>{p.is_global ? "global" : "branch"}</strong>
                        <span style={{ marginLeft: 8 }}>
                          · Producto: <strong>{ptLabel}</strong>
                        </span>
                        <span style={{ marginLeft: 8 }}>
                          · Inventario: <strong>{itLabel}</strong>
                        </span>
                      </div>

                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                        Categoría: <strong>{p.category?.name || "—"}</strong>
                      </div>

                      {p.description && <div style={{ marginTop: 6 }}>{p.description}</div>}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => onComponents(p)}
                        disabled={!rules.components}
                        style={{
                          padding: "8px 10px",
                          cursor: rules.components ? "pointer" : "not-allowed",
                          background: rules.components ? "#fff2cc" : "#f3f3f3",
                          border: "1px solid #ddd",
                          borderRadius: 8,
                          fontWeight: 900,
                          opacity: rules.components ? 1 : 0.6,
                        }}
                      >
                        Componentes
                      </button>

                      <button
                        onClick={() => onVariants(p)}
                        disabled={!rules.variants}
                        style={{
                          padding: "8px 10px",
                          cursor: rules.variants ? "pointer" : "not-allowed",
                          background: rules.variants ? "#f0f0ff" : "#f3f3f3",
                          border: "1px solid #cfcfff",
                          borderRadius: 8,
                          fontWeight: 900,
                          opacity: rules.variants ? 1 : 0.6,
                        }}
                      >
                        Variantes
                      </button>

                      <button
                        onClick={() => onRecipes(p)}
                        disabled={!rules.recipes}
                        style={{
                          padding: "8px 10px",
                          cursor: rules.recipes ? "pointer" : "not-allowed",
                          background: rules.recipes ? "#e8fff3" : "#f3f3f3",
                          border: "1px solid #b8f0ce",
                          borderRadius: 8,
                          fontWeight: 900,
                          opacity: rules.recipes ? 1 : 0.6,
                        }}
                      >
                        Recetas
                      </button>

                      <button onClick={() => onEdit(p)} style={{ padding: "8px 10px", cursor: "pointer" }}>
                        Editar
                      </button>

                      <button
                        onClick={() => onDelete(p)}
                        style={{ padding: "8px 10px", cursor: "pointer", background: "#ffe5e5" }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {productsMode === "global" && (
            <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
              Nota: Estos productos solo son “catálogo base”. Lo que realmente vende cada sucursal se define en{" "}
              <strong>Sucursal → Catálogo</strong>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
