import {
  Box, FormControlLabel, Paper, Stack, Switch, TextField, Typography,
} from "@mui/material";

export default function PublicMenuSettingsFormCard({
  form,
  onChange,
  disabled = false,
}) {
  const colorValid = /^#[0-9A-Fa-f]{6}$/.test(String(form.theme_color || ""));

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
      <Stack spacing={3}>
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          Apariencia y redes sociales
        </Typography>

        <Stack spacing={2.5}>
          <SectionTitle title="Estado del menú público" />

          <SwitchCard
            title="Configuración activa"
            description="Si está inactiva, el menú público seguirá funcionando, pero ocultará portada, galería y redes sociales."
            checked={form.is_active}
            onChange={(val) => onChange("is_active", val)}
            disabled={disabled}
          />

          <SectionTitle title="Color base" />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock
              label="Color hexadecimal"
              help="Ejemplo válido: #FF9800. Este color se usará como color principal del menú del cliente."
              input={
                <TextField
                  value={form.theme_color}
                  onChange={(e) => onChange("theme_color", e.target.value)}
                  placeholder="#FF9800"
                  fullWidth
                  disabled={disabled}
                  error={!colorValid}
                  helperText={!colorValid ? "Usa un color hexadecimal válido. Ej. #FF9800" : " "}
                />
              }
            />

            <Box sx={{ flex: 1, width: "100%" }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "text.primary",
                  mb: 1,
                }}
              >
                Vista del color
              </Typography>

              <Box
                sx={{
                  height: 44,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: colorValid ? form.theme_color : "#FF9800",
                }}
              />

              <Typography
                sx={{
                  mt: 0.75,
                  fontSize: 12,
                  color: "text.secondary",
                  lineHeight: 1.45,
                }}
              >
                El frontend público puede usar este color para botones, acentos y encabezados.
              </Typography>
            </Box>
          </Stack>

          <SectionTitle title="Redes sociales" />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock
              label="Facebook"
              help="Opcional. Déjalo vacío si no aplica."
              input={
                <TextField
                  value={form.facebook_url}
                  onChange={(e) => onChange("facebook_url", e.target.value)}
                  placeholder="https://facebook.com/tu-restaurante"
                  fullWidth
                  disabled={disabled}
                />
              }
            />

            <FieldBlock
              label="Instagram"
              help="Opcional. Déjalo vacío si no aplica."
              input={
                <TextField
                  value={form.instagram_url}
                  onChange={(e) => onChange("instagram_url", e.target.value)}
                  placeholder="https://instagram.com/tu-restaurante"
                  fullWidth
                  disabled={disabled}
                />
              }
            />
          </Stack>

          <FieldBlock
            label="TikTok"
            help="Opcional. Déjalo vacío si no aplica."
            input={
              <TextField
                value={form.tiktok_url}
                onChange={(e) => onChange("tiktok_url", e.target.value)}
                placeholder="https://www.tiktok.com/@tu-restaurante"
                fullWidth
                disabled={disabled}
              />
            }
          />
        </Stack>
      </Stack>
    </Paper>
  );
}

function SectionTitle({ title }) {
  return (
    <Typography
      sx={{
        fontSize: 15,
        fontWeight: 800,
        color: "primary.main",
        pt: 0.5,
      }}
    >
      {title}
    </Typography>
  );
}

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 800,
          color: "text.primary",
          mb: 1,
        }}
      >
        {label}
      </Typography>

      {input}

      {help ? (
        <Typography
          sx={{
            mt: 0.75,
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.45,
          }}
        >
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}

function SwitchCard({ title, description, checked, onChange, disabled }) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.75,
        backgroundColor: "background.default",
      }}
    >
      <Stack spacing={1.25}>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            lineHeight: 1.5,
          }}
        >
          {description}
        </Typography>

        <FormControlLabel
          sx={{ m: 0 }}
          control={
            <Switch
              checked={!!checked}
              onChange={(e) => onChange(e.target.checked)}
              color="primary"
              disabled={disabled}
            />
          }
          label={
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 700,
                color: "text.primary",
              }}
            >
              {checked ? "Activo" : "Inactivo"}
            </Typography>
          }
        />
      </Stack>
    </Box>
  );
}
