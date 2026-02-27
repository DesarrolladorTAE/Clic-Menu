// src/pages/public/PublicMenuEntryPage.jsx
// Page principal: SOLO orquesta hooks + render

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { callWaiterByTable } from "../../services/public/publicMenu.service";

import {
  PUBLIC_QR_DISABLED_MSG,
  PUBLIC_QR_WRONG_MODE_MSG,
  fmtMMSS,
  makeKey,
  money,
  safeNum,
  translateOrderingMode,
  translateStatus,
  translateTableServiceMode,
} from "../../hooks/public/publicMenu.utils";

import {
  Badge,
  CategoryChip,
  Collapse,
  FullOverlay,
  Modal,
  PillButton,
  ProductThumb,
  SearchBar,
  SkeletonCard,
} from "./publicMenu.ui";

import { usePublicMenuLoader } from "../../hooks/public/usePublicMenuLoader";
import { useActiveMenuPayload } from "../../hooks/public/useActiveMenuPayload";
import { useTableQrSession } from "../../hooks/public/useTableQrSession";
import { useMenuProducts } from "../../hooks/public/useMenuProducts";
import { useCartAndOrder } from "../../hooks/public/useCartAndOrder";
import { useCompositeDrafts } from "../../hooks/public/useCompositeDrafts";

