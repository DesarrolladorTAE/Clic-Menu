import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import PageContainer from "../../components/common/PageContainer";
import AppAlert from "../../components/common/AppAlert";
import usePagination from "../../hooks/usePagination";

import OperationalSettingsModal from "../../components/floor/OperationalSettingsModal";
import ZoneModal from "../../components/floor/ZoneModal";
import TableModal from "../../components/floor/TableModal";
import FloorPlanHeader from "../../components/floor/FloorPlanHeader";
import FloorPlanInstructionsCard from "../../components/floor/FloorPlanInstructionsCard";
import FloorBranchSelectorCard from "../../components/floor/FloorBranchSelectorCard";
import FloorPlanContextCard from "../../components/floor/FloorPlanContextCard";
import FloorZoneTabs from "../../components/floor/FloorZoneTabs";
import FloorZonesPanel from "../../components/floor/FloorZonesPanel";
import FloorTablesPanel from "../../components/floor/FloorTablesPanel";
import FloorLegendCard from "../../components/floor/FloorLegendCard";
import AssignZoneWaiterModal from "../../components/floor/AssignZoneWaiterModal";

import { getBranchesByRestaurant } from "../../services/restaurant/branch.service";
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

const STATUS_LABELS_ES = {
  available: "Disponible",
  occupied: "Ocupado",
  reserved: "Reservado",
};

