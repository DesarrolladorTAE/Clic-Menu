// Overlays de sesión QR, mesa ocupada, expiración y recuperación de cuenta.

import React from "react";
import { FullOverlay, PillButton } from "../publicMenu.ui";

export default function PublicMenuOverlays({ qr, hasTable }) {
  return (
    <>
      <FullOverlay
        open={!!qr.sessionBusy}
        tone="warn"
        title="Esta mesa ya está en uso"
        message={
          "Solo un usuario a la vez puede usar este QR.\n\n" +
          "Parece que otra persona ya escaneó la mesa en otro dispositivo.\n" +
          "Si se desocupa (o expira), podrás entrar."
        }
        actions={
          <>
            <PillButton
              tone="soft"
              onClick={() => qr.startScanSession()}
              disabled={qr.sessionLoading}
              title="Reintentar scan"
            >
              {qr.sessionLoading ? "⏳ Reintentando..." : "🔄 Reintentar"}
            </PillButton>

            <PillButton
              tone="default"
              onClick={() => qr.setSessionBusy(null)}
              title="Cerrar aviso"
            >
              Entendido
            </PillButton>
          </>
        }
      />

      <FullOverlay
        open={!!qr.sessionUnavailable}
        tone="warn"
        title="Sesión no disponible"
        message={
          (qr.sessionUnavailable?.message ||
            "Sesión no disponible, intente más tarde.") +
          "\n\n" +
          "El mesero ya atendió esta mesa.\n" +
          "Cuando finalice la atención, este QR volverá a estar disponible."
        }
        actions={
          <>
            <PillButton
              tone="soft"
              onClick={() => qr.startScanSession()}
              disabled={qr.sessionLoading}
              title="Reintentar"
            >
              {qr.sessionLoading ? "⏳ Reintentando..." : "🔄 Reintentar"}
            </PillButton>

            <PillButton
              tone="default"
              onClick={() => qr.setSessionUnavailable(null)}
              title="Cerrar aviso"
            >
              Entendido
            </PillButton>
          </>
        }
      />

      <FullOverlay
        open={
          hasTable &&
          !qr.sessionBusy &&
          !qr.sessionUnavailable &&
          qr.sessionExpired
        }
        tone="err"
        title="Tiempo agotado"
        message={
          "La sesión de esta mesa expiró (5 minutos).\n\n" +
          "Vuelve a escanear para activar otra sesión y poder enviar pedidos."
        }
        actions={
          <PillButton
            tone="soft"
            onClick={() => qr.startScanSession()}
            disabled={qr.sessionLoading}
            title="Reiniciar sesión"
          >
            {qr.sessionLoading ? "⏳ Activando..." : "📷 Escanear de nuevo"}
          </PillButton>
        }
      />

      <FullOverlay
        open={!!qr.takeover?.available}
        tone="warn"
        title="¿Retomar cuenta?"
        message={
          qr.takeover?.message ||
          "Esta mesa tiene una comanda abierta pero no hay dispositivo vinculado.\n¿Deseas retomar la cuenta?"
        }
        actions={
          <>
            <PillButton
              tone="orange"
              onClick={() => qr.requestJoin()}
              disabled={qr.sessionLoading || qr.joinReq?.status === "pending"}
              title="Enviar solicitud al mesero"
            >
              {qr.joinReq?.status === "pending"
                ? "⏳ Solicitando..."
                : "✅ Sí, retomar"}
            </PillButton>

            <PillButton
              tone="default"
              onClick={() => qr.clearTakeover()}
              disabled={qr.joinReq?.status === "pending"}
              title="Cancelar"
            >
              No
            </PillButton>
          </>
        }
      />

      <FullOverlay
        open={!!qr.joinReq && qr.joinReq.status === "pending"}
        tone="default"
        title="Esperando aprobación"
        message={
          qr.joinReq?.message || "Solicitud enviada. Espera aprobación del mesero."
        }
        actions={
          <PillButton
            tone="default"
            onClick={() => qr.clearTakeover()}
            title="Cerrar"
          >
            Entendido
          </PillButton>
        }
      />

      <FullOverlay
        open={!!qr.joinReq && qr.joinReq.status === "rejected"}
        tone="err"
        title="No aprobado"
        message={
          qr.joinReq?.message || "No fuiste aprobado para retomar la cuenta."
        }
        actions={
          <PillButton
            tone="default"
            onClick={() => qr.clearTakeover()}
            title="Cerrar"
          >
            Ok
          </PillButton>
        }
      />
    </>
  );
}