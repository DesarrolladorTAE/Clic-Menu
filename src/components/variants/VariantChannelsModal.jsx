// src/components/variants/VariantChannelsModal.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { getBranchesByRestaurant } from "../../services/restaurant/branch.service";


import { getVariantChannels, upsertVariantChannels } from "../../services/products/variants/productVariantChannels.service";

function money(n) {
  if (n == null || n === "") return "—";
  const num = Number(n);
  if (!Number.isFinite(num)) return String(n);
  return num.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function normalizeErr(e, fallback = "Ocurrió un error") {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors ? Object.values(e.response.data.errors).flat().join("\n") : "") ||
    fallback
  );
}

function pillStyle(bg, border) {
  return {
    fontSize: 12,
    padding: "2px 8px",
    borderRadius: 999,
    background: bg,
    border: `1px solid ${border}`,
    fontWeight: 900,
    whiteSpace: "nowrap",
  };
}

export default function VariantChannelsModal({
  open,
  onClose,
  restaurantId,
  productId,
  variant, // {id,name,is_enabled,is_default}
}) {
  const [err, setErr] = useState("");
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");

  const [loadingTable, setLoadingTable] = useState(false);
  const [table, setTable] = useState(null); // response completo
  const [rows, setRows] = useState([]);

  // cambios locales por branch_sales_channel_id
  // { [bscId]: { mode:'set'|'remove', is_enabled:boolean, price:number|string } }
  const [draft, setDraft] = useState({});

  const reqRef = useRef(0);

  const variantDisabled = !variant?.is_enabled;

  const canEditGlobal = useMemo(() => {
    // regla: si variante inactiva NO se puede configurar
    return open && !variantDisabled;
  }, [open, variantDisabled]);

  const close = () => {
    setErr("");
    setTable(null);
    setRows([]);
    setDraft({});
    setBranchId("");
    onClose?.();
  };

  const loadBranches = async () => {
    const myReq = ++reqRef.current;
    setErr("");
    setLoadingBranches(true);
    try {
      const data = await getBranchesByRestaurant(restaurantId);
      const list = Array.isArray(data) ? data : (data?.data || data?.branches || []);
      setBranches(list);

      // auto-select primero
      if (!branchId && list.length) {
        setBranchId(String(list[0].id));
      }
    } catch (e) {
      if (myReq !== reqRef.current) return;
      setErr(normalizeErr(e, "No se pudieron cargar sucursales"));
    } finally {
      if (myReq !== reqRef.current) return;
      setLoadingBranches(false);
    }
  };

  const loadTable = async (bId) => {
    if (!bId) return;

    const myReq = ++reqRef.current;
    setErr("");
    setLoadingTable(true);

    try {
      const data = await getVariantChannels(restaurantId, productId, variant.id, Number(bId));
      if (myReq !== reqRef.current) return;

      setTable(data);
      setRows(data?.data || []);
      setDraft({});
    } catch (e) {
      if (myReq !== reqRef.current) return;
      setErr(normalizeErr(e, "No se pudo cargar configuración por canal"));
      setTable(null);
      setRows([]);
      setDraft({});
    } finally {
      if (myReq !== reqRef.current) return;
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setErr("");
    setBranches([]);
    setBranchId("");
    setTable(null);
    setRows([]);
    setDraft({});
    loadBranches();
    // eslint-disable-next-line
  }, [open, restaurantId, productId, variant?.id]);

  useEffect(() => {
    if (!open) return;
    if (!branchId) return;
    loadTable(branchId);
    // eslint-disable-next-line
  }, [open, branchId]);

  const resolvedRow = (r) => {
    const bscId = r.branch_sales_channel_id;
    const d = draft[bscId];

    // base/override vienen del backend
    const base = r.base; // {is_enabled, price} or null
    const ovr = r.override; // {id,is_enabled,price} or null

    // valores actuales (lo que muestra UI)
    let visible = r.visible;
    let price = r.price;
    let origin = r.origin;

    // si hay draft, eso manda
    if (d) {
      if (d.mode === "remove") {
        // volvemos a fallback (lo mostramos como base)
        if (r.branch_is_active) {
          if (base) {
            visible = !!base.is_enabled;
            price = base.is_enabled ? Number(base.price) : null;
            origin = "product";
          } else {
            visible = false;
            price = null;
            origin = null;
          }
        } else {
          visible = false;
          price = null;
          origin = null;
        }
      } else {
        visible = !!d.is_enabled;
        price = visible ? (d.price === "" ? "" : Number(d.price)) : null;
        origin = "variant";
      }
    }

    // bloqueos por regla
    const channelDisabled = !r.branch_is_active; // canal apagado en sucursal
    const rowLocked = variantDisabled || channelDisabled;

    return {
      ...r,
      _base: base,
      _override: ovr,
      _draft: d || null,

      ui_visible: visible,
      ui_price: price,
      ui_origin: origin,

      ui_channelDisabled: channelDisabled,
      ui_rowLocked: rowLocked,
    };
  };

  const mergedRows = useMemo(() => rows.map(resolvedRow), [rows, draft]); // eslint-disable-line

  const onChangeVisible = (bscId, next) => {
    setErr("");
    setDraft((prev) => {
      const current = prev[bscId];

      // si estaba en remove, pasamos a set con defaults
      const base = rows.find((x) => x.branch_sales_channel_id === bscId)?.base;
      const suggestedPrice = base?.price ?? 0;

      return {
        ...prev,
        [bscId]: {
          mode: "set",
          is_enabled: !!next,
          price:
            current?.mode === "set"
              ? current.price
              : String(suggestedPrice),
        },
      };
    });
  };

  const onChangePrice = (bscId, nextPrice) => {
    setErr("");
    // Convertimos a string para permitir editar libremente
    setDraft((prev) => {
      const current = prev[bscId];
      const base = rows.find((x) => x.branch_sales_channel_id === bscId)?.base;
      const suggestedVisible =
        current?.mode === "set"
          ? !!current.is_enabled
          : true;

      return {
        ...prev,
        [bscId]: {
          mode: "set",
          is_enabled: suggestedVisible,
          price: nextPrice,
        },
      };
    });
  };

  const useProductFallback = (bscId) => {
    setErr("");
    setDraft((prev) => ({
      ...prev,
      [bscId]: { mode: "remove" },
    }));
  };

  const clearDraftRow = (bscId) => {
    setErr("");
    setDraft((prev) => {
      const cp = { ...prev };
      delete cp[bscId];
      return cp;
    });
  };

  const hasChanges = Object.keys(draft).length > 0;

  const buildItemsPayload = () => {
    const items = [];

    for (const [k, v] of Object.entries(draft)) {
      const bscId = Number(k);

      if (v.mode === "remove") {
        items.push({ branch_sales_channel_id: bscId, mode: "remove" });
        continue;
      }

      // mode=set
      const rawPrice = v.price;

      if (rawPrice === "" || rawPrice == null) {
        throw new Error(`Falta precio para branch_sales_channel_id=${bscId}`);
      }

      const num = Number(rawPrice);
      if (!Number.isFinite(num) || num < 0) {
        throw new Error(`Precio inválido para branch_sales_channel_id=${bscId}`);
      }

      items.push({
        branch_sales_channel_id: bscId,
        mode: "set",
        is_enabled: !!v.is_enabled,
        price: num,
      });
    }

    return items;
  };

  const save = async () => {
    setErr("");

    if (!branchId) return setErr("Selecciona una sucursal.");
    if (variantDisabled) return setErr("La variante está inactiva. Actívala para configurar precios por canal.");
    if (!hasChanges) return;

    // Extra regla: no dejar guardar cambios en canales apagados
    const disabledTouched = mergedRows.some((r) => r.ui_channelDisabled && draft[r.branch_sales_channel_id]);
    if (disabledTouched) {
      return setErr("Hay cambios en un canal apagado por sucursal. No se puede configurar ahí.");
    }

    let items;
    try {
      items = buildItemsPayload();
    } catch (e) {
      return setErr(e.message || "Payload inválido");
    }

    try {
      await upsertVariantChannels(restaurantId, productId, variant.id, items);
      // recargar tabla
      await loadTable(branchId);
    } catch (e) {
      setErr(normalizeErr(e, "No se pudo guardar configuración"));
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 10000,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        style={{
          width: "min(1050px, 100%)",
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #eee",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 14,
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontWeight: 950, fontSize: 16 }}>
              {table?.product?.name || "Producto"} — {variant?.name || "Variante"}
            </div>
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
              Configuración por canal (override en <code>product_variant_channel</code>)
            </div>
          </div>

          <button onClick={close} style={{ padding: "8px 10px", cursor: "pointer" }}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 14 }}>
          {err && (
            <div
              style={{
                marginBottom: 12,
                background: "#ffe5e5",
                padding: 10,
                whiteSpace: "pre-line",
                borderRadius: 10,
              }}
            >
              <strong>Error:</strong> {err}
            </div>
          )}

          {/* Bloqueo por variante desactivada */}
          {variantDisabled && (
            <div
              style={{
                marginBottom: 12,
                background: "#fff3cd",
                border: "1px solid #ffeeba",
                padding: 10,
                borderRadius: 10,
              }}
            >
              Esta variante está <strong>inactiva</strong>. Puedes ver la tabla, pero{" "}
              <strong>no puedes configurar</strong> precios por canal hasta activarla.
            </div>
          )}

          {/* Selector sucursal */}
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 12,
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 12,
              background: "#fafafa",
            }}
          >
            <div style={{ fontWeight: 900 }}>Sucursal</div>

            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              disabled={loadingBranches}
              style={{
                padding: "10px 10px",
                borderRadius: 10,
                border: "1px solid #ddd",
                minWidth: 260,
              }}
            >
              {branches.length === 0 ? (
                <option value="">{loadingBranches ? "Cargando..." : "Sin sucursales"}</option>
              ) : (
                branches.map((b) => (
                  <option key={b.id} value={String(b.id)}>
                    {b.name || `Sucursal #${b.id}`}
                  </option>
                ))
              )}
            </select>

            <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.8 }}>
              {loadingTable ? "Cargando canales..." : branchId ? `branch_id=${branchId}` : "Selecciona sucursal"}
            </div>
          </div>

          {/* Tabla */}
          <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: 12, borderBottom: "1px solid #f0f0f0", fontWeight: 900 }}>
              Canales
            </div>

            {loadingTable ? (
              <div style={{ padding: 12 }}>Cargando…</div>
            ) : mergedRows.length === 0 ? (
              <div style={{ padding: 12, opacity: 0.8 }}>
                No hay canales configurados para esta sucursal.
              </div>
            ) : (
              <div style={{ width: "100%", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 880 }}>
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Canal</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Estado canal</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Visible</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Precio</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Origen</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {mergedRows.map((r) => {
                      const bscId = r.branch_sales_channel_id;

                      const locked = r.ui_rowLocked || !canEditGlobal; // variante inactiva o canal apagado
                      const hasOverride = !!r._override;
                      const hasDraft = !!r._draft;

                      return (
                        <tr key={bscId}>
                          {/* Canal */}
                          <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                            <div style={{ fontWeight: 900 }}>{r.sales_channel?.name}</div>
                            <div style={{ fontSize: 12, opacity: 0.75 }}>
                              {r.sales_channel?.code} · bsc_id: {bscId}
                            </div>
                          </td>

                          {/* Estado canal */}
                          <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                            <span
                              style={
                                r.branch_is_active
                                  ? pillStyle("#e8f5e9", "#c8e6c9")
                                  : pillStyle("#ffe5e5", "#ffb3b3")
                              }
                              title={r.branch_is_active ? "Activo en sucursal" : "Apagado en sucursal"}
                            >
                              {r.branch_is_active ? "Activo" : "Apagado"}
                            </span>
                          </td>

                          {/* Visible */}
                          <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                              <input
                                type="checkbox"
                                checked={!!r.ui_visible}
                                disabled={locked}
                                onChange={(e) => onChangeVisible(bscId, e.target.checked)}
                                title={
                                  locked
                                    ? variantDisabled
                                      ? "Variante inactiva: no se puede configurar"
                                      : "Canal apagado en sucursal: no se puede configurar"
                                    : "Cambiar visibilidad"
                                }
                              />
                              <span style={{ fontWeight: 900, opacity: locked ? 0.6 : 1 }}>
                                {r.ui_visible ? "Sí" : "No"}
                              </span>
                            </label>
                          </td>

                          {/* Precio */}
                          <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                            <input
                              value={r.ui_price == null ? "" : String(r.ui_price)}
                              disabled={locked || !r.ui_visible}
                              onChange={(e) => onChangePrice(bscId, e.target.value)}
                              placeholder="—"
                              style={{
                                width: 140,
                                padding: "8px 10px",
                                borderRadius: 10,
                                border: "1px solid #ddd",
                                opacity: locked || !r.ui_visible ? 0.6 : 1,
                              }}
                              inputMode="decimal"
                            />
                            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                              Base: {r._base ? money(r._base.price) : "—"}
                            </div>
                          </td>

                          {/* Origen */}
                          <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                            {r.ui_origin === "variant" && (
                              <span style={pillStyle("#e8f0fe", "#c7d2fe")}>Variante</span>
                            )}
                            {r.ui_origin === "product" && (
                              <span style={pillStyle("#f1f5f9", "#e2e8f0")}>Producto</span>
                            )}
                            {!r.ui_origin && <span style={{ opacity: 0.7 }}>—</span>}

                            {hasOverride && (
                              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                                Override guardado
                              </div>
                            )}
                          </td>

                          {/* Acciones */}
                          <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <button
                                onClick={() => useProductFallback(bscId)}
                                disabled={locked}
                                title={
                                  locked
                                    ? "No editable"
                                    : "Eliminar override y volver al precio del producto"
                                }
                                style={{
                                  padding: "8px 10px",
                                  borderRadius: 10,
                                  border: "1px solid #eee",
                                  cursor: locked ? "not-allowed" : "pointer",
                                  opacity: locked ? 0.6 : 1,
                                }}
                              >
                                Usar producto
                              </button>

                              {hasDraft && (
                                <button
                                  onClick={() => clearDraftRow(bscId)}
                                  disabled={locked}
                                  title="Descartar cambio local"
                                  style={{
                                    padding: "8px 10px",
                                    borderRadius: 10,
                                    border: "1px solid #eee",
                                    cursor: locked ? "not-allowed" : "pointer",
                                    opacity: locked ? 0.6 : 1,
                                    background: "#f7f7f7",
                                  }}
                                >
                                  Descartar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}
            <div style={{ padding: 12, borderTop: "1px solid #f0f0f0", display: "flex", gap: 10 }}>
              <button
                onClick={() => loadTable(branchId)}
                disabled={!branchId}
                style={{
                  padding: "10px 12px",
                  cursor: branchId ? "pointer" : "not-allowed",
                  borderRadius: 10,
                  border: "1px solid #eee",
                  background: "#f7f7f7",
                  fontWeight: 900,
                }}
              >
                ↻ Recargar
              </button>

              <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
                <button
                  onClick={close}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    borderRadius: 10,
                    border: "1px solid #eee",
                    background: "#f7f7f7",
                    fontWeight: 900,
                  }}
                >
                  Cerrar
                </button>

                <button
                  onClick={save}
                  disabled={!canEditGlobal || !hasChanges || loadingTable}
                  title={
                    variantDisabled
                      ? "Variante inactiva"
                      : !hasChanges
                        ? "Sin cambios"
                        : "Guardar"
                  }
                  style={{
                    padding: "10px 12px",
                    cursor: !canEditGlobal || !hasChanges ? "not-allowed" : "pointer",
                    borderRadius: 10,
                    border: "1px solid #111",
                    background: "#111",
                    color: "#fff",
                    fontWeight: 950,
                    opacity: !canEditGlobal || !hasChanges ? 0.5 : 1,
                  }}
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
            Regla: si hay override (variante) se usa ese precio; si no, se usa el precio del producto (<code>product_channel</code>).
          </div>
        </div>
      </div>
    </div>
  );
}
