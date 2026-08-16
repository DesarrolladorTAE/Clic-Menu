import {
  Box, Button, Paper, Stack, TextField, Typography,
} from "@mui/material";

import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

export default function TransferSettingsCard({
  form,
  saving = false,
  hasChanges = false,
  onChange,
  onSave,
  onDiscard,
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
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255, 152, 0, 0.12)",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            <AccountBalanceRoundedIcon />
          </Box>

          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
              Datos para transferencia
            </Typography>

            <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
              Configura la información que podrá visualizar el cliente en su url de seguimiento.
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            p: 1.75,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            backgroundColor: "background.default",
          }}
        >
          <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
            <Box component="span" sx={{ fontWeight: 800, color: "text.primary" }}>
              Todos estos datos son opcionales.
            </Box>{" "}
            Puedes ofrecer transferencia aunque todavía no captures información bancaria.
          </Typography>
        </Box>

        <Stack spacing={2.5}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock
              label="Banco"
              help="Opcional."
              input={
                <TextField
                  value={form?.bank_name ?? ""}
                  onChange={(event) => onChange("bank_name", event.target.value)}
                  placeholder="Ej. BBVA"
                  inputProps={{ maxLength: 150 }}
                />
              }
            />

            <FieldBlock
              label="Beneficiario"
              help="Nombre de la persona o empresa que recibirá la transferencia."
              input={
                <TextField
                  value={form?.beneficiary_name ?? ""}
                  onChange={(event) => onChange("beneficiary_name", event.target.value)}
                  placeholder="Ej. Restaurante Ejemplo"
                  inputProps={{ maxLength: 180 }}
                />
              }
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock
              label="Número de cuenta"
              help="Opcional."
              input={
                <TextField
                  value={form?.account_number ?? ""}
                  onChange={(event) => onChange("account_number", event.target.value)}
                  placeholder="Ej. 0123456789"
                  inputProps={{ maxLength: 50 }}
                />
              }
            />

            <FieldBlock
              label="CLABE"
              help="Opcional."
              input={
                <TextField
                  value={form?.clabe ?? ""}
                  onChange={(event) => onChange("clabe", event.target.value)}
                  placeholder="Ej. 012345678901234567"
                  inputProps={{ maxLength: 30 }}
                />
              }
            />
          </Stack>

          <FieldBlock
            label="Instrucciones bancarias"
            help="Opcional. Puedes indicar referencias o consideraciones adicionales para realizar la transferencia."
            input={
              <TextField
                multiline
                minRows={3}
                value={form?.instructions ?? ""}
                onChange={(event) => onChange("instructions", event.target.value)}
                placeholder="Ej. Incluye tu número de pedido en el concepto de la transferencia."
              />
            }
          />

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            justifyContent="flex-end"
            spacing={1.5}
          >
            <Button
              type="button"
              variant="outlined"
              startIcon={<RestartAltRoundedIcon />}
              onClick={onDiscard}
              disabled={!hasChanges || saving}
              sx={{ minWidth: { xs: "100%", sm: 190 }, height: 44 }}
            >
              Descartar cambios
            </Button>

            <Button
              type="button"
              variant="contained"
              startIcon={<SaveOutlinedIcon />}
              onClick={onSave}
              disabled={!hasChanges || saving}
              sx={{ minWidth: { xs: "100%", sm: 220 }, height: 44, fontWeight: 800 }}
            >
              {saving ? "Guardando…" : "Guardar datos de transferencia"}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary", mb: 1 }}>
        {label}
      </Typography>

      {input}

      {help ? (
        <Typography sx={{ mt: 0.75, fontSize: 12, color: "text.secondary", lineHeight: 1.45 }}>
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}
