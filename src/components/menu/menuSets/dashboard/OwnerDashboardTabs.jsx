//src/components/menu/menuSets/dashboard/OwnerDashboardTabs.jsx
import { Paper, Tab, Tabs } from "@mui/material";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";

export const DASHBOARD_TABS = [
  { value: "resumen", label: "Resumen", icon: <DashboardOutlinedIcon /> },
  { value: "inventario", label: "Inventario", icon: <Inventory2OutlinedIcon /> },
  { value: "productos", label: "Productos", icon: <CategoryOutlinedIcon /> },
  { value: "conjuntos", label: "Conjuntos", icon: <LayersOutlinedIcon /> },
  { value: "actualizaciones", label: "Actualizaciones", icon: <UpdateOutlinedIcon /> },
  { value: "avisos", label: "Avisos", icon: <NotificationsNoneOutlinedIcon /> },
];

export function normalizeDashboardTab(value) {
  return DASHBOARD_TABS.some((tab) => tab.value === value) ? value : "resumen";
}

export default function OwnerDashboardTabs({ value, onChange }) {
  return (
    <Paper sx={{
      border: "1px solid", borderColor: "divider",
      borderRadius: 1, bgcolor: "background.paper",
      boxShadow: "none", overflow: "hidden",
    }}>
      <Tabs
        value={normalizeDashboardTab(value)}
        onChange={(_, nextValue) => onChange?.(nextValue)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label="Apartados del panel operativo"
        sx={{
          px: 1, minHeight: 56,
          "& .MuiTabs-indicator": { height: 3, borderRadius: 1 },
          "& .MuiTab-root": {
            minHeight: 56, minWidth: 130, px: 2,
            fontSize: 13, fontWeight: 800,
            textTransform: "none", whiteSpace: "nowrap",
            color: "text.secondary",
          },
          "& .Mui-selected": { color: "primary.main" },
          "& .MuiTab-iconWrapper": { mr: 1, fontSize: 20 },
        }}
      >
        {DASHBOARD_TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
            disableRipple
          />
        ))}
      </Tabs>
    </Paper>
  );
}