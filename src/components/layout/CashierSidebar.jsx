// src/components/layout/CashierSidebar.jsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
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
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";

const DRAWER_WIDTH = 280;
const DRAWER_COLLAPSED = 78;

export default function CashierSidebar({
  currentKey = "dashboard",
  onNavigate,
  onCloseCashier,
  title = "Caja",
  closing = false,
  canUseCustomerLoyaltyModules = false,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = useMemo(
    () => [
      {
        key: "dashboard",
        label: "Dashboard",
        icon: <DashboardRoundedIcon />,
      },
      {
        key: "new-sale",
        label: "Nueva venta",
        icon: <AddShoppingCartRoundedIcon />,
      },
      {
        key: "history",
        label: "Ver historial",
        icon: <HistoryRoundedIcon />,
      },
      ...(canUseCustomerLoyaltyModules
      ? [
          {
            key: "customers",
            label: "Clientes",
            icon: <PeopleRoundedIcon />,
          },
        ]
      : []),
    ],
    [canUseCustomerLoyaltyModules],
  );

  const width = collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH;

  const handleNavigate = (key) => {
    onNavigate?.(key);
    if (isMobile) setMobileOpen(false);
  };

  const handleCloseCashier = () => {
    onCloseCashier?.();
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
              <PointOfSaleIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: 22,
                lineHeight: 1.1,
                color: "#fff",
                whiteSpace: "normal",
              }}
            >
              {title}
            </Typography>

            {!isMobile && (
              <IconButton
                onClick={() => setCollapsed(true)}
                sx={{ color: "#fff", flexShrink: 0 }}
              >
                <MenuOpenIcon />
              </IconButton>
            )}
          </>
        )}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.18)" }} />

      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        {menuItems.map((item) => {
          const active = currentKey === item.key;

          if (collapsed && !isMobile) {
            return (
              <Tooltip key={item.key} title={item.label} placement="right">
                <ListItemButton
                  onClick={() => handleNavigate(item.key)}
                  sx={{
                    minHeight: 54,
                    px: 2,
                    justifyContent: "center",
                    bgcolor: active ? "rgba(255,255,255,0.22)" : "transparent",
                    borderLeft: active ? "4px solid #fff" : "4px solid transparent",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.14)" },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      color: "#fff",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                </ListItemButton>
              </Tooltip>
            );
          }

          return (
            <Box key={item.key} sx={{ px: 1.2, mb: 0.6 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.key)}
                sx={{
                  position: "relative",
                  minHeight: 52,
                  px: 2,
                  borderRadius: 1.5,
                  color: "#fff",
                  bgcolor: active ? "rgba(0,0,0,0.18)" : "transparent",
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
                      ? "rgba(0,0,0,0.22)"
                      : "rgba(255,255,255,0.12)",
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
          <Tooltip title="Cerrar caja" placement="right">
            <IconButton
              onClick={handleCloseCashier}
              disabled={closing}
              sx={{
                bgcolor: "#fff",
                color: "#111",
                borderRadius: 2,
                width: 44,
                height: 44,
                "&:hover": { bgcolor: "#f4f4f4" },
              }}
            >
              <LockRoundedIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <ListItemButton
            onClick={handleCloseCashier}
            disabled={closing}
            sx={{
              bgcolor: "#fff",
              color: "#111",
              borderRadius: 2.5,
              minHeight: 52,
              px: 2,
              "&:hover": { bgcolor: "#f4f4f4" },
              "&.Mui-disabled": {
                bgcolor: "rgba(255,255,255,0.65)",
                color: "#555",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
              <LockRoundedIcon />
            </ListItemIcon>

            <ListItemText
              primary={closing ? "Cerrando caja…" : "Cerrar caja"}
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