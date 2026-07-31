import {
  Box, Button, InputAdornment, Paper, Stack, TextField, Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

export default function BillingRulesFormCard({
  value,
  canSave = false,
  saving = false,
  onChange,
  onSave,
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
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
            Reglas de cuentas
          </Typography>

          <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary", lineHeight: 1.6 }}>
            Define cuántas cuentas o partes pueden existir como máximo dentro
            de un mismo grupo de cobro.
          </Typography>
        </Box>

        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            p: { xs: 2, sm: 2.5 },
            backgroundColor: "background.default",
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary", mb: 1 }}>
            Máximo de cuentas o partes por grupo
          </Typography>

          <TextField
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Ej. 10"
            fullWidth
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
              min: 2,
              max: 20,
              maxLength: 2,
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">cuentas</InputAdornment>
              ),
            }}
          />

          <Typography sx={{ mt: 0.75, fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}>
            El límite debe ser un número entero entre 2 y 20 cuentas o partes.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end">
          <Button
            type="button"
            onClick={onSave}
            disabled={!canSave || saving}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{
              width: { xs: "100%", sm: "auto" },
              minWidth: { sm: 220 },
              height: 44,
              fontWeight: 800,
            }}
          >
            {saving ? "Guardando…" : "Guardar configuración"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
