// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import { useAuth } from "../../context/AuthContext";
import { handleFormApiError } from "../../utils/useFormApiHandler";
import ForgotPasswordModal from "../../components/registro/ForgotPasswordModal";
import TermsModal from "../../components/registro/TermsModal";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const fromState = location.state?.from;
  const fromSession = sessionStorage.getItem("auth_from");
  const from = fromState || fromSession;

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const [termsOpen, setTermsOpen] = useState(false);
  const [pendingCreds, setPendingCreds] = useState(null);

  // ✅ Guarda quién debe aceptar términos (viene del 403)
  const [pendingTermsUser, setPendingTermsUser] = useState(null);

  // ✅ Banner rojo específico para términos
  const [termsRequiredMsg, setTermsRequiredMsg] = useState("");

  const form = useForm({
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;

  const isSafeRedirect = (path) => {
    if (!path || typeof path !== "string") return false;
    if (path.startsWith("/auth")) return false;
    if (!path.startsWith("/")) return false;
    return true;
  };

  const onSubmit = async (values) => {
    setErr("");
    setTermsRequiredMsg("");
    setBusy(true);

    try {
      const res = await login(values.email, values.password);

      const roleName = res?.user?.role?.name?.toLowerCase();
      const roleId = String(res?.user?.role_id);

      const isOwner = roleName === "propietario" || roleId === "2";
      const fallback = isOwner ? "/owner/restaurants" : "/app";

      const target = !res?.userChanged && isSafeRedirect(from) ? from : fallback;

      sessionStorage.removeItem("auth_from");
      nav(target, { replace: true });
    } catch (e) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      const apiMsg = data?.message || "No se pudo iniciar sesión.";

      // ✅ Si faltan términos: banner rojo + abre modal + guarda creds + guarda user_id/email
      if (status === 403 && data?.code === "TERMS_REQUIRED") {
        setPendingCreds(values);
        setPendingTermsUser({
          user_id: data?.user_id ?? null,
          email: data?.email ?? values?.email ?? null,
        });

        setTermsRequiredMsg(
          "No has aceptado los Términos y Condiciones. Es obligatorio aceptarlos para poder iniciar sesión."
        );

        setTermsOpen(true);
        setErr("");
        return;
      }

      const handled = handleFormApiError(e, setError, {
        onMessage: (m) => setErr(m),
      });

      if (!handled) setErr(apiMsg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Login</h2>

      {termsRequiredMsg && (
        <div style={termsBanner}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>
            Falta aceptar términos
          </div>

          <div style={{ fontSize: 13, lineHeight: 1.35 }}>
            {termsRequiredMsg}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <button
              type="button"
              style={btnTermsInline}
              onClick={() => setTermsOpen(true)}
              disabled={busy}
            >
              Ver términos y aceptar
            </button>
          </div>
        </div>
      )}

      {err && <div style={msgBoxErr}>{err}</div>}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 10 }}>
        <div>
          <label style={label}>Email</label>
          <input
            style={input}
            {...register("email", { required: "El correo es obligatorio." })}
            type="email"
            autoComplete="username"
          />
          {errors.email?.message && <div style={errText}>{errors.email.message}</div>}
        </div>

        <div>
          <label style={label}>Password</label>
          <input
            style={input}
            {...register("password", { required: "La contraseña es obligatoria." })}
            type="password"
            autoComplete="current-password"
          />
          {errors.password?.message && <div style={errText}>{errors.password.message}</div>}
        </div>

        <button disabled={busy} style={btnPrimary} type="submit">
          {busy ? "Entrando..." : "Entrar"}
        </button>

        <button type="button" onClick={() => setForgotOpen(true)} style={btnSecondary}>
          Olvidé mi contraseña
        </button>

        <button type="button" onClick={() => nav("/auth/register")} style={btnGhost}>
          Crear cuenta
        </button>
      </form>

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />

      <TermsModal
        mode="login"
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        pendingTermsUser={pendingTermsUser}
        onAccepted={async () => {
          setTermsRequiredMsg("");
          setTermsOpen(false);

          if (!pendingCreds) return;
          await onSubmit(pendingCreds);
        }}
      />
    </div>
  );
}

const label = { fontSize: 12, fontWeight: 900, display: "block", marginBottom: 6 };
const input = { width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" };
const errText = { marginTop: 6, color: "#b00020", fontSize: 12, fontWeight: 800 };

const btnPrimary = {
  width: "100%",
  padding: 10,
  borderRadius: 10,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
};

const btnSecondary = {
  width: "100%",
  padding: 10,
  borderRadius: 10,
  border: "1px solid #ccc",
  background: "#fff",
  cursor: "pointer",
};

const btnGhost = {
  width: "100%",
  padding: 10,
  borderRadius: 10,
  border: "1px solid #eee",
  background: "transparent",
  cursor: "pointer",
};

const msgBoxErr = {
  background: "#ffe5e5",
  border: "1px solid #ffb4b4",
  padding: 10,
  borderRadius: 10,
  marginBottom: 10,
};

const termsBanner = {
  background: "#ffe5e5",
  border: "1px solid #ffb4b4",
  padding: 12,
  borderRadius: 12,
  marginBottom: 10,
  color: "#7a0010",
};

const btnTermsInline = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #7a0010",
  background: "#fff",
  color: "#7a0010",
  fontWeight: 900,
  cursor: "pointer",
};
