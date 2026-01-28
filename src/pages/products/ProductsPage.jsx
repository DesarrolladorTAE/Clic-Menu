import { useEffect, useMemo, useState } from "react";
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

export default function ProductsPage() {
  const nav = useNavigate();
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // settings + mode
  const [settings, setSettings] = useState(null);
  const productsMode = settings?.products_mode || "global";
  const requiresBranch = productsMode === "branch";

  // branches (solo branch mode)
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
  });

  // ===== images state =====
  const [images, setImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const canUploadMore = images.length < 6;
  const selectedProductId = form.id;

  const listParams = useMemo(() => {
    const p = {};

    // Branch filtering (solo en modo branch)
    if (requiresBranch && effectiveBranchId) {
      p.branch_id = effectiveBranchId;
    }

    if (categoryId) p.category_id = categoryId;

    if (includeInactive) {
      p.include_inactive = true;
      if (statusFilter === "active" || statusFilter === "inactive") p.status = statusFilter;
    }

    return p;
  }, [requiresBranch, effectiveBranchId, categoryId, includeInactive, statusFilter]);

  const resetForm = () => {
    setForm({
      id: null,
      category_id: categoryId || "",
      name: "",
      description: "",
      status: "active",
    });
    setImages([]);
  };

  const loadImages = async (productId) => {
    if (!productId) return;
    setImagesLoading(true);
    try {
      const imgs = await getProductImages(restaurantId, productId);
      setImages(imgs);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudieron cargar imágenes");
    } finally {
      setImagesLoading(false);
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

        if (!branchId && chosenBranchId) setBranchId(String(chosenBranchId));
      } else {
        setBranches([]);
        setBranchId("");
      }

      // Cargar categorías según modo
      const catQuery =
        st?.products_mode === "branch" && chosenBranchId
          ? { status: "active", branch_id: chosenBranchId }
          : { status: "active" };

      const cats = await getCategories(restaurantId, catQuery);
      setCategories(cats || []);

      // Elegir categoría efectiva (primera si no hay seleccionada)
      const firstCatId = cats?.[0]?.id ? String(cats[0].id) : "";
      const effectiveCategoryId = categoryId || firstCatId;

      if (!categoryId && firstCatId) setCategoryId(firstCatId);

      // Cargar productos según modo
      const prodQuery =
        st?.products_mode === "branch" && chosenBranchId
          ? { ...listParams, branch_id: chosenBranchId, category_id: effectiveCategoryId || undefined }
          : { ...listParams, category_id: effectiveCategoryId || undefined };

      const list = await getProducts(restaurantId, prodQuery);
      setProducts(list || []);

      // Ajustar form category
      setForm((p) => ({
        ...p,
        category_id: p.category_id || effectiveCategoryId || "",
      }));
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo cargar productos");
    } finally {
      setLoading(false);
    }
  };

  // carga inicial
  useEffect(() => {
    loadAll();
    // eslint-disable-next-line
  }, [restaurantId]);

  // recargar cuando cambien filtros o sucursal (si aplica)
  useEffect(() => {
    if (loading) return;

    if (requiresBranch && !effectiveBranchId) return;

    (async () => {
      try {
        // categorías también deben seguir a la sucursal en modo branch
        if (requiresBranch && effectiveBranchId) {
          const cats = await getCategories(restaurantId, { status: "active", branch_id: effectiveBranchId });
          setCategories(cats || []);

          // Si la categoría seleccionada ya no existe en esa sucursal, se resetea
          const exists = (cats || []).some((c) => String(c.id) === String(categoryId));
          if (!exists) {
            const first = cats?.[0]?.id ? String(cats[0].id) : "";
            setCategoryId(first);
            setForm((p) => ({ ...p, category_id: p.category_id || first || "" }));
          }
        }

        const list = await getProducts(restaurantId, listParams);
        setProducts(list || []);
      } catch {}
    })();
    // eslint-disable-next-line
  }, [listParams, restaurantId, requiresBranch, effectiveBranchId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (requiresBranch && !effectiveBranchId) return setErr("Selecciona una sucursal.");
    if (!form.category_id) return setErr("Selecciona categoría");
    if (!form.name?.trim()) return setErr("Nombre obligatorio");

    try {
      const payload = {
        category_id: Number(form.category_id),
        name: form.name.trim(),
        description: form.description?.trim() || null,
        status: form.status,
        // FORZAR según modo
        is_global: productsMode === "global",
        branch_id: productsMode === "branch" ? effectiveBranchId : null,
      };

      let saved = null;
      if (form.id) saved = await updateProduct(restaurantId, form.id, payload);
      else saved = await createProduct(restaurantId, payload);

      const list = await getProducts(restaurantId, listParams);
      setProducts(list || []);

      setForm((p) => ({
        ...p,
        id: saved.id,
        category_id: String(saved.category_id),
      }));

      await loadImages(saved.id);
    } catch (e2) {
      const m =
        e2?.response?.data?.message ||
        (e2?.response?.data?.errors
          ? Object.values(e2.response.data.errors).flat().join("\n")
          : "No se pudo guardar producto");
      setErr(m);
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
      });
    } catch {
      setForm({
        id: p.id,
        category_id: String(p.category_id),
        name: p.name || "",
        description: p.description || "",
        status: p.status || "active",
      });
    }

    await loadImages(p.id);
  };

  const onDelete = async (p) => {
    if (!confirm("¿Eliminar producto?")) return;
    try {
      setErr("");
      await deleteProduct(restaurantId, p.id);

      const list = await getProducts(restaurantId, listParams);
      setProducts(list || []);

      if (form.id === p.id) resetForm();
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo eliminar");
    }
  };

  const onUpload = async (file) => {
    if (!selectedProductId) return setErr("Primero guarda el producto");
    if (!file) return;

    setErr("");
    try {
      await uploadProductImage(restaurantId, selectedProductId, file, images.length);
      await loadImages(selectedProductId);
    } catch (e) {
      const m =
        e?.response?.data?.message ||
        (e?.response?.data?.errors
          ? Object.values(e.response.data.errors).flat().join("\n")
          : "No se pudo subir imagen");
      setErr(m);
    }
  };

  const onRemoveImage = async (imageId) => {
    if (!selectedProductId) return;
    try {
      await deleteProductImage(restaurantId, selectedProductId, imageId);
      await loadImages(selectedProductId);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo eliminar imagen");
    }
  };

  const moveImage = async (index, dir) => {
    if (!selectedProductId) return;
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= images.length) return;

    const copy = [...images];
    const tmp = copy[index];
    copy[index] = copy[newIndex];
    copy[newIndex] = tmp;

    const items = copy.map((img, i) => ({ id: img.id, sort_order: i }));
    setImages(copy);

    try {
      const updated = await reorderProductImages(restaurantId, selectedProductId, items);
      setImages(updated);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo reordenar");
      await loadImages(selectedProductId);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Cargando productos...</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "30px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Productos</h2>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Restaurante: <strong>{restaurantId}</strong> · Modo:{" "}
            <strong>{productsMode}</strong>
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
              <option key={c.id} value={c.id}>{c.name}</option>
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
                  <option key={c.id} value={c.id}>{c.name}</option>
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
              </div>

              {/* Nota visual según modo, sin checkbox is_global */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Tipo</div>
                <div style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fafafa" }}>
                  {productsMode === "global" ? "Global (catálogo base)" : "Sucursal (catálogo base)"}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                  {productsMode === "global"
                    ? "Se guardará como producto global."
                    : "Se guardará ligado a la sucursal seleccionada."}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <button type="submit" style={{ padding: "10px 12px", cursor: "pointer", borderRadius: 8 }}>
                Guardar
              </button>
            </div>
          </form>

          {/* Images */}
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #eee" }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>
              Imágenes (máx 6)
              {imagesLoading && (
                <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>cargando...</span>
              )}
            </div>

            {!form.id ? (
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                Guarda el producto para poder subir imágenes.
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={!canUploadMore}
                    onChange={(e) => onUpload(e.target.files?.[0])}
                  />
                  {!canUploadMore && (
                    <span style={{ fontSize: 12, color: "#a10000" }}>
                      Ya tienes 6 imágenes.
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
                          src={img.url}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          loading="lazy"
                        />
                      </div>

                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => moveImage(idx, -1)}
                          style={{ flex: 1, padding: "8px 10px", cursor: "pointer" }}
                          disabled={idx === 0}
                          title="Subir"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveImage(idx, 1)}
                          style={{ flex: 1, padding: "8px 10px", cursor: "pointer" }}
                          disabled={idx === images.length - 1}
                          title="Bajar"
                        >
                          ↓
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveImage(img.id)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          cursor: "pointer",
                          background: "#ffe5e5",
                        }}
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
              {products.map((p) => (
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
                      {p.branch_id ? (
                        <span style={{ marginLeft: 8, opacity: 0.75 }}>
                          (branch_id: {p.branch_id})
                        </span>
                      ) : null}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                      Categoría: <strong>{p.category?.name || "—"}</strong>
                    </div>
                    {p.description && <div style={{ marginTop: 6 }}>{p.description}</div>}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
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
              ))}
            </div>
          )}

          {productsMode === "global" && (
            <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
              Nota: Estos productos solo son “catálogo base”. Lo que realmente vende cada sucursal se define en <strong>Sucursal → Catálogo</strong>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
