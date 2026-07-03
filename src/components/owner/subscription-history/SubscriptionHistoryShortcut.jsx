import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";

export default function SubscriptionHistoryShortcut({
  onOpen,
  disabled = false,
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
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <HistoryRoundedIcon
            sx={{
              mt: 0.15,
              fontSize: 28,
              color: "primary.main",
              flexShrink: 0,
            }}
          />

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 900,
                color: "text.primary",
                lineHeight: 1.25,
              }}
            >
              Historial de suscripciones
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              Consulta pagos, renovaciones futuras y vigencias anteriores de
              este restaurante.
            </Typography>
          </Box>
        </Stack>

        <Button
          onClick={onOpen}
          disabled={disabled}
          variant="contained"
          startIcon={<HistoryRoundedIcon />}
          sx={{
            minWidth: { xs: "100%", md: 170 },
            height: 44,
            fontWeight: 800,
          }}
        >
          Ver historial
        </Button>
      </Stack>
    </Paper>
  );
}