import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import OperationalSettingsModal from "../../components/floor/OperationalSettingsModal";
import ZoneModal from "../../components/floor/ZoneModal";
import TableModal from "../../components/floor/TableModal";

import { getOperationalSettings } from "../../services/floor/operationalSettings.service";
import {
  getZones,
  deleteZone,
  assignZoneWaiter,
} from "../../services/floor/zones.service";
import {
  getTables,
  deleteTable,
  getAvailableWaiters,
} from "../../services/floor/tables.service";

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
      <div style={{ marginTop: 8, fontSize: 11, opacity: 0.75 }}>
        (clic para cerrar)
      </div>
    </div>
  );
}

const STATUS_LABELS_ES = {
  available: "Disponible",
  occupied: "Ocupado",
  reserved: "Reservado",
};

const STATUS_META = [
  { key: "available", label: "Disponible", color: "#e6ffed", border: "#8ae99c" },
  { key: "occupied", label: "Ocupado", color: "#ffe5e5", border: "#ffb3b3" },
  { key: "reserved", label: "Reservado", color: "#fff3cd", border: "#ffe08a" },
];

const ORDERING_MODE_ES = {
  waiter_only: "Solo mesero",
  customer_assisted: "Cliente asistido",
};

const TABLE_SERVICE_MODE_ES = {
  free_for_all: "Libre",
  assigned_waiter: "Mesero asignado",
};

const ASSIGNMENT_STRATEGY_ES = {
  table_only: "Mesa",
  zone: "Zona",
};

// Normaliza booleanos raros: 1/"1"/"true"/true/"on"/"yes"
function toBool(v) {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["1", "true", "yes", "y", "on", "si", "sí"].includes(s)) return true;
    if (["0", "false", "no", "n", "off"].includes(s)) return false;
  }
  return !!v;
}

function boolES(v) {
  return v ? "Verdadero" : "Falso";
}

function formatWaiterFromTable(t) {
  const w =
    t?.assigned_waiter ||
    t?.assignedWaiter ||
    t?.assignedWaiterUser ||
    null;
  if (w && typeof w === "object") {
    const parts = [w.name, w.last_name_paternal, w.last_name_maternal].filter(
      Boolean
    );
    return parts.join(" ").trim();
  }
  if (t?.assigned_waiter_id) return `#${t.assigned_waiter_id}`;
  return "";
}

// ✅ Extrae payload completo: {data, ui, notices} o fallback a data
function unwrapSettingsPayload(maybe) {
  if (!maybe) return null;
  if (typeof maybe !== "object") return null;

  // esperado: { data: {...}, ui: {...}, notices: [...] }
  if (maybe.data && typeof maybe.data === "object") {
    return {
      data: maybe.data,
      ui: maybe.ui || null,
      notices: Array.isArray(maybe.notices) ? maybe.notices : [],
      message: maybe.message || null,
    };
  }

  // fallback viejo: {...settings}
  return { data: maybe, ui: null, notices: [], message: null };
}

function waiterLabel(w) {
  if (!w) return "";
  const parts = [w.name, w.last_name_paternal, w.last_name_maternal].filter(
    Boolean
  );
  const full = parts.join(" ").trim();
  const phone = w.phone ? ` · ${w.phone}` : "";
  return `${full}${phone}`.trim();
}

// Modal inline: asignar mesero a zona (SIN archivo nuevo)
const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 99999,
  padding: 16,
};

const modalStyle = {
  width: "100%",
  maxWidth: 560,
  background: "#fff",
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.12)",
  boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
  overflow: "hidden",
};

