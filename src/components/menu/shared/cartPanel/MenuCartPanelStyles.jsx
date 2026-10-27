import { cartPanelCancellationStyles } from "./styles/cartPanelCancellation.styles";
import { cartPanelPricingStyles } from "./styles/cartPanelPricing.styles";
import { cartPanelCompositeStyles } from "./styles/cartPanelComposite.styles";

export default function MenuCartPanelStyles() {
  return (
    <style>
      {`
        .cm-panel {
          border: 1px solid rgba(47,42,61,0.10);
          border-radius: 24px;
          background: rgba(255,255,255,0.94);
          padding: 14px;
          box-shadow: 0 18px 46px rgba(47,42,61,0.08);
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          container-type: inline-size;
          container-name: cm-cart;
        }

        .cm-header {
          display: grid;
          gap: 12px;
        }

        .cm-header-main {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          align-items: flex-start;
        }

        .cm-title {
          font-size: 17px;
          font-weight: 950;
          color: #2F2A3D;
          line-height: 1.15;
        }

        .cm-subtitle {
          font-size: 12px;
          color: #6E6A6A;
          margin-top: 4px;
          line-height: 1.35;
          font-weight: 750;
        }

        .cm-customer {
          font-size: 12px;
          color: #6E6A6A;
          margin-top: 7px;
        }

        .cm-actions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .cm-actions > button,
        .cm-cancellation-action > button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100% !important;
          max-width: none !important;
          min-width: 0;
          box-sizing: border-box;
        }

        .cm-cancellation-action {
          grid-column: 1 / -1;
          display: grid;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .cm-cancellation-action > * {
          width: 100% !important;
          max-width: none !important;
          min-width: 0;
          box-sizing: border-box;
        }

        .cm-section {
          margin-top: 14px;
          display: grid;
          gap: 9px;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .cm-section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          font-size: 12px;
          font-weight: 950;
          color: #3F3A52;
          text-transform: uppercase;
          letter-spacing: .04em;
        }

        .cm-table-wrap {
          width: 100%;
          max-width: 100%;
          overflow: hidden;
          border: 1px solid rgba(47,42,61,0.08);
          border-radius: 18px;
          background: #fff;
          box-sizing: border-box;
        }

        .cm-table {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          table-layout: fixed;
          border-collapse: separate;
          border-spacing: 0;
        }

        .cm-table th {
          text-align: left;
          padding: 10px 8px;
          font-size: 11px;
          color: #6E6A6A;
          background: #FBF8F8;
          border-bottom: 1px solid rgba(47,42,61,0.08);
          white-space: normal;
          line-height: 1.25;
        }

        .cm-table th:first-child,
        .cm-table td:first-child {
          width: auto;
          min-width: 0;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .cm-table th:nth-child(2),
        .cm-table td:nth-child(2) {
          width: 58px;
        }

        .cm-table th:nth-child(3),
        .cm-table td:nth-child(3) {
          width: 92px;
        }

        .cm-table th:nth-child(4),
        .cm-table td:nth-child(4) {
          width: 108px;
        }

        .cm-td {
          min-width: 0;
          padding: 10px 8px;
          border-top: 1px solid rgba(47,42,61,0.07);
          vertical-align: top;
          font-size: 12px;
          color: #3F3A52;
          box-sizing: border-box;
          overflow-wrap: anywhere;
        }

        .cm-table tbody tr:first-child .cm-td {
          border-top: none;
        }

        /* Fila secundaria del detalle promocional */
        .cm-pricing-detail-row {
          background: #FFFFFF;
        }

        .cm-pricing-detail-cell {
          width: 100%;
          max-width: 100%;
          padding: 0 8px 10px;
          border-top: none !important;
          background: #FFFFFF;
          box-sizing: border-box;
          overflow: visible;
        }

        .cm-confirmed-detail-stack {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 7px;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .cm-right {
          text-align: right;
          white-space: nowrap;
          font-weight: 900;
        }

        .cm-center {
          text-align: center;
          white-space: nowrap;
          font-weight: 900;
        }

        .cm-bold {
          font-weight: 950;
        }

        .cm-child {
          background: rgba(47,42,61,0.025);
          border-top: 1px dashed rgba(47,42,61,0.10);
        }

        .cm-combo {
          background: rgba(255,152,0,0.08);
        }

        .cm-prepared-badge {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          max-width: 100%;
          padding: 4px 8px;
          border-radius: 999px;
          border: 1px solid rgba(47,42,61,0.12);
          background: rgba(47,42,61,0.05);
          color: #5F5A6A;
          font-size: 10px;
          font-weight: 900;
          line-height: 1.15;
        }

        .cm-fixed-quantity {
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          padding: 0 10px;
          border-radius: 13px;
          border: 1px solid rgba(47,42,61,0.08);
          background: #FBF8F8;
          color: #3F3A52;
          font-size: 12px;
          font-weight: 950;
        }

        ${cartPanelCancellationStyles}

        .cm-note {
          font-size: 12px;
          color: #6E6A6A;
          margin-top: 7px;
          white-space: pre-line;
          line-height: 1.35;
        }

        .cm-qty {
          display: inline-flex;
          gap: 6px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(47,42,61,0.08);
          background: #FBF8F8;
          padding: 4px;
          border-radius: 16px;
        }

        .cm-qty-btn,
        .cm-icon-btn {
          cursor: pointer;
          border: 1px solid rgba(47,42,61,0.10);
          background: #fff;
          border-radius: 13px;
          min-width: 34px;
          height: 34px;
          padding: 0 9px;
          font-weight: 950;
          color: #3F3A52;
          box-shadow: 0 6px 14px rgba(47,42,61,0.04);
        }

        .cm-remove-btn {
          color: #B91C1C;
          background: #fff5f5;
          border-color: rgba(239,68,68,0.18);
        }

        .cm-qty-input {
          width: 42px;
          height: 34px;
          border-radius: 12px;
          border: 1px solid rgba(47,42,61,0.10);
          outline: none;
          text-align: center;
          font-weight: 950;
          color: #3F3A52;
          background: #fff;
          box-sizing: border-box;
        }

        .cm-mobile-list {
          display: none;
        }

        .cm-new-card-list {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 10px;
          width: 100%;
          min-width: 0;
        }

        .cm-mobile-card,
        .cm-new-card {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          border: 1px solid rgba(47,42,61,0.09);
          border-radius: 20px;
          background: #fff;
          padding: 12px;
          display: grid;
          gap: 10px;
          box-shadow: 0 10px 24px rgba(47,42,61,0.05);
        }

        .cm-new-card {
          background:
            radial-gradient(circle at top left, rgba(255,152,0,0.08), transparent 34%),
            #FFFFFF;
        }

        .cm-mobile-card-head,
        .cm-mobile-actions,
        .cm-new-card-top,
        .cm-new-controls {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .cm-new-card-top {
          align-items: flex-start;
        }

        .cm-new-info {
          flex: 1 1 auto;
          min-width: 0;
          max-width: 100%;
        }

        .cm-mobile-title,
        .cm-new-title {
          font-size: 14px;
          font-weight: 950;
          color: #3F3A52;
          line-height: 1.25;
          word-break: break-word;
        }

        .cm-mobile-sub,
        .cm-new-meta {
          margin-top: 4px;
          font-size: 12px;
          color: #6E6A6A;
          line-height: 1.35;
        }

        .cm-mobile-price {
          font-size: 13px;
          font-weight: 950;
          color: #FF9800;
          white-space: nowrap;
        }

        .cm-mini-label {
          font-size: 11px;
          font-weight: 950;
          color: #6E6A6A;
          text-transform: uppercase;
          letter-spacing: .04em;
          margin-bottom: 6px;
        }

        .cm-new-total-box {
          min-width: 106px;
          max-width: 100%;
          box-sizing: border-box;
          border-radius: 17px;
          border: 1px solid rgba(255,152,0,0.18);
          background: rgba(255,152,0,0.08);
          padding: 10px 11px;
          display: grid;
          gap: 3px;
          text-align: right;
        }

        .cm-new-total-box span {
          font-size: 11px;
          color: #9A4A00;
          font-weight: 900;
        }

        .cm-new-total-box strong {
          font-size: 14px;
          color: #FF9800;
          font-weight: 950;
          white-space: nowrap;
        }

        .cm-note-button-wrap {
          display: grid;
          gap: 7px;
        }

        .cm-note-btn {
          cursor: pointer;
          border: 1px solid rgba(47,42,61,0.10);
          background: #FFFFFF;
          color: #3F3A52;
          border-radius: 15px;
          min-height: 38px;
          padding: 0 12px;
          font-weight: 950;
          box-shadow: 0 8px 18px rgba(47,42,61,0.05);
          width: fit-content;
        }

        .cm-note-btn-active {
          border-color: rgba(255,152,0,0.26);
          background: rgba(255,152,0,0.08);
          color: #9A4A00;
        }

        .cm-note-preview {
          border: 1px solid rgba(47,42,61,0.08);
          background: #FBF8F8;
          color: #6E6A6A;
          border-radius: 14px;
          padding: 9px 10px;
          font-size: 12px;
          font-weight: 750;
          line-height: 1.35;
          white-space: pre-line;
          word-break: break-word;
        }

        .cm-children-list {
          display: grid;
          gap: 8px;
          margin-top: 2px;
        }

        .cm-child-card {
          padding: 10px;
          border-radius: 16px;
          background: #FBF8F8;
          border: 1px dashed rgba(47,42,61,0.10);
        }

        .cm-empty-history {
          margin-top: 12px;
          font-size: 13px;
          color: #6E6A6A;
          font-weight: 750;
          padding: 12px;
          border-radius: 16px;
          border: 1px dashed rgba(47,42,61,0.12);
          background: #FBF8F8;
        }

        ${cartPanelPricingStyles}

        /* =========================
          Nuevo / Historial
        ========================= */

        .cm-view-tabs {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          width: 100%;
          min-width: 0;
          margin-top: 14px;
        }

        .cm-view-tab {
          cursor: pointer;
          min-width: 0;
          min-height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 8px 10px;
          border: 1px solid rgba(47,42,61,0.10);
          border-radius: 14px;
          background: #FBF8F8;
          color: #6E6A6A;
          font-size: 12px;
          font-weight: 950;
          line-height: 1.2;
          box-sizing: border-box;
          transition: border-color 160ms ease, background 160ms ease, color 160ms ease;
        }

        .cm-view-tab:hover {
          border-color: rgba(47,42,61,0.18);
          background: #FFFFFF;
        }

        .cm-view-tab-active {
          border-color: var(--cm-cart-accent, #FF9800);
          background: color-mix(
            in srgb,
            var(--cm-cart-accent, #FF9800) 9%,
            #FFFFFF
          );
          color: #3F3A52;
          box-shadow: inset 0 -3px 0 var(--cm-cart-accent, #FF9800);
        }

        .cm-view-tab-count {
          min-width: 22px;
          height: 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 6px;
          border: 1px solid rgba(47,42,61,0.10);
          border-radius: 999px;
          background: #FFFFFF;
          color: #6E6A6A;
          font-size: 10px;
          font-weight: 950;
          box-sizing: border-box;
        }

        .cm-view-tab-active .cm-view-tab-count {
          border-color: var(--cm-cart-accent, #FF9800);
          background: var(--cm-cart-accent, #FF9800);
          color: #FFFFFF;
        }

        .cm-view-panel {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        /* =========================
          Cart section pagination
        ========================= */

        .cm-panel .cm-pagination-footer {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          margin-top: 2px;
          padding: 9px 10px !important;
          border: 1px solid rgba(47,42,61,0.08) !important;
          border-radius: 14px;
          background: #FBF8F8 !important;
          box-sizing: border-box;
        }

        .cm-panel .cm-pagination-footer > .MuiTypography-root {
          min-width: 0;
          font-size: 11px;
          overflow-wrap: anywhere;
        }

        .cm-panel .cm-pagination-controls {
          max-width: 100%;
          min-width: 0;
        }

        .cm-panel .cm-pagination-controls .MuiButton-root {
          min-width: 92px !important;
          height: 36px !important;
          padding-left: 10px;
          padding-right: 10px;
          font-size: 11px;
          font-weight: 850;
          box-sizing: border-box;
        }

        .cm-panel .cm-pagination-controls .MuiTypography-root {
          font-size: 11px;
        }

      /* =========================
          Conjuntos guardados
        ========================= */

        .cm-menu-set-history-row {
          background: #FFFFFF;
        }

        .cm-menu-set-history-cell {
          width: 100%;
          max-width: 100%;
          padding: 10px;
          border-top: 1px solid rgba(47,42,61,0.08);
          vertical-align: top;
          box-sizing: border-box;
        }

        .cm-menu-set-history-detail {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 9px;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .cm-menu-set-history-detail > article {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .cm-menu-set-history-state {
          width: 100%;
          min-width: 0;
          padding: 9px 11px;
          border: 1px solid rgba(47,42,61,0.09);
          border-radius: 11px;
          background: #FBF8F8;
          box-sizing: border-box;
        }

        .cm-menu-set-history-state .cm-cancellation-summary {
          margin-top: 0;
        }

        .cm-menu-set-history-detail > .cm-confirmed-detail-stack {
          width: 100%;
          min-width: 0;
          gap: 8px;
        }

        .cm-menu-set-history-detail .cm-applied-promotions {
          margin-top: 0;
        }

        .cm-menu-set-history-detail > .cm-confirmed-detail-stack .cm-line-discount {
          width: 100%;
          max-width: 100%;
          margin-top: 0;
          box-sizing: border-box;
        }

        .cm-menu-set-history-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .cm-menu-set-history-actions > button {
          max-width: 100%;
          min-height: 36px;
          box-sizing: border-box;
        }

        .cm-child-card {
          min-width: 0;
          box-sizing: border-box;
        }

        .cm-child-card .cm-children-list {
          margin-top: 10px;
          padding-left: 9px;
          border-left: 1px solid rgba(47,42,61,0.12);
        }

        .cm-child-card .cm-child-card {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          border: 1px solid rgba(47,42,61,0.09);
          border-radius: 11px;
          background: #FFFFFF;
          box-sizing: border-box;
        }

        /* =========================
          Conjuntos responsivos
        ========================= */

        @container cm-cart (max-width: 760px) {
          .cm-menu-set-history-detail {
            gap: 8px;
          }

          .cm-menu-set-history-state {
            padding: 9px 10px;
          }

          .cm-menu-set-history-detail > article {
            border-radius: 12px;
          }

          .cm-child-card .cm-children-list {
            padding-left: 8px;
          }
        }

        @container cm-cart (max-width: 420px) {
          .cm-menu-set-history-detail {
            width: 100%;
            min-width: 0;
          }

          .cm-menu-set-history-actions {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
          }

          .cm-menu-set-history-actions > button {
            width: 100% !important;
            max-width: none !important;
          }

          .cm-menu-set-history-detail .cm-line-discount-row {
            gap: 8px;
          }

          .cm-menu-set-history-detail .cm-line-discount-label {
            flex: 1 1 auto;
            min-width: 0;
          }

          .cm-menu-set-history-detail .cm-line-discount-value {
            flex: 0 0 auto;
            text-align: right;
          }

          .cm-child-card .cm-children-list {
            padding-left: 6px;
          }

          .cm-child-card .cm-child-card {
            padding: 9px;
          }
        }

        /* =========================
          Promotion responsive rules
        ========================= */

        @container cm-cart (max-width: 760px) {
          .cm-pricing-summary-grid {
            grid-template-columns: 1fr;
          }

          .cm-pricing-summary-row-total {
            grid-column: auto;
          }

          .cm-price-stack {
            gap: 6px;
          }
        }

        @container cm-cart (max-width: 420px) {
          .cm-pricing-summary-head {
            display: grid;
          }

          .cm-pricing-summary-row {
            display: flex;
            gap: 8px;
          }

          .cm-pricing-summary-label {
            flex: 1;
          }

          .cm-pricing-summary-value {
            flex: 0 0 auto;
            text-align: right;
          }

          .cm-line-discount-row {
            display: flex;
            gap: 8px;
          }

          .cm-line-discount-label {
            flex: 1;
          }

          .cm-line-discount-value {
            flex: 0 0 auto;
            text-align: right;
          }
        }


        @container cm-cart (max-width: 760px) {
          .cm-header-main {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: 10px;
            width: 100%;
            min-width: 0;
          }

          .cm-table-wrap {
            display: none;
          }

          .cm-mobile-list {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: 10px;
            width: 100%;
            min-width: 0;
          }

          .cm-new-controls {
            align-items: center;
          }

          .cm-note-btn {
            width: 100%;
          }

          .cm-panel .cm-pagination-footer {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr);
            align-items: stretch !important;
            gap: 10px !important;
          }

          .cm-panel .cm-pagination-footer > :not(style) ~ :not(style) {
            margin-left: 0 !important;
            margin-top: 0 !important;
          }

          .cm-panel .cm-pagination-footer > .MuiTypography-root {
            width: 100%;
            text-align: left;
          }

          .cm-panel .cm-pagination-controls {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
            align-items: center;
            gap: 8px !important;
            width: 100%;
            max-width: 100%;
            min-width: 0;
          }

          .cm-panel .cm-pagination-controls > :not(style) ~ :not(style) {
            margin-left: 0 !important;
            margin-top: 0 !important;
          }

          .cm-panel .cm-pagination-controls .MuiButton-root {
            width: 100%;
            max-width: 100%;
            min-width: 0 !important;
            padding-left: 8px;
            padding-right: 8px;
          }

          .cm-panel .cm-pagination-controls .MuiTypography-root {
            min-width: 48px;
            text-align: center;
          }
        }

        @container cm-cart (min-width: 761px) {
          .cm-header-main {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            width: 100%;
            min-width: 0;
          }

          .cm-new-card {
            padding: 14px;
          }
        }

        @container cm-cart (max-width: 420px) {
          .cm-new-controls {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
          }

          .cm-new-controls > :first-child {
            flex: 0 0 auto;
            min-width: 0;
          }

          .cm-new-total-box {
            flex: 0 0 auto;
            width: auto;
            min-width: 106px;
            max-width: 100%;
            margin-left: auto;
            box-sizing: border-box;
            text-align: right;
          }

          .cm-cancellation-card {
            padding: 13px;
            gap: 13px;
            border-radius: 19px;
          }

          .cm-cancellation-item {
            padding: 12px;
          }

          .cm-cancellation-item-layout {
            grid-template-columns: minmax(0, 1fr);
            gap: 11px;
          }

          .cm-cancellation-quantity-block {
            justify-items: start;
            padding-left: 33px;
          }

          .cm-cancellation-actions {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .cm-cancellation-actions > button {
            min-width: 0;
            padding-left: 8px;
            padding-right: 8px;
          }
        }

        ${cartPanelCompositeStyles}
      `}
    </style>
  );
}