import { Box, Paper, Stack, Typography } from "@mui/material";

export default function FloorPlanInstructionsCard({
  isDirectAttentionMode = false,
}) {
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

        {isDirectAttentionMode ? (
          <>
            <InstructionRow
              step="1"
              text="Esta sucursal opera en atención directa. Las zonas y mesas existentes se muestran solo como consulta."
            />

            <InstructionRow
              step="2"
              text="No se permite crear, editar ni eliminar zonas o mesas mientras el restaurante esté en atención directa."
            />

            <InstructionRow
              step="3"
              text="Desde Configuración operativa puedes activar la venta directa desde caja y mantener disponible el acceso por QR."
            />
          </>
        ) : (
          <>
            <InstructionRow
              step="1"
              text="Primero selecciona la sucursal que deseas administrar para ver únicamente sus zonas y mesas."
            />

            <InstructionRow
              step="2"
              text="Las zonas sirven para organizar el salón y agrupar las mesas por áreas de atención."
            />

            <InstructionRow
              step="3"
              text="Si usas asignación por zona, podrás vincular un mesero y el sistema aplicará esa relación a sus mesas."
            />
          </>
        )}

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
