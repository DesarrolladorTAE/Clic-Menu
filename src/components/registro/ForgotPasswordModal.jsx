// src/components/modals/ForgotPasswordModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { normalizePhone } from "../../utils/phone";
import { handleFormApiError } from "../../utils/useFormApiHandler.js";
import { requestPasswordResetCode, resetPassword } from "../../services/auth.service";

export default function ForgotPasswordModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [globalMsg, setGlobalMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const [cooldown, setCooldown] = useState(0); // seconds to allow requesting again

  const title = useMemo(() => {
    if (step === 1) return "Recuperar contraseña";
    return "Confirmar código y nueva contraseña";
  }, [step]);

  const form = useForm({
    defaultValues: {
      phone: "",
      code: "",
      password: "",
      password_confirmation: "",
    },
    mode: "onSubmit",
  });

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors },
  } = form;

  const phoneValue = watch("phone");

  // timer
  useEffect(() => {
    if (!open) return;
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown, open]);

  // reset modal state when open toggles
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setGlobalMsg("");
    setBusy(false);
    setCooldown(0);
    reset({
      phone: "",
      code: "",
      password: "",
      password_confirmation: "",
    });
  }, [open, reset]);

  if (!open) return null;

  const onRequest = async (values) => {
    setGlobalMsg("");
    setBusy(true);

    const phone = normalizePhone(values.phone);
    if (phone.length !== 10) {
      setError("phone", { type: "client", message: "El número debe tener 10 dígitos." });
      setBusy(false);
      return;
    }

    try {
      const res = await requestPasswordResetCode({ phone });
      setGlobalMsg(res?.message || "Código enviado.");
      setCooldown(Number(res?.expires_in_seconds || 180)); // backend te da 180
      setStep(2);
      // mantenemos phone y limpiamos lo demás
      reset({
        phone,
        code: "",
        password: "",
        password_confirmation: "",
      });
    } catch (err) {
      const handled = handleFormApiError(err, setError, {
        onMessage: (m) => setGlobalMsg(m),
      });

      if (!handled) setGlobalMsg("No se pudo solicitar el código.");
    } finally {
      setBusy(false);
    }
  };

  const onResetPass = async (values) => {
    setGlobalMsg("");
    setBusy(true);

    const phone = normalizePhone(values.phone);
    if (phone.length !== 10) {
      setError("phone", { type: "client", message: "El número debe tener 10 dígitos." });
      setBusy(false);
      return;
    }

    try {
      const res = await resetPassword({
        phone,
        code: String(values.code || "").trim(),
        password: values.password,
        password_confirmation: values.password_confirmation,
      });

      setGlobalMsg(res?.message || "Contraseña actualizada.");
      // Cierra modal después de éxito
      setTimeout(() => onClose?.(), 900);
    } catch (err) {
      // 410/404/429 vienen como message plano, no como errors
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || "No se pudo restablecer la contraseña.";

      if (status === 422) {
        // podría venir como errors o como message "Código incorrecto."
        const handled = handleFormApiError(err, setError, {
          onMessage: (m) => setGlobalMsg(m),
        });
        if (!handled) setGlobalMsg(msg);
      } else {
        setGlobalMsg(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={backdrop}>
      <div style={modal}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={btnGhost}>✕</button>
        </div>

        {globalMsg && (
          <div style={msgBox}>
            {globalMsg}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSubmit(onRequest)} style={{ display: "grid", gap: 10, marginTop: 12 }}>
            <div>
              <label style={label}>Teléfono</label>
              <input
                style={input}
                placeholder="7441234567"
                {...register("phone")}
                inputMode="numeric"
                autoComplete="tel"
              />
              {errors.phone?.message && <div style={errText}>{errors.phone.message}</div>}
            </div>

            <button disabled={busy} style={btnPrimary} type="submit">
              {busy ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit(onResetPass)} style={{ display: "grid", gap: 10, marginTop: 12 }}>
            <div>
              <label style={label}>Teléfono</label>
              <input
                style={input}
                {...register("phone")}
                readOnly
              />
            </div>

            <div>
              <label style={label}>Código</label>
              <input
                style={input}
                placeholder="123456"
                {...register("code", { required: "El código es obligatorio." })}
                inputMode="numeric"
              />
              {errors.code?.message && <div style={errText}>{errors.code.message}</div>}
            </div>

            <div>
              <label style={label}>Nueva contraseña</label>
              <input
                style={input}
                type="password"
                {...register("password", { required: "La contraseña es obligatoria." })}
                autoComplete="new-password"
              />
              {errors.password?.message && <div style={errText}>{errors.password.message}</div>}
            </div>

            <div>
              <label style={label}>Confirmar contraseña</label>
              <input
                style={input}
                type="password"
                {...register("password_confirmation", { required: "Confirma tu contraseña." })}
                autoComplete="new-password"
              />
              {errors.password_confirmation?.message && (
                <div style={errText}>{errors.password_confirmation.message}</div>
              )}
            </div>

            <div style={{ fontSize: 12, opacity: 0.8 }}>
              Si tu código expiró (3 min), pide uno nuevo en el login. Sí, es fastidioso. Es seguridad.
            </div>

            <button disabled={busy} style={btnPrimary} type="submit">
              {busy ? "Guardando..." : "Cambiar contraseña"}
            </button>
          </form>
        )}
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

const label = { fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 };
const input = { width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" };
const errText = { marginTop: 6, color: "#b00020", fontSize: 12, fontWeight: 700 };

const msgBox = {
  marginTop: 12,
  padding: 10,
  borderRadius: 10,
  background: "#eef2ff",
  border: "1px solid #c7d2fe",
};

const btnPrimary = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
};

const btnGhost = {
  padding: "6px 10px",
  borderRadius: 10,
  border: "1px solid #eee",
  background: "#fff",
  cursor: "pointer",
};
