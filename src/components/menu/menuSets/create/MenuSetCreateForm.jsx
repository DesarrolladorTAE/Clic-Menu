import {
  Box, Button, ButtonBase, Chip, CircularProgress,
  InputAdornment, MenuItem, Paper, Stack, TextField, Typography,
} from "@mui/material";

import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const DAYS = [
  { value: 1, label: "Lunes", short: "Lun" },
  { value: 2, label: "Martes", short: "Mar" },
  { value: 3, label: "Miércoles", short: "Mié" },
  { value: 4, label: "Jueves", short: "Jue" },
  { value: 5, label: "Viernes", short: "Vie" },
  { value: 6, label: "Sábado", short: "Sáb" },
  { value: 7, label: "Domingo", short: "Dom" },
];

const CAPACITY_OPTIONS = [
  {
    value: "none",
    label: "Sin límite",
    description: "Los productos no tendrán un límite de capacidad comercial.",
  },
  {
    value: "daily",
    label: "Diaria",
    description: "Podrás establecer una cantidad disponible para cada producto y día.",
  },
  {
    value: "weekly",
    label: "Semanal",
    description: "Podrás establecer una cantidad semanal disponible para cada producto.",
  },
];

const panelSx = {
  p: { xs: 2, sm: 3 },
  borderRadius: 1,
  backgroundColor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
};

function SectionTitle({ title, description }) {
  return (
    <Box>
      <Typography sx={{ fontSize: { xs: 18, sm: 20 }, fontWeight: 800, color: "text.primary" }}>
        {title}
      </Typography>

      {description ? (
        <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
          {description}
        </Typography>
      ) : null}
    </Box>
  );
}

