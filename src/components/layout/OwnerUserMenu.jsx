// src/components/layout/OwnerUserMenu.jsx
import React from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";

import EditRoundedIcon from "@mui/icons-material/EditRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

export default function OwnerUserMenu({
  anchorEl,
  open,
  onClose,
  user,
  ownerName,
  onEditProfile,
  onLogout,
}) {
  const initial = ownerName?.charAt(0)?.toUpperCase() || "U";

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      slotProps={{
        paper: {
          sx: {
            mt: 1.5,
            width: { xs: 300, sm: 360 },
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "#242424",
            color: "#fff",
            boxShadow: "0 14px 34px rgba(0,0,0,0.32)",
          },
        },
      }}
    >
      <Box sx={{ px: 2.5, py: 2.2 }}>
        <Stack direction="row" spacing={1.6} alignItems="center">
          <Avatar
            sx={{
              width: 58,
              height: 58,
              bgcolor: "primary.main",
              color: "#fff",
              fontWeight: 900,
              fontSize: 24,
            }}
          >
            {initial}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: 17,
                color: "#fff",
                lineHeight: 1.25,
                wordBreak: "break-word",
              }}
            >
              {ownerName || "Propietario"}
            </Typography>

            <Typography
              sx={{
                mt: 0.2,
                fontSize: 13,
                color: "rgba(255,255,255,0.72)",
                wordBreak: "break-word",
              }}
            >
              {user?.email || "Sin correo"}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.10)" }} />

      <MenuItem
        onClick={() => {
          onClose?.();
          onEditProfile?.();
        }}
        sx={menuItemSx}
      >
        <EditRoundedIcon sx={menuIconSx} />
        <Typography sx={menuTextSx}>Editar perfil</Typography>
      </MenuItem>

      <MenuItem disabled sx={{ ...menuItemSx, opacity: "1 !important" }}>
        <PersonRoundedIcon sx={{ ...menuIconSx, color: "rgba(255,255,255,0.55)" }} />
        <Typography sx={{ ...menuTextSx, color: "rgba(255,255,255,0.55)" }}>
          Cuenta de propietario
        </Typography>
      </MenuItem>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.10)" }} />

      <Box sx={{ p: 1.3 }}>
        <Button
          fullWidth
          onClick={() => {
            onClose?.();
            onLogout?.();
          }}
          startIcon={<LogoutIcon />}
          sx={{
            justifyContent: "flex-start",
            minHeight: 46,
            borderRadius: 1.5,
            px: 1.5,
            color: "#ff7a7a",
            bgcolor: "rgba(255,255,255,0.04)",
            fontWeight: 900,
            "&:hover": {
              bgcolor: "rgba(255,122,122,0.10)",
            },
          }}
        >
          Cerrar sesión
        </Button>
      </Box>
    </Menu>
  );
}

const menuItemSx = {
  minHeight: 54,
  px: 2.5,
  py: 1.3,
  color: "#fff",
  gap: 1.6,
  "&:hover": {
    bgcolor: "rgba(255,152,0,0.16)",
  },
};

const menuIconSx = {
  color: "rgba(255,255,255,0.86)",
  fontSize: 24,
};

const menuTextSx = {
  fontSize: 15,
  fontWeight: 800,
  color: "#fff",
};