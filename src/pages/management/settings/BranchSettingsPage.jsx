import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Stack, Typography,
} from "@mui/material";

import { useLocation, useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";

import BranchSettingsHeader from "../../../components/management/settings/BranchSettingsHeader";
import BranchSettingsBranchSelector from "../../../components/management/settings/BranchSettingsBranchSelector";
import BranchSettingsFormCard from "../../../components/management/settings/BranchSettingsFormCard";

import { getBranchesByRestaurant } from "../../../services/restaurant/branch.service";

import {
  getBranchWorkflowSetting,
  updateBranchWorkflowSetting,
  getBranchDirectSaleSetting,
  updateBranchDirectSaleSetting,
} from "../../../services/management/settings/branchSettings.service";

function unwrapOperationalData(response) {
  if (!response || typeof response !== "object") return null;

  if (response.data && typeof response.data === "object") {
    return response.data;
  }

  return response;
}

function errorMessage(error, fallback) {
  const data = error?.response?.data;
  const errors = data?.errors;

  if (data?.message) return data.message;

  if (errors && typeof errors === "object") {
    const firstError = Object.values(errors).flat().find(Boolean);
    if (firstError) return String(firstError);
  }

  return error?.message || fallback;
}

export default function BranchSettingsPage() {
  const { restaurantId } = useParams();
  const location = useLocation();

  const requestedBranchId = location.state?.branchId
    ? String(location.state.branchId)
    : "";

  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [saving, setSaving] = useState(false);

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");

  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({
    catalog_mode: "",
    cashier_direct_mode: "",
  });

  const [pendingBranchId, setPendingBranchId] = useState(null);

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
    if (!message) return;

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
    return branches.find(
      (branch) => String(branch.id) === String(selectedBranchId)
    ) || null;
  }, [branches, selectedBranchId]);

  const settingsReady =
    !!settings &&
    String(settings.branchId) === String(selectedBranchId);

  const catalogDirty =
    settingsReady &&
    settings.workflowAvailable &&
    form.catalog_mode !== settings.original.catalog_mode;

  const cashierDirty =
    settingsReady &&
    settings.cashierAvailable &&
    form.cashier_direct_mode !== settings.original.cashier_direct_mode;

  const hasChanges = Boolean(catalogDirty || cashierDirty);

  const saveDisabled =
    saving ||
    loadingSettings ||
    !settingsReady ||
    !hasChanges;

  /*
  |--------------------------------------------------------------------------
  | Cargar sucursales del restaurante
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    const loadBranches = async () => {
      setLoadingBranches(true);

      try {
        const response = await getBranchesByRestaurant(restaurantId);

        if (!mounted) return;

        const loadedBranches = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];

        setBranches(loadedBranches);

        const requestedExists = loadedBranches.some(
          (branch) => String(branch.id) === requestedBranchId
        );

        const nextBranchId = requestedExists
          ? requestedBranchId
          : loadedBranches[0]?.id
          ? String(loadedBranches[0].id)
          : "";

        setSelectedBranchId(nextBranchId);
      } catch (error) {
        if (!mounted) return;

        setBranches([]);
        setSelectedBranchId("");

        showAlert({
          severity: "error",
          title: "Error",
          message: errorMessage(error, "No se pudieron cargar las sucursales."),
        });
      } finally {
        if (mounted) setLoadingBranches(false);
      }
    };

    loadBranches();

    return () => {
      mounted = false;
    };
  }, [restaurantId, requestedBranchId]);

  /*
  |--------------------------------------------------------------------------
  | Cargar configuración de la sucursal seleccionada
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!selectedBranchId) {
      setSettings(null);
      setForm({ catalog_mode: "", cashier_direct_mode: "" });
      setLoadingSettings(false);
      return;
    }

    let mounted = true;

    const loadSettings = async () => {
      setLoadingSettings(true);
      setSettings(null);

      const [workflowResult, operationalResult] = await Promise.allSettled([
        getBranchWorkflowSetting(restaurantId, selectedBranchId),
        getBranchDirectSaleSetting(restaurantId, selectedBranchId),
      ]);

      if (!mounted) return;

      const workflowAvailable =
        workflowResult.status === "fulfilled" &&
        !!workflowResult.value?.catalog_mode;

      const operationalResponse =
        operationalResult.status === "fulfilled"
          ? operationalResult.value
          : null;

      const operationalData = unwrapOperationalData(operationalResponse);
      const operationalUi = operationalResponse?.ui || null;

      const cashierMode = operationalData?.cashier_direct_mode || "";

      const cashierAvailable =
        operationalResult.status === "fulfilled" &&
        !!cashierMode &&
        operationalUi?.visibility?.cashier_direct_mode !== false;

      const nextForm = {
        catalog_mode: workflowAvailable
          ? String(workflowResult.value.catalog_mode)
          : "",
        cashier_direct_mode: cashierMode,
      };

      setSettings({
        branchId: selectedBranchId,
        original: { ...nextForm },
        workflowAvailable,
        cashierAvailable,
        operationalData,
        operationalUi,
        operationalMissing:
          operationalResult.status === "rejected" &&
          operationalResult.reason?.response?.status === 404,
      });

      setForm(nextForm);
      setLoadingSettings(false);

      if (workflowResult.status === "rejected") {
        showAlert({
          severity: "error",
          title: "Error",
          message: errorMessage(
            workflowResult.reason,
            "No se pudo cargar el modo de trabajo."
          ),
        });
      } else if (
        operationalResult.status === "rejected" &&
        operationalResult.reason?.response?.status !== 404
      ) {
        showAlert({
          severity: "error",
          title: "Error",
          message: errorMessage(
            operationalResult.reason,
            "No se pudo cargar el modo de venta directa."
          ),
        });
      }
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, [restaurantId, selectedBranchId]);

  /*
  |--------------------------------------------------------------------------
  | Actualizar formulario sin recargar la página
  |--------------------------------------------------------------------------
  */

  const handleChange = (field, value) => {
    if (!settingsReady || saving) return;

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Cambio de sucursal
  |--------------------------------------------------------------------------
  */

  const handleBranchChange = (nextBranchId) => {
    const nextValue = String(nextBranchId);

    if (saving || nextValue === selectedBranchId) return;

    if (hasChanges) {
      setPendingBranchId(nextValue);
      return;
    }

    setSelectedBranchId(nextValue);
  };

  const confirmBranchChange = () => {
    if (pendingBranchId === null) return;

    setSelectedBranchId(pendingBranchId);
    setPendingBranchId(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Guardar únicamente valores modificados
  |--------------------------------------------------------------------------
  */

  const handleSave = async () => {
    if (saveDisabled || !settings) return;

    setSaving(true);

    let catalogSaved = false;

    try {
      /*
       * Primero guardar el modo de trabajo.
       *
       * Si el backend bloquea el cambio por operaciones pendientes,
       * se detiene el guardado antes de modificar la venta directa.
       */
      if (catalogDirty) {
        const response = await updateBranchWorkflowSetting(
          restaurantId,
          selectedBranchId,
          form.catalog_mode
        );

        const confirmedValue = response?.catalog_mode || form.catalog_mode;

        setSettings((prev) => ({
          ...prev,
          original: {
            ...prev.original,
            catalog_mode: confirmedValue,
          },
        }));

        catalogSaved = true;
      }

      if (cashierDirty) {
        const response = await updateBranchDirectSaleSetting(
          restaurantId,
          selectedBranchId,
          settings.operationalData,
          settings.operationalUi,
          form.cashier_direct_mode
        );

        const savedOperationalData = unwrapOperationalData(response);
        const confirmedValue =
          savedOperationalData?.cashier_direct_mode || form.cashier_direct_mode;

        setSettings((prev) => ({
          ...prev,
          original: {
            ...prev.original,
            cashier_direct_mode: confirmedValue,
          },
          operationalData: {
            ...prev.operationalData,
            ...(savedOperationalData || {}),
            cashier_direct_mode: confirmedValue,
          },
          operationalUi: response?.ui || prev.operationalUi,
        }));
      }

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Configuración guardada correctamente.",
      });
    } catch (error) {
      const message = errorMessage(
        error,
        "No se pudo guardar la configuración."
      );

      showAlert({
        severity: catalogSaved || error?.response?.status === 409
          ? "warning"
          : "error",
        title: catalogSaved ? "Guardado parcial" : "No se pudo guardar",
        message: catalogSaved
          ? `${message} El modo de trabajo sí se guardó; la venta directa quedó pendiente.`
          : message,
      });
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Renderizado
  |--------------------------------------------------------------------------
  */

  return (
    <PageContainer>
      <Stack spacing={3}>
        <BranchSettingsHeader />

        {loadingBranches ? (
          <Box
            sx={{
              minHeight: 200,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Stack spacing={2} alignItems="center">
              <CircularProgress color="primary" />

              <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                Cargando sucursales…
              </Typography>
            </Stack>
          </Box>
        ) : (
          <>
            <BranchSettingsBranchSelector
              branches={branches}
              branchId={selectedBranchId}
              onChangeBranch={handleBranchChange}
              selectedBranch={selectedBranch}
              disabled={saving}
            />

            {!selectedBranchId ? (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography
                  sx={{
                    fontSize: 15,
                    color: "text.secondary",
                  }}
                >
                  Selecciona una sucursal para consultar su configuración.
                </Typography>
              </Box>
            ) : loadingSettings || !settingsReady ? (
              <Box
                sx={{
                  minHeight: 220,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Stack spacing={2} alignItems="center">
                  <CircularProgress color="primary" />

                  <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                    Cargando configuración…
                  </Typography>
                </Stack>
              </Box>
            ) : (
              <>
                <BranchSettingsFormCard
                  catalogMode={form.catalog_mode}
                  cashierDirectMode={form.cashier_direct_mode}
                  onChangeCatalogMode={(value) => handleChange("catalog_mode", value)}
                  onChangeCashierDirectMode={(value) => handleChange("cashier_direct_mode", value)}
                  catalogDisabled={saving || !settings.workflowAvailable}
                  cashierDisabled={saving || !settings.cashierAvailable}
                  cashierUnavailableReason={
                    settings.operationalMissing
                      ? "Esta sucursal aún necesita completar su configuración operativa inicial."
                      : ""
                  }
                />

                <Stack
                  direction={{ xs: "column-reverse", sm: "row" }}
                  justifyContent="flex-end"
                  spacing={1.5}
                >
                  <Button
                    onClick={handleSave}
                    disabled={saveDisabled}
                    variant="contained"
                    sx={{
                      minWidth: { xs: "100%", sm: 220 },
                      height: 44,
                      borderRadius: 2,
                      fontWeight: 800,
                    }}
                  >
                    {saving ? "Guardando…" : "Guardar configuración"}
                  </Button>
                </Stack>
              </>
            )}
          </>
        )}
      </Stack>

      <Dialog
        open={pendingBranchId !== null}
        onClose={() => setPendingBranchId(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 1,
            backgroundColor: "background.paper",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "text.primary" }}>
          Cambios sin guardar
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
            Tienes cambios pendientes. Si cambias de sucursal, se descartarán.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
            flexDirection: { xs: "column-reverse", sm: "row" },
            gap: 1,
            "& > :not(style) ~ :not(style)": { ml: 0 },
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setPendingBranchId(null)}
            sx={{
              minWidth: { xs: "100%", sm: 120 },
              borderRadius: 2,
            }}
          >
            Volver
          </Button>

          <Button
            variant="contained"
            onClick={confirmBranchChange}
            sx={{
              minWidth: { xs: "100%", sm: 160 },
              borderRadius: 2,
              fontWeight: 800,
            }}
          >
            Cambiar sucursal
          </Button>
        </DialogActions>
      </Dialog>

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