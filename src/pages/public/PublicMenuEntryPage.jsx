import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import echo from "../../realtime/echo";

import {
  callWaiterByTable,
  requestPublicOrderBill,
} from "../../services/public/publicMenu.service";

import {
  PUBLIC_QR_DISABLED_MSG,
  PUBLIC_QR_WRONG_MODE_MSG,
  fmtMMSS,
  translateOrderingMode,
  translateStatus,
  translateTableServiceMode,
} from "../../hooks/public/publicMenu.utils";

import {
  Badge,
  FullOverlay,
  Modal,
  PillButton,
  SkeletonCard,
} from "./publicMenu.ui";

import { usePublicMenuLoader } from "../../hooks/public/usePublicMenuLoader";
import { useActiveMenuPayload } from "../../hooks/public/useActiveMenuPayload";
import { useTableQrSession } from "../../hooks/public/useTableQrSession";
import { useMenuProducts } from "../../hooks/public/useMenuProducts";
import { useCartAndOrder } from "../../hooks/public/useCartAndOrder";
import { useCompositeDrafts } from "../../hooks/public/useCompositeDrafts";

import MenuHeaderCard from "../../components/menu/shared/MenuHeaderCard";
import MenuProductCard from "../../components/menu/shared/MenuProductCard";
import CompositeProductModal from "../../components/menu/shared/CompositeProductModal";
import ProductExtrasModal from "../../components/menu/shared/ProductExtrasModal";
import MenuCartPanel from "../../components/menu/shared/MenuCartPanel";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function PublicMenuEntryPage() {
  const { token } = useParams();

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [q, setQ] = useState("");

  const [compositeModalOpen, setCompositeModalOpen] = useState(false);
  const [selectedCompositeProduct, setSelectedCompositeProduct] = useState(null);

  const [extrasModalOpen, setExtrasModalOpen] = useState(false);
  const [selectedExtrasProduct, setSelectedExtrasProduct] = useState(null);

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
      setExtrasModalOpen(false);
      setSelectedExtrasProduct(null);
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

  const {
    categoryNameById,
    categoryOptions,
    filteredProducts,
  } = useMenuProducts({
    sections,
    categoryFilter,
    q,
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
      if (Array.isArray(cartOrder.oldItems) && cartOrder.oldItems.length > 0) return;
    }

    lastLoadedOrderIdRef.current = sessionOrderId;

    cartOrder.refreshOrder?.(sessionOrderId).catch(() => {
      lastLoadedOrderIdRef.current = null;
    });
  }, [qr?.session?.order_id, qr?.session?.status, cartOrder]);

  useEffect(() => {
    cartOrder.syncOrderStatusFromSession?.(qr.sessionOrderStatus)?.catch?.(() => {});
  }, [qr.sessionOrderStatus, cartOrder.syncOrderStatusFromSession]);

  const publicSessionChannelId = useMemo(() => {
    return Number(
      qr?.session?.session_id ||
        qr?.takeover?.session_id ||
        qr?.sessionBusy?.session_id ||
        0,
    );
  }, [qr?.session?.session_id, qr?.takeover?.session_id, qr?.sessionBusy?.session_id]);

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

        const resolvedOrderId = await refreshOrderAndMenuFromAnySource(incomingOrderId);

        if (resolvedOrderId) {
          cartOrder.applyRealtimeOrderReason?.(reason, resolvedOrderId);
          await refreshOrderWithRetry(resolvedOrderId, 5);
        }

        await load({ silent: true }).catch(() => {});
      } finally {
        sessionRealtimeRunningRef.current = false;

        if (sessionRealtimeQueuedRef.current || sessionRealtimeEventRef.current) {
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
    String(cartOrder.pendingOrder?.status || "pending").toLowerCase() === "pending";

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
    } finally {
      setBillRequesting(false);
    }
  };

  const [calling, setCalling] = useState(false);

  const onCallWaiterReal = async () => {
    if (!tableId) return;

    if (!qr.sessionActive) {
      qr.setCallToast("⚠️ La sesión de la mesa no está activa. Escanea de nuevo el QR.");
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
        qr.setCallToast("✅ Ya estaba registrada la llamada. No hace falta spamear al mesero.");
      } else {
        qr.setCallToast("✅ Listo. Se registró tu solicitud para llamar al mesero.");
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

  const openCompositeConfigurator = (product) => {
    composite.resetDraftForProduct?.(product);
    setSelectedCompositeProduct(product);
    setCompositeModalOpen(true);
  };

  const confirmCompositeSelection = () => {
    if (!selectedCompositeProduct) return;

    const components =
      composite.buildSubmitComponentsFromProduct?.(selectedCompositeProduct) || [];
    const details =
      composite.buildDetailsFromProduct?.(selectedCompositeProduct) || [];

    cartOrder.addToCartFromProduct(selectedCompositeProduct, components, details);
    setCompositeModalOpen(false);
    setSelectedCompositeProduct(null);
  };

  const openExtrasViewer = (product) => {
    setSelectedExtrasProduct(product);
    setExtrasModalOpen(true);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: "18px auto", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 950 }}>Cargando menú…</div>
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
              Token: <strong style={{ letterSpacing: 0.5 }}>{token}</strong>
            </div>
          </div>
          <Badge tone="default">Solo lectura</Badge>
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
    const isQrDisabledMsg = errorMsg === PUBLIC_QR_DISABLED_MSG;
    const isWrongModeMsg = errorMsg === PUBLIC_QR_WRONG_MODE_MSG;

    return (
      <div style={{ maxWidth: 1200, margin: "18px auto", padding: 16 }}>
        <div
          style={{
            border: `1px solid ${
              isWrongModeMsg
                ? "rgba(255,0,0,0.25)"
                : isQrDisabledMsg
                ? "rgba(255,122,0,0.28)"
                : "rgba(255,0,0,0.25)"
            }`,
            background: isWrongModeMsg ? "#ffe5e5" : isQrDisabledMsg ? "#fff3cd" : "#ffe5e5",
            borderRadius: 16,
            padding: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 950, color: isQrDisabledMsg ? "#8a6d3b" : "#a10000" }}>
                {isWrongModeMsg
                  ? "QR inválido"
                  : isQrDisabledMsg
                  ? "Menú no disponible"
                  : "No se pudo cargar el menú"}
              </div>
              <div style={{ marginTop: 6, fontSize: 13, whiteSpace: "pre-line" }}>{errorMsg}</div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                Token: <strong>{token}</strong>
              </div>
            </div>

            {!isQrDisabledMsg && !isWrongModeMsg ? (
              <PillButton onClick={() => load()} title="Volver a intentar">
                Reintentar
              </PillButton>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (!data || !activeMenuPayload) {
    return (
      <div style={{ maxWidth: 1200, margin: "18px auto", padding: 16 }}>
        <div style={{ border: "1px solid rgba(0,0,0,0.12)", background: "#fff", borderRadius: 16, padding: 14 }}>
          <div style={{ fontWeight: 950 }}>Sin data</div>
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>
            Esto no debería pasar… pero aquí estamos.
          </div>
        </div>
      </div>
    );
  }

  const pending = hasPending;

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

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "18px auto",
        padding: 16,
        background: "linear-gradient(180deg, rgba(238,242,255,0.55), rgba(255,255,255,0))",
      }}
    >
      <FullOverlay
        open={!!qr.sessionBusy}
        tone="warn"
        title="Esta mesa ya está en uso"
        message={
          "Solo un usuario a la vez puede usar este QR.\n\n" +
          "Parece que otra persona ya escaneó la mesa en otro dispositivo.\n" +
          "Si se desocupa (o expira), podrás entrar."
        }
        actions={
          <>
            <PillButton tone="soft" onClick={() => qr.startScanSession()} disabled={qr.sessionLoading} title="Reintentar scan">
              {qr.sessionLoading ? "⏳ Reintentando..." : "🔄 Reintentar"}
            </PillButton>
            <PillButton tone="default" onClick={() => qr.setSessionBusy(null)} title="Cerrar aviso">
              Entendido
            </PillButton>
          </>
        }
      />

      <FullOverlay
        open={!!qr.sessionUnavailable}
        tone="warn"
        title="Sesión no disponible"
        message={
          (qr.sessionUnavailable?.message || "Sesión no disponible, intente más tarde.") +
          "\n\n" +
          "El mesero ya atendió esta mesa.\n" +
          "Cuando finalice la atención, este QR volverá a estar disponible."
        }
        actions={
          <>
            <PillButton tone="soft" onClick={() => qr.startScanSession()} disabled={qr.sessionLoading} title="Reintentar">
              {qr.sessionLoading ? "⏳ Reintentando..." : "🔄 Reintentar"}
            </PillButton>
            <PillButton tone="default" onClick={() => qr.setSessionUnavailable(null)} title="Cerrar aviso">
              Entendido
            </PillButton>
          </>
        }
      />

      <FullOverlay
        open={hasTable && !qr.sessionBusy && !qr.sessionUnavailable && qr.sessionExpired}
        tone="err"
        title="Tiempo agotado"
        message={
          "La sesión de esta mesa expiró (5 minutos).\n\n" +
          "Vuelve a escanear para activar otra sesión y poder enviar pedidos."
        }
        actions={
          <>
            <PillButton tone="soft" onClick={() => qr.startScanSession()} disabled={qr.sessionLoading} title="Reiniciar sesión">
              {qr.sessionLoading ? "⏳ Activando..." : "📷 Escanear de nuevo"}
            </PillButton>
          </>
        }
      />

      <FullOverlay
        open={!!qr.takeover?.available}
        tone="warn"
        title="¿Retomar cuenta?"
        message={
          qr.takeover?.message ||
          "Esta mesa tiene una comanda abierta pero no hay dispositivo vinculado.\n¿Deseas retomar la cuenta?"
        }
        actions={
          <>
            <PillButton
              tone="orange"
              onClick={() => qr.requestJoin()}
              disabled={qr.sessionLoading || qr.joinReq?.status === "pending"}
              title="Enviar solicitud al mesero"
            >
              {qr.joinReq?.status === "pending" ? "⏳ Solicitando..." : "✅ Sí, retomar"}
            </PillButton>

            <PillButton
              tone="default"
              onClick={() => qr.clearTakeover()}
              disabled={qr.joinReq?.status === "pending"}
              title="Cancelar"
            >
              No
            </PillButton>
          </>
        }
      />

      <FullOverlay
        open={!!qr.joinReq && qr.joinReq.status === "pending"}
        tone="default"
        title="Esperando aprobación"
        message={qr.joinReq?.message || "Solicitud enviada. Espera aprobación del mesero."}
        actions={
          <PillButton tone="default" onClick={() => qr.clearTakeover()} title="Cerrar">
            Entendido
          </PillButton>
        }
      />

      <FullOverlay
        open={!!qr.joinReq && qr.joinReq.status === "rejected"}
        tone="err"
        title="No aprobado"
        message={qr.joinReq?.message || "No fuiste aprobado para retomar la cuenta."}
        actions={
          <PillButton tone="default" onClick={() => qr.clearTakeover()} title="Cerrar">
            Ok
          </PillButton>
        }
      />

      <Modal
        open={cartOrder.sendOpen}
        title="Enviar comanda"
        onClose={() => {
          if (!cartOrder.sending) cartOrder.setSendOpen(false);
        }}
        actions={
          <>
            <PillButton tone="default" disabled={cartOrder.sending} onClick={() => cartOrder.setSendOpen(false)} title="Cancelar">
              Cancelar
            </PillButton>
            <PillButton
              tone="orange"
              disabled={cartOrder.sending || !allowBaseSend || pending || canAppend}
              onClick={cartOrder.submitOrderOrAppend}
              title={
                canAppend
                  ? "Esta orden ya está abierta, se agrega directo desde el botón Enviar."
                  : pending
                  ? "Ya hay comanda en espera."
                  : !allowBaseSend
                  ? "No se puede enviar aún"
                  : "Mandar comanda"
              }
            >
              {cartOrder.sending ? "⏳ Mandando..." : "📨 Mandar"}
            </PillButton>
          </>
        }
      >
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontSize: 13, opacity: 0.85 }}>Escribe tu nombre para identificar la comanda.</div>

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

          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Items: <strong>{cartOrder.cart.length}</strong> · Total aprox:{" "}
            <strong>
              {Number(cartOrder.cartTotal || 0).toLocaleString("es-MX", {
                style: "currency",
                currency: "MXN",
              })}
            </strong>
          </div>

          {pending ? (
            <div style={{ fontSize: 12, opacity: 0.85 }}>
              ⏳ Ya hay una comanda en espera. Espera a que el mesero la apruebe.
            </div>
          ) : null}

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
        draft={selectedCompositeProduct ? composite.getOrInitCompositeDraft?.(selectedCompositeProduct) || [] : []}
        onClose={() => {
          setCompositeModalOpen(false);
          setSelectedCompositeProduct(null);
        }}
        onToggleIncluded={(cid, included) => {
          if (!selectedCompositeProduct) return;
          composite.setDraftIncluded?.(Number(selectedCompositeProduct.id), cid, included);
        }}
        onVariantChange={(cid, variantId) => {
          if (!selectedCompositeProduct) return;
          composite.setDraftVariant?.(Number(selectedCompositeProduct.id), cid, variantId);
        }}
        onConfirm={confirmCompositeSelection}
        confirmLabel="Agregar compuesto"
      />

      <ProductExtrasModal
        open={extrasModalOpen}
        product={selectedExtrasProduct}
        onClose={() => {
          setExtrasModalOpen(false);
          setSelectedExtrasProduct(null);
        }}
        onSelectPlaceholder={() => {}}
      />

      <MenuHeaderCard
        title={header?.restaurantName}
        subtitle={
          <>
            <strong>{header?.branchName}</strong> · {header?.channelName}
            {header?.tableName ? ` · Mesa ${header.tableName}` : " · General"}
          </>
        }
        badges={headerBadges}
        extraInfo={
          (header?.orderingMode || header?.tableServiceMode) && (
            <>
              {header?.orderingMode ? (
                <>
                  Modo de pedido: <strong>{translateOrderingMode(header.orderingMode)}</strong>
                </>
              ) : null}
              {header?.orderingMode && header?.tableServiceMode ? " · " : null}
              {header?.tableServiceMode ? (
                <>
                  Servicio de mesa: <strong>{translateTableServiceMode(header.tableServiceMode)}</strong>
                </>
              ) : null}
            </>
          )
        }
        rightActions={
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
                {calling ? "⏳ Llamando..." : callLocked ? "🔕 Llamada desactivada" : "🔔 Llamar al mesero"}
              </PillButton>
            ) : null}

            {hasTable && String(activeMenuPayload?.type) === "physical" ? (
              <PillButton onClick={() => qr.startScanSession()} disabled={qr.sessionLoading || !!qr.sessionBusy} title="Revalidar sesión de mesa">
                {qr.sessionLoading ? "⏳ Validando..." : "📷 Validar QR"}
              </PillButton>
            ) : null}

            <PillButton onClick={() => load()} title="Recargar menú">
              🔄 Recargar
            </PillButton>

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
        }
        categoryOptions={categoryOptions}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        q={q}
        onSearchChange={setQ}
        totalVisible={filteredProducts.length}
        extraFilterActions={
          canSelect ? (
            <Badge tone="ok" title="Items nuevos por enviar/agregar">
              En comanda: <strong style={{ marginLeft: 6 }}>{cartOrder.cart.length}</strong>
            </Badge>
          ) : null
        }
      >
        {isWeb ? (
          <div style={{ marginTop: 10, display: "grid", gap: 6, maxWidth: 420 }}>
            <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.85 }}>Canal a visualizar</div>
            <select
              value={activeWebChannelId}
              onChange={(e) => setWebChannelId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                outline: "none",
                fontWeight: 850,
                background: "#fff",
              }}
            >
              {(webChannels || []).map((ch) => (
                <option key={ch.id} value={String(ch.id)}>
                  {ch.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {qr.callToast ? (
          <div
            style={{
              marginTop: 12,
              border: "1px solid rgba(0,0,0,0.10)",
              background: "#fff",
              borderRadius: 14,
              padding: 10,
              fontSize: 13,
              fontWeight: 850,
            }}
          >
            {qr.callToast}
          </div>
        ) : null}
      </MenuHeaderCard>

      {activeMenuPayload?.warning ? (
        <div
          style={{
            marginTop: 12,
            border: "1px solid #ffe08a",
            background: "#fff3cd",
            borderRadius: 16,
            padding: 12,
            color: "#8a6d3b",
            fontWeight: 800,
            whiteSpace: "pre-line",
          }}
        >
          {activeMenuPayload.warning}
        </div>
      ) : null}

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
                    showSelectBtn={showSelectBtn}
                    onAddSimple={(product) => cartOrder.addToCartFromProduct(product)}
                    onAddVariant={(product, variant) => cartOrder.addToCartFromVariant(product, variant)}
                    onOpenComposite={openCompositeConfigurator}
                    onOpenExtras={openExtrasViewer}
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
                  : "Se llena cuando seleccionas productos. Luego presiona Enviar."
              }
              customerName={canAppend ? cartOrder.activeOrder?.customer_name || "" : ""}
              total={cartOrder.totalGlobal}
              oldItems={cartOrder.oldItems}
              newItems={cartOrder.cart}
              sendToast={cartOrder.sendToast}
              sending={cartOrder.sending}
              canAppend={canAppend}
              canSubmit={allowSendButton}
              showPaymentMessage={!!cartOrder?.activeOrder?.customer_ui?.show_payment_message}
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
                ...(canAppend ? [{ tone: "ok", label: "✅ Orden abierta" }] : []),
                ...(!canAppend && pending ? [{ tone: "warn", label: "⏳ En espera de aprobación" }] : []),
                ...(Array.isArray(cartOrder.oldItems) && cartOrder.oldItems.length > 0
                  ? [{ tone: "dark", label: `Historial: ${cartOrder.oldItems.length}`, title: "Historial (solo lectura)" }]
                  : []),
                { tone: cartOrder.cart.length > 0 ? "ok" : "warn", label: `Nuevos: ${cartOrder.cart.length}` },
                ...(showBillButton
                  ? [
                      {
                        tone:
                          String(cartOrder.activeOrder?.status || "") === "paying"
                            ? "warn"
                            : billAlreadySent
                            ? "dark"
                            : canRequestBill
                            ? "ok"
                            : "warn",
                        label:
                          String(cartOrder.activeOrder?.status || "") === "paying"
                            ? "💳 En proceso de pago"
                            : billAlreadySent
                            ? `🧾 Aviso enviado${billRequestStatus ? ` (${billRequestStatus})` : ""}`
                            : canRequestBill
                            ? "🧾 Puedes pedir cuenta"
                            : "🧾 Aún no disponible",
                        title: requestBillReason || "Estado del flujo para pedir cuenta",
                      },
                    ]
                  : []),
              ]}
              requestBillBlock={
                showBillButton ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    <PillButton
                      tone="soft"
                      onClick={handleRequestBill}
                      disabled={billRequesting || !canRequestBill}
                      title={
                        canRequestBill
                          ? "Enviar solicitud de cuenta al mesero"
                          : requestBillReason || "La orden aún no puede solicitar cuenta"
                      }
                    >
                      {billRequesting ? "⏳ Solicitando..." : "🧾 Pedir cuenta"}
                    </PillButton>

                    {requestBillReason && !canRequestBill ? (
                      <div
                        style={{
                          border: "1px solid rgba(0,0,0,0.10)",
                          borderRadius: 14,
                          padding: 10,
                          background: "#fff",
                          fontSize: 12,
                          fontWeight: 850,
                          whiteSpace: "pre-line",
                          opacity: 0.85,
                        }}
                      >
                        {requestBillReason}
                      </div>
                    ) : null}

                    {billToast ? (
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
                        {billToast}
                      </div>
                    ) : null}
                  </div>
                ) : null
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}