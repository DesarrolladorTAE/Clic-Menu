import {
  Box, Paper, Stack, Typography,
} from "@mui/material";

const instructions = [
  "Habilitar un menú permite que participe en el canal seleccionado.",
  "Solo un menú activo, habilitado y válido puede definirse como predeterminado.",
  "Si el canal ya tiene otro menú predeterminado, se solicitará confirmación antes de reemplazarlo.",
  "Los canales bloqueados deben corregirse desde Canales de venta por sucursal.",
];

export default function MenuChannelsInstructionsCard({
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
            ? "Configuración archivada"
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
            Este menú está archivado. Puedes consultar los canales que tuvo
            configurados, pero ya no puedes modificarlos.
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