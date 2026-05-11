import React from "react";
import {
  Box, Button, Card, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import EventBusyIcon from "@mui/icons-material/EventBusy";

function money(value, currency = "MXN") {
  const n = Number(value || 0);
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency,
  });
}

function dateLabel(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return String(value);
  }
}

function statusLabel(status) {
  if (status === "trialing") return "Prueba";
  if (status === "active") return "Activa";
  if (status === "expired") return "Expirada";
  if (status === "cancelled") return "Cancelada";
  if (status === "pending_payment") return "Pendiente";
  return status || "—";
}

function statusColor(status) {
  if (status === "trialing") return "info";
  if (status === "active") return "success";
  if (status === "expired") return "default";
  if (status === "cancelled") return "error";
  if (status === "pending_payment") return "warning";
  return "default";
}

export default function SystemRestaurantSubscriptionPanel({
  currentSubscription,
  subscriptions = [],
  plans = [],
  loading = false,
  busy = false,
  onAssign,
  onExpireCurrent,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const hasCurrent = !!currentSubscription?.id;

  return (
    <Paper
      sx={{
        p: 0,
        overflow: "hidden",
        borderRadius: 0,
        backgroundColor: "background.paper",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "#fff",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
              Suscripción del restaurante
            </Typography>

            <Typography sx={{ mt: 0.4, fontSize: 13, color: "text.secondary" }}>
              Consulta la suscripción actual, termina la vigente o asigna una nueva.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            {hasCurrent && (
              <Button
                type="button"
                variant="outlined"
                color="error"
                startIcon={<EventBusyIcon />}
                onClick={onExpireCurrent}
                disabled={busy || loading}
                sx={{
                  minWidth: { xs: "100%", sm: 210 },
                  height: 42,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                Terminar actual
              </Button>
            )}

            <Button
              type="button"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAssign}
              disabled={busy || loading || hasCurrent || plans.length === 0}
              sx={{
                minWidth: { xs: "100%", sm: 210 },
                height: 42,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              Asignar suscripción
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
        {hasCurrent ? (
          <Card
            sx={{
              borderRadius: 1,
              boxShadow: "none",
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "#fff",
              mb: 2.5,
            }}
          >
            <Box sx={{ p: 2 }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
              >
                <Stack spacing={0.8}>
                  <Typography sx={{ fontSize: 16, fontWeight: 800 }}>
                    Suscripción actual
                  </Typography>

                  <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                    Plan: <strong>{currentSubscription?.plan?.name || "—"}</strong>
                  </Typography>

                  <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                    Vigencia: {dateLabel(currentSubscription?.starts_at)} -{" "}
                    {dateLabel(currentSubscription?.ends_at)}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={statusLabel(currentSubscription?.status)}
                    color={statusColor(currentSubscription?.status)}
                    size="small"
                    sx={{ fontWeight: 800 }}
                  />

                  <Chip
                    label={money(
                      currentSubscription?.paid_price,
                      currentSubscription?.currency || "MXN"
                    )}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      bgcolor: "#EEF2FF",
                      color: "text.primary",
                    }}
                  />
                </Stack>
              </Stack>
            </Box>
          </Card>
        ) : (
          <Box
            sx={{
              px: 3,
              py: 4,
              mb: 2.5,
              textAlign: "center",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "#fff",
            }}
          >
            <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
              No hay suscripción vigente
            </Typography>

            <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 14 }}>
              Puedes asignar una nueva suscripción para activar el restaurante.
            </Typography>
          </Box>
        )}

        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 800,
            color: "text.primary",
            mb: 1.5,
          }}
        >
          Historial de suscripciones
        </Typography>

        {subscriptions.length === 0 ? (
          <Box sx={{ px: 3, py: 4, textAlign: "center" }}>
            <Typography sx={{ fontSize: 17, fontWeight: 800 }}>
              No hay suscripciones registradas
            </Typography>

            <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 14 }}>
              Cuando se asigne una suscripción aparecerá en este historial.
            </Typography>
          </Box>
        ) : isMobile ? (
          <Stack spacing={1.5}>
            {subscriptions.map((row) => (
              <SubscriptionMobileCard key={row.id} row={row} />
            ))}
          </Stack>
        ) : (
          <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
            <Table sx={{ minWidth: 980 }}>
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      backgroundColor: "primary.main",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 13,
                      borderBottom: "none",
                      whiteSpace: "nowrap",
                    },
                  }}
                >
                  <TableCell>Plan</TableCell>
                  <TableCell>Estatus</TableCell>
                  <TableCell>Inicio</TableCell>
                  <TableCell>Fin</TableCell>
                  <TableCell>Meses</TableCell>
                  <TableCell>Proveedor</TableCell>
                  <TableCell align="right">Importe</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {subscriptions.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      "& td": {
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        fontSize: 14,
                        color: "text.primary",
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    <TableCell>
                      <Stack spacing={0.4}>
                        <Typography sx={{ fontWeight: 800 }}>
                          {row?.plan?.name || "—"}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                          ID: {row.id}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={statusLabel(row.status)}
                        color={statusColor(row.status)}
                        size="small"
                        sx={{ fontWeight: 800 }}
                      />
                    </TableCell>

                    <TableCell>{dateLabel(row.starts_at)}</TableCell>
                    <TableCell>{dateLabel(row.ends_at)}</TableCell>
                    <TableCell>
                      {row.months_paid || 0} pag. / {row.months_granted || 0} ot.
                    </TableCell>
                    <TableCell>{row.provider || "manual"}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>
                      {money(row.paid_price, row.currency || "MXN")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Paper>
  );
}

function SubscriptionMobileCard({ row }) {
  return (
    <Card
      sx={{
        borderRadius: 1,
        boxShadow: "none",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "#fff",
      }}
    >
      <Box sx={{ p: 2 }}>
        <Stack spacing={1.4}>
          <Stack direction="row" spacing={1} justifyContent="space-between">
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 800 }}>
                {row?.plan?.name || "—"}
              </Typography>

              <Typography sx={{ mt: 0.4, fontSize: 12, color: "text.secondary" }}>
                ID: {row.id}
              </Typography>
            </Box>

            <Chip
              label={statusLabel(row.status)}
              color={statusColor(row.status)}
              size="small"
              sx={{ fontWeight: 800, flexShrink: 0 }}
            />
          </Stack>

          <InfoLine label="Inicio" value={dateLabel(row.starts_at)} />
          <InfoLine label="Fin" value={dateLabel(row.ends_at)} />
          <InfoLine
            label="Meses"
            value={`${row.months_paid || 0} pag. / ${row.months_granted || 0} ot.`}
          />
          <InfoLine label="Proveedor" value={row.provider || "manual"} />
          <InfoLine label="Importe" value={money(row.paid_price, row.currency || "MXN")} />
        </Stack>
      </Box>
    </Card>
  );
}

function InfoLine({ label, value }) {
  return (
    <Stack direction="row" spacing={1} justifyContent="space-between">
      <Typography sx={mobileLabelSx}>{label}</Typography>
      <Typography sx={mobileValueSx}>{value}</Typography>
    </Stack>
  );
}

const mobileLabelSx = {
  fontSize: 11,
  fontWeight: 800,
  color: "text.secondary",
  textTransform: "uppercase",
  letterSpacing: 0.3,
};

const mobileValueSx = {
  fontSize: 13,
  color: "text.primary",
  fontWeight: 800,
  textAlign: "right",
  wordBreak: "break-word",
};