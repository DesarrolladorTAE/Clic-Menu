import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";

import WhasapoConnectionHeader from "../../../components/connection/whasapo/WhasapoConnectionHeader";
import WhasapoInstructionsCard from "../../../components/connection/whasapo/WhasapoInstructionsCard";
import WhasapoBranchSelectorCard from "../../../components/connection/whasapo/WhasapoBranchSelectorCard";
import WhasapoChannelPreferenceCard from "../../../components/connection/whasapo/WhasapoChannelPreferenceCard";
import WhasapoConnectionTabs from "../../../components/connection/whasapo/WhasapoConnectionTabs";
import WhasapoContextCard from "../../../components/connection/whasapo/WhasapoContextCard";
import WhasapoSettingsCard from "../../../components/connection/whasapo/WhasapoSettingsCard";
import ChatingBootPanel from "../../../components/connection/whasapo/chatinbot/ChatingBootPanel";

import { getBranchesByRestaurant } from "../../../services/restaurant/branch.service";

import {
  getBranchWhasapoSetting,
  updateBranchWhasapoSetting,
  deleteBranchWhasapoSetting,
} from "../../../services/operation/ticket/branchWhasapoSetting.service";

const DEFAULT_FORM = {
  use_custom_token: false,
  custom_token: "",
};

const DEFAULT_CHANNEL_STATE = {
  preferred_channel: null,
  effective_channel: "whasapo",
  can_choose_channel: false,
  whasapo_available: false,
  addon_whatsapp_qr_available: false,
  qr_connection_status: null,
  qr_connected: false,
  reconnect_required: false,
  using_system_fallback: true,
};

