// Drawer y panel de comanda del menú público, incluyendo pedir cuenta.

import React from "react";

import MenuCartPanel from "../../../components/menu/shared/MenuCartPanel";
import MenuCartDrawer from "../../../components/menu/shared/MenuCartDrawer";
import OrderCancellationSelection, {
  getOrderCancellationSelectableItems,
} from "../../../components/menu/shared/cancellation/OrderCancellationSelection";
import { PillButton } from "../publicMenu.ui";

export default function PublicMenuCartDrawerBlock({
  open,
  onClose,
  cartOrder,
  cartDrawerItemCount,
  canAppend,
  pending,
  allowSendButton,
  hasInvalidItems,
  invalidItemsCount,
  submitBlockReason,
  themeColor,

  cancellationEnabled = false,
  onCancellationContinue,

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

  const effectivePending = !isPaymentInProgress && Boolean(pending);

  const effectiveHasInvalidItems =
    !isPaymentInProgress && Boolean(hasInvalidItems);

  const effectiveInvalidItemsCount = effectiveHasInvalidItems
    ? Math.max(0, Number(invalidItemsCount || 0))
    : 0;

  const effectiveSubmitBlockReason = effectiveHasInvalidItems
    ? String(submitBlockReason || "").trim()
    : "";

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

  const cancellationActive =
    !isPaymentInProgress &&
    Boolean(cancellationEnabled) &&
    Boolean(cartOrder?.cancellationActive);

  const cancellationSelectableItems = getOrderCancellationSelectableItems(
    cartOrder?.oldItems,
  );

  const pendingCancellation =
    !isPaymentInProgress && cancellationEnabled
      ? cartOrder?.pendingCancellation || null
      : null;

  const pendingCancellationType = String(
    pendingCancellation?.type || "",
  ).toLowerCase();

  const pendingCancellationLabel =
    pendingCancellationType === "full"
      ? "⏳ Cancelación de comanda solicitada"
      : "⏳ Cancelación solicitada";

  const canStartCancellation =
    Boolean(cancellationEnabled) &&
    Boolean(cartOrder?.canRequestCancellation) &&
    cancellationSelectableItems.length > 0 &&
    !pendingCancellation;

  const drawerTitle = cancellationActive
    ? "Solicitar cancelación"
    : "Comanda";

  const drawerSubtitle = cancellationActive
    ? "Selecciona los productos de la comanda que deseas cancelar."
    : isPaymentInProgress
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
      title={drawerTitle}
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
        cartOrder.cancellationSubmitting ||
        (effectiveShowBillButton && billRequesting)
      }
    >
      {cancellationActive ? (
        <div style={{ display: "grid", gap: 10 }}>
          {cartOrder.cancellationError ? (
            <div
              role="alert"
              style={{
                border: "1px solid rgba(239,68,68,0.24)",
                borderRadius: 14,
                padding: "10px 12px",
                background: "rgba(239,68,68,0.06)",
                color: "#B91C1C",
                fontSize: 12,
                fontWeight: 850,
                whiteSpace: "pre-line",
              }}
            >
              {cartOrder.cancellationError}
            </div>
          ) : null}

          <OrderCancellationSelection
            items={cancellationSelectableItems}
            selection={cartOrder.cancellationSelection}
            disabled={cartOrder.cancellationSubmitting}
            onExit={cartOrder.exitCancellation}
            onToggleItem={cartOrder.toggleCancellationItem}
            onQuantityChange={cartOrder.setCancellationQuantity}
            onContinue={onCancellationContinue}
          />
        </div>
      ) : (
        <MenuCartPanel
          title="Comanda"
          subtitle={panelSubtitle}
          themeColor={themeColor}
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
            !isPaymentInProgress &&
            !effectiveHasInvalidItems &&
            Boolean(allowSendButton)
          }
          hasInvalidItems={effectiveHasInvalidItems}
          invalidItemsCount={effectiveInvalidItemsCount}
          submitBlockReason={effectiveSubmitBlockReason}
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

            ...(pendingCancellation
              ? [
                  {
                    tone: "warn",
                    label: pendingCancellationLabel,
                    title: "Solicitud de cancelación pendiente",
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

          extraTopActions={
            canStartCancellation ? (
              <div className="cm-cancellation-action">
                <PillButton
                  tone="terracotta"
                  disabled={cartOrder.cancellationSubmitting}
                  onClick={cartOrder.startCancellation}
                  title="Solicitar la cancelación de productos de la comanda"
                >
                  Solicitar cancelación
                </PillButton>
              </div>
            ) : null
          }

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
      )}
    </MenuCartDrawer>
  );
}