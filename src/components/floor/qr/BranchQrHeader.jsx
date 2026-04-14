import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";

export default function BranchQrHeader({
  selectedBranch,
  busy = false,
  onCreate,
  onBack,
}) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "center" }}
      spacing={2}
    >
      <Box>
        <Typography
          sx={{
            fontSize: { xs: 30, md: 42 },
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.1,
          }}
        >
          Administración de QRs
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "text.secondary",
            fontSize: { xs: 14, md: 17 },
          }}
        >
          Administra los códigos QR de{" "}
          <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>
            {selectedBranch?.name || "la sucursal seleccionada"}
          </Box>
          .
        </Typography>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ width: { xs: "100%", md: "auto" } }}
      >
        <Button
          onClick={onCreate}
          variant="contained"
          startIcon={<AddIcon />}
          disabled={busy}
          sx={{
            minWidth: { xs: "100%", sm: 180 },
            height: 44,
            borderRadius: 2,
            fontWeight: 800,
          }}
        >
          Crear QR
        </Button>

        <Button
          onClick={onBack}
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          sx={{
            minWidth: { xs: "100%", sm: 170 },
            height: 44,
            borderRadius: 2,
            fontWeight: 800,
          }}
        >
          Volver a mesas
        </Button>
      </Stack>
    </Stack>
  );
}