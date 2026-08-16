import {
  Box, Button, Paper, Stack, Switch, TextField, Typography,
} from "@mui/material";

import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

const PAYMENT_METHODS = [
  {
    type: "cash",
    title: "Efectivo",
    description: "El cliente paga en efectivo al recibir o recoger su pedido.",
    icon: <PaymentsRoundedIcon />,
  },
  {
    type: "transfer",
    title: "Transferencia",
    description: "El cliente realiza una transferencia con los datos que configures.",
    icon: <AccountBalanceRoundedIcon />,
  },
  {
    type: "terminal",
    title: "Terminal física",
    description: "El cobro se realiza con una terminal física al entregar o recoger el pedido.",
    icon: <PointOfSaleRoundedIcon />,
  },
];

export default function PaymentMethodsCard({
  payments,
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
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
            Métodos de pago
          </Typography>

          <Typography sx={{ mt: 0.6, fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
            Selecciona las formas de pago que estarán disponibles para los pedidos de esta sucursal.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: 1.5,
            alignItems: "stretch",
          }}
        >
          {PAYMENT_METHODS.map((method) => (
            <PaymentMethodCard
              key={method.type}
              method={method}
              row={payments?.[method.type]}
              onChange={onChange}
            />
          ))}
        </Box>

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
            sx={{ minWidth: { xs: "100%", sm: 210 }, height: 44, fontWeight: 800 }}
          >
            {saving ? "Guardando…" : "Guardar métodos de pago"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

function PaymentMethodCard({ method, row, onChange }) {
  return (
    <Box
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: { xs: 1.75, sm: 2 },
        backgroundColor: "background.default",
      }}
    >
      <Stack spacing={2} height="100%">
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
            {method.icon}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary" }}>
              {method.title}
            </Typography>

            <Typography
              sx={{
                mt: 0.4,
                fontSize: 12.5,
                color: "text.secondary",
                lineHeight: 1.45,
                minHeight: { md: 54 },
              }}
            >
              {method.description}
            </Typography>
          </Box>

          <Switch
            checked={!!row?.is_enabled}
            onChange={(event) =>
              onChange(method.type, "is_enabled", event.target.checked)
            }
            color="primary"
          />
        </Stack>

        <Box sx={{ mt: "auto" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary", mb: 1 }}>
            Indicaciones para el cliente
          </Typography>

          <TextField
            multiline
            minRows={3}
            value={row?.instructions ?? ""}
            onChange={(event) =>
              onChange(method.type, "instructions", event.target.value)
            }
            placeholder="Opcional"
          />

          <Typography sx={{ mt: 0.75, fontSize: 12, color: "text.secondary", lineHeight: 1.45 }}>
            Opcional. Agrega una indicación adicional que el cliente deba considerar al elegir este método.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}