
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

export default function MenuContentHeader({ menu, onBack }) {
  const statusConfig = {
    draft: { label: "Borrador", color: "warning" },
    active: { label: "Activo", color: "success" },
    archived: { label: "Archivado", color: "default" },
  }[menu?.status || "draft"] || { label: "Sin estado", color: "default" };

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "center" }}
      spacing={2}
    >
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
          <Typography sx={{
            fontSize: { xs: 30, md: 42 },
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.1,
          }}>
            Contenido del menú
          </Typography>

          <Chip
            label={statusConfig.label}
            color={statusConfig.color}
            size="small"
            variant={statusConfig.color === "default" ? "outlined" : "filled"}
            sx={{ fontWeight: 800 }}
          />
        </Stack>

        <Typography sx={{
          mt: 1,
          fontSize: { xs: 14, md: 17 },
          color: "text.secondary",
          lineHeight: 1.55,
        }}>
          Administra los productos normales y Conjuntos de{" "}
          <Box component="span" sx={{ fontWeight: 800, color: "primary.main" }}>
            {menu?.name || "este menú"}
          </Box>.
        </Typography>
      </Box>

      <Button
        type="button"
        variant="outlined"
        startIcon={<ArrowBackOutlinedIcon />}
        onClick={onBack}
        sx={{
          minWidth: { xs: "100%", sm: 170 },
          height: 44,
          flexShrink: 0,
        }}
      >
        Volver a menús
      </Button>
    </Stack>
  );
}