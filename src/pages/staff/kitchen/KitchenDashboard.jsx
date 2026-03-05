import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { staffContext } from "../../../services/staff/staffAuth.service";
import { useStaffAuth } from "../../../context/StaffAuthContext";

export default function KitchenDashboard() {
  const nav = useNavigate();
  const { exitSmart, clearStaff } = useStaffAuth();

  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState("");
  const [ctx, setCtx] = useState(null);

  useEffect(() => {
    (async () => {
      setBusy(true);
      setErr("");

      try {
        const res = await staffContext();
        const data = res?.data || null;
        setCtx(data);

        const roleName = data?.role?.name;
        if (roleName && roleName !== "kitchen") {
          if (roleName === "waiter") nav("/staff/app", { replace: true });
          else if (roleName === "cashier") nav("/staff/cashier", { replace: true });
          else nav("/staff/select-context", { replace: true });
          return;
        }
      } catch (e) {
        const status = e?.response?.status;

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

  const onExit = async () => {
    setErr("");
    try {
      const res = await exitSmart();

      if (res?.mode === "logout") {
        nav("/staff/login", { replace: true });
      } else {
        nav("/staff/select-context", { replace: true });
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo salir.");
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Panel Cocina</h2>

      {busy ? (
        <div style={note}>Cargando…</div>
      ) : (
        <>
          {err && <div style={msgBoxErr}>{err}</div>}

          {ctx && (
            <div style={card}>
              <div style={row}>
                <div style={k}>Restaurante</div>
                <div style={v}>{ctx?.restaurant?.trade_name || ctx?.restaurant?.name || "—"}</div>
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
              onClick={() => nav("/staff/kitchen")}
              title="Dashboard cocina"
            >
              🍳 Dashboard
            </button>

            <button style={btnDanger} onClick={onExit}>
              Salir
            </button>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Si este usuario solo tiene un contexto, “Salir” cerrará sesión.
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
  border: "1px solid #d1fae5",
  background: "#ecfdf5",
  cursor: "pointer",
  fontWeight: 950,
};

const btnDanger = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ffb4b4",
  background: "#ffe5e5",
  cursor: "pointer",
  fontWeight: 900,
  color: "#7a0010",
};

const msgBoxErr = {
  background: "#ffe5e5",
  border: "1px solid #ffb4b4",
  padding: 10,
  borderRadius: 10,
  marginBottom: 10,
};