import { Box, Paper, Stack, Typography } from "@mui/material";

export default function WarehouseInstructionsCard({ inventoryMode }) {
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
          Antes de comenzar
        </Typography>

        <InstructionRow
          step="1"
          text={
            inventoryMode === "global"
              ? "Tu inventario trabaja con un solo contexto general, por lo que todos los almacenes serán globales."
              : "Tu inventario trabaja por sucursal, así que cada almacén pertenecerá a una sucursal específica."
          }
        />

        <InstructionRow
          step="2"
          text="Marca como default el almacén principal del contexto. Solo puede existir uno por contexto."
        />

        <InstructionRow
          step="3"
          text="Puedes usar la opción “Asegurar bases” para generar automáticamente los almacenes iniciales que hagan falta."
        />
      </Stack>
    </Paper>
  );
}

function InstructionRow({ step, text }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          minWidth: 28,
          height: 28,
          borderRadius: 999,
          bgcolor: "primary.main",
          color: "#fff",
          display: "grid",
          placeItems: "center",
          fontSize: 13,
          fontWeight: 800,
        }}
      >
        {step}
      </Box>

      <Typography
        sx={{
          fontSize: 14,
          color: "text.primary",
          lineHeight: 1.6,
        }}
      >
        {text}
      </Typography>
    </Stack>
  );
}
