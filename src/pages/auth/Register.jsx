// src/pages/auth/Register.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import TermsModal from "../../components/auth/TermsModal";
import { normalizePhone } from "../../utils/phone";
import { handleFormApiError } from "../../utils/useFormApiHandler";
import {
  requestRegisterCode,
  verifyRegisterCode,
  resendRegisterCode,
} from "../../services/auth/auth.service";

export default function Register() {
  const nav = useNavigate();

  const [step, setStep] = useState(1); // 1 = datos, 2 = código
  const [globalMsg, setGlobalMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const [termsOpen, setTermsOpen] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const form = useForm({
    defaultValues: {
      name: "",
      last_name_paternal: "",
      last_name_maternal: "",
      phone: "",
      email: "",
      password: "",
      password_confirmation: "",
      terms_accepted: false,
      code: "",
    },
    mode: "onSubmit",
  });

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = form;

  const phone = watch("phone");
  const termsAccepted = watch("terms_accepted");

  const title = useMemo(() => {
    return step === 1 ? "Registro" : "Verifica tu teléfono";
  }, [step]);

  // countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const goToCodeStep = (expiresInSeconds) => {
    setStep(2);
    setCooldown(Number(expiresInSeconds || 180));
  };

  const onRequestCode = async (values) => {
    setGlobalMsg("");
    setBusy(true);

    const normalized = normalizePhone(values.phone);
    if (normalized.length !== 10) {
      setError("phone", {
        type: "client",
        message: "El número debe tener exactamente 10 dígitos.",
      });
      setBusy(false);
      return;
    }

    if (!values.terms_accepted) {
      setError("terms_accepted", {
        type: "client",
        message: "Debes aceptar los términos y condiciones para registrarte.",
      });
      setBusy(false);
      return;
    }

    try {
      const payload = {
        name: values.name,
        last_name_paternal: values.last_name_paternal,
        last_name_maternal: values.last_name_maternal || null,
        phone: normalized,
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
        terms_accepted: true,
      };

      const res = await requestRegisterCode(payload);

      setGlobalMsg(res?.message || "Código enviado.");
      goToCodeStep(res?.expires_in_seconds);

      // conservamos datos para verify/resend, limpiamos code
      reset({ ...values, phone: normalized, code: "" });
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || "No se pudo enviar el código.";

      const handled = handleFormApiError(err, setError, {
        onMessage: (m) => setGlobalMsg(m),
      });

      if (!handled) setGlobalMsg(msg);

      if (status === 429) {
        const retry = Number(err?.response?.data?.retry_after_seconds || 0);
        if (retry > 0) setCooldown(retry);
      }
    } finally {
      setBusy(false);
    }
  };

  const onVerifyCode = async (values) => {
    setGlobalMsg("");
    setBusy(true);

    const normalized = normalizePhone(values.phone);
    if (normalized.length !== 10) {
      setError("phone", {
        type: "client",
        message: "El número debe tener exactamente 10 dígitos.",
      });
      setBusy(false);
      return;
    }

    const code = String(values.code || "").trim();
    if (!code) {
      setError("code", { type: "client", message: "El código es obligatorio." });
      setBusy(false);
      return;
    }

    try {
      const res = await verifyRegisterCode({ phone: normalized, code });

      setGlobalMsg(res?.message || "Registro completado.");
      setTimeout(() => nav("/auth/login", { replace: true }), 900);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || "No se pudo verificar el código.";

      if (status === 422) {
        const handled = handleFormApiError(err, setError, {
          onMessage: (m) => setGlobalMsg(m),
        });
        if (!handled) setGlobalMsg(msg);
      } else {
        setGlobalMsg(msg);

        if (status === 410) {
          setCooldown(0);
        }

        if (status === 429) {
          const retry = Number(err?.response?.data?.retry_after_seconds || 0);
          if (retry > 0) setCooldown(retry);
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const onResend = async () => {
    setGlobalMsg("");
    setBusy(true);

    const normalized = normalizePhone(phone);
    if (normalized.length !== 10) {
      setError("phone", {
        type: "client",
        message: "El número debe tener exactamente 10 dígitos.",
      });
      setBusy(false);
      return;
    }

    try {
      const res = await resendRegisterCode({ phone: normalized });
      setGlobalMsg(res?.message || "Código reenviado.");
      setCooldown(Number(res?.expires_in_seconds || 180));
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || "No se pudo reenviar el código.";

      setGlobalMsg(msg);

      if (status === 429) {
        const retry = Number(err?.response?.data?.retry_after_seconds || 0);
        if (retry > 0) setCooldown(retry);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleAcceptedTermsFromModal = () => {
    // ✅ Marca en RHF (la fuente de verdad) y limpia error
    clearErrors("terms_accepted");
    setValue("terms_accepted", true, { shouldValidate: true, shouldDirty: true });
    setTermsOpen(false);
  };

  return (
    <div style={{ padding: 24, maxWidth: 520, margin: "40px auto" }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>

      {globalMsg && <div style={msgBox}>{globalMsg}</div>}

      {step === 1 && (
        <form
          onSubmit={handleSubmit(onRequestCode)}
          style={{ display: "grid", gap: 10, marginTop: 12 }}
        >
          <Field label="Nombre" error={errors.name?.message}>
            <input
              style={input}
              {...register("name", { required: "El nombre es obligatorio." })}
              placeholder="David"
            />
          </Field>

          <Field label="Apellido paterno" error={errors.last_name_paternal?.message}>
            <input
              style={input}
              {...register("last_name_paternal", {
                required: "El apellido paterno es obligatorio.",
              })}
              placeholder="Vargas"
            />
          </Field>

          <Field label="Apellido materno (opcional)" error={errors.last_name_maternal?.message}>
            <input style={input} {...register("last_name_maternal")} placeholder="Lopez" />
          </Field>

          <Field label="Teléfono" error={errors.phone?.message}>
            <input
              style={input}
              {...register("phone", { required: "El número de teléfono es obligatorio." })}
              placeholder="7441359257"
              inputMode="numeric"
              autoComplete="tel"
            />
          </Field>

          <Field label="Email" error={errors.email?.message}>
            <input
              style={input}
              {...register("email", {
                required: "El correo electrónico es obligatorio.",
              })}
              placeholder="owner_test_01@clicmenu.com.mx"
              type="email"
              autoComplete="username"
            />
          </Field>

          <Field label="Contraseña" error={errors.password?.message}>
            <input
              style={input}
              {...register("password", { required: "La contraseña es obligatoria." })}
              type="password"
              autoComplete="new-password"
              placeholder="********"
            />
          </Field>

          <Field label="Confirmar contraseña" error={errors.password_confirmation?.message}>
            <input
              style={input}
              {...register("password_confirmation", {
                required: "La confirmación es obligatoria.",
              })}
              type="password"
              autoComplete="new-password"
              placeholder="********"
            />
          </Field>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" {...register("terms_accepted")} />
              <span>
                Acepto los{" "}
                <button type="button" onClick={() => setTermsOpen(true)} style={linkBtn}>
                  términos y condiciones
                </button>
              </span>
            </label>

            {errors.terms_accepted?.message && (
              <div style={errText}>{errors.terms_accepted.message}</div>
            )}

            {/* 👇 pequeño indicador, por si el usuario abre modal y acepta */}
            {termsAccepted && (
              <div style={{ fontSize: 12, fontWeight: 800, color: "#14532d" }}>
                ✅ Términos aceptados
              </div>
            )}
          </div>

          <button disabled={busy} style={btnPrimary} type="submit">
            {busy ? "Enviando..." : "Enviar código por WhatsApp"}
          </button>

          <button type="button" onClick={() => nav("/auth/login")} style={btnSecondary}>
            Ya tengo cuenta · Iniciar sesión
          </button>
        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={handleSubmit(onVerifyCode)}
          style={{ display: "grid", gap: 10, marginTop: 12 }}
        >
          <div style={{ fontSize: 13, opacity: 0.85 }}>
            Te enviamos un código a WhatsApp. Si no te llegó, revisa que el número sea correcto.
          </div>

          <Field label="Teléfono" error={errors.phone?.message}>
            <input style={input} {...register("phone")} readOnly />
          </Field>

          <Field label="Código" error={errors.code?.message}>
            <input
              style={input}
              {...register("code")}
              placeholder="123456"
              inputMode="numeric"
            />
          </Field>

          <button disabled={busy} style={btnPrimary} type="submit">
            {busy ? "Verificando..." : "Verificar y completar registro"}
          </button>

          <button
            type="button"
            disabled={busy || cooldown > 0}
            onClick={onResend}
            style={{
              ...btnSecondary,
              opacity: busy || cooldown > 0 ? 0.6 : 1,
              cursor: busy || cooldown > 0 ? "not-allowed" : "pointer",
            }}
          >
            {cooldown > 0 ? `Reenviar disponible en ${cooldown}s` : "Reenviar código"}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep(1);
              setGlobalMsg("");
              reset({ ...getValues(), code: "" });
            }}
            style={btnGhost}
          >
            Volver y corregir datos
          </button>
        </form>
      )}

      {/* ✅ Modal en modo registro: NO pide user_id/email, NO pega al API */}
      <TermsModal
        mode="register"
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        onAccepted={handleAcceptedTermsFromModal}
      />
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <div style={errText}>{error}</div>}
    </div>
  );
}

const labelStyle = {
  fontSize: 12,
  fontWeight: 800,
  display: "block",
  marginBottom: 6,
};

const input = {
  width: "100%",
  padding: 10,
  borderRadius: 10,
  border: "1px solid #ddd",
};

const errText = { marginTop: 6, color: "#b00020", fontSize: 12, fontWeight: 800 };

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

const btnSecondary = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ccc",
  background: "#fff",
  cursor: "pointer",
};

const btnGhost = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #eee",
  background: "transparent",
  cursor: "pointer",
};

const linkBtn = {
  border: "none",
  background: "transparent",
  padding: 0,
  color: "#2563eb",
  textDecoration: "underline",
  cursor: "pointer",
};
