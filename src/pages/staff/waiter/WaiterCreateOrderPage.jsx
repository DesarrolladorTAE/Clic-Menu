// src/pages/staff/waiter/WaiterCreateOrderPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  fetchWaiterTableMenu,
  createWaiterOrder,
} from "../../../services/staff/waiter/waiterTables.service";

import {
  Badge,
  CategoryChip,
  Collapse,
  Modal,
  PillButton,
  ProductThumb,
  SearchBar,
  SkeletonCard,
} from "../../public/publicMenu.ui";

import { makeKey, safeNum, money as moneyUtil } from "../../../hooks/public/publicMenu.utils";

// --- helpers locales ---
function money(n) {
  return moneyUtil(n);
}

function normalizeItemsForApi(cart) {
  const arr = Array.isArray(cart) ? cart : [];
  return arr.map((it) => {
    const out = {
      product_id: Number(it.product_id),
      variant_id: it.variant_id ? Number(it.variant_id) : null,
      quantity: Number(it.quantity || 1),
      notes: it.notes ? String(it.notes).slice(0, 500) : null,
    };

    if (Array.isArray(it.components)) {
      out.components = it.components.map((c) => ({
        component_product_id: Number(c.component_product_id),
        variant_id: c.variant_id ? Number(c.variant_id) : null,
        quantity: c.quantity == null ? null : Number(c.quantity),
      }));
    }

    return out;
  });
}

