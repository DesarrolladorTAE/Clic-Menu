import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBranch, updateBranch } from "../../services/restaurant/branch.service";
import { handleRestaurantApiError } from "../../utils/subscriptionGuards";

export default function BranchEdit() {
  const nav = useNavigate();
  const { restaurantId, branchId } = useParams();

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    open_time: "",
    close_time: "",
    status: "active",
  });

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const res = await getBranch(restaurantId, branchId);

        // por si backend regresa {data: {...}}
        const b = res?.data ?? res;

        setForm({
          name: b?.name ?? "",
          address: b?.address ?? "",
          phone: b?.phone ?? "",
          open_time: (b?.open_time ?? "").slice(0, 5),
          close_time: (b?.close_time ?? "").slice(0, 5),
          status: b?.status ?? "active",
        });
      } catch (e) {
        const redirected = handleRestaurantApiError(e, nav, restaurantId);
        if (!redirected) setErr(e?.response?.data?.message || "No se pudo cargar la sucursal");

      } finally {
        setLoading(false);
      }
    })();
  }, [restaurantId, branchId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await updateBranch(restaurantId, branchId, form);
      nav("/owner/restaurants", { replace: true });
    } catch (e) {
      const redirected = handleRestaurantApiError(e, nav, restaurantId);
      if (!redirected) setErr(e?.response?.data?.message || "No se pudo guardar los cambios de la  sucursal");

    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Cargando sucursal...</div>;

  return (
    <div style={{ maxWidth: 520, margin: "30px auto", padding: 16 }}>
      <h2>Editar sucursal</h2>

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
            <label>Hora apertura</label>
            <input
              value={form.open_time}
              onChange={onChange("open_time")}
              placeholder="09:00"
              style={{ width: "100%", padding: 10 }}
            />
          </div>

          <div style={{ flex: 1, marginBottom: 10 }}>
            <label>Hora cierre</label>
            <input
              value={form.close_time}
              onChange={onChange("close_time")}
              placeholder="22:00"
              style={{ width: "100%", padding: 10 }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Estatus</label>
          <select
            value={form.status}
            onChange={onChange("status")}
            style={{ width: "100%", padding: 10 }}
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>

        <button disabled={busy} style={{ width: "100%", padding: 10 }}>
          {busy ? "Guardando..." : "Guardar cambios"}
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
