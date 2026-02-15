import { useEffect, useMemo, useRef, useState } from "react";
import { normalizeErr } from "../../utils/err";
import {
  getIngredientGroups,
  createIngredientGroup,
  updateIngredientGroup,
  deleteIngredientGroup,
} from "../../services/inventory/ingredients/ingredientsGroups.service";

export default function IngredientGroupWizard({ open, restaurantId, onClose, onChanged }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [rows, setRows] = useState([]);

  // form (create/edit)
  const [mode, setMode] = useState("create"); // create | edit
  const [editId, setEditId] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [status, setStatus] = useState("active");

  const [saving, setSaving] = useState(false);

  const reqRef = useRef(0);

  const resetForm = () => {
    setMode("create");
    setEditId(null);
    setName("");
    setDescription("");
    setSortOrder("0");
    setStatus("active");
  };

  const load = async () => {
    const myReq = ++reqRef.current;
    setErr("");
    setLoading(true);
    try {
      const res = await getIngredientGroups(restaurantId);
      if (myReq !== reqRef.current) return;
      setRows(res?.data || []);
    } catch (e) {
      if (myReq !== reqRef.current) return;
      setErr(normalizeErr(e, "No se pudieron cargar los grupos"));
      setRows([]);
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    resetForm();
    load();
    // eslint-disable-next-line
  }, [open, restaurantId]);

  const canSave = useMemo(() => {
    if (!name.trim()) return false;
    const n = Number(sortOrder);
    if (!Number.isFinite(n) || n < 0) return false;
    return true;
  }, [name, sortOrder]);

  const onPickEdit = (g) => {
    setErr("");
    setMode("edit");
    setEditId(g.id);
    setName(g.name || "");
    setDescription(g.description || "");
    setSortOrder(String(g.sort_order ?? 0));
    setStatus(g.status || "active");
  };

  const save = async () => {
    setErr("");

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      sort_order: Number(sortOrder),
      status,
    };

    if (!Number.isFinite(payload.sort_order) || payload.sort_order < 0) {
      return setErr("sort_order inválido (usa 0 o más).");
    }

    setSaving(true);
    try {
      let created = null;

      if (mode === "create") {
        const res = await createIngredientGroup(restaurantId, payload);
        created = res?.data || null;
      } else {
        await updateIngredientGroup(restaurantId, editId, payload);
      }

      await load();

      // notificar afuera (para recargar selector)
      await onChanged?.({
        type: mode,
        created,
      });

      if (mode === "create") {
        // Deja el form listo para crear otro
        resetForm();
      }
    } catch (e) {
      setErr(normalizeErr(e, "No se pudo guardar el grupo"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (g) => {
    setErr("");
    const ok = confirm(`¿Eliminar el grupo?\n\n${g.name}\n\nSi hay ingredientes usando este grupo, el backend debería bloquearlo.`);
    if (!ok) return;

    try {
      await deleteIngredientGroup(restaurantId, g.id);
      await load();
      await onChanged?.({ type: "delete", deletedId: g.id });
      if (editId === g.id) resetForm();
    } catch (e) {
      setErr(normalizeErr(e, "No se pudo eliminar"));
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
        zIndex: 11000,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div style={{ width: "min(980px, 100%)", background: "#fff", borderRadius: 14, border: "1px solid #eee" }}>
        {/* Header */}
        <div style={{ padding: 14, borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Grupos de ingredientes</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Administra “Carnes”, “Lácteos”, etc. (Restaurante: <strong>{restaurantId}</strong>)
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={resetForm} style={{ padding: "8px 10px", cursor: "pointer" }} title="Nuevo">
              + Nuevo
            </button>
            <button onClick={onClose} style={{ padding: "8px 10px", cursor: "pointer" }}>
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 14 }}>
          {/* Left: table */}
          <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: 12, borderBottom: "1px solid #eee", fontWeight: 900 }}>
              Lista
              {loading && <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>cargando…</span>}
            </div>

            {err && (
              <div style={{ margin: 12, background: "#ffe5e5", padding: 10, borderRadius: 10, whiteSpace: "pre-line" }}>
                <strong>Error:</strong> {err}
              </div>
            )}

            <div style={{ width: "100%", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 540 }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Nombre</th>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Orden</th>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Estado</th>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && rows.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: 12, opacity: 0.8 }}>
                        No hay grupos. Crea el primero (sí, el sistema no adivina).
                      </td>
                    </tr>
                  ) : (
                    rows.map((g) => (
                      <tr key={g.id} style={editId === g.id ? { background: "#f7fbff" } : undefined}>
                        <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                          <div style={{ fontWeight: 900 }}>{g.name}</div>
                          {g.description && <div style={{ fontSize: 12, opacity: 0.75 }}>{g.description}</div>}
                        </td>
                        <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>{g.sort_order ?? 0}</td>
                        <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                          <span style={{ fontWeight: 800, color: g.status === "active" ? "#0a7a0a" : "#a10000" }}>
                            {g.status === "active" ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button
                              onClick={() => onPickEdit(g)}
                              style={{ padding: "8px 10px", cursor: "pointer" }}
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => remove(g)}
                              style={{ padding: "8px 10px", cursor: "pointer", background: "#ffe5e5" }}
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ padding: 10, fontSize: 12, opacity: 0.7 }}>
              Tip: si el backend bloquea eliminar porque hay ingredientes ligados, es correcto.
            </div>
          </div>

          {/* Right: form */}
          <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>
              {mode === "create" ? "Crear grupo" : `Editar grupo #${editId}`}
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontWeight: 900, fontSize: 13 }}>Nombre *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Lácteos"
                  style={{ padding: "10px", borderRadius: 10, border: "1px solid #ddd" }}
                />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontWeight: 900, fontSize: 13 }}>Descripción</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Opcional"
                  style={{ padding: "10px", borderRadius: 10, border: "1px solid #ddd" }}
                />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontWeight: 900, fontSize: 13 }}>Orden</label>
                <input
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  inputMode="numeric"
                  style={{ padding: "10px", borderRadius: 10, border: "1px solid #ddd" }}
                />
                <div style={{ fontSize: 12, opacity: 0.7 }}>0 = normal. Entre más bajo, aparece primero.</div>
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontWeight: 900, fontSize: 13 }}>Estado</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: "10px", borderRadius: 10, border: "1px solid #ddd" }}>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
                <button onClick={resetForm} style={{ padding: "10px 12px", cursor: "pointer" }}>
                  Limpiar
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
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: 12, borderTop: "1px solid #eee", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 12px", cursor: "pointer" }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
