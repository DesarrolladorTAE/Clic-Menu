import React from "react";
import {
  Box, Card, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, useMediaQuery,
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

function ownerName(owner) {
  if (owner?.full_name) return owner.full_name;

  return [
    owner?.name,
    owner?.last_name_paternal,
    owner?.last_name_maternal,
  ]
    .filter(Boolean)
    .join(" ");
}

function recordedByName(user) {
  return [
    user?.name,
    user?.last_name_paternal,
    user?.last_name_maternal,
  ]
    .filter(Boolean)
    .join(" ");
}

function dateText(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("es-MX", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sourceLabel(source) {
  if (source === "manual") return "Manual";
  if (source === "internal") return "Interno / pruebas";
  return "—";
}

function panelTitle(period) {
  if (period?.period === "all") return "Historial de complementos";
  if (period?.period === "year") return "Movimientos de complementos del año";
  return "Movimientos de complementos del mes";
}

function sourceChipSx(source) {
  if (source === "manual") {
    return {
      fontWeight: 800,
      bgcolor: "primary.main",
      color: "#fff",
    };
  }

  return {
    fontWeight: 800,
    bgcolor: "#EEF2FF",
    color: "#3F3A52",
  };
}

export default function SystemAddonSalesListPanel({
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
            No hay movimientos registrados
          </Typography>

          <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 14 }}>
            Cambia el periodo o los filtros para consultar otra información.
          </Typography>
        </Box>
      ) : (
        <>
          {isMobile ? <SalesMobileCards rows={rows} /> : <SalesDesktopTable rows={rows} />}

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
            itemLabel="movimientos"
          />
        </>
      )}
    </Paper>
  );
}

function SalesDesktopTable({ rows }) {
  return (
    <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
      <Table sx={{ minWidth: 1180 }}>
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
            <TableCell>Complemento</TableCell>
            <TableCell>Propietario</TableCell>
            <TableCell>Restaurante / sucursal</TableCell>
            <TableCell>Origen</TableCell>
            <TableCell>Meses</TableCell>
            <TableCell align="right">Importe</TableCell>
            <TableCell>Registro</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => (
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
                    {row?.addon?.name || "—"}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    Precio mensual: {money(row.monthly_price, row.currency || "MXN")}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell>
                <Stack spacing={0.4}>
                  <Typography sx={{ fontWeight: 800 }}>
                    {ownerName(row?.owner) || "—"}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    {row?.owner?.email || "Sin correo"}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell>
                <Stack spacing={0.4}>
                  <Typography sx={{ fontWeight: 800 }}>
                    {row?.restaurant?.trade_name || "—"}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    {row?.branch?.name || "Sin sucursal"}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell>
                <Chip
                  label={sourceLabel(row.source)}
                  size="small"
                  sx={sourceChipSx(row.source)}
                />
              </TableCell>

              <TableCell>
                <Stack spacing={0.3}>
                  <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                    {Number(row.months_paid || 0)} pagados
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    {Number(row.months_granted || 0)} otorgados
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell align="right">
                <Typography sx={{ fontWeight: 900 }}>
                  {money(row.paid_price, row.currency || "MXN")}
                </Typography>
              </TableCell>

              <TableCell>
                <Stack spacing={0.3}>
                  <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                    {dateText(row.paid_at)}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    Registró: {recordedByName(row?.recorded_by) || "—"}
                  </Typography>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function SalesMobileCards({ rows }) {
  return (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      {rows.map((row) => (
        <Card
          key={row.id}
          sx={{
            width: "100%",
            minHeight: 330,
            borderRadius: 1,
            boxShadow: "none",
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "#fff",
          }}
        >
          <Box sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={mobileTitleSx}>
                    {row?.addon?.name || "Complemento"}
                  </Typography>

                  <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
                    {row?.restaurant?.trade_name || "Sin restaurante"}
                  </Typography>
                </Box>

                <Chip
                  label={sourceLabel(row.source)}
                  size="small"
                  sx={{ ...sourceChipSx(row.source), flexShrink: 0 }}
                />
              </Stack>

              <InfoBlock label="Sucursal" value={row?.branch?.name || "—"} />
              <InfoBlock label="Propietario" value={ownerName(row?.owner) || "—"} />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 1.5,
                }}
              >
                <InfoBlock label="Meses pagados" value={Number(row.months_paid || 0)} />
                <InfoBlock label="Meses otorgados" value={Number(row.months_granted || 0)} />
              </Box>

              <InfoBlock
                label="Precio mensual"
                value={money(row.monthly_price, row.currency || "MXN")}
              />

              <Box>
                <Typography sx={mobileLabelSx}>Importe</Typography>
                <Typography sx={{ mt: 0.25, fontSize: 20, color: "text.primary", fontWeight: 900 }}>
                  {money(row.paid_price, row.currency || "MXN")}
                </Typography>
              </Box>

              <InfoBlock label="Fecha" value={dateText(row.paid_at)} />
              <InfoBlock label="Registrado por" value={recordedByName(row?.recorded_by) || "—"} />
            </Stack>
          </Box>
        </Card>
      ))}
    </Stack>
  );
}

function InfoBlock({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={mobileLabelSx}>{label}</Typography>
      <Typography sx={mobileValueSx}>{value}</Typography>
    </Box>
  );
}

const mobileTitleSx = {
  fontSize: 15,
  fontWeight: 800,
  color: "text.primary",
  lineHeight: 1.3,
  wordBreak: "break-word",
};

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