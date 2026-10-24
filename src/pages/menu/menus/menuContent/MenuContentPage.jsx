
import { useCallback, useEffect, useState } from "react";
import { Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";
import MenuContentHeader from "../../../../components/menu/menus/menuContent/MenuContentHeader";
import MenuContentTabs from "../../../../components/menu/menus/menuContent/MenuContentTabs";

import { getMenus } from "../../../../services/menu/menus/menus.service";
import { getBranchWorkflowSetting } from "../../../../services/management/settings/branchSettings.service";
import { getBackendMessage } from "../../../../components/menu/menus/menuContent/menuContent.helpers";

export default function MenuContentPage() {
  const { restaurantId, menuId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const restaurantName = location.state?.restaurantName || "RESTAURANTE";
  const branchId = searchParams.get("branchId") || location.state?.branchId || "";

  const [menu, setMenu] = useState(null);
  const [catalogMode, setCatalogMode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false, severity: "error", title: "", message: "",
  });

  const showAlert = useCallback(({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  }, []);

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((current) => ({ ...current, open: false }));
  };

  const handleBack = () => {
    navigate(`/owner/restaurants/${restaurantId}/operation/menus`, {
      state: { restaurantName, branchId },
    });
  };

  useEffect(() => {
    if (!restaurantId || !branchId || !menuId) {
      setLoading(false);
      setLoadFailed(true);
      return undefined;
    }

    let active = true;

    const loadConfiguration = async () => {
      setLoading(true);
      setLoadFailed(false);

      try {
        const [workflowResult, menusResult] = await Promise.all([
          getBranchWorkflowSetting(restaurantId, branchId),
          getMenus(restaurantId, branchId),
        ]);

        if (!active) return;

        const mode = workflowResult?.catalog_mode;

        if (!["normal", "sets", "mixed"].includes(mode)) {
          throw new Error("No se pudo identificar la modalidad de trabajo de esta sucursal.");
        }

        const menus = Array.isArray(menusResult?.menus) ? menusResult.menus : [];
        const currentMenu = menus.find((item) => String(item.id) === String(menuId));

        if (!currentMenu) {
          throw new Error("El menú seleccionado no está disponible en esta sucursal.");
        }

        setMenu(currentMenu);
        setCatalogMode(mode);
      } catch (error) {
        if (!active) return;

        setMenu(null);
        setCatalogMode(null);
        setLoadFailed(true);

        showAlert({
          severity: "error",
          title: "Error",
          message: getBackendMessage(error, "No se pudo cargar la configuración del menú."),
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    loadConfiguration();

    return () => {
      active = false;
    };
  }, [restaurantId, branchId, menuId, showAlert]);

  const alertComponent = (
    <AppAlert
      open={alertState.open}
      onClose={closeAlert}
      severity={alertState.severity}
      title={alertState.title}
      message={alertState.message}
      autoHideDuration={3000}
    />
  );

  if (!branchId) {
    return (
      <PageContainer>
        <Paper sx={messageSx}>
          <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
            No se pudo identificar la sucursal
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 14, color: "text.secondary" }}>
            Regresa a la lista de menús y vuelve a seleccionar el contenido.
          </Typography>
          <Button variant="contained" onClick={handleBack} sx={{ mt: 2.5, height: 44 }}>
            Volver a menús
          </Button>
        </Paper>
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
              Cargando contenido del menú…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  if (loadFailed || !menu || !catalogMode) {
    return (
      <PageContainer>
        <Paper sx={messageSx}>
          <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
            No fue posible cargar el menú
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 14, color: "text.secondary" }}>
            Comprueba que el menú y la sucursal estén disponibles.
          </Typography>
          <Button variant="contained" onClick={handleBack} sx={{ mt: 2.5, height: 44 }}>
            Volver a menús
          </Button>
        </Paper>
        {alertComponent}
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <MenuContentHeader menu={menu} onBack={handleBack} />

        <MenuContentTabs
          restaurantId={restaurantId}
          branchId={branchId}
          menuId={menuId}
          menu={menu}
          catalogMode={catalogMode}
          onAlert={showAlert}
        />
      </Stack>

      {alertComponent}
    </PageContainer>
  );
}

const messageSx = {
  p: { xs: 2, sm: 3 },
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "none",
  textAlign: "center",
};