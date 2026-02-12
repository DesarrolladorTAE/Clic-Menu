import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import OperationalSettingsModal from "../../components/floor/OperationalSettingsModal";
import { getOperationalSettings } from "../../services/floor/operationalSettings.service";

// Toast simple (mismo estilo que ya usas)
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

// estados en sistema (inglés) pero usuario ve español
const STATUS_LABELS_ES = {
  available: "Disponible",
  occupied: "Ocupado",
  reserved: "Reservado",
};

// estilos por estado (no mostrar key al usuario)
const STATUS_META = [
  { key: "available", label: "Disponible", color: "#e6ffed", border: "#8ae99c" },
  { key: "occupied", label: "Ocupado", color: "#ffe5e5", border: "#ffb3b3" },
  { key: "reserved", label: "Reservado", color: "#fff3cd", border: "#ffe08a" },
];

// --- helpers para mostrar configuración en español
const ORDERING_MODE_ES = {
  waiter_only: "Solo mesero",
  customer_assisted: "Cliente asistido",
};

const TABLE_SERVICE_MODE_ES = {
  free_for_all: "Libre",
  assigned_waiter: "Mesero asignado",
};

function boolES(v) {
  return v ? "Verdadero" : "Falso";
}

export default function BranchFloorPlanPage() {
  const nav = useNavigate();
  const { restaurantId, branchId } = useParams();

  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  // modal inicial si no existe config
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settingsModalMode, setSettingsModalMode] = useState("create"); // create|edit

  const [toast, setToast] = useState({ open: false, message: "", type: "info" });
  const showToast = (message, type = "info") => {
    setToast({ open: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, open: false })), 4500);
  };
  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  // --- DATA DUMMY (hasta que exista API de zonas/mesas)
  const dummyZones = useMemo(
    () => [
      {
        id: 1,
        name: "Zona 1",
        tables: [
          { id: 11, name: "M01", seats: 4, status: "available" },
          { id: 12, name: "M02", seats: 2, status: "occupied" },
          { id: 13, name: "M03", seats: 6, status: "reserved" },
          { id: 14, name: "M04", seats: 4, status: "available" },
          { id: 15, name: "M05", seats: 4, status: "available" },
        ],
      },
      {
        id: 2,
        name: "Zona 2",
        tables: [
          { id: 21, name: "M06", seats: 2, status: "available" },
          { id: 22, name: "M07", seats: 4, status: "available" },
          { id: 23, name: "M08", seats: 8, status: "occupied" },
        ],
      },
    ],
    []
  );

  const [zoneFilter, setZoneFilter] = useState("all");

  const loadSettings = async () => {
    setLoading(true);
    try {
      const s = await getOperationalSettings(restaurantId, branchId);
      setSettings(s);
      setSettingsModalOpen(false);
    } catch (e) {
      const st = e?.response?.status;

      if (st === 404) {
        setSettings(null);
        setSettingsModalMode("create");
        setSettingsModalOpen(true);
      } else {
        const msg =
          e?.response?.data?.message || e?.message || "No se pudo cargar la configuración";
        showToast(msg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, branchId]);

  const openEditSettings = () => {
    setSettingsModalMode("edit");
    setSettingsModalOpen(true);
  };

  const onSettingsSaved = (saved) => {
    setSettings(saved);
    showToast("Configuración guardada.", "success");
  };

  const zonesForView = useMemo(() => {
    if (zoneFilter === "all") return dummyZones;
    return dummyZones.filter((z) => String(z.id) === String(zoneFilter));
  }, [dummyZones, zoneFilter]);

  const settingsSummary = useMemo(() => {
    if (!settings) return null;

    const orderingLabel =
      ORDERING_MODE_ES[settings.ordering_mode] || "Sin definir";

    const tableServiceLabel =
      TABLE_SERVICE_MODE_ES[settings.table_service_mode] || "Sin definir";

    return {
      orderingLabel,
      tableServiceLabel,
      qrLabel: boolES(!!settings.is_qr_enabled),
    };
  }, [settings]);

  if (loading) {
    return <div style={{ padding: 16 }}>Cargando diseño del salón...</div>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: "22px auto", padding: 16 }}>
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={closeToast} />

      <OperationalSettingsModal
        open={settingsModalOpen}
        mode={settingsModalMode}
        restaurantId={restaurantId}
        branchId={branchId}
        initialData={settingsModalMode === "edit" ? settings : null}
        onClose={() => {
          // si está en create y cierran sin guardar, no tiene sentido dejarlos aquí
          if (settingsModalMode === "create" && !settings) {
            nav("/owner/restaurants"); // Mis restaurantes
            return;
          }
          setSettingsModalOpen(false);
        }}
        onSaved={onSettingsSaved}
        showToast={showToast}
      />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => nav("/owner/restaurants")}
              style={{
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

            <h2 style={{ margin: 0 }}>Diseño del salón</h2>
          </div>

          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
            {settingsSummary ? (
              <>
                Modo de toma de pedidos: <strong>{settingsSummary.orderingLabel}</strong>{" "}
                · Modo de asignación de mesas: <strong>{settingsSummary.tableServiceLabel}</strong>{" "}
                · QR: <strong>{settingsSummary.qrLabel}</strong>
              </>
            ) : (
              "Sin configuración operativa (debería abrirse el modal)"
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => showToast("Modal pendiente: Nueva zona (próximo paso).", "info")}
            style={{ padding: "10px 12px", cursor: "pointer", fontWeight: 800 }}
          >
            + Nueva zona
          </button>

          <button
            onClick={() => showToast("Modal pendiente: Nueva mesa (próximo paso).", "info")}
            style={{ padding: "10px 12px", cursor: "pointer", fontWeight: 800 }}
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
              borderRadius: 8,
            }}
          >
            Configuración operativa
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
            Todas las mesas
          </button>

          {dummyZones.map((z) => (
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
        </div>
      </div>

      {/* Zones + Tables */}
      <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
        {zonesForView.map((zone) => {
          const count = zone.tables.length;

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
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 900, fontSize: 14 }}>
                  {zone.name}{" "}
                  <span style={{ fontWeight: 700, opacity: 0.7 }}>· {count} mesas</span>
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
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                    gap: 12,
                  }}
                >
                  {zone.tables.map((t) => {
                    const meta = STATUS_META.find((x) => x.key === t.status) || STATUS_META[0];

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
                          minHeight: 96,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div style={{ fontWeight: 900 }}>{t.name}</div>
                          <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.8 }}>
                            {STATUS_LABELS_ES[t.status] || "Disponible"}
                          </div>
                        </div>

                        <div style={{ fontSize: 13 }}>
                          Asientos: <strong>{t.seats}</strong>
                        </div>

                        <div style={{ marginTop: "auto" }}>
                          <button
                            onClick={() => showToast(`Modal pendiente: Editar mesa ${t.name}`, "info")}
                            style={{ padding: "8px 10px", cursor: "pointer" }}
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                  * Layout: 4 columnas por fila. En pantallas pequeñas se ajusta después.
                </div>
              </div>
            </div>
          );
        })}
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

                {/* ya NO mostramos la key en inglés */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
