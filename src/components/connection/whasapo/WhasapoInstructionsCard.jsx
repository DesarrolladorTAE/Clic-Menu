import { Box, Paper, Stack, Typography } from "@mui/material";

export default function WhasapoInstructionsCard() {
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
          text="La configuración de WhatsApp se administra por sucursal. Primero selecciona la sucursal que deseas consultar o modificar."
        />

        <InstructionRow
          step="2"
          text="En Whasapo puedes utilizar la conexión principal del sistema o configurar un token propio para que la sucursal envíe mensajes desde su conexión personalizada."
        />

        <InstructionRow
          step="3"
          text="WhatsApp QR estará disponible únicamente en las sucursales que tengan vigente el complemento correspondiente y una conexión vinculada correctamente."
        />

        <InstructionRow
          step="4"
          text="Cuando Whasapo personalizado y WhatsApp QR estén disponibles al mismo tiempo, podrás indicar cuál deseas utilizar como canal preferido."
        />
      </Stack>
    </Paper>
  );
}

function InstructionRow({ step, text }) {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="flex-start"
    >
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