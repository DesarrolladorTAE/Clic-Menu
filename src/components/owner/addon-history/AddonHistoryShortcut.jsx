import { Box, Button, Paper, Stack, Typography } from "@mui/material";

import ExtensionRoundedIcon from "@mui/icons-material/ExtensionRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

export default function AddonHistoryShortcut({
  disabled = false,
  onOpen,
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
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              color: "primary.main",
            }}
          >
            <ExtensionRoundedIcon sx={{ fontSize: 26 }} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: 17, sm: 19 },
                fontWeight: 800,
                color: "text.primary",
                lineHeight: 1.25,
              }}
            >
              Complementos
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              Consulta los complementos vigentes, opciones disponibles e historial de tu restaurante.
            </Typography>
          </Box>
        </Stack>

        <Button
          type="button"
          variant="contained"
          startIcon={<ArrowForwardRoundedIcon />}
          onClick={onOpen}
          disabled={disabled}
          sx={{
            minWidth: { xs: "100%", sm: 180 },
            height: 44,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          Ver complementos
        </Button>
      </Stack>
    </Paper>
  );
}