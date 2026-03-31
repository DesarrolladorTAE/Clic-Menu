import React, { useMemo, useState } from "react";
import {
  Box, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Tooltip,
  Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";

import GroupIcon from "@mui/icons-material/Group";
import CampaignIcon from "@mui/icons-material/Campaign";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CategoryIcon from "@mui/icons-material/Category";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import TuneIcon from "@mui/icons-material/Tune";

const DRAWER_WIDTH = 240;
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
        label: "Gestión",
        items: [
          {
            key: "staff",
            label: "Personal",
            icon: <GroupIcon />,
          },
        ],
      },
      {
        label: "Menú",
        items: [
          {
            key: "branch-sales-channels",
            label: "Canales de venta por sucursal",
            icon: <CampaignIcon />,
          },
          {
            key: "ingredients",
            label: "Ingredientes",
            icon: <Inventory2Icon />,
          },
          {
            key: "menu",
            label: "Menú",
            icon: <MenuBookIcon />,
          },
          {
            key: "catalog",
            label: "Catálogo",
            icon: <CategoryIcon />,
          },
          {
            key: "modifiers",
            label: "Modificadores",
            icon: <TuneIcon />,
          },
        ],
      },
      {
        label: "Operación",
        items: [
          {
            key: "tables",
            label: "Mesas",
            icon: <TableRestaurantIcon />,
          },
          {
            key: "cash-registers",
            label: "Cajas",
            icon: <PointOfSaleIcon />,
          },
        ],
      },
    ],
    []
  );

  const width = collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH;

  const handleToggleDesktop = () => {
    setCollapsed((prev) => !prev);
  };

  const handleToggleMobile = () => {
    setMobileOpen((prev) => !prev);
  };

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
      {/* Header / Logo */}
      <Box
        sx={{
          minHeight: 84,
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
            <IconButton
              onClick={handleToggleDesktop}
              sx={{
                color: "#fff",
                bgcolor: "transparent",
              }}
            >
              <RestaurantMenuIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                minWidth: 0,
              }}
            >
              {logoSrc ? (
                <Box
                  component="img"
                  src={logoSrc}
                  alt={restaurantName}
                  sx={{
                    width: 34,
                    height: 34,
                    objectFit: "contain",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <RestaurantMenuIcon sx={{ color: "#ffcc33" }} />
              )}

              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 13,
                  lineHeight: 1.1,
                  color: "#fff",
                  whiteSpace: "normal",
                }}
              >
                {restaurantName}
              </Typography>
            </Box>

            {!isMobile && (
              <IconButton
                onClick={handleToggleDesktop}
                sx={{
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                <MenuOpenIcon />
              </IconButton>
            )}
          </>
        )}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.25)" }} />

      {/* Items */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {menuSections.map((section) => (
          <Box key={section.label}>
            {!collapsed || isMobile ? (
              <Box
                sx={{
                  px: 2.2,
                  pt: 1.6,
                  pb: 0.6,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.85)",
                    textTransform: "none",
                  }}
                >
                  {section.label}
                </Typography>
              </Box>
            ) : null}

            <List sx={{ px: 0, py: 0 }}>
              {section.items.map((item) => {
                const active = currentKey === item.key;

                const itemButton = (
                  <ListItemButton
                    onClick={() => handleItemClick(item.key)}
                    sx={{
                      minHeight: 54,
                      px: collapsed && !isMobile ? 2 : 2.2,
                      justifyContent:
                        collapsed && !isMobile ? "center" : "flex-start",
                      bgcolor: active ? "rgba(0,0,0,0.12)" : "transparent",
                      borderLeft: active
                        ? "4px solid #fff"
                        : "4px solid transparent",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.12)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed && !isMobile ? 0 : 40,
                        mr: collapsed && !isMobile ? 0 : 1,
                        color: "#fff",
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    {(!collapsed || isMobile) && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: 15,
                          fontWeight: active ? 800 : 700,
                        }}
                      />
                    )}
                  </ListItemButton>
                );

                if (collapsed && !isMobile) {
                  return (
                    <Tooltip key={item.key} title={item.label} placement="right">
                      {itemButton}
                    </Tooltip>
                  );
                }

                return <Box key={item.key}>{itemButton}</Box>;
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.25)" }} />

      {/* Footer */}
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
                "&:hover": {
                  bgcolor: "#f4f4f4",
                },
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
              borderRadius: 2,
              minHeight: 48,
              px: 2,
              "&:hover": {
                bgcolor: "#f4f4f4",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "#111" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Volver"
              primaryTypographyProps={{
                fontSize: 15,
                fontWeight: 800,
              }}
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
            onClick={handleToggleMobile}
            sx={{
              position: "fixed",
              top: 14,
              left: 14,
              zIndex: 1400,
              bgcolor: "#111",
              color: "#fff",
              boxShadow: 3,
              "&:hover": {
                bgcolor: "#222",
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleToggleMobile}
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