export default function WhasapoConnectionPage() {
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferenceSaving, setPreferenceSaving] = useState(false);

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");

  const [tab, setTab] = useState("whasapo");

  const [form, setForm] = useState(DEFAULT_FORM);
  const [persistedWhasapo, setPersistedWhasapo] = useState(DEFAULT_FORM);
  const [channelState, setChannelState] = useState(DEFAULT_CHANNEL_STATE);

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
      branches.find(
        (branch) => String(branch.id) === String(branchId)
      ) || null
    );
  }, [branches, branchId]);

  const hasPendingWhasapoChanges = useMemo(() => {
    return (
      Boolean(form.use_custom_token) !==
        Boolean(persistedWhasapo.use_custom_token) ||
      String(form.custom_token || "") !==
        String(persistedWhasapo.custom_token || "")
    );
  }, [form, persistedWhasapo]);

  const resetLocalState = () => {
    setForm(DEFAULT_FORM);
    setPersistedWhasapo(DEFAULT_FORM);
    setChannelState(DEFAULT_CHANNEL_STATE);
  };

  const hydrateFormFromResponse = (responseData) => {
    const setting = responseData?.whasapo_setting || {};

    const nextForm = {
      use_custom_token: Boolean(setting.use_custom_token),
      custom_token: setting.custom_token || "",
    };

    setForm(nextForm);
    setPersistedWhasapo(nextForm);

    setChannelState({
      preferred_channel: setting.preferred_channel || null,
      effective_channel: setting.effective_channel || "whasapo",
      can_choose_channel: Boolean(setting.can_choose_channel),
      whasapo_available: Boolean(setting.whasapo_available),
      addon_whatsapp_qr_available: Boolean(
        setting.addon_whatsapp_qr_available
      ),
      qr_connection_status: setting.qr_connection_status || null,
      qr_connected: Boolean(setting.qr_connected),
      reconnect_required: Boolean(setting.reconnect_required),
      using_system_fallback: Boolean(setting.using_system_fallback),
    });
  };

  const loadBranchSetting = async (targetBranchId) => {
    if (!targetBranchId) {
      resetLocalState();
      return;
    }

    const data = await getBranchWhasapoSetting(
      restaurantId,
      targetBranchId
    );

    hydrateFormFromResponse(data);
  };

  const refreshChannelState = async (targetBranchId) => {
    if (!targetBranchId) return;

    const data = await getBranchWhasapoSetting(
      restaurantId,
      targetBranchId
    );

    const setting = data?.whasapo_setting || {};

    setChannelState({
      preferred_channel: setting.preferred_channel || null,
      effective_channel: setting.effective_channel || "whasapo",
      can_choose_channel: Boolean(setting.can_choose_channel),
      whasapo_available: Boolean(setting.whasapo_available),
      addon_whatsapp_qr_available: Boolean(
        setting.addon_whatsapp_qr_available
      ),
      qr_connection_status: setting.qr_connection_status || null,
      qr_connected: Boolean(setting.qr_connected),
      reconnect_required: Boolean(setting.reconnect_required),
      using_system_fallback: Boolean(setting.using_system_fallback),
    });
  };

  const loadAll = async () => {
    setLoading(true);

    try {
      let loadedBranches = await getBranchesByRestaurant(restaurantId);
      loadedBranches = Array.isArray(loadedBranches)
        ? loadedBranches
        : [];

      setBranches(loadedBranches);

      const nextBranchId = loadedBranches?.[0]?.id
        ? String(loadedBranches[0].id)
        : "";

      setBranchId(nextBranchId);

      if (nextBranchId) {
        await loadBranchSetting(nextBranchId);
      } else {
        resetLocalState();
      }
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo cargar la configuración de WhatsApp.",
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
    if (!branchId || loading) return;

    setTab("whasapo");

    (async () => {
      try {
        await loadBranchSetting(branchId);
      } catch (e) {
        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudo cargar la configuración de WhatsApp de la sucursal seleccionada.",
        });
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  const handleChangeField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!branchId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una sucursal antes de guardar Whasapo.",
      });
      return;
    }

    const payload = {
      use_custom_token: Boolean(form.use_custom_token),
      custom_token: form.use_custom_token
        ? form.custom_token?.trim() || null
        : null,
    };

    setSaving(true);

    try {
      const updated = await updateBranchWhasapoSetting(
        restaurantId,
        branchId,
        payload
      );

      hydrateFormFromResponse(updated);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Configuración de Whasapo guardada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          e?.response?.data?.errors?.custom_token?.[0] ||
          "No se pudo guardar la configuración de Whasapo.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!branchId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una sucursal antes de restablecer Whasapo.",
      });
      return;
    }

    setSaving(true);

    try {
      const updated = await deleteBranchWhasapoSetting(
        restaurantId,
        branchId
      );

      hydrateFormFromResponse(updated);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Configuración de Whasapo restablecida correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo restablecer la configuración de Whasapo.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreferredChannelChange = async (preferredChannel) => {
    if (!branchId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message:
          "Selecciona una sucursal antes de cambiar el canal de envío.",
      });
      return;
    }

    if (hasPendingWhasapoChanges) {
      showAlert({
        severity: "warning",
        title: "Cambios pendientes",
        message:
          "Guarda o restablece primero los cambios de Whasapo antes de cambiar el canal preferido.",
      });
      return;
    }

    setPreferenceSaving(true);

    try {
      const updated = await updateBranchWhasapoSetting(
        restaurantId,
        branchId,
        {
          use_custom_token: Boolean(
            persistedWhasapo.use_custom_token
          ),
          preferred_channel: preferredChannel || null,
        }
      );

      hydrateFormFromResponse(updated);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: preferredChannel
          ? "Canal de envío preferido actualizado correctamente."
          : "La selección automática del canal quedó activada.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          e?.response?.data?.errors?.preferred_channel?.[0] ||
          "No se pudo actualizar el canal de envío.",
      });
        } finally {
      setPreferenceSaving(false);
    }
  };

  const handleWhatsappQrConnectionChange = async () => {
    if (!branchId) return;

    try {
      await refreshChannelState(branchId);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "La conexión cambió, pero no se pudo actualizar el estado del canal de envío.",
      });
    }
  };

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

            <Typography
              sx={{
                color: "text.secondary",
                fontSize: 14,
              }}
            >
              Cargando configuración de WhatsApp…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <WhasapoConnectionHeader
          selectedBranch={selectedBranch}
        />

        <WhasapoInstructionsCard />

        <WhasapoBranchSelectorCard
          branches={branches}
          branchId={branchId}
          onChangeBranch={setBranchId}
          selectedBranch={selectedBranch}
        />

        <WhasapoChannelPreferenceCard
          selectedBranch={selectedBranch}
          preferredChannel={channelState.preferred_channel}
          effectiveChannel={channelState.effective_channel}
          canChooseChannel={channelState.can_choose_channel}
          whasapoAvailable={channelState.whasapo_available}
          addonWhatsappQrAvailable={
            channelState.addon_whatsapp_qr_available
          }
          qrConnected={channelState.qr_connected}
          reconnectRequired={channelState.reconnect_required}
          usingSystemFallback={channelState.using_system_fallback}
          saving={preferenceSaving}
          disabled={!selectedBranch || saving}
          hasPendingWhasapoChanges={hasPendingWhasapoChanges}
          onChangePreferredChannel={handlePreferredChannelChange}
        />

        <WhasapoConnectionTabs
          tab={tab}
          onChange={setTab}
        />

        {tab === "whasapo" ? (
          <>
            <WhasapoContextCard
              selectedBranch={selectedBranch}
              form={form}
            />

            <WhasapoSettingsCard
              form={form}
              onChange={handleChangeField}
              onSave={handleSave}
              onReset={handleReset}
              saving={saving}
              disabled={!selectedBranch || preferenceSaving}
            />
          </>
        ) : null}

        {tab === "whatsapp-qr" ? (
          <ChatingBootPanel
            restaurantId={restaurantId}
            branchId={branchId}
            selectedBranch={selectedBranch}
            addonAvailable={channelState.addon_whatsapp_qr_available}
            onNotify={showAlert}
            onConnectionChange={handleWhatsappQrConnectionChange}
          />
        ) : null}
      </Stack>

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={3000}
      />
    </PageContainer>
  );
}