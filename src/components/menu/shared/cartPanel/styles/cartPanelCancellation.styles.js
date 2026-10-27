export const cartPanelCancellationStyles = `
.cm-cancellation-summary {
          display: flex;
          align-items: center;
          gap: 6px 9px;
          flex-wrap: wrap;
          margin-top: 5px;
          color: #6E6A6A;
          font-size: 10.5px;
          font-weight: 750;
          line-height: 1.35;
        }

        .cm-cancellation-summary strong {
          color: #3F3A52;
          font-weight: 950;
        }

        .cm-cancellation-full {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          padding: 3px 7px;
          border-radius: 999px;
          border: 1px solid rgba(185,28,28,0.16);
          background: rgba(185,28,28,0.06);
          color: #B91C1C;
          font-weight: 950;
        }

        .cm-cancellation-section {
          margin-top: 0;
          gap: 0;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .cm-cancellation-card {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 16px;
          width: 100%;
          min-width: 0;
          padding: 16px;
          border: 1px solid rgba(47,42,61,0.10);
          border-radius: 22px;
          background: #FFFFFF;
          box-shadow: 0 14px 34px rgba(47,42,61,0.07);
          box-sizing: border-box;
        }

        .cm-cancellation-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          width: 100%;
          min-width: 0;
        }

        .cm-cancellation-header-copy {
          min-width: 0;
        }

        .cm-cancellation-title {
          margin: 0;
          color: #3F3A52;
          font-size: 14px;
          font-weight: 950;
          line-height: 1.25;
          text-transform: uppercase;
          letter-spacing: .035em;
        }

        .cm-cancellation-help {
          margin-top: 5px;
          color: #7A7484;
          font-size: 11px;
          font-weight: 750;
          line-height: 1.4;
        }

        .cm-cancellation-list {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 10px;
          width: 100%;
          min-width: 0;
        }

        .cm-cancellation-item {
          width: 100%;
          min-width: 0;
          padding: 13px;
          border: 1px solid rgba(47,42,61,0.09);
          border-radius: 18px;
          background:
            linear-gradient(
              180deg,
              rgba(255,255,255,1) 0%,
              rgba(251,248,248,0.72) 100%
            );
          box-shadow: 0 8px 20px rgba(47,42,61,0.035);
          box-sizing: border-box;
          transition:
            border-color 160ms ease,
            box-shadow 160ms ease,
            background 160ms ease,
            transform 160ms ease;
        }

        .cm-cancellation-item:hover {
          border-color: rgba(47,42,61,0.16);
          box-shadow: 0 10px 24px rgba(47,42,61,0.055);
        }

        .cm-cancellation-item-selected {
          border-color: var(
            --cm-cancellation-accent,
            #B85C46
          );
          background:
            linear-gradient(
              135deg,
              rgba(184,92,70,0.085),
              rgba(255,255,255,0.98)
            );
          box-shadow:
            0 10px 24px rgba(184,92,70,0.09);
        }

        .cm-cancellation-item-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 14px;
          width: 100%;
          min-width: 0;
        }

        .cm-cancellation-item-main {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          min-width: 0;
          padding: 2px 0;
        }

        .cm-cancellation-checkbox-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          width: 22px;
          min-height: 22px;
        }

        .cm-cancellation-checkbox {
          width: 19px;
          height: 19px;
          margin: 0;
          flex-shrink: 0;
        }

        .cm-cancellation-item-copy {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 4px;
          min-width: 0;
        }

        .cm-cancellation-item-name {
          min-width: 0;
          color: #3F3A52;
          font-size: 14px;
          font-weight: 950;
          line-height: 1.3;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .cm-cancellation-item-availability {
          color: #77717F;
          font-size: 11px;
          font-weight: 800;
          line-height: 1.35;
        }

        .cm-cancellation-quantity-block {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          justify-items: end;
          gap: 6px;
          flex: 0 0 auto;
        }

        .cm-cancellation-quantity-label {
          color: #77717F;
          font-size: 9px;
          font-weight: 900;
          line-height: 1.2;
          text-transform: uppercase;
          letter-spacing: .045em;
          white-space: nowrap;
        }

        .cm-cancellation-qty {
          display: grid;
          grid-template-columns: 38px 42px 38px;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 5px;
          border: 1px solid rgba(47,42,61,0.09);
          border-radius: 17px;
          background: #F8F5F5;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.88);
        }

        .cm-cancellation-qty-btn {
          width: 38px;
          min-width: 38px;
          height: 38px;
          padding: 0;
          border: 1px solid rgba(47,42,61,0.10);
          border-radius: 13px;
          background: #FFFFFF;
          color: #3F3A52;
          font-size: 18px;
          font-weight: 950;
          line-height: 1;
          box-shadow: 0 5px 12px rgba(47,42,61,0.05);
          transition:
            transform 150ms ease,
            border-color 150ms ease,
            background 150ms ease,
            opacity 150ms ease;
        }

        .cm-cancellation-qty-btn:not(:disabled):hover {
          transform: translateY(-1px);
          border-color: rgba(184,92,70,0.28);
          background: rgba(184,92,70,0.06);
        }

        .cm-cancellation-qty-btn:disabled {
          cursor: not-allowed;
          opacity: 0.38;
          box-shadow: none;
        }

        .cm-cancellation-qty-value {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 38px;
          border: 1px solid rgba(47,42,61,0.10);
          border-radius: 13px;
          background: #FFFFFF;
          color: #3F3A52;
          font-size: 13px;
          font-weight: 950;
          line-height: 1;
          box-sizing: border-box;
        }

        .cm-cancellation-actions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          width: 100%;
          min-width: 0;
          padding-top: 2px;
        }

        .cm-cancellation-actions > button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: none;
          min-width: 0;
          box-sizing: border-box;
        }
`;