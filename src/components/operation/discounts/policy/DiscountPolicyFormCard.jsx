import {
  Box, Button, FormControlLabel, MenuItem, Paper, Stack, Switch, TextField, Typography,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";

export default function DiscountPolicyFormCard({
  form,
  hasPolicy = false,
  canSave = false,
  saving = false,
  deleting = false,
  onChange,
  onSave,
  onDelete,
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
          Política de descuentos
        </Typography>

        <Stack spacing={2.5}>
          <SectionTitle title="Límites permitidos" />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock
              label="Porcentaje máximo sin autorización"
              help="Si el descuento supera este porcentaje, se aplicará la acción configurada."
              input={
                <TextField
                  type="number"
                  value={form.max_discount_percent}
                  onChange={(e) =>
                    onChange("max_discount_percent", e.target.value)
                  }
                  fullWidth
                  inputProps={{
                    min: 0,
                    max: 100,
                    step: 1,
                  }}
                />
              }
            />

            <FieldBlock
              label="Monto máximo sin autorización"
              help="Monto máximo permitido antes de bloquear o pedir autorización."
              input={
                <TextField
                  type="number"
                  value={form.max_discount_amount}
                  onChange={(e) =>
                    onChange("max_discount_amount", e.target.value)
                  }
                  fullWidth
                  inputProps={{
                    min: 0,
                    step: 1,
                  }}
                />
              }
            />
          </Stack>

          <SectionTitle title="Comportamiento en caja" />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock
              label="Modo de captura"
              help="Por ahora la política aplica sobre descuentos capturados por caja."
              input={
                <TextField
                  select
                  value={form.discount_capture_mode}
                  onChange={(e) =>
                    onChange("discount_capture_mode", e.target.value)
                  }
                  fullWidth
                  SelectProps={{
                    IconComponent: KeyboardArrowDownIcon,
                  }}
                >
                  <MenuItem value="cashier">Caja</MenuItem>
                </TextField>
              }
            />

            <FieldBlock
              label="Cuando el descuento excede el límite"
              help="Puedes bloquear el descuento o solicitar autorización con PIN."
              input={
                <TextField
                  select
                  value={form.exceeded_discount_action}
                  onChange={(e) =>
                    onChange("exceeded_discount_action", e.target.value)
                  }
                  fullWidth
                  SelectProps={{
                    IconComponent: KeyboardArrowDownIcon,
                  }}
                >
                  <MenuItem value="authorize">Solicitar autorización</MenuItem>
                  <MenuItem value="block">Bloquear descuento</MenuItem>
                </TextField>
              }
            />
          </Stack>

          <SectionTitle title="Reglas adicionales" />

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            useFlexGap
            flexWrap="wrap"
          >
            <SwitchCard
              title="Motivo obligatorio"
              description="Caja deberá capturar un motivo para aplicar descuentos."
              checked={form.reason_required}
              onChange={(val) => onChange("reason_required", val)}
            />

            <SwitchCard
              title="Política activa"
              description="Si se desactiva, caja vuelve a trabajar sin límites ni autorización."
              checked={form.is_active}
              onChange={(val) => onChange("is_active", val)}
            />
          </Stack>

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            justifyContent="space-between"
            spacing={1.5}
            pt={1}
          >
            <Button
              type="button"
              onClick={onDelete}
              disabled={!hasPolicy || deleting || saving}
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 190 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              {deleting ? "Eliminando…" : "Eliminar política"}
            </Button>

            <Button
              type="button"
              onClick={onSave}
              disabled={!canSave || saving || deleting}
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 190 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              {saving ? "Guardando…" : "Guardar política"}
            </Button>
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

function SwitchCard({ title, description, checked, onChange }) {
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
