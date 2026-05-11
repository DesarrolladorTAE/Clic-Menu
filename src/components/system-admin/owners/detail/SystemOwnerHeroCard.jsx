import React from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";

export default function SystemOwnerHeroCard({
  owner,
  refreshing = false,
  onCreateRestaurant,
  onBack,
}) {
  const ownerName = owner?.full_name || owner?.name || "Propietario";

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: { xs: 30, md: 42 },
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.1,
            }}
          >
            {ownerName}
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
              fontSize: { xs: 15, md: 18 },
            }}
          >
            Administra los restaurantes registrados para este propietario.
          </Typography>

          {refreshing ? (
            <Typography
              sx={{
                mt: 1,
                fontSize: 13,
                color: "text.secondary",
              }}
            >
              Actualizando cambios…
            </Typography>
          ) : null}
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            width: { xs: "100%", md: "auto" },
            flexShrink: 0,
          }}
        >
          <Button
            type="button"
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{
              minWidth: { xs: "100%", sm: 210 },
              height: 44,
              borderRadius: 2,
              fontWeight: 800,
            }}
          >
            Volver
          </Button>

          <Button
            onClick={onCreateRestaurant}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              minWidth: { xs: "100%", sm: 210 },
              height: 44,
              borderRadius: 2,
              fontWeight: 800,
            }}
          >
            Crear restaurante
          </Button>
        </Stack>
      </Stack>

      <Paper
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 1,
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Stack spacing={1}>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Datos del propietario
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <InfoChip icon={<PersonRoundedIcon />} label={`ID: ${owner?.id || "—"}`} />
              <InfoChip icon={<EmailRoundedIcon />} label={owner?.email || "Sin correo"} />
              <InfoChip icon={<PhoneRoundedIcon />} label={owner?.phone || "Sin teléfono"} />
            </Stack>
          </Stack>

          <Chip
            label={owner?.status === "active" ? "Activo" : "Inactivo"}
            color={owner?.status === "active" ? "success" : "default"}
            sx={{
              fontWeight: 800,
            }}
          />
        </Stack>
      </Paper>
    </Stack>
  );
}

function InfoChip({ icon, label }) {
  return (
    <Chip
      icon={icon}
      label={label}
      sx={{
        width: "fit-content",
        maxWidth: "100%",
        fontWeight: 800,
        bgcolor: "#EEF2FF",
        color: "text.primary",
        "& .MuiChip-icon": {
          color: "text.secondary",
        },
      }}
    />
  );
}