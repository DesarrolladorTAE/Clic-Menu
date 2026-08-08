// Overlays de sesión QR, mesa ocupada, expiración y recuperación de cuenta.

import React from "react";
import { FullOverlay, PillButton } from "../publicMenu.ui";

export default function PublicMenuOverlays({ qr, hasTable }) {
  const joinStatus = String(qr.joinReq?.status || "").toLowerCase();

  return (
    <>
      <FullOverlay
        open={!!qr.sessionBusy}
        tone="warn"
        title="Esta mesa ya está en uso"
        message={
          "Solo un dispositivo a la vez puede usar esta sesión.\n\n" +
          "Actualmente otro dispositivo está vinculado a esta mesa.\n" +
          "Podrás continuar cuando la sesión sea liberada o finalice la operación."
        }
        actions={
          <PillButton
            tone="soft"
            onClick={() => qr.startScanSession()}
            disabled={qr.sessionLoading}
            title="Reintentar scan"
          >
            {qr.sessionLoading ? "⏳ Reintentando..." : "🔄 Reintentar"}
          </PillButton>
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
          "La sesión de esta mesa expiró.\n\n" +
          "Vuelve a validar el QR para recuperar la sesión si la operación sigue activa."
        }
        actions={
          <PillButton
            tone="soft"
            onClick={() => qr.startScanSession()}
            disabled={qr.sessionLoading}
            title="Revalidar sesión"
          >
            {qr.sessionLoading ? "⏳ Activando..." : "📷 Escanear de nuevo"}
          </PillButton>
        }
      />

      <FullOverlay
        open={!!qr.takeover?.available && !joinStatus}
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
              disabled={qr.sessionLoading || joinStatus === "pending"}
              title="Enviar solicitud al mesero"
            >
              {joinStatus === "pending"
                ? "⏳ Solicitando..."
                : " Sí, retomar"}
            </PillButton>

            <PillButton
              tone="default"
              onClick={() => qr.clearTakeover()}
              disabled={joinStatus === "pending"}
              title="Cancelar"
            >
              No
            </PillButton>
          </>
        }
      />

      <FullOverlay
        open={joinStatus === "pending"}
        tone="default"
        title="Esperando aprobación"
        message={
          qr.joinReq?.message ||
          "Solicitud enviada. Espera aprobación del mesero."
        }
      />

      <FullOverlay
        open={joinStatus === "approved"}
        tone="default"
        title="Solicitud aprobada"
        message={
          qr.joinReq?.message ||
          "Solicitud aprobada. Recuperando la sesión de la mesa..."
        }
      />

      <FullOverlay
        open={joinStatus === "rejected"}
        tone="err"
        title="No aprobado"
        message={
          qr.joinReq?.message ||
          "No fuiste aprobado para retomar la cuenta."
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

      <FullOverlay
        open={joinStatus === "closed"}
        tone="default"
        title="Cuenta cerrada"
        message={
          qr.joinReq?.message ||
          "La cuenta ya fue cerrada y ya no puede retomarse."
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
        open={joinStatus === "unavailable"}
        tone="warn"
        title="No disponible"
        message={
          qr.joinReq?.message ||
          "La cuenta no está disponible para retomarse en este momento."
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
      
    </>
  );
}