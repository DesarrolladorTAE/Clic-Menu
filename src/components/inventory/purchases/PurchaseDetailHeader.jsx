import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

function money(v) {
  return Number(v || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

export default function PurchaseDetailHeader({
  purchase,
  onBack,
  onComplete,
  completing = false,
}) {
  const isDraft = purchase?.status === "draft";

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "center" }}
      spacing={2}
    >
      <Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography
            sx={{
              fontSize: { xs: 30, md: 42 },
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.1,
            }}
          >
            Compra #{purchase?.id}
          </Typography>

          <Chip
            label={isDraft ? "Draft" : "Completada"}
            sx={
              isDraft
                ? {
                    fontWeight: 800,
                    bgcolor: "#FFF3E0",
                    color: "#A75A00",
                  }
                : {
                    fontWeight: 800,
                    bgcolor: "rgba(46, 175, 46, 0.14)",
                    color: "success.main",
                  }
            }
          />
        </Stack>

        <Typography
          sx={{
            mt: 1,
            color: "text.secondary",
            fontSize: { xs: 14, md: 17 },
          }}
        >
          Total actual:{" "}
          <Box component="span" sx={{ fontWeight: 800, color: "text.primary" }}>
            {money(purchase?.total_amount)}
          </Box>
        </Typography>
      </Box>

      <Stack
        direction={{ xs: "column-reverse", sm: "row" }}
        spacing={1.5}
        sx={{ width: { xs: "100%", md: "auto" } }}
      >
        <Button
          onClick={onBack}
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          sx={{
            minWidth: { xs: "100%", sm: 170 },
            height: 44,
            borderRadius: 2,
          }}
        >
          Volver
        </Button>

        {isDraft ? (
          <Button
            onClick={onComplete}
            variant="contained"
            startIcon={<CheckCircleOutlineIcon />}
            disabled={completing}
            sx={{
              minWidth: { xs: "100%", sm: 210 },
              height: 44,
              borderRadius: 2,
              fontWeight: 800,
            }}
          >
            {completing ? "Completando…" : "Completar compra"}
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
}
