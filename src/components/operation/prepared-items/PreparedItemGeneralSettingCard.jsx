import {
  Box, Button, CircularProgress, Paper, Stack, TextField, Typography,
} from "@mui/material";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

export default function PreparedItemGeneralSettingCard({
  branchId,
  minutes,
  onChangeMinutes,
  onSave,
  saving = false,
  loading = false,
  source = "default",
}) {
  const configured = source === "branch_setting";

  const handleMinutesChange = (event) => {
    const nextValue = event.target.value.replace(/\D/g, "");
    onChangeMinutes(nextValue);
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
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 1,
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(255, 152, 0, 0.12)",
                color: "primary.main",
                flexShrink: 0,
              }}
            >
              <AccessTimeOutlinedIcon />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                Tiempo general de reutilización
              </Typography>

              <Typography
                sx={{
                  mt: 0.25,
                  fontSize: 12,
                  color: "text.secondary",
                }}
              >
                {configured
                  ? "La sucursal tiene una configuración guardada."
                  : "La sucursal está utilizando el tiempo predeterminado."}
              </Typography>
            </Box>
          </Stack>
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "flex-end" }}
        >
          <Stack spacing={1} sx={{ flex: 1 }}>
            <Typography sx={fieldLabelSx}>
              Tiempo disponible después de la preparación
            </Typography>

            <TextField
              type="text"
              value={minutes}
              disabled={!branchId || saving || loading}
              onChange={handleMinutesChange}
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
              fullWidth
              autoComplete="off"
              helperText="Indica el número de minutos. Debe ser mayor a cero."
            />
          </Stack>

          <Button
            variant="contained"
            startIcon={
              saving ? (
                <CircularProgress size={17} color="inherit" />
              ) : (
                <SaveOutlinedIcon />
              )
            }
            onClick={onSave}
            disabled={!branchId || saving || loading}
            sx={{
              minWidth: { xs: "100%", md: 180 },
              minHeight: 52,
              fontWeight: 800,
            }}
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
};