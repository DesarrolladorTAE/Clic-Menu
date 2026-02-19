// src/pages/staff/StaffSelectBranch.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import { handleFormApiError } from "../../utils/useFormApiHandler";
import { staffBranches, staffSelectBranch } from "../../services/staff/staffAuth.service";
import { useStaffAuth } from "../../context/StaffAuthContext";

export default function StaffSelectBranch() {
  const nav = useNavigate();
  const { setActiveContext, clearStaff, logout } = useStaffAuth();

  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [err, setErr] = useState("");
  const [contexts, setContexts] = useState([]);

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
    return contexts.map((c) => {
      const key = `${c.restaurant.id}:${c.branch.id}`;
      const label = `${c.restaurant.name} · ${c.branch.name}`;
      return { key, label, c };
    });
  }, [contexts]);

  useEffect(() => {
    (async () => {
      setErr("");
      setBusy(true);
      try {
        const res = await staffBranches();
        const list = res?.data || [];
        setContexts(list);

        // Si por alguna razón solo hay 1, auto-selección aquí
        if (list.length === 1) {
          const only = list[0];
          await doSelect(only.restaurant.id, only.branch.id);
        }
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401) {
          clearStaff();
          nav("/staff/login", { replace: true });
          return;
        }
        setErr(e?.response?.data?.message || "No se pudieron cargar las sucursales.");
      } finally {
        setBusy(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doSelect = async (restaurant_id, branch_id) => {
    setSaving(true);
    setErr("");
    try {
      const res = await staffSelectBranch({ restaurant_id, branch_id });
      if (res?.active_context) setActiveContext(res.active_context);
      nav("/staff/app", { replace: true });
    } catch (e) {
      const handled = handleFormApiError(e, setError, {
        onMessage: (m) => setErr(m),
      });
      if (!handled) setErr(e?.response?.data?.message || "No se pudo seleccionar la sucursal.");
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async () => {
    setErr("");

    const opt = options.find((o) => o.key === selectedKey);
    if (!opt) {
      setErr("Selecciona una sucursal.");
      return;
    }

    await doSelect(opt.c.restaurant.id, opt.c.branch.id);
  };

  const onLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setErr("");

    try {
      // ✅ Logout real: revoca token en backend y limpia storage
      await logout();
    } catch {
      // aunque falle, limpiamos local para evitar “sesiones zombies”
      clearStaff();
    } finally {
      nav("/staff/login", { replace: true });
      setLoggingOut(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "60px auto", padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Selecciona sucursal</h2>

      {busy ? (
        <div style={note}>Cargando sucursales…</div>
      ) : (
        <>
          {err && <div style={msgBoxErr}>{err}</div>}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={label}>Sucursal</label>
              <select
                style={input}
                {...register("contextKey", { required: "Selecciona una sucursal." })}
                disabled={saving || loggingOut}
              >
                <option value="">Selecciona…</option>
                {options.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
              {errors.contextKey?.message && <div style={errText}>{errors.contextKey.message}</div>}
            </div>

            <button disabled={saving || loggingOut} style={btnPrimary} type="submit">
              {saving ? "Guardando..." : "Entrar a la sucursal"}
            </button>

            {/* ✅ Aquí va el logout (y SOLO aquí) */}
            <button
              type="button"
              disabled={saving || loggingOut}
              onClick={onLogout}
              style={btnDanger}
            >
              {loggingOut ? "Cerrando sesión..." : "Cerrar sesión (Logout)"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

const note = { padding: 12, border: "1px solid #eee", borderRadius: 12 };

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