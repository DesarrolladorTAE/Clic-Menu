import React, { useEffect, useRef, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import echo from "../../../realtime/echo";

import { fetchStaffWaiterMenu } from "../../../services/staff/waiter/staffOrders.service";

import { Badge, Modal, PillButton, SkeletonCard } from "../../public/publicMenu.ui";
import usePagination from "../../../hooks/usePagination";
import PaginationFooter from "../../../components/common/PaginationFooter";

import { useMenuProducts } from "../../../hooks/public/useMenuProducts";
import { useCompositeDrafts } from "../../../hooks/public/useCompositeDrafts";
import { useStaffCartAndOrder } from "../../../hooks/staff/useStaffCartAndOrder";
import { buildModifierContextSections } from "../../../hooks/public/publicMenu.utils";

import MenuHeaderCard from "../../../components/menu/shared/MenuHeaderCard";
import MenuProductCard from "../../../components/menu/shared/MenuProductCard";
import ProductVariantsModal from "../../../components/menu/shared/ProductVariantsModal";
import CompositeProductModal from "../../../components/menu/shared/CompositeProductModal";
import ProductExtrasModal from "../../../components/menu/shared/ProductExtrasModal";
import MenuCartPanel from "../../../components/menu/shared/MenuCartPanel";
import MenuCartDrawer from "../../../components/menu/shared/MenuCartDrawer";
import MenuCartFloatingButton from "../../../components/menu/shared/MenuCartFloatingButton";
import WaiterWarehouseCreateDialog from "../../../components/menu/shared/WaiterWarehouseCreateDialog";
import PublicMenuCategoryTabs from "../../../components/menu/shared/menuUi/PublicMenuCategoryTabs";

function buildComponentModifierKey(componentProductId, variantId = null) {
  return `${Number(componentProductId || 0)}:${variantId ? Number(variantId) : 0}`;
}

function applyComponentModifierPayloadToComponents(components = [], componentModifiers = []) {
  const grouped = {};

  (Array.isArray(componentModifiers) ? componentModifiers : []).forEach((group) => {
    const key = buildComponentModifierKey(
      group?.component_product_id,
      group?.component_variant_id,
    );

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(group);
  });

  return (Array.isArray(components) ? components : []).map((component) => {
    const key = buildComponentModifierKey(
      component?.component_product_id,
      component?.variant_id,
    );

    return {
      ...component,
      modifiers: grouped[key] || [],
    };
  });
}

function applyComponentDisplayGroupsToDetails(details = [], componentDisplayGroups = []) {
  const grouped = {};

  (Array.isArray(componentDisplayGroups) ? componentDisplayGroups : []).forEach((group) => {
    const key = buildComponentModifierKey(
      group?.component_product_id,
      group?.component_variant_id,
    );

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(group);
  });

  return (Array.isArray(details) ? details : []).map((detail) => {
    const key = buildComponentModifierKey(
      detail?.component_product_id,
      detail?.variant_id,
    );

    return {
      ...detail,
      modifier_groups_display: grouped[key] || [],
    };
  });
}

function hasContextualModifiers(product, opts = {}) {
  return buildModifierContextSections(product, opts).length > 0;
}

export default function StaffMenuEntryPage() {
  const { tableId } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const orderIdFromState = location.state?.existingOrderId || null;
  const orderIdFromQuery = sp.get("order_id") ? Number(sp.get("order_id")) : null;

  const effectiveOrderId = orderIdFromState || orderIdFromQuery || null;

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [q, setQ] = useState("");

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const [variantsModalOpen, setVariantsModalOpen] = useState(false);
  const [selectedVariantsProduct, setSelectedVariantsProduct] = useState(null);

  const [compositeModalOpen, setCompositeModalOpen] = useState(false);
  const [selectedCompositeProduct, setSelectedCompositeProduct] = useState(null);

  const [extrasModalOpen, setExtrasModalOpen] = useState(false);
  const [selectedExtrasProduct, setSelectedExtrasProduct] = useState(null);
  const [selectedExtrasVariantId, setSelectedExtrasVariantId] = useState(null);
  const [selectedExtrasCompositeDraft, setSelectedExtrasCompositeDraft] =
    useState(null);
  const [selectedExtrasInitialValue, setSelectedExtrasInitialValue] = useState([]);
  const [selectedExtrasReadOnly, setSelectedExtrasReadOnly] = useState(false);
  const [selectedExtrasSubmitKind, setSelectedExtrasSubmitKind] = useState(null);
  const [selectedExtrasVariantObj, setSelectedExtrasVariantObj] = useState(null);
  const [selectedExtrasSelectionScope, setSelectedExtrasSelectionScope] =
    useState("all");
  const [pendingCompositeComponents, setPendingCompositeComponents] = useState([]);
  const [pendingCompositeDetails, setPendingCompositeDetails] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setData] = useState(null);

  const cartOrder = useStaffCartAndOrder({ tableId: Number(tableId) });
  const composite = useCompositeDrafts();

  const realtimeBusyRef = useRef(false);

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

  const {
    page,
    nextPage,
    prevPage,
    total,
    totalPages,
    startItem,
    endItem,
    hasPrev,
    hasNext,
    paginatedItems: paginatedProducts,
  } = usePagination({
    items: filteredProducts,
    initialPage: 1,
    pageSize: 8,
    mode: "frontend",
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
    cartOrder.loadExisting({ orderId: effectiveOrderId, force: true }).catch(() => {});
  }, [effectiveOrderId, cartOrder]);

  const branchId = Number(data?.branch?.id || data?.branch_id || 0);

  useEffect(() => {
    if (!branchId || !tableId) return;

    const currentTableId = Number(tableId);
    const channelName = `branch.${branchId}.tables`;
    const channel = echo.private(channelName);

    const onTableUpdated = async (event) => {
      const eventTableId = Number(event?.table_id || 0);
      if (!eventTableId || eventTableId !== currentTableId) return;

      if (realtimeBusyRef.current) return;
      realtimeBusyRef.current = true;

      try {
        await load({ silent: true }).catch(() => {});

        const incomingOrderId = Number(event?.order_id || 0);
        const activeOrderId = Number(cartOrder?.activeOrder?.id || 0);
        const targetOrderId =
          incomingOrderId || activeOrderId || Number(effectiveOrderId || 0);

        if (targetOrderId) {
          await cartOrder.loadExisting({ orderId: targetOrderId, force: true }).catch(() => {});
        } else {
          await cartOrder.loadExisting({ force: true }).catch(() => {});
        }
      } finally {
        realtimeBusyRef.current = false;
      }
    };

    channel.listen(".table.grid.updated", onTableUpdated);

    return () => {
      echo.leave(channelName);
    };
  }, [branchId, tableId, cartOrder, effectiveOrderId]);

  const canSelect = true;
  const canAppend = cartOrder.canAppend;
  const hasOld = Array.isArray(cartOrder.oldItems) && cartOrder.oldItems.length > 0;

  const cartDrawerItemCount =
    Number(cartOrder.cart?.length || 0) + Number(cartOrder.oldItems?.length || 0);

  const hasCartContent =
    (Array.isArray(cartOrder.cart) && cartOrder.cart.length > 0) ||
    (Array.isArray(cartOrder.oldItems) && cartOrder.oldItems.length > 0);

  const resetExtrasFlow = () => {
    setExtrasModalOpen(false);
    setSelectedExtrasProduct(null);
    setSelectedExtrasVariantId(null);
    setSelectedExtrasCompositeDraft(null);
    setSelectedExtrasInitialValue([]);
    setSelectedExtrasReadOnly(false);
    setSelectedExtrasSubmitKind(null);
    setSelectedExtrasVariantObj(null);
    setSelectedExtrasSelectionScope("all");
    setPendingCompositeComponents([]);
    setPendingCompositeDetails([]);
  };

  const openReadOnlyExtrasViewer = (product) => {
    setSelectedExtrasProduct(product);
    setSelectedExtrasVariantId(null);
    setSelectedExtrasCompositeDraft(null);
    setSelectedExtrasInitialValue([]);
    setSelectedExtrasReadOnly(true);
    setSelectedExtrasSubmitKind(null);
    setSelectedExtrasVariantObj(null);
    setSelectedExtrasSelectionScope("all");
    setPendingCompositeComponents([]);
    setPendingCompositeDetails([]);
    setExtrasModalOpen(true);
  };

  const openVariantsViewer = (product) => {
    setSelectedVariantsProduct(product);
    setVariantsModalOpen(true);
  };

  const closeVariantsViewer = () => {
    setVariantsModalOpen(false);
    setSelectedVariantsProduct(null);
  };

  const openProductSelectionFlow = (product) => {
    if (hasContextualModifiers(product, { selectionScope: "product_only" })) {
      setSelectedExtrasProduct(product);
      setSelectedExtrasVariantId(null);
      setSelectedExtrasCompositeDraft(null);
      setSelectedExtrasInitialValue([]);
      setSelectedExtrasReadOnly(false);
      setSelectedExtrasSubmitKind("product");
      setSelectedExtrasVariantObj(null);
      setSelectedExtrasSelectionScope("product_only");
      setPendingCompositeComponents([]);
      setPendingCompositeDetails([]);
      setExtrasModalOpen(true);
      return;
    }

    cartOrder.addToCartFromProduct(product);
    setCartDrawerOpen(true);
  };

  const openVariantSelectionFlow = (product, variant) => {
    if (
      hasContextualModifiers(product, {
        variantId: Number(variant?.id || 0),
        selectionScope: "variant_only",
      })
    ) {
      setSelectedExtrasProduct(product);
      setSelectedExtrasVariantId(Number(variant?.id || 0));
      setSelectedExtrasCompositeDraft(null);
      setSelectedExtrasInitialValue([]);
      setSelectedExtrasReadOnly(false);
      setSelectedExtrasSubmitKind("variant");
      setSelectedExtrasVariantObj(variant);
      setSelectedExtrasSelectionScope("variant_only");
      setPendingCompositeComponents([]);
      setPendingCompositeDetails([]);
      setExtrasModalOpen(true);
      return;
    }

    cartOrder.addToCartFromVariant(product, variant);
    setCartDrawerOpen(true);
  };

  const openCompositeConfigurator = (product) => {
    composite.resetDraftForProduct(product);
    setSelectedCompositeProduct(product);
    setCompositeModalOpen(true);
  };

  const confirmCompositeSelection = () => {
    if (!selectedCompositeProduct) return;

    const draft = composite.getOrInitCompositeDraft(selectedCompositeProduct);
    const components =
      composite.buildSubmitComponentsFromProduct(selectedCompositeProduct) || [];
    const details =
      composite.buildDetailsFromProduct(selectedCompositeProduct) || [];

    if (
      hasContextualModifiers(selectedCompositeProduct, {
        compositeDraft: draft,
        selectionScope: "composite_only",
      })
    ) {
      setSelectedExtrasProduct(selectedCompositeProduct);
      setSelectedExtrasVariantId(null);
      setSelectedExtrasCompositeDraft(draft);
      setSelectedExtrasInitialValue([]);
      setSelectedExtrasReadOnly(false);
      setSelectedExtrasSubmitKind("composite");
      setSelectedExtrasVariantObj(null);
      setSelectedExtrasSelectionScope("composite_only");
      setPendingCompositeComponents(components);
      setPendingCompositeDetails(details);
      setCompositeModalOpen(false);
      setSelectedCompositeProduct(null);
      setExtrasModalOpen(true);
      return;
    }

    cartOrder.addToCartFromProduct(selectedCompositeProduct, components, details);
    setCompositeModalOpen(false);
    setSelectedCompositeProduct(null);
    setCartDrawerOpen(true);
  };

  const handleConfirmExtras = (result) => {
    if (!selectedExtrasProduct) {
      resetExtrasFlow();
      return;
    }

    const parentModifiers = result?.parentModifiers || [];
    const parentDisplayGroups = result?.parentDisplayGroups || [];
    const componentModifiers = result?.componentModifiers || [];
    const componentDisplayGroups = result?.componentDisplayGroups || [];

    if (selectedExtrasSubmitKind === "variant" && selectedExtrasVariantObj) {
      cartOrder.addToCartFromVariant(
        selectedExtrasProduct,
        selectedExtrasVariantObj,
        [],
        [],
        parentModifiers,
        parentDisplayGroups,
      );
      resetExtrasFlow();
      setCartDrawerOpen(true);
      return;
    }

    if (selectedExtrasSubmitKind === "composite") {
      const nextComponents = applyComponentModifierPayloadToComponents(
        pendingCompositeComponents,
        componentModifiers,
      );

      const nextDetails = applyComponentDisplayGroupsToDetails(
        pendingCompositeDetails,
        componentDisplayGroups,
      );

      cartOrder.addToCartFromProduct(
        selectedExtrasProduct,
        nextComponents,
        nextDetails,
        parentModifiers,
        parentDisplayGroups,
      );
      resetExtrasFlow();
      setCartDrawerOpen(true);
      return;
    }

    cartOrder.addToCartFromProduct(
      selectedExtrasProduct,
      [],
      [],
      parentModifiers,
      parentDisplayGroups,
    );
    resetExtrasFlow();
    setCartDrawerOpen(true);
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
        paddingBottom: 96,
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
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                Escribe el nombre del cliente. Si la comanda requiere selección de almacén,
                aparecerá el siguiente paso automáticamente.
              </div>
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
            <strong>
              {cartOrder.cartTotal?.toLocaleString?.("es-MX", {
                style: "currency",
                currency: "MXN",
              })}
            </strong>
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

      <WaiterWarehouseCreateDialog
        open={cartOrder.warehouseDialogOpen}
        loading={cartOrder.sending}
        customerName={cartOrder.customerName}
        selection={cartOrder.warehouseSelectionContext}
        onClose={cartOrder.closeWarehouseDialog}
        onConfirm={cartOrder.confirmWarehouseSelection}
      />

      <CompositeProductModal
        open={compositeModalOpen}
        product={selectedCompositeProduct}
        draft={
          selectedCompositeProduct
            ? composite.getOrInitCompositeDraft(selectedCompositeProduct)
            : []
        }
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

      <ProductExtrasModal
        open={extrasModalOpen}
        product={selectedExtrasProduct}
        variantId={selectedExtrasVariantId}
        compositeDraft={selectedExtrasCompositeDraft}
        initialValue={selectedExtrasInitialValue}
        readOnly={selectedExtrasReadOnly}
        onClose={resetExtrasFlow}
        onConfirm={handleConfirmExtras}
        confirmLabel={selectedExtrasReadOnly ? "Listo" : "Guardar extras"}
        selectionScope={selectedExtrasSelectionScope}
      />

      <ProductVariantsModal
        open={variantsModalOpen}
        product={selectedVariantsProduct}
        canSelect={canSelect}
        showSelectBtn={true}
        onClose={closeVariantsViewer}
        onAddVariant={openVariantSelectionFlow}
      />

      <MenuCartDrawer
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        title="Comanda"
        subtitle={
          canAppend
            ? "Orden abierta: puedes agregar productos."
            : "Revisa los productos seleccionados antes de crear la comanda."
        }
        itemCount={cartDrawerItemCount}
        total={cartOrder.totalGlobal}
        disabledClose={cartOrder.sending}
      >
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
          statusBadges={[
            { tone: "dark", label: "🧑‍🍳 Staff" },
            ...(canAppend
              ? [{ tone: "ok", label: "Orden abierta", title: "Orden abierta: puedes agregar productos" }]
              : []),
            ...(hasOld
              ? [{ tone: "default", label: `Historial: ${cartOrder.oldItems.length}`, title: "Items ya enviados" }]
              : []),
            { tone: cartOrder.cart.length > 0 ? "ok" : "warn", label: `Nuevos: ${cartOrder.cart.length}` },
          ]}
        />
      </MenuCartDrawer>

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
          { tone: "dark", label: "⚡ Tiempo real", title: "Este flujo se sincroniza por WebSocket" },
          ...(canAppend ? [{ tone: "ok", label: "Orden abierta", title: "Orden abierta: puedes agregar productos" }] : []),
          ...(hasOld
            ? [{ tone: "default", label: `Historial: ${cartOrder.oldItems.length}`, title: "Items ya enviados" }]
            : []),
          { tone: cartOrder.cart.length > 0 ? "ok" : "warn", label: `Nuevos: ${cartOrder.cart.length}`, title: "Items nuevos" },
        ]}
        rightActions={
          <>
            <PillButton onClick={() => setCartDrawerOpen(true)} title="Abrir comanda">
              🧾 Comanda
            </PillButton>

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
        q={q}
        onSearchChange={setQ}
        totalVisible={filteredProducts.length}
      />

      <PublicMenuCategoryTabs
        categoryOptions={categoryOptions}
        value={categoryFilter}
        onChange={setCategoryFilter}
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
          `}
        </style>

        <div className="menuGrid">
          {filteredProducts.length > 0 ? (
            paginatedProducts.map((p) => (
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
                onAddSimple={openProductSelectionFlow}
                onAddVariant={openVariantSelectionFlow}
                onOpenComposite={openCompositeConfigurator}
                onOpenExtras={openReadOnlyExtrasViewer}
                onOpenVariants={openVariantsViewer}
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

        {filteredProducts.length > 0 ? (
          <div style={{ marginTop: 14 }}>
            <PaginationFooter
              page={page}
              totalPages={totalPages}
              startItem={startItem}
              endItem={endItem}
              total={total}
              hasPrev={hasPrev}
              hasNext={hasNext}
              onPrev={prevPage}
              onNext={nextPage}
              itemLabel="productos"
            />
          </div>
        ) : null}
      </div>

      <MenuCartFloatingButton
        itemCount={cartDrawerItemCount}
        total={cartOrder.totalGlobal}
        disabled={false}
        onClick={() => setCartDrawerOpen(true)}
        label={hasCartContent ? "Ver comanda" : "Comanda"}
        title="Abrir comanda"
      />
    </div>
  );
}