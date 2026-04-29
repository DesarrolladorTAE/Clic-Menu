// Estado visual de error cuando el menú público no pudo cargar o el QR no es válido.

import React from "react";
import {
  PUBLIC_QR_DISABLED_MSG,
  PUBLIC_QR_WRONG_MODE_MSG,
} from "../../../hooks/public/publicMenu.utils";
import { PillButton } from "../publicMenu.ui";

export default function PublicMenuErrorState({ errorMsg, token, onRetry }) {
  const isQrDisabledMsg = errorMsg === PUBLIC_QR_DISABLED_MSG;
  const isWrongModeMsg = errorMsg === PUBLIC_QR_WRONG_MODE_MSG;

  return (
    <div style={{ maxWidth: 1200, margin: "18px auto", padding: 16 }}>
      <div
        style={{
          border: `1px solid ${
            isWrongModeMsg
              ? "rgba(255,0,0,0.25)"
              : isQrDisabledMsg
                ? "rgba(255,122,0,0.28)"
                : "rgba(255,0,0,0.25)"
          }`,
          background: isWrongModeMsg
            ? "#ffe5e5"
            : isQrDisabledMsg
              ? "#fff3cd"
              : "#ffe5e5",
          borderRadius: 16,
          padding: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 950,
                color: isQrDisabledMsg ? "#8a6d3b" : "#a10000",
              }}
            >
              {isWrongModeMsg
                ? "QR inválido"
                : isQrDisabledMsg
                  ? "Menú no disponible"
                  : "No se pudo cargar el menú"}
            </div>

            <div style={{ marginTop: 6, fontSize: 13, whiteSpace: "pre-line" }}>
              {errorMsg}
            </div>

            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              Token: <strong>{token}</strong>
            </div>
          </div>

          {!isQrDisabledMsg && !isWrongModeMsg ? (
            <PillButton onClick={onRetry} title="Volver a intentar">
              Reintentar
            </PillButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}