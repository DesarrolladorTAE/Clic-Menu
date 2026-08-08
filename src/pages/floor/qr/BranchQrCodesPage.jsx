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
import BranchQrExportModal from "../../../components/floor/qr/BranchQrExportModal";

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

const SYSTEM_CHANNEL_CODES = ["SALON", "WHATSAPP", "ONLINE_ORDER"];

function isSystemChannelOption(channel) {
  if (typeof channel?.is_system_channel === "boolean") {
    return channel.is_system_channel;
  }

  const code = String(channel?.code || "").trim().toUpperCase();
  return SYSTEM_CHANNEL_CODES.includes(code);
}

function isSalonChannel(channel) {
  const name = String(channel?.name || "").trim().toLowerCase();
  const code = String(channel?.code || "").trim().toUpperCase();

  return code === "SALON" || name === "salón" || name === "salon";
}

function isWhatsappChannel(channel) {
  const name = String(channel?.name || "").trim().toLowerCase();
  const code = String(channel?.code || "").trim().toUpperCase();

  return (
    code === "WHATSAPP" ||
    name === "whatsapp" ||
    name === "whats app" ||
    name === "whatssapp"
  );
}

function unwrapQrCodesPayload(res) {
  if (!res || typeof res !== "object") {
    return {
      data: Array.isArray(res) ? res : [],
      ui: null,
    };
  }

  return {
    data: Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [],
    ui: res?.ui || null,
  };
}

function unwrapMutationPayload(res) {
  if (!res || typeof res !== "object") return res;
  return res?.data && typeof res.data === "object" ? res.data : res;
}

