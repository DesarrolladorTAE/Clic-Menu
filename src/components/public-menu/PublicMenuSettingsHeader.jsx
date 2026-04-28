import { Box, Button, Stack, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

export default function PublicMenuSettingsHeader({
  selectedBranch,
  saving = false,
  onSave,
  canSave = true,
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
          Menú público
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "text.secondary",
            fontSize: { xs: 14, md: 17 },
          }}
        >
          Personaliza la presentación del menú que verá el cliente en{" "}
          <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>
            {selectedBranch?.name || "la sucursal seleccionada"}
          </Box>
          .
        </Typography>
      </Box>

      <Button
        onClick={onSave}
        variant="contained"
        startIcon={<SaveIcon />}
        disabled={!canSave || saving}
        sx={{
          minWidth: { xs: "100%", sm: 210 },
          height: 44,
          borderRadius: 2,
          fontWeight: 800,
        }}
      >
        {saving ? "Guardando…" : "Guardar cambios"}
      </Button>
    </Stack>
  );
}
