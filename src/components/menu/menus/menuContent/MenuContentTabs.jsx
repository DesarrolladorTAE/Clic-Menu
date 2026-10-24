//Tabs de uso
import { useEffect, useState } from "react";
import { Box, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";

import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import MenuNormalProductsTab from "./MenuNormalProductsTab";
import MenuSetsTab from "./MenuSetsTab";

export default function MenuContentTabs({
  restaurantId,
  branchId,
  menuId,
  menu,
  catalogMode,
  onAlert,
}) {
  const [activeTab, setActiveTab] = useState(catalogMode === "sets" ? 1 : 0);
  const [visited, setVisited] = useState({
    normal: catalogMode !== "sets",
    sets: catalogMode === "sets",
  });

  const allowsNormal = catalogMode === "normal" || catalogMode === "mixed";
  const allowsSets = catalogMode === "sets" || catalogMode === "mixed";

  useEffect(() => {
    const initialTab = catalogMode === "sets" ? 1 : 0;
    setActiveTab(initialTab);
    setVisited({ normal: initialTab === 0, sets: initialTab === 1 });
  }, [catalogMode, restaurantId, branchId, menuId]);

  const handleTabChange = (_, nextTab) => {
    setActiveTab(nextTab);

    setVisited((current) => ({
      ...current,
      normal: current.normal || nextTab === 0,
      sets: current.sets || nextTab === 1,
    }));
  };

  return (
    <Stack spacing={3}>
      <Paper sx={{
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "none",
        overflow: "hidden",
      }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="Tipo de contenido del menú"
          sx={{
            minHeight: 58,
            "& .MuiTab-root": {
              minHeight: 58,
              minWidth: 0,
              px: { xs: 1, sm: 2 },
              gap: 1,
              fontSize: { xs: 12, sm: 14 },
              fontWeight: 800,
              textTransform: "none",
            },
          }}
        >
          <Tab
            id="menu-content-tab-0"
            aria-controls="menu-content-panel-0"
            icon={<RestaurantMenuOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Productos normales"
          />

          <Tab
            id="menu-content-tab-1"
            aria-controls="menu-content-panel-1"
            icon={<LayersOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Conjuntos"
          />
        </Tabs>
      </Paper>

      <Box
        id="menu-content-panel-0"
        role="tabpanel"
        aria-labelledby="menu-content-tab-0"
        hidden={activeTab !== 0}
        sx={{ display: activeTab === 0 ? "block" : "none", minWidth: 0 }}
      >
        {allowsNormal ? (
          visited.normal ? (
            <MenuNormalProductsTab
              restaurantId={restaurantId}
              branchId={branchId}
              menuId={menuId}
              menu={menu}
              onAlert={onAlert}
            />
          ) : null
        ) : (
          <UnavailableModeMessage type="normal" />
        )}
      </Box>

      <Box
        id="menu-content-panel-1"
        role="tabpanel"
        aria-labelledby="menu-content-tab-1"
        hidden={activeTab !== 1}
        sx={{ display: activeTab === 1 ? "block" : "none", minWidth: 0 }}
      >
        {allowsSets ? (
          visited.sets ? (
            <MenuSetsTab
              restaurantId={restaurantId}
              branchId={branchId}
              menuId={menuId}
              menu={menu}
              onAlert={onAlert}
            />
          ) : null
        ) : (
          <UnavailableModeMessage type="sets" />
        )}
      </Box>
    </Stack>
  );
}

function UnavailableModeMessage({ type }) {
  const normal = type === "normal";

  return (
    <Paper sx={{
      p: { xs: 3, sm: 5 },
      borderRadius: 1,
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.paper",
      boxShadow: "none",
      textAlign: "center",
    }}>
      <InfoOutlinedIcon sx={{ fontSize: 40, color: "primary.main", mb: 1.5 }} />

      <Typography sx={{ fontSize: 19, fontWeight: 800, color: "text.primary" }}>
        Modalidad no disponible
      </Typography>

      <Typography sx={{
        mt: 1, fontSize: 14, color: "text.secondary",
        lineHeight: 1.6, maxWidth: 500, mx: "auto",
      }}>
        {normal
          ? "Esta sucursal no trabaja con productos normales. Actualmente utiliza únicamente Conjuntos."
          : "Esta sucursal no trabaja con Conjuntos. Actualmente utiliza únicamente productos normales."}
      </Typography>
    </Paper>
  );
}