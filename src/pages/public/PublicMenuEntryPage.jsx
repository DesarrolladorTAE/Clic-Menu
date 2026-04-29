// src/pages/public/PublicMenuEntryPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import echo from "../../realtime/echo";

import {
  callWaiterByTable,
  requestPublicOrderBill,
} from "../../services/public/publicMenu.service";

import {
  fmtMMSS,
  translateOrderingMode,
  translateStatus,
  translateTableServiceMode,
} from "../../hooks/public/publicMenu.utils";

import { Badge, PillButton } from "./publicMenu.ui";

import usePagination from "../../hooks/usePagination";

import { usePublicMenuLoader } from "../../hooks/public/usePublicMenuLoader";
import { useActiveMenuPayload } from "../../hooks/public/useActiveMenuPayload";
import { useTableQrSession } from "../../hooks/public/useTableQrSession";
import { useMenuProducts } from "../../hooks/public/useMenuProducts";
import { useCartAndOrder } from "../../hooks/public/useCartAndOrder";
import { useCompositeDrafts } from "../../hooks/public/useCompositeDrafts";

import MenuCartFloatingButton from "../../components/menu/shared/MenuCartFloatingButton";
import PublicMenuCategoryTabs from "../../components/menu/shared/menuUi/PublicMenuCategoryTabs";

import PublicMenuBrandCard from "../../components/menu/public/PublicMenuBrandCard";
import PublicMenuGalleryCarousel from "../../components/menu/public/PublicMenuGalleryCarousel";
import PublicMenuFooter from "../../components/menu/public/PublicMenuFooter";
import PublicMenuIdentityCard from "../../components/menu/public/PublicMenuIdentityCard";
import PublicMenuOrderActionsCard from "../../components/menu/public/PublicMenuOrderActionsCard";

import PublicMenuLoadingState from "./public-menu-entry/PublicMenuLoadingState";
import PublicMenuErrorState from "./public-menu-entry/PublicMenuErrorState";
import PublicMenuEmptyState from "./public-menu-entry/PublicMenuEmptyState";
import PublicMenuOverlays from "./public-menu-entry/PublicMenuOverlays";
import PublicMenuModals from "./public-menu-entry/PublicMenuModals";
import PublicMenuCartDrawerBlock from "./public-menu-entry/PublicMenuCartDrawerBlock";
import PublicMenuWebChannelSelector from "./public-menu-entry/PublicMenuWebChannelSelector";
import PublicMenuCallToast from "./public-menu-entry/PublicMenuCallToast";
import PublicMenuWarningBlock from "./public-menu-entry/PublicMenuWarningBlock";
import PublicMenuProductsGrid from "./public-menu-entry/PublicMenuProductsGrid";

import {
  sleep,
  applyComponentModifierPayloadToComponents,
  applyComponentDisplayGroupsToDetails,
  hasContextualModifiers,
  isValidHexColor,
} from "./public-menu-entry/publicMenuEntry.helpers";

