import { Box, Stack, Typography } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

export default function WhasapoConnectionHeader({
  selectedBranch,
}) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "center" }}
      spacing={2}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="flex-start"
        sx={{ minWidth: 0 }}
      >
        <Box
          sx={{
            width: { xs: 44, md: 50 },
            height: { xs: 44, md: 50 },
            display: "grid",
            placeItems: "center",
            borderRadius: 1,
            bgcolor: "primary.main",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          <WhatsAppIcon
            sx={{
              fontSize: { xs: 27, md: 31 },
            }}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: { xs: 30, md: 42 },
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.1,
            }}
          >
            WhatsApp
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
              fontSize: { xs: 14, md: 17 },
              lineHeight: 1.5,
            }}
          >
            Administra el canal utilizado para enviar mensajes de
            WhatsApp desde{" "}
            <Box
              component="span"
              sx={{
                color: "primary.main",
                fontWeight: 800,
              }}
            >
              {selectedBranch?.name ||
                "la sucursal seleccionada"}
            </Box>
            .
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
}