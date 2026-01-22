import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createBranch } from "../../services/branch.service";
import { handleRestaurantApiError } from "../../utils/subscriptionGuards";



export default function BranchCreate() {
  const nav = useNavigate();
  const { restaurantId } = useParams();

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    open_time: "",
    close_time: "",
  });

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);

    try {
      await createBranch(restaurantId, form);
      nav("/owner/restaurants", { replace: true });
    } catch (e) {
      const redirected = handleRestaurantApiError(e, nav, restaurantId);
      if (!redirected) setErr(e?.response?.data?.message || "No se pudo crear sucursal");

    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "30px auto", padding: 16 }}>
      <h2>Registrar sucursal</h2>

      {err && (
        <div style={{ background: "#ffe5e5", padding: 10, marginTop: 10 }}>
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 10 }}>
          <label>Nombre sucursal</label>
          <input
            value={form.name}
            onChange={onChange("name")}
            required
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Dirección</label>
          <input
            value={form.address}
            onChange={onChange("address")}
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Teléfono</label>
          <input
            value={form.phone}
            onChange={onChange("phone")}
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, marginBottom: 10 }}>
            <label>Hora apertura (HH:MM)</label>
            <input
              value={form.open_time}
              onChange={onChange("open_time")}
              placeholder="09:00"
              style={{ width: "100%", padding: 10 }}
            />
          </div>

          <div style={{ flex: 1, marginBottom: 10 }}>
            <label>Hora cierre (HH:MM)</label>
            <input
              value={form.close_time}
              onChange={onChange("close_time")}
              placeholder="22:00"
              style={{ width: "100%", padding: 10 }}
            />
          </div>
        </div>


        <button disabled={busy} style={{ width: "100%", padding: 10 }}>
          {busy ? "Guardando..." : "Guardar"}
        </button>

        <button
          type="button"
          onClick={() => nav("/owner/restaurants")}
          style={{ width: "100%", padding: 10, marginTop: 8 }}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}
