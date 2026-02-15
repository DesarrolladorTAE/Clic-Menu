import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getRestaurantSettings } from "../../services/restaurant/restaurantSettings.service";
import { getBranchesByRestaurant } from "../../services/restaurant/branch.service";

import {
  getMenuSections,
  createMenuSection,
  updateMenuSection,
  deleteMenuSection,
} from "../../services/menu/menuSections.service";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/menu/categories.service";

export default function MenuManager() {
  const nav = useNavigate();
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [settings, setSettings] = useState(null);
  const productsMode = settings?.products_mode || "global";
  const requiresBranch = productsMode === "branch";

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState(""); // solo aplica si requiresBranch

  const [tab, setTab] = useState("sections");

  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);

  // forms
  const [sectionForm, setSectionForm] = useState({
    id: null,
    name: "",
    description: "",
    sort_order: 0,
    status: "active",
  });

  const [categoryForm, setCategoryForm] = useState({
    id: null,
    section_id: "",
    name: "",
    description: "",
    sort_order: 0,
    status: "active",
  });

  const effectiveBranchId = useMemo(() => {
    if (!requiresBranch) return null;
    return branchId ? Number(branchId) : null;
  }, [requiresBranch, branchId]);

  // Mapa: section_id -> section.name (NO mostrar IDs al usuario)
  const sectionNameById = useMemo(() => {
    const map = {};
    sections.forEach((s) => {
      map[s.id] = s.name;
    });
    return map;
  }, [sections]);

  // helper para pintar el nombre
  const getSectionLabel = (section_id) => {
    if (!section_id) return "Sin sección";
    return sectionNameById[section_id] || "Sección eliminada";
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

        // ✅ elegimos una sucursal efectiva desde aquí
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

      const query =
        st?.products_mode === "branch" && chosenBranchId
          ? { branch_id: chosenBranchId }
          : {};

      const [sec, cat] = await Promise.all([
        getMenuSections(restaurantId, query),
        getCategories(restaurantId, query),
      ]);

      setSections(sec || []);
      setCategories(cat || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo cargar el módulo de menú");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  // Si cambia branch en modo branch, recarga listas filtradas
  useEffect(() => {
    if (!requiresBranch) return;
    if (!effectiveBranchId) return;

    (async () => {
      try {
        const [sec, cat] = await Promise.all([
          getMenuSections(restaurantId, { branch_id: effectiveBranchId }),
          getCategories(restaurantId, { branch_id: effectiveBranchId }),
        ]);
        setSections(sec || []);
        setCategories(cat || []);
      } catch (e) {
        console.log("Error recargando por sucursal", e?.response?.data || e?.message);
      }
    })();
  }, [requiresBranch, effectiveBranchId, restaurantId]);

  const resetSectionForm = () =>
    setSectionForm({
      id: null,
      name: "",
      description: "",
      sort_order: 0,
      status: "active",
    });

  const resetCategoryForm = () =>
    setCategoryForm({
      id: null,
      section_id: "",
      name: "",
      description: "",
      sort_order: 0,
      status: "active",
    });

  const onSubmitSection = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const payload = {
        branch_id: requiresBranch ? effectiveBranchId : null,
        name: sectionForm.name,
        description: sectionForm.description || null,
        sort_order: Number(sectionForm.sort_order || 0),
        status: sectionForm.status || "active",
      };

      if (!payload.name?.trim()) {
        setErr("El nombre de sección es obligatorio");
        return;
      }
      if (requiresBranch && !payload.branch_id) {
        setErr("Selecciona una sucursal (tu configuración está por sucursal).");
        return;
      }

      if (sectionForm.id) {
        await updateMenuSection(restaurantId, sectionForm.id, payload);
      } else {
        await createMenuSection(restaurantId, payload);
      }

      const sec = await getMenuSections(
        restaurantId,
        requiresBranch && payload.branch_id ? { branch_id: payload.branch_id } : {}
      );
      setSections(sec || []);
      resetSectionForm();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "No se pudo guardar la sección");
    }
  };

  const onSubmitCategory = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const payload = {
        branch_id: requiresBranch ? effectiveBranchId : null,
        section_id: categoryForm.section_id ? Number(categoryForm.section_id) : null,
        name: categoryForm.name,
        description: categoryForm.description || null,
        sort_order: Number(categoryForm.sort_order || 0),
        status: categoryForm.status || "active",
      };

      if (!payload.name?.trim()) {
        setErr("El nombre de categoría es obligatorio");
        return;
      }
      if (requiresBranch && !payload.branch_id) {
        setErr("Selecciona una sucursal (tu configuración está por sucursal).");
        return;
      }

      if (categoryForm.id) {
        await updateCategory(restaurantId, categoryForm.id, payload);
      } else {
        await createCategory(restaurantId, payload);
      }

      const cat = await getCategories(
        restaurantId,
        requiresBranch && payload.branch_id ? { branch_id: payload.branch_id } : {}
      );
      setCategories(cat || []);
      resetCategoryForm();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "No se pudo guardar la categoría");
    }
  };

  const onEditSection = (s) =>
    setSectionForm({
      id: s.id,
      name: s.name || "",
      description: s.description || "",
      sort_order: s.sort_order ?? 0,
      status: s.status || "active",
    });

  const onEditCategory = (c) =>
    setCategoryForm({
      id: c.id,
      section_id: c.section_id ? String(c.section_id) : "",
      name: c.name || "",
      description: c.description || "",
      sort_order: c.sort_order ?? 0,
      status: c.status || "active",
    });

  const onDeleteSection = async (id) => {
    if (!confirm("¿Eliminar esta sección?")) return;
    try {
      await deleteMenuSection(restaurantId, id);
      const sec = await getMenuSections(
        restaurantId,
        requiresBranch && effectiveBranchId ? { branch_id: effectiveBranchId } : {}
      );
      setSections(sec || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo eliminar sección");
    }
  };

  const onDeleteCategory = async (id) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    try {
      await deleteCategory(restaurantId, id);
      const cat = await getCategories(
        restaurantId,
        requiresBranch && effectiveBranchId ? { branch_id: effectiveBranchId } : {}
      );
      setCategories(cat || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo eliminar categoría");
    }
  };

  // Ir a Sales Channels respetando sucursal si aplica
  const goSalesChannels = () => {
    setErr("");

    if (requiresBranch) {
      if (!effectiveBranchId) {
        setErr("Selecciona una sucursal para administrar canales (modo por sucursal).");
        return;
      }
      nav(`/owner/restaurants/${restaurantId}/sales-channels?branch_id=${effectiveBranchId}`);
      return;
    }

    nav(`/owner/restaurants/${restaurantId}/sales-channels`);
  };

  if (loading) return <div style={{ padding: 16 }}>Cargando módulo de menú...</div>;

  return (
    <div style={{ maxWidth: 980, margin: "30px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Menú base</h2>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Restaurante: <strong>{restaurantId}</strong> · Modo productos:{" "}
            <strong>{productsMode}</strong>
          </div>
        </div>

        <button
          onClick={() => nav(`/owner/restaurants`)}
          style={{ padding: "10px 14px", cursor: "pointer" }}
        >
          ← Volver
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
            Como configuraste el restaurante “por sucursal”, secciones/categorías se administran por
            sucursal.
          </div>
        </div>
      )}

      {err && <div style={{ marginTop: 14, background: "#ffe5e5", padding: 10, whiteSpace: "pre-line" }}>{err}</div>}

      {/* Tabs */}
      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => setTab("sections")}
          style={{
            padding: "10px 12px",
            cursor: "pointer",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: tab === "sections" ? "#f3f3ff" : "#fff",
            fontWeight: 700,
          }}
        >
          Secciones
        </button>

        <button
          onClick={() => setTab("categories")}
          style={{
            padding: "10px 12px",
            cursor: "pointer",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: tab === "categories" ? "#f3f3ff" : "#fff",
            fontWeight: 700,
          }}
        >
          Categorías
        </button>

        <button
          onClick={() => nav(`/owner/restaurants/${restaurantId}/products`)}
          style={{
            marginLeft: "auto",
            padding: "10px 12px",
            cursor: "pointer",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "#fff",
          }}
        >
          Administrar Productos
        </button>

      </div>

      {/* Secciones */}
      {tab === "sections" && (
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "380px 1fr", gap: 14 }}>
          <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>
              {sectionForm.id ? "Editar sección" : "Crear sección"}
            </div>

            <form onSubmit={onSubmitSection}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Nombre</div>
                <input
                  value={sectionForm.name}
                  onChange={(e) => setSectionForm((p) => ({ ...p, name: e.target.value }))}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Descripción</div>
                <input
                  value={sectionForm.description}
                  onChange={(e) => setSectionForm((p) => ({ ...p, description: e.target.value }))}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Orden</div>
                  <input
                    type="number"
                    value={sectionForm.sort_order}
                    onChange={(e) => setSectionForm((p) => ({ ...p, sort_order: e.target.value }))}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Estado</div>
                  <select
                    value={sectionForm.status}
                    onChange={(e) => setSectionForm((p) => ({ ...p, status: e.target.value }))}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                <button type="submit" style={{ padding: "10px 12px", cursor: "pointer", borderRadius: 8 }}>
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={resetSectionForm}
                  style={{ padding: "10px 12px", cursor: "pointer", borderRadius: 8, background: "#f6f6f6" }}
                >
                  Limpiar
                </button>
              </div>
            </form>
          </div>

          <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Lista de secciones</div>

            {sections.length === 0 ? (
              <div style={{ opacity: 0.8 }}>No hay secciones aún.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {sections
                  .slice()
                  .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                  .map((s) => (
                    <div
                      key={s.id}
                      style={{
                        padding: 12,
                        border: "1px solid #eee",
                        borderRadius: 10,
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800 }}>
                          {s.name}{" "}
                          <span style={{ fontSize: 12, opacity: 0.7 }}>
                            (order: {s.sort_order ?? 0})
                          </span>
                        </div>
                        {s.description && <div style={{ marginTop: 4, opacity: 0.9 }}>{s.description}</div>}
                        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                          status: <strong>{s.status}</strong>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
                        <button onClick={() => onEditSection(s)} style={{ padding: "8px 10px", cursor: "pointer" }}>
                          Editar
                        </button>
                        <button
                          onClick={() => onDeleteSection(s.id)}
                          style={{ padding: "8px 10px", cursor: "pointer", background: "#ffe5e5" }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Categorías */}
      {tab === "categories" && (
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "380px 1fr", gap: 14 }}>
          <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>
              {categoryForm.id ? "Editar categoría" : "Crear categoría"}
            </div>

            <form onSubmit={onSubmitCategory}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Sección (opcional)</div>
                <select
                  value={categoryForm.section_id}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, section_id: e.target.value }))}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                >
                  <option value="">Sin sección</option>
                  {sections
                    .slice()
                    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Nombre</div>
                <input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Descripción</div>
                <input
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Orden</div>
                  <input
                    type="number"
                    value={categoryForm.sort_order}
                    onChange={(e) => setCategoryForm((p) => ({ ...p, sort_order: e.target.value }))}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Estado</div>
                  <select
                    value={categoryForm.status}
                    onChange={(e) => setCategoryForm((p) => ({ ...p, status: e.target.value }))}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                <button type="submit" style={{ padding: "10px 12px", cursor: "pointer", borderRadius: 8 }}>
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  style={{ padding: "10px 12px", cursor: "pointer", borderRadius: 8, background: "#f6f6f6" }}
                >
                  Limpiar
                </button>
              </div>
            </form>
          </div>

          <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Lista de categorías</div>

            {categories.length === 0 ? (
              <div style={{ opacity: 0.8 }}>No hay categorías aún.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {categories
                  .slice()
                  .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                  .map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: 12,
                        border: "1px solid #eee",
                        borderRadius: 10,
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800 }}>
                          {c.name}{" "}
                          <span style={{ fontSize: 12, opacity: 0.7 }}>
                            (order: {c.sort_order ?? 0})
                          </span>
                        </div>

                        {c.description && <div style={{ marginTop: 4, opacity: 0.9 }}>{c.description}</div>}

                        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                          Sección: <strong>{getSectionLabel(c.section_id)}</strong> · status:{" "}
                          <strong>{c.status}</strong>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
                        <button onClick={() => onEditCategory(c)} style={{ padding: "8px 10px", cursor: "pointer" }}>
                          Editar
                        </button>
                        <button
                          onClick={() => onDeleteCategory(c.id)}
                          style={{ padding: "8px 10px", cursor: "pointer", background: "#ffe5e5" }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
