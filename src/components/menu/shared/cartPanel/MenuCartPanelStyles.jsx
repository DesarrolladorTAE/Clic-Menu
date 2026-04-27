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
          box-sizing: border-box;
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
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
          justify-content: flex-end;
        }

        .cm-section {
          margin-top: 14px;
          display: grid;
          gap: 9px;
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
          overflow-x: auto;
          border: 1px solid rgba(47,42,61,0.08);
          border-radius: 18px;
          background: #fff;
        }

        .cm-table {
          width: 100%;
          min-width: 560px;
          border-collapse: separate;
          border-spacing: 0;
        }

        .cm-table th {
          text-align: left;
          padding: 11px 10px;
          font-size: 11px;
          color: #6E6A6A;
          background: #FBF8F8;
          border-bottom: 1px solid rgba(47,42,61,0.08);
          white-space: nowrap;
        }

        .cm-td {
          padding: 11px 10px;
          border-top: 1px solid rgba(47,42,61,0.07);
          vertical-align: top;
          font-size: 12px;
          color: #3F3A52;
        }

        .cm-table tbody tr:first-child .cm-td {
          border-top: none;
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

        .cm-combo-badge {
          display: inline-flex;
          width: fit-content;
          font-size: 10px;
          font-weight: 950;
          padding: 4px 8px;
          border-radius: 999px;
          background: rgba(255,152,0,0.16);
          border: 1px solid rgba(255,152,0,0.30);
          color: #9a4a00;
        }

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

        .cm-mobile-list,
        .cm-new-card-list {
          display: none;
        }

        .cm-mobile-card,
        .cm-new-card {
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
        }

        .cm-new-card-top {
          align-items: flex-start;
        }

        .cm-new-info {
          min-width: 0;
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

        @media (max-width: 760px) {
          .cm-panel {
            border-radius: 22px;
            padding: 12px;
            box-shadow: none;
          }

          .cm-header-main {
            display: grid;
            gap: 10px;
          }

          .cm-actions {
            justify-content: stretch;
            display: grid;
            grid-template-columns: 1fr;
          }

          .cm-actions button {
            width: 100%;
          }

          .cm-table-wrap {
            display: none;
          }

          .cm-mobile-list,
          .cm-new-card-list {
            display: grid;
            gap: 10px;
          }

          .cm-new-controls {
            align-items: center;
          }

          .cm-note-btn {
            width: 100%;
          }
        }

        @media (min-width: 761px) {
          .cm-new-card-list {
            display: grid;
            gap: 10px;
          }

          .cm-new-card {
            padding: 14px;
          }
        }

        @media (max-width: 420px) {
          .cm-new-controls {
            display: grid;
            gap: 10px;
          }

          .cm-new-total-box {
            width: 100%;
            box-sizing: border-box;
            text-align: left;
          }
        }
      `}
    </style>
  );
}