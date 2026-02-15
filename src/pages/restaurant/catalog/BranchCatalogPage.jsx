// src/pages/owner/restaurants/catalog/BranchCatalogPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { getRestaurantSubscriptionStatus } from "../../../services/restaurant/restaurant.service";
import { getRestaurantSettings } from "../../../services/restaurant/restaurantSettings.service";
import { getBranch } from "../../../services/restaurant/branch.service"; // si no tienes, quítalo y deja nombre genérico

import {
  getBranchCatalog,
  upsertProductOverride,
  deleteProductOverride,
} from "../../../services/restaurant/branchCatalog.service";

export default function BranchCatalogPage() {
  const nav = useNavigate();
  const { restaurantId, branchId } = useParams();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [savingMap, setSavingMap] = useState({}); // { [productId]: boolean }
  const [err, setErr] = useState("");

  const [mode, setMode] = useState("global");
  const [branchName, setBranchName] = useState("");

  const [rows, setRows] = useState([]); // [{ product, effective, override }]
  const [search, setSearch] = useState("");
  const [onlyActiveProducts, setOnlyActiveProducts] = useState(true); // filtra por product.status

  const effectiveRestaurantId = Number(restaurantId);
  const effectiveBranchId = Number(branchId);

  // ====== helpers ======
  const setSaving = (productId, v) =>
    setSavingMap((prev) => ({ ...prev, [productId]: v }));

  const isSaving = (productId) => !!savingMap[productId];

  const load = async () => {
    setErr("");
    setLoading(true);

    try {
      // 1) validar restaurante operativo (misma lógica que el resto del sistema)
      const st = await getRestaurantSubscriptionStatus(effectiveRestaurantId);
      if (st?.is_operational !== true) {
        nav(`/owner/restaurants/${effectiveRestaurantId}/plans`, {
          state: {
            notice: "Este restaurante está bloqueado. Contrata un plan para operar.",
            code: st?.code || "SUBSCRIPTION_REQUIRED",
          },
        });
        return;
      }

      // 2) obtener modo real (aunque venga en state)
      let pm = location?.state?.products_mode;
      if (!pm) {
        const settings = await getRestaurantSettings(effectiveRestaurantId);
        pm = settings?.products_mode || "global";
      }
      setMode(pm);

      // 3) branch name (opcional)
      try {
        // Si no tienes getBranch, comenta esto y listo.
        const b = await getBranch(effectiveRestaurantId, effectiveBranchId);
        setBranchName(b?.name || "");
      } catch {
        setBranchName("");
      }

      // 4) cargar catálogo desde Laravel
      const res = await getBranchCatalog(effectiveRestaurantId, effectiveBranchId);
      setMode(res?.mode || pm || "global");
      setRows(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo cargar el catálogo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, branchId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows
      .filter((r) => {
        const p = r.product;
        if (onlyActiveProducts && p?.status !== "active") return false;
        if (!q) return true;

        const name = (p?.name || "").toLowerCase();
        const desc = (p?.description || "").toLowerCase();
        const cat = (p?.category?.name || "").toLowerCase();

        return name.includes(q) || desc.includes(q) || cat.includes(q);
      })
      .sort((a, b) => {
        // primero los enabled
        const ea = a?.effective?.is_enabled ? 1 : 0;
        const eb = b?.effective?.is_enabled ? 1 : 0;
        if (ea !== eb) return eb - ea;
        // luego por nombre
        return (a?.product?.name || "").localeCompare(b?.product?.name || "");
      });
  }, [rows, search, onlyActiveProducts]);

  const onToggle = async (row) => {
    const productId = row.product?.id;
    if (!productId) return;

    setErr("");
    if (isSaving(productId)) return;

    const prevEnabled = !!row.effective?.is_enabled;
    const nextEnabled = !prevEnabled;

    // UI optimista
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
      // Regla:
      // - toggle ON: siempre guardamos override con is_enabled=true
      // - toggle OFF:
      //    - global: override is_enabled=false (o podrías delete, pero tu backend default es false; mantener override false es válido)
      //    - branch: mejor delete override para volver al default true
      if (nextEnabled) {
        await upsertProductOverride(effectiveRestaurantId, effectiveBranchId, productId, {
          is_enabled: true,
        });
      } else {
        if (mode === "branch") {
          // branch mode: default es true, así que OFF necesita override false; si quieres default revert, delete no sirve.
          // Tu backend define default true solo cuando NO hay override.
          // Entonces: para apagar en branch mode DEBES dejar override false (no borrar).
          await upsertProductOverride(effectiveRestaurantId, effectiveBranchId, productId, {
            is_enabled: false,
          });
        } else {
          // global mode: default ya es false, aquí puedes borrar override si existía,
          // o guardar override false. Borrar deja limpio.
          if (row.override) {
            await deleteProductOverride(effectiveRestaurantId, effectiveBranchId, productId);
          } else {
            // no había override, no hace falta llamar nada
          }
        }
      }

      // refrescar solo esa fila desde backend (simple: recargar todo para evitar inconsistencias)
      const res = await getBranchCatalog(effectiveRestaurantId, effectiveBranchId);
      setRows(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      // rollback: recarga
      setErr(e?.response?.data?.message || "No se pudo actualizar el catálogo");
      await load();
    } finally {
      setSaving(productId, false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Cargando catálogo...</div>;

  const branchLabel = branchName?.trim()
    ? branchName.trim()
    : `Sucursal ${effectiveBranchId}`;

  const modeHelp =
    mode === "global"
      ? "Modo GLOBAL: esta sucursal decide qué productos del catálogo global vende."
      : "Modo BRANCH: esta sucursal decide qué productos de su propio catálogo vende.";

  return (
    <div style={{ maxWidth: 980, margin: "30px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Catálogo</h2>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Restaurante: <strong>{restaurantId}</strong> · {branchLabel} ·{" "}
            Modo productos: <strong>{mode}</strong>
          </div>
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
            {modeHelp}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => nav(`/owner/restaurants`)}
            style={{ padding: "10px 14px", cursor: "pointer" }}
          >
            ← Volver
          </button>
          <button
            onClick={load}
            style={{ padding: "10px 14px", cursor: "pointer" }}
            title="Recargar"
          >
            Actualizar
          </button>
        </div>
      </div>

      {err && (
        <div
          style={{
            marginTop: 12,
            background: "#ffe5e5",
            padding: 10,
            whiteSpace: "pre-line",
          }}
        >
          {err}
        </div>
      )}

      {/* filtros */}
      <div
        style={{
          marginTop: 14,
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 10,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
            Buscar
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, descripción o categoría..."
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ddd",
            }}
          />
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
            Productos activos
          </div>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={onlyActiveProducts}
              onChange={(e) => setOnlyActiveProducts(e.target.checked)}
            />
            Solo activos
          </label>
        </div>

        <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.8 }}>
          Mostrando: <strong>{filtered.length}</strong> / {rows.length}
        </div>
      </div>

      {/* tabla simple */}
      <div style={{ marginTop: 14, border: "1px solid #ddd", borderRadius: 10 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 140px",
            padding: "10px 12px",
            borderBottom: "1px solid #eee",
            fontWeight: 900,
            background: "#fafafa",
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }}
        >
          <div>Producto</div>
          <div style={{ textAlign: "center" }}>Usar</div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 12, opacity: 0.8 }}>
            No hay productos para mostrar con este filtro.
          </div>
        ) : (
          <div style={{ display: "grid" }}>
            {filtered.map((r) => {
              const p = r.product;
              const enabled = !!r.effective?.is_enabled;
              const busy = isSaving(p.id);

              const disabledByProductStatus = p?.status !== "active"; // si quieres permitir activar aunque el producto esté inactive, quita esto
              const rowOpacity = disabledByProductStatus ? 0.55 : 1;

              return (
                <div
                  key={p.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 140px",
                    padding: "12px 12px",
                    borderTop: "1px solid #f0f0f0",
                    alignItems: "center",
                    opacity: rowOpacity,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900, display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.name}
                      </span>

                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 999,
                          border: "1px solid rgba(0,0,0,0.08)",
                          background: enabled ? "#e6ffed" : "#f3f3f3",
                          color: enabled ? "#0a7a2f" : "#444",
                          fontWeight: 800,
                        }}
                      >
                        {enabled ? "Enabled" : "Disabled"}
                      </span>

                      {busy && (
                        <span style={{ fontSize: 12, opacity: 0.7 }}>
                          guardando...
                        </span>
                      )}
                    </div>

                    <div style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>
                      Categoría: <strong>{p.category?.name || "—"}</strong> · Estado:{" "}
                      <strong>{p.status}</strong>
                    </div>

                    {p.description && (
                      <div style={{ marginTop: 6, opacity: 0.9 }}>
                        {p.description}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <input
                      type="checkbox"
                      checked={enabled}
                      disabled={busy || disabledByProductStatus}
                      onChange={() => onToggle(r)}
                      title={
                        disabledByProductStatus
                          ? "Producto inactivo: actívalo en Administrar productos"
                          : "Activar / desactivar en esta sucursal"
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
        Nota: Si un producto está <strong>Inactivo</strong>, primero actívalo en “Administrar productos”.
      </div>
    </div>
  );
}
