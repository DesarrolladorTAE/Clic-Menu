import {
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

export default function PromotionFormHeader({
  branchName,
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
          Crear promoción
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "text.secondary",
            fontSize: { xs: 14, md: 17 },
            lineHeight: 1.55,
          }}
        >
          Configura una nueva promoción para{" "}
          <Box
            component="span"
            sx={{
              color: "primary.main",
              fontWeight: 800,
            }}
          >
            {branchName ||
              "la sucursal seleccionada"}
          </Box>
          .
        </Typography>
      </Box>

      <Button
        type="button"
        variant="outlined"
        startIcon={<ArrowBackOutlinedIcon />}
        onClick={onBack}
        sx={{
          minWidth: {
            xs: "100%",
            sm: 190,
          },
          height: 44,
          borderRadius: 2,
          fontWeight: 800,
        }}
      >
        Volver a promociones
      </Button>
    </Stack>
  );
}
