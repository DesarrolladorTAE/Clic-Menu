import {
  Box, Paper, Stack, Typography,
} from "@mui/material";

const instructions = [
  "Cada menú pertenece a una sucursal y comienza en estado borrador.",
  "El contenido se construye con las secciones, categorías y productos que ya existen en el catálogo.",
  "Los productos deben estar habilitados para la sucursal y correctamente configurados en sus canales de venta.",
  "Antes de activar un menú, configura su contenido y los canales donde participará.",
];

export default function MenusInstructionsCard() {
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

        {instructions.map((instruction, index) => (
          <InstructionRow
            key={instruction}
            step={index + 1}
            text={instruction}
          />
        ))}
      </Stack>
    </Paper>
  );
}

function InstructionRow({
  step,
  text,
}) {
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