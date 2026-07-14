// Drawer y panel de comanda del menú público, incluyendo pedir cuenta.

import React from "react";

import MenuCartPanel from "../../../components/menu/shared/MenuCartPanel";
import MenuCartDrawer from "../../../components/menu/shared/MenuCartDrawer";
import { PillButton } from "../publicMenu.ui";

export default function PublicMenuCartDrawerBlock({
  open,
  onClose,
  cartOrder,
  cartDrawerItemCount,
  canAppend,
  pending,
  allowSendButton,

  billRequesting,
  billToast,
  canRequestBill,
  requestBillReason,
  billAlreadySent,
  billRequestStatus,
  showBillButton,
  onRequestBill,
}) {
  const orderStatus = String(
    cartOrder?.activeOrder?.status || "",
  ).toLowerCase();

  /*
   * El estado confirmado de la orden tiene prioridad
   * sobre cualquier estado anterior de solicitud.
   */
  const isPaymentInProgress =
    orderStatus === "paying";

  const effectiveCanAppend =
    !isPaymentInProgress && Boolean(canAppend);

  const effectivePending =
    !isPaymentInProgress && Boolean(pending);

  const effectiveShowBillButton =
    !isPaymentInProgress && Boolean(showBillButton);

  const effectiveCanRequestBill =
    effectiveShowBillButton && Boolean(canRequestBill);

  const effectiveBillAlreadySent =
    effectiveShowBillButton && Boolean(billAlreadySent);

  const effectiveBillRequestStatus =
    effectiveShowBillButton
      ? String(billRequestStatus || "")
      : "";

  const effectiveRequestBillReason =
    effectiveShowBillButton
      ? String(requestBillReason || "")
      : "";

  /*
   * Durante paying no se pasan mensajes de etapas anteriores.
   */
  const visibleSendToast =
    isPaymentInProgress
      ? ""
      : String(cartOrder?.sendToast || "");

  const visibleBillToast =
    isPaymentInProgress
      ? ""
      : String(billToast || "");

  const drawerSubtitle = isPaymentInProgress
    ? "Consulta el detalle de tu comanda."
    : effectiveCanAppend
      ? "Orden abierta: puedes agregar productos."
      : "Revisa los productos seleccionados antes de enviar.";

  const panelSubtitle = isPaymentInProgress
    ? "Consulta los productos incluidos en tu comanda."
    : effectiveCanAppend
      ? "Orden abierta: puedes agregar productos."
      : "Se llena cuando seleccionas productos. Luego presiona Enviar.";

  return (
    <MenuCartDrawer
      open={open}
      onClose={onClose}
      title="Comanda"
      subtitle={drawerSubtitle}
      itemCount={cartDrawerItemCount}
      total={
        cartOrder.displayTotal ??
        cartOrder.totalGlobal
      }
      totalLabel={cartOrder.totalLabel}
      isEstimated={cartOrder.isEstimated}
      disabledClose={
        cartOrder.sending ||
        (effectiveShowBillButton && billRequesting)
      }
    >
      <MenuCartPanel
        title="Comanda"
        subtitle={panelSubtitle}
        customerName={
          cartOrder?.activeOrder?.id
            ? cartOrder.activeOrder?.customer_name || ""
            : ""
        }
        total={
          cartOrder.displayTotal ??
          cartOrder.totalGlobal
        }
        pricingSummary={cartOrder.pricingSummary}
        oldItems={cartOrder.oldItems}
        newItems={cartOrder.cart}
        sendToast={visibleSendToast}
        sending={cartOrder.sending}
        canAppend={effectiveCanAppend}
        canSubmit={
          !isPaymentInProgress && Boolean(allowSendButton)
        }
        showPaymentMessage={isPaymentInProgress}
        onEmpty={() => cartOrder.setCart([])}
        onSubmit={() => {
          cartOrder.submitOrderOrAppend();
        }}
        onQtyChange={cartOrder.setCartQty}
        onNotesChange={cartOrder.setCartNotes}
        onRemove={cartOrder.removeCartItem}
        statusBadges={[
          ...(effectiveCanAppend
            ? [
                {
                  tone: "ok",
                  label: "✅ Orden abierta",
                },
              ]
            : []),

          ...(!effectiveCanAppend && effectivePending
            ? [
                {
                  tone: "warn",
                  label: "⏳ En espera de aprobación",
                },
              ]
            : []),

          ...(Array.isArray(cartOrder.oldItems) &&
          cartOrder.oldItems.length > 0
            ? [
                {
                  tone: "dark",
                  label: `Historial: ${cartOrder.oldItems.length}`,
                  title: "Historial (solo lectura)",
                },
              ]
            : []),

          {
            tone: cartOrder.cart.length > 0 ? "ok" : "warn",
            label: `Nuevos: ${cartOrder.cart.length}`,
          },

          ...(effectiveShowBillButton
            ? [
                {
                  tone: effectiveBillAlreadySent
                    ? "dark"
                    : effectiveCanRequestBill
                      ? "ok"
                      : "warn",

                  label: effectiveBillAlreadySent
                    ? `🧾 Aviso enviado${
                        effectiveBillRequestStatus
                          ? ` (${effectiveBillRequestStatus})`
                          : ""
                      }`
                    : effectiveCanRequestBill
                      ? "🧾 Puedes pedir cuenta"
                      : "🧾 Aún no disponible",

                  title:
                    effectiveRequestBillReason ||
                    "Estado del flujo para pedir cuenta",
                },
              ]
            : []),
        ]}
        requestBillBlock={
          effectiveShowBillButton ? (
            <div style={{ display: "grid", gap: 8 }}>
              <PillButton
                tone="soft"
                onClick={onRequestBill}
                disabled={
                  billRequesting ||
                  !effectiveCanRequestBill
                }
                title={
                  effectiveCanRequestBill
                    ? "Enviar solicitud de cuenta al mesero"
                    : effectiveRequestBillReason ||
                      "La orden aún no puede solicitar cuenta"
                }
              >
                {billRequesting
                  ? "⏳ Solicitando..."
                  : "🧾 Pedir cuenta"}
              </PillButton>

              {effectiveRequestBillReason &&
              !effectiveCanRequestBill ? (
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
                  {effectiveRequestBillReason}
                </div>
              ) : null}

              {visibleBillToast ? (
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
                  {visibleBillToast}
                </div>
              ) : null}
            </div>
          ) : null
        }
      />
    </MenuCartDrawer>
  );
}