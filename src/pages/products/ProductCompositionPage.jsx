// src/pages/owner/products/ProductCompositionPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { getRestaurantSettings } from "../../services/restaurantSettings.service";
import { getBranchesByRestaurant } from "../../services/branch.service";
import {
  getProductComponents,
  upsertProductComponents,
} from "../../services/catalog/products/productComponents.service";
import { getProduct } from "../../services/products.service";

import CompositionWizard from "../../components/products/CompositionWizard";

function apiErrorToMessage(e, fallback) {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors ? Object.values(e.response.data.errors).flat().join("\n") : "") ||
    fallback
  );
}

export default function ProductCompositionPage() {
  const nav = useNavigate();
  const { restaurantId, productId } = useParams();
  const [sp, setSp] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [settings, setSettings] = useState(null);
  const productsMode = settings?.products_mode || "global";
  const requiresBranch = productsMode === "branch";

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState(""); // selector UI

  const effectiveBranchId = useMemo(() => {
    // En branch-mode: requerido
    if (requiresBranch) return branchId ? Number(branchId) : null;
    // En global-mode: solo lo usamos para candidates (vendibles)
    return branchId ? Number(branchId) : null;
  }, [requiresBranch, branchId]);

  const [product, setProduct] = useState(null);
  const [items, setItems] = useState([]);

  const [wizardOpen, setWizardOpen] = useState(false);

  const branchLabel = useMemo(() => {
    if (!branchId) return "—";
    const b = branches.find((x) => String(x.id) === String(branchId));
    return b?.name || `Sucursal ${branchId}`;
  }, [branches, branchId]);

  const loadAll = async () => {
    setErr("");
    setLoading(true);
    try {
      const st = await getRestaurantSettings(restaurantId);
      setSettings(st);

      // branches
      const br = await getBranchesByRestaurant(restaurantId);
      setBranches(br || []);

      // branch selection:
      // - si viene por query ?branch_id=, úsalo
      // - si no, usa primera
      const qBranch = sp.get("branch_id");
      const chosen =
        qBranch ||
        (br?.[0]?.id ? String(br[0].id) : "");

      if (chosen && chosen !== branchId) setBranchId(chosen);

      // producto
      const p = await getProduct(restaurantId, productId);
      setProduct(p);

      // composición:
      // - branch-mode: requiere branch_id
      // - global-mode: NO requiere, pero igual podemos mandar branch_id para consistencia (backend lo ignora en index por normalizeBranchId->null)
      const params =
        st?.products_mode === "branch"
          ? { branch_id: chosen ? Number(chosen) : undefined }
          : {};

      const comp = await getProductComponents(restaurantId, productId, params);
      setItems(comp?.data?.items || []);
    } catch (e) {
      setErr(apiErrorToMessage(e, "No se pudo cargar composición"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line
  }, [restaurantId, productId]);

  // mantener branch_id en querystring
  useEffect(() => {
    if (!branchId) return;
    const next = new URLSearchParams(sp);
    next.set("branch_id", branchId);
    setSp(next, { replace: true });
    // eslint-disable-next-line
  }, [branchId]);

  const warningCompositeNoItems = useMemo(() => {
    if (!product) return false;
    if ((product.product_type || "simple") !== "composite") return false;
    return (items?.length || 0) === 0;
  }, [product, items]);

  const onSave = async (draftItems) => {
    setErr("");

    if (!product) return;
    if ((product.product_type || "simple") !== "composite") {
      setErr("Este producto no es compuesto. Cambia su tipo a 'Compuesto' para configurar componentes.");
      return;
    }

    // En global-mode, branchId ES requerido para candidates, pero para guardar no (backend lo ignora).
    // En branch-mode, branchId sí es requerido para upsert.
    if (requiresBranch && !effectiveBranchId) {
      setErr("Selecciona una sucursal.");
      return;
    }

    const payload = {
      ...(requiresBranch ? { branch_id: effectiveBranchId } : {}),
      items: (draftItems || []).map((x, idx) => ({
        component_product_id: Number(x.component_product_id),
        qty: Number(x.qty || 1),
        allow_variant: !!x.allow_variant,
        apply_variant_price: !!x.apply_variant_price,
        is_optional: !!x.is_optional,
        sort_order: Number(x.sort_order ?? idx),
        notes: x.notes || null,
      })),
    };

    try {
      await upsertProductComponents(restaurantId, productId, payload);
      // recargar
      await loadAll();
      setWizardOpen(false);
    } catch (e) {
      setErr(apiErrorToMessage(e, "No se pudo guardar composición"));
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Cargando composición...</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "30px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: 0 }}>Composición de producto</h2>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Producto: <strong>{product?.name || productId}</strong> · Tipo:{" "}
            <strong>{product?.product_type || "simple"}</strong> · Modo: <strong>{productsMode}</strong>
          </div>
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
            Regla: solo puedes usar <strong>productos activos</strong> y <strong>vendibles</strong> como componentes.
          </div>
        </div>

        <button
          onClick={() => nav(`/owner/restaurants/${restaurantId}/products`)}
          style={{ padding: "10px 14px", cursor: "pointer" }}
        >
          ← Volver a Productos
        </button>
      </div>

      {err && (
        <div style={{ marginTop: 12, background: "#ffe5e5", padding: 10, whiteSpace: "pre-line" }}>
          {err}
        </div>
      )}

      {/* Selector sucursal (siempre visible porque en global-mode lo ocupas para candidates) */}
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
          Seleccionada: <strong>{branchLabel}</strong>
          {productsMode === "global" ? (
            <> · En modo GLOBAL se usa para determinar “vendibles” por canal/sucursal.</>
          ) : (
            <> · En modo BRANCH define dónde vive la composición.</>
          )}
        </div>
      </div>

      {/* Warning composite sin componentes */}
      {warningCompositeNoItems && (
        <div
          style={{
            marginTop: 12,
            border: "1px solid #ffcc00",
            background: "#fff7d6",
            padding: 12,
            borderRadius: 10,
            whiteSpace: "pre-line",
          }}
        >
          <strong>Advertencia:</strong> Este producto compuesto no tiene componentes definidos.
          {"\n"}
          Por regla se considera <strong>inactivo</strong> hasta que se configure.
        </div>
      )}

      {/* Tabla */}
      <div style={{ marginTop: 14, border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div style={{ fontWeight: 900 }}>Componentes</div>

          <button
            onClick={() => setWizardOpen(true)}
            disabled={(product?.product_type || "simple") !== "composite"}
            title={
              (product?.product_type || "simple") !== "composite"
                ? "Este producto no es compuesto. Cambia su tipo a 'Compuesto' desde Productos."
                : items.length ? "Editar composición" : "Agregar composición"
            }
            style={{
              padding: "10px 14px",
              cursor: (product?.product_type || "simple") === "composite" ? "pointer" : "not-allowed",
              opacity: (product?.product_type || "simple") === "composite" ? 1 : 0.5,
            }}
          >
            {items.length ? "Editar" : "Agregar"}
          </button>
        </div>

        {items.length === 0 ? (
          <div style={{ marginTop: 12, opacity: 0.8 }}>Aún no hay componentes.</div>
        ) : (
          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Componente</th>
                  <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Cantidad</th>
                  <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Variantes</th>
                  <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Precio extra</th>
                  <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Opcional</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>
                      <div style={{ fontWeight: 800 }}>
                        {it.component_product?.name || `Producto ${it.component_product_id}`}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        status: {it.component_product?.status || "—"}
                      </div>
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{it.qty}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>
                      {it.allow_variant ? "✅" : "❌"}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>
                      {it.apply_variant_price ? "✅" : "❌"}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>
                      {it.is_optional ? "✅" : "❌"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Wizard */}
      {wizardOpen && (
        <CompositionWizard
          open={wizardOpen}
          onClose={() => setWizardOpen(false)}
          restaurantId={restaurantId}
          productId={productId}
          productsMode={productsMode}
          branchId={effectiveBranchId}
          initialItems={(items || []).map((x) => ({
            component_product_id: x.component_product_id,
            name: x.component_product?.name || "",
            qty: x.qty,
            allow_variant: !!x.allow_variant,
            apply_variant_price: !!x.apply_variant_price,
            is_optional: !!x.is_optional,
            sort_order: x.sort_order ?? 0,
            notes: x.notes || "",
          }))}
          onSave={onSave}
        />
      )}
    </div>
  );
}
