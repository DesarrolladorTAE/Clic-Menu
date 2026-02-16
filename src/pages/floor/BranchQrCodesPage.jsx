import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getBranchQrCodes,
  createBranchQrCode,
  updateBranchQrCode,
  deleteBranchQrCode,
} from "../../services/floor/qr/branchQrCodes.service";

import { getTables } from "../../services/floor/tables.service";
import { getBranchSalesChannels } from "../../services/restaurant/branchSalesChannels.service";
import { getOperationalSettings } from "../../services/floor/operationalSettings.service";

// Toast simple (reusamos tu estilo)
function Toast({ open, message, type = "info", onClose }) {
  if (!open) return null;

  const bg =
    type === "success"
      ? "#e6ffed"
      : type === "warning"
      ? "#fff3cd"
      : type === "error"
      ? "#ffe5e5"
      : "#eef2ff";

  const border =
    type === "success"
      ? "#8ae99c"
      : type === "warning"
      ? "#ffe08a"
      : type === "error"
      ? "#ffb3b3"
      : "#cfcfff";

  const color =
    type === "success"
      ? "#0a7a2f"
      : type === "warning"
      ? "#8a6d3b"
      : type === "error"
      ? "#a10000"
      : "#2d2d7a";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 99999,
        maxWidth: 420,
        background: bg,
        border: `1px solid ${border}`,
        color,
        borderRadius: 12,
        padding: "12px 14px",
        boxShadow: "0 12px 24px rgba(0,0,0,0.18)",
        cursor: "pointer",
        whiteSpace: "pre-line",
      }}
      title="Clic para cerrar"
    >
      <div style={{ fontWeight: 900, marginBottom: 6 }}>
        {type === "warning"
          ? "Ojo"
          : type === "error"
          ? "Error"
          : type === "success"
          ? "Listo"
          : "Aviso"}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.35 }}>{message}</div>
      <div style={{ marginTop: 8, fontSize: 11, opacity: 0.75 }}>(clic para cerrar)</div>
    </div>
  );
}

const TYPE_LABEL = {
  physical: "Físico",
  web: "Web",
  delivery: "Delivery",
};

