import {
  Box, Card, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import PaginationFooter from "../../common/PaginationFooter";

function formatMoney(value, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function sourceConfig(source) {
  if (source === "manual") {
    return {
      label: "Comercial",
      color: "success",
    };
  }

  if (source === "internal") {
    return {
      label: "Interno",
      color: "info",
    };
  }

  return {
    label: "Sin clasificación",
    color: "default",
  };
}

export default function AddonHistoryList({
  rows = [],
  pagination,
  onPrev,
  onNext,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Paper
      sx={{
        p: 0,
        overflow: "hidden",
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
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
        <Typography sx={{ fontSize: 18, fontWeight: 900, color: "text.primary" }}>
          Movimientos registrados
        </Typography>
      </Box>

      {rows.length === 0 ? (
        <Box sx={{ px: 3, py: 5, textAlign: "center" }}>
          <Typography sx={{ fontSize: 20, fontWeight: 900, color: "text.primary" }}>
            No hay movimientos para mostrar
          </Typography>

          <Typography sx={{ mt: 1, fontSize: 14, color: "text.secondary", lineHeight: 1.5 }}>
            No se encontraron complementos con el periodo seleccionado.
          </Typography>
        </Box>
      ) : (
        <>
          {isMobile ? (
            <AddonHistoryMobileCards rows={rows} />
          ) : (
            <AddonHistoryDesktopTable rows={rows} />
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
            itemLabel="movimientos"
          />
        </>
      )}
    </Paper>
  );
}

function AddonHistoryDesktopTable({ rows }) {
  return (
    <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
      <Table sx={{ minWidth: 1000 }}>
        <TableHead>
          <TableRow
            sx={{
              "& th": {
                backgroundColor: "primary.main",
                color: "#fff",
                fontWeight: 900,
                fontSize: 13,
                borderBottom: "none",
                whiteSpace: "nowrap",
              },
            }}
          >
            <TableCell>Complemento</TableCell>
            <TableCell>Sucursal</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Meses</TableCell>
            <TableCell align="right">Precio mensual</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => {
            const source = sourceConfig(row.source);

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
                    py: 1.8,
                  },
                }}
              >
                <TableCell>
                  <Stack spacing={0.3}>
                    <Typography sx={{ fontSize: 14, fontWeight: 900 }}>
                      {row?.addon?.name || "Complemento"}
                    </Typography>

                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      Movimiento #{row.id}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                    {row?.branch?.name || "—"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={source.label}
                    color={source.color}
                    size="small"
                    variant={source.color === "default" ? "outlined" : "filled"}
                    sx={{ fontWeight: 800 }}
                  />
                </TableCell>

                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  {formatDate(row.paid_at)}
                </TableCell>

                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Stack spacing={0.2}>
                    <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                      {Number(row.months_granted || 0)} otorgado{Number(row.months_granted || 0) === 1 ? "" : "s"}
                    </Typography>

                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      {Number(row.months_paid || 0)} pagado{Number(row.months_paid || 0) === 1 ? "" : "s"}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  {formatMoney(row.monthly_price, row.currency)}
                </TableCell>

                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 900 }}>
                    {formatMoney(row.paid_price, row.currency)}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function AddonHistoryMobileCards({ rows }) {
  return (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      {rows.map((row) => {
        const source = sourceConfig(row.source);

        return (
          <Card
            key={row.id}
            sx={{
              width: "100%",
              minHeight: 300,
              height: "100%",
              borderRadius: 1,
              boxShadow: "none",
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "#fff",
            }}
          >
            <Box sx={{ p: 2 }}>
              <Stack spacing={1.75}>
                <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 17,
                        fontWeight: 900,
                        color: "text.primary",
                        lineHeight: 1.25,
                        wordBreak: "break-word",
                      }}
                    >
                      {row?.addon?.name || "Complemento"}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.4,
                        fontSize: 13,
                        color: "text.secondary",
                        wordBreak: "break-word",
                      }}
                    >
                      {row?.branch?.name || "Sucursal sin identificar"}
                    </Typography>
                  </Box>

                  <Chip
                    label={source.label}
                    color={source.color}
                    size="small"
                    variant={source.color === "default" ? "outlined" : "filled"}
                    sx={{ fontWeight: 800, flexShrink: 0 }}
                  />
                </Stack>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2, minmax(0, 1fr))",
                      sm: "repeat(3, minmax(0, 1fr))",
                    },
                    gap: 1.5,
                  }}
                >
                  <DetailItem label="Fecha" value={formatDate(row.paid_at)} />
                  <DetailItem label="Meses pagados" value={`${Number(row.months_paid || 0)}`} />
                  <DetailItem label="Meses otorgados" value={`${Number(row.months_granted || 0)}`} />
                  <DetailItem label="Precio mensual" value={formatMoney(row.monthly_price, row.currency)} />
                  <DetailItem label="Total" value={formatMoney(row.paid_price, row.currency)} strong />
                  <DetailItem label="Movimiento" value={`#${row.id}`} />
                </Box>
              </Stack>
            </Box>
          </Card>
        );
      })}
    </Stack>
  );
}

function DetailItem({ label, value, strong = false }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={mobileLabelSx}>{label}</Typography>

      <Typography
        sx={{
          ...mobileValueSx,
          fontWeight: strong ? 900 : 800,
          fontSize: strong ? 16 : 14,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

const mobileLabelSx = {
  fontSize: 11,
  fontWeight: 900,
  color: "text.secondary",
  textTransform: "uppercase",
  letterSpacing: 0.3,
};

const mobileValueSx = {
  mt: 0.3,
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  lineHeight: 1.35,
  wordBreak: "break-word",
};