import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import echo from "../../../realtime/echo";

import {
  fetchPreparedItems,
  fetchStaffWaiterMenu,
} from "../../../services/staff/waiter/staffOrders.service";

import { Badge, Modal, PillButton, SkeletonCard } from "../../public/publicMenu.ui";
import usePagination from "../../../hooks/usePagination";
import PaginationFooter from "../../../components/common/PaginationFooter";

import { useMenuProducts } from "../../../hooks/public/useMenuProducts";
import useMenuSectionSelection from "../../../hooks/menu/useMenuSectionSelection";
import useMenuAvailabilityRealtime from "../../../hooks/menu/useMenuAvailabilityRealtime";
import { usePreparedItemsCollection } from "../../../hooks/menu/usePreparedItemsCollection";
import { useCompositeDrafts } from "../../../hooks/public/useCompositeDrafts";
import { useStaffCartAndOrder } from "../../../hooks/staff/useStaffCartAndOrder";
import {
  buildModifierContextSections,
  money,
} from "../../../hooks/public/publicMenu.utils";

import MenuHeaderCard from "../../../components/menu/staff/MenuHeaderCard";
import WaiterWarehouseCreateDialog from "../../../components/menu/staff/WaiterWarehouseCreateDialog";
import WaiterCancellationDialog from "../../../components/menu/staff/WaiterCancellationDialog";

