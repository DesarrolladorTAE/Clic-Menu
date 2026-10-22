import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  Box, Button, CircularProgress, Paper, Stack, Typography,
} from "@mui/material";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";

import MenuSetManageTabs from "../../../../components/menu/menuSets/manage/MenuSetManageTabs";
import MenuSetGeneralTab from "../../../../components/menu/menuSets/manage/MenuSetGeneralTab";
import MenuSetStagesTab from "../../../../components/menu/menuSets/manage/stages/MenuSetStagesTab";

import { getMenuSet } from "../../../../services/menu/menuSets/menuSet.service";

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
    ? Object.values(data.errors).flat()
    : [];

  return fieldErrors.find((message) => typeof message === "string")
    || data?.message || error?.message || fallback;
}

export default function MenuSetManagePage() {
  const { restaurantId, menuSetId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const branchId = String(searchParams.get("branchId") || location.state?.branchId || "");

  const [menuSet, setMenuSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab === "stages" ? "stages" : "general"
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
    if (reason === "clickaway") {
      return;
    }

    setAlertState((previous) => ({ ...previous, open: false }));
  };

  useEffect(() => {
    if (!restaurantId || !branchId || !menuSetId) {
      setMenuSet(null);
      setLoading(false);
      return undefined;
    }

    let active = true;

    const loadMenuSet = async () => {
      setLoading(true);

      try {
        const result = await getMenuSet(restaurantId, branchId, menuSetId);

        if (!active) {
          return;
        }

        setMenuSet(result);
      } catch (error) {
        if (!active) {
          return;
        }

        setMenuSet(null);

        showAlert({
          message: getErrorMessage(error, "No se pudo consultar el Conjunto."),
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadMenuSet();

    return () => {
      active = false;
    };
  }, [restaurantId, branchId, menuSetId, showAlert]);

  const handleBack = () => {
    navigate("..", { relative: "path", state: { branchId } });
  };

  const handleUpdated = (updatedSet) => {
    setMenuSet(updatedSet);
  };

  const handleConfigureProducts = (stage) => {
    if (!stage?.id || !branchId || !menuSetId) return;

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
    if (!restaurantId || !branchId || !menuSetId) {
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
          <Box>
            <Typography sx={{
              fontSize: { xs: 30, md: 42 },
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.1,
            }}>
              Administrar Conjunto
            </Typography>

            <Typography sx={{
              mt: 1,
              fontSize: { xs: 14, md: 17 },
              lineHeight: 1.55,
              color: "text.secondary",
            }}>
              Configura los datos y la disponibilidad de{" "}
              <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>
                {menuSet?.name || "tu conjunto"}
              </Box>.
            </Typography>
          </Box>

          <Button
            type="button"
            variant="outlined"
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={handleBack}
            sx={{ minWidth: { xs: "100%", sm: 190 }, height: 44, fontWeight: 800 }}
          >
            Volver a Conjuntos
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ minHeight: "45vh", display: "grid", placeItems: "center" }}>
            <Stack spacing={2} alignItems="center">
              <CircularProgress color="primary" />

              <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                Cargando información del Conjunto…
              </Typography>
            </Stack>
          </Box>
        ) : !menuSet ? (
          <Paper sx={panelSx}>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
              Conjunto no disponible
            </Typography>

            <Typography sx={{ mt: 1, fontSize: 14, color: "text.secondary", lineHeight: 1.55 }}>
              Regresa al listado y selecciona el Conjunto que deseas administrar.
            </Typography>
          </Paper>
        ) : (
          <>
            <MenuSetManageTabs value={activeTab} onChange={setActiveTab} />

            {activeTab === "general" ? (
                <MenuSetGeneralTab
                    restaurantId={restaurantId}
                    branchId={branchId}
                    menuSet={menuSet}
                    onUpdated={handleUpdated}
                    onAlert={showAlert}
                />
            ) : null}

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