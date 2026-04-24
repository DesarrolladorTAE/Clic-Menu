import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

export default function WarehouseInventoryReportCard({ onOpenReport }) {
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
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: "rgba(255, 152, 0, 0.12)",
              color: "primary.main",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <AssessmentOutlinedIcon />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Reporte de existencias
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 14,
                color: "text.secondary",
                lineHeight: 1.55,
              }}
            >
              Consulta stock, valor de inventario y alertas por almacén.
            </Typography>
          </Box>
        </Stack>

        <Button
          onClick={onOpenReport}
          variant="contained"
          endIcon={<ArrowForwardRoundedIcon />}
          sx={{
            width: { xs: "100%", md: "auto" },
            minWidth: { md: 180 },
            height: 44,
            borderRadius: 2,
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          Abrir reporte
        </Button>
      </Stack>
    </Paper>
  );
}