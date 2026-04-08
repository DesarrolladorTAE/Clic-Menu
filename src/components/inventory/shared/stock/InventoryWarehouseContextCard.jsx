import { Chip, Paper, Stack, Typography } from "@mui/material";

function scopeLabel(scope) {
  return scope === "global" ? "Global" : "Sucursal";
}

export default function InventoryWarehouseContextCard({ warehouse }) {
  if (!warehouse) return null;

  return (
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
      <Stack spacing={1.25}>
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          Contexto del almacén
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "flex-start", sm: "center" }}
          flexWrap="wrap"
          useFlexGap
        >
          <Chip
            label={warehouse.name || "Almacén"}
            sx={{
              fontWeight: 800,
              bgcolor: "#FFF1DD",
              color: "#8A4F00",
            }}
          />

          <Chip
            label={scopeLabel(warehouse.scope)}
            sx={{
              fontWeight: 800,
              bgcolor: "#EEF2FF",
              color: "#3F3A52",
            }}
          />

          {warehouse.is_default ? (
            <Chip
              label="Default"
              sx={{
                fontWeight: 800,
                bgcolor: "#FFF3E0",
                color: "#A75A00",
              }}
            />
          ) : null}

          <Chip
            label={warehouse.status === "active" ? "Activo" : "Inactivo"}
            color={warehouse.status === "active" ? "success" : "default"}
            sx={{ fontWeight: 800 }}
          />
        </Stack>

        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.5,
          }}
        >
          Todo lo que ves en esta pantalla corresponde exclusivamente a este
          almacén.
        </Typography>
      </Stack>
    </Paper>
  );
}