export default function WaiterCreateOrderPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const { tableId } = useParams();

  const tid = Number(tableId || 0);

  const state = loc?.state || {};
  const table = state?.table || {};
  const preloadedMenu = state?.preloadedMenu || null;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [menu, setMenu] = useState(preloadedMenu);

  // UI filtros
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState(() => new Set());

  // carrito
  const [cart, setCart] = useState([]);

  // modal nombre (opcional, si quieres identificar comanda)
  const [sendOpen, setSendOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [sending, setSending] = useState(false);
  const [sendToast, setSendToast] = useState("");

  const loadMenu = async ({ silent = false } = {}) => {
    if (!tid) {
      setErrorMsg("Mesa inválida.");
      setLoading(false);
      return;
    }

    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetchWaiterTableMenu(tid);
      // tolerante: res puede ser {ok,data} o data directo
      const payload = res?.data || res?.payload || res || null;
      setMenu(payload);
      setErrorMsg("");
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "No se pudo cargar el menú.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // si ya vino precargado, igual refrescamos en silencio para tener lo último
    if (!menu) {
      loadMenu({ silent: false });
      return;
    }
    loadMenu({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tid]);

  // Derivados: sections/categorías/productos
  const sections = useMemo(() => {
    // soporta distintas formas: {sections} o {menu:{sections}}
    const s = menu?.sections || menu?.menu?.sections || [];
    return Array.isArray(s) ? s : [];
  }, [menu]);

  const categoryNameById = useMemo(() => {
    const map = new Map();
    for (const s of sections || []) {
      for (const c of s?.categories || []) {
        if (c?.id) map.set(Number(c.id), c?.name || "");
      }
    }
    return map;
  }, [sections]);

  const categoryOptions = useMemo(() => {
    const opts = [{ value: "all", label: "Todos" }];
    const seen = new Set();
    for (const s of sections || []) {
      for (const c of s?.categories || []) {
        if (!c?.id || seen.has(c.id)) continue;
        seen.add(c.id);
        opts.push({ value: String(c.id), label: c.name || "Categoría" });
      }
    }
    return opts;
  }, [sections]);

  const allProducts = useMemo(() => {
    const out = [];
    for (const s of sections || []) {
      for (const c of s?.categories || []) {
        const catName = c?.name || "";
        for (const p of c?.products || []) out.push({ ...p, __categoryName: catName });
      }
    }
    return out;
  }, [sections]);

  const filteredProducts = useMemo(() => {
    const needle = (q || "").trim().toLowerCase();
    const catId = categoryFilter === "all" ? null : Number(categoryFilter);

    const matchText = (txt) => {
      if (!needle) return true;
      return String(txt || "").toLowerCase().includes(needle);
    };

    return (allProducts || []).filter((p) => {
      if (catId && Number(p.category_id) !== catId) return false;
      if (!needle) return true;

      const title = p.display_name || p.name;
      if (matchText(title)) return true;

      const vars = Array.isArray(p.variants) ? p.variants : [];
      return vars.some((v) => matchText(v?.name || v?.display_name));
    });
  }, [allProducts, categoryFilter, q]);

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (acc, it) => acc + safeNum(it.unit_price, 0) * safeNum(it.quantity, 1),
      0,
    );
  }, [cart]);

  const togglePanel = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // --- Carrito: acciones ---
  function addToCartFromProduct(p) {
    const pid = Number(p?.id);
    if (!pid) return;

    const key = makeKey(pid, null);

    setCart((prev) => {
      const idx = prev.findIndex((x) => x.key === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: Math.min(99, safeNum(next[idx].quantity, 1) + 1),
        };
        return next;
      }

      return [
        ...prev,
        {
          key,
          product_id: pid,
          variant_id: null,
          name: p?.display_name || p?.name || "Producto",
          variant_name: null,
          unit_price: safeNum(p?.price, 0),
          quantity: 1,
          notes: "",
        },
      ];
    });
  }

  function addToCartFromVariant(p, v) {
    const pid = Number(p?.id);
    const vid = Number(v?.id);
    if (!pid || !vid) return;

    const key = makeKey(pid, vid);

    setCart((prev) => {
      const idx = prev.findIndex((x) => x.key === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: Math.min(99, safeNum(next[idx].quantity, 1) + 1),
        };
        return next;
      }

      return [
        ...prev,
        {
          key,
          product_id: pid,
          variant_id: vid,
          name: p?.display_name || p?.name || "Producto",
          variant_name: v?.name || "Variante",
          unit_price: safeNum(v?.price, safeNum(p?.price, 0)),
          quantity: 1,
          notes: "",
        },
      ];
    });
  }

  function removeCartItem(key) {
    setCart((prev) => prev.filter((x) => x.key !== key));
  }

  function setCartQty(key, qty) {
    const qn = Math.max(1, Math.min(99, Number(qty || 1)));
    setCart((prev) => prev.map((x) => (x.key === key ? { ...x, quantity: qn } : x)));
  }

  function setCartNotes(key, notes) {
    setCart((prev) => prev.map((x) => (x.key === key ? { ...x, notes: String(notes || "") } : x)));
  }

  const canCreate = cart.length > 0 && !sending;

  const submitCreate = async () => {
    if (sending) return;

    if (!cart.length) {
      setSendToast("⚠️ No hay items seleccionados.");
      setTimeout(() => setSendToast(""), 3500);
      return;
    }

    const name = String(customerName || "").trim();
    if (!name) {
      setSendToast("⚠️ Escribe el nombre del comensal (o identificador).");
      setTimeout(() => setSendToast(""), 3500);
      return;
    }

    setSending(true);
    setSendToast("");

    try {
      const items = normalizeItemsForApi(cart);
      const res = await createWaiterOrder(tid, {
        customer_name: name,
        items,
      });

      if (res?.ok === false) {
        setSendToast(`⚠️ ${res?.message || "No se pudo crear la comanda."}`);
        setTimeout(() => setSendToast(""), 6000);
        return;
      }

      // tolerante
      const orderId = res?.data?.order_id || res?.data?.id || res?.order_id || null;

      setCart([]);
      setCustomerName("");
      setSendOpen(false);

      // Mensaje y regreso
      setSendToast(`✅ Comanda creada${orderId ? ` (#${orderId})` : ""}.`);
      setTimeout(() => {
        setSendToast("");
        nav("/staff/waiter/tables", { replace: true });
      }, 1200);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "No se pudo crear la comanda.";
      setSendToast(`⚠️ ${msg}`);
      setTimeout(() => setSendToast(""), 6500);
    } finally {
      setSending(false);
    }
  };

  // --- Render states ---
  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: "18px auto", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 950 }}>Cargando menú del mesero…</div>
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
              Mesa: <strong>{table?.name || `#${tid}`}</strong>
            </div>
          </div>
          <Badge tone="default">Staff</Badge>
        </div>

        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ maxWidth: 1200, margin: "18px auto", padding: 16 }}>
        <div
          style={{
            border: "1px solid rgba(255,0,0,0.25)",
            background: "#ffe5e5",
            borderRadius: 16,
            padding: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 950, color: "#a10000" }}>No se pudo cargar el menú</div>
              <div style={{ marginTop: 6, fontSize: 13, whiteSpace: "pre-line" }}>{errorMsg}</div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <PillButton onClick={() => loadMenu({ silent: false })} title="Reintentar">
                Reintentar
              </PillButton>
              <PillButton tone="soft" onClick={() => nav(-1)} title="Regresar">
                ← Volver
              </PillButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LAYOUT principal
  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "18px auto",
        padding: 16,
        background: "linear-gradient(180deg, rgba(238,242,255,0.55), rgba(255,255,255,0))",
      }}
    >
      {/* MODAL: Crear comanda */}
      <Modal
        open={sendOpen}
        title="Crear comanda"
        onClose={() => {
          if (!sending) setSendOpen(false);
        }}
        actions={
          <>
            <PillButton tone="default" disabled={sending} onClick={() => setSendOpen(false)} title="Cancelar">
              Cancelar
            </PillButton>
            <PillButton
              tone="orange"
              disabled={sending || cart.length === 0}
              onClick={submitCreate}
              title={cart.length === 0 ? "Selecciona productos primero" : "Guardar comanda"}
            >
              {sending ? "⏳ Guardando..." : "✅ Crear comanda"}
            </PillButton>
          </>
        }
      >
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontSize: 13, opacity: 0.85 }}>
            Escribe el nombre del comensal (o un identificador).
          </div>

          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Ej: Juan (Mesa 5)"
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              outline: "none",
              fontWeight: 850,
            }}
            maxLength={120}
            disabled={sending}
          />

          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Items: <strong>{cart.length}</strong> · Total: <strong>{money(cartTotal)}</strong>
          </div>

          {sendToast ? (
            <div
              style={{
                border: "1px solid rgba(0,0,0,0.10)",
                borderRadius: 14,
                padding: 10,
                background: "#fff",
                fontSize: 13,
                fontWeight: 850,
                whiteSpace: "pre-line",
              }}
            >
              {sendToast}
            </div>
          ) : null}
        </div>
      </Modal>

      {/* HEADER */}
      <div
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 18,
          background: "#fff",
          padding: 14,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontSize: 18, fontWeight: 950 }}>
              Menú del mesero · Mesa {table?.name || `#${tid}`}
            </div>

            <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge tone="dark">Staff</Badge>
              <Badge tone="default">
                Items: <strong style={{ marginLeft: 6 }}>{cart.length}</strong>
              </Badge>
              <Badge tone="default">
                Total: <strong style={{ marginLeft: 6 }}>{money(cartTotal)}</strong>
              </Badge>
              {refreshing ? <Badge tone="default">🔄 actualizando…</Badge> : null}
            </div>

            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6, WebkitOverflowScrolling: "touch" }}>
                {categoryOptions.map((c) => (
                  <CategoryChip
                    key={c.value}
                    label={c.label}
                    active={categoryFilter === c.value}
                    onClick={() => setCategoryFilter(c.value)}
                  />
                ))}
              </div>

              <div style={{ marginTop: 10 }}>
                <SearchBar value={q} onChange={setQ} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "start", flexWrap: "wrap" }}>
            <PillButton onClick={() => loadMenu({ silent: false })} title="Recargar menú">
              🔄 Recargar
            </PillButton>

            <PillButton
              tone="soft"
              onClick={() => {
                // Cancelar: limpiar y volver
                setCart([]);
                setCustomerName("");
                setSendToast("");
                nav(-1);
              }}
              title="Cancelar y regresar"
            >
              ✖ Cancelar
            </PillButton>

            <PillButton
              tone="orange"
              onClick={() => setSendOpen(true)}
              disabled={!canCreate}
              title={!cart.length ? "Selecciona productos para crear comanda" : "Guardar comanda"}
            >
              ✅ Crear comanda
            </PillButton>
          </div>
        </div>
      </div>

      {/* Layout: productos + comanda */}
      <div style={{ marginTop: 14 }}>
        <style>
          {`
            .menuGrid {
              display: grid;
              gap: 12px;
              grid-template-columns: repeat(1, minmax(0, 1fr));
            }
            @media (min-width: 640px) { .menuGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
            @media (min-width: 900px) { .menuGrid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
            @media (min-width: 1200px) { .menuGrid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

            .menuLayout {
              display: grid;
              gap: 12px;
              grid-template-columns: 1fr;
              align-items: start;
            }

            @media (min-width: 1100px) {
              .menuLayout {
                grid-template-columns: minmax(0, 1fr) 380px;
              }
              .comandaAside {
                position: sticky;
                top: 14px;
              }
            }
          `}
        </style>

        <div className="menuLayout">
          {/* IZQ: productos */}
          <div>
            <div className="menuGrid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const pid = Number(p.id);
                  const title = p.display_name || p.name;
                  const variants = Array.isArray(p.variants) ? p.variants : [];
                  const hasVariants = variants.length > 0;

                  const categoryName =
                    p.__categoryName ||
                    categoryNameById.get(Number(p.category_id)) ||
                    "Sin categoría";

                  const isVariantsOpen = expanded.has(`v:${pid}`);

                  const baseKey = makeKey(pid, null);
                  const baseInCart = cart.some((x) => x.key === baseKey);

                  return (
                    <div
                      key={p.id}
                      style={{
                        border: "1px solid rgba(0,0,0,0.10)",
                        borderRadius: 18,
                        background: "#fff",
                        overflow: "hidden",
                        boxShadow: "0 10px 26px rgba(0,0,0,0.05)",
                        display: "grid",
                      }}
                    >
                      <div style={{ padding: 10 }}>
                        <ProductThumb imageUrl={p.image_url || null} title={title} />
                      </div>

                      <div style={{ padding: "0 12px 12px 12px", display: "grid", gap: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
                          <div style={{ fontWeight: 950, fontSize: 14, lineHeight: 1.15 }}>{title}</div>
                          <div style={{ fontWeight: 950, fontSize: 14, whiteSpace: "nowrap" }}>{money(p.price)}</div>
                        </div>

                        <div style={{ fontSize: 12, opacity: 0.72 }}>
                          Categoría: <strong>{categoryName}</strong>
                        </div>

                        <PillButton
                          tone={baseInCart ? "dark" : "default"}
                          onClick={() => addToCartFromProduct(p)}
                          title="Agregar a comanda"
                        >
                          {baseInCart ? "✅ Agregado" : "➕ Seleccionar"}
                        </PillButton>

                        {hasVariants ? (
                          <div style={{ marginTop: 2 }}>
                            <button
                              onClick={() => togglePanel(`v:${pid}`)}
                              style={{
                                cursor: "pointer",
                                width: "100%",
                                borderRadius: 14,
                                border: "1px solid rgba(0,0,0,0.12)",
                                background: "#fafafa",
                                padding: "10px 12px",
                                fontWeight: 950,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 10,
                              }}
                              title="Ver variantes"
                            >
                              <span>Variantes ({variants.length})</span>
                              <span style={{ opacity: 0.75 }}>{isVariantsOpen ? "▲" : "▼"}</span>
                            </button>

                            <Collapse open={isVariantsOpen}>
                              <div style={{ display: "grid", gap: 8 }}>
                                {variants.map((v, idx) => {
                                  const vid = v.id || idx;
                                  const key = makeKey(pid, Number(vid));
                                  const inCart = cart.some((x) => x.key === key);

                                  return (
                                    <div
                                      key={vid}
                                      style={{
                                        display: "grid",
                                        gap: 8,
                                        padding: "10px 12px",
                                        borderRadius: 14,
                                        border: "1px solid rgba(0,0,0,0.10)",
                                        background: "#fff",
                                      }}
                                    >
                                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                        <div style={{ fontWeight: 850, fontSize: 13, minWidth: 0 }}>
                                          {v.name || v.display_name || `Variante ${idx + 1}`}
                                        </div>
                                        <div style={{ fontWeight: 950, fontSize: 13, whiteSpace: "nowrap" }}>
                                          {money(v.price)}
                                        </div>
                                      </div>

                                      <PillButton
                                        tone={inCart ? "dark" : "default"}
                                        onClick={() => addToCartFromVariant(p, v)}
                                        title="Agregar variante"
                                      >
                                        {inCart ? "✅ Agregada" : "➕ Seleccionar variante"}
                                      </PillButton>
                                    </div>
                                  );
                                })}
                              </div>
                            </Collapse>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: "#fff",
                    borderRadius: 16,
                    padding: 14,
                    gridColumn: "1 / -1",
                  }}
                >
                  <div style={{ fontWeight: 950 }}>Sin resultados</div>
                  <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>Prueba con otro texto o limpia filtros.</div>
                </div>
              )}
            </div>
          </div>

          {/* DER: comanda */}
          <div className="comandaAside">
            <div
              style={{
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 18,
                background: "#fff",
                padding: 14,
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                width: 380,
                maxWidth: "92vw",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 950 }}>Comanda</div>
                  <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
                    Selecciona productos y luego guarda la comanda.
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <Badge tone="default">
                    Total: <strong style={{ marginLeft: 6 }}>{money(cartTotal)}</strong>
                  </Badge>

                  <PillButton
                    tone="danger"
                    onClick={() => setCart([])}
                    title="Vaciar"
                    disabled={sending || cart.length === 0}
                  >
                    🗑️ Vaciar
                  </PillButton>

                  <PillButton
                    tone="orange"
                    onClick={() => setSendOpen(true)}
                    disabled={!canCreate}
                    title={!cart.length ? "Selecciona productos" : "Crear comanda"}
                  >
                    {sending ? "⏳ Enviando..." : "✅ Crear"}
                  </PillButton>
                </div>
              </div>

              {cart.length === 0 ? (
                <div style={{ marginTop: 12, fontSize: 13, opacity: 0.75 }}>
                  Aún no hay items.
                </div>
              ) : (
                <div style={{ marginTop: 12, overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 12, opacity: 0.8 }}>Producto</th>
                        <th style={{ textAlign: "right", padding: "10px 8px", fontSize: 12, opacity: 0.8 }}>Precio</th>
                        <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 12, opacity: 0.8 }}>Cant</th>
                        <th style={{ textAlign: "right", padding: "10px 8px", fontSize: 12, opacity: 0.8 }}>Subtotal</th>
                        <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 12, opacity: 0.8 }}>Notas</th>
                        <th style={{ textAlign: "right", padding: "10px 8px", fontSize: 12, opacity: 0.8 }}> </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((it) => {
                        const subtotal = safeNum(it.unit_price, 0) * safeNum(it.quantity, 1);
                        const label = it.variant_name ? `${it.name} · ${it.variant_name}` : it.name;

                        return (
                          <tr key={it.key}>
                            <td style={{ padding: "10px 8px", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                              <div style={{ fontWeight: 900, fontSize: 13 }}>{label}</div>
                            </td>

                            <td style={{ padding: "10px 8px", borderTop: "1px solid rgba(0,0,0,0.08)", textAlign: "right", fontWeight: 900 }}>
                              {money(it.unit_price)}
                            </td>

                            <td style={{ padding: "10px 8px", borderTop: "1px solid rgba(0,0,0,0.08)", textAlign: "center" }}>
                              <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                                <button
                                  onClick={() => setCartQty(it.key, Math.max(1, safeNum(it.quantity, 1) - 1))}
                                  style={{ cursor: "pointer", border: "1px solid rgba(0,0,0,0.12)", background: "#fff", borderRadius: 10, padding: "6px 10px", fontWeight: 950 }}
                                  title="Menos"
                                >
                                  −
                                </button>

                                <input
                                  value={it.quantity}
                                  onChange={(e) => setCartQty(it.key, e.target.value)}
                                  style={{ width: 54, padding: "6px 8px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", outline: "none", textAlign: "center", fontWeight: 900 }}
                                />

                                <button
                                  onClick={() => setCartQty(it.key, Math.min(99, safeNum(it.quantity, 1) + 1))}
                                  style={{ cursor: "pointer", border: "1px solid rgba(0,0,0,0.12)", background: "#fff", borderRadius: 10, padding: "6px 10px", fontWeight: 950 }}
                                  title="Más"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            <td style={{ padding: "10px 8px", borderTop: "1px solid rgba(0,0,0,0.08)", textAlign: "right", fontWeight: 950 }}>
                              {money(subtotal)}
                            </td>

                            <td style={{ padding: "10px 8px", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                              <input
                                value={it.notes || ""}
                                onChange={(e) => setCartNotes(it.key, e.target.value)}
                                placeholder="Ej: sin cebolla"
                                maxLength={500}
                                style={{ width: "min(420px, 70vw)", padding: "8px 10px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)", outline: "none", fontWeight: 750 }}
                              />
                            </td>

                            <td style={{ padding: "10px 8px", borderTop: "1px solid rgba(0,0,0,0.08)", textAlign: "right" }}>
                              <button
                                onClick={() => removeCartItem(it.key)}
                                style={{ cursor: "pointer", border: "1px solid rgba(0,0,0,0.12)", background: "#fff", borderRadius: 12, padding: "8px 10px", fontWeight: 950 }}
                                title="Quitar"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {sendToast ? (
                <div style={{ marginTop: 10, border: "1px solid rgba(0,0,0,0.10)", borderRadius: 14, padding: 10, background: "#fff", fontSize: 13, fontWeight: 850, whiteSpace: "pre-line" }}>
                  {sendToast}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}