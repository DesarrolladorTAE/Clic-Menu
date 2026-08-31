import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";

import WhasapoConnectionHeader from "../../../components/connection/whasapo/WhasapoConnectionHeader";
import WhasapoInstructionsCard from "../../../components/connection/whasapo/WhasapoInstructionsCard";
import WhasapoBranchSelectorCard from "../../../components/connection/whasapo/WhasapoBranchSelectorCard";
import WhasapoContextCard from "../../../components/connection/whasapo/WhasapoContextCard";
import WhasapoSettingsCard from "../../../components/connection/whasapo/WhasapoSettingsCard";

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

export default function WhasapoConnectionPage() {
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [form, setForm] = useState(DEFAULT_FORM);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const selectedBranch = useMemo(() => {
    return branches.find((branch) => String(branch.id) === String(branchId)) || null;
  }, [branches, branchId]);

  const hydrateFormFromResponse = (responseData) => {
    const setting = responseData?.whasapo_setting || {};

    setForm({
      use_custom_token: Boolean(setting.use_custom_token),
      custom_token: setting.custom_token || "",
    });
  };

  const loadBranchSetting = async (targetBranchId) => {
    if (!targetBranchId) {
      setForm(DEFAULT_FORM);
      return;
    }

    const data = await getBranchWhasapoSetting(restaurantId, targetBranchId);
    hydrateFormFromResponse(data);
  };

  const loadAll = async () => {
    setLoading(true);

    try {
      let loadedBranches = await getBranchesByRestaurant(restaurantId);
      loadedBranches = Array.isArray(loadedBranches) ? loadedBranches : [];
      setBranches(loadedBranches);

      const nextBranchId = loadedBranches?.[0]?.id ? String(loadedBranches[0].id) : "";
      setBranchId(nextBranchId);

      if (nextBranchId) await loadBranchSetting(nextBranchId);
      else setForm(DEFAULT_FORM);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo cargar la configuración de Whasapo.",
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

    (async () => {
      try {
        await loadBranchSetting(branchId);
      } catch (e) {
        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudo cargar la configuración de Whasapo de la sucursal seleccionada.",
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  const handleChangeField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
      custom_token: form.use_custom_token ? form.custom_token?.trim() || null : null,
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
      const updated = await deleteBranchWhasapoSetting(restaurantId, branchId);
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

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="primary" />

            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Cargando configuración de Whasapo…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <WhasapoConnectionHeader selectedBranch={selectedBranch} />

        <WhasapoInstructionsCard />

        <WhasapoBranchSelectorCard
            branches={branches}
            branchId={branchId}
            onChangeBranch={setBranchId}
            selectedBranch={selectedBranch}
        />

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
            disabled={!selectedBranch}
        />
     </Stack>

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