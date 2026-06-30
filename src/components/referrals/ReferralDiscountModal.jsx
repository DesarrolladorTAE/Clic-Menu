import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  Typography,
  Chip,
} from "@mui/material";

import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import CardGiftcardRoundedIcon from "@mui/icons-material/CardGiftcardRounded";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

export default function ReferralDiscountModal({
  open,
  code,
  percent = 5,
  onClose,
  onGoPlans,
  hasRestaurant = false,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            background:
              "linear-gradient(135deg, #ff7a18 0%, #ffb703 50%, #f97316 100%)",
            color: "#fff",
          }}
        >
          <Box
            sx={{
              width: 78,
              height: 78,
              borderRadius: "50%",
              mx: "auto",
              mb: 1.5,
              display: "grid",
              placeItems: "center",
              background: "rgba(255,255,255,.22)",
              border: "2px solid rgba(255,255,255,.45)",
            }}
          >
            <PercentRoundedIcon sx={{ fontSize: 44 }} />
          </Box>

          <Typography variant="h5" fontWeight={900}>
            ¡Tienes descuento disponible!
          </Typography>

          {code && (
            <Chip
              label={`Código referido: ${code}`}
              sx={{
                mt: 1.5,
                bgcolor: "#fff",
                color: "#c2410c",
                fontWeight: 900,
              }}
            />
          )}
        </Box>

        <Stack spacing={2} sx={{ p: 3 }}>
          <Typography
            variant="h6"
            textAlign="center"
            fontWeight={900}
            color="#7c2d12"
          >
            Obtén {percent}% de descuento
          </Typography>

          <Typography textAlign="center" color="text.secondary">
            Por registrarte con un código referido, tienes un{" "}
            <strong>{percent}% de descuento en tu primera compra</strong>,
            aplicable en cualquiera de nuestros planes.
          </Typography>

          <Stack spacing={1.2}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <CheckCircleRoundedIcon color="success" />
              <Typography variant="body2">Aplica solo en tu primera compra.</Typography>
            </Stack>

            <Stack direction="row" spacing={1.2} alignItems="center">
              <RestaurantMenuRoundedIcon sx={{ color: "#f97316" }} />
              <Typography variant="body2">Disponible para planes de Clic Menu.</Typography>
            </Stack>

            <Stack direction="row" spacing={1.2} alignItems="center">
              <CardGiftcardRoundedIcon sx={{ color: "#f59e0b" }} />
              <Typography variant="body2">Beneficio exclusivo por referido.</Typography>
            </Stack>
          </Stack>

          <Button
            fullWidth
            size="large"
            variant="contained"
            onClick={onGoPlans}
            disabled={!hasRestaurant}
            sx={{
              mt: 1,
              borderRadius: 3,
              py: 1.2,
              fontWeight: 900,
              textTransform: "none",
              bgcolor: "#f97316",
              "&:hover": { bgcolor: "#ea580c" },
            }}
          >
            {hasRestaurant ? "Ver planes con descuento" : "Primero registra tu restaurante"}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={onClose}
            sx={{
              fontWeight: 800,
              textTransform: "none",
              color: "#9a3412",
            }}
          >
            Cerrar
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}