function resolveBranchDisplayName({ selectedBranchId, selectedBranchName, settingsRes }) {
  const fromState = String(selectedBranchName || "").trim();

  if (fromState && fromState !== String(selectedBranchId)) {
    return fromState;
  }

  const fromSetting =
    settingsRes?.data?.branch?.name ||
    settingsRes?.branch?.name ||
    settingsRes?.data?.branch_name ||
    settingsRes?.branch_name ||
    "";

  if (String(fromSetting).trim()) {
    return String(fromSetting).trim();
  }

  return selectedBranchId ? `Sucursal ${selectedBranchId}` : "";
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

  const [qrUiMeta, setQrUiMeta] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

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
      name: resolveBranchDisplayName({
        selectedBranchId,
        selectedBranchName,
        settingsRes,
      }),
    };
  }, [selectedBranchId, selectedBranchName, settingsRes]);

  const settings = settingsRes?.data ?? null;
  const uiMeta = settingsRes?.ui ?? null;
  const notices = Array.isArray(settingsRes?.notices) ? settingsRes.notices : [];

  const isDirectAttentionMode =
    (qrUiMeta?.attention_mode || uiMeta?.attention_mode) === "direct";

  const canCreateQr =
    !!selectedBranchId &&
    !!settingsLoaded &&
    !!settings;

  const createQrBlockReason = !selectedBranchId
    ? "No se recibió la sucursal. Regresa a la página de mesas y vuelve a entrar."
    : !settingsLoaded
    ? "La configuración de la sucursal todavía se está cargando."
    : !settings
    ? "Primero crea la Configuración Operativa de esta sucursal para administrar códigos QR."
    : null;

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
      setQrUiMeta(null);
      return;
    }

    setSettingsLoaded(false);
    setSettingsRes(null);
    setItems([]);
    setTables([]);
    setChannels([]);
    setQrUiMeta(null);

    try {
      let settingsResponse;

      try {
        settingsResponse = await getOperationalSettings(
          restaurantId,
          targetBranchId
        );
      } catch (e) {
        if (e?.response?.status === 404) {
          return;
        }

        throw e;
      }

      setSettingsRes(settingsResponse);

      const [qrResponse, t, ch] = await Promise.all([
        getBranchQrCodes(restaurantId, targetBranchId),
        getTables(restaurantId, targetBranchId),
        getBranchSalesChannels(restaurantId, targetBranchId),
      ]);

      const qrPayload = unwrapQrCodesPayload(qrResponse);

      setItems(qrPayload.data);
      setQrUiMeta(qrPayload.ui);
      setTables(Array.isArray(t) ? t : []);
      setChannels(Array.isArray(ch) ? ch : []);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "No se pudo cargar la administración de QRs.";

      showAlert({
        severity: "error",
        title: "Error",
        message: msg,
      });
    } finally {
      setSettingsLoaded(true);
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
        setQrUiMeta(null);
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
        const branchMeta =
          row?.branch && typeof row.branch === "object" ? row.branch : {};

        const id = row?.sales_channel_id ?? sc?.id ?? row?.id;
        const name = sc?.name ?? row?.name ?? null;
        const code = sc?.code ?? row?.code ?? null;
        const status = sc?.status ?? row?.status ?? null;

        if (!id || !name) return null;

        const isSystemChannel =
          typeof sc?.is_system_channel === "boolean"
            ? sc.is_system_channel
            : typeof row?.is_system_channel === "boolean"
            ? row.is_system_channel
            : undefined;

        return {
          id: Number(id),
          name: String(name),
          code: code ? String(code) : "",
          status: status ? String(status) : "",
          is_system_channel: isSystemChannel,
          branch_is_active: branchMeta?.is_active ?? null,
          effective_is_active: branchMeta?.effective_is_active ?? null,
          blocked_by_plan: !!branchMeta?.blocked_by_plan,
          blocked_by_channel_status: !!branchMeta?.blocked_by_channel_status,
          blocked_reason: branchMeta?.blocked_reason || null,
        };
      })
      .filter(Boolean);
  }, [channels]);

  const specificChannelOptions = useMemo(() => {
    return channelOptionsRaw.filter((channel) => {
      const effectiveActive =
        channel.effective_is_active ?? channel.branch_is_active;

      return (
        !isSystemChannelOption(channel) &&
        String(channel.status || "").toLowerCase() === "active" &&
        effectiveActive === true &&
        !channel.blocked_by_plan &&
        !channel.blocked_by_channel_status
      );
    });
  }, [channelOptionsRaw]);

  const salonChannel = useMemo(() => {
    return channelOptionsRaw.find((c) => isSalonChannel(c)) || null;
  }, [channelOptionsRaw]);

  const whatsappChannel = useMemo(() => {
    return channelOptionsRaw.find((c) => isWhatsappChannel(c)) || null;
  }, [channelOptionsRaw]);

  const tableOptions = useMemo(() => {
    return (tables || []).map((t) => ({
      id: Number(t.id),
      name: t.name,
      operation_lock: t?.operation_lock || null,
    }));
  }, [tables]);

  const refreshQrOperationalContext = async () => {
    if (!selectedBranchId) return;

    const [qrResponse, tableResponse] = await Promise.all([
      getBranchQrCodes(restaurantId, selectedBranchId),
      getTables(restaurantId, selectedBranchId),
    ]);

    const qrPayload = unwrapQrCodesPayload(qrResponse);

    setItems(qrPayload.data);
    setQrUiMeta(qrPayload.ui);
    setTables(Array.isArray(tableResponse) ? tableResponse : []);
  };

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
    const nextActive = !qr?.is_active;
    const operationLock = qr?.operation_lock || {};
    const blockedByPlan = !!qr?.blocked_by_plan;
    const blockedByAttentionMode = !!qr?.blocked_by_attention_mode;

    const operationBlocked = nextActive
      ? operationLock?.can_update === false
      : operationLock?.can_deactivate === false;

    if (operationBlocked) {
      showAlert({
        severity: "warning",
        title: "QR en operación",
        message:
          operationLock?.reason ||
          "No puedes activar o desactivar el QR de esta mesa mientras tenga una operación en curso.",
      });
      return;
    }

    if (nextActive && blockedByAttentionMode) {
      showAlert({
        severity: "warning",
        title: "QR bloqueado por modo de atención",
        message:
          qr?.blocked_reason ||
          "El modo de atención directa no permite activar QR físico ligado a mesa.",
      });
      return;
    }

    if (nextActive && blockedByPlan) {
      showAlert({
        severity: "warning",
        title: "QR bloqueado por plan",
        message:
          qr?.blocked_reason ||
          "Tu plan actual no permite activar este tipo de QR.",
      });
      return;
    }

    const intendedOrderingMode = String(
      qr?.intended_ordering_mode || settings?.ordering_mode || ""
    );

    const isCustomerAssistedTableQr =
      qr?.type === "physical" &&
      !!qr?.table_id &&
      intendedOrderingMode === "customer_assisted";

    if (
      nextActive &&
      isCustomerAssistedTableQr &&
      qrUiMeta?.customer_assisted_allowed === false
    ) {
      showAlert({
        severity: "warning",
        title: "QR de mesa no disponible",
        message:
          qrUiMeta?.qr_ordering_blocked_reason ||
          "Tu plan actual ya no permite activar QRs de mesa para Cliente asistido.",
      });
      return;
    }

    setBusy(true);

    try {
      const res = await updateBranchQrCode(
        restaurantId,
        selectedBranchId,
        qr.id,
        { is_active: nextActive }
      );

      const updated = unwrapMutationPayload(res);

      setItems((prev) =>
        prev.map((x) => (x.id === qr.id ? { ...x, ...updated } : x))
      );

      showAlert({
        severity: "success",
        title: "Hecho",
        message: `QR ${nextActive ? "activado" : "desactivado"} correctamente.`,
      });
    } catch (e) {
      const code = e?.response?.data?.code;
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "No se pudo actualizar el QR.";

      if (code === "TABLE_QR_CHANGE_BLOCKED_BY_ACTIVE_OPERATION") {
        showAlert({
          severity: "warning",
          title: "QR en operación",
          message,
        });

        try {
          await refreshQrOperationalContext();
        } catch {
          // Conservamos el aviso principal y evitamos mostrar mensajes repetidos.
        }

        return;
      }

      if (code === "CUSTOMER_ASSISTED_QR_NOT_ALLOWED_BY_PLAN") {
        showAlert({
          severity: "warning",
          title: "QR de mesa no disponible",
          message,
        });

        try {
          await refreshQrOperationalContext();
        } catch {
          // Conservamos el aviso principal.
        }

        return;
      }

      showAlert({
        severity: "error",
        title: "Error",
        message,
      });
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (qr) => {
    if (qr?.operation_lock?.can_delete === false) {
      showAlert({
        severity: "warning",
        title: "QR en operación",
        message:
          qr?.operation_lock?.reason ||
          "No puedes eliminar el QR de esta mesa mientras tenga una operación en curso.",
      });
      return;
    }

    const ok = window.confirm("¿Eliminar este QR? Esto también borra la imagen SVG.");
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
      const code = e?.response?.data?.code;
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "No se pudo eliminar el QR.";

      if (code === "TABLE_QR_CHANGE_BLOCKED_BY_ACTIVE_OPERATION") {
        showAlert({
          severity: "warning",
          title: "QR en operación",
          message,
        });

        try {
          await refreshQrOperationalContext();
        } catch {
          // Conservamos el aviso principal.
        }

        return;
      }

      showAlert({
        severity: "error",
        title: "Error",
        message,
      });
    } finally {
      setBusy(false);
    }
  };

  const openCreate = () => {
    if (!canCreateQr) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: createQrBlockReason || "No puedes crear QRs en este momento.",
      });
      return;
    }

    setCreateOpen(true);
  };


  const openExport = () => {
    if (!selectedBranchId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una sucursal primero.",
      });
      return;
    }

    setExportOpen(true);
  };

  const submitCreate = async (formValues) => {
    if (!canCreateQr) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: createQrBlockReason || "No puedes crear códigos QR en este momento.",
      });
      return;
    }

    const qrPurpose = String(formValues.qrPurpose || "");
    const name = String(formValues.name || "").trim();

    if (!name) {
      showAlert({
        severity: "warning",
        title: "Nombre requerido",
        message: "Escribe un nombre para identificar este QR.",
      });
      return;
    }

    const payload = {
      name,
      type: "",
      sales_channel_id: null,
      table_id: null,
      is_active: !!formValues.is_active,
      intended_ordering_mode: null,
    };

    if (qrPurpose === "general") {
      if (!salonChannel?.id) {
        showAlert({
          severity: "error",
          title: "Canal SALÓN no encontrado",
          message: "No se encontró el canal SALÓN para esta sucursal. Sincroniza los canales del sistema e intenta de nuevo.",
        });
        return;
      }

      payload.type = "physical";
      payload.sales_channel_id = Number(salonChannel.id);
    } else if (qrPurpose === "table") {
      if (
        isDirectAttentionMode ||
        qrUiMeta?.physical_table_qr_allowed === false
      ) {
        showAlert({
          severity: "warning",
          title: "QR de mesa no disponible",
          message: "El modo de atención actual no permite crear un QR físico ligado a una mesa.",
        });
        return;
      }

      if (
        settings?.ordering_mode === "customer_assisted" &&
        qrUiMeta?.customer_assisted_allowed === false
      ) {
        showAlert({
          severity: "warning",
          title: "QR de mesa no disponible",
          message:
            qrUiMeta?.qr_ordering_blocked_reason ||
            "Tu plan actual no permite crear nuevos QRs de mesa para Cliente asistido.",
        });
        return;
      }

      if (!salonChannel?.id) {
        showAlert({
          severity: "error",
          title: "Canal SALÓN no encontrado",
          message: "No se encontró el canal SALÓN para esta sucursal. Sincroniza los canales del sistema e intenta de nuevo.",
        });
        return;
      }

      const tableId = Number(formValues.table_id);

      if (!tableId) {
        showAlert({
          severity: "warning",
          title: "Mesa requerida",
          message: "Selecciona la mesa para la que deseas crear el QR.",
        });
        return;
      }

      const selectedTableOption = tableOptions.find(
        (table) => Number(table.id) === tableId
      );

      if (!selectedTableOption) {
        showAlert({
          severity: "warning",
          title: "Mesa no disponible",
          message: "La mesa seleccionada ya no está disponible.",
        });
        return;
      }

      if (selectedTableOption?.operation_lock?.locked === true) {
        showAlert({
          severity: "warning",
          title: "Mesa en operación",
          message:
            selectedTableOption?.operation_lock?.reason ||
            "No puedes crear un QR para esta mesa mientras tenga una operación en curso.",
        });
        return;
      }

      payload.type = "physical";
      payload.sales_channel_id = Number(salonChannel.id);
      payload.table_id = tableId;
      payload.intended_ordering_mode = String(
        settings?.ordering_mode || "waiter_only"
      );
    } else if (qrPurpose === "whatsapp") {
      if (qrUiMeta?.qr_web_whatsapp_allowed === false) {
        showAlert({
          severity: "warning",
          title: "Pedidos por WhatsApp no disponibles",
          message: qrUiMeta?.qr_web_whatsapp_blocked_reason || "Esta modalidad de QR no está disponible actualmente.",
        });
        return;
      }

      if (!whatsappChannel?.id) {
        showAlert({
          severity: "error",
          title: "Canal WHATSAPP no encontrado",
          message: "No se encontró el canal WHATSAPP activo para esta sucursal. Sincroniza los canales del sistema e intenta de nuevo.",
        });
        return;
      }

      payload.type = "web";
      payload.sales_channel_id = Number(whatsappChannel.id);
    } else if (qrPurpose === "channel") {
      if (!qrUiMeta?.qr_readonly_by_channel_allowed) {
        showAlert({
          severity: "warning",
          title: "Canal específico no disponible",
          message: qrUiMeta?.qr_readonly_by_channel_blocked_reason || "Tu plan actual no permite crear QRs para canales específicos.",
        });
        return;
      }

      const selectedChannel = specificChannelOptions.find(
        (channel) =>
          Number(channel.id) === Number(formValues.sales_channel_id)
      );

      if (!selectedChannel) {
        showAlert({
          severity: "warning",
          title: "Canal requerido",
          message: "Selecciona un canal de venta disponible para este QR.",
        });
        return;
      }

      payload.type = "delivery";
      payload.sales_channel_id = Number(selectedChannel.id);
    } else {
      showAlert({
        severity: "warning",
        title: "Selecciona un tipo de QR",
        message: "Selecciona qué deseas hacer con este código QR.",
      });
      return;
    }

    setBusy(true);

    try {
      const res = await createBranchQrCode(
        restaurantId,
        selectedBranchId,
        payload
      );

      const created = unwrapMutationPayload(res);

      const selectedChannel =
        channelOptionsRaw.find(
          (channel) =>
            Number(channel.id) === Number(payload.sales_channel_id)
        ) || null;

      const createdWithRelations = {
        ...created,
        sales_channel: created?.sales_channel || selectedChannel,
        table:
          created?.table ||
          (payload.table_id
            ? tableOptions.find(
                (table) =>
                  Number(table.id) === Number(payload.table_id)
              ) || null
            : null),
      };

      setItems((prev) => [createdWithRelations, ...prev]);
      setCreateOpen(false);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "QR creado correctamente.",
      });
    } catch (e) {
      const code = e?.response?.data?.code;
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "No se pudo crear el QR.";

      if (code === "TABLE_QR_CHANGE_BLOCKED_BY_ACTIVE_OPERATION") {
        showAlert({
          severity: "warning",
          title: "Mesa en operación",
          message,
        });

        try {
          await refreshQrOperationalContext();
        } catch {
          // Conservamos el aviso principal.
        }

        return;
      }

      if (code === "CUSTOMER_ASSISTED_QR_NOT_ALLOWED_BY_PLAN") {
        showAlert({
          severity: "warning",
          title: "QR de mesa no disponible",
          message,
        });

        try {
          await refreshQrOperationalContext();
        } catch {
          // Conservamos el aviso principal.
        }

        return;
      }

      showAlert({
        severity: "error",
        title: "Error",
        message,
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
          "Primero crea la Configuración Operativa de esta sucursal para poder administrar y generar códigos QR.",
      };
    }

    if (isDirectAttentionMode) {
      return {
        tone: "info",
        title: "Modo de atención directa",
        body:
          "• En este modo no se permite crear ni activar QR físico ligado a mesa.\n" +
          "• Vista general y Pedidos por WhatsApp siguen disponibles.\n" +
          (qrUiMeta?.qr_readonly_by_channel_allowed
            ? "• También puedes crear un QR de Canal específico para canales externos permitidos.\n"
            : "") +
          "• Los QRs de mesa existentes pueden aparecer bloqueados y no podrán reactivarse mientras siga activo este modo.",
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
    notices,
    isDirectAttentionMode,
    qrUiMeta,
  ]);

  const contextData = useMemo(() => {
    return {
      totalQrs: items.length,
      totalTables: tables.length,
      totalSpecificChannels: specificChannelOptions.length,
      hasOperationalSettings: !!settings,
      orderingMode: settings?.ordering_mode || "Sin definir",
      attentionMode:
        qrUiMeta?.attention_mode ||
        uiMeta?.attention_mode ||
        "fixed",
      isDirectAttentionMode,
      qrReadonlyByChannelAllowed:
        !!qrUiMeta?.qr_readonly_by_channel_allowed,
      qrReadonlyByChannelBlockedReason:
        qrUiMeta?.qr_readonly_by_channel_blocked_reason || null,
    };
  }, [
    items.length,
    tables.length,
    specificChannelOptions.length,
    settings,
    qrUiMeta,
    uiMeta,
    isDirectAttentionMode,
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
          canCreateQr={canCreateQr}
          createQrBlockReason={createQrBlockReason}
          qrUiMeta={qrUiMeta}
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

        <BranchQrInstructionsCard qrUiMeta={qrUiMeta} />

        <BranchQrContextCard
          selectedBranch={selectedBranch}
          contextData={contextData}
          qrUiMeta={qrUiMeta}
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
          onExport={openExport}
          typeLabelMap={TYPE_LABEL}
          busy={busy}
          selectedBranchId={selectedBranchId}
          qrUiMeta={qrUiMeta}
          orderingMode={settings?.ordering_mode || ""}
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
        whatsappChannel={whatsappChannel}
        specificChannelOptions={specificChannelOptions}
        tableOptions={tableOptions}
        qrUiMeta={qrUiMeta}
      />

      <BranchQrExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        restaurantId={restaurantId}
        branchId={selectedBranchId}
        items={sortedItems}
        busy={busy}
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