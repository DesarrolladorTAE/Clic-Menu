// src/components/inventory/ingredients/IngredientFormModal.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { normalizeErr } from "../../utils/err";

import { getIngredientGroups } from "../../services/inventory/ingredients/ingredientsGroups.service";

import IngredientGroupWizard from "./IngredientsGroupWizard";

const UNITS = [
  { value: "g", label: "g (gramos)" },
  { value: "ml", label: "ml (mililitros)" },
  { value: "pz", label: "pz (piezas)" },
];

export default function IngredientFormModal({
  open,
  onClose,
  restaurantId,
  editRow,
  onSaved,
  api, // api.createIngredient / api.updateIngredient
}) {
  const isEdit = !!editRow?.id;

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("g");

  const [ingredientGroupId, setIngredientGroupId] = useState("");
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [openGroupWizard, setOpenGroupWizard] = useState(false);

  const [waste_percentage, setWaste] = useState("");
  const [is_stock_item, setIsStock] = useState(true);
  const [status, setStatus] = useState("active");

  // anti race conditions
  const reqRef = useRef(0);

  // ---------- Load groups on open ----------
  const loadGroups = async () => {
    const myReq = ++reqRef.current;
    setGroupsLoading(true);
    try {
      const res = await getIngredientGroups(restaurantId);
      if (myReq !== reqRef.current) return;
      setGroups(res?.data || []);
    } catch (e) {
      if (myReq !== reqRef.current) return;
      setGroups([]);
    } finally {
      if (myReq !== reqRef.current) return;
      setGroupsLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setErr("");
    loadGroups();
    // eslint-disable-next-line
  }, [open, restaurantId]);

  // ---------- Set form state on open / edit ----------
  useEffect(() => {
    if (!open) return;
    setErr("");

    if (isEdit) {
      setCode(editRow.code || "");
      setName(editRow.name || "");
      setUnit(editRow.unit || "g");

      // 👇 ahora es FK
      setIngredientGroupId(editRow.ingredient_group_id ? String(editRow.ingredient_group_id) : "");

      setWaste(editRow.waste_percentage ?? "");
      setIsStock(!!editRow.is_stock_item);
      setStatus(editRow.status || "active");
    } else {
      setCode("");
      setName("");
      setUnit("g");
      setIngredientGroupId("");
      setWaste("");
      setIsStock(true);
      setStatus("active");
    }
    // eslint-disable-next-line
  }, [open, editRow?.id]);

  // ---------- Preconditions ----------
  const hasGroups = useMemo(() => {
    if (groupsLoading) return true; // mientras carga no bloquees por "0"
    return Array.isArray(groups) && groups.length > 0;
  }, [groups, groupsLoading]);

  const canSave = useMemo(() => {
    if (!name.trim()) return false;
    if (!unit) return false;
    if (!hasGroups) return false;
    if (!ingredientGroupId) return false;
    return true;
  }, [name, unit, ingredientGroupId, hasGroups]);

  const title = isEdit ? "Editar ingrediente" : "Nuevo ingrediente";

  // ---------- Save ----------
  const save = async () => {
    setErr("");

    if (!hasGroups) {
      return setErr("No hay grupos. Crea un grupo primero (botón +).");
    }
    if (!ingredientGroupId) {
      return setErr("Selecciona un grupo.");
    }

    const payload = {
      code: code.trim() || null,
      name: name.trim(),
      unit,
      ingredient_group_id: Number(ingredientGroupId),
      is_stock_item: !!is_stock_item,
      waste_percentage: waste_percentage === "" ? null : Number(waste_percentage),
      status,
    };

    if (!Number.isFinite(payload.ingredient_group_id)) {
      return setErr("Grupo inválido.");
    }

    if (payload.waste_percentage !== null && !Number.isFinite(payload.waste_percentage)) {
      return setErr("Merma inválida.");
    }
    if (payload.waste_percentage !== null && (payload.waste_percentage < 0 || payload.waste_percentage > 100)) {
      return setErr("Merma debe estar entre 0 y 100.");
    }

    setSaving(true);
    try {
      if (isEdit) {
        await api.updateIngredient(restaurantId, editRow.id, payload);
      } else {
        await api.createIngredient(restaurantId, payload);
      }

      await onSaved?.();
      onClose?.();
    } catch (e) {
      setErr(normalizeErr(e, "No se pudo guardar"));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 10000,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div style={{ width: "min(720px, 100%)", background: "#fff", borderRadius: 14, border: "1px solid #eee" }}>
        {/* Header */}
        <div
          style={{
            padding: 14,
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Restaurante: <strong>{restaurantId}</strong>
              {groupsLoading && <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.65 }}>cargando grupos…</span>}
            </div>
          </div>

          <button onClick={onClose} style={{ padding: "8px 10px", cursor: "pointer" }} title="Cerrar">
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 14 }}>
          {err && (
            <div style={{ marginBottom: 12, background: "#ffe5e5", padding: 10, whiteSpace: "pre-line", borderRadius: 10 }}>
              <strong>Error:</strong> {err}
            </div>
          )}

          {!groupsLoading && groups.length === 0 && (
            <div style={{ marginBottom: 12, background: "#fff3cd", border: "1px solid #ffeeba", padding: 10, borderRadius: 10 }}>
              No hay grupos de ingredientes. Primero crea uno con el botón <strong>+</strong>.
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontWeight: 900, fontSize: 13 }}>Nombre *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Queso"
                style={{ padding: "10px 10px", borderRadius: 10, border: "1px solid #ddd" }}
              />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontWeight: 900, fontSize: 13 }}>Clave (opcional)</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ej. QSO001"
                style={{ padding: "10px 10px", borderRadius: 10, border: "1px solid #ddd" }}
              />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontWeight: 900, fontSize: 13 }}>Unidad base *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                style={{ padding: "10px 10px", borderRadius: 10, border: "1px solid #ddd" }}
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontWeight: 900, fontSize: 13 }}>Grupo *</label>

              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={ingredientGroupId}
                  onChange={(e) => setIngredientGroupId(e.target.value)}
                  disabled={groupsLoading || groups.length === 0}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    background: groupsLoading ? "#fafafa" : "#fff",
                  }}
                >
                  <option value="">
                    {groupsLoading ? "Cargando grupos..." : groups.length === 0 ? "No hay grupos" : "Selecciona un grupo"}
                  </option>

                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} {g.status === "inactive" ? "(Inactivo)" : ""}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setOpenGroupWizard(true)}
                  title="Administrar grupos"
                  style={{
                    padding: "0 14px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    background: "#fafafa",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </div>

              <div style={{ fontSize: 12, opacity: 0.7 }}>
                El grupo viene de <code>ingredient_groups</code>. Si no existe, debes crearlo.
              </div>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontWeight: 900, fontSize: 13 }}>Merma (%)</label>
              <input
                value={waste_percentage}
                onChange={(e) => setWaste(e.target.value)}
                placeholder="Ej. 5"
                inputMode="decimal"
                style={{ padding: "10px 10px", borderRadius: 10, border: "1px solid #ddd" }}
              />
              <div style={{ fontSize: 12, opacity: 0.7 }}>0 a 100. Si lo dejas vacío, queda NULL.</div>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 900 }}>
                <input type="checkbox" checked={is_stock_item} onChange={(e) => setIsStock(e.target.checked)} />
                Inventariable
              </label>

              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontWeight: 900, fontSize: 13 }}>Estado</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ padding: "10px 10px", borderRadius: 10, border: "1px solid #ddd" }}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "10px 12px", cursor: "pointer" }}>
              Cancelar
            </button>

            <button
              onClick={save}
              disabled={!canSave || saving}
              style={{
                padding: "10px 12px",
                cursor: !canSave || saving ? "not-allowed" : "pointer",
                background: "#111",
                color: "#fff",
                fontWeight: 900,
                borderRadius: 10,
                border: "1px solid #111",
                opacity: !canSave || saving ? 0.6 : 1,
              }}
              title={!hasGroups ? "Primero crea un grupo" : !ingredientGroupId ? "Selecciona un grupo" : "Guardar"}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>

          {isEdit && (
            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
              Nota: <code>last_cost</code> y <code>avg_cost</code> no se editan aquí. Se calculan con compras reales.
            </div>
          )}
        </div>
      </div>

      {/* Wizard real */}
      <IngredientGroupWizard
        open={openGroupWizard}
        restaurantId={restaurantId}
        onClose={() => setOpenGroupWizard(false)}
        onChanged={async (evt) => {
          // recarga grupos para selector
          const res = await getIngredientGroups(restaurantId);
          const next = res?.data || [];
          setGroups(next);

          // auto-select recién creado
          if (evt?.type === "create" && evt?.created?.id) {
            setIngredientGroupId(String(evt.created.id));
          } else {
            // si el actual fue eliminado, límpialo
            if (ingredientGroupId && !next.some((g) => String(g.id) === String(ingredientGroupId))) {
              setIngredientGroupId("");
            }
          }
        }}
      />
    </div>
  );
}
