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

export default function CustomerLoyaltySettingsFormCard({
  form,
  onChange,
  disabled = false,
  preview = null,
}) {
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
          Configuración del programa
        </Typography>

        <Stack spacing={2.5}>
          <SectionTitle title="Estado general" />

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            useFlexGap
            flexWrap="wrap"
          >
            <SwitchCard
              title="Programa activo"
              description="Si está desactivado, las ventas no generarán puntos aunque tengan cliente asociado."
              checked={form.is_enabled}
              onChange={(val) => onChange("is_enabled", val)}
              disabled={disabled}
            />
          </Stack>

          <SectionTitle title="Regla de acumulación" />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock
              label="Modo de acumulación"
              help="Por ahora el sistema trabaja con la regla de puntos por monto."
              input={
                <TextField
                  select
                  value={form.earn_mode}
                  onChange={(e) => onChange("earn_mode", e.target.value)}
                  fullWidth
                  disabled={disabled}
                  SelectProps={{
                    IconComponent: KeyboardArrowDownIcon,
                  }}
                >
                  <MenuItem value="amount_ratio">Puntos por monto</MenuItem>
                </TextField>
              }
            />

            <FieldBlock
              label="Monto base"
              help="Monto de referencia para calcular los puntos."
              input={
                <TextField
                  type="number"
                  value={form.earn_rate_amount}
                  onChange={(e) => onChange("earn_rate_amount", e.target.value)}
                  placeholder="Ej. 10"
                  fullWidth
                  disabled={disabled}
                  inputProps={{ min: 0.01, step: "0.01" }}
                />
              }
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock
              label="Puntos por monto base"
              help="Cuántos puntos se ganan por cada monto base."
              input={
                <TextField
                  type="number"
                  value={form.points_per_rate}
                  onChange={(e) => onChange("points_per_rate", e.target.value)}
                  placeholder="Ej. 1"
                  fullWidth
                  disabled={disabled}
                  inputProps={{ min: 1, step: "1" }}
                />
              }
            />

            <FieldBlock
              label="Compra mínima"
              help="Monto mínimo para que una venta pueda generar puntos."
              input={
                <TextField
                  type="number"
                  value={form.minimum_purchase_amount}
                  onChange={(e) =>
                    onChange("minimum_purchase_amount", e.target.value)
                  }
                  placeholder="Ej. 0"
                  fullWidth
                  disabled={disabled}
                  inputProps={{ min: 0, step: "0.01" }}
                />
              }
            />
          </Stack>

          <SectionTitle title="Restricciones y cálculo" />

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            useFlexGap
            flexWrap="wrap"
          >
            <SwitchCard
              title="Excluir propina"
              description="La propina no formará parte del monto que genera puntos."
              checked={form.exclude_tip}
              onChange={(val) => onChange("exclude_tip", val)}
              disabled={disabled}
            />

            <SwitchCard
              title="Excluir impuestos"
              description="Los impuestos no formarán parte del monto que genera puntos."
              checked={form.exclude_tax}
              onChange={(val) => onChange("exclude_tax", val)}
              disabled={disabled}
            />

            <SwitchCard
              title="Permitir ventas con descuento"
              description="Si se desactiva, las ventas con descuento no acumularán puntos."
              checked={form.allow_points_on_discounted_sales}
              onChange={(val) =>
                onChange("allow_points_on_discounted_sales", val)
              }
              disabled={disabled}
            />
          </Stack>

          <SectionTitle title="Modo de redondeo" />

          <FieldBlock
            label="Redondeo"
            help="Define cómo se redondean los puntos calculados."
            input={
              <TextField
                select
                value={form.rounding_mode}
                onChange={(e) => onChange("rounding_mode", e.target.value)}
                fullWidth
                disabled={disabled}
                SelectProps={{
                  IconComponent: KeyboardArrowDownIcon,
                }}
              >
                <MenuItem value="floor">Floor (hacia abajo)</MenuItem>
                <MenuItem value="round">Round (normal)</MenuItem>
                <MenuItem value="ceil">Ceil (hacia arriba)</MenuItem>
              </TextField>
            }
          />

          <SectionTitle title="Vista previa" />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock
              label="Venta ejemplo"
              help="Solo afecta la vista previa, no la configuración real."
              input={
                <TextField
                  type="number"
                  value={form.preview_sale_total}
                  onChange={(e) => onChange("preview_sale_total", e.target.value)}
                  placeholder="Ej. 150"
                  fullWidth
                  disabled={disabled}
                  inputProps={{ min: 0, step: "0.01" }}
                />
              }
            />

            <FieldBlock
              label="Propina ejemplo"
              help="Usada para simular si la propina entra o no al cálculo."
              input={
                <TextField
                  type="number"
                  value={form.preview_tip}
                  onChange={(e) => onChange("preview_tip", e.target.value)}
                  placeholder="Ej. 0"
                  fullWidth
                  disabled={disabled}
                  inputProps={{ min: 0, step: "0.01" }}
                />
              }
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock
              label="Impuesto ejemplo"
              help="Usado en la vista previa cuando excluyes impuestos."
              input={
                <TextField
                  type="number"
                  value={form.preview_tax_total}
                  onChange={(e) =>
                    onChange("preview_tax_total", e.target.value)
                  }
                  placeholder="Ej. 0"
                  fullWidth
                  disabled={disabled}
                  inputProps={{ min: 0, step: "0.01" }}
                />
              }
            />

            <FieldBlock
              label="Descuento ejemplo"
              help="Útil para revisar qué pasa si la venta tiene descuento."
              input={
                <TextField
                  type="number"
                  value={form.preview_discount_total}
                  onChange={(e) =>
                    onChange("preview_discount_total", e.target.value)
                  }
                  placeholder="Ej. 0"
                  fullWidth
                  disabled={disabled}
                  inputProps={{ min: 0, step: "0.01" }}
                />
              }
            />
          </Stack>

          <PreviewResultCard preview={preview} />
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

function PreviewResultCard({ preview }) {
  const points = Number(preview?.points ?? 0);
  const eligibleAmount = Number(preview?.eligible_amount ?? 0);
  const reason = preview?.reason || "SIN_DATOS";

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 2,
        backgroundColor: "background.default",
      }}
    >
      <Stack spacing={1}>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          Resultado de la vista previa
        </Typography>

        <Typography
          sx={{
            fontSize: 14,
            color: "text.primary",
            lineHeight: 1.6,
          }}
        >
          Con esta configuración, la venta ejemplo genera{" "}
          <Box component="span" sx={{ fontWeight: 800, color: "primary.main" }}>
            {points} punto{points === 1 ? "" : "s"}
          </Box>
          .
        </Typography>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            lineHeight: 1.5,
          }}
        >
          Monto elegible calculado: ${eligibleAmount.toFixed(2)} · Estado: {reason}
        </Typography>
      </Stack>
    </Box>
  );
}
