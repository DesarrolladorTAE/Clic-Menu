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

// Toast simple
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
        maxWidth: 520,
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

function Banner({ tone = "warning", title, body }) {
  const map = {
    warning: { bg: "#fff3cd", bd: "#ffe08a", fg: "#8a6d3b" },
    error: { bg: "#ffe5e5", bd: "#ffb3b3", fg: "#a10000" },
    info: { bg: "#eef2ff", bd: "#cfcfff", fg: "#2d2d7a" },
    ok: { bg: "#e6ffed", bd: "#8ae99c", fg: "#0a7a2f" },
  };
  const c = map[tone] || map.info;

  return (
    <div
      style={{
        marginTop: 12,
        border: `1px solid ${c.bd}`,
        background: c.bg,
        borderRadius: 14,
        padding: 12,
        color: c.fg,
      }}
    >
      <div style={{ fontWeight: 950 }}>{title}</div>
      {body ? (
        <div style={{ marginTop: 6, fontSize: 13, whiteSpace: "pre-line", fontWeight: 750 }}>
          {body}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Detecta “Salón” por nombre (lo mismo que tu back).
 */
function isSalonName(name) {
  const n = String(name || "").trim().toLowerCase();
  return n === "salón" || n === "salon" || n === "salón " || n === "salon ";
}

function getQrNoticeForCreate({ type, tableId, orderingMode }) {
  const hasTable = !!tableId;

  // Delivery / Web: siempre read-only
  if (type === "delivery") {
    return "Menú por canal (Delivery), solo lectura.";
  }
  if (type === "web") {
    return "Menú web, solo lectura. Selecciona el canal a visualizar.";
  }

  // Physical
  if (!hasTable) {
    return "Menú completo, solo lectura.";
  }

  // Physical + mesa => depende ordering_mode
  if (String(orderingMode) === "customer_assisted") {
    return "Menú para pedidos del cliente (cliente asistido).";
  }

  return "Menú para pedidos del mesero (solo mesero).";
}

export default function BranchQrCodesPage() {
  const nav = useNavigate();
  const { restaurantId, branchId } = useParams();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // settings response: { data, ui, notices }
  const [settingsRes, setSettingsRes] = useState(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const [items, setItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [channels, setChannels] = useState([]);

  const [toast, setToast] = useState({ open: false, message: "", type: "info" });
  const showToast = (message, type = "info") => {
    setToast({ open: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, open: false })), 4500);
  };
  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  // modal create
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "physical",
    sales_channel_id: "",
    table_id: "",
    is_active: true,
  });

  const settings = settingsRes?.data ?? null;
  const uiMeta = settingsRes?.ui ?? null;
  const notices = Array.isArray(settingsRes?.notices) ? settingsRes.notices : [];

  // Gate real:
  // - si backend manda ui.can_manage_qr => usarlo
  // - si no, fallback a settings.is_qr_enabled
  const canManageQr = useMemo(() => {
    if (uiMeta && typeof uiMeta.can_manage_qr === "boolean") return uiMeta.can_manage_qr;
    return !!settings?.is_qr_enabled;
  }, [uiMeta, settings]);

  const manageQrBlockReason = uiMeta?.manage_qr_block_reason || null;

  const channelOptionsRaw = useMemo(() => {
    return (channels || [])
      .map((row) => {
        const sc = row?.salesChannel || row?.sales_channel || row;
        const id = row?.sales_channel_id ?? sc?.id ?? row?.id;
        const name = sc?.name ?? row?.name ?? null;
        if (!id || !name) return null;
        return { id: Number(id), name: String(name) };
      })
      .filter(Boolean);
  }, [channels]);

  const salonChannel = useMemo(() => {
    return channelOptionsRaw.find((c) => isSalonName(c.name)) || null;
  }, [channelOptionsRaw]);

  const filteredChannelOptions = useMemo(() => {
    const type = String(form.type || "");
    if (!type) return [];

    // 1) physical => SOLO Salón
    if (type === "physical") {
      return salonChannel ? [salonChannel] : [];
    }

    // 2) delivery => TODOS MENOS salón
    if (type === "delivery") {
      return (channelOptionsRaw || []).filter((c) => !isSalonName(c.name));
    }

    // 3) web => SOLO salón
    if (type === "web") {
      return salonChannel ? [salonChannel] : [];
    }

    return channelOptionsRaw || [];
  }, [form.type, channelOptionsRaw, salonChannel]);

  const tableOptions = useMemo(() => {
    return (tables || []).map((t) => ({ id: Number(t.id), name: t.name }));
  }, [tables]);

  const filteredTableOptions = useMemo(() => {
    const type = String(form.type || "");
    if (type === "delivery" || type === "web") {
      // solo “General”
      return [];
    }
    return tableOptions;
  }, [form.type, tableOptions]);

  // Corrige selects cuando cambias tipo: fuerza canal/mesa válidos según reglas
  useEffect(() => {
    const type = String(form.type || "");
    const currentChannelId = form.sales_channel_id ? Number(form.sales_channel_id) : null;

    // delivery/web => mesa general
    if (type === "delivery" || type === "web") {
      if (form.table_id) {
        setForm((f) => ({ ...f, table_id: "" }));
      }
    }

    // Ajustar canal por tipo
    if (type === "physical" || type === "web") {
      const wanted = salonChannel?.id ? String(salonChannel.id) : "";
      if (wanted && form.sales_channel_id !== wanted) {
        setForm((f) => ({ ...f, sales_channel_id: wanted }));
      }
      if (!wanted && form.sales_channel_id) {
        setForm((f) => ({ ...f, sales_channel_id: "" }));
      }
      return;
    }

    if (type === "delivery") {
      // si trae salón seleccionado, límpialo
      if (currentChannelId && salonChannel?.id && currentChannelId === salonChannel.id) {
        setForm((f) => ({ ...f, sales_channel_id: "" }));
        return;
      }
      // si no hay canal y hay opciones, preselecciona el primero
      if (!form.sales_channel_id && filteredChannelOptions.length > 0) {
        setForm((f) => ({ ...f, sales_channel_id: String(filteredChannelOptions[0].id) }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.type, salonChannel?.id]);

  const canCreate = useMemo(() => {
    const hasName = String(form.name || "").trim().length > 0;
    const hasType = String(form.type || "").length > 0;
    const hasChannel = String(form.sales_channel_id || "").length > 0;

    // En delivery/web: mesa no importa (siempre general)
    // En physical: mesa opcional, sigue pudiendo crear sin mesa
    return hasName && hasType && hasChannel;
  }, [form]);

  const loadAll = async () => {
    setLoading(true);
    try {
      // 1) settings (gate)
      let s = null;
      try {
        s = await getOperationalSettings(restaurantId, branchId);
      } catch (e) {
        s = null;
      }
      setSettingsRes(s);
      setSettingsLoaded(true);

      // 2) list qrs
      const list = await getBranchQrCodes(restaurantId, branchId);
      setItems(list);

      // 3) deps
      const [t, ch] = await Promise.all([
        getTables(restaurantId, branchId),
        getBranchSalesChannels(restaurantId, branchId),
      ]);

      setTables(t || []);
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
    if (!canManageQr) {
      showToast(manageQrBlockReason || "QR no habilitado para esta sucursal.", "warning");
      return;
    }

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
    if (!settingsLoaded || !settingsRes || !settings) {
      showToast("No puedes administrar QRs sin Configuración Operativa en esta sucursal.", "warning");
      return;
    }

    if (!canManageQr) {
      showToast(manageQrBlockReason || "No tienes la opción de QR habilitada.", "warning");
      return;
    }

    // default:
    // physical => salón si existe
    const defaultType = "physical";
    const defaultSalon = salonChannel?.id ? String(salonChannel.id) : "";

    setForm({
      name: "",
      type: defaultType,
      sales_channel_id: defaultSalon,
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

    if (!canManageQr) {
      showToast(manageQrBlockReason || "No tienes la opción de QR habilitada.", "warning");
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
        intended_ordering_mode: null,
      };

      // Reglas UI alineadas a backend:
      // - web/delivery => general (sin mesa), intended null
      if (payload.type === "web" || payload.type === "delivery") {
        payload.table_id = null;
        payload.intended_ordering_mode = null;
      }

      // - physical:
      //   - general => intended null
      //   - con mesa => intended = settings.ordering_mode actual (para que no lo bloquee luego)
      if (payload.type === "physical") {
        if (payload.table_id) {
          payload.intended_ordering_mode = String(settings?.ordering_mode || "waiter_only");
        } else {
          payload.intended_ordering_mode = null;
        }
      }

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

  const topBanner = useMemo(() => {
    if (!settingsLoaded) return null;

    if (!settingsRes || !settings) {
      return {
        tone: "warning",
        title: "Configuración Operativa faltante",
        body:
          "No puedes administrar QRs sin crear la Configuración Operativa de la sucursal.\n" +
          "Crea la configuración y activa QR si deseas generar códigos.",
      };
    }

    if (!canManageQr) {
      return {
        tone: "warning",
        title: "QR desactivado",
        body:
          (manageQrBlockReason ? `${manageQrBlockReason}\n\n` : "") +
          "• No se pueden crear códigos QR en esta sucursal.\n" +
          "• Si ya existían QRs, quedan deshabilitados hasta que el usuario los reactive manualmente.",
      };
    }

    if (notices.length > 0) {
      return {
        tone: "info",
        title: "Avisos del sistema",
        body: notices.map((n) => `• ${n}`).join("\n"),
      };
    }

    return null;
  }, [settingsLoaded, settingsRes, settings, canManageQr, manageQrBlockReason, notices]);

  if (loading) return <div style={{ padding: 16 }}>Cargando QRs...</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "22px auto", padding: 16 }}>
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={closeToast} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>Administración de QRs</h2>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
            QR habilitado: <strong>{settings ? (canManageQr ? "Sí" : "No") : "Sin config"}</strong>
            {settings?.ordering_mode ? (
              <>
                {" · "}
                Modo: <strong>{settings.ordering_mode}</strong>
              </>
            ) : null}
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
            title={!canManageQr ? (manageQrBlockReason || "QR no habilitado") : "Crear un nuevo QR"}
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

      {topBanner ? <Banner tone={topBanner.tone} title={topBanner.title} body={topBanner.body} /> : null}

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
              Crea un QR Físico, Web o Delivery. Si es Físico, también puedes crearlo por mesa.
            </div>
          </div>
        ) : (
          items.map((qr) => {
            const toggleDisabled = busy || !canManageQr;

            const mismatchHint =
              qr?.table_id && qr?.intended_ordering_mode && settings?.ordering_mode
                ? String(qr.intended_ordering_mode) !== String(settings.ordering_mode)
                : false;

            const channelName = qr?.sales_channel?.name || "";
            const tableName = qr?.table?.name || "";

            return (
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
                    Canal: <strong>{channelName || "—"}</strong>
                    {" · "}
                    Mesa: <strong>{tableName || "General"}</strong>
                  </div>

                  {qr?.table_id ? (
                    <div style={{ fontSize: 12, opacity: 0.85 }}>
                      intended_ordering_mode:{" "}
                      <strong>{qr.intended_ordering_mode || "legacy/null"}</strong>
                      {mismatchHint ? (
                        <span style={{ marginLeft: 10, fontWeight: 950, color: "#a10000" }}>
                          (No coincide con modo actual: {String(settings.ordering_mode)})
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  <div style={{ fontSize: 12, opacity: 0.85, wordBreak: "break-all" }}>
                    URL: <strong>{qr.public_url}</strong>
                  </div>

                  {!canManageQr ? (
                    <div style={{ marginTop: 6, fontSize: 12, fontWeight: 900, color: "#8a6d3b" }}>
                      ⚠️ QR feature desactivado: no puedes activar/crear QRs hasta re-habilitarlo.
                    </div>
                  ) : null}

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
                    disabled={toggleDisabled}
                    style={{
                      cursor: toggleDisabled ? "not-allowed" : "pointer",
                      borderRadius: 10,
                      border: "1px solid rgba(0,0,0,0.12)",
                      background: qr.is_active ? "#fff3cd" : "#e6ffed",
                      padding: "8px 10px",
                      fontWeight: 900,
                      opacity: toggleDisabled ? 0.55 : 1,
                    }}
                    title={!canManageQr ? (manageQrBlockReason || "QR no habilitado") : "Activar / Desactivar"}
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
            );
          })
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
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      type: e.target.value,
                      // reset mesa al cambiar tipo (y se fuerza por reglas)
                      table_id: "",
                    }))
                  }
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

                {form.type === "web" || form.type === "delivery" ? (
                  <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75, fontWeight: 750 }}>
                    {form.type === "web" ? "Web" : "Delivery"}: se fuerza “General (sin mesa)”.
                  </div>
                ) : null}
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
                  <option value="">
                    {filteredChannelOptions.length ? "Selecciona..." : "Sin canales disponibles"}
                  </option>
                  {filteredChannelOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75, fontWeight: 750 }}>
                  {form.type === "physical"
                    ? "Físico: solo permite Salón."
                    : form.type === "delivery"
                    ? "Delivery: permite todos los canales menos Salón."
                    : "Web: solo permite Salón (pero el menú público permite elegir canal a visualizar)."}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6 }}>Mesa</div>
                <select
                  value={form.table_id}
                  disabled={form.type !== "physical"} // solo physical puede seleccionar mesa
                  onChange={(e) => setForm((f) => ({ ...f, table_id: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.14)",
                    outline: "none",
                    fontWeight: 800,
                    opacity: form.type !== "physical" ? 0.6 : 1,
                    cursor: form.type !== "physical" ? "not-allowed" : "pointer",
                  }}
                >
                  <option value="">General (sin mesa)</option>
                  {filteredTableOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>

                {/* Donde pediste los avisos: justo aquí */}
                {form.type === "physical" && form.table_id ? (
                  <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9, fontWeight: 850 }}>
                    Este QR de mesa se marcará con intended_ordering_mode ={" "}
                    <strong>{String(settings?.ordering_mode || "waiter_only")}</strong>
                    <div style={{ marginTop: 6, padding: "8px 10px", borderRadius: 12, background: "#eef2ff" }}>
                      <div style={{ fontWeight: 950 }}>¿Qué crea este QR?</div>
                      <div style={{ marginTop: 4, fontWeight: 800 }}>
                        {getQrNoticeForCreate({
                          type: form.type,
                          tableId: form.table_id,
                          orderingMode: settings?.ordering_mode,
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 6, padding: "8px 10px", borderRadius: 12, background: "#eef2ff" }}>
                    <div style={{ fontWeight: 950 }}>¿Qué crea este QR?</div>
                    <div style={{ marginTop: 4, fontWeight: 800 }}>
                      {getQrNoticeForCreate({
                        type: form.type,
                        tableId: form.type === "physical" ? form.table_id : null,
                        orderingMode: settings?.ordering_mode,
                      })}
                    </div>
                  </div>
                )}
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
