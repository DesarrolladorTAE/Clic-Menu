//src/pages/menu/menuSets/manage/MenuSetManagePage.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  Box, Button, CircularProgress, Paper, Stack, Typography,
} from "@mui/material";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";

import MenuSetManageTabs, {
  SHOW_MENU_SET_ADMINISTRATION,
} from "../../../../components/menu/menuSets/manage/MenuSetManageTabs";

import MenuSetGeneralTab from "../../../../components/menu/menuSets/manage/MenuSetGeneralTab";
import MenuSetAdministrationTab from "../../../../components/menu/menuSets/manage/MenuSetAdministrationTab";
import MenuSetStagesTab from "../../../../components/menu/menuSets/manage/stages/MenuSetStagesTab";
import MenuSetProgrammingTab from "../../../../components/menu/menuSets/manage/MenuSetProgrammingTab";
import MenuSetActivationTab from "../../../../components/menu/menuSets/manage/MenuSetActivationTab";
import MenuSetAvailabilityTab from "../../../../components/menu/menuSets/manage/availability/MenuSetAvailabilityTab";

import { getMenuSet } from "../../../../services/menu/menuSets/menuSet.service";
import { getMenuSetManagement } from "../../../../services/menu/menuSets/menuSetManagement.service";

const panelSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: 1,
  backgroundColor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
};

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;
  const fieldErrors = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat() : [];

  return fieldErrors.find((message) => typeof message === "string")
    || data?.message || error?.message || fallback;
}

function normalizeTab(value) {
  const tab = value === "capacities" ? "programming" : value;

  // Administración queda inaccesible mientras esté oculta.
  if (tab === "administration" && !SHOW_MENU_SET_ADMINISTRATION)
  {
    return "stages";
  }

  const validTabs = [
    "general",
    "administration",
    "stages",
    "programming",
    "activation",
    "availability",
  ];

  return validTabs.includes(tab) ? tab : "general";
}

