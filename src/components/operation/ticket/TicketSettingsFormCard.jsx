import {
  Box,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function TicketSettingsFormCard({
  form,
  onChange,
  disabled = false,
}) {
  const isPattern = form.folio_mode === "pattern";

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
          Formato del ticket
        </Typography>

        <Stack spacing={2.5}>
          <SectionTitle title="Contenido del ticket" />

          <FieldBlock
            label="Dirección"
            help="Esta dirección se mostrará en el encabezado del ticket."
            input={
              <TextField
                value={form.address}
                onChange={(e) => onChange("address", e.target.value)}
                placeholder="Ej. Av. Principal 123, Col. Centro"
                fullWidth
                disabled={disabled}
              />
            }
          />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock
              label="Mensaje 1"
              help="Se mostrará al final del ticket."
              input={
                <TextField
                  value={form.message_1}
                  onChange={(e) => onChange("message_1", e.target.value)}
                  placeholder="Ej. Gracias por su compra"
                  fullWidth
                  disabled={disabled}
                />
              }
            />

            <FieldBlock
              label="Mensaje 2"
              help="Opcional. Puedes usarlo para avisos o despedida."
              input={
                <TextField
                  value={form.message_2}
                  onChange={(e) => onChange("message_2", e.target.value)}
                  placeholder="Ej. Vuelva pronto"
                  fullWidth
                  disabled={disabled}
                />
              }
            />
          </Stack>

          <SectionTitle title="Elementos visuales" />

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            useFlexGap
            flexWrap="wrap"
          >
            <SwitchCard
              title="Mostrar logo"
              description="Usa el logo activo de la sucursal."
              checked={form.show_logo}
              onChange={(val) => onChange("show_logo", val)}
              disabled={disabled}
            />

            <SwitchCard
              title="Mostrar QR"
              description="Inserta un QR del menú si existe uno activo."
              checked={form.show_qr}
              onChange={(val) => onChange("show_qr", val)}
              disabled={disabled}
            />

            <SwitchCard
              title="Mostrar IVA"
              description="Muestra el desglose de impuestos en el ticket."
              checked={form.show_iva}
              onChange={(val) => onChange("show_iva", val)}
              disabled={disabled}
            />
          </Stack>

          <SectionTitle title="Formato y folio" />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock
              label="Ancho del papel"
              help="Controla la apariencia general del ticket."
              input={
                <TextField
                  select
                  value={form.paper_width}
                  onChange={(e) => onChange("paper_width", e.target.value)}
                  fullWidth
                  disabled={disabled}
                  SelectProps={{
                    IconComponent: KeyboardArrowDownIcon,
                  }}
                >
                  <MenuItem value="58mm">58 mm</MenuItem>
                  <MenuItem value="80mm">80 mm</MenuItem>
                </TextField>
              }
            />

            <FieldBlock
              label="Modo de folio"
              help="Secuencial usa solo el número. Pattern aplica prefijo y padding."
              input={
                <TextField
                  select
                  value={form.folio_mode}
                  onChange={(e) => onChange("folio_mode", e.target.value)}
                  fullWidth
                  disabled={disabled}
                  SelectProps={{
                    IconComponent: KeyboardArrowDownIcon,
                  }}
                >
                  <MenuItem value="sequential">Secuencial</MenuItem>
                  <MenuItem value="pattern">Pattern / Prefijo</MenuItem>
                </TextField>
              }
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock
              label="Prefijo"
              help={
                isPattern
                  ? "Ej. SUC-"
                  : "Solo se usará si el modo de folio es pattern."
              }
              input={
                <TextField
                  value={form.folio_prefix}
                  onChange={(e) => onChange("folio_prefix", e.target.value)}
                  placeholder="Ej. SUC-"
                  fullWidth
                  disabled={disabled || !isPattern}
                />
              }
            />

            <FieldBlock
              label="Padding"
              help="Cantidad de ceros a la izquierda cuando el modo sea pattern."
              input={
                <TextField
                  type="number"
                  value={form.folio_padding}
                  onChange={(e) => onChange("folio_padding", e.target.value)}
                  fullWidth
                  disabled={disabled}
                  inputProps={{ min: 1, max: 20 }}
                />
              }
            />
          </Stack>
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
        flex: "1 1 260px",
        minWidth: 240,
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
            minHeight: 40,
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
