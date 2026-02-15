import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getBranch } from "../../services/restaurant/branch.service"; // si no tienes, comenta bloque
import { getChannelProducts, upsertChannelProduct } from "../../services/products/sales_channels/productChannel.service";

function money(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

export default function ChannelProductsConfigPage() {
  const nav = useNavigate();
  const { restaurantId, branchId, salesChannelId } = useParams();

  const rid = Number(restaurantId);
  const bid = Number(branchId);
  const scid = Number(salesChannelId);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [savingMap, setSavingMap] = useState({}); // { [productId]: boolean }

  const [mode, setMode] = useState("global");
  const [branchName, setBranchName] = useState("");
  const [channelName, setChannelName] = useState("");
  const [channelCode, setChannelCode] = useState("");

  const [rows, setRows] = useState([]); // { product, channel, config }
  const [search, setSearch] = useState("");
  const [onlyActiveProductStatus, setOnlyActiveProductStatus] = useState(true);

  // modal edit
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // row actual
  const [form, setForm] = useState({ is_enabled: false, price: "" });

  const setSaving = (productId, v) =>
    setSavingMap((prev) => ({ ...prev, [productId]: v }));

  const isSaving = (productId) => !!savingMap[productId];

  const load = async () => {
    setErr("");
    setLoading(true);

    try {
      // branch name (opcional)
      try {
        const b = await getBranch(rid, bid);
        setBranchName(b?.name || "");
      } catch {
        setBranchName("");
      }

      const res = await getChannelProducts(rid, bid, scid);

      setMode(res?.mode || "global");
      setChannelName(res?.sales_channel?.name || "");
      setChannelCode(res?.sales_channel?.code || "");
      setRows(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          "No se pudo cargar la configuración del canal"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, branchId, salesChannelId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows
      .filter((r) => {
        const p = r.product;
        if (onlyActiveProductStatus && p?.status !== "active") return false;
        if (!q) return true;

        const name = (p?.name || "").toLowerCase();
        const desc = (p?.description || "").toLowerCase();
        const cat = (p?.category?.name || "").toLowerCase();
        return name.includes(q) || desc.includes(q) || cat.includes(q);
      })
      .sort((a, b) => {
        // primero los enabled en canal
        const ea = a?.channel?.is_enabled ? 1 : 0;
        const eb = b?.channel?.is_enabled ? 1 : 0;
        if (ea !== eb) return eb - ea;
        return (a?.product?.name || "").localeCompare(b?.product?.name || "");
      });
  }, [rows, search, onlyActiveProductStatus]);

  const branchLabel = branchName?.trim()
    ? branchName.trim()
    : `Sucursal ${bid}`;

  const modeHelp =
    mode === "global"
      ? "Modo GLOBAL: aquí configuras precio/visibilidad por canal para productos que la sucursal ya habilitó en su Catálogo."
      : "Modo BRANCH: aquí configuras precio/visibilidad por canal para productos propios de la sucursal.";

  const openEdit = (row) => {
    const enabled = !!row?.channel?.is_enabled;
    const price = row?.channel?.price ?? "";
    setEditing(row);
    setForm({
      is_enabled: enabled,
      price: enabled ? String(price ?? "") : "",
    });
    setOpen(true);
  };

  const closeModal = () => {
    const pId = editing?.product?.id;
    if (pId && isSaving(pId)) return;
    setOpen(false);
    setEditing(null);
  };

  const onSaveModal = async () => {
    if (!editing?.product?.id) return;
    const productId = editing.product.id;

    setErr("");
    if (isSaving(productId)) return;

    const enabled = !!form.is_enabled;
    const priceRaw = (form.price ?? "").toString().trim();

    if (enabled) {
      if (!priceRaw) {
        setErr("Si el producto está ACTIVO en el canal, el precio es obligatorio.");
        return;
      }
      const priceNum = Number(priceRaw);
      if (Number.isNaN(priceNum) || priceNum < 0) {
        setErr("Precio inválido. Usa un número mayor o igual a 0.");
        return;
      }
    }

    // UI optimista
    setRows((prev) =>
      prev.map((r) => {
        if (r.product?.id !== productId) return r;
        return {
          ...r,
          channel: {
            ...(r.channel || {}),
            is_enabled: enabled,
            price: enabled ? Number(priceRaw) : null,
          },
        };
      })
    );

    setSaving(productId, true);
    try {
      await upsertChannelProduct(rid, bid, scid, productId, {
        is_enabled: enabled,
        price: enabled ? Number(priceRaw) : undefined,
      });

      setOpen(false);
      setEditing(null);

      // recargar para quedar 100% consistentes con backend
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo guardar la configuración");
      await load();
    } finally {
      setSaving(productId, false);
    }
  };

  // Toggle rápido: ON exige precio -> abre modal si está OFF y lo prenden
  const onToggleQuick = async (row) => {
    const productId = row?.product?.id;
    if (!productId) return;

    if (isSaving(productId)) return;
    setErr("");

    const prev = !!row?.channel?.is_enabled;
    const next = !prev;

    if (next) {
      // activar exige precio: manda a modal
      openEdit(row);
      setForm({ is_enabled: true, price: String(row?.channel?.price ?? "") });
      return;
    }

    // apagar: se puede directo sin precio
    // UI optimista
    setRows((prevRows) =>
      prevRows.map((r) => {
        if (r.product?.id !== productId) return r;
        return {
          ...r,
          channel: { ...(r.channel || {}), is_enabled: false, price: null },
        };
      })
    );

    setSaving(productId, true);
    try {
      await upsertChannelProduct(rid, bid, scid, productId, {
        is_enabled: false,
      });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo actualizar el estado");
      await load();
    } finally {
      setSaving(productId, false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Cargando configuración…</div>;

  return (
    <div style={{ maxWidth: 1050, margin: "30px auto", padding: 16 }}>
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>
            {channelName || "Canal"} — Configuración de productos
          </h2>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            {branchLabel} · Canal:{" "}
            <strong>{channelCode ? `${channelCode} · ` : ""}{channelName || scid}</strong>
          </div>
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
            {modeHelp}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => nav(-1)}
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
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
            Buscar producto
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
            Producto activo
          </div>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={onlyActiveProductStatus}
              onChange={(e) => setOnlyActiveProductStatus(e.target.checked)}
            />
            Solo activos
          </label>
        </div>

        <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.8 }}>
          Mostrando: <strong>{filtered.length}</strong> / {rows.length}
        </div>
      </div>

      {/* tabla */}
      <div style={{ marginTop: 14, border: "1px solid #ddd", borderRadius: 10 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 140px 160px 160px",
            padding: "10px 12px",
            borderBottom: "1px solid #eee",
            fontWeight: 900,
            background: "#fafafa",
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }}
        >
          <div>Producto</div>
          <div style={{ textAlign: "center" }}>Estado</div>
          <div style={{ textAlign: "center" }}>Precio</div>
          <div style={{ textAlign: "right" }}>Acciones</div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 12, opacity: 0.8 }}>
            No hay productos para mostrar con este filtro.
          </div>
        ) : (
          filtered.map((r) => {
            const p = r.product;
            const enabled = !!r?.channel?.is_enabled;
            const price = r?.channel?.price;

            const busy = isSaving(p.id);
            const disabledByProductStatus = p?.status !== "active";

            return (
              <div
                key={p.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 140px 160px 160px",
                  padding: "12px 12px",
                  borderTop: "1px solid #f0f0f0",
                  alignItems: "center",
                  opacity: disabledByProductStatus ? 0.55 : 1,
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
                      {enabled ? "✅ Activo" : "❌ No activo"}
                    </span>

                    {busy && (
                      <span style={{ fontSize: 12, opacity: 0.7 }}>guardando…</span>
                    )}
                  </div>

                  <div style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>
                    Categoría: <strong>{p.category?.name || "—"}</strong> · Estado producto:{" "}
                    <strong>{p.status}</strong>
                  </div>

                  {p.description && (
                    <div style={{ marginTop: 6, opacity: 0.9 }}>
                      {p.description}
                    </div>
                  )}
                </div>

                {/* Estado (switch simple) */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <input
                    type="checkbox"
                    checked={enabled}
                    disabled={busy || disabledByProductStatus}
                    onChange={() => onToggleQuick(r)}
                    title={
                      disabledByProductStatus
                        ? "Producto inactivo: actívalo en Administrar productos"
                        : enabled
                          ? "Desactivar en este canal"
                          : "Activar en este canal (pide precio)"
                    }
                  />
                </div>

                {/* precio */}
                <div style={{ textAlign: "center", fontWeight: 800 }}>
                  {enabled ? money(price) : "—"}
                </div>

                {/* acciones */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button
                    onClick={() => openEdit(r)}
                    disabled={busy || disabledByProductStatus}
                    style={{
                      padding: "8px 10px",
                      cursor: busy ? "not-allowed" : "pointer",
                      opacity: busy ? 0.7 : 1,
                    }}
                    title="Editar configuración (estado/precio)"
                  >
                    ✏️ Editar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
        Nota: si un producto está <strong>Inactivo</strong> a nivel catálogo, actívalo primero en “Administrar productos”.
      </div>

      {/* Modal edición */}
      {open && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "grid",
            placeItems: "center",
            padding: 16,
            zIndex: 40,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 560,
              background: "#fff",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.15)",
              padding: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16 }}>
                  {editing?.product?.name || "Producto"} — {channelName || "Canal"}
                </div>
                <div style={{ marginTop: 4, opacity: 0.85, fontSize: 13 }}>
                  {branchLabel} · Configura visibilidad y precio para este canal
                </div>
              </div>

              <button
                onClick={closeModal}
                disabled={isSaving(editing?.product?.id)}
                style={{ padding: "8px 10px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800 }}>Estado en el canal</div>
                <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
                  <input
                    type="checkbox"
                    checked={!!form.is_enabled}
                    onChange={(e) => setForm((p) => ({ ...p, is_enabled: e.target.checked }))}
                  />
                  <span style={{ fontWeight: 800 }}>
                    {form.is_enabled ? "✅ Activo (se vende)" : "❌ No activo (no se vende)"}
                  </span>
                </label>
              </div>

              <div>
                <div style={{ fontWeight: 800 }}>Precio (MXN)</div>
                <input
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="Ej. 30"
                  disabled={!form.is_enabled}
                  inputMode="decimal"
                  style={{
                    marginTop: 8,
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    opacity: form.is_enabled ? 1 : 0.6,
                  }}
                />
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                  {form.is_enabled
                    ? "Obligatorio si está activo."
                    : "Si está apagado, el precio no se usa."}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  onClick={closeModal}
                  disabled={isSaving(editing?.product?.id)}
                  style={{ padding: "10px 14px", cursor: "pointer" }}
                >
                  Cancelar
                </button>

                <button
                  onClick={onSaveModal}
                  disabled={isSaving(editing?.product?.id)}
                  style={{
                    padding: "10px 14px",
                    cursor: isSaving(editing?.product?.id) ? "not-allowed" : "pointer",
                    opacity: isSaving(editing?.product?.id) ? 0.7 : 1,
                  }}
                >
                  {isSaving(editing?.product?.id) ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
