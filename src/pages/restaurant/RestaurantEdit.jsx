import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRestaurant, updateRestaurant } from "../../services/restaurant.service";

export default function RestaurantEdit() {
  const { id } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    trade_name: "",
    description: "",
    contact_phone: "",
    contact_email: "",
  });

  const onChange = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const res = await getRestaurant(id);

        // por si el backend devuelve {data:{...}} o directo {...}
        const r = res?.data ?? res;

        setForm({
          trade_name: r?.trade_name ?? "",
          description: r?.description ?? "",
          contact_phone: r?.contact_phone ?? "",
          contact_email: r?.contact_email ?? "",
        });
      } catch (e) {
        setErr(e?.response?.data?.message || "No se pudo cargar el restaurante");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);

    try {
      await updateRestaurant(id, form);
      nav("/owner/restaurants", { replace: true });
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        (typeof e?.response?.data === "object" ? JSON.stringify(e.response.data) : null) ||
        "No se pudo actualizar";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Cargando...</div>;

  return (
    <div style={{ maxWidth: 520, margin: "30px auto", padding: 16 }}>
      <h2>Editar restaurante</h2>

      {err && (
        <div style={{ background: "#ffe5e5", padding: 10, marginTop: 10 }}>
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 10 }}>
          <label>Nombre comercial</label>
          <input
            value={form.trade_name}
            onChange={onChange("trade_name")}
            required
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Descripción</label>
          <input
            value={form.description}
            onChange={onChange("description")}
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Teléfono</label>
          <input
            value={form.contact_phone}
            onChange={onChange("contact_phone")}
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Email</label>
          <input
            value={form.contact_email}
            onChange={onChange("contact_email")}
            type="email"
            style={{ width: "100%", padding: 10 }}
          />
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
