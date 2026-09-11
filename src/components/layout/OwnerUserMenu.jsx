// src/components/layout/OwnerUserMenu.jsx
import React from "react";
import {
  Avatar, Box, Button, Divider, Menu, MenuItem, Stack, Typography,
} from "@mui/material";

import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import LogoutIcon from "@mui/icons-material/Logout";

export default function OwnerUserMenu({
  anchorEl,
  open,
  onClose,
  user,
  ownerName,
  onEditProfile,
  onOpenTaxProfile,
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
            width: { xs: 300, sm: 370 },
            maxWidth: "calc(100vw - 24px)",
            maxHeight: "calc(100vh - 32px)",
            borderRadius: 0,
            overflowX: "hidden",
            overflowY: "auto",
            bgcolor: "#fff",
            color: "#111",
            boxShadow: "0 14px 34px rgba(0,0,0,0.18)",
            border: "1px solid rgba(0,0,0,0.08)",
          },
        },
        list: {
          sx: {
            py: 0,
          },
        },
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2.3,
          bgcolor: "#fff",
        }}
      >
        <Stack direction="row" spacing={1.6} alignItems="center">
          <Avatar
            sx={{
              width: 60,
              height: 60,
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
                color: "#111",
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
                color: "rgba(0,0,0,0.62)",
                wordBreak: "break-word",
                fontWeight: 600,
              }}
            >
              {user?.email || "Sin correo"}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ borderColor: "rgba(0,0,0,0.08)" }} />

      <MenuItem
        onClick={() => {
          onClose?.();
          onEditProfile?.();
        }}
        sx={menuItemSx}
      >
        <EditRoundedIcon sx={menuIconSx} />

        <Box sx={{ minWidth: 0 }}>
          <Typography sx={menuTextSx}>Editar perfil</Typography>
          <Typography sx={menuSecondaryTextSx}>Datos personales y acceso</Typography>
        </Box>
      </MenuItem>

      <MenuItem
        onClick={() => {
          onClose?.();
          onOpenTaxProfile?.();
        }}
        sx={menuItemSx}
      >
        <AccountBalanceRoundedIcon sx={menuIconSx} />

        <Box sx={{ minWidth: 0 }}>
          <Typography sx={menuTextSx}>Datos fiscales</Typography>
          <Typography sx={menuSecondaryTextSx}>Información para tus facturas</Typography>
        </Box>
      </MenuItem>

      <MenuItem
        disabled
        sx={{
          ...menuItemSx,
          "&.Mui-disabled": {
            opacity: 1,
            bgcolor: "#fafafa",
            cursor: "default",
          },
        }}
      >
        <ReceiptLongRoundedIcon sx={{ ...menuIconSx, color: "text.disabled" }} />

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography sx={{ ...menuTextSx, color: "text.disabled" }}>
              Facturación
            </Typography>

            <Typography
              sx={{
                px: 1,
                py: 0.3,
                borderRadius: 999,
                bgcolor: "rgba(255,152,0,0.10)",
                color: "primary.main",
                fontSize: 10,
                lineHeight: 1.2,
                fontWeight: 900,
              }}
            >
              Próximamente
            </Typography>
          </Stack>

          <Typography sx={{ ...menuSecondaryTextSx, color: "text.disabled" }}>
            Compras y facturas de Clic Menu
          </Typography>
        </Box>
      </MenuItem>

      <Divider sx={{ borderColor: "rgba(0,0,0,0.08)" }} />

      <Box sx={{ p: 1.5, bgcolor: "#fff" }}>
        <Button
          fullWidth
          onClick={() => {
            onClose?.();
            onLogout?.();
          }}
          startIcon={<LogoutIcon />}
          sx={{
            justifyContent: "flex-start",
            minHeight: 48,
            borderRadius: 0,
            px: 1.6,
            color: "primary.main",
            bgcolor: "rgba(255,152,0,0.10)",
            fontWeight: 900,
            textTransform: "none",
            fontSize: 15,
            "&:hover": {
              bgcolor: "rgba(255,152,0,0.16)",
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
  minHeight: 56,
  px: 2.5,
  py: 1.4,
  color: "#111",
  gap: 1.6,
  bgcolor: "#fff",
  "&:hover": {
    bgcolor: "rgba(255,152,0,0.08)",
  },
};

const menuIconSx = {
  color: "#ff9800",
  fontSize: 24,
};

const menuTextSx = {
  fontSize: 15,
  fontWeight: 900,
  color: "#111",
};

const menuSecondaryTextSx = {
  mt: 0.2,
  fontSize: 12,
  lineHeight: 1.35,
  fontWeight: 600,
  color: "rgba(0,0,0,0.56)",
};