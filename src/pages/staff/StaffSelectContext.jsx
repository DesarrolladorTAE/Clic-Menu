import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import { handleFormApiError } from "../../utils/useFormApiHandler";
import { useStaffAuth } from "../../context/StaffAuthContext";

function roleLabel(name) {
  if (name === "waiter") return "Mesero";
  if (name === "cashier") return "Cajero";
  if (name === "kitchen") return "Cocina";
  return name || "—";
}

function routeByRole(roleName) {
  if (roleName === "waiter") return "/staff/app";
  if (roleName === "cashier") return "/staff/cashier";
  if (roleName === "kitchen") return "/staff/kitchen";
  return "/staff/app";
}

export default function StaffSelectContext() {
  const nav = useNavigate();
  const location = useLocation();

  const { contexts, selectContext, logout, clearStaff, activeContext } = useStaffAuth();

  const [busy, setBusy] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [err, setErr] = useState("");

  const forceSelection = !!location.state?.forceSelection;

  const from = useMemo(() => {
    const fromState = location.state?.from;
    if (typeof fromState === "string" && fromState.startsWith("/staff")) return fromState;
    return "/staff/app";
  }, [location.state]);

  const form = useForm({
    defaultValues: { contextKey: "" },
    mode: "onSubmit",
  });

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = form;

  const selectedKey = watch("contextKey");

  const options = useMemo(() => {
    return (contexts || []).map((c) => {
      const key = `${c.restaurant.id}:${c.branch.id}:${c.role.id}`;
      const label = `${c.restaurant.name} · ${c.branch.name} · ${roleLabel(c.role.name)}`;
      return { key, label, c };
    });
  }, [contexts]);

  useEffect(() => {
    if (!forceSelection && activeContext?.role?.name) {
      nav(routeByRole(activeContext.role.name), { replace: true });
      return;
    }

    if (!Array.isArray(contexts) || contexts.length === 0) {
      nav("/staff/login", { replace: true, state: { from } });
      return;
    }

    if (!forceSelection && contexts.length === 1) {
      const only = contexts[0];
      (async () => {
        setBusy(true);
        setErr("");
        try {
          const res = await selectContext({
            restaurant_id: only.restaurant.id,
            branch_id: only.branch.id,
            role_id: only.role.id,
          });

          const roleName = res?.active_context?.role?.name;
          nav(routeByRole(roleName), { replace: true });
        } catch (e) {
          setErr(e?.response?.data?.message || "No se pudo seleccionar el contexto.");
        } finally {
          setBusy(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async () => {
    setErr("");

    const opt = options.find((o) => o.key === selectedKey);
    if (!opt) {
      setErr("Selecciona un contexto.");
      return;
    }

    setBusy(true);
    setErr("");
    try {
      const res = await selectContext({
        restaurant_id: opt.c.restaurant.id,
        branch_id: opt.c.branch.id,
        role_id: opt.c.role.id,
      });

      const roleName = res?.active_context?.role?.name;
      nav(routeByRole(roleName), { replace: true });
    } catch (e) {
      const handled = handleFormApiError(e, setError, {
        onMessage: (m) => setErr(m),
      });
      if (!handled) {
        setErr(e?.response?.data?.message || "No se pudo seleccionar el contexto.");
      }
    } finally {
      setBusy(false);
    }
  };

  const onLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setErr("");

    try {
      await logout();
    } catch {
      clearStaff();
    } finally {
      nav("/staff/login", { replace: true });
      setLoggingOut(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: "60px auto", padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Selecciona contexto</h2>
      <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 12 }}>
        Restaurante · Sucursal · Rol
      </div>

      {err && <div style={msgBoxErr}>{err}</div>}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 12 }}>
        <div>
          <label style={label}>Contexto</label>
          <select
            style={input}
            {...register("contextKey", { required: "Selecciona un contexto." })}
            disabled={busy || loggingOut}
          >
            <option value="">Selecciona…</option>
            {options.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
          {errors.contextKey?.message && (
            <div style={errText}>{errors.contextKey.message}</div>
          )}
        </div>

        <button disabled={busy || loggingOut} style={btnPrimary} type="submit">
          {busy ? "Guardando..." : "Entrar"}
        </button>

        <button
          type="button"
          disabled={busy || loggingOut}
          onClick={onLogout}
          style={btnDanger}
        >
          {loggingOut ? "Cerrando sesión..." : "Cerrar sesión (Logout)"}
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
  fontWeight: 900,
};

const btnDanger = {
  width: "100%",
  padding: 10,
  borderRadius: 10,
  border: "1px solid #7a0010",
  background: "#ffe5e5",
  color: "#7a0010",
  cursor: "pointer",
  fontWeight: 900,
};

const msgBoxErr = {
  background: "#ffe5e5",
  border: "1px solid #ffb4b4",
  padding: 10,
  borderRadius: 10,
  marginBottom: 10,
};