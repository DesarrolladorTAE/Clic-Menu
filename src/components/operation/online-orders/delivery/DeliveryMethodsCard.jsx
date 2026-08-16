import {
  Box, Button, FormControlLabel, Paper, Stack, Switch, TextField, Typography,
} from "@mui/material";

import StoreMallDirectoryRoundedIcon from "@mui/icons-material/StoreMallDirectoryRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";

const META = {
  pickup: {
    title: "Recoger en sucursal",
    description: "El cliente recoge su pedido directamente en la sucursal.",
    icon: <StoreMallDirectoryRoundedIcon />,
  },
  home_delivery: {
    title: "Envío a domicilio",
    description: "El pedido se entrega en una zona o código postal configurado.",
    icon: <LocalShippingRoundedIcon />,
  },
  internal_location: {
    title: "Ubicación interna",
    description: "Entrega dentro del establecimiento, complejo, hotel u otra área interna.",
    icon: <MeetingRoomRoundedIcon />,
  },
  scheduled_point: {
    title: "Punto programado",
    description: "El cliente selecciona un punto y horario previamente configurado.",
    icon: <EventAvailableRoundedIcon />,
  },
};

const TYPES = [
  "pickup",
  "home_delivery",
  "internal_location",
  "scheduled_point",
];

function cleanMoney(value) {
  let result = String(value || "").replace(",", ".").replace(/[^\d.]/g, "");
  const firstDot = result.indexOf(".");

  if (firstDot >= 0) {
    result =
      result.slice(0, firstDot + 1) +
      result.slice(firstDot + 1).replace(/\./g, "");

    const [whole, decimal = ""] = result.split(".");
    result = `${whole}.${decimal.slice(0, 2)}`;
  }

  return result;
}

function cleanInteger(value) {
  return String(value || "").replace(/\D/g, "");
}

export default function DeliveryMethodsCard({
  items,
  saving,
  hasChanges,
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
            Formas de entrega
          </Typography>

          <Typography sx={{ mt: 0.6, fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
            Habilita las opciones que ofrecerás a tus clientes y define sus reglas principales.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
            },
            gap: 1.5,
            alignItems: "stretch",
          }}
        >
          {TYPES.map((type) => (
            <DeliveryMethodCard
              key={type}
              type={type}
              row={items[type]}
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
            {saving ? "Guardando…" : "Guardar formas de entrega"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

function DeliveryMethodCard({ type, row, onChange }) {
  const meta = META[type];
  const scheduledPoint = type === "scheduled_point";

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
      <Stack spacing={2.25} height="100%">
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
            {meta.icon}
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary" }}>
              {meta.title}
            </Typography>

            <Typography sx={{ mt: 0.4, fontSize: 12.5, color: "text.secondary", lineHeight: 1.45 }}>
              {meta.description}
            </Typography>
          </Box>

          <Switch
            checked={!!row?.is_enabled}
            onChange={(event) => onChange(type, "is_enabled", event.target.checked)}
            color="primary"
          />
        </Stack>

        <FieldBlock
          label="Pedido mínimo"
          help="Opcional. Déjalo vacío si no deseas exigir un importe mínimo."
          input={
            <TextField
              type="text"
              value={row?.minimum_order_amount ?? ""}
              onChange={(event) =>
                onChange(type, "minimum_order_amount", cleanMoney(event.target.value))
              }
              placeholder="Ej. 150.00"
              inputProps={{ inputMode: "decimal" }}
            />
          }
        />

        {scheduledPoint ? (
          <Box
            sx={{
              p: 1.5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "background.paper",
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary" }}>
              Solo mediante programación
            </Typography>

            <Typography sx={{ mt: 0.5, fontSize: 12, color: "text.secondary", lineHeight: 1.45 }}>
              Los puntos programados siempre requieren que el cliente seleccione una fecha y horario disponibles.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
              Disponibilidad
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <FormControlLabel
                sx={{ m: 0, flex: 1 }}
                control={
                  <Switch
                    checked={!!row?.allows_asap}
                    onChange={(event) =>
                      onChange(type, "allows_asap", event.target.checked)
                    }
                    color="primary"
                  />
                }
                label={
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>
                    Lo antes posible
                  </Typography>
                }
              />

              <FormControlLabel
                sx={{ m: 0, flex: 1 }}
                control={
                  <Switch
                    checked={!!row?.allows_scheduling}
                    onChange={(event) =>
                      onChange(type, "allows_scheduling", event.target.checked)
                    }
                    color="primary"
                  />
                }
                label={
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>
                    Programado
                  </Typography>
                }
              />
            </Stack>
          </Stack>
        )}

        {row?.allows_scheduling ? (
          <FieldBlock
            label="Anticipación mínima"
            help="Minutos mínimos que deberá respetar el cliente antes del horario solicitado."
            input={
              <TextField
                type="text"
                value={row?.minimum_lead_minutes ?? ""}
                onChange={(event) =>
                  onChange(
                    type,
                    "minimum_lead_minutes",
                    cleanInteger(event.target.value)
                  )
                }
                placeholder="Ej. 30"
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              />
            }
          />
        ) : null}
      </Stack>
    </Box>
  );
}

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ width: "100%" }}>
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
