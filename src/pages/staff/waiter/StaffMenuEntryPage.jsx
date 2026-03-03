// src/pages/staff/StaffMenuEntryPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { fetchStaffWaiterMenu } from "../../../services/staff/waiter/staffOrders.service";

import { makeKey, money, safeNum } from "../../../hooks/public/publicMenu.utils";
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

import { useMenuProducts } from "../../../hooks/public/useMenuProducts";
import { useCompositeDrafts } from "../../../hooks/public/useCompositeDrafts";
import { useStaffCartAndOrder } from "../../../hooks/staff/useStaffCartAndOrder";

export default function StaffMenuEntryPage() {
  const { tableId } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const intentFromState = location.state?.intent || null;
  const orderIdFromState = location.state?.existingOrderId || null;

  const modeFromQuery = String(sp.get("mode") || "create");
  const orderIdFromQuery = sp.get("order_id") ? Number(sp.get("order_id")) : null;

  const effectiveMode = intentFromState === "view" ? "view" : modeFromQuery;
  const effectiveOrderId = orderIdFromState || orderIdFromQuery || null;

  // UI filtros
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState(() => new Set());

  // loader
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setData] = useState(null);

  // carrito/orden staff
  const cartOrder = useStaffCartAndOrder({ tableId: Number(tableId) });
  const composite = useCompositeDrafts({ cartOrder });

  // normaliza payload parecido a public
  const header = data?.header || {
    restaurantName: data?.restaurant?.trade_name,
    branchName: data?.branch?.name,
    tableName: data?.table?.name,
    channelName: data?.sales_channel?.name,
  };

  const sections = Array.isArray(data?.sections) ? data.sections : (Array.isArray(data?.data?.sections) ? data.data.sections : []);

  const { categoryNameById, categoryOptions, filteredProducts } = useMenuProducts({
    sections,
    categoryFilter,
    q,
    expanded,
  });

  const load = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
      setErrorMsg("");
    }
    try {
      const res = await fetchStaffWaiterMenu(Number(tableId));
      // acepta {ok,data} o payload directo
      const payload = res?.data ? res.data : res;
      setData(payload);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "No se pudo cargar el menú del mesero.";
      setErrorMsg(String(msg));
      setData(null);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // carga inicial menú
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId]);

  // si venimos a “ver comanda”, precargar historial
  const onceRef = useRef(false);
  useEffect(() => {
    if (onceRef.current) return;
    if (!effectiveOrderId) return;

    onceRef.current = true;
    cartOrder.loadExisting({ orderId: effectiveOrderId }).catch(() => {});
  }, [effectiveOrderId]);

  const togglePanel = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const canSelect = true; // mesero siempre puede seleccionar (si backend no lo bloquea)

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: "18px auto", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 950 }}>Cargando menú del mesero…</div>
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
              Mesa: <strong>{tableId}</strong>
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
        <div style={{ border: "1px solid rgba(255,0,0,0.25)", background: "#ffe5e5", borderRadius: 16, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 950, color: "#a10000" }}>No se pudo cargar</div>
              <div style={{ marginTop: 6, fontSize: 13, whiteSpace: "pre-line" }}>{errorMsg}</div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                Mesa: <strong>{tableId}</strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <PillButton onClick={() => navigate("/staff/waiter/tables/grid")} title="Volver al grid">
                ⬅️ Volver
              </PillButton>
              <PillButton onClick={() => load()} title="Reintentar">
                🔄 Reintentar
              </PillButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ maxWidth: 1200, margin: "18px auto", padding: 16 }}>
        <div style={{ border: "1px solid rgba(0,0,0,0.12)", background: "#fff", borderRadius: 16, padding: 14 }}>
          <div style={{ fontWeight: 950 }}>Sin data</div>
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>Esto no debería pasar… mas acontece.</div>
        </div>
      </div>
    );
  }

  const canAppend = cartOrder.canAppend;
  const hasOld = Array.isArray(cartOrder.oldItems) && cartOrder.oldItems.length > 0;

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "18px auto",
        padding: 16,
        background: "linear-gradient(180deg, rgba(238,242,255,0.55), rgba(255,255,255,0))",
      }}
    >
      {/* MODAL nombre (solo para crear primera comanda) */}
      <Modal
        open={cartOrder.sendOpen}
        title={canAppend ? "Agregar a comanda" : "Crear comanda"}
        onClose={() => {
          if (!cartOrder.sending) cartOrder.setSendOpen(false);
        }}
        actions={
          <>
            <PillButton
              tone="default"
              disabled={cartOrder.sending}
              onClick={() => cartOrder.setSendOpen(false)}
              title="Cancelar"
            >
              Cancelar
            </PillButton>

            <PillButton
              tone="orange"
              disabled={cartOrder.sending || cartOrder.cart.length === 0 || (!canAppend && !String(cartOrder.customerName || "").trim())}
              onClick={cartOrder.submitOrderOrAppend}
              title={canAppend ? "Agregar items a la orden abierta" : "Crear orden con nombre"}
            >
              {cartOrder.sending ? "⏳ Enviando..." : canAppend ? "➕ Agregar" : "📨 Crear"}
            </PillButton>
          </>
        }
      >
        <div style={{ display: "grid", gap: 10 }}>
          {!canAppend ? (
            <>
              <div style={{ fontSize: 13, opacity: 0.85 }}>Escribe el nombre del cliente.</div>
              <input
                value={cartOrder.customerName}
                onChange={(e) => cartOrder.setCustomerName(e.target.value)}
                placeholder="Ej: Juan (Mesa 5)"
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.12)",
                  outline: "none",
                  fontWeight: 850,
                }}
                maxLength={120}
                disabled={cartOrder.sending}
              />
            </>
          ) : (
            <div style={{ fontSize: 13, opacity: 0.85 }}>
              Esta orden está abierta. Los items nuevos se agregarán.
            </div>
          )}

          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Items: <strong>{cartOrder.cart.length}</strong> · Total aprox:{" "}
            <strong>{money(cartOrder.cartTotal)}</strong>
          </div>

          {cartOrder.sendToast ? (
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
              {cartOrder.sendToast}
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
              {header?.restaurantName || data?.restaurant?.trade_name || "Restaurante"}
            </div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>
              <strong>{header?.branchName || data?.branch?.name || "Sucursal"}</strong>
              {header?.tableName || data?.table?.name ? ` · Mesa ${header?.tableName || data?.table?.name}` : ` · Mesa ${tableId}`}
            </div>

            <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge tone="dark">🧑‍🍳 Staff</Badge>

              {canAppend ? (
                <Badge tone="ok" title="Orden abierta: puedes agregar productos">
                   Orden abierta
                </Badge>
              ) : null}

              {hasOld ? (
                <Badge tone="default" title="Items ya enviados">
                  Historial: <strong style={{ marginLeft: 6 }}>{cartOrder.oldItems.length}</strong>
                </Badge>
              ) : null}

              <Badge tone={cartOrder.cart.length > 0 ? "ok" : "warn"} title="Items nuevos">
                Nuevos: <strong style={{ marginLeft: 6 }}>{cartOrder.cart.length}</strong>
              </Badge>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "start", flexWrap: "wrap" }}>

            <PillButton onClick={() => load()} title="Recargar menú">
              🔄 Recargar
            </PillButton>


            <PillButton
              tone="default"
              onClick={() => navigate("/staff/waiter/tables/grid")}
              title="Cancelar y volver al grid"
            >
              ⬅️ Regresar
            </PillButton>

          </div>
        </div>

        {/* filtros */}
        <div style={{ marginTop: 14 }}>
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

          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Badge tone="default">
              Mostrando: <strong style={{ marginLeft: 6 }}>{filteredProducts.length}</strong>
            </Badge>

            {(categoryFilter !== "all" || q) && (
              <PillButton
                onClick={() => {
                  setCategoryFilter("all");
                  setQ("");
                }}
                title="Limpiar filtros"
              >
                🧹 Limpiar
              </PillButton>
            )}
          </div>
        </div>
      </div>

      {/* LAYOUT: productos + comanda */}
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
          {/* PRODUCTOS */}
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
                  const isCompositeOpen = expanded.has(`c:${pid}`);

                  const isComposite = String(p.product_type || "simple") === "composite";
                  const compositeItems = Array.isArray(p?.composite?.items) ? p.composite.items : [];
                  const hasComposite = isComposite && compositeItems.length > 0;

                  const baseKey = makeKey(pid, null);
                  const baseInCart = cartOrder.cart.some((x) => x.key === baseKey);
                  const draft = hasComposite ? composite.getOrInitCompositeDraft(p) : null;

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

                        {isComposite ? (
                          <div style={{ fontSize: 12, opacity: 0.8 }}>
                            Tipo: <strong>Compuesto</strong>
                          </div>
                        ) : null}

                        {hasComposite ? (
                          <div style={{ marginTop: 2 }}>
                            <button
                              onClick={() => togglePanel(`c:${pid}`)}
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
                              title="Ver componentes del producto"
                            >
                              <span>Componentes ({compositeItems.length})</span>
                              <span style={{ opacity: 0.75 }}>{isCompositeOpen ? "▲" : "▼"}</span>
                            </button>

                            <Collapse open={isCompositeOpen}>
                              <div style={{ display: "grid", gap: 8 }}>
                                {(draft || []).map((c) => {
                                  const cid = Number(c.component_product_id);

                                  const allowVar = !!c.allow_variant;
                                  const vars = Array.isArray(c.variants) ? c.variants : [];
                                  const canPickVariant = allowVar && vars.length > 0;

                                  return (
                                    <div
                                      key={cid}
                                      style={{
                                        display: "grid",
                                        gap: 8,
                                        padding: "10px 12px",
                                        borderRadius: 14,
                                        border: "1px solid rgba(0,0,0,0.10)",
                                        background: "#fff",
                                      }}
                                    >
                                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
                                        <div style={{ minWidth: 0 }}>
                                          <div style={{ fontWeight: 900, fontSize: 13 }}>{c.name}</div>
                                          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
                                            Cantidad: <strong>{Number.isFinite(Number(c.quantity)) ? Number(c.quantity) : 1}</strong>
                                            {c.is_optional ? (
                                              <>
                                                {" "}· <strong>Opcional</strong>
                                              </>
                                            ) : (
                                              <>
                                                {" "}· <strong>Requerido</strong>
                                              </>
                                            )}
                                          </div>
                                          {c.notes ? (
                                            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2, whiteSpace: "pre-line" }}>
                                              {String(c.notes)}
                                            </div>
                                          ) : null}
                                        </div>

                                        {c.is_optional ? (
                                          <label style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 12, fontWeight: 900 }}>
                                            <input
                                              type="checkbox"
                                              checked={c.included !== false}
                                              onChange={(e) => {
                                                composite.setDraftIncluded(pid, cid, e.target.checked);
                                                setTimeout(() => composite.syncDraftToCartFirstItemIfExists(pid), 0);
                                              }}
                                              style={{ transform: "scale(1.1)" }}
                                            />
                                            Incluir
                                          </label>
                                        ) : null}
                                      </div>

                                      {canPickVariant ? (
                                        <div style={{ display: "grid", gap: 6 }}>
                                          <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.85 }}>
                                            Variante del componente
                                          </div>
                                          <select
                                            value={c.variant_id ? String(c.variant_id) : ""}
                                            onChange={(e) => {
                                              composite.setDraftVariant(pid, cid, e.target.value ? Number(e.target.value) : null);
                                              setTimeout(() => composite.syncDraftToCartFirstItemIfExists(pid), 0);
                                            }}
                                            disabled={c.included === false}
                                            style={{
                                              width: "100%",
                                              padding: "10px 12px",
                                              borderRadius: 12,
                                              border: "1px solid rgba(0,0,0,0.12)",
                                              outline: "none",
                                              fontWeight: 850,
                                              background: "#fff",
                                              opacity: c.included === false ? 0.65 : 1,
                                            }}
                                          >
                                            <option value="">(Sin variante)</option>
                                            {vars.map((v) => (
                                              <option key={v.id} value={String(v.id)}>
                                                {v.name}
                                              </option>
                                            ))}
                                          </select>

                                          <div style={{ fontSize: 12, opacity: 0.7 }}>
                                            {c.apply_variant_price
                                              ? "Nota: esta variante puede afectar el precio."
                                              : "Nota: la variante es solo elección (sin precio)."}
                                          </div>
                                        </div>
                                      ) : allowVar ? (
                                        <div style={{ fontSize: 12, opacity: 0.75 }}>
                                          Este componente permite variante, mas no hay variantes disponibles.
                                        </div>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>
                            </Collapse>
                          </div>
                        ) : null}

                        <PillButton
                          tone={baseInCart ? "dark" : "default"}
                          onClick={() => {
                            if (isComposite && hasComposite) {
                              const draftNow = composite.getOrInitCompositeDraft(p);
                              const synced = composite.syncDraftToCartFirstItemIfExists(pid);
                              if (!synced) {
                                cartOrder.addToCartFromProduct(p, composite.draftToSubmitComponents(draftNow));
                              }
                              return;
                            }
                            cartOrder.addToCartFromProduct(p);
                          }}
                          title={isComposite ? "Agregar compuesto con componentes" : "Agregar a comanda"}
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
                                  const inCart = cartOrder.cart.some((x) => x.key === key);

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
                                        onClick={() => {
                                          if (isComposite && hasComposite) {
                                            const draftNow = composite.getOrInitCompositeDraft(p);
                                            cartOrder.addToCartFromVariant(p, v, composite.draftToSubmitComponents(draftNow));
                                            return;
                                          }
                                          cartOrder.addToCartFromVariant(p, v);
                                        }}
                                        title="Agregar variante a comanda"
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

          {/* COMANDA */}
          <div className="comandaAside">
            {(cartOrder.cart.length > 0 || hasOld) ? (
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
                      {canAppend ? "Orden abierta: puedes agregar productos." : "Selecciona productos y luego crea la comanda."}
                    </div>
                    {canAppend && cartOrder.activeOrder?.customer_name ? (
                      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
                        A nombre de: <strong>{cartOrder.activeOrder.customer_name}</strong>
                      </div>
                    ) : null}
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <Badge tone="default">
                      Total: <strong style={{ marginLeft: 6 }}>{money(safeNum(cartOrder.totalGlobal, cartOrder.cartTotal))}</strong>
                    </Badge>

                    <PillButton
                      tone="danger"
                      onClick={() => cartOrder.setCart([])}
                      title="Vaciar items nuevos"
                      disabled={cartOrder.sending || cartOrder.cart.length === 0}
                    >
                      🗑️ Vaciar
                    </PillButton>

                    <PillButton
                      tone="orange"
                      onClick={() => {
                        if (canAppend) {
                          cartOrder.submitOrderOrAppend();
                          return;
                        }
                        cartOrder.setSendOpen(true);
                      }}
                      disabled={cartOrder.sending || cartOrder.cart.length === 0}
                      title={canAppend ? "Agregar a orden abierta" : "Crear comanda (pide nombre)"}
                    >
                      {cartOrder.sending ? "⏳ Enviando..." : canAppend ? "➕ Agregar" : "📤 Enviar"}
                    </PillButton>
                  </div>
                </div>

                {/* HISTORIAL */}
                {hasOld ? (
                  <div style={{ marginTop: 12, overflowX: "auto" }}>
                    <div style={{ fontSize: 12, fontWeight: 950, opacity: 0.85, marginBottom: 8 }}>
                      Items ya enviados
                    </div>

                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 12, opacity: 0.8 }}>Producto</th>
                          <th style={{ textAlign: "right", padding: "10px 8px", fontSize: 12, opacity: 0.8 }}>Precio</th>
                          <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 12, opacity: 0.8 }}>Cant</th>
                          <th style={{ textAlign: "right", padding: "10px 8px", fontSize: 12, opacity: 0.8 }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartOrder.oldItems.map((it) => {
                          const label = it.variant_name
                            ? `${it.product_name} · ${it.variant_name}`
                            : (it.product_name || `Producto #${it.product_id}`);
                          const subtotal = safeNum(it.line_total, safeNum(it.unit_price, 0) * safeNum(it.quantity, 1));
                          return (
                            <tr key={`old-${it.id}`}>
                              <td style={{ padding: "10px 8px", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                                <div style={{ fontWeight: 900, fontSize: 13 }}>{label}</div>
                                {it.notes ? (
                                  <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2, whiteSpace: "pre-line" }}>
                                    • {typeof it.notes === "string" ? it.notes : JSON.stringify(it.notes)}
                                  </div>
                                ) : null}
                              </td>
                              <td style={{ padding: "10px 8px", borderTop: "1px solid rgba(0,0,0,0.08)", textAlign: "right", fontWeight: 900 }}>
                                {money(it.unit_price)}
                              </td>
                              <td style={{ padding: "10px 8px", borderTop: "1px solid rgba(0,0,0,0.08)", textAlign: "center", fontWeight: 900 }}>
                                {it.quantity}
                              </td>
                              <td style={{ padding: "10px 8px", borderTop: "1px solid rgba(0,0,0,0.08)", textAlign: "right", fontWeight: 950 }}>
                                {money(subtotal)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ marginTop: 12, fontSize: 13, opacity: 0.75 }}>
                    No hay historial cargado.
                  </div>
                )}

                {/* NUEVOS */}
                {cartOrder.cart.length > 0 ? (
                  <div style={{ marginTop: 12, overflowX: "auto" }}>
                    <div style={{ fontSize: 12, fontWeight: 950, opacity: 0.85, marginBottom: 8 }}>
                      Items nuevos por {canAppend ? "agregar" : "enviar"}
                    </div>

                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 12, opacity: 0.8 }}>Producto</th>
                          <th style={{ textAlign: "right", padding: "10px 8px", fontSize: 12, opacity: 0.8 }}>Precio</th>
                          <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 12, opacity: 0.8 }}>Cantidad</th>
                          <th style={{ textAlign: "right", padding: "10px 8px", fontSize: 12, opacity: 0.8 }}>Subtotal</th>
                          <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 12, opacity: 0.8 }}>Notas</th>
                          <th style={{ textAlign: "right", padding: "10px 8px", fontSize: 12, opacity: 0.8 }}> </th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartOrder.cart.map((it) => {
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
                                    onClick={() => cartOrder.setCartQty(it.key, Math.max(1, safeNum(it.quantity, 1) - 1))}
                                    style={{ cursor: "pointer", border: "1px solid rgba(0,0,0,0.12)", background: "#fff", borderRadius: 10, padding: "6px 10px", fontWeight: 950 }}
                                    title="Menos"
                                  >
                                    −
                                  </button>

                                  <input
                                    value={it.quantity}
                                    onChange={(e) => cartOrder.setCartQty(it.key, e.target.value)}
                                    style={{ width: 54, padding: "6px 8px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", outline: "none", textAlign: "center", fontWeight: 900 }}
                                  />

                                  <button
                                    onClick={() => cartOrder.setCartQty(it.key, Math.min(99, safeNum(it.quantity, 1) + 1))}
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
                                  onChange={(e) => cartOrder.setCartNotes(it.key, e.target.value)}
                                  placeholder="Ej: sin cebolla"
                                  maxLength={500}
                                  style={{ width: "min(420px, 70vw)", padding: "8px 10px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)", outline: "none", fontWeight: 750 }}
                                />
                              </td>

                              <td style={{ padding: "10px 8px", borderTop: "1px solid rgba(0,0,0,0.08)", textAlign: "right" }}>
                                <button
                                  onClick={() => cartOrder.removeCartItem(it.key)}
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
                ) : null}

                {cartOrder.sendToast ? (
                  <div style={{ marginTop: 10, border: "1px solid rgba(0,0,0,0.10)", borderRadius: 14, padding: 10, background: "#fff", fontSize: 13, fontWeight: 850, whiteSpace: "pre-line" }}>
                    {cartOrder.sendToast}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}