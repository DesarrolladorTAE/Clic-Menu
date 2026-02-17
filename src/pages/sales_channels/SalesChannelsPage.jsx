import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createSalesChannel,
  deleteSalesChannel,
  getSalesChannels,
  updateSalesChannel,
} from "../../services/products/sales_channels/sales_channels.service";

const STATUS_OPTIONS = [
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
];

// ✅ Canal fijo
const SALON_CODE = "SALON";

function normalizeCode(v) {
  return (v || "")
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");
}

// ✅ helper: detectar SALON de forma tolerante
function isSalonChannel(it) {
  const code = normalizeCode(it?.code);
  return code === SALON_CODE;
}

export default function SalesChannelsPage() {
  const nav = useNavigate();
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [items, setItems] = useState([]);

  // modal simple inline
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // objeto canal o null

  const [form, setForm] = useState({
    code: "",
    name: "",
    status: "active",
  });

  const title = useMemo(() => {
    return `Canales de venta del restaurante`;
  }, []);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await getSalesChannels(restaurantId);
      const list = Array.isArray(res) ? res : res?.data ?? [];
      setItems(list);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudieron cargar los canales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [restaurantId]);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: "", name: "", status: "active" });
    setOpen(true);
  };

  const openEdit = (it) => {
    // ✅ Si es SALON, ni siquiera abrimos edición
    if (isSalonChannel(it)) {
      setErr('El canal "Salón" es fijo y no puede editarse.');
      return;
    }

    setEditing(it);
    setForm({
      code: it.code ?? "",
      name: it.name ?? "",
      status: it.status ?? "active",
    });
    setOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setOpen(false);
    setEditing(null);
  };

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async () => {
    setErr("");

    // ✅ Protección extra: si por alguna razón intentan guardar SALON desde aquí, lo bloqueamos
    if (editing?.id && isSalonChannel(editing)) {
      setErr('El canal "Salón" es fijo y no puede modificarse.');
      return;
    }

    const payload = {
      code: normalizeCode(form.code),
      name: (form.name || "").trim(),
      status: form.status,
    };

    if (!payload.code) {
      setErr("El code es obligatorio. Ej: COMEDOR, DELIVERY, PICKUP");
      return;
    }
    if (!payload.name) {
      setErr("El nombre es obligatorio. Ej: Comedor, Delivery");
      return;
    }

    // ✅ Protección extra: no permitir que creen otro canal con code SALON desde UI
    if (!editing?.id && payload.code === SALON_CODE) {
      setErr('El code "SALON" está reservado y se crea automáticamente.');
      return;
    }

    setSaving(true);
    try {
      if (editing?.id) {
        await updateSalesChannel(restaurantId, editing.id, payload);
      } else {
        await createSalesChannel(restaurantId, payload);
      }
      setOpen(false);
      setEditing(null);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo guardar el canal");
    } finally {
      setSaving(false);
    }
  };

  const onToggleStatus = async (it) => {
    // ✅ SALON no se desactiva
    if (isSalonChannel(it)) {
      setErr('El canal "Salón" es fijo y no puede desactivarse.');
      return;
    }

    setErr("");
    setSaving(true);
    try {
      const next = it.status === "active" ? "inactive" : "active";
      await updateSalesChannel(restaurantId, it.id, { status: next });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo cambiar el estado");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (it) => {
    // ✅ SALON no se elimina
    if (isSalonChannel(it)) {
      setErr('El canal "Salón" es fijo y no puede eliminarse.');
      return;
    }

    const ok = confirm(`¿Eliminar canal "${it.name}"?`);
    if (!ok) return;

    setErr("");
    setSaving(true);
    try {
      await deleteSalesChannel(restaurantId, it.id);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo eliminar el canal");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Cargando canales…</div>;

  const editingIsSalon = isSalonChannel(editing);

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Aquí solo defines el catálogo de canales posibles. No hay sucursales, no hay productos.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => nav(`/owner/restaurants/${restaurantId}/settings`)}
            style={{ padding: "10px 14px", cursor: "pointer" }}
          >
            ← Volver
          </button>

          <button
            onClick={openCreate}
            style={{ padding: "10px 14px", cursor: "pointer" }}
          >
            + Crear canal
          </button>
        </div>
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
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr 140px 240px",
            gap: 0,
            padding: "10px 12px",
            fontWeight: 800,
            background: "#f7f7f7",
            borderBottom: "1px solid #eee",
          }}
        >
          <div>Code</div>
          <div>Nombre</div>
          <div>Estado</div>
          <div style={{ textAlign: "right" }}>Acciones</div>
        </div>

        {items.length === 0 ? (
          <div style={{ padding: 14, opacity: 0.85 }}>
            No hay canales todavía. Crea el primero (ej. COMEDOR).
          </div>
        ) : (
          items.map((it) => {
            const active = it.status === "active";
            const locked = isSalonChannel(it); // ✅ SALON bloqueado

            return (
              <div
                key={it.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "200px 1fr 140px 240px",
                  padding: "10px 12px",
                  borderBottom: "1px solid #f0f0f0",
                  alignItems: "center",
                }}
              >
                <div style={{ fontFamily: "monospace", fontWeight: 700 }}>
                  {it.code}
                </div>

                <div style={{ fontWeight: 700, display: "flex", gap: 10, alignItems: "center" }}>
                  <span>{it.name}</span>

                  {locked && (
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 999,
                        border: "1px solid rgba(0,0,0,0.08)",
                        background: "#eef2ff",
                        fontWeight: 900,
                      }}
                      title="Canal fijo del sistema"
                    >
                      Fijo
                    </span>
                  )}
                </div>

                <div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 800,
                      background: active ? "#e6ffed" : "#eee",
                      color: active ? "#0a7a2f" : "#444",
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    {active ? "Activo" : "Inactivo"}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button
                    onClick={() => onToggleStatus(it)}
                    disabled={saving || locked}
                    style={{
                      padding: "8px 10px",
                      cursor: saving || locked ? "not-allowed" : "pointer",
                      opacity: saving || locked ? 0.55 : 1,
                    }}
                    title={locked ? 'El canal "Salón" no se puede desactivar' : "Activar / desactivar"}
                  >
                    {active ? "Desactivar" : "Activar"}
                  </button>

                  <button
                    onClick={() => openEdit(it)}
                    disabled={saving || locked}
                    style={{
                      padding: "8px 10px",
                      cursor: saving || locked ? "not-allowed" : "pointer",
                      opacity: saving || locked ? 0.55 : 1,
                    }}
                    title={locked ? 'El canal "Salón" no se puede editar' : "Editar"}
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => onDelete(it)}
                    disabled={saving || locked}
                    style={{
                      padding: "8px 10px",
                      cursor: saving || locked ? "not-allowed" : "pointer",
                      opacity: saving || locked ? 0.55 : 1,
                      background: "#ffe5e5",
                    }}
                    title={locked ? 'El canal "Salón" no se puede eliminar' : "Eliminar"}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal básico, sin librerías nuevas */}
      {open && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 520,
              background: "#fff",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.15)",
              padding: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16 }}>
                  {editing ? "Editar canal" : "Crear canal"}
                </div>

                <div style={{ marginTop: 4, opacity: 0.85, fontSize: 13 }}>
                  Code recomendado: COMEDOR, DELIVERY, PICKUP, UBER_EATS
                </div>

                {editing && editingIsSalon && (
                  <div style={{ marginTop: 6, fontSize: 12, color: "#333", opacity: 0.9 }}>
                    Este canal es <strong>fijo</strong> y no se puede modificar.
                  </div>
                )}
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                style={{ padding: "8px 10px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 800 }}>Code</div>
                <input
                  value={form.code}
                  onChange={(e) => onChange("code", e.target.value)}
                  placeholder="DELIVERY"
                  disabled={saving || editingIsSalon}
                  style={{
                    marginTop: 6,
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    opacity: saving || editingIsSalon ? 0.7 : 1,
                  }}
                />
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                  Se normaliza a MAYÚSCULAS con guion bajo.
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 800 }}>Nombre</div>
                <input
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder="Delivery"
                  disabled={saving || editingIsSalon}
                  style={{
                    marginTop: 6,
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    opacity: saving || editingIsSalon ? 0.7 : 1,
                  }}
                />
              </div>

              <div>
                <div style={{ fontWeight: 800 }}>Estado</div>
                <select
                  value={form.status}
                  onChange={(e) => onChange("status", e.target.value)}
                  disabled={saving || editingIsSalon}
                  style={{
                    marginTop: 6,
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    cursor: saving || editingIsSalon ? "not-allowed" : "pointer",
                    opacity: saving || editingIsSalon ? 0.7 : 1,
                  }}
                >
                  {STATUS_OPTIONS.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  onClick={closeModal}
                  disabled={saving}
                  style={{ padding: "10px 14px", cursor: "pointer" }}
                >
                  Cancelar
                </button>

                <button
                  onClick={onSubmit}
                  disabled={saving || editingIsSalon}
                  style={{
                    padding: "10px 14px",
                    cursor: saving || editingIsSalon ? "not-allowed" : "pointer",
                    opacity: saving || editingIsSalon ? 0.7 : 1,
                  }}
                  title={editingIsSalon ? 'El canal "Salón" no se puede guardar porque es fijo' : "Guardar"}
                >
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
