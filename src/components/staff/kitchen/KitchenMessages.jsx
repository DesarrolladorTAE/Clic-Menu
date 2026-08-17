import React from "react";
import {
  messageCloseButton,
  messageContent,
  messageIcon,
  messagesContainer,
  msgErr,
  msgOk,
} from "./kitchen.helpers";

export default function KitchenMessages({
  err,
  okMsg,
  onCloseErr,
  onCloseOk,
}) {
  if (!err && !okMsg) return null;

  return (
    <div style={messagesContainer}>
      {err ? (
        <div style={msgErr}>
          <div style={messageIcon}>!</div>

          <div style={messageContent}>
            <div style={{ fontWeight: 1000 }}>No se pudo completar</div>
            <div style={{ marginTop: 2 }}>{err}</div>
          </div>

          <button
            type="button"
            style={messageCloseButton}
            onClick={onCloseErr}
            aria-label="Cerrar aviso"
          >
            ×
          </button>
        </div>
      ) : null}

      {okMsg ? (
        <div style={msgOk}>
          <div style={messageIcon}>✓</div>

          <div style={messageContent}>
            <div style={{ fontWeight: 1000 }}>Listo</div>
            <div style={{ marginTop: 2 }}>{okMsg}</div>
          </div>

          <button
            type="button"
            style={messageCloseButton}
            onClick={onCloseOk}
            aria-label="Cerrar aviso"
          >
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
}