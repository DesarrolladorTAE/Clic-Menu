import React from "react";
import { Modal, PillButton } from "../../../pages/public/publicMenu.ui";

export default function PublicSendOrderModal({
  open,
  sending,
  allowBaseSend,
  pending,
  canAppend,
  customerName,
  setCustomerName,
  partySize,
  setPartySize,
  adultCount,
  setAdultCount,
  childCount,
  setChildCount,
  cartCount,
  cartTotal,
  sendToast,
  onClose,
  onSubmit,
}) {
  return (
    <Modal
      open={open}
      title="Enviar comanda"
      onClose={() => {
        if (!sending) onClose?.();
      }}
      actions={
        <>
          <PillButton
            tone="default"
            disabled={sending}
            onClick={onClose}
            title="Cancelar"
          >
            Cancelar
          </PillButton>

          <PillButton
            tone="orange"
            disabled={sending || !allowBaseSend || pending || canAppend}
            onClick={onSubmit}
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
            {sending ? "⏳ Mandando..." : "📨 Mandar"}
          </PillButton>
        </>
      }
    >
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ fontSize: 13, opacity: 0.85 }}>
          Escribe tu nombre y captura cuántas personas están ocupando la mesa.
        </div>

        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Ej: Juan (Mesa 5)"
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.12)",
            outline: "none",
            fontWeight: 850,
            width: "100%",
          }}
          maxLength={120}
          disabled={sending}
        />

        <div
          style={{
            display: "grid",
            gap: 10,
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          }}
        >
          <input
            type="number"
            min="1"
            step="1"
            value={partySize}
            onChange={(e) => setPartySize(e.target.value)}
            placeholder="Total personas"
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              outline: "none",
              fontWeight: 850,
              width: "100%",
            }}
            disabled={sending}
          />

          <input
            type="number"
            min="0"
            step="1"
            value={adultCount}
            onChange={(e) => setAdultCount(e.target.value)}
            placeholder="Adultos"
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              outline: "none",
              fontWeight: 850,
              width: "100%",
            }}
            disabled={sending}
          />

          <input
            type="number"
            min="0"
            step="1"
            value={childCount}
            onChange={(e) => setChildCount(e.target.value)}
            placeholder="Niños"
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              outline: "none",
              fontWeight: 850,
              width: "100%",
            }}
            disabled={sending}
          />
        </div>

        <div
          style={{
            border: "1px solid rgba(0,0,0,0.10)",
            borderRadius: 14,
            padding: 10,
            background: "#fff",
            fontSize: 12.5,
            lineHeight: 1.5,
            opacity: 0.88,
          }}
        >
          <strong>Nota:</strong> Si no hay adultos o niños, ingresa 0. No dejes campos vacíos.
        </div>

        <div style={{ fontSize: 12, opacity: 0.75 }}>
          Items: <strong>{cartCount}</strong> · Total aprox:{" "}
          <strong>
            {Number(cartTotal || 0).toLocaleString("es-MX", {
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

        {sendToast ? (
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
            {sendToast}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}