// src/components/registro/TermsModal.jsx
import React, { useMemo, useState } from "react";
import { acceptTerms } from "../../services/auth/auth.service";

/**
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - onAccepted: (payload?: { accepted: boolean }) => void
 * - pendingTermsUser?: { user_id?: number|string|null, email?: string|null }
 * - mode?: "login" | "register"
 *
 * mode:
 * - "login": requiere user_id/email y llama API /terms/accept
 * - "register": NO requiere user_id/email, NO llama API, solo confirma aceptación local
 */
export default function TermsModal({
  open,
  onClose,
  onAccepted,
  pendingTermsUser,
  mode = "login",
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const isLoginMode = mode === "login";

  const userId = pendingTermsUser?.user_id ?? null;
  const email = pendingTermsUser?.email ?? null;

  const canSubmit = useMemo(() => {
    // En login necesitamos user_id y email para aceptar sin sesión.
    if (!isLoginMode) return true;
    return Boolean(userId) && Boolean(email);
  }, [isLoginMode, userId, email]);

  if (!open) return null;

  const onAccept = async () => {
    setErr("");
    setBusy(true);

    try {
      // MODO REGISTRO: no intentes pegarle al API
      if (!isLoginMode) {
        onAccepted?.({ accepted: true });
        onClose?.();
        return;
      }

      // MODO LOGIN: sí o sí debe venir user_id/email
      if (!canSubmit) {
        setErr(
          "No se pudo identificar al usuario para aceptar términos. Cierra el modal e intenta iniciar sesión de nuevo."
        );
        return;
      }

      await acceptTerms({
        accepted: true,
        user_id: userId,
        email: email,
      });

      onAccepted?.({ accepted: true });
      onClose?.();
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudieron aceptar los términos.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={backdrop}>
      <div style={modal}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Términos y Condiciones</h3>
          <button onClick={onClose} disabled={busy} style={btnGhost}>
            ✕
          </button>
        </div>

        <div style={{ marginTop: 12, maxHeight: 320, overflow: "auto", paddingRight: 6 }}>
          <p style={{ marginTop: 0 }}>
            Términos y condiciones:
          </p>
          <ul>
            <li>El usuario es responsable de la información que registra.</li>
            <li>El sistema puede enviar códigos por WhatsApp para verificación.</li>
            <li>Si intentas abusar del sistema, te bloqueamos. Fácil.</li>
            <li>La cuenta requiere verificación de teléfono para iniciar sesión.</li>
            <li>Al registrarte aceptas recibir mensajes operativos del sistema.</li>
          </ul>

          {/* Solo mostrar warning en modo LOGIN */}
          {isLoginMode && !canSubmit && (
            <div style={msgBoxWarn}>
              No se encontró <b>user_id/email</b> para aceptar términos. Cierra el
              modal e intenta iniciar sesión de nuevo.
            </div>
          )}
        </div>

        {err && <div style={msgBoxErr}>{err}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
          <button onClick={onClose} disabled={busy} style={btnSecondary}>
            Cerrar
          </button>

          <button
            onClick={onAccept}
            disabled={busy || !canSubmit}
            style={{
              ...btnPrimary,
              opacity: busy || !canSubmit ? 0.75 : 1,
              cursor: busy || !canSubmit ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Guardando..." : "Aceptar"}
          </button>
        </div>
      </div>
    </div>
  );
}

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 9999,
};

const modal = {
  width: "100%",
  maxWidth: 520,
  background: "#fff",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
};

const msgBoxErr = {
  background: "#ffe5e5",
  border: "1px solid #ffb4b4",
  padding: 10,
  borderRadius: 10,
  marginTop: 12,
  fontSize: 13,
  fontWeight: 700,
  color: "#7a0010",
};

const msgBoxWarn = {
  background: "#fff3cd",
  border: "1px solid #ffe08a",
  padding: 10,
  borderRadius: 10,
  marginTop: 12,
  fontSize: 13,
  fontWeight: 700,
  color: "#7a5a00",
};

const btnPrimary = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
};

const btnSecondary = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ccc",
  background: "#fff",
  cursor: "pointer",
};

const btnGhost = {
  padding: "6px 10px",
  borderRadius: 10,
  border: "1px solid #eee",
  background: "#fff",
  cursor: "pointer",
};
