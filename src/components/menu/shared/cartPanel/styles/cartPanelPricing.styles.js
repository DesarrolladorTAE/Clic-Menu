export const cartPanelPricingStyles = `
/* =========================
          Promotion prices
        ========================= */

        .cm-price-stack {
          display: flex;
          align-items: baseline;
          gap: 8px;
          flex-wrap: wrap;
          min-width: 0;
        }

        .cm-price-original {
          color: #8A8493;
          font-size: 12px;
          font-weight: 800;
          text-decoration: line-through;
          text-decoration-thickness: 1.5px;
          white-space: nowrap;
        }

        .cm-price-promotional {
          color: #D45D00;
          font-size: 14px;
          font-weight: 950;
          white-space: nowrap;
        }

        .cm-promotion-badge {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          max-width: 100%;
          padding: 4px 9px;
          border-radius: 999px;
          border: 1px solid rgba(15, 118, 110, 0.22);
          background: rgba(15, 118, 110, 0.09);
          color: #0F766E;
          font-size: 10px;
          font-weight: 950;
          line-height: 1.2;
          word-break: break-word;
        }

        .cm-promotion-badge-quantity {
          border-color: rgba(109, 40, 217, 0.22);
          background: rgba(109, 40, 217, 0.09);
          color: #6D28D9;
        }

        .cm-promotion-caption {
          margin-top: 6px;
          color: #6E6A6A;
          font-size: 11px;
          font-weight: 750;
          line-height: 1.4;
        }

        /* =========================
          Discount per order line
        ========================= */

        .cm-line-discount {
          display: grid;
          gap: 4px;
          margin-top: 7px;
          padding: 7px 9px;
          border: 1px solid rgba(15, 118, 110, 0.16);
          border-radius: 12px;
          background: rgba(15, 118, 110, 0.06);
        }

        /*
        * Cuando el detalle está en la fila completa de la tabla,
        * ocupa todo el ancho y elimina el margen superior duplicado.
        */
        .cm-pricing-detail-cell .cm-line-discount {
          width: 100%;
          max-width: 100%;
          margin: 0;
          box-sizing: border-box;
        }

        .cm-line-discount-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .cm-line-discount-label {
          min-width: 0;
          color: #46605D;
          font-size: 11px;
          font-weight: 800;
          line-height: 1.35;
        }

        .cm-line-discount-value {
          color: #0F766E;
          font-size: 11px;
          font-weight: 950;
          line-height: 1.35;
          text-align: right;
          white-space: nowrap;
        }

        .cm-applied-promotions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 7px;
        }

        /*
        * En la fila secundaria de la tabla, las promociones
        * se muestran a todo el ancho.
        */
        .cm-pricing-detail-cell .cm-applied-promotions {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 6px;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          margin: 0;
          box-sizing: border-box;
        }

        .cm-applied-promotion {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          max-width: 100%;
          padding: 4px 8px;
          border-radius: 999px;
          border: 1px solid rgba(15, 118, 110, 0.18);
          background: #F0FDFA;
          color: #0F766E;
          font-size: 10px;
          font-weight: 900;
          line-height: 1.25;
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .cm-pricing-detail-cell .cm-applied-promotion {
          display: flex;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          padding: 7px 10px;
          border-radius: 12px;
          box-sizing: border-box;
        }

        /* =========================
          Pricing summary
        ========================= */

        .cm-pricing-summary {
          display: grid;
          gap: 8px;
          margin-top: 14px;
          padding: 11px;
          border: 1px solid rgba(47,42,61,0.10);
          border-radius: 17px;
          background: #FFFFFF;
          box-shadow: 0 8px 18px rgba(47,42,61,0.035);
        }

        .cm-pricing-summary-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }

        .cm-pricing-summary-title {
          color: #3F3A52;
          font-size: 13px;
          font-weight: 950;
          line-height: 1.3;
        }

        .cm-pricing-state {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          padding: 4px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 950;
          line-height: 1.2;
        }

        .cm-pricing-state-estimated {
          border: 1px solid rgba(180, 83, 9, 0.20);
          background: rgba(245, 158, 11, 0.10);
          color: #B45309;
        }

        .cm-pricing-state-confirmed {
          border: 1px solid rgba(21, 128, 61, 0.20);
          background: rgba(22, 163, 74, 0.09);
          color: #15803D;
        }

        .cm-pricing-summary-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        .cm-pricing-summary-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          min-width: 0;
          padding: 8px 9px;
          border: 1px solid rgba(47,42,61,0.08);
          border-radius: 12px;
          background: #FBF8F8;
        }

        .cm-pricing-summary-label {
          min-width: 0;
          color: #6E6A6A;
          font-size: 11px;
          font-weight: 800;
          line-height: 1.35;
        }

        .cm-pricing-summary-value {
          color: #3F3A52;
          font-size: 12px;
          font-weight: 950;
          line-height: 1.35;
          text-align: right;
          white-space: nowrap;
        }

        .cm-pricing-summary-row-discount {
          border-color: rgba(15, 118, 110, 0.14);
          background: rgba(15, 118, 110, 0.05);
        }

        .cm-pricing-summary-row-discount .cm-pricing-summary-value {
          color: #0F766E;
        }

        .cm-pricing-summary-row-total {
          grid-column: 1 / -1;
          border-color: rgba(255, 152, 0, 0.22);
          background: rgba(255, 152, 0, 0.08);
        }

        .cm-pricing-summary-row-total .cm-pricing-summary-label {
          color: #8A4B08;
          font-size: 12px;
          font-weight: 950;
        }

        .cm-pricing-summary-row-total .cm-pricing-summary-value {
          color: #D45D00;
          font-size: 15px;
        }

        .cm-pricing-summary-secondary {
          display: grid;
          gap: 4px;
          padding-top: 8px;
          border-top: 1px dashed rgba(47,42,61,0.12);
          color: #6E6A6A;
          font-size: 11px;
          font-weight: 750;
          line-height: 1.4;
        }

        .cm-pricing-summary-secondary strong {
          color: #0F766E;
          font-weight: 950;
          white-space: nowrap;
        }

        .cm-pricing-summary-note {
          padding: 9px 10px;
          border-radius: 13px;
          font-size: 11px;
          font-weight: 800;
          line-height: 1.45;
        }

        .cm-pricing-summary-note-estimated {
          border: 1px solid rgba(180, 83, 9, 0.16);
          background: rgba(245, 158, 11, 0.08);
          color: #92400E;
        }

        .cm-pricing-summary-note-confirmed {
          border: 1px solid rgba(21, 128, 61, 0.16);
          background: rgba(22, 163, 74, 0.07);
          color: #166534;
        }
`;