const headerStyle = {
  padding: "14px 16px",
  borderBottom: "1px solid rgba(0,0,0,0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const bodyStyle = { padding: 16 };
const footerStyle = {
  padding: "12px 16px",
  borderTop: "1px solid rgba(0,0,0,0.08)",
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
};

export default function BranchFloorPlanPage() {
  const nav = useNavigate();
  const { restaurantId, branchId } = useParams();

  const [loading, setLoading] = useState(true);

  // ✅ Guardamos el payload completo: {data, ui, notices}
  const [settingsPayload, setSettingsPayload] = useState(null);

  // conveniencia
  const settings = settingsPayload?.data || null;

  const [zones, setZones] = useState([]);
  const [tables, setTables] = useState([]);

  const [zonesLoading, setZonesLoading] = useState(false);
  const [tablesLoading, setTablesLoading] = useState(false);

  // settings modal
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settingsModalMode, setSettingsModalMode] = useState("create");

  // zone modal
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [zoneModalMode, setZoneModalMode] = useState("create");
  const [zoneModalInitial, setZoneModalInitial] = useState(null);

  // table modal
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableModalMode, setTableModalMode] = useState("create");
  const [tableModalInitial, setTableModalInitial] = useState(null);

  // assign waiter modal (inline)
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignZone, setAssignZone] = useState(null);
  const [assignWaitersLoading, setAssignWaitersLoading] = useState(false);
  const [assignWaiters, setAssignWaiters] = useState([]);
  const [assignSelectedWaiterId, setAssignSelectedWaiterId] = useState("");
  const [assignSaving, setAssignSaving] = useState(false);

  const [toast, setToast] = useState({ open: false, message: "", type: "info" });
  const showToast = (message, type = "info") => {
    setToast({ open: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, open: false })), 4500);
  };
  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  const [zoneFilter, setZoneFilter] = useState("all");

  const loadSettings = async () => {
    try {
      const res = await getOperationalSettings(restaurantId, branchId);
      const payload = unwrapSettingsPayload(res);
      setSettingsPayload(payload);
      setSettingsModalOpen(false);
    } catch (e) {
      const st = e?.response?.status;

      if (st === 404) {
        setSettingsPayload(null);
        setSettingsModalMode("create");
        setSettingsModalOpen(true);
      } else {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "No se pudo cargar la configuración";
        showToast(msg, "error");
      }
    }
  };

  const loadZones = async () => {
    setZonesLoading(true);
    try {
      const z = await getZones(restaurantId, branchId);
      setZones(z);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "No se pudieron cargar las zonas";
      showToast(msg, "error");
    } finally {
      setZonesLoading(false);
    }
  };

  const loadTables = async () => {
    setTablesLoading(true);
    try {
      const t = await getTables(restaurantId, branchId);
      setTables(t);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "No se pudieron cargar las mesas";
      showToast(msg, "error");
    } finally {
      setTablesLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadSettings();
      await loadZones();
      await loadTables();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, branchId]);

  const openEditSettings = () => {
    setSettingsModalMode("edit");
    setSettingsModalOpen(true);
  };

  // ✅ IMPORTANTÍSIMO: después de guardar settings, recarga zonas/mesas
  const onSettingsSaved = async (saved) => {
    const payload = unwrapSettingsPayload(saved);
    setSettingsPayload(payload);

    showToast(payload?.message || "Configuración guardada.", "success");

    // backend pudo limpiar assigned_waiter_id en mesas y/o zonas
    await loadZones();
    await loadTables();
  };

  const settingsSummary = useMemo(() => {
    if (!settings) return null;

    const orderingLabel =
      ORDERING_MODE_ES[settings.ordering_mode] || "Sin definir";
    const tableServiceLabel =
      TABLE_SERVICE_MODE_ES[settings.table_service_mode] || "Sin definir";
    const strategyLabel = settings.assignment_strategy
      ? ASSIGNMENT_STRATEGY_ES[settings.assignment_strategy] ||
        settings.assignment_strategy
      : null;

    return {
      orderingLabel,
      tableServiceLabel,
      strategyLabel,
      qrLabel: boolES(toBool(settings.is_qr_enabled)),
    };
  }, [settings]);

  const openCreateZone = () => {
    setZoneModalMode("create");
    setZoneModalInitial(null);
    setZoneModalOpen(true);
  };

  const openEditZone = (zone) => {
    setZoneModalMode("edit");
    setZoneModalInitial(zone);
    setZoneModalOpen(true);
  };

  const onZoneSaved = async () => {
    await loadZones();
    await loadTables();
  };

  const onDeleteZone = async (zone) => {
    const ok = window.confirm("¿De verdad desea eliminar esta zona?");
    if (!ok) return;

    try {
      await deleteZone(restaurantId, branchId, zone.id);
      showToast("Zona eliminada.", "success");

      if (String(zoneFilter) === String(zone.id)) setZoneFilter("all");

      await loadZones();
      await loadTables();
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || "No se pudo eliminar la zona";
      showToast(msg, "error");
    }
  };

  // ---- Mesas
  const openCreateTable = () => {
    if (!zones || zones.length === 0) {
      showToast("Primero debe de crear una zona", "warning");
      return;
    }
    setTableModalMode("create");
    setTableModalInitial(null);
    setTableModalOpen(true);
  };

  const openEditTable = (table) => {
    setTableModalMode("edit");
    setTableModalInitial(table);
    setTableModalOpen(true);
  };

  const onTableSaved = async () => {
    await loadTables();
  };

  const onDeleteTable = async (table) => {
    const ok = window.confirm("¿De verdad desea eliminar esta mesa?");
    if (!ok) return;

    try {
      await deleteTable(restaurantId, branchId, table.id);
      showToast("Mesa eliminada.", "success");
      await loadTables();
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || "No se pudo eliminar la mesa";
      showToast(msg, "error");
    }
  };

  // agrupar mesas por zone_id
  const tablesByZone = useMemo(() => {
    const map = {};
    for (const t of tables || []) {
      const zid = String(t.zone_id ?? t.zone?.id ?? "");
      if (!map[zid]) map[zid] = [];
      map[zid].push(t);
    }
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => String(a.name).localeCompare(String(b.name)));
    });
    return map;
  }, [tables]);

  const zonesForView = useMemo(() => {
    if (zoneFilter === "all") return zones;
    return zones.filter((z) => String(z.id) === String(zoneFilter));
  }, [zones, zoneFilter]);

  // ✅ Usa ui.can_manage_qr si viene, fallback a is_qr_enabled
  const canManageQr = useMemo(() => {
    if (settingsPayload?.ui && typeof settingsPayload.ui.can_manage_qr !== "undefined") {
      return !!settingsPayload.ui.can_manage_qr;
    }
    if (!settings) return false;
    return toBool(settings.is_qr_enabled);
  }, [settingsPayload, settings]);

  const manageQrBlockReason = useMemo(() => {
    return settingsPayload?.ui?.manage_qr_block_reason || null;
  }, [settingsPayload]);

  const onManageQrClick = () => {
    if (!settings) {
      showToast(
        "Primero crea la Configuración Operativa en esta sucursal.",
        "warning"
      );
      setSettingsModalMode("create");
      setSettingsModalOpen(true);
      return;
    }

    if (!canManageQr) {
      showToast(
        manageQrBlockReason ||
          "QR desactivado: actívalo en Configuración Operativa para crear y administrar QRs.",
        "warning"
      );
      return;
    }

    nav(`/owner/restaurants/${restaurantId}/branches/${branchId}/qr-codes`);
  };

  // ---- Asignación por zona solo si assigned_waiter + zone
  const isZoneAssignmentEnabled = useMemo(() => {
    return (
      String(settings?.table_service_mode || "") === "assigned_waiter" &&
      String(settings?.assignment_strategy || "") === "zone"
    );
  }, [settings]);

  const openAssignWaiter = async (zone) => {
    if (!isZoneAssignmentEnabled) return;

    setAssignZone(zone);
    setAssignSelectedWaiterId("");
    setAssignModalOpen(true);

    setAssignWaitersLoading(true);
    try {
      const list = await getAvailableWaiters(restaurantId, branchId, "");
      setAssignWaiters(Array.isArray(list) ? list : []);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "No se pudieron cargar los meseros";
      showToast(msg, "error");
    } finally {
      setAssignWaitersLoading(false);
    }
  };

  const closeAssignModal = () => {
    setAssignModalOpen(false);
    setAssignZone(null);
    setAssignSelectedWaiterId("");
    setAssignSaving(false);
    setAssignWaiters([]);
  };

  const saveAssignWaiter = async () => {
    if (!assignZone) return;
    const waiterId = Number(assignSelectedWaiterId);
    if (!waiterId) {
      showToast("Debes seleccionar un mesero.", "warning");
      return;
    }

    setAssignSaving(true);
    try {
      await assignZoneWaiter(restaurantId, branchId, assignZone.id, waiterId);
      showToast("Mesero asignado a la zona.", "success");
      closeAssignModal();

      // backend auto-asigna mesas => refrescamos todo
      await loadZones();
      await loadTables();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "No se pudo asignar el mesero a la zona";
      showToast(msg, "error");
      setAssignSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 16 }}>Cargando diseño del salón...</div>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: "22px auto", padding: 16 }}>
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />

      <OperationalSettingsModal
        open={settingsModalOpen}
        mode={settingsModalMode}
        restaurantId={restaurantId}
        branchId={branchId}
        // ✅ ahora sí le pasas payload completo (con notices)
        initialData={settingsModalMode === "edit" ? settingsPayload : null}
        onClose={() => {
          if (settingsModalMode === "create" && !settings) {
            nav("/owner/restaurants");
            return;
          }
          setSettingsModalOpen(false);
        }}
        onSaved={onSettingsSaved}
        showToast={showToast}
      />

      <ZoneModal
        open={zoneModalOpen}
        mode={zoneModalMode}
        restaurantId={restaurantId}
        branchId={branchId}
        initialData={zoneModalMode === "edit" ? zoneModalInitial : null}
        onClose={() => setZoneModalOpen(false)}
        onSaved={onZoneSaved}
        showToast={showToast}
      />

      <TableModal
        open={tableModalOpen}
        mode={tableModalMode}
        restaurantId={restaurantId}
        branchId={branchId}
        zones={zones}
        settings={settings}
        initialData={tableModalMode === "edit" ? tableModalInitial : null}
        onClose={() => setTableModalOpen(false)}
        onSaved={onTableSaved}
        showToast={showToast}
      />

      {/* Modal inline: Asignar mesero */}
      {assignModalOpen && (
        <div
          style={overlayStyle}
          onMouseDown={closeAssignModal}
          role="dialog"
          aria-modal="true"
        >
          <div style={modalStyle} onMouseDown={(e) => e.stopPropagation()}>
            <div style={headerStyle}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16 }}>
                  Asignar mesero a zona
                </div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  Zona: <strong>{assignZone?.name || "-"}</strong>
                </div>
              </div>

              <button onClick={closeAssignModal} style={{ cursor: "pointer" }}>
                ✕
              </button>
            </div>

            <div style={bodyStyle}>
              <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 6 }}>
                Mesero
              </div>

              <select
                value={assignSelectedWaiterId}
                onChange={(e) => setAssignSelectedWaiterId(e.target.value)}
                disabled={assignWaitersLoading || assignSaving}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.18)",
                }}
              >
                <option value="">Selecciona un mesero...</option>
                {assignWaiters.map((w) => (
                  <option key={w.id} value={w.id}>
                    {waiterLabel(w)}
                  </option>
                ))}
              </select>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  opacity: 0.75,
                  lineHeight: 1.35,
                }}
              >
                Esto también asigna automáticamente el mesero a todas las mesas de
                esta zona.
              </div>
            </div>

            <div style={footerStyle}>
              <button
                type="button"
                onClick={closeAssignModal}
                style={{ cursor: "pointer" }}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={saveAssignWaiter}
                disabled={assignSaving}
                style={{
                  cursor: assignSaving ? "not-allowed" : "pointer",
                  padding: "10px 14px",
                  fontWeight: 900,
                }}
              >
                {assignSaving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <h2 style={{ margin: 0 }}>Diseño del salón</h2>
          </div>

          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
            {settingsSummary ? (
              <>
                Modo de toma de pedidos:{" "}
                <strong>{settingsSummary.orderingLabel}</strong> · Modo de
                asignación de mesas:{" "}
                <strong>{settingsSummary.tableServiceLabel}</strong>
                {settingsSummary.strategyLabel ? (
                  <>
                    {" "}
                    · Estrategia:{" "}
                    <strong>{settingsSummary.strategyLabel}</strong>
                  </>
                ) : null}{" "}
                · QR: <strong>{settingsSummary.qrLabel}</strong>
                {typeof settings?.min_seats !== "undefined" &&
                  typeof settings?.max_seats !== "undefined" && (
                    <>
                      {" "}
                      · Asientos por mesa: <strong>{settings.min_seats}</strong>{" "}
                      a <strong>{settings.max_seats}</strong>
                    </>
                  )}
              </>
            ) : (
              "Sin configuración operativa (debería abrirse el modal)"
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", width: "100%" }}>
          <button
            onClick={openCreateZone}
            style={{
              padding: "10px 12px",
              cursor: "pointer",
              fontWeight: 800,
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 10,
              background: "#fff",
            }}
          >
            + Nueva zona
          </button>

          <button
            onClick={openCreateTable}
            style={{
              padding: "10px 12px",
              cursor: "pointer",
              fontWeight: 800,
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 10,
              background: "#fff",
            }}
          >
            + Nueva mesa
          </button>

          <button
            onClick={openEditSettings}
            style={{
              padding: "10px 12px",
              cursor: "pointer",
              fontWeight: 900,
              background: "#f0f0ff",
              border: "1px solid #cfcfff",
              borderRadius: 10,
            }}
          >
            Configuración operativa
          </button>

          <button
            onClick={onManageQrClick}
            style={{
              padding: "10px 12px",
              cursor: "pointer",
              fontWeight: 900,
              background: canManageQr ? "#e6ffed" : "#fff3cd",
              border: canManageQr ? "1px solid #8ae99c" : "1px solid #ffe08a",
              borderRadius: 10,
            }}
            title={
              canManageQr
                ? "Administración de QRs para esta sucursal"
                : manageQrBlockReason || "QR desactivado: actívalo en Configuración Operativa"
            }
          >
            📱 Administrar QRs
          </button>

          <button
            onClick={() => nav("/owner/restaurants")}
            style={{
              marginLeft: "auto",
              padding: "8px 10px",
              cursor: "pointer",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "#fff",
              fontWeight: 900,
            }}
            title="Regresar a Mis restaurantes"
          >
            ← Regresar
          </button>
        </div>
      </div>

      {/* Filter */}
      <div
        style={{
          marginTop: 16,
          padding: 12,
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 12,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ fontWeight: 900 }}>Filtro:</div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => setZoneFilter("all")}
            style={{
              padding: "8px 10px",
              cursor: "pointer",
              fontWeight: 800,
              background: zoneFilter === "all" ? "#eef2ff" : "#fff",
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 10,
            }}
          >
            Todas las zonas
          </button>

          {zones.map((z) => (
            <button
              key={z.id}
              onClick={() => setZoneFilter(String(z.id))}
              style={{
                padding: "8px 10px",
                cursor: "pointer",
                fontWeight: 800,
                background: zoneFilter === String(z.id) ? "#eef2ff" : "#fff",
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 10,
              }}
            >
              {z.name}
            </button>
          ))}

          {(zonesLoading || tablesLoading) && (
            <div style={{ fontSize: 12, opacity: 0.7, padding: "8px 10px" }}>
              Cargando...
            </div>
          )}
        </div>
      </div>

      {/* Zones + Tables */}
      <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
        {zonesForView.length === 0 ? (
          <div
            style={{
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 14,
              padding: 14,
              background: "#fff",
            }}
          >
            <div style={{ fontWeight: 900 }}>No hay zonas aún</div>
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
              Crea tu primera zona para empezar a organizar el salón.
            </div>
          </div>
        ) : (
          zonesForView.map((zone) => {
            const zoneTables = tablesByZone[String(zone.id)] || [];
            const count = zoneTables.length;

            const missingZoneWaiter =
              isZoneAssignmentEnabled &&
              (zone?.assigned_waiter_id === null ||
                typeof zone?.assigned_waiter_id === "undefined");

            return (
              <div
                key={zone.id}
                style={{
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: 14,
                  padding: 14,
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: 14 }}>
                      {zone.name}{" "}
                      <span style={{ fontWeight: 700, opacity: 0.7 }}>
                        · {count} mesas
                      </span>
                    </div>

                    {missingZoneWaiter ? (
                      <div
                        style={{
                          padding: "6px 10px",
                          borderRadius: 999,
                          border: "1px solid #ffe08a",
                          background: "#fff3cd",
                          color: "#8a6d3b",
                          fontWeight: 900,
                          fontSize: 12,
                        }}
                        title="Esta zona no tiene mesero asignado"
                      >
                        Falta asignar mesero
                      </div>
                    ) : null}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                    {isZoneAssignmentEnabled && (
                      <button
                        onClick={() => openAssignWaiter(zone)}
                        style={{
                          cursor: "pointer",
                          borderRadius: 10,
                          border: "1px solid rgba(0,0,0,0.12)",
                          background: "#eef2ff",
                          padding: "6px 10px",
                          fontWeight: 900,
                        }}
                        title="Asignar mesero a esta zona"
                      >
                        👨‍🍳 Asignar mesero
                      </button>
                    )}

                    <button
                      onClick={() => openEditZone(zone)}
                      style={{
                        cursor: "pointer",
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.12)",
                        background: "#fff",
                        padding: "6px 10px",
                        fontWeight: 900,
                      }}
                      title="Editar zona"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => onDeleteZone(zone)}
                      style={{
                        cursor: "pointer",
                        borderRadius: 10,
                        border: "1px solid rgba(255,0,0,0.25)",
                        background: "#ffe5e5",
                        padding: "6px 10px",
                        fontWeight: 900,
                        color: "#a10000",
                      }}
                      title="Eliminar zona"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 12,
                    border: "1px dashed rgba(0,0,0,0.18)",
                    background: "#fafafa",
                  }}
                >
                  {zoneTables.length === 0 ? (
                    <div style={{ fontSize: 13, opacity: 0.75 }}>
                      Sin mesas en esta zona. Usa <strong>+ Nueva mesa</strong>.
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                        gap: 12,
                      }}
                    >
                      {zoneTables.map((t) => {
                        const meta =
                          STATUS_META.find((x) => x.key === t.status) ||
                          STATUS_META[0];
                        const waiterText = formatWaiterFromTable(t);

                        return (
                          <div
                            key={t.id}
                            style={{
                              borderRadius: 12,
                              border: `1px solid ${meta.border}`,
                              background: meta.color,
                              padding: 12,
                              display: "flex",
                              flexDirection: "column",
                              gap: 10,
                              minHeight: 120,
                              position: "relative",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                paddingRight: 46,
                              }}
                            >
                              <div style={{ fontWeight: 900 }}>{t.name}</div>
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 800,
                                  opacity: 0.8,
                                }}
                              >
                                {STATUS_LABELS_ES[t.status] || "Disponible"}
                              </div>
                            </div>

                            <div style={{ fontSize: 13 }}>
                              Asientos: <strong>{t.seats}</strong>
                            </div>

                            {waiterText ? (
                              <div style={{ fontSize: 12, opacity: 0.85 }}>
                                Mesero: <strong>{waiterText}</strong>
                              </div>
                            ) : null}

                            <div
                              style={{
                                marginTop: "auto",
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 8,
                              }}
                            >
                              <button
                                onClick={() => openEditTable(t)}
                                style={{
                                  cursor: "pointer",
                                  borderRadius: 10,
                                  border: "1px solid rgba(0,0,0,0.12)",
                                  background: "#fff",
                                  padding: "6px 10px",
                                  fontWeight: 900,
                                }}
                                title="Editar mesa"
                              >
                                ✏️
                              </button>

                              <button
                                onClick={() => onDeleteTable(t)}
                                style={{
                                  cursor: "pointer",
                                  borderRadius: 10,
                                  border: "1px solid rgba(255,0,0,0.25)",
                                  background: "#ffe5e5",
                                  padding: "6px 10px",
                                  fontWeight: 900,
                                  color: "#a10000",
                                }}
                                title="Eliminar mesa"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
        <div
          style={{
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 12,
            padding: 12,
            background: "#fff",
            minWidth: 280,
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Estados</div>

          <div style={{ display: "grid", gap: 8 }}>
            {STATUS_META.map((s) => (
              <div
                key={s.key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 6,
                      display: "inline-block",
                      background: s.color,
                      border: `1px solid ${s.border}`,
                    }}
                  />
                  <span style={{ fontWeight: 800 }}>{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          {!canManageQr ? (
            <div
              style={{
                marginTop: 12,
                padding: 10,
                borderRadius: 12,
                border: "1px solid #ffe08a",
                background: "#fff3cd",
                color: "#8a6d3b",
                fontWeight: 850,
                fontSize: 12,
                lineHeight: 1.3,
              }}
            >
              {manageQrBlockReason ? (
                manageQrBlockReason
              ) : (
                <>
                  QR está desactivado: no podrás entrar a{" "}
                  <strong>Administrar QRs</strong> hasta activarlo en{" "}
                  <strong>Configuración operativa</strong>.
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}