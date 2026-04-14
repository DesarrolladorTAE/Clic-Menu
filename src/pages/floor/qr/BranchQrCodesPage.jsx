import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";
import usePagination from "../../../hooks/usePagination";

import BranchQrHeader from "../../../components/floor/qr/BranchQrHeader";
import BranchQrInstructionsCard from "../../../components/floor/qr/BranchQrInstructionsCard";
import BranchQrContextCard from "../../../components/floor/qr/BranchQrContextCard";
import BranchQrStatusBanner from "../../../components/floor/qr/BranchQrStatusBanner";
import BranchQrListPanel from "../../../components/floor/qr/BranchQrListPanel";
import BranchQrCreateModal from "../../../components/floor/qr/BranchQrCreateModal";

import {
  getBranchQrCodes,
  createBranchQrCode,
  updateBranchQrCode,
  deleteBranchQrCode,
} from "../../../services/floor/qr/branchQrCodes.service";

import { getTables } from "../../../services/floor/tables.service";
import { getBranchSalesChannels } from "../../../services/restaurant/branchSalesChannels.service";
import { getOperationalSettings } from "../../../services/floor/operationalSettings.service";

const TYPE_LABEL = {
  physical: "Físico",
  web: "Web",
  delivery: "Delivery",
};

function isSalonName(name) {
  const n = String(name || "").trim().toLowerCase();
  return n === "salón" || n === "salon" || n === "salón " || n === "salon ";
}

