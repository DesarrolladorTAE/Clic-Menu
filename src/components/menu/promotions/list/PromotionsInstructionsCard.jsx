import {
  Box, Paper, Stack, Typography,
} from "@mui/material";

const instructions = [
  "Las promociones se configuran de manera independiente para cada sucursal.",
  "Pueden aplicar por canal de venta, días y horarios específicos.",
  "Cada promoción debe incluir al menos un canal, un horario y un producto participante.",
  "Cuando varias promociones coinciden, se respeta la promoción con mayor prioridad.",
];

export default function PromotionsInstructionsCard() {
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
