import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import { useStaffAuth } from "../../context/StaffAuthContext";
import { handleFormApiError } from "../../utils/useFormApiHandler";

export default function StaffLogin() {
  const { login } = useStaffAuth();
  const nav = useNavigate();
  const location = useLocation();

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const from = useMemo(() => {
    const fromState = location.state?.from;
    if (typeof fromState === "string" && fromState.startsWith("/staff")) return fromState;
    return "/staff/app";
  }, [location.state]);

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

  const onSubmit = async (values) => {
    setErr("");
    setBusy(true);

    try {
      const res = await login(values.email, values.password);

      // Si hay que elegir sucursal
      if (res?.requires_branch_selection) {
        nav("/staff/select-branch", { replace: true });
        return;
      }

      // Si el backend ya auto-seleccionó (solo 1 contexto), directo al app
      nav(from, { replace: true });
    } catch (e) {
      const handled = handleFormApiError(e, setError, {
        onMessage: (m) => setErr(m),
      });

      if (!handled) {
        const msg =
          e?.response?.data?.message ||
          "No se pudo iniciar sesión staff.";
        setErr(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Acceso Staff</h2>
      

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

        <button
          type="button"
          onClick={() => nav("/auth/login")}
          style={btnGhost}
          disabled={busy}
        >
          Ir a login propietario
        </button>
      </form>
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