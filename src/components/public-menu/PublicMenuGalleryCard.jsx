import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";

export default function PublicMenuGalleryCard({
  gallery = [],
  disabled = false,
  onUpload,
  onUpdate,
  onDelete,
}) {
  const handleSelectFile = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      onUpload?.(file);
    }

    event.target.value = "";
  };

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
      <Stack spacing={2.25}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "flex-start" }}
          spacing={1.5}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Galería del menú
            </Typography>

            <Typography
              sx={{
                mt: 0.75,
                fontSize: 13,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              Estas imágenes se usarán en el carrusel del menú público. El backend valida mínimo 900px por 500px y máximo 5 MB.
            </Typography>
          </Box>

          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadOutlinedIcon />}
            disabled={disabled}
            sx={{
              minWidth: { xs: "100%", sm: 190 },
              height: 42,
              borderRadius: 2,
              flexShrink: 0,
            }}
          >
            Subir imagen
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              hidden
              onChange={handleSelectFile}
            />
          </Button>
        </Stack>

        {gallery.length === 0 ? (
          <Box
            sx={{
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.default",
              minHeight: 160,
              display: "grid",
              placeItems: "center",
              px: 2,
              py: 4,
            }}
          >
            <Stack spacing={1} alignItems="center">
              <CollectionsOutlinedIcon sx={{ fontSize: 42, color: "text.secondary" }} />
              <Typography
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  textAlign: "center",
                }}
              >
                No hay imágenes cargadas en la galería
              </Typography>
            </Stack>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },
              gap: 2,
            }}
          >
            {gallery.map((image) => (
              <GalleryImageCard
                key={image.id}
                image={image}
                disabled={disabled}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </Box>
        )}
      </Stack>
    </Paper>
  );
}

function GalleryImageCard({ image, disabled, onUpdate, onDelete }) {
  const publicUrl = image?.public_url || image?.image_url || "";
  const sortOrder = Number(image?.sort_order || 0);
  const isActive = Boolean(image?.is_active);

  const handleSortChange = (event) => {
    const next = event.target.value;
    onUpdate?.(image.id, {
      sort_order: next === "" ? 0 : Number(next),
      is_active: isActive,
    });
  };

  const handleActiveChange = (event) => {
    onUpdate?.(image.id, {
      sort_order: sortOrder,
      is_active: event.target.checked,
    });
  };

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          width: "100%",
          aspectRatio: "16 / 9",
          bgcolor: "#F6F4F6",
          overflow: "hidden",
        }}
      >
        {publicUrl ? (
          <Box
            component="img"
            src={publicUrl}
            alt={image?.original_name || "Imagen galería"}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
          />
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "grid",
              placeItems: "center",
              color: "text.secondary",
            }}
          >
            <CollectionsOutlinedIcon />
          </Box>
        )}
      </Box>

      <Stack spacing={1.5} sx={{ p: 1.75 }}>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 800,
            color: "text.primary",
            wordBreak: "break-word",
          }}
        >
          {image?.original_name || `Imagen ${image?.id}`}
        </Typography>

        <Stack direction="row" spacing={1.25} alignItems="center">
          <TextField
            type="number"
            label="Orden"
            value={sortOrder}
            onChange={handleSortChange}
            disabled={disabled}
            inputProps={{ min: 0 }}
            sx={{ maxWidth: 110 }}
          />

          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Switch
              checked={isActive}
              onChange={handleActiveChange}
              color="primary"
              disabled={disabled}
            />

            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: "text.primary",
              }}
            >
              {isActive ? "Activa" : "Oculta"}
            </Typography>
          </Stack>

          <Tooltip title="Guardar cambios">
            <span>
              <IconButton
                disabled={disabled}
                onClick={() =>
                  onUpdate?.(image.id, {
                    sort_order: sortOrder,
                    is_active: isActive,
                  })
                }
                sx={iconSaveSx}
              >
                <SaveIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Eliminar">
            <span>
              <IconButton
                disabled={disabled}
                onClick={() => onDelete?.(image.id)}
                sx={iconDeleteSx}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
}

const iconSaveSx = {
  width: 36,
  height: 36,
  bgcolor: "#E3C24A",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "#C9AA39",
  },
};

const iconDeleteSx = {
  width: 36,
  height: 36,
  bgcolor: "#F2642A",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "#D94E17",
  },
};
