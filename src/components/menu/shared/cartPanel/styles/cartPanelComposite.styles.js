export const cartPanelCompositeStyles = `
  /* =========================
          Productos compuestos
        ========================= */

        .cm-new-card.cm-composite-card,
        .cm-composite-card,
        .cm-history-composite {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 0;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          padding: 0;
          overflow: hidden;
          border: 1px solid rgba(255,152,0,0.20);
          border-radius: 12px;
          background: #FFFFFF;
          box-sizing: border-box;
          box-shadow: none;
        }

        .cm-composite-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 0;
          width: 100%;
          min-width: 0;
        }

        .cm-composite-card .cm-composite-head > .cm-new-info {
          width: 100%;
          min-width: 0;
        }

        .cm-composite-trigger,
        .cm-history-composite-trigger {
          appearance: none;
          display: flex;
          align-items: center;
          gap: 11px;
          width: 100%;
          min-width: 0;
          min-height: 72px;
          padding: 13px;
          border: 0;
          border-radius: 0;
          background: rgba(255,152,0,0.045);
          color: #3F3A52;
          font: inherit;
          text-align: left;
          cursor: pointer;
          box-sizing: border-box;
          transition: background 160ms ease;
          -webkit-tap-highlight-color: transparent;
        }

        .cm-composite-trigger:hover,
        .cm-history-composite-trigger:hover {
          background: rgba(255,152,0,0.075);
        }

        .cm-composite-trigger:focus-visible,
        .cm-history-composite-trigger:focus-visible {
          outline: 2px solid var(--cm-composite-accent, var(--cm-cart-accent, #FF9800));
          outline-offset: -3px;
        }

        .cm-composite-head-icon {
          display: grid;
          place-items: center;
          width: 35px;
          height: 35px;
          flex: 0 0 35px;
          border-radius: 10px;
          background: rgba(255,152,0,0.12);
          color: var(--cm-composite-accent, var(--cm-cart-accent, #FF9800));
        }

        .cm-composite-copy,
        .cm-history-composite-main {
          display: grid;
          gap: 5px;
          flex: 1 1 auto;
          min-width: 0;
        }

        .cm-composite-name {
          color: #3F3A52;
          font-size: 13.5px;
          font-weight: 950;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .cm-composite-description,
        .cm-history-composite-meta {
          color: #6E6A6A;
          font-size: 11.5px;
          font-weight: 750;
          line-height: 1.35;
        }

        .cm-composite-price,
        .cm-history-composite-amount {
          display: grid;
          justify-items: end;
          gap: 4px;
          flex: 0 0 auto;
          text-align: right;
        }

        .cm-composite-price strong,
        .cm-history-composite-amount strong {
          color: var(--cm-composite-accent, var(--cm-cart-accent, #FF9800));
          font-size: 14px;
          font-weight: 950;
          white-space: nowrap;
        }

        .cm-composite-price span,
        .cm-history-composite-amount span {
          color: #6E6A6A;
          font-size: 10.5px;
          line-height: 1.3;
        }

        .cm-composite-chevron {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 21px;
          width: 21px;
          height: 25px;
          color: var(--cm-composite-accent, var(--cm-cart-accent, #FF9800));
        }

        .cm-composite-expanded,
        .cm-history-composite-content {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 10px;
          width: 100%;
          min-width: 0;
          padding: 12px;
          background: #FFFFFF;
          box-sizing: border-box;
          animation: cm-composite-reveal 180ms ease-out;
        }

        .cm-history-composite-table-cell {
          padding: 0;
          border-top: 1px solid rgba(47,42,61,0.08);
          background: #FFFFFF;
        }

        .cm-history-composite-table-cell .cm-history-composite {
          border-radius: 12px;
        }

        .cm-history-composite-content > .cm-confirmed-detail-stack {
          width: 100%;
          min-width: 0;
          padding-top: 10px;
          border-top: 1px dashed rgba(47,42,61,0.12);
        }

        .cm-history-composite-content > .cm-menu-set-history-actions {
          padding-top: 10px;
          border-top: 1px solid rgba(47,42,61,0.08);
        }

        .cm-product-actions,
        .cm-composite-product-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 8px;
          min-width: 0;
        }

        .cm-composite-product-actions:empty {
          display: none;
        }

        /* Productos internos */

        .cm-composite-products-wrap,
        .cm-composite-products {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 9px;
          width: 100%;
          min-width: 0;
        }

        .cm-composite-product {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 9px;
          width: 100%;
          min-width: 0;
          padding: 11px;
          border: 1px solid var(--cm-composite-row-border, rgba(255,152,0,0.19));
          border-radius: 10px;
          background: #FFFFFF;
          box-sizing: border-box;
        }

        .cm-composite-product-main {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 8px;
          width: 100%;
          min-width: 0;
        }
        
        .cm-composite-product-details {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          width: 100%;
          min-width: 0;
        }

        .cm-composite-product-details:empty {
          display: none;
        }

        .cm-composite-product-info {
          width: 100%;
          min-width: 0;
        }

        .cm-composite-product-info {
          display: grid;
          gap: 4px;
          flex: 1 1 145px;
          min-width: 0;
        }

        .cm-composite-product-name {
          color: #3F3A52;
          font-size: 12.5px;
          font-weight: 900;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .cm-composite-product-quantity {
          color: #6E6A6A;
          font-size: 11.5px;
          font-weight: 750;
          line-height: 1.4;
        }

        .cm-composite-product-cancellation {
          color: #B91C1C;
          font-size: 11px;
          font-weight: 800;
          line-height: 1.4;
        }

        .cm-composite-product-nested {
          min-width: 0;
          padding-left: 10px;
          border-left: 2px solid var(--cm-composite-row-border, rgba(255,152,0,0.19));
        }

        .cm-composite-product-nested .cm-composite-product {
          background: #FBF8F8;
        }

        @keyframes cm-composite-reveal {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* =========================
          Tabletas y teléfonos
        ========================= */

        @container cm-cart (max-width: 760px) {
          .cm-composite-trigger,
          .cm-history-composite-trigger {
            gap: 9px;
            padding: 12px;
          }

          .cm-composite-expanded,
          .cm-history-composite-content {
            padding: 11px;
          }

          .cm-composite-product {
            padding: 10px;
          }
        }

        @container cm-cart (max-width: 420px) {
          .cm-composite-trigger,
          .cm-history-composite-trigger {
            gap: 8px;
            padding: 10px;
          }

          .cm-composite-head-icon {
            width: 31px;
            height: 31px;
            flex-basis: 31px;
          }

          .cm-composite-name {
            font-size: 12.5px;
          }

          .cm-composite-description,
          .cm-history-composite-meta {
            font-size: 10.5px;
          }

          .cm-composite-price strong,
          .cm-history-composite-amount strong {
            font-size: 12px;
          }

          .cm-composite-price span,
          .cm-history-composite-amount span {
            font-size: 9.5px;
          }

          .cm-composite-chevron {
            flex-basis: 19px;
            width: 19px;
          }

          .cm-composite-expanded,
          .cm-history-composite-content {
            padding: 10px;
          }

          .cm-composite-product-main {
            gap: 8px;
          }

          .cm-composite-product-nested {
            padding-left: 7px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cm-composite-trigger,
          .cm-history-composite-trigger {
            transition: none;
          }

          .cm-composite-expanded,
          .cm-history-composite-content {
            animation: none;
          }
        }

        /* =========================
        Productos normales del historial
        ========================= */

        .cm-history-card-table {
        overflow: visible;
        border: 0;
        border-radius: 0;
        background: transparent;
        }

        .cm-history-card-table .cm-menu-set-history-row {
        background: transparent;
        }

        .cm-history-card-table .cm-menu-set-history-cell {
        padding: 0 0 10px;
        border-top: 0;
        background: transparent;
        }

        .cm-history-standard-header {
        cursor: default;
        }

        .cm-history-standard-header:hover {
        background: rgba(255,152,0,0.045);
        }

        .cm-history-standard-tools {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: 8px;
        min-width: 0;
        padding: 10px 13px;
        border-top: 1px solid rgba(47,42,61,0.06);
        background: #FFFFFF;
        }

        .cm-history-standard-tools:empty {
        display: none;
        }

        .cm-history-standard-section {
        width: 100%;
        min-width: 0;
        padding: 0 13px 12px;
        background: #FFFFFF;
        box-sizing: border-box;
        }

        .cm-history-standard-section .cm-cancellation-summary,
        .cm-history-standard-section .cm-applied-promotions {
        margin-top: 0;
        }

        .cm-history-standard-section.cm-menu-set-history-actions {
        justify-content: flex-end;
        }

        .cm-history-standard .cm-history-composite-amount {
        min-width: 0;
        }

        @container cm-cart (max-width: 420px) {
        .cm-history-standard-header {
            gap: 8px;
            padding: 11px 10px;
        }

        .cm-history-standard-tools {
            padding: 9px 10px;
        }

        .cm-history-standard-section {
            padding: 0 10px 10px;
        }

        .cm-history-standard .cm-composite-name {
            font-size: 12.5px;
        }

        .cm-history-standard .cm-history-composite-amount strong {
            font-size: 12px;
        }
        }

`;