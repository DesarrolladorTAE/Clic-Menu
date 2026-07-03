import React from "react";
import {
  Box, Card, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import PaginationFooter from "../../common/PaginationFooter";

function money(value, currency = "MXN") {
  const n = Number(value || 0);

  return n.toLocaleString("es-MX", {
    style: "currency",
    currency,
  });
}

function fullName(owner) {
  return [
    owner?.name,
    owner?.last_name_paternal,
    owner?.last_name_maternal,
  ]
    .filter(Boolean)
    .join(" ");
}

function dateText(value) {
  if (!value) return "—";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function isExpiredByDate(row) {
  if (!row?.ends_at) return false;

  const endsAt = new Date(row.ends_at);
  if (Number.isNaN(endsAt.getTime())) return false;

  return endsAt.getTime() < Date.now();
}

function isFutureSubscription(row) {
  if (!row?.starts_at) return false;

  const startsAt = new Date(row.starts_at);
  if (Number.isNaN(startsAt.getTime())) return false;

  return row.status === "active" && startsAt.getTime() > Date.now();
}

function statusLabel(row) {
  if (row?.status === "expired" || isExpiredByDate(row)) return "Expirada";
  if (isFutureSubscription(row)) return "Futura";
  if (row?.status === "trialing") return "Demo";
  if (row?.status === "active") return "Activa";
  if (row?.status === "cancelled") return "Cancelada";
  if (row?.status === "pending_payment") return "Pendiente";
  return row?.status || "—";
}

function statusColor(row) {
  if (row?.status === "expired" || isExpiredByDate(row)) return "default";
  if (isFutureSubscription(row)) return "info";
  if (row?.status === "active") return "success";
  if (row?.status === "trialing") return "info";
  if (row?.status === "pending_payment") return "warning";
  if (row?.status === "cancelled") return "default";
  return "default";
}

function panelTitle(period) {
  if (period?.period === "all") return "Todas las suscripciones";
  if (period?.period === "year") return "Suscripciones del año";
  return "Suscripciones del mes";
}

export default function SystemSubscriptionSalesListPanel({
  rows = [],
  period = null,
  pagination,
  onPrev,
  onNext,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
        <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
          {panelTitle(period)}
        </Typography>
      </Box>

      {rows.length === 0 ? (
        <Box sx={{ px: 3, py: 5, textAlign: "center" }}>
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
            No hay ventas registradas
          </Typography>

          <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 14 }}>
            Cambia el mes o los filtros para consultar otra información.
          </Typography>
        </Box>
      ) : (
        <>
          {isMobile ? (
            <SalesMobileCards rows={rows} />
          ) : (
            <SalesDesktopTable rows={rows} />
          )}

          <PaginationFooter
            page={pagination.page}
            totalPages={pagination.totalPages}
            startItem={pagination.startItem}
            endItem={pagination.endItem}
            total={pagination.total}
            hasPrev={pagination.hasPrev}
            hasNext={pagination.hasNext}
            onPrev={onPrev}
            onNext={onNext}
            itemLabel="suscripciones"
          />
        </>
      )}
    </Paper>
  );
}

function SalesDesktopTable({ rows }) {
  return (
    <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
      <Table sx={{ minWidth: 1100 }}>
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
            <TableCell>Propietario</TableCell>
            <TableCell>Restaurante</TableCell>
            <TableCell>Plan</TableCell>
            <TableCell>Periodo</TableCell>
            <TableCell>Proveedor</TableCell>
            <TableCell>Estatus</TableCell>
            <TableCell align="right">Venta</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => {
            const owner = row?.restaurant?.owner;

            return (
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
                  <Stack spacing={0.5}>
                    <Typography sx={{ fontWeight: 800 }}>
                      {fullName(owner) || "—"}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      {owner?.email || "Sin correo"}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>{row?.restaurant?.trade_name || "—"}</TableCell>

                <TableCell>
                  <Chip
                    label={row?.plan?.name || "—"}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      bgcolor: "#EEF2FF",
                      color: "#3F3A52",
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Stack spacing={0.3}>
                    <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                      {dateText(row.starts_at)}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      al {dateText(row.ends_at)}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack spacing={0.3}>
                    <Typography sx={{ fontWeight: 800 }}>
                      {row.provider || "manual"}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      {row.provider_ref || "Sin referencia"}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Chip
                    label={statusLabel(row)}
                    color={statusColor(row)}
                    size="small"
                    sx={{ fontWeight: 800 }}
                  />
                </TableCell>

                <TableCell align="right" sx={{ fontWeight: 900 }}>
                  {money(row.paid_price, row.currency || "MXN")}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function SalesMobileCards({ rows }) {
  return (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      {rows.map((row) => {
        const owner = row?.restaurant?.owner;

        return (
          <Card
            key={row.id}
            sx={{
              borderRadius: 1,
              boxShadow: "none",
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "#fff",
            }}
          >
            <Box sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "text.primary",
                        lineHeight: 1.3,
                        wordBreak: "break-word",
                      }}
                    >
                      {row?.restaurant?.trade_name || "Restaurante"}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontSize: 13,
                        color: "text.secondary",
                        wordBreak: "break-word",
                      }}
                    >
                      {fullName(owner) || "Sin propietario"}
                    </Typography>
                  </Box>

                  <Chip
                    label={statusLabel(row)}
                    color={statusColor(row)}
                    size="small"
                    sx={{ fontWeight: 800, flexShrink: 0 }}
                  />
                </Stack>

                <Box>
                  <Typography sx={mobileLabelSx}>Plan</Typography>
                  <Typography sx={mobileValueSx}>{row?.plan?.name || "—"}</Typography>
                </Box>

                <Box>
                  <Typography sx={mobileLabelSx}>Periodo</Typography>
                  <Typography sx={mobileValueSx}>
                    {dateText(row.starts_at)} al {dateText(row.ends_at)}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={mobileLabelSx}>Proveedor</Typography>
                  <Typography sx={mobileValueSx}>
                    {row.provider || "manual"} · {row.provider_ref || "Sin referencia"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={mobileLabelSx}>Venta</Typography>
                  <Typography
                    sx={{
                      mt: 0.25,
                      fontSize: 18,
                      color: "text.primary",
                      fontWeight: 900,
                    }}
                  >
                    {money(row.paid_price, row.currency || "MXN")}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Card>
        );
      })}
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
  mt: 0.25,
  fontSize: 14,
  color: "text.primary",
  wordBreak: "break-word",
};