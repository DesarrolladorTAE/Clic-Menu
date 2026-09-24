import {
  useMemo,
  useState,
} from "react";
import {
  buildCombinedPricingSummary,
  normalizeConfirmedPricingSummary,
  safeNum,
} from "./publicMenu.utils";
import { usePublicCart } from "./cartAndOrder/usePublicCart";
import { usePublicWebOrdering } from "./cartAndOrder/usePublicWebOrdering";
import { usePublicTableOrder } from "./cartAndOrder/usePublicTableOrder";
import { usePublicOrderCancellation } from "./cartAndOrder/usePublicOrderCancellation";
import { toSafeInt } from "./cartAndOrder/publicCartAndOrder.utils";

export function useCartAndOrder({
  token,
  canSelect,
  hasTable,
  sessionActive,
  orderingMode,
  sessionBusy,
  sessionUnavailable,
  activeMenuType,
  activeMenuPayload,
  publicFlow,
  qrType,
  salesChannelCode,
  onPreparedItemsRefresh = null,
}) {
  const normalizedQrType = String(
    qrType ||
      activeMenuPayload?.qr_type ||
      activeMenuType ||
      "",
  ).trim().toLowerCase();

  const normalizedSalesChannelCode = String(
    salesChannelCode ||
      activeMenuPayload?.sales_channel_code ||
      activeMenuPayload?.sales_channel?.code ||
      "",
  ).trim().toUpperCase();

  const normalizedPublicFlow = String(
    publicFlow ||
      activeMenuPayload?.public_flow ||
      "catalog_only",
  ).trim().toLowerCase();

  const isWhatsappFlow =
    normalizedQrType === "web" &&
    normalizedSalesChannelCode === "WHATSAPP" &&
    normalizedPublicFlow === "whatsapp";

  const isOnlineOrderFlow =
    normalizedQrType === "web" &&
    normalizedSalesChannelCode === "ONLINE_ORDER" &&
    normalizedPublicFlow === "online_order";

  const isWebOrderingFlow =
    isWhatsappFlow ||
    isOnlineOrderFlow;

  const onlineOrderCheckout =
    isOnlineOrderFlow &&
    activeMenuPayload?.online_order_checkout &&
    typeof activeMenuPayload.online_order_checkout === "object"
      ? activeMenuPayload.online_order_checkout
      : null;

  const customerOrderUi =
    activeMenuPayload?.ui &&
    typeof activeMenuPayload.ui === "object"
      ? activeMenuPayload.ui
      : {};

  const canStartCustomerOrder =
    typeof customerOrderUi?.can_start_customer_order === "boolean"
      ? customerOrderUi.can_start_customer_order
      : null;

  const canContinueExistingCustomerOrder =
    typeof customerOrderUi?.can_continue_existing_customer_order === "boolean"
      ? customerOrderUi.can_continue_existing_customer_order
      : null;

  const customerOrderStartReasonCode =
    customerOrderUi?.customer_order_start_reason_code ||
    null;

  const customerOrderStartReason =
    String(customerOrderUi?.customer_order_start_reason || "", ).trim();

  /*
  |--------------------------------------------------------------------------
  | Estado compartido de interacción
  |--------------------------------------------------------------------------
  */
  const [sendOpen, setSendOpen, ] = useState(false);

  const [customerName, setCustomerName, ] = useState("");

  const [partySize, setPartySize, ] = useState("");

  const [
    adultCount,
    setAdultCount,
  ] = useState("");

  const [
    childCount,
    setChildCount,
  ] = useState("");

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    sendToast,
    setSendToast,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | pendingCancellation es compartido
  |--------------------------------------------------------------------------
  |
  | refreshOrder() lo hidrata desde show().
  | usePublicOrderCancellation lo modifica cuando se crea una solicitud.
  |
  | Se mantiene aquí para evitar dependencia circular entre ambos hooks.
  */
  const [
    pendingCancellation,
    setPendingCancellation,
  ] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Carrito
  |--------------------------------------------------------------------------
  */

  const publicCart =
    usePublicCart({
      activeMenuPayload,
      isWhatsappFlow,
      onPreparedItemsRefresh,
    });

  /*
  |--------------------------------------------------------------------------
  | Order de mesa
  |--------------------------------------------------------------------------
  */

  const tableOrder =
    usePublicTableOrder({
      token,

      cart:
        publicCart.cart,

      setCart:
        publicCart.setCart,

      hasInvalidCartItems:
        publicCart.hasInvalidCartItems,

      markCartAvailabilityError:
        publicCart.markCartAvailabilityError,

      handlePreparedItemRequestError:
        publicCart.handlePreparedItemRequestError,

      refreshPreparedItemsPool:
        publicCart.refreshPreparedItemsPool,

      setPreparedCartMessage:
        publicCart.setPreparedCartMessage,

      setSendToast,
      setSendOpen,
      setCustomerName,
      setPartySize,
      setAdultCount,
      setChildCount,

      canStartCustomerOrder,
      customerOrderStartReason,
      customerOrderStartReasonCode,

      setPendingCancellation,
    });

  /*
  |--------------------------------------------------------------------------
  | WEB: WhatsApp + ONLINE_ORDER
  |--------------------------------------------------------------------------
  */

  const webOrdering =
    usePublicWebOrdering({
      token,
      isWhatsappFlow,
      isOnlineOrderFlow,

      cart:
        publicCart.cart,

      setCart:
        publicCart.setCart,

      hasInvalidCartItems:
        publicCart.hasInvalidCartItems,

      markCartAvailabilityError:
        publicCart.markCartAvailabilityError,

      handlePreparedItemRequestError:
        publicCart.handlePreparedItemRequestError,

      refreshPreparedItemsPool:
        publicCart.refreshPreparedItemsPool,

      setPreparedCartMessage:
        publicCart.setPreparedCartMessage,

      setSendToast,
      setSendOpen,
      setCustomerName,
      setPartySize,
      setAdultCount,
      setChildCount,
    });

  /*
  |--------------------------------------------------------------------------
  | Cancelación QR cliente
  |--------------------------------------------------------------------------
  */

  const cancellation =
    usePublicOrderCancellation({
      token,
      hasTable,
      orderingMode,
      isWebOrderingFlow,

      activeOrder:
        tableOrder.activeOrder,

      oldItems:
        tableOrder.oldItems,

      pendingCancellation,
      setPendingCancellation,

      refreshOrder:
        tableOrder.refreshOrder,

      setSendToast,
    });

  /*
  |--------------------------------------------------------------------------
  | Guard original: no agregar productos normales si ya está paying
  |--------------------------------------------------------------------------
  |
  | Antes vivía dentro de addToCartFromProduct/addToCartFromVariant.
  | Se conserva aquí para que usePublicCart no dependa de usePublicTableOrder.
  */

  function addToCartFromProduct(
    p,
    componentsOverride = [],
    componentsDetailOverride = [],
    modifiersOverride = [],
    modifierGroupsDisplayOverride = [],
  ) {
    if (
      String(
        tableOrder.activeOrder?.status ||
          "",
      ).toLowerCase() === "paying"
    ) {
      return;
    }

    return publicCart.addToCartFromProduct(
      p,
      componentsOverride,
      componentsDetailOverride,
      modifiersOverride,
      modifierGroupsDisplayOverride,
    );
  }

  function addToCartFromVariant(
    p,
    v,
    componentsOverride = [],
    componentsDetailOverride = [],
    modifiersOverride = [],
    modifierGroupsDisplayOverride = [],
  ) {
    if (
      String(
        tableOrder.activeOrder?.status ||
          "",
      ).toLowerCase() === "paying"
    ) {
      return;
    }

    return publicCart.addToCartFromVariant(
      p,
      v,
      componentsOverride,
      componentsDetailOverride,
      modifiersOverride,
      modifierGroupsDisplayOverride,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Pricing global
  |--------------------------------------------------------------------------
  */

  const activeOrderPricingSummary =
    useMemo(() => {
      return normalizeConfirmedPricingSummary(
        tableOrder.activeOrder,
      );
    }, [
      tableOrder.activeOrder,
    ]);

  const pendingOrderPricingSummary =
    useMemo(() => {
      return normalizeConfirmedPricingSummary(
        tableOrder.pendingOrder,
      );
    }, [
      tableOrder.pendingOrder,
    ]);

  const confirmedPricingSummary =
    activeOrderPricingSummary.hasConfirmedData
      ? activeOrderPricingSummary
      : pendingOrderPricingSummary;

  const pricingSummary =
    useMemo(() => {
      return buildCombinedPricingSummary(
        confirmedPricingSummary,
        publicCart.newItemsPricingSummary,
      );
    }, [
      confirmedPricingSummary,
      publicCart.newItemsPricingSummary,
    ]);

  const displayTotal =
    safeNum(
      pricingSummary?.displayTotal,
      0,
    );

  const totalLabel =
    pricingSummary?.totalLabel ||
    "Total";

  const isEstimated =
    Boolean(
      pricingSummary?.isEstimated,
    );

  /*
  * Aliases temporales de compatibilidad.
  * Los componentes nuevos deben usar los resúmenes.
  */
  const cartTotal =
    safeNum(
      publicCart
        .newItemsPricingSummary
        ?.totalApproximate,
      0,
    );

  const oldTotal =
    safeNum(
      confirmedPricingSummary
        ?.confirmedTotal,
      0,
    );

  const totalGlobal =
    displayTotal;

  /*
  |--------------------------------------------------------------------------
  | Reglas generales de envío
  |--------------------------------------------------------------------------
  */

  const tableOk =
    isWebOrderingFlow
      ? true
      : !!hasTable;

  const sessionOk =
    isWebOrderingFlow
      ? true
      : !!sessionActive;

  const modeOk =
    isWebOrderingFlow
      ? true
      : String(
          orderingMode || "",
        ) ===
          "customer_assisted";

  const selectableOk =
    !!canSelect;

  const busyOk =
    !sessionBusy;

  const unavailableOk =
    !sessionUnavailable;

  const hasItems =
    publicCart.cart.length > 0;

  const orderUi =
    tableOrder.activeOrder
      ?.customer_ui ||
    {};

  const payingOk =
    String(
      tableOrder.activeOrder
        ?.status ||
        "",
    ).toLowerCase() !==
    "paying";

  const canAppend =
    tableOrder.canAppend;

  const orderUiOk =
    isWebOrderingFlow
      ? true
      : canAppend
        ? orderUi?.can_add_items !== false &&
          orderUi?.can_send_items !== false
        : true;

  const hasPending =
    !!tableOrder.pendingOrder?.id &&
    [
      "pending",
      "pending_approval",
    ].includes(
      String(
        tableOrder.pendingOrder
          ?.status ||
          "pending",
      ).toLowerCase(),
    );

  const allowBase =
    (
      isWebOrderingFlow
        ? selectableOk &&
          hasItems &&
          orderUiOk &&
          payingOk
        : tableOk &&
          sessionOk &&
          modeOk &&
          selectableOk &&
          busyOk &&
          unavailableOk &&
          hasItems &&
          orderUiOk &&
          payingOk
    ) &&
    !publicCart.hasInvalidCartItems;

  const allowSendNow =
    isWebOrderingFlow
      ? allowBase
      : allowBase &&
        (
          canAppend ||
          (
            !hasPending &&
            canStartCustomerOrder !== false
          )
        );

  function buildBlockerMessage() {
    if (
      publicCart.hasInvalidCartItems
    ) {
      return "Hay productos que ya no están disponibles. Quítalos para continuar.";
    }

    if (!hasItems) {
      return "Agrega al menos un producto para continuar.";
    }

    if (
      !isWebOrderingFlow &&
      !sessionOk
    ) {
      return "La sesión de la mesa ya no está activa. Escanea nuevamente el QR.";
    }

    if (
      !isWebOrderingFlow &&
      !tableOk
    ) {
      return "No se pudo identificar la mesa de este QR.";
    }

    if (
      !selectableOk ||
      !modeOk
    ) {
      return "Este menú no permite realizar pedidos en este momento.";
    }

    if (!busyOk) {
      return "Esta mesa está siendo atendida desde otro dispositivo.";
    }

    if (!unavailableOk) {
      return "La sesión de esta mesa ya no está disponible.";
    }

    if (
      !orderUiOk ||
      !payingOk
    ) {
      return "La orden ya no permite agregar productos.";
    }

    return "No se puede continuar en este momento.";
  }

  // ==========================================
  // 1. CONTROLADOR PRINCIPAL DEL BOTÓN ENVIAR
  // ==========================================
  async function submitOrderOrAppend() {
    if (sending) {
      return;
    }

    if (
      publicCart.hasInvalidCartItems
    ) {
      setSendToast(
        "⚠️ Hay productos que ya no están disponibles. Quítalos para continuar.",
      );

      setTimeout(
        () => setSendToast(""),
        5000,
      );

      return;
    }

    // A. WEB + WHATSAPP
    if (isWhatsappFlow) {
      const res =
        await webOrdering
          .sendWhatsAppOrder();

      if (!res.ok) {
        return;
      }

      setTimeout(
        () => setSendToast(""),
        4000,
      );

      return;
    }

    // B. WEB + ONLINE_ORDER
    if (isOnlineOrderFlow) {
      if (!allowBase) {
        setSendToast(
          `⚠️ ${buildBlockerMessage()}`,
        );

        setTimeout(
          () => setSendToast(""),
          3000,
        );

        return;
      }

      webOrdering
        .setOnlineOrderCreated(
          null,
        );

      setSendOpen(true);

      return;
    }

    // C. APPEND A ORDEN DE MESA EXISTENTE
    if (
      canAppend &&
      tableOrder.activeOrder?.id
    ) {
      setSending(true);
      setSendToast("");

      try {
        await tableOrder
          .appendToOpenOrder(
            tableOrder.activeOrder.id,
          );

        setTimeout(
          () => setSendToast(""),
          6500,
        );
      } finally {
        setSending(false);
      }

      return;
    }

    // D. BLOQUEO EXCLUSIVO PARA EL NACIMIENTO DE UNA NUEVA ORDER
    if (
      canStartCustomerOrder === false &&
      !tableOrder.activeOrder?.id &&
      !tableOrder.pendingOrder?.id
    ) {
      const message =
        customerOrderStartReason ||
        "No se pueden iniciar nuevos pedidos desde QR en este momento.";

      setSendToast(
        `⚠️ ${message}`,
      );

      setTimeout(
        () => setSendToast(""),
        6500,
      );

      return;
    }

    // E. VALIDACIÓN BASE ANTES DE ABRIR MODAL
    if (!allowBase) {
      setSendToast(
        buildBlockerMessage(),
      );

      setTimeout(
        () => setSendToast(""),
        5000,
      );

      return;
    }

    if (hasPending) {
      setSendToast(
        "⏳ Ya hay una comanda en espera de aprobación. No puedes enviar otra.",
      );

      setTimeout(
        () => setSendToast(""),
        5000,
      );

      return;
    }

    setSendOpen(true);
  }

  // ==========================================
  // 2. CONTROLADOR PARA EL BOTÓN "MANDAR" DEL MODAL
  // ==========================================
  async function confirmAndCreateOrder() {
    if (sending) {
      return;
    }

    // WHATSAPP y ONLINE_ORDER no crean la orden pública de mesa.
    if (isWebOrderingFlow) {
      return;
    }

    if (
      publicCart.hasInvalidCartItems
    ) {
      setSendToast(
        "⚠️ Hay productos que ya no están disponibles. Quítalos para continuar.",
      );

      setTimeout(
        () => setSendToast(""),
        5000,
      );

      return;
    }

    const name =
      String(
        customerName || "",
      ).trim();

    if (!name) {
      setSendToast(
        "⚠️ Escribe tu nombre para enviar la comanda.",
      );

      setTimeout(
        () => setSendToast(""),
        3500,
      );

      return;
    }

    const party =
      toSafeInt(partySize);

    const adults =
      toSafeInt(adultCount);

    const children =
      toSafeInt(childCount);

    if (party < 1) {
      setSendToast(
        "⚠️ Debe haber al menos una persona en la mesa.",
      );

      setTimeout(
        () => setSendToast(""),
        4000,
      );

      return;
    }

    if (adultCount === "") {
      setSendToast(
        "⚠️ Captura el número de adultos. Usa 0 si no hay.",
      );

      setTimeout(
        () => setSendToast(""),
        4000,
      );

      return;
    }

    if (childCount === "") {
      setSendToast(
        "⚠️ Captura el número de niños. Usa 0 si no hay.",
      );

      setTimeout(
        () => setSendToast(""),
        4000,
      );

      return;
    }

    if (
      adults < 0 ||
      children < 0
    ) {
      setSendToast(
        "⚠️ Adultos y niños no pueden ser menores a 0.",
      );

      setTimeout(
        () => setSendToast(""),
        4000,
      );

      return;
    }

    if (
      adults + children !==
      party
    ) {
      setSendToast(
        "⚠️ La suma de adultos y niños debe coincidir con el total de personas.",
      );

      setTimeout(
        () => setSendToast(""),
        4500,
      );

      return;
    }

    setSending(true);
    setSendToast("");

    try {
      await tableOrder
        .createFirstOrder(
          name,
          {
            party_size: party,
            adult_count: adults,
            child_count: children,
          },
        );

      setTimeout(
        () => setSendToast(""),
        6500,
      );
    } finally {
      setSending(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Reset por cambio de canal
  |--------------------------------------------------------------------------
  */

  function resetOnChannelChange() {
    publicCart.resetCartState();

    setSendOpen(false);
    setCustomerName("");
    setPartySize("");
    setAdultCount("");
    setChildCount("");
    setSendToast("");

    cancellation
      .resetCancellation();

    webOrdering
      .resetWebOrdering();

    tableOrder
      .resetTableOrder();
  }

  /*
  |--------------------------------------------------------------------------
  | Contrato público original
  |--------------------------------------------------------------------------
  */

  return {
    cart:
      publicCart.cart,

    setCart:
      publicCart.setCart,

    reconcileCartAvailability:
      publicCart.reconcileCartAvailability,

    hasInvalidCartItems:
      publicCart.hasInvalidCartItems,

    invalidCartItemsCount:
      publicCart.invalidCartItemsCount,

    addToCartFromProduct,
    addToCartFromVariant,

    addPreparedItem:
      publicCart.addPreparedItem,

    removePreparedItem:
      publicCart.removePreparedItem,

    reconcilePreparedItems:
      publicCart.reconcilePreparedItems,

    selectedPreparedItemIds:
      publicCart.selectedPreparedItemIds,

    preparedCartMessage:
      publicCart.preparedCartMessage,

    clearPreparedCartMessage:
      publicCart.clearPreparedCartMessage,

    setCartComponents:
      publicCart.setCartComponents,

    removeCartItem:
      publicCart.removeCartItem,

    setCartQty:
      publicCart.setCartQty,

    setCartNotes:
      publicCart.setCartNotes,

    newItemsPricingSummary:
      publicCart.newItemsPricingSummary,

    confirmedPricingSummary,
    pricingSummary,

    displayTotal,
    totalLabel,
    isEstimated,

    /*
    * Aliases temporales para consumidores anteriores.
    */
    cartTotal,
    oldTotal,
    totalGlobal,

    sendOpen,
    setSendOpen,

    onlineOrderCheckout,

    onlineOrderQuoting:
      webOrdering.onlineOrderQuoting,

    onlineOrderCreating:
      webOrdering.onlineOrderCreating,

    onlineOrderCreated:
      webOrdering.onlineOrderCreated,

    quoteOnlineOrder:
      webOrdering.quoteOnlineOrder,

    createOnlineOrder:
      webOrdering.createOnlineOrder,

    customerName,
    setCustomerName,

    partySize,
    setPartySize,

    adultCount,
    setAdultCount,

    childCount,
    setChildCount,

    sending,
    sendToast,
    setSendToast,

    pendingOrder:
      tableOrder.pendingOrder,

    activeOrder:
      tableOrder.activeOrder,

    oldItems:
      tableOrder.oldItems,

    currentOrderId:
      tableOrder.currentOrderId,

    refreshOrder:
      tableOrder.refreshOrder,

    syncOrderStatusFromSession:
      tableOrder.syncOrderStatusFromSession,

    applyRealtimeOrderReason:
      tableOrder.applyRealtimeOrderReason,

    pendingCancellation,

    cancellationSelection:
      cancellation.cancellationSelection,

    cancellationSummary:
      cancellation.cancellationSummary,

    selectedCancellationItems:
      cancellation.selectedCancellationItems,

    cancellationActive:
      cancellation.cancellationActive,

    cancellationSubmitting:
      cancellation.cancellationSubmitting,

    cancellationError:
      cancellation.cancellationError,

    canRequestCancellation:
      cancellation.canRequestCancellation,

    startCancellation:
      cancellation.startCancellation,

    exitCancellation:
      cancellation.exitCancellation,

    toggleCancellationItem:
      cancellation.toggleCancellationItem,

    setCancellationQuantity:
      cancellation.setCancellationQuantity,

    requestCancellation:
      cancellation.requestCancellation,

    allowSendNow,
    canAppend,

    canStartCustomerOrder,
    canContinueExistingCustomerOrder,
    customerOrderStartReasonCode,
    customerOrderStartReason,

    submitOrderOrAppend,
    confirmAndCreateOrder,

    resetOnChannelChange,
  };
}
