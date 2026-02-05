import { useEffect, useMemo, useRef, useState } from "react";
import { normalizeErr } from "../../utils/err";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../../services/inventory/suppliers/suppliers.service";

function pill(bg, border) {
  return {
    fontSize: 12,
    padding: "2px 8px",
    borderRadius: 999,
    background: bg,
    border: `1px solid ${border}`,
    fontWeight: 900,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };
}

export default function SupplierWizard({ open, restaurantId, onClose, onChanged, preselectId }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  const [editingId, setEditingId] = useState(null);

  // form
  const isEdit = !!editingId;
  const [name, setName] = useState("");
  const [contact_name, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("active");
  const [saving, setSaving] = useState(false);

  const reqRef = useRef(0);

  const load = async ({ initial = false } = {}) => {
    const myReq = ++reqRef.current;
    setErr("");
    if (initial) setLoading(true);

    try {
      const res = await getSuppliers(restaurantId, { only_active: onlyActive, q });
      if (myReq !== reqRef.current) return;
      setRows(res?.data || []);
    } catch (e) {
      if (myReq !== reqRef.current) return;
      setErr(normalizeErr(e, "No se pudieron cargar proveedores"));
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    load({ initial: true });
    // eslint-disable-next-line
  }, [open, restaurantId]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => load({ initial: false }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [q, onlyActive]);

  useEffect(() => {
    if (!open) return;
    setErr("");

    // preselección opcional
    if (preselectId && rows.length) {
      const r = rows.find((x) => x.id === Number(preselectId));
      if (r) startEdit(r);
    }
    // eslint-disable-next-line
  }, [rows.length]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setContactName("");
    setPhone("");
    setEmail("");
    setNotes("");
    setStatus("active");
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setName(r.name || "");
    setContactName(r.contact_name || "");
    setPhone(r.phone || "");
    setEmail(r.email || "");
    setNotes(r.notes || "");
    setStatus(r.status || "active");
  };

  const canSave = useMemo(() => !!name.trim(), [name]);

  const save = async () => {
    setErr("");
    if (!canSave) return;

    const payload = {
      name: name.trim(),
      contact_name: contact_name.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      notes: notes.trim() || null,
      status,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await updateSupplier(restaurantId, editingId, payload);
      } else {
        await createSupplier(restaurantId, payload);
      }
      await load({ initial: false });
      await onChanged?.();
      resetForm();
    } catch (e) {
      setErr(normalizeErr(e, "No se pudo guardar proveedor"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (r) => {
    setErr("");
    const ok = confirm(`¿Eliminar proveedor?\n\n${r.name}\n\nOjo: si está ligado a presentaciones, se quedarán con “Falta elegir proveedor”.`);
    if (!ok) return;

    try {
      await deleteSupplier(restaurantId, r.id);
      await load({ initial: false });
      await onChanged?.();
      if (editingId === r.id) resetForm();
    } catch (e) {
      setErr(normalizeErr(e, "No se pudo eliminar proveedor"));
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
        zIndex: 12000,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div style={{ width: "min(980px, 100%)", background: "#fff", borderRadius: 14, border: "1px solid #eee" }}>
        {/* Header */}
        <div style={{ padding: 14, borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Proveedores</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Administra proveedores del restaurante.</div>
          </div>
          <button onClick={onClose} style={{ padding: "8px 10px", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
          {/* Left: list */}
          <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: 12, borderBottom: "1px solid #eee", background: "#fafafa", display: "flex", gap: 10, alignItems: "center" }}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar proveedor…"
                style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid #ddd" }}
              />
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 800, fontSize: 13 }}>
                <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
                Solo activos
              </label>
            </div>

            {err && (
              <div style={{ margin: 12, background: "#ffe5e5", padding: 10, whiteSpace: "pre-line", borderRadius: 10 }}>
                <strong>Error:</strong> {err}
              </div>
            )}

            {loading ? (
              <div style={{ padding: 14 }}>Cargando proveedores…</div>
            ) : rows.length === 0 ? (
              <div style={{ padding: 14, opacity: 0.8 }}>No hay proveedores todavía.</div>
            ) : (
              <div style={{ maxHeight: 420, overflow: "auto" }}>
                {rows.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: 12,
                      borderBottom: "1px solid #f0f0f0",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      background: editingId === r.id ? "#f7f7ff" : "#fff",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 900, display: "flex", gap: 8, alignItems: "center" }}>
                        {r.name}
                        {r.status === "active" ? (
                          <span style={pill("#e8f5e9", "#c8e6c9")}>Activo</span>
                        ) : (
                          <span style={pill("#ffe5e5", "#ffb3b3")}>Inactivo</span>
                        )}
                      </div>
                      <div style={{ marginTop: 4, fontSize: 12, opacity: 0.75, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r.phone || "—"} · {r.email || "—"}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => startEdit(r)} style={{ padding: "8px 10px", cursor: "pointer" }} title="Editar">
                        ✏️
                      </button>
                      <button onClick={() => remove(r)} style={{ padding: "8px 10px", cursor: "pointer", background: "#ffe5e5" }} title="Eliminar">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ padding: 10, borderTop: "1px solid #eee" }}>
              <button
                onClick={() => load({ initial: false })}
                style={{ width: "100%", padding: "10px 12px", cursor: "pointer", borderRadius: 10, border: "1px solid #eee", background: "#f7f7f7", fontWeight: 900 }}
              >
                ↻ Recargar
              </button>
            </div>
          </div>

          {/* Right: form */}
          <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>
              {isEdit ? "Editar proveedor" : "Nuevo proveedor"}
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontWeight: 900, fontSize: 13 }}>Nombre *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontWeight: 900, fontSize: 13 }}>Contacto</label>
                <input value={contact_name} onChange={(e) => setContactName(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontWeight: 900, fontSize: 13 }}>Teléfono</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontWeight: 900, fontSize: 13 }}>Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
                </div>
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontWeight: 900, fontSize: 13 }}>Notas</label>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontWeight: 900, fontSize: 13 }}>Estado</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
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
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
