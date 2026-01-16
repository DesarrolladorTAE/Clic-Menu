//Estructura de Crear_restaurante
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRestaurant } from "../../services/restaurant.service";

export default function RestaurantCreate() {
  const nav = useNavigate();
 
  //Datos de la tabla
  const [form, setForm] = useState({
    trade_name: "",
    description: "",
    contact_phone: "",
    contact_email: "",
    });

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);

    try {
      await createRestaurant(form);
      nav("/owner/restaurants", { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo crear el restaurante");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "30px auto", padding: 16 }}>
      <h2>Registrar restaurante</h2>

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
            value={form.descripction}
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
