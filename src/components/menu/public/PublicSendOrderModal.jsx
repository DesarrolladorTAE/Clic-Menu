import React from "react";
import { money } from "../../../hooks/public/publicMenu.utils";
import { Modal, PillButton } from "../../../pages/public/publicMenu.ui";

function toDisplayAmount(value, fallback = 0) {
  const number = Number(value);

  if (Number.isFinite(number)) {
    return number;
  }

  const fallbackNumber = Number(fallback);

  return Number.isFinite(fallbackNumber)
    ? fallbackNumber
    : 0;
}

function NewItemsPricingPreview({
  summary,
  fallbackCount = 0,
  fallbackTotal = 0,
  approximateTotal,
  hasQuantityPromotion,
}) {
  const data =
    summary && typeof summary === "object"
      ? summary
      : {};

  const lines = Array.isArray(data?.lines)
    ? data.lines
    : [];

  const resolvedProductCount = Number.isFinite(
    Number(data?.lineCount),
  )
    ? Number(data.lineCount)
    : Number(fallbackCount || 0);

  const subtotalReference = toDisplayAmount(
    data?.grossSubtotalReference,
    fallbackTotal,
  );

  const promotionPreview = toDisplayAmount(
    data?.promotionDiscountPreview,
    0,
  );

  const explicitApproximateTotal = Number(
    approximateTotal,
  );

  const summaryApproximateTotal = Number(
    data?.totalApproximate,
  );

  const resolvedApproximateTotal =
    Number.isFinite(explicitApproximateTotal)
      ? explicitApproximateTotal
      : Number.isFinite(summaryApproximateTotal)
        ? summaryApproximateTotal
        : toDisplayAmount(fallbackTotal, 0);

  const unresolvedQuantityPromotion =
    typeof hasQuantityPromotion === "boolean"
      ? hasQuantityPromotion
      : Boolean(
          data?.hasUnresolvedQuantityPromotions ||
          data?.hasQuantityPromotions,
        );

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        border: "1px solid rgba(47,42,61,0.10)",
        borderRadius: 16,
        padding: 12,
        background: "#FFFFFF",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "#3F3A52",
              fontSize: 13,
              fontWeight: 950,
            }}
          >
            Productos por enviar
          </div>

          <div
            style={{
              marginTop: 3,
              color: "#6E6A6A",
              fontSize: 11,
              fontWeight: 750,
            }}
          >
            {resolvedProductCount} producto
            {resolvedProductCount === 1 ? "" : "s"} seleccionado
            {resolvedProductCount === 1 ? "" : "s"}
          </div>
        </div>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 9px",
            borderRadius: 999,
            border: "1px solid rgba(180,83,9,0.20)",
            background: "rgba(245,158,11,0.10)",
            color: "#B45309",
            fontSize: 10,
            fontWeight: 950,
          }}
        >
          Aproximado
        </span>
      </div>

      {lines.length > 0 ? (
        <div
          style={{
            display: "grid",
            gap: 8,
          }}
        >
          {lines.map((line, index) => {
            const promotion =
              line?.promotion &&
              typeof line.promotion === "object"
                ? line.promotion
                : {};

            const productName =
              line?.name ||
              `Producto #${line?.productId || index + 1}`;

            const lineLabel = line?.variantName
              ? `${productName} · ${line.variantName}`
              : productName;

            const hasPromotion = Boolean(
              promotion?.hasActivePromotion,
            );

            const isQuantityPromotion = Boolean(
              promotion?.isQuantityPromotion,
            );

            const showPromotionalPrice =
              hasPromotion &&
              !isQuantityPromotion &&
              Boolean(
                promotion?.hasImmediatePricePreview,
              );

            return (
              <div
                key={line?.key || `preview-${index}`}
                style={{
                  display: "grid",
                  gap: 7,
                  padding: "10px 11px",
                  borderRadius: 13,
                  border: "1px solid rgba(47,42,61,0.08)",
                  background: "#FBF8F8",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        color: "#3F3A52",
                        fontSize: 12,
                        fontWeight: 900,
                        lineHeight: 1.35,
                      }}
                    >
                      {lineLabel}
                    </div>

                    <div
                      style={{
                        marginTop: 3,
                        color: "#6E6A6A",
                        fontSize: 11,
                        fontWeight: 750,
                      }}
                    >
                      Cantidad:{" "}
                      <strong>{line?.quantity || 0}</strong>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      justifyItems: "end",
                      gap: 3,
                      flexShrink: 0,
                    }}
                  >
                    {showPromotionalPrice ? (
                      <>
                        <span
                          style={{
                            color: "#8A8493",
                            fontSize: 11,
                            fontWeight: 800,
                            textDecoration: "line-through",
                            textDecorationThickness: "1.5px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {money(
                            promotion?.originalPrice,
                          )}
                        </span>

                        <span
                          style={{
                            color: "#D45D00",
                            fontSize: 13,
                            fontWeight: 950,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {money(
                            promotion?.displayPrice,
                          )}
                        </span>
                      </>
                    ) : (
                      <span
                        style={{
                          color: "#3F3A52",
                          fontSize: 12,
                          fontWeight: 950,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {money(
                          line?.unitPriceReference,
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {hasPromotion &&
                promotion?.promotionLabel ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      width: "fit-content",
                      maxWidth: "100%",
                      padding: "4px 9px",
                      borderRadius: 999,
                      border: isQuantityPromotion
                        ? "1px solid rgba(109,40,217,0.22)"
                        : "1px solid rgba(15,118,110,0.22)",
                      background: isQuantityPromotion
                        ? "rgba(109,40,217,0.09)"
                        : "rgba(15,118,110,0.09)",
                      color: isQuantityPromotion
                        ? "#6D28D9"
                        : "#0F766E",
                      fontSize: 10,
                      fontWeight: 950,
                      lineHeight: 1.2,
                    }}
                  >
                    {promotion.promotionLabel}
                  </span>
                ) : null}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    color: "#6E6A6A",
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  <span>Importe aprox.</span>

                  <strong
                    style={{
                      color: "#3F3A52",
                    }}
                  >
                    {money(line?.lineTotalApproximate)}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gap: 7,
          paddingTop: lines.length > 0 ? 4 : 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            fontSize: 12,
            color: "#6E6A6A",
            fontWeight: 800,
          }}
        >
          <span>Subtotal de referencia</span>

          <strong
            style={{
              color: "#3F3A52",
            }}
          >
            {money(subtotalReference)}
          </strong>
        </div>

        {promotionPreview > 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              fontSize: 12,
              color: "#0F766E",
              fontWeight: 850,
            }}
          >
            <span>Promoción visual disponible</span>

            <strong>
              −{money(promotionPreview)}
            </strong>
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            paddingTop: 8,
            borderTop: "1px solid rgba(47,42,61,0.08)",
            color: "#8A4B08",
            fontSize: 13,
            fontWeight: 950,
          }}
        >
          <span>Total aproximado</span>

          <strong>
            {money(resolvedApproximateTotal)}
          </strong>
        </div>
      </div>

      {unresolvedQuantityPromotion ? (
        <div
          style={{
            border: "1px solid rgba(109,40,217,0.18)",
            borderRadius: 13,
            padding: "9px 10px",
            background: "rgba(109,40,217,0.07)",
            color: "#5B21B6",
            fontSize: 11,
            fontWeight: 850,
            lineHeight: 1.45,
          }}
        >
          La selección incluye una promoción por cantidad. El descuento exacto
          se confirmará al enviar la comanda.
        </div>
      ) : (
        <div
          style={{
            border: "1px solid rgba(180,83,9,0.16)",
            borderRadius: 13,
            padding: "9px 10px",
            background: "rgba(245,158,11,0.08)",
            color: "#92400E",
            fontSize: 11,
            fontWeight: 800,
            lineHeight: 1.45,
          }}
        >
          Los importes son una vista previa. El backend confirmará promociones
          y total al enviar la comanda.
        </div>
      )}
    </div>
  );
}

export default function PublicSendOrderModal({
  open,
  sending,
  tableSeats,
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

  newItemsPricingSummary = null,
  approximateTotal,
  hasQuantityPromotion,

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

        {tableSeats ? (
          <div
            style={{
              border: "1px solid rgba(255,122,0,0.24)",
              borderRadius: 14,
              padding: "10px 12px",
              background: "rgba(255,122,0,0.08)",
              fontSize: 13,
              fontWeight: 900,
              color: "#2F2A3D",
              lineHeight: 1.45,
            }}
          >
            Capacidad: {tableSeats} personas
          </div>
        ) : null}

        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Ej: Juan"
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

        <NewItemsPricingPreview
          summary={newItemsPricingSummary}
          fallbackCount={cartCount}
          fallbackTotal={cartTotal}
          approximateTotal={approximateTotal}
          hasQuantityPromotion={hasQuantityPromotion}
        />

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