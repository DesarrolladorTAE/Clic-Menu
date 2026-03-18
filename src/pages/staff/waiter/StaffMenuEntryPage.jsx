import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { fetchStaffWaiterMenu } from "../../../services/staff/waiter/staffOrders.service";

import { Badge, Modal, PillButton, SkeletonCard } from "../../public/publicMenu.ui";
import { useMenuProducts } from "../../../hooks/public/useMenuProducts";
import { useCompositeDrafts } from "../../../hooks/public/useCompositeDrafts";
import { useStaffCartAndOrder } from "../../../hooks/staff/useStaffCartAndOrder";

import MenuHeaderCard from "../../../components/menu/shared/MenuHeaderCard";
import MenuProductCard from "../../../components/menu/shared/MenuProductCard";
import CompositeProductModal from "../../../components/menu/shared/CompositeProductModal";
import MenuCartPanel from "../../../components/menu/shared/MenuCartPanel";

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

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [q, setQ] = useState("");

  const [compositeModalOpen, setCompositeModalOpen] = useState(false);
  const [selectedCompositeProduct, setSelectedCompositeProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setData] = useState(null);

  const cartOrder = useStaffCartAndOrder({ tableId: Number(tableId) });
  const composite = useCompositeDrafts();

  const header = data?.header || {
    restaurantName: data?.restaurant?.trade_name,
    branchName: data?.branch?.name,
    tableName: data?.table?.name,
    channelName: data?.sales_channel?.name,
  };

  const sections = Array.isArray(data?.sections)
    ? data.sections
    : Array.isArray(data?.data?.sections)
    ? data.data.sections
    : [];

  const { categoryNameById, categoryOptions, filteredProducts } = useMenuProducts({
    sections,
    categoryFilter,
    q,
  });

  const load = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
      setErrorMsg("");
    }
    try {
      const res = await fetchStaffWaiterMenu(Number(tableId));
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

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId]);

  const onceRef = useRef(false);
  useEffect(() => {
    if (onceRef.current) return;
    if (!effectiveOrderId) return;

    onceRef.current = true;
    cartOrder.loadExisting({ orderId: effectiveOrderId }).catch(() => {});
  }, [effectiveOrderId, cartOrder]);

  const canSelect = true;
  const canAppend = cartOrder.canAppend;
  const hasOld = Array.isArray(cartOrder.oldItems) && cartOrder.oldItems.length > 0;

  const openCompositeConfigurator = (product) => {
    composite.resetDraftForProduct(product);
    setSelectedCompositeProduct(product);
    setCompositeModalOpen(true);
  };

  const confirmCompositeSelection = () => {
    if (!selectedCompositeProduct) return;

    const components = composite.buildSubmitComponentsFromProduct(selectedCompositeProduct);
    const details = composite.buildDetailsFromProduct(selectedCompositeProduct);

    cartOrder.addToCartFromProduct(selectedCompositeProduct, components, details);
    setCompositeModalOpen(false);
    setSelectedCompositeProduct(null);
  };

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
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>
            Esto no debería pasar… mas acontece.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "18px auto",
        padding: 16,
        background: "linear-gradient(180deg, rgba(238,242,255,0.55), rgba(255,255,255,0))",
      }}
    >
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
              disabled={
                cartOrder.sending ||
                cartOrder.cart.length === 0 ||
                (!canAppend && !String(cartOrder.customerName || "").trim())
              }
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
            <strong>{cartOrder.cartTotal?.toLocaleString?.("es-MX", { style: "currency", currency: "MXN" })}</strong>
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

      <CompositeProductModal
        open={compositeModalOpen}
        product={selectedCompositeProduct}
        draft={selectedCompositeProduct ? composite.getOrInitCompositeDraft(selectedCompositeProduct) : []}
        onClose={() => {
          setCompositeModalOpen(false);
          setSelectedCompositeProduct(null);
        }}
        onToggleIncluded={(cid, included) => {
          if (!selectedCompositeProduct) return;
          composite.setDraftIncluded(Number(selectedCompositeProduct.id), cid, included);
        }}
        onVariantChange={(cid, variantId) => {
          if (!selectedCompositeProduct) return;
          composite.setDraftVariant(Number(selectedCompositeProduct.id), cid, variantId);
        }}
        onConfirm={confirmCompositeSelection}
        confirmLabel="Agregar compuesto"
      />

      <MenuHeaderCard
        title={header?.restaurantName || data?.restaurant?.trade_name || "Restaurante"}
        subtitle={
          <>
            <strong>{header?.branchName || data?.branch?.name || "Sucursal"}</strong>
            {header?.tableName || data?.table?.name
              ? ` · Mesa ${header?.tableName || data?.table?.name}`
              : ` · Mesa ${tableId}`}
          </>
        }
        badges={[
          { tone: "dark", label: "🧑‍🍳 Staff" },
          ...(canAppend ? [{ tone: "ok", label: "Orden abierta", title: "Orden abierta: puedes agregar productos" }] : []),
          ...(hasOld
            ? [{ tone: "default", label: `Historial: ${cartOrder.oldItems.length}`, title: "Items ya enviados" }]
            : []),
          { tone: cartOrder.cart.length > 0 ? "ok" : "warn", label: `Nuevos: ${cartOrder.cart.length}`, title: "Items nuevos" },
        ]}
        rightActions={
          <>
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
          </>
        }
        categoryOptions={categoryOptions}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        q={q}
        onSearchChange={setQ}
        totalVisible={filteredProducts.length}
      />

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
          <div>
            <div className="menuGrid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <MenuProductCard
                    key={p.id}
                    product={p}
                    categoryName={
                      p.__categoryName ||
                      categoryNameById.get(Number(p.category_id)) ||
                      "Sin categoría"
                    }
                    canSelect={canSelect}
                    showSelectBtn={true}
                    onAddSimple={(product) => cartOrder.addToCartFromProduct(product)}
                    onAddVariant={(product, variant) => cartOrder.addToCartFromVariant(product, variant)}
                    onOpenComposite={openCompositeConfigurator}
                  />
                ))
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
                  <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>
                    Prueba con otro texto o limpia filtros.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="comandaAside">
            <MenuCartPanel
              title="Comanda"
              subtitle={
                canAppend
                  ? "Orden abierta: puedes agregar productos."
                  : "Selecciona productos y luego crea la comanda."
              }
              customerName={canAppend ? cartOrder.activeOrder?.customer_name || "" : ""}
              total={cartOrder.totalGlobal}
              oldItems={cartOrder.oldItems}
              newItems={cartOrder.cart}
              sendToast={cartOrder.sendToast}
              sending={cartOrder.sending}
              canAppend={canAppend}
              canSubmit={cartOrder.cart.length > 0}
              onEmpty={() => cartOrder.setCart([])}
              onSubmit={() => {
                if (canAppend) {
                  cartOrder.submitOrderOrAppend();
                  return;
                }
                cartOrder.setSendOpen(true);
              }}
              onQtyChange={cartOrder.setCartQty}
              onNotesChange={cartOrder.setCartNotes}
              onRemove={cartOrder.removeCartItem}
            />
          </div>
        </div>
      </div>
    </div>
  );
}