export default function BranchQrCodesPage() {
  const nav = useNavigate();
  const { restaurantId, branchId } = useParams();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [settings, setSettings] = useState(null);
  const [items, setItems] = useState([]);

  const [tables, setTables] = useState([]);
  const [channels, setChannels] = useState([]);

  const [toast, setToast] = useState({ open: false, message: "", type: "info" });
  const showToast = (message, type = "info") => {
    setToast({ open: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, open: false })), 4500);
  };
  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  // modal simple “create” (sin MUI, estilo igual al proyecto)
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "physical",
    sales_channel_id: "",
    table_id: "",
    is_active: true,
  });

  const canCreate = useMemo(() => {
    return (
      String(form.name || "").trim().length > 0 &&
      String(form.sales_channel_id || "").length > 0 &&
      String(form.type || "").length > 0
    );
  }, [form]);

  const loadAll = async () => {
    setLoading(true);
    try {
      // 1) settings (gate)
      let s = null;
      try {
        s = await getOperationalSettings(restaurantId, branchId);
      } catch (e) {
        // si no existe config, no puede crear. mostramos aviso.
        s = null;
      }
      setSettings(s);

      // 2) list qrs
      const list = await getBranchQrCodes(restaurantId, branchId);
      setItems(list);

      // 3) deps (para crear)
      const [t, ch] = await Promise.all([
        getTables(restaurantId, branchId),
        getBranchSalesChannels(restaurantId, branchId),
      ]);

      setTables(t || []);
      // OJO: tu endpoint de branch sales channels normalmente regresa pivot (branch_sales_channels)
      // aquí solo intentamos pintar algo usable.
      setChannels(ch || []);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "No se pudo cargar QRs";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, branchId]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("URL copiada al portapapeles.", "success");
    } catch {
      showToast("No se pudo copiar. Tu navegador decidió sufrir.", "error");
    }
  };

  const onToggleActive = async (qr) => {
    setBusy(true);
    try {
      const updated = await updateBranchQrCode(restaurantId, branchId, qr.id, {
        is_active: !qr.is_active,
      });

      setItems((prev) => prev.map((x) => (x.id === qr.id ? { ...x, ...updated } : x)));
      showToast(`QR ${!qr.is_active ? "activado" : "desactivado"}.`, "success");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "No se pudo actualizar";
      showToast(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (qr) => {
    const ok = window.confirm("¿Eliminar este QR? (Esto también borra la imagen PNG)");
    if (!ok) return;

    setBusy(true);
    try {
      await deleteBranchQrCode(restaurantId, branchId, qr.id);
      setItems((prev) => prev.filter((x) => x.id !== qr.id));
      showToast("QR eliminado.", "success");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "No se pudo eliminar";
      showToast(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  const openCreate = () => {
    // gate UI
    if (!settings) {
      showToast("Primero crea la Configuración Operativa en esta sucursal.", "warning");
      return;
    }
    if (!settings.is_qr_enabled) {
      showToast("Activa QR en Configuración Operativa para poder generar códigos.", "warning");
      return;
    }

    setForm({
      name: "",
      type: "physical",
      sales_channel_id: "",
      table_id: "",
      is_active: true,
    });
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    if (!canCreate) {
      showToast("Completa nombre, tipo y canal.", "warning");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        name: String(form.name).trim(),
        type: form.type,
        sales_channel_id: Number(form.sales_channel_id),
        table_id: form.table_id ? Number(form.table_id) : null,
        is_active: !!form.is_active,
      };

      const created = await createBranchQrCode(restaurantId, branchId, payload);

      setItems((prev) => [created, ...prev]);
      setCreateOpen(false);
      showToast("QR creado.", "success");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "No se pudo crear el QR";
      showToast(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  const channelOptions = useMemo(() => {
    // Soportar varias formas de payload:
    // - [{id,name}]
    // - [{sales_channel_id, salesChannel:{id,name}}] etc.
    return (channels || [])
      .map((row) => {
        const sc = row?.salesChannel || row?.sales_channel || row;
        const id = row?.sales_channel_id ?? sc?.id ?? row?.id;
        const name = sc?.name ?? row?.name ?? `Canal #${id}`;
        if (!id) return null;
        return { id: Number(id), name };
      })
      .filter(Boolean);
  }, [channels]);

  const tableOptions = useMemo(() => {
    return (tables || []).map((t) => ({ id: Number(t.id), name: t.name }));
  }, [tables]);

  if (loading) return <div style={{ padding: 16 }}>Cargando QRs...</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "22px auto", padding: 16 }}>
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={closeToast} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>Administración de QRs</h2>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
            Sucursal: <strong>#{branchId}</strong> · Restaurante: <strong>#{restaurantId}</strong>
            {" · "}
            QR habilitado:{" "}
            <strong>{settings ? (settings.is_qr_enabled ? "Sí" : "No") : "Sin config"}</strong>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={openCreate}
            disabled={busy}
            style={{
              padding: "10px 12px",
              cursor: busy ? "not-allowed" : "pointer",
              fontWeight: 900,
              background: "#eef2ff",
              border: "1px solid #cfcfff",
              borderRadius: 10,
              opacity: busy ? 0.6 : 1,
            }}
          >
            + Crear QR
          </button>

          <button
            onClick={() => nav(`/owner/restaurants/${restaurantId}/branches/${branchId}/tables`)}
            style={{
              padding: "10px 12px",
              cursor: "pointer",
              fontWeight: 900,
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 10,
              background: "#fff",
            }}
            title="Volver al piso"
          >
            ← Volver al piso
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {items.length === 0 ? (
          <div
            style={{
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 14,
              padding: 14,
              background: "#fff",
            }}
          >
            <div style={{ fontWeight: 900 }}>Sin QRs aún</div>
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
              Crea un QR para comedor, delivery, o por mesa.
            </div>
          </div>
        ) : (
          items.map((qr) => (
            <div
              key={qr.id}
              style={{
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 14,
                padding: 14,
                background: "#fff",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 12,
                alignItems: "start",
              }}
            >
              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ fontWeight: 950, fontSize: 14 }}>{qr.name}</div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      padding: "3px 8px",
                      borderRadius: 999,
                      border: "1px solid rgba(0,0,0,0.12)",
                      background: qr.is_active ? "#e6ffed" : "#ffe5e5",
                      color: qr.is_active ? "#0a7a2f" : "#a10000",
                    }}
                  >
                    {qr.is_active ? "Activo" : "Inactivo"}
                  </span>
                  <span style={{ fontSize: 12, opacity: 0.8 }}>
                    Tipo: <strong>{TYPE_LABEL[qr.type] || qr.type}</strong>
                  </span>
                </div>

                <div style={{ fontSize: 13 }}>
                  Canal: <strong>{qr.sales_channel?.name || `#${qr.sales_channel_id}`}</strong>
                  {" · "}
                  Mesa: <strong>{qr.table?.name || (qr.table_id ? `#${qr.table_id}` : "General")}</strong>
                </div>

                <div style={{ fontSize: 12, opacity: 0.85, wordBreak: "break-all" }}>
                  URL: <strong>{qr.public_url}</strong>
                </div>

                {qr.qr_image_url ? (
                  <div style={{ marginTop: 6 }}>
                    <img
                      src={qr.qr_image_url}
                      alt="QR"
                      style={{
                        width: 140,
                        height: 140,
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.12)",
                        background: "#fafafa",
                      }}
                    />
                  </div>
                ) : null}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 170 }}>
                <button
                  onClick={() => copyToClipboard(qr.public_url)}
                  style={{
                    cursor: "pointer",
                    borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: "#fff",
                    padding: "8px 10px",
                    fontWeight: 900,
                  }}
                  title="Copiar URL"
                >
                  📋 Copiar URL
                </button>

                <button
                  onClick={() => onToggleActive(qr)}
                  disabled={busy}
                  style={{
                    cursor: busy ? "not-allowed" : "pointer",
                    borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: qr.is_active ? "#fff3cd" : "#e6ffed",
                    padding: "8px 10px",
                    fontWeight: 900,
                    opacity: busy ? 0.6 : 1,
                  }}
                  title="Activar / Desactivar"
                >
                  {qr.is_active ? "⛔ Desactivar" : "✅ Activar"}
                </button>

                <button
                  onClick={() => window.open(qr.public_url, "_blank")}
                  style={{
                    cursor: "pointer",
                    borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: "#eef2ff",
                    padding: "8px 10px",
                    fontWeight: 900,
                  }}
                  title="Abrir menú público (debug)"
                >
                  🔗 Abrir
                </button>

                <button
                  onClick={() => onDelete(qr)}
                  disabled={busy}
                  style={{
                    cursor: busy ? "not-allowed" : "pointer",
                    borderRadius: 10,
                    border: "1px solid rgba(255,0,0,0.25)",
                    background: "#ffe5e5",
                    padding: "8px 10px",
                    fontWeight: 900,
                    color: "#a10000",
                    opacity: busy ? 0.6 : 1,
                  }}
                  title="Eliminar"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {createOpen ? (
        <div
          onClick={() => !busy && setCreateOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "grid",
            placeItems: "center",
            zIndex: 70,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(720px, 96vw)",
              background: "#fff",
              borderRadius: 16,
              border: "1px solid rgba(0,0,0,0.12)",
              boxShadow: "0 18px 42px rgba(0,0,0,0.22)",
              padding: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 950, fontSize: 15 }}>Crear QR</div>
                <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                  Genera token + PNG y devuelve URL pública.
                </div>
              </div>

              <button
                onClick={() => !busy && setCreateOpen(false)}
                style={{
                  cursor: busy ? "not-allowed" : "pointer",
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "#fff",
                  padding: "6px 10px",
                  fontWeight: 900,
                  opacity: busy ? 0.6 : 1,
                }}
                title="Cerrar"
              >
                ✖
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6 }}>Nombre</div>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder='Ej: "QR Comedor", "Mesa 4"'
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.14)",
                    outline: "none",
                    fontWeight: 700,
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6 }}>Tipo</div>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.14)",
                    outline: "none",
                    fontWeight: 800,
                  }}
                >
                  <option value="physical">Físico</option>
                  <option value="web">Web</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6 }}>Canal de venta</div>
                <select
                  value={form.sales_channel_id}
                  onChange={(e) => setForm((f) => ({ ...f, sales_channel_id: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.14)",
                    outline: "none",
                    fontWeight: 800,
                  }}
                >
                  <option value="">Selecciona...</option>
                  {channelOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>
                  Si no te aparecen canales aquí, es porque aún no configuraste canales por sucursal.
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6 }}>Mesa (opcional)</div>
                <select
                  value={form.table_id}
                  onChange={(e) => setForm((f) => ({ ...f, table_id: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.14)",
                    outline: "none",
                    fontWeight: 800,
                  }}
                >
                  <option value="">General (sin mesa)</option>
                  {tableOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
              <button
                onClick={() => !busy && setCreateOpen(false)}
                style={{
                  cursor: busy ? "not-allowed" : "pointer",
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "#fff",
                  padding: "10px 12px",
                  fontWeight: 900,
                  opacity: busy ? 0.6 : 1,
                }}
              >
                Cancelar
              </button>

              <button
                onClick={submitCreate}
                disabled={busy || !canCreate}
                style={{
                  cursor: busy || !canCreate ? "not-allowed" : "pointer",
                  borderRadius: 10,
                  border: "1px solid #cfcfff",
                  background: "#eef2ff",
                  padding: "10px 12px",
                  fontWeight: 950,
                  opacity: busy || !canCreate ? 0.6 : 1,
                }}
              >
                {busy ? "Creando..." : "Crear QR"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
