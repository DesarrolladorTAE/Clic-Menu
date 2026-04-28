import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";

export default function PublicMenuContextCard({
  selectedBranch,
  setting,
  gallery = [],
}) {
  const hasCover = !!setting?.cover_public_url;
  const activeGallery = gallery.filter((img) => !!img?.is_active);

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
      <Stack spacing={2}>
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          Contexto actual
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          useFlexGap
          flexWrap="wrap"
        >
          <ContextMiniCard
            icon={<PaletteOutlinedIcon fontSize="small" />}
            title="Color base"
            value={setting?.theme_color || "#FF7A00"}
            chipLabel={setting?.is_active ? "Activo" : "Inactivo"}
            chipColor={setting?.is_active ? "success" : "default"}
          />

          <ContextMiniCard
            icon={<ImageOutlinedIcon fontSize="small" />}
            title="Portada"
            value={hasCover ? "Imagen de portada configurada" : "Sin portada"}
            chipLabel={hasCover ? "Lista" : "Pendiente"}
            chipColor={hasCover ? "success" : "default"}
          />

          <ContextMiniCard
            icon={<CollectionsOutlinedIcon fontSize="small" />}
            title="Galería"
            value={`${activeGallery.length} imagen(es) activas de ${gallery.length} total(es)`}
            chipLabel={activeGallery.length > 0 ? "Visible" : "Vacía"}
            chipColor={activeGallery.length > 0 ? "primary" : "default"}
          />
        </Stack>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            lineHeight: 1.6,
          }}
        >
          {selectedBranch?.name
            ? `Los cambios se aplicarán únicamente al menú público de ${selectedBranch.name}.`
            : "Selecciona una sucursal para continuar."}
        </Typography>
      </Stack>
    </Paper>
  );
}

function ContextMiniCard({ icon, title, value, chipLabel, chipColor = "default" }) {
  return (
    <Box
      sx={{
        flex: "1 1 240px",
        minWidth: 220,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.75,
        backgroundColor: "background.default",
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255, 152, 0, 0.12)",
              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            {title}
          </Typography>
        </Stack>

        <Typography
          sx={{
            fontSize: 14,
            color: "text.primary",
            lineHeight: 1.45,
            minHeight: 42,
            wordBreak: "break-word",
          }}
        >
          {value}
        </Typography>

        <Box>
          <Chip
            label={chipLabel}
            size="small"
            color={chipColor}
            variant={chipColor === "default" ? "outlined" : "filled"}
          />
        </Box>
      </Stack>
    </Box>
  );
}
