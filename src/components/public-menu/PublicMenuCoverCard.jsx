import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

export default function PublicMenuCoverCard({
  setting,
  disabled = false,
  onUpload,
  onDelete,
}) {
  const coverUrl = setting?.cover_public_url || "";

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
      <Stack spacing={2}>
        <Box>
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            Imagen de portada
          </Typography>

          <Typography
            sx={{
              mt: 0.75,
              fontSize: 13,
              color: "text.secondary",
              lineHeight: 1.5,
            }}
          >
            Recomendado: imagen horizontal. El backend valida mínimo 1200px de ancho por 500px de alto y máximo 5 MB.
          </Typography>
        </Box>

        <Box
          sx={{
            width: "100%",
            aspectRatio: "12 / 5",
            borderRadius: 1,
            border: "1px dashed",
            borderColor: "divider",
            bgcolor: "#F6F4F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {coverUrl ? (
            <Box
              component="img"
              src={coverUrl}
              alt="Portada menú público"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
              }}
            />
          ) : (
            <Stack spacing={1} alignItems="center" sx={{ px: 2, py: 4 }}>
              <ImageOutlinedIcon sx={{ fontSize: 42, color: "text.secondary" }} />
              <Typography
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  textAlign: "center",
                }}
              >
                No hay portada cargada todavía
              </Typography>
            </Stack>
          )}
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.25}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadOutlinedIcon />}
            disabled={disabled}
            sx={{
              minWidth: { xs: "100%", sm: 190 },
              height: 42,
              borderRadius: 2,
            }}
          >
            {coverUrl ? "Reemplazar portada" : "Subir portada"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              hidden
              onChange={handleSelectFile}
            />
          </Button>

          {coverUrl && (
            <Button
              type="button"
              color="error"
              variant="text"
              startIcon={<DeleteOutlineIcon />}
              onClick={onDelete}
              disabled={disabled}
              sx={{
                minWidth: { xs: "100%", sm: 170 },
                height: 42,
                borderRadius: 2,
                fontWeight: 700,
              }}
            >
              Eliminar portada
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