function FieldBlock({ label, help, children }) {
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ mb: 1, fontSize: 14, fontWeight: 800, color: "text.primary" }}>
        {label}
      </Typography>

      {children}

      {help ? (
        <Typography sx={{ mt: 0.75, fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}>
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}

export default function MenuSetCreateForm({
  branchName,
  form,
  errors = {},
  saving = false,
  onFieldChange,
  onToggleDay,
  onSubmit,
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={3}>
        {/* Información general */}
        <Paper sx={panelSx}>
          <Stack spacing={2.5}>
            <SectionTitle
              title="Información del conjunto"
              description="Registra los datos principales que identificarán este conjunto."
            />

            <FieldBlock
              label="Sucursal"
              help="El conjunto pertenecerá únicamente a esta sucursal."
            >
              <TextField
                fullWidth
                value={branchName || "Sucursal no disponible"}
                disabled
              />
            </FieldBlock>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FieldBlock
                label="Nombre del conjunto *"
                help="Nombre con el que identificarás el conjunto en el catálogo."
              >
                <TextField
                  fullWidth
                  value={form.name}
                  onChange={(event) => onFieldChange("name", event.target.value)}
                  placeholder="Ej. Menú Ejecutivo"
                  inputProps={{ maxLength: 150 }}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  disabled={saving}
                />
              </FieldBlock>

              <FieldBlock
                label="Nombre para cobro"
                help="Opcional. Si lo dejas vacío, se utilizará el nombre del conjunto."
              >
                <TextField
                  fullWidth
                  value={form.billing_name}
                  onChange={(event) => onFieldChange("billing_name", event.target.value)}
                  placeholder="Ej. Menú Ejecutivo"
                  inputProps={{ maxLength: 150 }}
                  error={Boolean(errors.billing_name)}
                  helperText={errors.billing_name}
                  disabled={saving}
                />
              </FieldBlock>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FieldBlock
                label="Precio del conjunto *"
                help="Precio de venta del conjunto completo."
              >
                <TextField
                  fullWidth
                  value={form.price}
                  onChange={(event) => onFieldChange("price", event.target.value)}
                  placeholder="0.00"
                  inputProps={{ inputMode: "decimal" }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    endAdornment: <InputAdornment position="end">MXN</InputAdornment>,
                  }}
                  error={Boolean(errors.price)}
                  helperText={errors.price}
                  disabled={saving}
                />
              </FieldBlock>

              <FieldBlock
                label="Orden de presentación"
                help="Los conjuntos con un número menor aparecerán primero."
              >
                <TextField
                    fullWidth
                    type="text"
                    value={form.sort_order}
                    onChange={(event) => {
                        const value = event.target.value;
                        if (/^\d*$/.test(value)) {
                            onFieldChange("sort_order", value);
                        }
                    }}
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    error={Boolean(errors.sort_order)}
                    helperText={errors.sort_order}
                    disabled={saving}
                />
              </FieldBlock>
            </Stack>
          </Stack>
        </Paper>

        {/* Días de servicio */}
        <Paper sx={panelSx}>
          <Stack spacing={2.5}>
            <SectionTitle
              title="Días de servicio"
              description="Selecciona los días en los que estará disponible este conjunto. También podrás modificarlos posteriormente."
            />

            <Box sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(4, minmax(0, 1fr))",
                md: "repeat(7, minmax(0, 1fr))",
              },
              gap: 1.25,
            }}>
              {DAYS.map((day) => {
                const selected = form.service_days.includes(day.value);

                return (
                  <ButtonBase
                    key={day.value}
                    type="button"
                    disabled={saving}
                    onClick={() => onToggleDay(day.value)}
                    aria-pressed={selected}
                    aria-label={day.label}
                    sx={{
                      minHeight: 54,
                      p: 1.25,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: selected ? "secondary.main" : "divider",
                      backgroundColor: selected ? "rgba(214, 122, 58, 0.10)" : "background.default",
                      transition: "border-color 0.18s ease, background-color 0.18s ease",
                      "&:hover": {
                        borderColor: "secondary.main",
                        backgroundColor: "rgba(214, 122, 58, 0.07)",
                      },
                      "&.Mui-focusVisible": {
                        outline: "2px solid",
                        outlineColor: "secondary.main",
                        outlineOffset: 2,
                      },
                    }}
                  >
                    <Typography sx={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: selected ? "secondary.main" : "text.primary",
                    }}>
                      {day.short}
                    </Typography>
                  </ButtonBase>
                );
              })}
            </Box>

            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              {form.service_days.length === 0
                ? "No has seleccionado días de servicio."
                : `${form.service_days.length} ${form.service_days.length === 1 ? "día seleccionado" : "días seleccionados"}.`}
            </Typography>

            {errors.service_days ? (
              <Typography sx={{ fontSize: 12, color: "error.main" }}>
                {errors.service_days}
              </Typography>
            ) : null}
          </Stack>
        </Paper>

        {/* Capacidad */}
        <Paper sx={panelSx}>
          <Stack spacing={2.5}>
            <SectionTitle
              title="Modalidad de capacidad"
              description="Selecciona cómo deseas controlar las cantidades disponibles de los productos del conjunto."
            />

            <Box sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: 1.5,
            }}>
              {CAPACITY_OPTIONS.map((option) => {
                const selected = form.capacity_mode === option.value;

                return (
                  <ButtonBase
                    key={option.value}
                    type="button"
                    disabled={saving}
                    onClick={() => onFieldChange("capacity_mode", option.value)}
                    aria-pressed={selected}
                    sx={{
                      width: "100%",
                      minHeight: 130,
                      p: 2,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: selected ? "secondary.main" : "divider",
                      backgroundColor: selected ? "rgba(214, 122, 58, 0.10)" : "background.default",
                      textAlign: "left",
                      alignItems: "stretch",
                      transition: "border-color 0.18s ease, background-color 0.18s ease",
                      "&:hover": {
                        borderColor: "secondary.main",
                        backgroundColor: "rgba(214, 122, 58, 0.07)",
                      },
                      "&.Mui-focusVisible": {
                        outline: "2px solid",
                        outlineColor: "secondary.main",
                        outlineOffset: 2,
                      },
                    }}
                  >
                    <Stack spacing={1} sx={{ width: "100%" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Typography sx={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: selected ? "secondary.main" : "text.primary",
                        }}>
                          {option.label}
                        </Typography>

                        {selected ? <Chip size="small" label="Seleccionada" color="secondary" /> : null}
                      </Stack>

                      <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
                        {option.description}
                      </Typography>
                    </Stack>
                  </ButtonBase>
                );
              })}
            </Box>

            <Box sx={{
              p: 1.75,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.default",
            }}>
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <InfoOutlinedIcon sx={{ color: "primary.main", fontSize: 20, flexShrink: 0 }} />

                <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
                  {form.capacity_mode === "none"
                    ? "Este conjunto no tendrá límites de capacidad comercial."
                    : "Las cantidades disponibles se configurarán después de agregar los productos a las etapas."}
                </Typography>
              </Stack>
            </Box>

            {errors.capacity_mode ? (
              <Typography sx={{ fontSize: 12, color: "error.main" }}>
                {errors.capacity_mode}
              </Typography>
            ) : null}
          </Stack>
        </Paper>

        {/* Facturación */}
        <Paper sx={panelSx}>
          <Stack spacing={2.5}>
            <SectionTitle
              title="Datos de facturación"
              description="Estas claves son opcionales. Si deseas registrarlas, debes completar ambas."
            />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FieldBlock
                label="Clave SAT de producto o servicio"
                help="Clave correspondiente al producto o servicio."
              >
                <TextField
                  fullWidth
                  value={form.sat_product_service}
                  onChange={(event) => onFieldChange("sat_product_service", event.target.value)}
                  placeholder="Ej. 90101501"
                  inputProps={{ maxLength: 20 }}
                  error={Boolean(errors.sat_product_service || errors.sat)}
                  helperText={errors.sat_product_service}
                  disabled={saving}
                />
              </FieldBlock>

              <FieldBlock
                label="Clave SAT de unidad"
                help="Clave de unidad correspondiente al conjunto."
              >
                <TextField
                  fullWidth
                  value={form.sat_unit}
                  onChange={(event) => onFieldChange("sat_unit", event.target.value)}
                  placeholder="Ej. E48"
                  inputProps={{ maxLength: 20 }}
                  error={Boolean(errors.sat_unit || errors.sat)}
                  helperText={errors.sat_unit || errors.sat}
                  disabled={saving}
                />
              </FieldBlock>
            </Stack>
          </Stack>
        </Paper>

        {/* Estado inicial */}
        <Paper sx={panelSx}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
                Estado inicial
              </Typography>

              <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
                El conjunto se guardará inactivo. Podrás activarlo cuando termines de configurar sus etapas y productos.
              </Typography>
            </Box>

            <Chip label="Inactivo" variant="outlined" />
          </Stack>
        </Paper>

        {/* Acciones */}
        <Paper sx={{ ...panelSx, p: { xs: 1.5, sm: 2 } }}>
            <Stack direction="row" justifyContent="flex-end">
                <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
                    sx={{ minWidth: { xs: "100%", sm: 190 }, height: 44, fontWeight: 800 }}
                >
                {saving ? "Creando…" : "Crear Conjunto"}
                </Button>
            </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}