export default function PublicMenuEntryPage() {
  const { token } = useParams();

  // filtros UI
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState(() => new Set());

  // carga/polling
  const {
    loading,
    errorMsg,
    data,
    load,
    webChannelId,
    setWebChannelId,
    callLocked,
    setCallLocked,
  } = usePublicMenuLoader({ token });

  // payload activo + derivados
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
      setExpanded(new Set());
      composite.resetCompositeDrafts();
      cartOrder.resetOnChannelChange();
    },
    setCallLocked,
  });

  // sesión QR
  const qr = useTableQrSession({ activeMenuPayload, hasTable, tableId });

  const uiFlags = ui || {};
  const canSelect = !!ui?.can_select_products && ui?.ui_mode === "selectable";
  const showSelectBtn = !!ui?.show_select_button && canSelect;
  const showCallBtn =
    !!ui?.show_call_waiter_button && !!ui?.call_waiter_enabled && hasTable;

  const orderingMode = String(header?.orderingMode || "");

  // ✅ carrito + orden (Laravel: create / show / append-items)
  const cartOrder = useCartAndOrder({
    token,
    canSelect,
    hasTable,
    sessionActive: qr.sessionActive,
    orderingMode,
    sessionBusy: qr.sessionBusy,
    sessionUnavailable: qr.sessionUnavailable,
  });

  // ✅ Hook de componentes (composite drafts)
  const composite = useCompositeDrafts({ cartOrder });

  // productos + filtrado
  const { categoryNameById, categoryOptions, filteredProducts } = useMenuProducts({
    sections,
    categoryFilter,
    q,
    expanded,
  });

  // =========================================================
  // ✅ FIX REAL: tu TableSession público NO trae order_status,
  // solo trae order_id. Entonces: si hay order_id, cargamos
  // SIEMPRE el GET /public/orders/{order} para traer items viejos.
  // =========================================================
  const lastLoadedOrderIdRef = useRef(null);

  useEffect(() => {
    const sessionOrderId = Number(qr?.session?.order_id || 0);
    const sessionStatus = String(qr?.session?.status || "");

    // Solo intentamos si hay sesión válida y tiene order_id
    if (!sessionOrderId) return;

    // Si expiró, no tiene caso spamear.
    if (sessionStatus === "expired") return;

    // Evitar refetch infinito
    if (lastLoadedOrderIdRef.current === sessionOrderId) {
      if (Array.isArray(cartOrder.oldItems) && cartOrder.oldItems.length > 0) return;
    }

    lastLoadedOrderIdRef.current = sessionOrderId;

    cartOrder
      .refreshOrder?.(sessionOrderId)
      .catch(() => {
        lastLoadedOrderIdRef.current = null;
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qr?.session?.order_id, qr?.session?.status]);

  // Mantener sincronización por status si tu hook lo usa (no estorba)
  useEffect(() => {
    cartOrder.syncOrderStatusFromSession?.(qr.sessionOrderStatus)?.catch?.(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qr.sessionOrderStatus]);

  // =========================================
  // Permisos de envío (flujo correcto)
  // =========================================
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
    String(cartOrder.activeOrder?.status || "").toLowerCase() === "open";

  const allowSendButton = allowBaseSend && (canAppend || !hasPending);

  // Expand keys
  const togglePanel = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
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

  // UI states
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
                {isWrongModeMsg ? "QR inválido" : isQrDisabledMsg ? "Menú no disponible" : "No se pudo cargar el menú"}
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
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>Esto no debería pasar… pero aquí estamos.</div>
        </div>
      </div>
    );
  }

  const pending = hasPending;

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "18px auto",
        padding: 16,
        background: "linear-gradient(180deg, rgba(238,242,255,0.55), rgba(255,255,255,0))",
      }}
    >
      {/* OVERLAYS */}
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

      {/* ✅ NUEVO: takeover / retomar cuenta */}
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

      {/* ✅ NUEVO: esperando aprobación */}
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

      {/* ✅ NUEVO: rechazado */}
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

      {/* MODAL: Enviar comanda (solo PRIMER ENVÍO, nunca para append) */}
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
            <strong>{money(cartOrder.cartTotal)}</strong>
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

      {/* HEADER CARD */}
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
            <div style={{ fontSize: 18, fontWeight: 950 }}>{header?.restaurantName}</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>
              <strong>{header?.branchName}</strong> · {header?.channelName}
              {header?.tableName ? ` · Mesa ${header.tableName}` : " · General"}
            </div>

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

            <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge tone={header?.restaurantStatus === "active" ? "ok" : "warn"}>
                Restaurante: {translateStatus(header?.restaurantStatus)}
              </Badge>
              <Badge tone={header?.branchStatus === "active" ? "ok" : "warn"}>
                Sucursal: {translateStatus(header?.branchStatus)}
              </Badge>
              <Badge tone={badgeUi.tone} title={uiFlags?.reason || ""}>
                {badgeUi.label}
              </Badge>
              <Badge tone="dark" title="Se actualiza cada 15s si la pestaña está visible">
                🔁 Auto
              </Badge>

              {hasTable && String(activeMenuPayload?.type) === "physical" ? (
                <Badge
                  tone={qr.sessionActive ? "ok" : "warn"}
                  title={qr.sessionActive ? "Sesión activa (5 min)" : "Sesión no activa"}
                >
                  ⏳ {fmtMMSS(qr.remainingSec)}
                </Badge>
              ) : null}

              {/* Estado orden */}
              {orderingMode === "customer_assisted" && hasTable ? (
                canAppend ? (
                  <Badge tone="ok" title="Orden abierta: puedes agregar productos">
                    ✅ Orden abierta
                  </Badge>
                ) : pending ? (
                  <Badge tone="warn" title="Esperando aprobación del mesero">
                    ⏳ Comanda en espera
                  </Badge>
                ) : null
              ) : null}

              {callLocked ? (
                <Badge tone="warn" title="El mesero ya atendió. Botón desactivado hasta finalizar.">
                  🔕 Llamada desactivada
                </Badge>
              ) : null}
            </div>

            {(header?.orderingMode || header?.tableServiceMode) && (
              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
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
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "start", flexWrap: "wrap" }}>
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
          </div>
        </div>

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

            {canSelect ? (
              <Badge tone="ok" title="Items nuevos por enviar/agregar">
                En comanda: <strong style={{ marginLeft: 6 }}>{cartOrder.cart.length}</strong>
              </Badge>
            ) : null}

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

      {/* warning por canal */}
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

      {/* ✅ LAYOUT: Productos (izq) + Comanda (der) */}
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
          {/* IZQUIERDA: GRID PRODUCTOS */}
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
                                              disabled={!canSelect}
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
                                            disabled={!canSelect || c.included === false}
                                            style={{
                                              width: "100%",
                                              padding: "10px 12px",
                                              borderRadius: 12,
                                              border: "1px solid rgba(0,0,0,0.12)",
                                              outline: "none",
                                              fontWeight: 850,
                                              background: "#fff",
                                              opacity: !canSelect || c.included === false ? 0.65 : 1,
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
                                          Este componente permite variante, pero no hay variantes disponibles para este canal.
                                        </div>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>
                            </Collapse>
                          </div>
                        ) : null}

                        {showSelectBtn ? (
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
                            title={!canSelect ? "Solo lectura" : isComposite ? "Agregar compuesto con componentes" : "Agregar a comanda"}
                            disabled={!canSelect}
                          >
                            {baseInCart ? "✅ Agregado" : "➕ Seleccionar"}
                          </PillButton>
                        ) : null}

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

                                      {showSelectBtn ? (
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
                                          title={!canSelect ? "Solo lectura" : "Agregar variante a comanda"}
                                          disabled={!canSelect}
                                        >
                                          {inCart ? "✅ Agregada" : "➕ Seleccionar variante"}
                                        </PillButton>
                                      ) : null}
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

          {/* DERECHA: COMANDA */}
          <div className="comandaAside">
            {(cartOrder.cart.length > 0 || (Array.isArray(cartOrder.oldItems) && cartOrder.oldItems.length > 0)) ? (
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
                      {canAppend
                        ? "Orden abierta: puedes agregar productos."
                        : "Se llena cuando seleccionas productos. Luego presiona Enviar."}
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
                      disabled={!allowSendButton || cartOrder.sending}
                      title={
                        pending
                          ? "Ya hay una comanda en espera de aprobación."
                          : orderingMode !== "customer_assisted"
                          ? "Esta sucursal no permite pedidos del cliente."
                          : !qr.sessionActive
                          ? "Sesión no activa."
                          : !canSelect
                          ? "Menú no seleccionable."
                          : canAppend
                          ? "Agregar productos a la orden abierta"
                          : "Enviar comanda"
                      }
                    >
                      {cartOrder.sending ? "⏳ Enviando..." : canAppend ? "➕ Agregar" : "📤 Enviar"}
                    </PillButton>
                  </div>
                </div>

                {/* Badges de estado */}
                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {canAppend ? (
                    <Badge tone="ok">✅ Orden abierta</Badge>
                  ) : pending ? (
                    <Badge tone="warn">⏳ En espera de aprobación</Badge>
                  ) : null}

                  {Array.isArray(cartOrder.oldItems) && cartOrder.oldItems.length > 0 ? (
                    <Badge tone="dark" title="Historial (solo lectura)">
                      Historial: <strong style={{ marginLeft: 6 }}>{cartOrder.oldItems.length}</strong>
                    </Badge>
                  ) : null}

                  <Badge tone={cartOrder.cart.length > 0 ? "ok" : "warn"} title="Items nuevos por enviar/agregar">
                    Nuevos: <strong style={{ marginLeft: 6 }}>{cartOrder.cart.length}</strong>
                  </Badge>
                </div>

                {/* HISTORIAL */}
                {Array.isArray(cartOrder.oldItems) && cartOrder.oldItems.length > 0 ? (
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