export default function PublicMenuEntryPage() {
  const { token } = useParams();

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [q, setQ] = useState("");

  const [compositeModalOpen, setCompositeModalOpen] = useState(false);
  const [selectedCompositeProduct, setSelectedCompositeProduct] =
    useState(null);

  const [variantsModalOpen, setVariantsModalOpen] = useState(false);
  const [selectedVariantsProduct, setSelectedVariantsProduct] = useState(null);

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const [extrasModalOpen, setExtrasModalOpen] = useState(false);
  const [selectedExtrasProduct, setSelectedExtrasProduct] = useState(null);
  const [selectedExtrasVariantId, setSelectedExtrasVariantId] = useState(null);
  const [selectedExtrasCompositeDraft, setSelectedExtrasCompositeDraft] =
    useState(null);
  const [selectedExtrasInitialValue, setSelectedExtrasInitialValue] = useState(
    [],
  );
  const [selectedExtrasReadOnly, setSelectedExtrasReadOnly] = useState(false);
  const [selectedExtrasSubmitKind, setSelectedExtrasSubmitKind] =
    useState(null);
  const [selectedExtrasVariantObj, setSelectedExtrasVariantObj] =
    useState(null);
  const [selectedExtrasSelectionScope, setSelectedExtrasSelectionScope] =
    useState("all");
  const [pendingCompositeComponents, setPendingCompositeComponents] = useState(
    [],
  );
  const [pendingCompositeDetails, setPendingCompositeDetails] = useState([]);

  const {
    loading,
    errorMsg,
    data,
    load,
    webChannelId,
    setWebChannelId,
    callLocked,
    setCallLocked,
    setLoading,
  } = usePublicMenuLoader({ token });

  const composite = useCompositeDrafts();

  const {
    isWeb,
    webChannels,
    activeWebChannelId,
    activeMenuPayload,
    header,
    ui,
    hasTable,
    tableId,
    badgeUi,
    sections,
  } = useActiveMenuPayload({
    data,
    webChannelId,
    setWebChannelId,
    resetOnChannelChange: () => {
      setCategoryFilter("all");
      setQ("");
      composite.resetCompositeDrafts?.();

      setCompositeModalOpen(false);
      setSelectedCompositeProduct(null);

      setVariantsModalOpen(false);
      setSelectedVariantsProduct(null);

      setCartDrawerOpen(false);

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
    },
    setCallLocked,
  });

  const qr = useTableQrSession({ activeMenuPayload, hasTable, tableId });

  const uiFlags = ui || {};
  const canSelect = !!ui?.can_select_products && ui?.ui_mode === "selectable";
  const showSelectBtn = !!ui?.show_select_button && canSelect;
  const showCallBtn =
    !!ui?.show_call_waiter_button && !!ui?.call_waiter_enabled && hasTable;

  const orderingMode = String(header?.orderingMode || "");

  const cartOrder = useCartAndOrder({
    token,
    canSelect,
    hasTable,
    sessionActive: qr.sessionActive,
    orderingMode,
    sessionBusy: qr.sessionBusy,
    sessionUnavailable: qr.sessionUnavailable,
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (mounted) setLoading(true);
        await load();
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (!isWeb) return;
    cartOrder.resetOnChannelChange?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb, activeWebChannelId]);

  const { categoryNameById, categoryOptions, filteredProducts } =
    useMenuProducts({
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

  const [billRequesting, setBillRequesting] = useState(false);
  const [billToast, setBillToast] = useState("");

  const lastLoadedOrderIdRef = useRef(null);

  const sessionRealtimeRunningRef = useRef(false);
  const sessionRealtimeQueuedRef = useRef(false);
  const sessionRealtimeEventRef = useRef(null);

  const orderRealtimeRunningRef = useRef(false);
  const orderRealtimeQueuedRef = useRef(false);
  const orderRealtimeEventRef = useRef(null);

  useEffect(() => {
    const sessionOrderId = Number(qr?.session?.order_id || 0);
    const sessionStatus = String(qr?.session?.status || "");

    if (!sessionOrderId) return;
    if (sessionStatus === "expired") return;

    if (lastLoadedOrderIdRef.current === sessionOrderId) {
      if (Array.isArray(cartOrder.oldItems) && cartOrder.oldItems.length > 0) {
        return;
      }
    }

    lastLoadedOrderIdRef.current = sessionOrderId;

    cartOrder.refreshOrder?.(sessionOrderId).catch(() => {
      lastLoadedOrderIdRef.current = null;
    });
  }, [qr?.session?.order_id, qr?.session?.status, cartOrder]);

  useEffect(() => {
    cartOrder
      .syncOrderStatusFromSession?.(qr.sessionOrderStatus)
      ?.catch?.(() => {});
  }, [qr.sessionOrderStatus, cartOrder.syncOrderStatusFromSession]);

  const publicSessionChannelId = useMemo(() => {
    return Number(
      qr?.session?.session_id ||
        qr?.takeover?.session_id ||
        qr?.sessionBusy?.session_id ||
        0,
    );
  }, [
    qr?.session?.session_id,
    qr?.takeover?.session_id,
    qr?.sessionBusy?.session_id,
  ]);

  const publicOrderChannelId = useMemo(() => {
    return Number(
      cartOrder?.activeOrder?.id ||
        cartOrder?.pendingOrder?.id ||
        qr?.session?.order_id ||
        qr?.takeover?.order_id ||
        0,
    );
  }, [
    cartOrder?.activeOrder?.id,
    cartOrder?.pendingOrder?.id,
    qr?.session?.order_id,
    qr?.takeover?.order_id,
  ]);

  const refreshOrderWithRetry = async (orderId, tries = 3) => {
    for (let i = 0; i < tries; i += 1) {
      const res = await cartOrder.refreshOrder?.(orderId).catch(() => null);
      if (res?.order || res?.items) return res;
      if (i < tries - 1) await sleep(220);
    }
    return null;
  };

  const getBestKnownOrderId = () => {
    return Number(
      cartOrder?.currentOrderId ||
        cartOrder?.activeOrder?.id ||
        cartOrder?.pendingOrder?.id ||
        qr?.session?.order_id ||
        qr?.takeover?.order_id ||
        lastLoadedOrderIdRef.current ||
        0,
    );
  };

  const refreshOrderAndMenuFromAnySource = async (incomingOrderId = 0) => {
    let resolvedOrderId = Number(incomingOrderId || 0);

    const sessionRes = await qr
      .refreshSession?.({ allowScanFallback: true })
      .catch(() => null);

    resolvedOrderId = Number(
      resolvedOrderId ||
        sessionRes?.session?.order_id ||
        qr?.session?.order_id ||
        qr?.takeover?.order_id ||
        cartOrder?.currentOrderId ||
        0,
    );

    if (resolvedOrderId) {
      lastLoadedOrderIdRef.current = resolvedOrderId;
      await refreshOrderWithRetry(resolvedOrderId, 5);
    }

    await load({ silent: true }).catch(() => {});

    return resolvedOrderId;
  };

  useEffect(() => {
    if (!publicSessionChannelId) return;

    const channelName = `public.session.${publicSessionChannelId}`;
    const channel = echo.channel(channelName);

    const processSessionRealtime = async () => {
      if (sessionRealtimeRunningRef.current) {
        sessionRealtimeQueuedRef.current = true;
        return;
      }

      sessionRealtimeRunningRef.current = true;

      try {
        const event = sessionRealtimeEventRef.current || {};
        sessionRealtimeEventRef.current = null;

        const reason = String(event?.reason || "").toLowerCase();

        if (reason === "waiter_call_attended") {
          setCallLocked(true);
        }

        if (
          [
            "waiter_call_rejected",
            "waiter_attention_finished",
            "session_released",
            "session_closed_after_payment",
          ].includes(reason)
        ) {
          setCallLocked(false);
        }

        let incomingOrderId = Number(event?.order_id || 0);

        if (!incomingOrderId) {
          incomingOrderId = getBestKnownOrderId();
        }

        if (incomingOrderId) {
          cartOrder.applyRealtimeOrderReason?.(reason, incomingOrderId);
        }

        const resolvedOrderId =
          await refreshOrderAndMenuFromAnySource(incomingOrderId);

        if (resolvedOrderId) {
          cartOrder.applyRealtimeOrderReason?.(reason, resolvedOrderId);
          await refreshOrderWithRetry(resolvedOrderId, 5);
        }

        await load({ silent: true }).catch(() => {});
      } finally {
        sessionRealtimeRunningRef.current = false;

        if (
          sessionRealtimeQueuedRef.current ||
          sessionRealtimeEventRef.current
        ) {
          sessionRealtimeQueuedRef.current = false;
          processSessionRealtime();
        }
      }
    };

    const onSessionUpdated = (event) => {
      sessionRealtimeEventRef.current = event || {};
      processSessionRealtime();
    };

    channel.listen(".public.session.updated", onSessionUpdated);

    return () => {
      echo.leave(channelName);
    };
  }, [
    publicSessionChannelId,
    load,
    qr?.refreshSession,
    qr?.session?.order_id,
    qr?.takeover?.order_id,
    cartOrder?.currentOrderId,
    cartOrder?.activeOrder?.id,
    cartOrder?.pendingOrder?.id,
    cartOrder?.applyRealtimeOrderReason,
    cartOrder?.refreshOrder,
    setCallLocked,
  ]);

  useEffect(() => {
    if (!publicOrderChannelId) return;

    const channelName = `public.order.${publicOrderChannelId}`;
    const channel = echo.channel(channelName);

    const processOrderRealtime = async () => {
      if (orderRealtimeRunningRef.current) {
        orderRealtimeQueuedRef.current = true;
        return;
      }

      orderRealtimeRunningRef.current = true;

      try {
        const event = orderRealtimeEventRef.current || {};
        orderRealtimeEventRef.current = null;

        const orderId = Number(
          event?.order_id || publicOrderChannelId || getBestKnownOrderId() || 0,
        );
        if (!orderId) return;

        const reason = String(event?.reason || "").toLowerCase();

        cartOrder.applyRealtimeOrderReason?.(reason, orderId);

        lastLoadedOrderIdRef.current = orderId;
        await refreshOrderWithRetry(orderId, 5);

        await load({ silent: true }).catch(() => {});
      } finally {
        orderRealtimeRunningRef.current = false;

        if (orderRealtimeQueuedRef.current || orderRealtimeEventRef.current) {
          orderRealtimeQueuedRef.current = false;
          processOrderRealtime();
        }
      }
    };

    const onOrderUpdated = (event) => {
      orderRealtimeEventRef.current = event || {};
      processOrderRealtime();
    };

    channel.listen(".public.order.updated", onOrderUpdated);

    return () => {
      echo.leave(channelName);
    };
  }, [
    publicOrderChannelId,
    cartOrder?.applyRealtimeOrderReason,
    cartOrder?.refreshOrder,
    cartOrder?.currentOrderId,
    load,
  ]);

  const allowBaseSend =
    canSelect &&
    hasTable &&
    qr.sessionActive &&
    orderingMode === "customer_assisted" &&
    cartOrder.cart.length > 0 &&
    !qr.sessionBusy &&
    !qr.sessionUnavailable;

  const hasPending =
    !!cartOrder.pendingOrder?.id &&
    String(cartOrder.pendingOrder?.status || "pending").toLowerCase() ===
      "pending";

  const canAppend =
    !!cartOrder.activeOrder?.id &&
    ["open", "ready"].includes(
      String(cartOrder.activeOrder?.status || "").toLowerCase(),
    );

  const allowSendButton = allowBaseSend && (canAppend || !hasPending);

  const billFlow = cartOrder.activeOrder?.bill_flow || null;
  const canRequestBill =
    !!cartOrder.activeOrder?.id &&
    orderingMode === "customer_assisted" &&
    !!billFlow?.can_request_bill;

  const requestBillReason = String(billFlow?.reason || "");
  const billAlreadySent = !!billFlow?.already_sent;
  const billRequestStatus = String(billFlow?.request_status || "");
  const showBillButton =
    orderingMode === "customer_assisted" && !!cartOrder.activeOrder?.id;

  const cartDrawerItemCount =
    Number(cartOrder.cart?.length || 0) +
    Number(cartOrder.oldItems?.length || 0);

  const hasCartContent =
    (Array.isArray(cartOrder.cart) && cartOrder.cart.length > 0) ||
    (Array.isArray(cartOrder.oldItems) && cartOrder.oldItems.length > 0);

  const handleRequestBill = async () => {
    const orderId = Number(cartOrder?.activeOrder?.id || 0);
    if (!orderId || billRequesting) return;

    setBillToast("");

    try {
      setBillRequesting(true);

      const res = await requestPublicOrderBill({
        orderId,
        token,
      });

      setBillToast(
        res?.message ||
          (res?.data?.already
            ? "Aviso ya mandado."
            : "Solicitud de cuenta enviada al mesero."),
      );

      await cartOrder.refreshOrder?.(orderId);
      setCartDrawerOpen(true);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "No se pudo solicitar la cuenta.";

      setBillToast(`⚠️ ${msg}`);

      try {
        await cartOrder.refreshOrder?.(orderId);
      } catch {}

      setCartDrawerOpen(true);
    } finally {
      setBillRequesting(false);
    }
  };

  const [calling, setCalling] = useState(false);

  const onCallWaiterReal = async () => {
    if (!tableId) return;

    if (!qr.sessionActive) {
      qr.setCallToast(
        "⚠️ La sesión de la mesa no está activa. Escanea de nuevo el QR.",
      );
      setTimeout(() => qr.setCallToast(""), 4500);
      return;
    }

    if (callLocked) {
      qr.setCallToast("⚠️ El mesero ya está atendiendo. Intente más tarde.");
      setTimeout(() => qr.setCallToast(""), 4500);
      return;
    }

    setCalling(true);
    qr.setCallToast("");

    try {
      const res = await callWaiterByTable(tableId);
      const msg = res?.message || "Listo.";

      if (String(msg).toLowerCase().includes("ya registrada")) {
        qr.setCallToast(
          "✅ Ya estaba registrada la llamada. No hace falta spamear al mesero.",
        );
      } else {
        qr.setCallToast(
          "✅ Listo. Se registró tu solicitud para llamar al mesero.",
        );
      }

      setCallLocked(false);
      setTimeout(() => qr.setCallToast(""), 4500);
    } catch (e) {
      const status = e?.response?.status;
      const code = e?.response?.data?.code;

      if (status === 409 && code === "CALL_DISABLED_ATTENDED") {
        const msg =
          e?.response?.data?.message ||
          "El mesero ya está atendiendo. Intente más tarde.";

        setCallLocked(true);
        qr.setCallToast(`⚠️ ${msg}`);
        setTimeout(() => qr.setCallToast(""), 4500);
        load({ silent: true }).catch(() => {});
        return;
      }

      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "No se pudo llamar al mesero.";

      qr.setCallToast(`⚠️ ${msg}`);
      setTimeout(() => qr.setCallToast(""), 4500);
    } finally {
      setCalling(false);
    }
  };

  const callButtonDisabled =
    calling ||
    !qr.sessionActive ||
    qr.sessionLoading ||
    !!qr.sessionBusy ||
    !!qr.sessionUnavailable ||
    callLocked;

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
    composite.resetDraftForProduct?.(product);
    setSelectedCompositeProduct(product);
    setCompositeModalOpen(true);
  };

  const closeCompositeModal = () => {
    setCompositeModalOpen(false);
    setSelectedCompositeProduct(null);
  };

  const handleToggleCompositeIncluded = (cid, included) => {
    if (!selectedCompositeProduct) return;

    composite.setDraftIncluded?.(
      Number(selectedCompositeProduct.id),
      cid,
      included,
    );
  };

  const handleCompositeVariantChange = (cid, variantId) => {
    if (!selectedCompositeProduct) return;

    composite.setDraftVariant?.(
      Number(selectedCompositeProduct.id),
      cid,
      variantId,
    );
  };

  const confirmCompositeSelection = () => {
    if (!selectedCompositeProduct) return;

    const draft =
      composite.getOrInitCompositeDraft?.(selectedCompositeProduct) || [];
    const components =
      composite.buildSubmitComponentsFromProduct?.(selectedCompositeProduct) ||
      [];
    const details =
      composite.buildDetailsFromProduct?.(selectedCompositeProduct) || [];

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
    return <PublicMenuLoadingState token={token} />;
  }

  if (errorMsg) {
    return (
      <PublicMenuErrorState
        errorMsg={errorMsg}
        token={token}
        onRetry={() => load()}
      />
    );
  }

  if (!data || !activeMenuPayload) {
    return <PublicMenuEmptyState />;
  }

  const publicMenu = activeMenuPayload?.public_menu || data?.public_menu || {};
  const themeColor = isValidHexColor(publicMenu?.theme_color)
    ? publicMenu.theme_color
    : "#FF7A00";

  const pending = hasPending;
  const restaurantName = header?.restaurantName || "Restaurante";

  const headerBadges = [
    {
      tone: header?.restaurantStatus === "active" ? "ok" : "warn",
      label: `Restaurante: ${translateStatus(header?.restaurantStatus)}`,
    },
    {
      tone: header?.branchStatus === "active" ? "ok" : "warn",
      label: `Sucursal: ${translateStatus(header?.branchStatus)}`,
    },
    {
      tone: badgeUi.tone,
      label: badgeUi.label,
      title: uiFlags?.reason || "",
    },
    {
      tone: "dark",
      label: "⚡ Tiempo real",
      title: "Este flujo se sincroniza por WebSocket sin recargar toda la pantalla",
    },
  ];

  if (hasTable && String(activeMenuPayload?.type) === "physical") {
    headerBadges.push({
      tone: qr.sessionActive ? "ok" : "warn",
      label: `⏳ ${fmtMMSS(qr.remainingSec)}`,
      title: qr.sessionActive ? "Sesión activa (5 min)" : "Sesión no activa",
    });
  }

  if (orderingMode === "customer_assisted" && hasTable) {
    if (canAppend) {
      headerBadges.push({
        tone: "ok",
        label: "✅ Orden abierta",
        title: "Orden abierta: puedes agregar productos",
      });
    } else if (pending) {
      headerBadges.push({
        tone: "warn",
        label: "⏳ Comanda en espera",
        title: "Esperando aprobación del mesero",
      });
    }
  }

  if (callLocked) {
    headerBadges.push({
      tone: "warn",
      label: "🔕 Llamada desactivada",
      title: "El mesero ya atendió. Botón desactivado hasta finalizar.",
    });
  }

  const subtitle = (
    <>
      {restaurantName}
      {header?.channelName ? ` · ${header.channelName}` : ""}
      {header?.tableName ? ` · Mesa ${header.tableName}` : " · General"}
    </>
  );

  const extraInfo =
    header?.orderingMode || header?.tableServiceMode ? (
      <>
        {header?.orderingMode ? (
          <>
            Modo de pedido:{" "}
            <strong>{translateOrderingMode(header.orderingMode)}</strong>
          </>
        ) : null}
        {header?.orderingMode && header?.tableServiceMode ? " · " : null}
        {header?.tableServiceMode ? (
          <>
            Servicio de mesa:{" "}
            <strong>{translateTableServiceMode(header.tableServiceMode)}</strong>
          </>
        ) : null}
      </>
    ) : null;

  const actionButtons = (
    <>
      {showCallBtn ? (
        <PillButton
          tone="soft"
          onClick={onCallWaiterReal}
          disabled={callButtonDisabled}
          title={
            qr.sessionUnavailable
              ? "Sesión no disponible (ya atendida)."
              : callLocked
                ? "El mesero ya está atendiendo. Intente más tarde."
                : !qr.sessionActive
                  ? "Sesión no activa. Escanea de nuevo."
                  : "Enviar una solicitud al mesero"
          }
        >
          {calling
            ? "⏳ Llamando..."
            : callLocked
              ? "🔕 Llamada desactivada"
              : "🔔 Llamar al mesero"}
        </PillButton>
      ) : null}

      {hasTable && String(activeMenuPayload?.type) === "physical" ? (
        <PillButton
          onClick={() => qr.startScanSession()}
          disabled={qr.sessionLoading || !!qr.sessionBusy}
          title="Revalidar sesión de mesa"
        >
          {qr.sessionLoading ? "⏳ Validando..." : "📷 Validar QR"}
        </PillButton>
      ) : null}

      <PillButton
        tone="soft"
        onClick={() => {
          try {
            navigator.clipboard.writeText(window.location.href);
          } catch {}
        }}
        title="Copiar URL del menú"
      >
        📋 Copiar URL
      </PillButton>
    </>
  );

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        overflowX: "hidden",
        background: `linear-gradient(180deg, ${themeColor}10 0%, rgba(255,255,255,0) 36%)`,
      }}
    >
      <PublicMenuBrandCard publicMenu={publicMenu} />

      <div
        style={{
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "12px clamp(10px, 3vw, 16px)",
          paddingBottom: canSelect ? 96 : 16,
          boxSizing: "border-box",
        }}
      >
        <style>
          {`
            @media (max-width: 640px) {
              .cm-public-bleed-mobile {
                margin-left: -16px;
                margin-right: -16px;
              }

              .cm-public-bleed-mobile + .cm-public-bleed-mobile {
                margin-top: 0 !important;
              }
            }
          `}
        </style>

        <PublicMenuOverlays qr={qr} hasTable={hasTable} />

        <PublicMenuModals
          cartOrder={cartOrder}
          allowBaseSend={allowBaseSend}
          pending={pending}
          canAppend={canAppend}
          composite={composite}
          compositeModalOpen={compositeModalOpen}
          selectedCompositeProduct={selectedCompositeProduct}
          onCloseComposite={closeCompositeModal}
          onToggleCompositeIncluded={handleToggleCompositeIncluded}
          onCompositeVariantChange={handleCompositeVariantChange}
          onConfirmCompositeSelection={confirmCompositeSelection}
          extrasModalOpen={extrasModalOpen}
          selectedExtrasProduct={selectedExtrasProduct}
          selectedExtrasVariantId={selectedExtrasVariantId}
          selectedExtrasCompositeDraft={selectedExtrasCompositeDraft}
          selectedExtrasInitialValue={selectedExtrasInitialValue}
          selectedExtrasReadOnly={selectedExtrasReadOnly}
          selectedExtrasSelectionScope={selectedExtrasSelectionScope}
          onCloseExtras={resetExtrasFlow}
          onConfirmExtras={handleConfirmExtras}
          variantsModalOpen={variantsModalOpen}
          selectedVariantsProduct={selectedVariantsProduct}
          canSelect={canSelect}
          showSelectBtn={showSelectBtn}
          onCloseVariants={closeVariantsViewer}
          onAddVariant={openVariantSelectionFlow}
        />

        <PublicMenuCartDrawerBlock
          open={cartDrawerOpen}
          onClose={() => setCartDrawerOpen(false)}
          cartOrder={cartOrder}
          cartDrawerItemCount={cartDrawerItemCount}
          canAppend={canAppend}
          pending={pending}
          allowSendButton={allowSendButton}
          billRequesting={billRequesting}
          billToast={billToast}
          canRequestBill={canRequestBill}
          requestBillReason={requestBillReason}
          billAlreadySent={billAlreadySent}
          billRequestStatus={billRequestStatus}
          showBillButton={showBillButton}
          onRequestBill={handleRequestBill}
        />

        <div>
          <PublicMenuIdentityCard
            publicMenu={publicMenu}
            title={restaurantName}
            subtitle={subtitle}
            badges={headerBadges}
            extraInfo={extraInfo}
          />
        </div>

        <div style={{ marginTop: 14 }}>
          <PublicMenuGalleryCarousel publicMenu={publicMenu} />
        </div>

        <div style={{ marginTop: 14 }}>
          <PublicMenuOrderActionsCard
            publicMenu={publicMenu}
            rightActions={actionButtons}
            q={q}
            onSearchChange={setQ}
            totalVisible={filteredProducts.length}
            extraFilterActions={
              canSelect ? (
                <Badge tone="ok" title="Items nuevos por enviar/agregar">
                  En comanda:{" "}
                  <strong style={{ marginLeft: 6 }}>
                    {cartOrder.cart.length}
                  </strong>
                </Badge>
              ) : null
            }
          />
        </div>

        <PublicMenuWebChannelSelector
          show={isWeb}
          activeWebChannelId={activeWebChannelId}
          webChannels={webChannels}
          onChange={setWebChannelId}
        />

        <PublicMenuCallToast message={qr.callToast} />

        <PublicMenuCategoryTabs
          categoryOptions={categoryOptions}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />

        <PublicMenuWarningBlock warning={activeMenuPayload?.warning} />

        <PublicMenuProductsGrid
          filteredProducts={filteredProducts}
          paginatedProducts={paginatedProducts}
          categoryNameById={categoryNameById}
          canSelect={canSelect}
          showSelectBtn={showSelectBtn}
          onAddSimple={openProductSelectionFlow}
          onAddVariant={openVariantSelectionFlow}
          onOpenComposite={openCompositeConfigurator}
          onOpenExtras={openReadOnlyExtrasViewer}
          onOpenVariants={openVariantsViewer}
          pagination={{
            page,
            totalPages,
            startItem,
            endItem,
            total,
            hasPrev,
            hasNext,
            prevPage,
            nextPage,
          }}
        />

        <PublicMenuFooter
          publicMenu={publicMenu}
          restaurantName={restaurantName}
        />

        {canSelect ? (
          <MenuCartFloatingButton
            itemCount={cartDrawerItemCount}
            total={cartOrder.totalGlobal}
            disabled={false}
            onClick={() => setCartDrawerOpen(true)}
            label={hasCartContent ? "Ver comanda" : "Comanda"}
            title="Abrir comanda"
          />
        ) : null}
      </div>
    </div>
  );
}