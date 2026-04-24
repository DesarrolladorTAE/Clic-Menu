import { Box, Button, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

export default function InventoryReportHeader({ onBack }) {
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
          Reporte de existencias
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "text.secondary",
            fontSize: { xs: 14, md: 17 },
          }}
        >
          Consulta stock actual, valor de inventario y alertas por almacén.
        </Typography>
      </Box>

      <Button
        onClick={onBack}
        variant="outlined"
        startIcon={<ArrowBackRoundedIcon />}
        sx={{
          width: { xs: "100%", sm: "auto" },
          minWidth: { sm: 190 },
          height: 44,
          borderRadius: 2,
          fontWeight: 800,
        }}
      >
        Volver a almacenes
      </Button>
    </Stack>
  );
}