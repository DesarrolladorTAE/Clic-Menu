import {
  Box, Paper, Stack, Typography,
} from "@mui/material";

const instructions = [
  "Selecciona primero las secciones que formarán parte del menú.",
  "Al seleccionar una categoría o producto, sus elementos superiores se seleccionarán automáticamente.",
  "El orden se controla dentro de cada nivel: secciones, categorías y productos.",
  "Los horarios propios son opcionales. Si no configuras uno, el elemento heredará el horario de su nivel superior.",
];

export default function MenuContentInstructionsCard({
  readOnly = false,
}) {
  return (
    <Paper
      sx={{
        p: {
          xs: 2,
          sm: 2.5,
        },
        borderRadius: 1,
        backgroundColor:
          "background.paper",
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
          {readOnly
            ? "Contenido archivado"
            : "Antes de comenzar"}
        </Typography>

        {readOnly ? (
          <Typography
            sx={{
              fontSize: 14,
              color: "text.secondary",
              lineHeight: 1.6,
            }}
          >
            Este menú está archivado.
            Puedes consultar su
            estructura y horarios, pero
            ya no puedes modificarlos.
          </Typography>
        ) : (
          instructions.map(
            (
              instruction,
              index
            ) => (
              <InstructionRow
                key={
                  instruction
                }
                step={
                  index + 1
                }
                text={
                  instruction
                }
              />
            )
          )
        )}
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