import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getRestaurantSettings,
  upsertRestaurantSettings,
} from "../../services/restaurant/restaurantSettings.service";

const MODES = [
  { value: "global", label: "Global (compartido)" },
  { value: "branch", label: "Por sucursal" },
];

const WARN_BG = "#fff3cd";
const WARN_BORDER = "#ffeeba";

export default function RestaurantSettings() {
  const nav = useNavigate();
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [err, setErr] = useState("");
  const [warn, setWarn] = useState(""); // aviso UX (no error)

  const [form, setForm] = useState({
    inventory_mode: "branch",
    products_mode: "global",
    recipe_mode: "global",
  });

  const title = useMemo(() => `Configuración del restaurante`, [restaurantId]);

  const productsIsBranch = form.products_mode === "branch";

  const load = async () => {
    setErr("");
    setWarn("");
    setLoading(true);
    try {
      const st = await getRestaurantSettings(restaurantId);
      if (st) {
        const next = {
          inventory_mode: st.inventory_mode ?? "branch",
          products_mode: st.products_mode ?? "global",
          recipe_mode: st.recipe_mode ?? "global",
        };

        // UI safety: si backend trae branch, recipe no puede quedar global
        if (next.products_mode === "branch" && next.recipe_mode !== "branch") {
          next.recipe_mode = "branch";
        }

        setForm(next);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudieron cargar los settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [restaurantId]);

  const onChange = (key, value) => {
    setErr("");
    setWarn("");

    setForm((prev) => {
      const next = { ...prev, [key]: value };

      // Regla UX: si products_mode=branch => recipe_mode forzado a branch
      if (key === "products_mode") {
        if (value === "branch") {
          if (next.recipe_mode !== "branch") {
            next.recipe_mode = "branch";
            setWarn("Se fijó “Modo de recetas” en “Por sucursal” porque elegiste “Productos por sucursal”.");
          } else {
            setWarn("Con productos por sucursal, las recetas también deben ser por sucursal.");
          }
        }
      }

      // Si intentan cambiar recipe_mode mientras products=branch, lo bloqueamos
      if (key === "recipe_mode" && next.products_mode === "branch" && value !== "branch") {
        next.recipe_mode = "branch";
        setWarn("Los productos por sucursal no pueden tener recetas globales.");
      }

      return next;
    });
  };

  const onSave = async () => {
    setErr("");
    setWarn("");
    setSaving(true);

    // payload coherente (por si acaso)
    const payload = {
      ...form,
      recipe_mode: form.products_mode === "branch" ? "branch" : form.recipe_mode,
    };

    try {
      const res = await upsertRestaurantSettings(restaurantId, payload);

      // Si backend forzó, avisamos (por si el usuario mandó algo raro o había estado viejo)
      if (res?.recipe_mode_forced) {
        setWarn(
          res?.message ||
            "Ajuste automático: recipe_mode fue fijado en “Por sucursal” porque products_mode=branch."
        );
      }

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
        <div style={{ marginTop: 12, background: "#ffe5e5", padding: 10, borderRadius: 10 }}>
          <strong>Error:</strong> {err}
        </div>
      )}

      {warn && (
        <div
          style={{
            marginTop: 12,
            background: WARN_BG,
            border: `1px solid ${WARN_BORDER}`,
            padding: 10,
            borderRadius: 10,
          }}
        >
          <strong>Nota:</strong> {warn}
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
          disabledValues={productsIsBranch ? ["global"] : []}
          tooltipByValue={
            productsIsBranch
              ? {
                  global: "Los productos por sucursal no pueden tener recetas globales",
                }
              : {}
          }
          lockMessage={
            productsIsBranch
              ? "Bloqueado: con productos por sucursal, las recetas deben ser por sucursal."
              : ""
          }
        />

        {productsIsBranch && (
          <div
            style={{
              background: "#f6f7ff",
              border: "1px solid #dfe3ff",
              borderRadius: 10,
              padding: 12,
              fontSize: 13,
              opacity: 0.95,
            }}
          >
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Regla aplicada</div>
            “Modo de recetas” queda en <strong>Por sucursal</strong> porque elegiste{" "}
            <strong>Productos por sucursal</strong>.
            <div style={{ marginTop: 6, opacity: 0.85 }}>
              Los productos por sucursal no pueden tener recetas globales.
            </div>
          </div>
        )}

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

function FieldSelect({
  label,
  value,
  onChange,
  options,
  help,
  disabledValues = [],
  tooltipByValue = {},
  lockMessage = "",
}) {
  // Si el valor actual quedó “inválido” por deshabilitado, lo mostramos igual pero bloqueado.
  const isLocked = disabledValues.length > 0 && disabledValues.includes(value);

  return (
    <div>
      <div style={{ fontWeight: 700 }}>{label}</div>
      {help && <div style={{ marginTop: 4, opacity: 0.85, fontSize: 13 }}>{help}</div>}
      {lockMessage && (
        <div style={{ marginTop: 6, fontSize: 12, color: "#5c5f7a" }}>
          {lockMessage}
        </div>
      )}

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
          background: "#fff",
        }}
      >
        {options.map((op) => {
          const disabled = disabledValues.includes(op.value);
          const tooltip = tooltipByValue?.[op.value];

          return (
            <option
              key={op.value}
              value={op.value}
              disabled={disabled}
              title={tooltip || ""}
            >
              {op.label}
              {disabled ? " (no disponible)" : ""}
            </option>
          );
        })}
      </select>

      {isLocked && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#a33" }}>
          Este valor ya no es permitido con la configuración actual.
        </div>
      )}
    </div>
  );
}