import MenuProductCard from "../../../components/menu/shared/MenuProductCard";
import PreparedItemsSection from "../../../components/menu/shared/prepared-items/PreparedItemsSection";
import OrderCancellationSelection, {
  getOrderCancellationSelectableItems,
} from "../../../components/menu/shared/cancellation/OrderCancellationSelection";
import ProductVariantsModal from "../../../components/menu/shared/ProductVariantsModal";
import CompositeProductModal from "../../../components/menu/shared/CompositeProductModal";
import ProductExtrasModal from "../../../components/menu/shared/ProductExtrasModal";
import MenuCartPanel from "../../../components/menu/shared/MenuCartPanel";
import MenuCartDrawer from "../../../components/menu/shared/MenuCartDrawer";
import MenuCartFloatingButton from "../../../components/menu/shared/MenuCartFloatingButton";
import MenuSectionTabs from "../../../components/menu/shared/menuUi/MenuSectionTabs";
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

  const orderIdFromState =
  Number(location.state?.existingOrderId || 0) || null;

  const orderIdFromQuery =
    Number(sp.get("order_id") || 0) || null;

  const effectiveOrderId =
    orderIdFromQuery ||
    orderIdFromState ||
    null;

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [q, setQ] = useState("");

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [waiterCancellationDialogOpen, setWaiterCancellationDialogOpen] = useState(false);

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

  const cartOrder = useStaffCartAndOrder({
    tableId: Number(tableId),
  });

  const composite = useCompositeDrafts();

  const activeOrderId =
    Number(cartOrder?.activeOrder?.id || 0) || null;

  const menuContextOrderId =
    Number(
      effectiveOrderId ||
        activeOrderId ||
        0,
    ) || null;

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

  const {
    selectedSectionId,
    selectedSection,
    selectSection,
    showSectionSelector,
  } = useMenuSectionSelection(sections);

  useEffect(() => {
    setCategoryFilter("all");
  }, [selectedSectionId]);

  const {
    categoryNameById,
    categoryOptions,
    filteredProducts,
  } = useMenuProducts({
    sections,
    selectedSectionId,
    categoryFilter,
    q,
  });


  /*
  * Si una recarga del backend elimina la categoría seleccionada,
  * volvemos a "Todos" dentro de la sección actual.
  */
  useEffect(() => {
    if (categoryFilter === "all") {
      return;
    }

    const categoryStillExists = categoryOptions.some(
      (option) =>
        String(option?.value) ===
        String(categoryFilter),
    );

    if (!categoryStillExists) {
      setCategoryFilter("all");
    }
  }, [categoryFilter, categoryOptions]);


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

  const load = async ({
    silent = false,
    orderIdOverride = null,
  } = {}) => {
    if (!silent) {
      setLoading(true);
      setErrorMsg("");
    }

    try {
      /*
      * El override se utiliza cuando un evento WebSocket ya informa
      * el ID de una orden recién creada o actualizada.
      */
      const requestedOrderId =
        Number(
          orderIdOverride ||
            menuContextOrderId ||
            0,
        ) || null;

      const requestedTableId =
        Number(tableId || 0) || null;

      const menuContext = requestedOrderId
        ? {
            orderId: requestedOrderId,
          }
        : {
            tableId: requestedTableId,
          };

      const res =
        await fetchStaffWaiterMenu(menuContext);

      const payload = res?.data || res?.payload || res || null;

      setData(payload);
      return payload;
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "No se pudo cargar el menú del mesero.";

      if (!silent) {
        setErrorMsg(String(msg));
        setData(null);
      }

      return null;
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };


  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId, effectiveOrderId]);

  const onceRef = useRef(false);

  useEffect(() => {
    if (onceRef.current) return;
    if (!effectiveOrderId) return;

    onceRef.current = true;
    cartOrder.loadExisting({ orderId: effectiveOrderId, force: true }).catch(() => {});
  }, [effectiveOrderId, cartOrder]);


  useEffect(() => {
    if (!activeOrderId) {
      return;
    }

    if (Number(orderIdFromQuery || 0) === activeOrderId) {
      return;
    }

    const nextSearchParams =
      new URLSearchParams(location.search);

    nextSearchParams.set(
      "order_id",
      String(activeOrderId),
    );

    navigate(
      {
        pathname: location.pathname,
        search: `?${nextSearchParams.toString()}`,
      },
      {
        replace: true,
        state: {
          ...(location.state || {}),
          existingOrderId: activeOrderId,
        },
      },
    );
  }, [
    activeOrderId,
    orderIdFromQuery,
    location.pathname,
    location.search,
    location.state,
    navigate,
  ]);

  const branchId = Number(data?.branch?.id || data?.branch_id || 0);
  const currentMenuId = Number(
    data?.menu?.id ||
      data?.data?.menu?.id ||
      data?.menu_context?.menu_id ||
      data?.menu_id ||
      0,
  );

  const quickPreparation =
    data?.quick_preparation ||
    data?.data?.quick_preparation ||
    null;

  const initialPreparedItems = Array.isArray(quickPreparation?.items)
    ? quickPreparation.items
    : null;

  const preparedContextOrderId = Number(menuContextOrderId || 0) || null;
  const preparedContextTableId = preparedContextOrderId ? null : Number(tableId || 0) || null;

  const preparedItemsCollection = usePreparedItemsCollection({
    initialItems: initialPreparedItems,
    enabled: currentMenuId > 0 && Boolean(preparedContextOrderId || preparedContextTableId),
    contextKey: preparedContextOrderId
      ? `waiter:order:${preparedContextOrderId}:menu:${currentMenuId}`
      : `waiter:table:${preparedContextTableId}:menu:${currentMenuId}`,
    loader: async () => {
      const response = await fetchPreparedItems(
        preparedContextOrderId
          ? { orderId: preparedContextOrderId }
          : { tableId: preparedContextTableId },
      );

      const responseData =
        response?.data && typeof response.data === "object"
          ? response.data
          : null;

      const returnedMenuId = Number(responseData?.menu_id || 0);

      if (!returnedMenuId) {
        throw new Error("Preparación rápida no devolvió el menu_id resuelto.");
      }

      if (returnedMenuId !== currentMenuId) {
        throw new Error(
          `El menú de Preparación rápida (${returnedMenuId}) no coincide con el menú activo (${currentMenuId}).`,
        );
      }

      return response;
    },
  });

  const refreshPreparedItems = useCallback(async () => {
    const nextItems = await preparedItemsCollection.refetch();
    cartOrder.reconcilePreparedItems?.(nextItems);

    return nextItems;
  }, [
    preparedItemsCollection.refetch,
    cartOrder.reconcilePreparedItems,
  ]);

  useEffect(() => {
    if (!currentMenuId || preparedItemsCollection.loading) return;

    cartOrder.reconcilePreparedItems?.(
      preparedItemsCollection.items,
    );
  }, [
    currentMenuId,
    preparedItemsCollection.items,
    preparedItemsCollection.loading,
    cartOrder.reconcilePreparedItems,
  ]);

  useEffect(() => {
    if (!branchId || !tableId) return;

    const currentTableId = Number(tableId);
    const channelName = `branch.${branchId}.tables`;
    const channel = echo.private(channelName);

    const onTableUpdated = async (event) => {
      const eventTableId =
        Number(event?.table_id || 0);

      if (
        !eventTableId ||
        eventTableId !== currentTableId
      ) {
        return;
      }

      if (realtimeBusyRef.current) {
        return;
      }

      realtimeBusyRef.current = true;

      try {
        const incomingOrderId =
          Number(event?.order_id || 0);

        const currentActiveOrderId =
          Number(cartOrder?.activeOrder?.id || 0);

        const targetOrderId =
          incomingOrderId ||
          currentActiveOrderId ||
          Number(effectiveOrderId || 0);

        /*
        * Si el evento ya contiene order_id, el menú se recarga
        * directamente con ese contexto.
        *
        * Así no se consulta table_id cuando la mesa ya tiene orden.
        */
        await load({
          silent: true,
          orderIdOverride:
            targetOrderId || null,
        }).catch(() => {});

        if (targetOrderId) {
          await cartOrder
            .loadExisting({
              orderId: targetOrderId,
              force: true,
            })
            .catch(() => {});
        } else {
          await cartOrder
            .loadExisting({
              force: true,
            })
            .catch(() => {});
        }

        await refreshPreparedItems().catch(() => {});
      } finally {
        realtimeBusyRef.current = false;
      }
    };


    channel.listen(".table.grid.updated", onTableUpdated);

    return () => {
      echo.leave(channelName);
    };
  }, [
    branchId,
    tableId,
    cartOrder,
    effectiveOrderId,
    refreshPreparedItems,
  ]);

  useMenuAvailabilityRealtime({
    echo,
    data,
    enabled: Boolean(
      data?.realtime?.channel_type &&
        data?.realtime?.channel &&
        data?.realtime?.event,
    ),
    onAvailabilityEvent: async (event) => {
      const affectedMenuIds = (Array.isArray(event?.affected_menu_ids)
        ? event.affected_menu_ids
        : []
      )
        .map((menuId) => Number(menuId || 0))
        .filter((menuId) => menuId > 0);

      if (
        currentMenuId > 0 &&
        affectedMenuIds.length > 0 &&
        !affectedMenuIds.includes(currentMenuId)
      ) {
        return;
      }

      const targetOrderId =
        Number(
          cartOrder?.activeOrder?.id ||
            menuContextOrderId ||
            0,
        ) || null;

      const refreshedPayload = await load({
        silent: true,
        orderIdOverride: targetOrderId,
      });

      if (!refreshedPayload) return;

      cartOrder.reconcileCartAvailability?.(refreshedPayload);
      await refreshPreparedItems().catch(() => {});
    },
  });

  const canSelect = true;
  const canAppend = cartOrder.canAppend;

  const cancellationSelectableItems = getOrderCancellationSelectableItems(
    cartOrder.oldItems,
  );

  const canStartCancellation =
    canAppend &&
    cancellationSelectableItems.length > 0;

  const hasInvalidItems = Boolean(cartOrder.hasInvalidCartItems);
  const invalidItemsCount = Math.max(
    0,
    Number(cartOrder.invalidCartItemsCount || 0),
  );
  const submitBlockReason = "Hay productos que ya no están disponibles. Quítalos para continuar.";

  const hasOld = Array.isArray(cartOrder.oldItems) && cartOrder.oldItems.length > 0;

  const cartDrawerItemCount = Number(cartOrder.cart?.length || 0) + Number(cartOrder.oldItems?.length || 0);

  const hasCartContent =
    (Array.isArray(cartOrder.cart) && cartOrder.cart.length > 0) ||
    (Array.isArray(cartOrder.oldItems) && cartOrder.oldItems.length > 0);

  const handleStartCancellation = async () => {
    if (!canStartCancellation) return;

    setWaiterCancellationDialogOpen(false);

    const result = await cartOrder.startCancellation();
    if (!result?.ok) return;

    setCartDrawerOpen(true);
  };

  const handleExitCancellation = () => {
    if (cartOrder.cancellationSubmitting) return;

    setWaiterCancellationDialogOpen(false);
    cartOrder.exitCancellation();
  };

  const handleCancellationContinue = () => {
    if (!cartOrder.cancellationSummary?.can_continue) return;
    setWaiterCancellationDialogOpen(true);
  };

  const handleCancellationSubmit = async (resolution) => {
    const result = await cartOrder.submitCancellation(resolution);
    if (!result?.ok) return result;

    setWaiterCancellationDialogOpen(false);

    /*
    * Una cancelación puede regresar una unidad física al pool
    * de Preparación rápida, por lo que se vuelve a consultar.
    */
    await refreshPreparedItems().catch(() => {});

    return result;
  };

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
              tone={hasInvalidItems ? "danger" : "orange"}
              disabled={
                cartOrder.sending ||
                cartOrder.cart.length === 0 ||
                hasInvalidItems ||
                (!canAppend && !String(cartOrder.customerName || "").trim())
              }
              onClick={cartOrder.submitOrderOrAppend}
              title={
                hasInvalidItems
                  ? submitBlockReason
                  : canAppend
                    ? "Agregar items a la orden abierta"
                    : "Crear orden con nombre"
              }
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

          {hasInvalidItems ? (
            <div
              role="alert"
              style={{
                border: "1px solid rgba(211,47,47,0.24)",
                borderRadius: 12,
                padding: "10px 12px",
                background: "rgba(211,47,47,0.07)",
                color: "#B42318",
                fontSize: 12,
                fontWeight: 800,
                lineHeight: 1.45,
              }}
            >
              <div style={{ fontWeight: 950 }}>
                {invalidItemsCount === 1
                  ? "Hay 1 producto no disponible."
                  : `Hay ${invalidItemsCount} productos no disponibles.`}
              </div>
              <div style={{ marginTop: 3 }}>{submitBlockReason}</div>
            </div>
          ) : null}

          <div
            style={{
              display: "grid",
              gap: 8,
              border: "1px solid rgba(0,0,0,0.10)",
              borderRadius: 14,
              padding: 12,
              background: "#FFFFFF",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              <span>Productos</span>

              <strong>{cartOrder.cart.length}</strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              <span>Subtotal de referencia</span>

              <strong>
                {money(
                  cartOrder.newItemsPricingSummary?.grossSubtotalReference ??
                    cartOrder.cartTotal ??
                    0,
                )}
              </strong>
            </div>

            {Number(
              cartOrder.newItemsPricingSummary?.promotionDiscountPreview || 0,
            ) > 0 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  color: "#0F766E",
                  fontSize: 12,
                  fontWeight: 850,
                }}
              >
                <span>Promoción visual disponible</span>

                <strong>
                  −
                  {money(
                    cartOrder.newItemsPricingSummary?.promotionDiscountPreview,
                  )}
                </strong>
              </div>
            ) : null}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                paddingTop: 8,
                borderTop: "1px solid rgba(0,0,0,0.08)",
                color: "#B45309",
                fontSize: 13,
                fontWeight: 950,
              }}
            >
              <span>Total aprox.</span>

              <strong>
                {money(
                  cartOrder.newItemsPricingSummary?.totalApproximate ??
                    cartOrder.cartTotal ??
                    0,
                )}
              </strong>
            </div>

            {cartOrder.newItemsPricingSummary
              ?.hasUnresolvedQuantityPromotions ? (
              <div
                style={{
                  border: "1px solid rgba(109,40,217,0.18)",
                  borderRadius: 12,
                  padding: "9px 10px",
                  background: "rgba(109,40,217,0.07)",
                  color: "#5B21B6",
                  fontSize: 11,
                  fontWeight: 850,
                  lineHeight: 1.4,
                }}
              >
                Incluye una promoción por cantidad. El descuento exacto se
                confirmará al guardar los productos.
              </div>
            ) : null}
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
        onConfirm={(warehouseId) => {
          if (hasInvalidItems) {
            cartOrder.setSendToast(submitBlockReason);
            return;
          }

          return cartOrder.confirmWarehouseSelection(warehouseId);
        }}
      />

      <WaiterCancellationDialog
        open={
          waiterCancellationDialogOpen &&
          cartOrder.cancellationActive
        }
        type={cartOrder.cancellationSummary?.type}
        selectedItems={cartOrder.selectedCancellationItems}
        context={cartOrder.cancellationContext}
        requiresAuthorization={cartOrder.cancellationRequiresAuthorization}
        loading={cartOrder.cancellationSubmitting}
        error={cartOrder.cancellationError}
        onClose={() => {
          if (!cartOrder.cancellationSubmitting) {
            setWaiterCancellationDialogOpen(false);
          }
        }}
        onConfirm={handleCancellationSubmit}
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
        onClose={() => {
          if (!cartOrder.cancellationSubmitting) setCartDrawerOpen(false);
        }}
        title={cartOrder.cancellationActive ? "Cancelar productos" : "Comanda"}
        subtitle={
          cartOrder.cancellationActive
            ? "Selecciona las partidas persistidas que deseas cancelar."
            : canAppend
              ? "Orden abierta: puedes agregar productos."
              : "Revisa los productos seleccionados antes de crear la comanda."
        }
        itemCount={cartDrawerItemCount}
        total={cartOrder.displayTotal}
        totalLabel={cartOrder.totalLabel}
        isEstimated={cartOrder.isEstimated}
        pricingSummary={cartOrder.pricingSummary}
        disabledClose={cartOrder.sending || cartOrder.cancellationSubmitting}
      >
        {cartOrder.cancellationActive ? (
          <div style={{ display: "grid", gap: 10 }}>
            {cartOrder.cancellationError ? (
              <div
                role="alert"
                style={{
                  border: "1px solid rgba(211,47,47,0.24)",
                  borderRadius: 12,
                  padding: "10px 12px",
                  background: "rgba(211,47,47,0.07)",
                  color: "#B42318",
                  fontSize: 12,
                  fontWeight: 850,
                  lineHeight: 1.45,
                }}
              >
                {cartOrder.cancellationError}
              </div>
            ) : null}

            <OrderCancellationSelection
              items={cartOrder.cancellationContext?.items || []}
              selection={cartOrder.cancellationSelection}
              disabled={
                cartOrder.cancellationLoading ||
                cartOrder.cancellationSubmitting
              }
              onExit={handleExitCancellation}
              onToggleItem={cartOrder.toggleCancellationItem}
              onQuantityChange={cartOrder.setCancellationQuantity}
              onContinue={handleCancellationContinue}
            />
          </div>
        ) : (
          <MenuCartPanel
            title="Comanda"
            subtitle={
              canAppend
                ? "Orden abierta: puedes agregar productos."
                : "Selecciona productos y luego crea la comanda."
            }
            customerName={canAppend ? cartOrder.activeOrder?.customer_name || "" : ""}
            total={cartOrder.displayTotal}
            pricingSummary={cartOrder.pricingSummary}
            oldItems={cartOrder.oldItems}
            newItems={cartOrder.cart}
            sendToast={cartOrder.cancellationError || cartOrder.sendToast}
            sending={cartOrder.sending}
            canAppend={canAppend}
            canSubmit={cartOrder.cart.length > 0 && !hasInvalidItems}
            hasInvalidItems={hasInvalidItems}
            invalidItemsCount={invalidItemsCount}
            submitBlockReason={submitBlockReason}
            extraTopActions={
              canStartCancellation ? (
                <div className="cm-cancellation-action">
                  <PillButton
                    tone="terracotta"
                    disabled={
                      cartOrder.cancellationLoading ||
                      cartOrder.cancellationSubmitting
                    }
                    onClick={handleStartCancellation}
                    title="Cancelar productos ya enviados"
                  >
                    {cartOrder.cancellationLoading
                      ? "⏳ Cargando..."
                      : "Cancelar productos"}
                  </PillButton>
                </div>
              ) : null
            }
            onEmpty={() => cartOrder.setCart([])}
            onSubmit={() => {
              if (hasInvalidItems) {
                cartOrder.setSendToast(submitBlockReason);
                return;
              }

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
        )}
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
          {
            tone: "dark",
            label: "⚡ Tiempo real",
            title: "Este flujo se sincroniza por WebSocket",
          },
          ...(canAppend
            ? [
                {
                  tone: "ok",
                  label: "Orden abierta",
                  title: "Orden abierta: puedes agregar productos",
                },
              ]
            : []),
          ...(hasOld
            ? [
                {
                  tone: "default",
                  label: `Historial: ${cartOrder.oldItems.length}`,
                  title: "Items ya enviados",
                },
              ]
            : []),
          {
            tone: cartOrder.cart.length > 0 ? "ok" : "warn",
            label: `Nuevos: ${cartOrder.cart.length}`,
            title: "Items nuevos",
          },
        ]}
        rightActions={
          <>
            <PillButton
              onClick={() => setCartDrawerOpen(true)}
              title="Abrir comanda"
            >
              🧾 Comanda
            </PillButton>

            <PillButton
              onClick={() => load()}
              title="Recargar menú"
            >
              🔄 Recargar
            </PillButton>

            <PillButton
              tone="default"
              onClick={() =>
                navigate("/staff/waiter/tables/grid")
              }
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

      {showSectionSelector ? (
        <MenuSectionTabs
          sections={sections}
          selectedSectionId={selectedSectionId}
          onSectionChange={selectSection}
        />
      ) : null}

      {selectedSection ? (
        <>
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

                @media (min-width: 640px) {
                  .menuGrid {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                  }
                }

                @media (min-width: 900px) {
                  .menuGrid {
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                  }
                }

                @media (min-width: 1200px) {
                  .menuGrid {
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                  }
                }
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
                      categoryNameById.get(
                        Number(p.category_id),
                      ) ||
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
                  <div style={{ fontWeight: 950 }}>
                    Sin resultados
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      opacity: 0.8,
                      marginTop: 6,
                    }}
                  >
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
        </>
            ) : (
        <div
          style={{
            marginTop: 14,
            border: "1px solid rgba(0,0,0,0.12)",
            background: "#fff",
            borderRadius: 16,
            padding: 18,
          }}
        >
          <div style={{ fontWeight: 950 }}>
            Menú sin secciones disponibles
          </div>

          <div
            style={{
              fontSize: 13,
              opacity: 0.8,
              marginTop: 6,
            }}
          >
            El backend no devolvió secciones disponibles para este menú.
          </div>
        </div>
      )}

      {cartOrder.preparedCartMessage ? (
        <div
          role="alert"
          style={{
            marginTop: 14,
            border: "1px solid rgba(245,158,11,0.24)",
            borderRadius: 12,
            padding: "10px 12px",
            background: "#fff7ed",
            color: "#B45309",
            fontSize: 12,
            fontWeight: 850,
            lineHeight: 1.45,
          }}
        >
          {cartOrder.preparedCartMessage}
        </div>
      ) : null}

      <PreparedItemsSection
        items={preparedItemsCollection.items}
        loading={preparedItemsCollection.loading}
        selectedPreparedItemIds={cartOrder.selectedPreparedItemIds}
        onSelect={(preparedItem) => {
          const result = cartOrder.addPreparedItem(preparedItem);

          if (result?.ok) {
            setCartDrawerOpen(true);
          }
        }}
      />

      <MenuCartFloatingButton
        itemCount={cartDrawerItemCount}
        total={cartOrder.displayTotal}
        totalLabel={cartOrder.totalLabel}
        isEstimated={cartOrder.isEstimated}
        disabled={false}
        onClick={() => setCartDrawerOpen(true)}
        label={hasCartContent ? "Ver comanda" : "Comanda"}
        title="Abrir comanda"
      />
    </div>
  );
}