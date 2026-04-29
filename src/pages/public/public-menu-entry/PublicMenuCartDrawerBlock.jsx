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
  return (
    <MenuCartDrawer
      open={open}
      onClose={onClose}
      title="Comanda"
      subtitle={
        canAppend
          ? "Orden abierta: puedes agregar productos."
          : "Revisa los productos seleccionados antes de enviar."
      }
      itemCount={cartDrawerItemCount}
      total={cartOrder.totalGlobal}
      disabledClose={cartOrder.sending || billRequesting}
    >
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
        showPaymentMessage={
          !!cartOrder?.activeOrder?.customer_ui?.show_payment_message
        }
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
          ...(!canAppend && pending
            ? [{ tone: "warn", label: "⏳ En espera de aprobación" }]
            : []),
          ...(Array.isArray(cartOrder.oldItems) && cartOrder.oldItems.length > 0
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
                        ? `🧾 Aviso enviado${
                            billRequestStatus ? ` (${billRequestStatus})` : ""
                          }`
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
                onClick={onRequestBill}
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
    </MenuCartDrawer>
  );
}