const STATUS_META = [
  { key: "available", label: "Disponible", color: "#EAF8EE", border: "#B8E2C3" },
  { key: "occupied", label: "Ocupado", color: "#FFF0EE", border: "#F6C2B8" },
  { key: "reserved", label: "Reservado", color: "#FFF7E8", border: "#F3D48B" },
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

const CASHIER_DIRECT_MODE_ES = {
  disabled: "Desactivada",
  with_kitchen: "Con cocina",
  without_kitchen: "Sin cocina",
};

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

function unwrapSettingsPayload(maybe) {
  if (!maybe || typeof maybe !== "object") return null;

  if (maybe.data && typeof maybe.data === "object") {
    return {
      data: maybe.data,
      ui: maybe.ui || null,
      notices: Array.isArray(maybe.notices) ? maybe.notices : [],
      message: maybe.message || null,
    };
  }

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

export default function BranchFloorPlanPage() {
  const navigate = useNavigate();
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");

  const [settingsPayload, setSettingsPayload] = useState(null);
  const settings = settingsPayload?.data || null;

  const [zones, setZones] = useState([]);
  const [tables, setTables] = useState([]);

  const [zonesLoading, setZonesLoading] = useState(false);
  const [tablesLoading, setTablesLoading] = useState(false);

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settingsModalMode, setSettingsModalMode] = useState("create");

  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [zoneModalMode, setZoneModalMode] = useState("create");
  const [zoneModalInitial, setZoneModalInitial] = useState(null);

  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableModalMode, setTableModalMode] = useState("create");
  const [tableModalInitial, setTableModalInitial] = useState(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignZone, setAssignZone] = useState(null);
  const [assignWaitersLoading, setAssignWaitersLoading] = useState(false);
  const [assignWaiters, setAssignWaiters] = useState([]);
  const [assignSelectedWaiterId, setAssignSelectedWaiterId] = useState("");
  const [assignSaving, setAssignSaving] = useState(false);

  const [zoneFilter, setZoneFilter] = useState("all");

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const showAlert = ({
    severity = "error",
    title = "Error",
    message = "",
  }) => {
    setAlertState({
      open: true,
      severity,
      title,
      message,
    });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const selectedBranch = useMemo(() => {
    return (
      branches.find((b) => String(b.id) === String(selectedBranchId)) || null
    );
  }, [branches, selectedBranchId]);

  const selectedZone = useMemo(() => {
    if (zoneFilter === "all") return null;
    return zones.find((z) => String(z.id) === String(zoneFilter)) || null;
  }, [zones, zoneFilter]);

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
    const cashierDirectLabel =
      CASHIER_DIRECT_MODE_ES[settings.cashier_direct_mode] || "Desactivada";

    return {
      orderingLabel,
      tableServiceLabel,
      strategyLabel,
      qrLabel: boolES(toBool(settings.is_qr_enabled)),
      cashierDirectLabel,
    };
  }, [settings]);

  const canManageQr = useMemo(() => {
    if (
      settingsPayload?.ui &&
      typeof settingsPayload.ui.can_manage_qr !== "undefined"
    ) {
      return !!settingsPayload.ui.can_manage_qr;
    }

    if (!settings) return false;
    return toBool(settings.is_qr_enabled);
  }, [settingsPayload, settings]);

  const manageQrBlockReason = useMemo(() => {
    return settingsPayload?.ui?.manage_qr_block_reason || null;
  }, [settingsPayload]);

  const isZoneAssignmentEnabled = useMemo(() => {
    return (
      String(settings?.table_service_mode || "") === "assigned_waiter" &&
      String(settings?.assignment_strategy || "") === "zone"
    );
  }, [settings]);

  const tablesByZone = useMemo(() => {
    const map = {};

    for (const t of tables || []) {
      const zid = String(t.zone_id ?? t.zone?.id ?? "");
      if (!map[zid]) map[zid] = [];
      map[zid].push(t);
    }

    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""), "es", {
          sensitivity: "base",
        })
      );
    });

    return map;
  }, [tables]);

  const zonesForPanel = useMemo(() => {
    if (zoneFilter === "all") return zones;
    return zones.filter((z) => String(z.id) === String(zoneFilter));
  }, [zones, zoneFilter]);

  const filteredTables = useMemo(() => {
    const normalized = (tables || []).map((table) => {
      const zone =
        zones.find((z) => String(z.id) === String(table.zone_id)) || table.zone;
      return {
        ...table,
        zone_name: zone?.name || "Sin zona",
      };
    });

    const rows =
      zoneFilter === "all"
        ? normalized
        : normalized.filter(
            (table) =>
              String(table.zone_id ?? table.zone?.id) === String(zoneFilter)
          );

    return [...rows].sort((a, b) => {
      if (zoneFilter === "all") {
        const byZone = String(a.zone_name || "").localeCompare(
          String(b.zone_name || ""),
          "es",
          { sensitivity: "base" }
        );
        if (byZone !== 0) return byZone;
      }

      return String(a.name || "").localeCompare(String(b.name || ""), "es", {
        sensitivity: "base",
      });
    });
  }, [tables, zones, zoneFilter]);

  const {
    page,
    nextPage,
    prevPage,
    total,
    totalPages,
    startItem,
    endItem,
    hasPrev,
    hasNext,
    paginatedItems,
  } = usePagination({
    items: filteredTables,
    initialPage: 1,
    pageSize: 8,
    mode: "frontend",
  });

  const clearBranchData = () => {
    setSettingsPayload(null);
    setZones([]);
    setTables([]);
    setZoneFilter("all");
  };

  const loadSettings = async (targetBranchId) => {
    if (!targetBranchId) {
      setSettingsPayload(null);
      return;
    }

    try {
      const res = await getOperationalSettings(restaurantId, targetBranchId);
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
        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            e?.message ||
            "No se pudo cargar la configuración operativa.",
        });
      }
    }
  };

  const loadZones = async (targetBranchId) => {
    if (!targetBranchId) {
      setZones([]);
      return;
    }

    setZonesLoading(true);
    try {
      const z = await getZones(restaurantId, targetBranchId);
      setZones(Array.isArray(z) ? z : []);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          e?.message ||
          "No se pudieron cargar las zonas.",
      });
    } finally {
      setZonesLoading(false);
    }
  };

  const loadTables = async (targetBranchId) => {
    if (!targetBranchId) {
      setTables([]);
      return;
    }

    setTablesLoading(true);
    try {
      const t = await getTables(restaurantId, targetBranchId);
      setTables(Array.isArray(t) ? t : []);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          e?.message ||
          "No se pudieron cargar las mesas.",
      });
    } finally {
      setTablesLoading(false);
    }
  };

  const loadBranchData = async (targetBranchId) => {
    await Promise.all([
      loadSettings(targetBranchId),
      loadZones(targetBranchId),
      loadTables(targetBranchId),
    ]);
  };

  const loadAll = async () => {
    setLoading(true);

    try {
      let loadedBranches = await getBranchesByRestaurant(restaurantId);
      loadedBranches = Array.isArray(loadedBranches) ? loadedBranches : [];
      setBranches(loadedBranches);

      setSelectedBranchId("");
      clearBranchData();
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo cargar el diseño del salón.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  useEffect(() => {
    if (!selectedBranchId) {
      clearBranchData();
      return;
    }

    (async () => {
      await loadBranchData(selectedBranchId);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId]);

  useEffect(() => {
    if (zoneFilter === "all") return;
    const exists = zones.some((z) => String(z.id) === String(zoneFilter));
    if (!exists) setZoneFilter("all");
  }, [zones, zoneFilter]);

  const openEditSettings = () => {
    if (!selectedBranchId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una sucursal para continuar.",
      });
      return;
    }

    setSettingsModalMode(settings ? "edit" : "create");
    setSettingsModalOpen(true);
  };

  const onSettingsSaved = async (saved) => {
    const payload = unwrapSettingsPayload(saved);
    setSettingsPayload(payload);

    showAlert({
      severity: "success",
      title: "Hecho",
      message: payload?.message || "Configuración guardada correctamente.",
    });

    await loadZones(selectedBranchId);
    await loadTables(selectedBranchId);
  };

  const openCreateZone = () => {
    if (!selectedBranchId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una sucursal para continuar.",
      });
      return;
    }

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
    await loadZones(selectedBranchId);
    await loadTables(selectedBranchId);
  };

  const onDeleteZone = async (zone) => {
    const ok = window.confirm("¿De verdad deseas eliminar esta zona?");
    if (!ok) return;

    try {
      await deleteZone(restaurantId, selectedBranchId, zone.id);

      if (String(zoneFilter) === String(zone.id)) {
        setZoneFilter("all");
      }

      setZones((prev) => prev.filter((item) => item.id !== zone.id));
      setTables((prev) =>
        prev.filter((item) => String(item.zone_id) !== String(zone.id))
      );

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Zona eliminada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          e?.message ||
          "No se pudo eliminar la zona.",
      });
    }
  };

  const openCreateTable = () => {
    if (!selectedBranchId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una sucursal para continuar.",
      });
      return;
    }

    if (!zones || zones.length === 0) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Primero debes crear una zona.",
      });
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
    await loadTables(selectedBranchId);
  };

  const onDeleteTable = async (table) => {
    const ok = window.confirm("¿De verdad deseas eliminar esta mesa?");
    if (!ok) return;

    try {
      await deleteTable(restaurantId, selectedBranchId, table.id);

      setTables((prev) => prev.filter((item) => item.id !== table.id));

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Mesa eliminada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          e?.message ||
          "No se pudo eliminar la mesa.",
      });
    }
  };

  const onManageQrClick = () => {
    if (!selectedBranchId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una sucursal para continuar.",
      });
      return;
    }

    if (!settings) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message:
          "Primero crea la configuración operativa en esta sucursal.",
      });
      setSettingsModalMode("create");
      setSettingsModalOpen(true);
      return;
    }

    if (!canManageQr) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message:
          manageQrBlockReason ||
          "QR desactivado: actívalo en Configuración Operativa para administrar QRs.",
      });
      return;
    }

    navigate(`/owner/restaurants/${restaurantId}/operation/tables/qr-codes`, {
      state: {
        branchId: selectedBranchId,
      },
    });
  };

  const openAssignWaiter = async (zone) => {
    if (!isZoneAssignmentEnabled || !selectedBranchId) return;

    setAssignZone(zone);
    setAssignSelectedWaiterId("");
    setAssignModalOpen(true);

    setAssignWaitersLoading(true);
    try {
      const list = await getAvailableWaiters(
        restaurantId,
        selectedBranchId,
        ""
      );
      setAssignWaiters(Array.isArray(list) ? list : []);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          e?.message ||
          "No se pudieron cargar los meseros.",
      });
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
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Debes seleccionar un mesero.",
      });
      return;
    }

    setAssignSaving(true);
    try {
      await assignZoneWaiter(
        restaurantId,
        selectedBranchId,
        assignZone.id,
        waiterId
      );

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Mesero asignado correctamente a la zona.",
      });

      closeAssignModal();
      await loadZones(selectedBranchId);
      await loadTables(selectedBranchId);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          e?.message ||
          "No se pudo asignar el mesero a la zona.",
      });
      setAssignSaving(false);
    }
  };

  const contextData = useMemo(() => {
    return {
      zonesCount: zones.length,
      tablesCount: tables.length,
      noticesCount: settingsPayload?.notices?.length || 0,
      canManageQr,
      manageQrBlockReason,
    };
  }, [
    zones.length,
    tables.length,
    settingsPayload,
    canManageQr,
    manageQrBlockReason,
  ]);

  if (loading) {
    return (
      <PageContainer>
        <Box
          sx={{
            minHeight: "60vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="primary" />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Cargando diseño del salón…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <FloorPlanHeader
          selectedBranch={selectedBranch}
          zonesCount={zones.length}
          tablesCount={tables.length}
          onCreateZone={openCreateZone}
          onCreateTable={openCreateTable}
          onEditSettings={openEditSettings}
          onManageQr={onManageQrClick}
          canManageQr={canManageQr}
        />

        <FloorPlanInstructionsCard />

        <FloorBranchSelectorCard
          branches={branches}
          branchId={selectedBranchId}
          onChangeBranch={(nextBranchId) => {
            setSelectedBranchId(String(nextBranchId));
          }}
          selectedBranch={selectedBranch}
        />

        <FloorPlanContextCard
          selectedBranch={selectedBranch}
          settings={settings}
          settingsSummary={settingsSummary}
          contextData={contextData}
        />

        <FloorZoneTabs
          zones={zones}
          value={zoneFilter}
          onChange={setZoneFilter}
          loading={zonesLoading || tablesLoading}
        />

        <FloorZonesPanel
          zones={zonesForPanel}
          tablesByZone={tablesByZone}
          isZoneAssignmentEnabled={isZoneAssignmentEnabled}
          onAssignWaiter={openAssignWaiter}
          onEditZone={openEditZone}
          onDeleteZone={onDeleteZone}
        />

        <FloorTablesPanel
          selectedZone={selectedZone}
          zoneFilter={zoneFilter}
          tables={paginatedItems}
          total={total}
          page={page}
          totalPages={totalPages}
          startItem={startItem}
          endItem={endItem}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={prevPage}
          onNext={nextPage}
          onEditTable={openEditTable}
          onDeleteTable={onDeleteTable}
          getStatusMeta={(status) =>
            STATUS_META.find((x) => x.key === status) || STATUS_META[0]
          }
          getStatusLabel={(status) =>
            STATUS_LABELS_ES[status] || STATUS_LABELS_ES.available
          }
          formatWaiterFromTable={formatWaiterFromTable}
        />

        <FloorLegendCard
          statusMeta={STATUS_META}
          canManageQr={canManageQr}
          manageQrBlockReason={manageQrBlockReason}
        />
      </Stack>

      <OperationalSettingsModal
        open={settingsModalOpen}
        mode={settingsModalMode}
        restaurantId={restaurantId}
        branchId={selectedBranchId}
        initialData={settingsModalMode === "edit" ? settingsPayload : null}
        onClose={() => setSettingsModalOpen(false)}
        onSaved={onSettingsSaved}
        showToast={(message, type = "info") => {
          showAlert({
            severity:
              type === "success"
                ? "success"
                : type === "warning"
                ? "warning"
                : type === "info"
                ? "info"
                : "error",
            title:
              type === "success"
                ? "Hecho"
                : type === "warning"
                ? "Nota"
                : type === "info"
                ? "Aviso"
                : "Error",
            message,
          });
        }}
      />

      <ZoneModal
        open={zoneModalOpen}
        mode={zoneModalMode}
        restaurantId={restaurantId}
        branchId={selectedBranchId}
        initialData={zoneModalMode === "edit" ? zoneModalInitial : null}
        onClose={() => setZoneModalOpen(false)}
        onSaved={onZoneSaved}
        showToast={(message, type = "info") => {
          showAlert({
            severity:
              type === "success"
                ? "success"
                : type === "warning"
                ? "warning"
                : type === "info"
                ? "info"
                : "error",
            title:
              type === "success"
                ? "Hecho"
                : type === "warning"
                ? "Nota"
                : type === "info"
                ? "Aviso"
                : "Error",
            message,
          });
        }}
      />

      <TableModal
        open={tableModalOpen}
        mode={tableModalMode}
        restaurantId={restaurantId}
        branchId={selectedBranchId}
        zones={zones}
        settings={settings}
        initialData={tableModalMode === "edit" ? tableModalInitial : null}
        onClose={() => setTableModalOpen(false)}
        onSaved={onTableSaved}
        showToast={(message, type = "info") => {
          showAlert({
            severity:
              type === "success"
                ? "success"
                : type === "warning"
                ? "warning"
                : type === "info"
                ? "info"
                : "error",
            title:
              type === "success"
                ? "Hecho"
                : type === "warning"
                ? "Nota"
                : type === "info"
                ? "Aviso"
                : "Error",
            message,
          });
        }}
      />

      <AssignZoneWaiterModal
        open={assignModalOpen}
        zone={assignZone}
        waiters={assignWaiters}
        loading={assignWaitersLoading}
        saving={assignSaving}
        selectedWaiterId={assignSelectedWaiterId}
        onChangeWaiter={setAssignSelectedWaiterId}
        onClose={closeAssignModal}
        onSave={saveAssignWaiter}
        formatWaiterLabel={waiterLabel}
      />

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={4000}
      />
    </PageContainer>
  );
}