import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getRestaurantSettings,
  upsertRestaurantSettings,
} from "../../services/restaurantSettings.service";

const MODES = [
  { value: "global", label: "Global (compartido)" },
  { value: "branch", label: "Por sucursal" },
];

export default function RestaurantSettings() {
  const nav = useNavigate();
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    inventory_mode: "branch",
    products_mode: "global",
    recipe_mode: "global",
  });

  const title = useMemo(() => {
    return `Configuración del restaurante`;
  }, [restaurantId]);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const st = await getRestaurantSettings(restaurantId);
      if (st) {
        setForm({
          inventory_mode: st.inventory_mode ?? "branch",
          products_mode: st.products_mode ?? "global",
          recipe_mode: st.recipe_mode ?? "global",
        });
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudieron cargar los settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [restaurantId]);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    setErr("");
    setSaving(true);
    try {
      await upsertRestaurantSettings(restaurantId, form);
      // regreso a mis restaurantes
      nav("/owner/restaurants", { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Cargando configuración…</div>;

  return (
    <div style={{ maxWidth: 720, margin: "30px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Define cómo se comportará tu restaurante.
          </div>
        </div>

        <button
          onClick={() => nav("/owner/restaurants")}
          style={{ padding: "10px 14px", cursor: "pointer" }}
        >
          ← Volver
        </button>
      </div>

      {err && (
        <div style={{ marginTop: 12, background: "#ffe5e5", padding: 10 }}>
          {err}
        </div>
      )}

      <div
        style={{
          marginTop: 14,
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 14,
          display: "grid",
          gap: 14,
        }}
      >
        <FieldSelect
          label="Modo de inventario"
          value={form.inventory_mode}
          onChange={(v) => onChange("inventory_mode", v)}
          options={MODES}
          help="Global: un solo almacén. Por sucursal: cada sucursal tiene su almacén."
        />

        <FieldSelect
          label="Modo de productos"
          value={form.products_mode}
          onChange={(v) => onChange("products_mode", v)}
          options={MODES}
          help="Global: catálogo base compartido. Por sucursal: cada sucursal administra su catálogo."
        />

        <FieldSelect
          label="Modo de recetas"
          value={form.recipe_mode}
          onChange={(v) => onChange("recipe_mode", v)}
          options={MODES}
          help="Global: receta base compartida. Por sucursal: receta puede variar por sucursal."
        />

        <div
          style={{
            borderTop: "1px solid #eee",
            paddingTop: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div>
            <div style={{ fontWeight: 800 }}>Canales de venta</div>
            <div style={{ marginTop: 4, fontSize: 13, opacity: 0.85 }}>
              Define los canales a nivel restaurante (sin sucursales, sin productos).
            </div>
          </div>

          <button
            onClick={() => nav(`/owner/restaurants/${restaurantId}/sales-channels`)}
            style={{ padding: "10px 14px", cursor: "pointer" }}
          >
            Canales de venta →
          </button>
        </div>


        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={() => nav("/owner/restaurants")}
            style={{ padding: "10px 14px", cursor: "pointer" }}
          >
            Cancelar
          </button>

          <button
            onClick={onSave}
            disabled={saving}
            style={{
              padding: "10px 14px",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Guardando…" : "Guardar configuración"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldSelect({ label, value, onChange, options, help }) {
  return (
    <div>
      <div style={{ fontWeight: 700 }}>{label}</div>
      {help && <div style={{ marginTop: 4, opacity: 0.85, fontSize: 13 }}>{help}</div>}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          marginTop: 8,
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
      >
        {options.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
    </div>
  );
}