export default function BranchQrCodesPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { restaurantId } = useParams();

  const selectedBranchId = location.state?.branchId
    ? String(location.state.branchId)
    : "";
  const selectedBranchName = location.state?.branchName || "";

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [settingsRes, setSettingsRes] = useState(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const [items, setItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [channels, setChannels] = useState([]);

  const [createOpen, setCreateOpen] = useState(false);

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
    if (!selectedBranchId) return null;
    return {
      id: selectedBranchId,
      name: selectedBranchName || `Sucursal ${selectedBranchId}`,
    };
  }, [selectedBranchId, selectedBranchName]);

  const settings = settingsRes?.data ?? null;
  const uiMeta = settingsRes?.ui ?? null;
  const notices = Array.isArray(settingsRes?.notices) ? settingsRes.notices : [];

  const canManageQr = useMemo(() => {
    if (uiMeta && typeof uiMeta.can_manage_qr === "boolean") {
      return uiMeta.can_manage_qr;
    }
    return !!settings?.is_qr_enabled;
  }, [uiMeta, settings]);

  const manageQrBlockReason = uiMeta?.manage_qr_block_reason || null;

  const sortedItems = useMemo(() => {
    return [...(items || [])].sort((a, b) => {
      const byActive = Number(b.is_active) - Number(a.is_active);
      if (byActive !== 0) return byActive;

      const byType = String(a.type || "").localeCompare(String(b.type || ""), "es", {
        sensitivity: "base",
      });
      if (byType !== 0) return byType;

      return String(a.name || "").localeCompare(String(b.name || ""), "es", {
        sensitivity: "base",
      });
    });
  }, [items]);

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
    items: sortedItems,
    initialPage: 1,
    pageSize: 5,
    mode: "frontend",
  });

  const loadBranchDependencies = async (targetBranchId) => {
    if (!targetBranchId) {
      setSettingsRes(null);
      setSettingsLoaded(true);
      setItems([]);
      setTables([]);
      setChannels([]);
      return;
    }

    try {
      let settingsResponse = null;

      try {
        settingsResponse = await getOperationalSettings(restaurantId, targetBranchId);
      } catch {
        settingsResponse = null;
      }

      setSettingsRes(settingsResponse);
      setSettingsLoaded(true);

      const [list, t, ch] = await Promise.all([
        getBranchQrCodes(restaurantId, targetBranchId),
        getTables(restaurantId, targetBranchId),
        getBranchSalesChannels(restaurantId, targetBranchId),
      ]);

      setItems(Array.isArray(list) ? list : []);
      setTables(Array.isArray(t) ? t : []);
      setChannels(Array.isArray(ch) ? ch : []);
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || "No se pudo cargar QRs";
      showAlert({
        severity: "error",
        title: "Error",
        message: msg,
      });
    }
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      if (selectedBranchId) {
        await loadBranchDependencies(selectedBranchId);
      } else {
        setSettingsRes(null);
        setSettingsLoaded(true);
        setItems([]);
        setTables([]);
        setChannels([]);
      }
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "No se pudo cargar la administración de QRs";
      showAlert({
        severity: "error",
        title: "Error",
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, selectedBranchId]);

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

  const tableOptions = useMemo(() => {
    return (tables || []).map((t) => ({ id: Number(t.id), name: t.name }));
  }, [tables]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showAlert({
        severity: "success",
        title: "Hecho",
        message: "URL copiada al portapapeles.",
      });
    } catch {
      showAlert({
        severity: "error",
        title: "Error",
        message: "No se pudo copiar la URL.",
      });
    }
  };

  const onToggleActive = async (qr) => {
    if (!canManageQr) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: manageQrBlockReason || "QR no habilitado para esta sucursal.",
      });
      return;
    }

    setBusy(true);
    try {
      const updated = await updateBranchQrCode(
        restaurantId,
        selectedBranchId,
        qr.id,
        {
          is_active: !qr.is_active,
        }
      );

      setItems((prev) =>
        prev.map((x) => (x.id === qr.id ? { ...x, ...updated } : x))
      );

      showAlert({
        severity: "success",
        title: "Hecho",
        message: `QR ${!qr.is_active ? "activado" : "desactivado"} correctamente.`,
      });
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || "No se pudo actualizar";
      showAlert({
        severity: "error",
        title: "Error",
        message: msg,
      });
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (qr) => {
    const ok = window.confirm("¿Eliminar este QR? Esto también borra la imagen PNG.");
    if (!ok) return;

    setBusy(true);
    try {
      await deleteBranchQrCode(restaurantId, selectedBranchId, qr.id);
      setItems((prev) => prev.filter((x) => x.id !== qr.id));

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "QR eliminado correctamente.",
      });
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || "No se pudo eliminar";
      showAlert({
        severity: "error",
        title: "Error",
        message: msg,
      });
    } finally {
      setBusy(false);
    }
  };

  const openCreate = () => {
    if (!selectedBranchId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message:
          "No se recibió la sucursal. Regresa a la página de mesas y vuelve a entrar.",
      });
      return;
    }

    if (!settingsLoaded || !settingsRes || !settings) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message:
          "No puedes administrar QRs sin Configuración Operativa en esta sucursal.",
      });
      return;
    }

    if (!canManageQr) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: manageQrBlockReason || "No tienes la opción de QR habilitada.",
      });
      return;
    }

    setCreateOpen(true);
  };

  const submitCreate = async (formValues) => {
    if (!canManageQr) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: manageQrBlockReason || "No tienes la opción de QR habilitada.",
      });
      return;
    }

    setBusy(true);
    try {
      const payload = {
        name: String(formValues.name).trim(),
        type: formValues.type,
        sales_channel_id: Number(formValues.sales_channel_id),
        table_id: formValues.table_id ? Number(formValues.table_id) : null,
        is_active: !!formValues.is_active,
        intended_ordering_mode: null,
      };

      if (payload.type === "web" || payload.type === "delivery") {
        payload.table_id = null;
        payload.intended_ordering_mode = null;
      }

      if (payload.type === "physical") {
        if (payload.table_id) {
          payload.intended_ordering_mode = String(
            settings?.ordering_mode || "waiter_only"
          );
        } else {
          payload.intended_ordering_mode = null;
        }
      }

      const created = await createBranchQrCode(
        restaurantId,
        selectedBranchId,
        payload
      );

      setItems((prev) => [created, ...prev]);
      setCreateOpen(false);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "QR creado correctamente.",
      });
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || "No se pudo crear el QR";
      showAlert({
        severity: "error",
        title: "Error",
        message: msg,
      });
    } finally {
      setBusy(false);
    }
  };

  const banner = useMemo(() => {
    if (!selectedBranchId) {
      return {
        tone: "warning",
        title: "Sucursal no recibida",
        body:
          "Esta vista necesita que la sucursal sea enviada desde la página de mesas. Regresa al piso y vuelve a abrir la administración de QRs.",
      };
    }

    if (!settingsLoaded) return null;

    if (!settingsRes || !settings) {
      return {
        tone: "warning",
        title: "Configuración Operativa faltante",
        body:
          "No puedes administrar QRs sin crear la Configuración Operativa de la sucursal. Crea la configuración y activa QR si deseas generar códigos.",
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
  }, [
    selectedBranchId,
    settingsLoaded,
    settingsRes,
    settings,
    canManageQr,
    manageQrBlockReason,
    notices,
  ]);

  const contextData = useMemo(() => {
    return {
      totalQrs: items.length,
      totalTables: tables.length,
      totalChannels: channelOptionsRaw.length,
      enabledLabel: settings ? (canManageQr ? "Sí" : "No") : "Sin config",
      orderingMode: settings?.ordering_mode || "Sin definir",
    };
  }, [items.length, tables.length, channelOptionsRaw.length, settings, canManageQr]);

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
              Cargando administración de QRs…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <BranchQrHeader
          selectedBranch={selectedBranch}
          busy={busy}
          onCreate={openCreate}
          onBack={() =>
            nav(`/owner/restaurants/${restaurantId}/operation/tables`, {
              state: {
                branchId: selectedBranchId,
                branchName: selectedBranch?.name || "",
              },
            })
          }
        />

        <BranchQrInstructionsCard />

        <BranchQrContextCard
          selectedBranch={selectedBranch}
          contextData={contextData}
        />

        {banner ? (
          <BranchQrStatusBanner
            tone={banner.tone}
            title={banner.title}
            body={banner.body}
          />
        ) : null}

        <BranchQrListPanel
          items={paginatedItems}
          total={total}
          page={page}
          totalPages={totalPages}
          startItem={startItem}
          endItem={endItem}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={prevPage}
          onNext={nextPage}
          onCopy={copyToClipboard}
          onToggleActive={onToggleActive}
          onDelete={onDelete}
          onOpen={(url) => window.open(url, "_blank")}
          typeLabelMap={TYPE_LABEL}
          busy={busy}
          canManageQr={canManageQr}
          manageQrBlockReason={manageQrBlockReason}
          selectedBranchId={selectedBranchId}
        />
      </Stack>

      <BranchQrCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={submitCreate}
        busy={busy}
        selectedBranch={selectedBranch}
        settings={settings}
        salonChannel={salonChannel}
        channelOptionsRaw={channelOptionsRaw}
        tableOptions={tableOptions}
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