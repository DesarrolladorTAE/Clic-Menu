import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { staffContext } from "../../../services/staff/staffAuth.service";
import { useStaffAuth } from "../../../context/StaffAuthContext";

export default function StaffDashboard() {
  const nav = useNavigate();

  // exitContext (no exitBranch)
  const { exitContext, clearStaff } = useStaffAuth();

  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState("");
  const [ctx, setCtx] = useState(null);

  useEffect(() => {
    (async () => {
      setBusy(true);
      setErr("");

      try {
        const res = await staffContext();
        setCtx(res?.data || null);
      } catch (e) {
        const status = e?.response?.status;

        //  409 = NO_ACTIVE_CONTEXT -> select-context
        if (status === 409) {
          nav("/staff/select-context", { replace: true });
          return;
        }

        if (status === 401) {
          clearStaff();
          nav("/staff/login", { replace: true });
          return;
        }

        setErr(e?.response?.data?.message || "No se pudo cargar el contexto.");
      } finally {
        setBusy(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onExitContext = async () => {
    setErr("");
    try {
      await exitContext();
      nav("/staff/select-context", { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo salir del contexto.");
    }
  };

  // Si alguien entra aquí sin ser mesero, lo mandamos a SU dashboard
  // (tú dijiste: cada quien el suyo)
  useEffect(() => {
    if (!ctx?.role?.name) return;
    if (ctx.role.name === "waiter") return;

    if (ctx.role.name === "cashier") nav("/staff/cashier", { replace: true });
    else if (ctx.role.name === "kitchen") nav("/staff/kitchen", { replace: true });
    else nav("/staff/select-context", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx?.role?.name]);

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Panel Mesero</h2>

      {busy ? (
        <div style={note}>Cargando contexto…</div>
      ) : (
        <>
          {err && <div style={msgBoxErr}>{err}</div>}

          {ctx && (
            <div style={card}>
              <div style={row}>
                <div style={k}>Restaurante</div>
                <div style={v}>
                  {ctx?.restaurant?.name || ctx?.restaurant?.trade_name || "—"}
                </div>
              </div>

              <div style={row}>
                <div style={k}>Sucursal</div>
                <div style={v}>{ctx?.branch?.name || "—"}</div>
              </div>

              <div style={row}>
                <div style={k}>Rol</div>
                <div style={v}>{ctx?.role?.name || "—"}</div>
              </div>

              <div style={row}>
                <div style={k}>Work session</div>
                <div style={v}>{ctx?.work_session_id || "—"}</div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <button
              style={btnPrimary}
              onClick={() => nav("/staff/waiter/tables/grid")}
              title="Ir al panel de mesas (mesero)"
            >
              🍽️ Ir a Mesas
            </button>

            <button style={btnSecondary} onClick={onExitContext}>
              Salir de contexto
            </button>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Para cerrar sesión, sal del contexto y usa “Cerrar sesión (Logout)” en la pantalla de selección.
          </div>
        </>
      )}
    </div>
  );
}

const note = { padding: 12, border: "1px solid #eee", borderRadius: 12 };

const card = {
  border: "1px solid #eee",
  borderRadius: 14,
  padding: 14,
  background: "#fff",
};

const row = {
  display: "grid",
  gridTemplateColumns: "140px 1fr",
  gap: 10,
  padding: "8px 0",
};
const k = { fontWeight: 900, fontSize: 12, opacity: 0.7 };
const v = { fontWeight: 800 };

const btnPrimary = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #cfcfff",
  background: "#eef2ff",
  cursor: "pointer",
  fontWeight: 950,
};

const btnSecondary = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ccc",
  background: "#fff",
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