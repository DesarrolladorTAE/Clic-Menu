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

export default function ReferralWelcomeModal({ open, code, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          overflow: "hidden",
          background:
            "linear-gradient(145deg, #ffffff 0%, #fff7ed 45%, #fef3c7 100%)",
        },
      }}
    >
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
            ¡Código referido detectado!
          </Typography>

          <Chip
            label={`Código: ${code}`}
            sx={{
              mt: 1.5,
              bgcolor: "#fff",
              color: "#c2410c",
              fontWeight: 900,
              fontSize: 14,
            }}
          />
        </Box>

        <Stack spacing={2} sx={{ p: 3 }}>
          <Typography
            variant="h6"
            textAlign="center"
            fontWeight={900}
            color="#7c2d12"
          >
            Obtén 5% de descuento
          </Typography>

          <Typography textAlign="center" color="text.secondary">
            Usa tu código referido y recibe un{" "}
            <strong>5% de descuento en tu primera compra</strong>, aplicable en
            cualquiera de nuestros planes.
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
            onClick={onClose}
            sx={{
              mt: 1,
              borderRadius: 3,
              py: 1.2,
              fontWeight: 900,
              textTransform: "none",
              bgcolor: "#f97316",
              boxShadow: "0 14px 28px rgba(249,115,22,.28)",
              "&:hover": {
                bgcolor: "#ea580c",
              },
            }}
          >
            ¡Entendido!
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}