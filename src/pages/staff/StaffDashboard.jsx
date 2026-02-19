// src/pages/staff/StaffDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { staffContext } from "../../services/staff/staffAuth.service";
import { useStaffAuth } from "../../context/StaffAuthContext";

export default function StaffDashboard() {
  const nav = useNavigate();
  const { exitBranch, clearStaff } = useStaffAuth();

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

        // 409 = no active context (no branch selected)
        if (status === 409) {
          nav("/staff/select-branch", { replace: true });
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

  const onExitBranch = async () => {
    setErr("");
    try {
      await exitBranch();
      nav("/staff/select-branch", { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo salir de la sucursal.");
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Panel Staff</h2>

      {busy ? (
        <div style={note}>Cargando contexto…</div>
      ) : (
        <>
          {err && <div style={msgBoxErr}>{err}</div>}

          {ctx && (
            <div style={card}>
              <div style={row}>
                <div style={k}>Restaurante</div>
                <div style={v}>{ctx?.restaurant?.name || ctx?.restaurant?.trade_name || "—"}</div>
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
            <button style={btnSecondary} onClick={onExitBranch}>
              Salir de sucursal
            </button>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Para cerrar sesión, sal de la sucursal y usa “Cerrar sesión” en la pantalla de selección.
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

const row = { display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, padding: "8px 0" };
const k = { fontWeight: 900, fontSize: 12, opacity: 0.7 };
const v = { fontWeight: 800 };

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