import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { getRestaurantSettings } from "../../services/restaurantSettings.service";
import { getBranchesByRestaurant } from "../../services/branch.service";
import { getIngredients } from "../../services/inventory/ingredients/ingredients.service";// ajusta si tu path real es otro

import {
  getProductRecipes,
  upsertProductRecipeBase,
  upsertProductRecipeVariant,
  setProductRecipeItemStatus,
} from "../../services/inventory/recipes/productRecipes.service";

export default function ProductRecipesPage() {
  const nav = useNavigate();
  const { restaurantId, productId } = useParams();
  const location = useLocation();

  const productNameFromState = location?.state?.product_name || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // settings
  const [settings, setSettings] = useState(null);
  const recipeMode = settings?.recipe_mode || "global"; // global | branch
  const branchMode = recipeMode === "branch";

  // branches
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState(""); // select string

  const effectiveBranchId = useMemo(() => {
    if (!branchMode) return null;
    return branchId ? Number(branchId) : null;
  }, [branchMode, branchId]);

  // ingredients (solo activos para selector)
  const [ingredients, setIngredients] = useState([]);
  const ingredientsById = useMemo(() => {
    const m = new Map();
    (ingredients || []).forEach((it) => m.set(Number(it.id), it));
    return m;
  }, [ingredients]);

  // API data
  const [product, setProduct] = useState({ id: null, name: "" });
  const [baseItems, setBaseItems] = useState([]);
  const [variants, setVariants] = useState([]);

  // Modal editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTitle, setEditorTitle] = useState("");
  const [editorVariantId, setEditorVariantId] = useState(null); // null = base
  const [editorItems, setEditorItems] = useState([]); // [{id?, ingredient_id, qty, notes, status, ingredient?}]

  const canUseBranch = !branchMode || !!effectiveBranchId;

  const loadAll = async () => {
    setErr("");
    setLoading(true);
    try {
      const st = await getRestaurantSettings(restaurantId);
      setSettings(st);

      // branches si recipe_mode=branch
      if ((st?.recipe_mode || "global") === "branch") {
        const br = await getBranchesByRestaurant(restaurantId);
        setBranches(br || []);

        const chosen = branchId
          ? Number(branchId)
          : br?.[0]?.id
          ? Number(br[0].id)
          : null;

        if (!branchId && chosen) setBranchId(String(chosen));
      } else {
        setBranches([]);
        setBranchId("");
      }

      // ingredientes activos para selector
      const ingResp = await getIngredients(restaurantId, { only_active: true, q: "" });
      setIngredients(ingResp?.data || []);

      // recetas
      const branchParam = (st?.recipe_mode || "global") === "branch" ? (branchId ? Number(branchId) : (st ? null : null)) : null;
      // Nota: branchParam real lo definimos abajo al recargar, aquí hacemos un primer fetch sin branch si es global.
      // Si es branch-mode y aún no hay branchId seleccionado, el backend responde 422, lo manejamos.
      try {
        const recipes = await getProductRecipes(restaurantId, productId, {
          branch_id: (st?.recipe_mode || "global") === "branch" ? (branchId ? Number(branchId) : null) : null,
        });
        hydrateFromRecipes(recipes);
      } catch (e) {
        // Si es branch-mode y aún no hay branch_id, no truena todo, solo deja aviso
        const msg =
          e?.response?.data?.message ||
          (e?.response?.data?.errors
            ? Object.values(e.response.data.errors).flat().join("\n")
            : "No se pudieron cargar recetas");
        setErr(msg);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo cargar la pantalla de recetas");
    } finally {
      setLoading(false);
    }
  };

  const hydrateFromRecipes = (recipesResp) => {
    const d = recipesResp?.data || {};
    setProduct({
      id: d?.product?.id || Number(productId),
      name: d?.product?.name || productNameFromState || "",
    });
    setBaseItems(d?.base_items || []);
    setVariants(d?.variants || []);
  };

  // carga inicial
  useEffect(() => {
    loadAll();
    // eslint-disable-next-line
  }, [restaurantId, productId]);

  // recargar recetas cuando cambia sucursal (branch-mode)
  useEffect(() => {
    if (loading) return;
    if (!branchMode) return;

    if (!effectiveBranchId) {
      // branch mode requiere branch
      setBaseItems([]);
      setVariants((prev) => prev || []);
      return;
    }

    (async () => {
      try {
        setErr("");
        const recipes = await getProductRecipes(restaurantId, productId, { branch_id: effectiveBranchId });
        hydrateFromRecipes(recipes);
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          (e?.response?.data?.errors
            ? Object.values(e.response.data.errors).flat().join("\n")
            : "No se pudieron cargar recetas");
        setErr(msg);
      }
    })();
    // eslint-disable-next-line
  }, [effectiveBranchId, branchMode, restaurantId, productId]);

  const openBaseEditor = () => {
    setErr("");
    setEditorVariantId(null);
    setEditorTitle("Receta del producto");
    setEditorItems(normalizeItemsForEditor(baseItems));
    setEditorOpen(true);
  };

  const openVariantEditor = (variant) => {
    setErr("");
    setEditorVariantId(variant?.id);
    setEditorTitle(`Receta de variante: ${variant?.name || `#${variant?.id}`}`);
    setEditorItems(normalizeItemsForEditor(variant?.items || []));
    setEditorOpen(true);
  };

  const normalizeItemsForEditor = (items) => {
    return (items || []).map((it) => ({
      id: it.id ?? null,
      ingredient_id: Number(it.ingredient_id),
      qty: Number(it.qty),
      notes: it.notes ?? "",
      status: it.status || "active",
      ingredient: it.ingredient || null,
      branch_id: it.branch_id ?? null,
      product_variant_id: it.product_variant_id ?? null,
    }));
  };

  const validateEditorItems = (items) => {
    const errors = [];
    const seen = new Set();

    (items || []).forEach((it, idx) => {
      const ingId = Number(it.ingredient_id || 0);
      const qty = Number(it.qty || 0);

      if (!ingId) errors.push(`Fila ${idx + 1}: ingrediente requerido`);
      if (!(qty > 0)) errors.push(`Fila ${idx + 1}: cantidad debe ser > 0`);

      const key = String(ingId);
      if (ingId) {
        if (seen.has(key)) errors.push(`Ingrediente repetido: ${labelIngredient(ingId)}`);
        seen.add(key);
      }

      // Ingrediente activo (selector ya filtra, pero si llega algo raro)
      const ing = ingredientsById.get(ingId);
      if (ing && ing.status && ing.status !== "active") {
        errors.push(`Ingrediente inactivo: ${ing.name}`);
      }
    });

    return errors;
  };

  const labelIngredient = (ingredientId) => {
    const ing = ingredientsById.get(Number(ingredientId));
    if (ing?.name) return ing.name;
    return `#${ingredientId}`;
  };

  const onSaveEditor = async () => {
    setErr("");
    const errors = validateEditorItems(editorItems);
    if (errors.length) {
      setErr(errors.join("\n"));
      return;
    }

    if (branchMode && !effectiveBranchId) {
      setErr("Selecciona una sucursal para editar recetas.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        // en global-mode NO mandes branch_id, backend fuerza null
        ...(branchMode ? { branch_id: effectiveBranchId } : {}),
        items: editorItems.map((it) => ({
          ingredient_id: Number(it.ingredient_id),
          qty: Number(it.qty),
          notes: it.notes?.trim() ? it.notes.trim() : null,
          status: it.status || "active",
        })),
      };

      if (editorVariantId) {
        await upsertProductRecipeVariant(restaurantId, productId, editorVariantId, payload);
      } else {
        await upsertProductRecipeBase(restaurantId, productId, payload);
      }

      // recargar
      const recipes = await getProductRecipes(restaurantId, productId, {
        branch_id: branchMode ? effectiveBranchId : null,
      });
      hydrateFromRecipes(recipes);

      setEditorOpen(false);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        (e?.response?.data?.errors
          ? Object.values(e.response.data.errors).flat().join("\n")
          : "No se pudo guardar la receta");
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  const onToggleItemStatus = async (item, nextStatus) => {
    if (!item?.id) {
      // si aún no existe en BD, solo cambia en UI del editor (si aplica)
      return;
    }
    try {
      setErr("");
      await setProductRecipeItemStatus(restaurantId, productId, item.id, nextStatus);

      // refrescar sin drama
      const recipes = await getProductRecipes(restaurantId, productId, {
        branch_id: branchMode ? effectiveBranchId : null,
      });
      hydrateFromRecipes(recipes);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo cambiar el status");
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Cargando recetas...</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "30px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: 0 }}>
            Recetas — {product.name || productNameFromState || `Producto ${productId}`}
          </h2>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Restaurante: <strong>{restaurantId}</strong> · Producto: <strong>{productId}</strong> · recipe_mode:{" "}
            <strong>{recipeMode}</strong>
          </div>
        </div>

        <button
          onClick={() => nav(-1)}
          style={{ padding: "10px 14px", cursor: "pointer" }}
          title="Regresar"
        >
          ← Volver
        </button>
      </div>

      {branchMode && (
        <div style={{ marginTop: 14, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
          <div style={{ fontWeight: 800 }}>Sucursal</div>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            style={{ marginTop: 8, padding: 10, width: "100%", borderRadius: 8 }}
            disabled={!branches.length}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name || `Sucursal ${b.id}`}
              </option>
            ))}
          </select>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
            En <strong>recipe_mode=branch</strong> las recetas se guardan por sucursal (branch_id).
          </div>
        </div>
      )}

      {!branchMode && (
        <div style={{ marginTop: 14, padding: 12, border: "1px solid #ddd", borderRadius: 10, background: "#fafafa" }}>
          <div style={{ fontWeight: 800 }}>Sucursal</div>
          <div style={{ marginTop: 8, fontSize: 13 }}>
            Selector deshabilitado: <strong>modo de receta global</strong>.
          </div>
        </div>
      )}

      {err && (
        <div style={{ marginTop: 12, background: "#ffe5e5", padding: 10, whiteSpace: "pre-line" }}>
          {err}
        </div>
      )}

      {!canUseBranch && (
        <div style={{ marginTop: 12, background: "#fff7db", padding: 10, whiteSpace: "pre-line" }}>
          En modo sucursal necesitas elegir una sucursal para ver/editar recetas.
        </div>
      )}

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Receta base */}
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <div style={{ fontWeight: 900 }}>1) Receta del producto</div>
            <button
              onClick={openBaseEditor}
              style={{ padding: "8px 10px", cursor: canUseBranch ? "pointer" : "not-allowed", opacity: canUseBranch ? 1 : 0.6 }}
              disabled={!canUseBranch}
            >
              {baseItems?.length ? "Editar receta" : "Crear receta"}
            </button>
          </div>

          {!baseItems?.length ? (
            <div style={{ marginTop: 10, opacity: 0.85 }}>
              Este producto no tiene receta base.
              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                Si no creas receta, las ventas futuras no podrán consumir ingredientes.
              </div>
            </div>
          ) : (
            <RecipeTable
              items={baseItems}
              onToggleStatus={(item, next) => onToggleItemStatus(item, next)}
            />
          )}
        </div>

        {/* Recetas por variante */}
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>2) Recetas por variante</div>

          {!variants?.length ? (
            <div style={{ opacity: 0.85 }}>
              Este producto no tiene variantes.
              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                Si en el futuro agregas variantes, aquí podrás definir recetas específicas por variante.
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {variants.map((v) => {
                const hasRecipe = (v?.items || []).length > 0;
                const enabled = !!v?.is_enabled;

                return (
                  <div key={v.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 900 }}>
                          Variante: {v.name || `Variante ${v.id}`}
                          {!enabled && (
                            <span style={{ marginLeft: 8, fontSize: 12, padding: "2px 6px", borderRadius: 999, background: "#f2f2f2" }}>
                              deshabilitada
                            </span>
                          )}
                        </div>
                        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>
                          {hasRecipe
                            ? "Usa su receta propia."
                            : "No tiene receta: usará la receta del producto."}
                        </div>
                      </div>

                      <button
                        onClick={() => openVariantEditor(v)}
                        style={{
                          padding: "8px 10px",
                          cursor: canUseBranch ? "pointer" : "not-allowed",
                          opacity: canUseBranch ? 1 : 0.6,
                        }}
                        disabled={!canUseBranch}
                        title="Editar/Agregar receta de variante"
                      >
                        {hasRecipe ? "Editar" : "Agregar"}
                      </button>
                    </div>

                    {hasRecipe && (
                      <div style={{ marginTop: 10 }}>
                        <RecipeTable
                          items={v.items}
                          onToggleStatus={(item, next) => onToggleItemStatus(item, next)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal editor */}
      {editorOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 12,
            zIndex: 9999,
          }}
          onClick={() => !saving && setEditorOpen(false)}
        >
          <div
            style={{
              width: "min(980px, 100%)",
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #ddd",
              padding: 14,
              maxHeight: "85vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 1000, fontSize: 18 }}>{editorTitle}</div>
                <div style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>
                  {branchMode ? (
                    <>
                      Sucursal: <strong>{effectiveBranchId || "—"}</strong>
                    </>
                  ) : (
                    <>Global (branch_id = NULL)</>
                  )}
                </div>
              </div>

              <button
                onClick={() => !saving && setEditorOpen(false)}
                style={{ padding: "8px 10px", cursor: saving ? "not-allowed" : "pointer" }}
                disabled={saving}
              >
                ✕ Cerrar
              </button>
            </div>

            <div style={{ marginTop: 12, border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Items</div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={th}>Ingrediente</th>
                      <th style={th}>Cantidad</th>
                      <th style={th}>Notas</th>
                      <th style={th}>Status</th>
                      <th style={th}>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {editorItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: 10, opacity: 0.8 }}>
                          No hay ingredientes. Agrega al menos 1 si quieres que consuma inventario.
                        </td>
                      </tr>
                    ) : (
                      editorItems.map((it, idx) => (
                        <tr key={`${it.ingredient_id}-${idx}`}>
                          <td style={td}>
                            <select
                              value={String(it.ingredient_id || "")}
                              onChange={(e) => {
                                const v = Number(e.target.value || 0);
                                setEditorItems((prev) => {
                                  const copy = [...prev];
                                  copy[idx] = { ...copy[idx], ingredient_id: v };
                                  return copy;
                                });
                              }}
                              style={{ width: "100%", padding: 8, borderRadius: 8 }}
                              disabled={saving}
                            >
                              <option value="">Selecciona…</option>
                              {ingredients.map((ing) => (
                                <option key={ing.id} value={ing.id}>
                                  {ing.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td style={td}>
                            <input
                              type="number"
                              step="0.001"
                              value={String(it.qty ?? "")}
                              onChange={(e) => {
                                const v = e.target.value;
                                setEditorItems((prev) => {
                                  const copy = [...prev];
                                  copy[idx] = { ...copy[idx], qty: v === "" ? "" : Number(v) };
                                  return copy;
                                });
                              }}
                              style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
                              disabled={saving}
                            />
                          </td>

                          <td style={td}>
                            <input
                              value={it.notes ?? ""}
                              onChange={(e) => {
                                const v = e.target.value;
                                setEditorItems((prev) => {
                                  const copy = [...prev];
                                  copy[idx] = { ...copy[idx], notes: v };
                                  return copy;
                                });
                              }}
                              style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
                              disabled={saving}
                            />
                          </td>

                          <td style={td}>
                            <select
                              value={it.status || "active"}
                              onChange={(e) => {
                                const v = e.target.value;
                                setEditorItems((prev) => {
                                  const copy = [...prev];
                                  copy[idx] = { ...copy[idx], status: v };
                                  return copy;
                                });
                              }}
                              style={{ width: "100%", padding: 8, borderRadius: 8 }}
                              disabled={saving}
                            >
                              <option value="active">Activo</option>
                              <option value="inactive">Inactivo</option>
                            </select>
                          </td>

                          <td style={td}>
                            <button
                              onClick={() => {
                                setEditorItems((prev) => prev.filter((_, i) => i !== idx));
                              }}
                              style={{ padding: "8px 10px", cursor: "pointer", background: "#ffe5e5", borderRadius: 8, border: "1px solid #f3b9b9" }}
                              disabled={saving}
                              title="Eliminar fila (se borra al guardar)"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 10, justifyContent: "space-between", flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    setEditorItems((prev) => [
                      ...prev,
                      { ingredient_id: "", qty: 1, notes: "", status: "active" },
                    ]);
                  }}
                  style={{ padding: "10px 12px", cursor: "pointer", borderRadius: 8 }}
                  disabled={saving}
                >
                  ➕ Agregar ingrediente
                </button>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => !saving && setEditorOpen(false)}
                    style={{ padding: "10px 12px", cursor: saving ? "not-allowed" : "pointer", borderRadius: 8 }}
                    disabled={saving}
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={onSaveEditor}
                    style={{
                      padding: "10px 12px",
                      cursor: saving ? "not-allowed" : "pointer",
                      borderRadius: 8,
                      fontWeight: 900,
                      opacity: saving ? 0.7 : 1,
                    }}
                    disabled={saving}
                  >
                    {saving ? "Guardando…" : "💾 Guardar receta"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RecipeTable({ items, onToggleStatus }) {
  return (
    <div style={{ overflowX: "auto", marginTop: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>Ingrediente</th>
            <th style={th}>Cantidad</th>
            <th style={th}>Unidad</th>
            <th style={th}>Notas</th>
            <th style={th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {(items || []).map((it) => {
            const ing = it.ingredient || null;
            const status = it.status || "active";
            const unit = ing?.unit || ing?.unidad || "—";

            return (
              <tr key={it.id || `${it.ingredient_id}-${it.qty}`}>
                <td style={td}>
                  <div style={{ fontWeight: 800 }}>
                    {ing?.name || `Ingrediente ${it.ingredient_id}`}
                  </div>
                  {ing?.status && ing.status !== "active" && (
                    <div style={{ marginTop: 4, fontSize: 12, color: "#a10000" }}>
                      Ingrediente inactivo
                    </div>
                  )}
                </td>
                <td style={td}>{it.qty}</td>
                <td style={td}>{unit}</td>
                <td style={td}>{it.notes || "—"}</td>
                <td style={td}>
                  <button
                    onClick={() => onToggleStatus?.(it, status === "active" ? "inactive" : "active")}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #ddd",
                      cursor: "pointer",
                      background: status === "active" ? "#e8fff3" : "#f2f2f2",
                      fontWeight: 900,
                    }}
                    title="Activar/Desactivar (afecta ventas futuras)"
                  >
                    {status === "active" ? "Activo" : "Inactivo"}
                  </button>
                </td>
              </tr>
            );
          })}

          {(!items || items.length === 0) && (
            <tr>
              <td colSpan={5} style={{ padding: 10, opacity: 0.8 }}>
                Sin receta.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const th = {
  textAlign: "left",
  fontSize: 12,
  fontWeight: 900,
  padding: "8px 10px",
  borderBottom: "1px solid #eee",
  whiteSpace: "nowrap",
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #f2f2f2",
  verticalAlign: "top",
};
