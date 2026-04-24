import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";

import GroupIcon from "@mui/icons-material/Group";
import CampaignIcon from "@mui/icons-material/Campaign";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CategoryIcon from "@mui/icons-material/Category";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import TuneIcon from "@mui/icons-material/Tune";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import StarsOutlinedIcon from "@mui/icons-material/StarsOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";

import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import LocalDiningRoundedIcon from "@mui/icons-material/LocalDiningRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";

const DRAWER_WIDTH = 280;
const DRAWER_COLLAPSED = 78;

export default function RestaurantOperationSidebar({
  restaurantName = "RESTAURANTE",
  currentKey = "staff",
  onNavigate,
  onLogout,
  logoSrc,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuSections = useMemo(
    () => [
      {
        key: "management",
        label: "Gestión",
        icon: <ManageAccountsRoundedIcon />,
        items: [{ key: "staff", label: "Personal", icon: <GroupIcon /> }],
      },
      {
        key: "inventory",
        label: "Inventario",
        icon: <StorefrontRoundedIcon />,
        items: [
          { key: "ingredients", label: "Ingredientes", icon: <Inventory2Icon /> },
          { key: "warehouses", label: "Almacenes", icon: <WarehouseOutlinedIcon /> },
          { key: "purchases", label: "Compras", icon: <ShoppingCartOutlinedIcon /> },
        ],
      },
      {
        key: "menu",
        label: "Menú",
        icon: <LocalDiningRoundedIcon />,
        items: [
          { key: "branch-sales-channels", label: "Canales de venta por sucursal", icon: <CampaignIcon /> },
          { key: "menu", label: "Menú", icon: <MenuBookIcon /> },
          { key: "catalog", label: "Catálogo", icon: <CategoryIcon /> },
          { key: "modifiers", label: "Modificadores", icon: <TuneIcon /> },
        ],
      },
      {
        key: "operation",
        label: "Operación",
        icon: <SettingsSuggestRoundedIcon />,
        items: [
          { key: "tables", label: "Mesas", icon: <TableRestaurantIcon /> },
          { key: "cash-registers", label: "Cajas", icon: <PointOfSaleIcon /> },
          { key: "ticket-settings", label: "Tickets", icon: <ReceiptLongIcon /> },
          { key: "customer-loyalty-settings", label: "Puntos", icon: <StarsOutlinedIcon /> },
        ],
      },
      {
        key: "reports",
        label: "Reportes",
        icon: <BarChartRoundedIcon />,
        items: [
          { key: "sales-report", label: "Ventas", icon: <AssessmentOutlinedIcon /> },
          { key: "profit-report", label: "Utilidades", icon: <TrendingUpOutlinedIcon /> },
        ],
      },
    ],
    []
  );

  const activeSectionKey = useMemo(() => {
    return (
      menuSections.find((section) =>
        section.items.some((item) => item.key === currentKey)
      )?.key || "management"
    );
  }, [currentKey, menuSections]);

  const [openSections, setOpenSections] = useState(() => ({
    [activeSectionKey]: true,
  }));

  useEffect(() => {
    setOpenSections((prev) => ({
      ...prev,
      [activeSectionKey]: true,
    }));
  }, [activeSectionKey]);

  const width = collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH;

  const handleItemClick = (key) => {
    if (typeof onNavigate === "function") onNavigate(key);
    if (isMobile) setMobileOpen(false);
  };

  const sidebarContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "primary.main",
        color: "#fff",
      }}
    >
      <Box
        sx={{
          minHeight: 88,
          px: collapsed && !isMobile ? 1.5 : 2.5,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed && !isMobile ? "center" : "space-between",
          gap: 1,
          bgcolor: "#111111",
        }}
      >
        {collapsed && !isMobile ? (
          <Tooltip title="Expandir menú" placement="right">
            <IconButton onClick={() => setCollapsed(false)} sx={{ color: "#fff" }}>
              <RestaurantMenuIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0 }}>
              {logoSrc ? (
                <Box
                  component="img"
                  src={logoSrc}
                  alt={restaurantName}
                  sx={{ width: 34, height: 34, objectFit: "contain", flexShrink: 0 }}
                />
              ) : (
                <RestaurantMenuIcon sx={{ color: "#ffcc33" }} />
              )}

              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: 14,
                  lineHeight: 1.1,
                  color: "#fff",
                  whiteSpace: "normal",
                }}
              >
                {restaurantName}
              </Typography>
            </Box>

            {!isMobile && (
              <IconButton onClick={() => setCollapsed(true)} sx={{ color: "#fff", flexShrink: 0 }}>
                <MenuOpenIcon />
              </IconButton>
            )}
          </>
        )}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.18)" }} />

      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        {menuSections.map((section) => {
          const sectionOpen = !!openSections[section.key];
          const sectionActive = section.key === activeSectionKey;

          if (collapsed && !isMobile) {
            return (
              <List key={section.key} disablePadding>
                {section.items.map((item) => {
                  const active = currentKey === item.key;

                  return (
                    <Tooltip key={item.key} title={item.label} placement="right">
                      <ListItemButton
                        onClick={() => handleItemClick(item.key)}
                        sx={{
                          minHeight: 54,
                          px: 2,
                          justifyContent: "center",
                          bgcolor: active ? "rgba(255,255,255,0.22)" : "transparent",
                          borderLeft: active ? "4px solid #fff" : "4px solid transparent",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.14)" },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 0, color: "#fff", justifyContent: "center" }}>
                          {item.icon}
                        </ListItemIcon>
                      </ListItemButton>
                    </Tooltip>
                  );
                })}
              </List>
            );
          }

          return (
            <Box key={section.key} sx={{ px: 1.2, mb: 0.8 }}>
              <ListItemButton
                onClick={() =>
                  setOpenSections((prev) => ({
                    ...prev,
                    [section.key]: !prev[section.key],
                  }))
                }
                sx={{
                  minHeight: 46,
                  px: 1.4,
                  borderRadius: 1.5,
                  bgcolor: sectionActive
                    ? "rgba(255,255,255,0.20)"
                    : "rgba(255,255,255,0.08)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.18)" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: "#fff" }}>{section.icon}</ListItemIcon>

                <ListItemText
                  primary={section.label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 900 }}
                />

                {sectionOpen ? <KeyboardArrowDownRoundedIcon /> : <KeyboardArrowRightRoundedIcon />}
              </ListItemButton>

              <Collapse in={sectionOpen} timeout="auto" unmountOnExit>
                <List disablePadding sx={{ pt: 0.8, pb: 0.3 }}>
                  {section.items.map((item) => {
                    const active = currentKey === item.key;

                    return (
                      <ListItemButton
                        key={item.key}
                        onClick={() => handleItemClick(item.key)}
                        sx={{
                          position: "relative",
                          minHeight: 50,
                          mx: 0.4,
                          my: 0.35,
                          pl: active ? 2.4 : 2,
                          pr: 1.4,
                          borderRadius: 1,
                          color: "#fff",
                          bgcolor: active ? "rgba(0,0,0,0.16)" : "transparent",
                          boxShadow: "none",
                          transition: "all 0.18s ease",
                          "&::before": active
                            ? {
                                content: '""',
                                position: "absolute",
                                left: 8,
                                top: "50%",
                                transform: "translateY(-50%)",
                                width: 4,
                                height: 28,
                                borderRadius: 999,
                                bgcolor: "#fff",
                              }
                            : {},
                          "&:hover": {
                            bgcolor: active
                              ? "rgba(0,0,0,0.18)"
                              : "rgba(255,255,255,0.11)",
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 40,
                            color: "#fff",
                            opacity: active ? 1 : 0.92,
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>

                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: 15,
                            fontWeight: active ? 900 : 760,
                            lineHeight: 1.2,
                            color: "#fff",
                          }}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.18)" }} />

      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: collapsed && !isMobile ? "center" : "flex-start",
        }}
      >
        {collapsed && !isMobile ? (
          <Tooltip title="Volver" placement="right">
            <IconButton
              onClick={onLogout}
              sx={{
                bgcolor: "#fff",
                color: "#111",
                borderRadius: 2,
                width: 44,
                height: 44,
                "&:hover": { bgcolor: "#f4f4f4" },
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <ListItemButton
            onClick={onLogout}
            sx={{
              bgcolor: "#fff",
              color: "#111",
              borderRadius: 2.5,
              minHeight: 52,
              px: 2,
              "&:hover": { bgcolor: "#f4f4f4" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "#111" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Volver"
              primaryTypographyProps={{ fontSize: 15, fontWeight: 900 }}
            />
          </ListItemButton>
        )}
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <>
        {!mobileOpen && (
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{
              position: "fixed",
              top: 14,
              left: 14,
              zIndex: 1400,
              bgcolor: "#111",
              color: "#fff",
              boxShadow: 3,
              "&:hover": { bgcolor: "#222" },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              borderRight: "none",
              borderRadius: 0,
              overflow: "hidden",
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      </>
    );
  }

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width,
          boxSizing: "border-box",
          borderRight: "none",
          borderRadius: 0,
          transition: "width 0.25s ease",
          overflowX: "hidden",
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
}