export default function MenuSetManagePage() {
  const { restaurantId, menuSetId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const branchId = String(searchParams.get("branchId") || location.state?.branchId || "");

  const [menuSet, setMenuSet] = useState(null);
  const [management, setManagement] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingManagement, setLoadingManagement] = useState(true);
  const [checkingActivation, setCheckingActivation] = useState(false);

  const managementRetryRef = useRef(false);

  const [activeTab, setActiveTab] = useState(() =>
    normalizeTab(location.state?.activeTab)
  );

  const [alertState, setAlertState] = useState({
    open: Boolean(location.state?.successMessage),
    severity: "success",
    title: "Hecho",
    message: location.state?.successMessage || "",
  });

  const showAlert = useCallback(({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  }, []);

  const closeAlert = (_, reason) => {
    if (reason === "clickaway")
    {
      return;
    }

    setAlertState((previous) => ({ ...previous, open: false }));
  };

  // Evita conservar Administración activa al ocultar la pestaña.
  useEffect(() => {
    if (!SHOW_MENU_SET_ADMINISTRATION && activeTab === "administration")
    {
      setActiveTab("stages");
    }
  }, [activeTab]);

  useEffect(() => {
    if (!restaurantId || !branchId || !menuSetId)
    {
      setMenuSet(null);
      setManagement(null);
      setLoading(false);
      setLoadingManagement(false);
      return undefined;
    }

    let active = true;

    const loadConfiguration = async () => {
      setLoading(true);
      setLoadingManagement(true);

      try {
        const [setResult, managementResult] = await Promise.allSettled([
          getMenuSet(restaurantId, branchId, menuSetId),
          getMenuSetManagement(restaurantId, branchId, menuSetId),
        ]);

        if (!active)
        {
          return;
        }

        if (setResult.status === "fulfilled" && setResult.value?.id)
        {
          setMenuSet(setResult.value);
        }
        else
        {
          setMenuSet(null);

          const error = setResult.status === "rejected"
            ? setResult.reason
            : new Error("No se encontró el conjunto seleccionado.");

          showAlert({
            message: getErrorMessage(error, "No se pudo consultar el conjunto."),
          });
        }

        if (managementResult.status === "fulfilled" && managementResult.value?.management_mode)
        {
          setManagement(managementResult.value);
        }
        else
        {
          setManagement(null);

          if (setResult.status === "fulfilled" && setResult.value?.id)
          {
            const error = managementResult.status === "rejected"
              ? managementResult.reason
              : new Error("No se recibió la modalidad de administración.");

            showAlert({
              message: getErrorMessage(error, "No se pudo consultar la administración del conjunto."),
            });
          }
        }
      }
      finally
      {
        if (active)
        {
          setLoading(false);
          setLoadingManagement(false);
        }
      }
    };

    loadConfiguration();

    return () => {
      active = false;
    };
  }, [restaurantId, branchId, menuSetId, showAlert]);

  /*
  |--------------------------------------------------------------------------
  | Sincronizar la preparación sin recargar la página
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    if (activeTab !== "activation" || !menuSet?.id)
    {
      return undefined;
    }

    let active = true;
    setCheckingActivation(true);

    const checkConfiguration = async () => {
      try {
        const updatedSet = await getMenuSet(restaurantId, branchId, menuSetId);

        if (!active)
        {
          return;
        }

        if (updatedSet?.id)
        {
          setMenuSet(updatedSet);
        }
      }
      catch (error)
      {
        if (!active)
        {
          return;
        }

        showAlert({
          severity: "error",
          title: "No se pudo comprobar",
          message: getErrorMessage(error, "No se pudo consultar la configuración actual del conjunto."),
        });
      }
      finally
      {
        if (active)
        {
          setCheckingActivation(false);
        }
      }
    };

    checkConfiguration();

    return () => {
      active = false;
    };
  }, [
    activeTab, menuSet?.id, restaurantId,
    branchId, menuSetId, showAlert,
  ]);

  const handleBack = () => {
    navigate("..", {
      relative: "path",
      state: { branchId },
    });
  };

  const handleOpenReminders = () => {
    if (!restaurantId || !branchId)
    {
      return;
    }

    navigate(
      `/owner/restaurants/${restaurantId}/operation/menu-sets/panel-operativo?branchId=${encodeURIComponent(branchId)}&tab=avisos`,
      { state: { branchId } }
    );
  };

  const handleUpdated = (updatedSet) => {
    setMenuSet(updatedSet);
  };

  // Se conserva para reactivar la administración sin reconstruir su lógica.
  const handleManagementUpdated = (updatedManagement) => {
    if (!updatedManagement?.management_mode)
    {
      return;
    }

    setManagement(updatedManagement);

    setMenuSet((current) => {
      if (!current)
      {
        return current;
      }

      const isMass = updatedManagement.management_mode === "mass_import";

      return {
        ...current,
        management_mode: updatedManagement.management_mode,
        capacity_mode: updatedManagement.manual_capacity_mode,
        manual_capacity_mode: updatedManagement.manual_capacity_mode,
        next_import_capacity_mode: updatedManagement.next_import_capacity_mode,
        import_update_day: updatedManagement.import_update_day,
        import_deadline_time: updatedManagement.import_deadline_time,
        publication_floor_id: updatedManagement.publication_floor_id,

        // No permitir acciones con permisos anteriores mientras se sincroniza.
        can_change_capacity_mode: isMass ? false : current.can_change_capacity_mode,
        can_edit_capacity_limits: isMass ? false : current.can_edit_capacity_limits,
        can_add_service_days: isMass ? false : current.can_add_service_days,
        can_remove_service_days: isMass ? false : current.can_remove_service_days,
        can_add_stages: isMass ? false : current.can_add_stages,
        structural_editing_allowed: isMass ? false : current.structural_editing_allowed,
      };
    });

    // Obtener los permisos y la configuración definitivos sin recargar la página.
    getMenuSet(restaurantId, branchId, menuSetId)
      .then((updatedSet) => {
        if (updatedSet?.id && String(updatedSet.id) === String(menuSetId))
        {
          setMenuSet(updatedSet);
        }
      })
      .catch(() => {
        // Se mantiene el cambio confirmado y los permisos conservadores.
      });
  };

  const handleTabChange = (nextTab) => {
    const tab = normalizeTab(nextTab);
    setActiveTab(tab);

    // Programación sigue necesitando conocer el modo real del Backend.
    const requiresManagement = tab === "programming"
      || (SHOW_MENU_SET_ADMINISTRATION && tab === "administration");

    if (!requiresManagement || management || loadingManagement || managementRetryRef.current)
    {
      return;
    }

    managementRetryRef.current = true;
    setLoadingManagement(true);

    getMenuSetManagement(restaurantId, branchId, menuSetId)
      .then((result) => {
        setManagement(result);
      })
      .catch((error) => {
        showAlert({
          message: getErrorMessage(error, "No se pudo consultar la administración del conjunto."),
        });
      })
      .finally(() => {
        managementRetryRef.current = false;
        setLoadingManagement(false);
      });
  };

  const handleConfigureProducts = (stage) => {
    if (!stage?.id || !branchId || !menuSetId)
    {
      return;
    }

    navigate(
      `/owner/restaurants/${restaurantId}/operation/menu-sets/${menuSetId}/stages/${stage.id}/products?branchId=${encodeURIComponent(branchId)}`,
      {
        state: {
          branchId,
          menuSetName: menuSet?.name,
          stageName: stage.name,
        },
      }
    );
  };

  const handleManageTypes = () => {
    if (!restaurantId || !branchId || !menuSetId)
    {
      return;
    }

    navigate(
      `/owner/restaurants/${restaurantId}/operation/menu-sets/${menuSetId}/stage-definitions?branchId=${encodeURIComponent(branchId)}`,
      {
        state: {
          branchId,
          menuSetName: menuSet?.name,
        },
      }
    );
  };

  return (
    <PageContainer>
      <Stack spacing={3}>
        {/* Encabezado */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{
              fontSize: { xs: 30, md: 42 }, fontWeight: 800,
              color: "text.primary", lineHeight: 1.1,
            }}>
              Administrar Conjunto
            </Typography>

            <Typography sx={{
              mt: 1, fontSize: { xs: 14, md: 17 },
              lineHeight: 1.55, color: "text.secondary",
            }}>
              Configura los datos y la disponibilidad de{" "}
              <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>
                {menuSet?.name || "tu conjunto"}
              </Box>.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            {activeTab === "programming"
              && (management?.management_mode || menuSet?.management_mode) === "mass_import" ? (
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<NotificationsNoneOutlinedIcon />}
                  onClick={handleOpenReminders}
                  disabled={!branchId}
                  sx={{
                    minWidth: { xs: "100%", sm: 140 },
                    height: 44, fontWeight: 800,
                  }}
                >
                  Avisos
                </Button>
            ) : null}

            <Button
              type="button"
              variant="outlined"
              startIcon={<ArrowBackOutlinedIcon />}
              onClick={handleBack}
              sx={{
                minWidth: { xs: "100%", sm: 190 },
                height: 44, fontWeight: 800,
              }}
            >
              Volver a Conjuntos
            </Button>
          </Stack>
        </Stack>

        {loading ? (
          <Box sx={{
            minHeight: "45vh", display: "grid", placeItems: "center",
          }}>
            <Stack spacing={2} alignItems="center">
              <CircularProgress color="primary" />

              <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                Cargando información del conjunto…
              </Typography>
            </Stack>
          </Box>
        ) : !menuSet ? (
          <Paper sx={panelSx}>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
              Conjunto no disponible
            </Typography>

            <Typography sx={{
              mt: 1, fontSize: 14, color: "text.secondary", lineHeight: 1.55,
            }}>
              Regresa al listado y selecciona el conjunto que deseas administrar.
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Pestañas */}
            <MenuSetManageTabs value={activeTab} onChange={handleTabChange} />

            {/* 1. General */}
            {activeTab === "general" ? (
              <MenuSetGeneralTab
                restaurantId={restaurantId}
                branchId={branchId}
                menuSet={menuSet}
                onUpdated={handleUpdated}
                onAlert={showAlert}
              />
            ) : null}

            {/* Administración: conservada, temporalmente oculta */}
            {SHOW_MENU_SET_ADMINISTRATION && activeTab === "administration" ? (
              <MenuSetAdministrationTab
                restaurantId={restaurantId}
                branchId={branchId}
                menuSet={menuSet}
                management={management}
                loading={loadingManagement}
                onUpdated={handleManagementUpdated}
                onAlert={showAlert}
              />
            ) : null}

            {/* 2. Etapas y productos */}
            {activeTab === "stages" ? (
              <MenuSetStagesTab
                restaurantId={restaurantId}
                branchId={branchId}
                menuSet={menuSet}
                onUpdated={handleUpdated}
                onAlert={showAlert}
                onConfigureProducts={handleConfigureProducts}
                onManageTypes={handleManageTypes}
              />
            ) : null}

            {/* 3. Programación */}
            {activeTab === "programming" ? (
              <MenuSetProgrammingTab
                key={`${branchId}-${menuSet.id}`}
                restaurantId={restaurantId}
                branchId={branchId}
                menuSet={menuSet}
                management={management}
                loading={loadingManagement}
                onUpdated={handleUpdated}
                onAlert={showAlert}
              />
            ) : null}

            {/* 4. Activación */}
            {activeTab === "activation" ? (
              <MenuSetActivationTab
                restaurantId={restaurantId}
                branchId={branchId}
                menuSet={menuSet}
                onUpdated={handleUpdated}
                onAlert={showAlert}
                onNavigate={handleTabChange}
                checking={checkingActivation}
              />
            ) : null}

            {/* 5. Disponibilidad */}
            {activeTab === "availability" ? (
              <MenuSetAvailabilityTab
                key={`${branchId}-${menuSet.id}`}
                restaurantId={restaurantId}
                branchId={branchId}
                menuSet={menuSet}
                onAlert={showAlert}
              />
            ) : null}
          </>
        )}
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