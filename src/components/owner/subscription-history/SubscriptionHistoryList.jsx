import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import PaginationFooter from "../../common/PaginationFooter";

const ITEMS_PER_PAGE = 5;

function formatDate(value) {
  if (!value) return "Sin fecha";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

function formatMoney(value, currency = "MXN") {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
  }).format(amount);
}

function getStatusChip(subscription) {
  const classification = subscription?.classification || {};
  const status = subscription?.status;

  if (classification.is_future_renewal) {
    return {
      label: "Futura",
      color: "info",
    };
  }

  if (classification.is_currently_active) {
    return {
      label: "Activa",
      color: "success",
    };
  }

  if (classification.is_expired) {
    return {
      label: "Expirada",
      color: "error",
    };
  }

  if (status === "cancelled") {
    return {
      label: "Cancelada",
      color: "warning",
    };
  }

  if (status === "active") {
    return {
      label: "Activa",
      color: "success",
    };
  }

  return {
    label: status || "Sin estado",
    color: "default",
  };
}

function getTypeChip(subscription) {
  const classification = subscription?.classification || {};
  const accessType = classification.access_type;

  if (classification.is_demo || accessType === "demo") {
    return {
      label: "Demo",
      color: "warning",
    };
  }

  if (classification.is_internal || accessType === "internal") {
    return {
      label: "Interna",
      color: "info",
    };
  }

  if (classification.is_paid_commercial || accessType === "paid") {
    return {
      label: "Pagada",
      color: "success",
    };
  }

  return {
    label: accessType || "Sin tipo",
    color: "default",
  };
}

function DetailItem({ label, value }) {
  return (
    <Stack spacing={0.35}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 900,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 800,
          color: "text.primary",
          lineHeight: 1.35,
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

export default function SubscriptionHistoryList({ subscriptions }) {
  const [page, setPage] = useState(1);

  const safeSubscriptions = Array.isArray(subscriptions) ? subscriptions : [];

  const totalPages = Math.max(
    Math.ceil(safeSubscriptions.length / ITEMS_PER_PAGE),
    1
  );

  const paginatedSubscriptions = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return safeSubscriptions.slice(start, start + ITEMS_PER_PAGE);
  }, [safeSubscriptions, page]);

  const startItem =
    safeSubscriptions.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;

  const endItem = Math.min(page * ITEMS_PER_PAGE, safeSubscriptions.length);

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  useEffect(() => {
    setPage(1);
  }, [safeSubscriptions.length]);

  const handlePrev = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  const headCellSx = {
    fontSize: 13,
    fontWeight: 900,
    color: "primary.contrastText",
    borderBottom: "none",
    py: 1.5,
    whiteSpace: "nowrap",
  };

  if (safeSubscriptions.length === 0) {
    return (
      <Paper
        sx={{
          p: 3,
          borderRadius: 1,
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 900,
            color: "text.primary",
          }}
        >
          Sin suscripciones para mostrar
        </Typography>

        <Typography
          sx={{
            mt: 1,
            fontSize: 14,
            color: "text.secondary",
            lineHeight: 1.5,
          }}
        >
          No se encontraron suscripciones con los filtros seleccionados.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: {
            xs: "none",
            md: "block",
          },
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "primary.main",
                }}
              >
                <TableCell sx={headCellSx}>Plan</TableCell>
                <TableCell sx={headCellSx}>Tipo</TableCell>
                <TableCell sx={headCellSx}>Estado</TableCell>
                <TableCell sx={headCellSx}>Inicio</TableCell>
                <TableCell sx={headCellSx}>Fin</TableCell>
                <TableCell sx={headCellSx}>Proveedor</TableCell>
                <TableCell sx={headCellSx}>Precio</TableCell>
                <TableCell sx={headCellSx}>Meses</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedSubscriptions.map((subscription) => {
                const statusChip = getStatusChip(subscription);
                const typeChip = getTypeChip(subscription);

                return (
                  <TableRow
                    key={subscription.id}
                    hover
                    sx={{
                      backgroundColor: "background.paper",
                      "& td": {
                        borderColor: "divider",
                        py: 1.8,
                      },
                    }}
                  >
                    <TableCell>
                      <Stack spacing={0.25}>
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 900,
                            color: "text.primary",
                          }}
                        >
                          {subscription?.plan?.name || "Sin plan"}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "text.secondary",
                          }}
                        >
                          {subscription?.plan?.slug || `#${subscription.id}`}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={typeChip.label}
                        color={typeChip.color}
                        size="small"
                        variant={
                          typeChip.color === "default" ? "outlined" : "filled"
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={statusChip.label}
                        color={statusChip.color}
                        size="small"
                        variant={
                          statusChip.color === "default"
                            ? "outlined"
                            : "filled"
                        }
                      />
                    </TableCell>

                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {formatDate(subscription.starts_at)}
                    </TableCell>

                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {formatDate(subscription.ends_at)}
                    </TableCell>

                    <TableCell>
                      {subscription.provider || "Sin proveedor"}
                    </TableCell>

                    <TableCell sx={{ whiteSpace: "nowrap", fontWeight: 800 }}>
                      {formatMoney(
                        subscription.paid_price,
                        subscription.currency
                      )}
                    </TableCell>

                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {subscription.months_paid ?? 0} pag. /{" "}
                      {subscription.months_granted ?? 0} ot.
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Stack
        spacing={1.5}
        sx={{
          p: 1.5,
          display: {
            xs: "flex",
            md: "none",
          },
        }}
      >
        {paginatedSubscriptions.map((subscription) => {
          const statusChip = getStatusChip(subscription);
          const typeChip = getTypeChip(subscription);

          return (
            <Paper
              key={subscription.id}
              sx={{
                p: 2,
                borderRadius: 1,
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "none",
              }}
            >
              <Stack spacing={2}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 17,
                      fontWeight: 900,
                      color: "text.primary",
                      lineHeight: 1.2,
                      wordBreak: "break-word",
                    }}
                  >
                    {subscription?.plan?.name || "Sin plan"}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.35,
                      fontSize: 12,
                      color: "text.secondary",
                    }}
                  >
                    {subscription?.plan?.slug ||
                      `Suscripción #${subscription.id}`}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    label={typeChip.label}
                    color={typeChip.color}
                    size="small"
                    variant={
                      typeChip.color === "default" ? "outlined" : "filled"
                    }
                  />

                  <Chip
                    label={statusChip.label}
                    color={statusChip.color}
                    size="small"
                    variant={
                      statusChip.color === "default" ? "outlined" : "filled"
                    }
                  />
                </Stack>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr 1fr",
                      sm: "repeat(3, minmax(0, 1fr))",
                    },
                    gap: 1.5,
                  }}
                >
                  <DetailItem
                    label="Inicio"
                    value={formatDate(subscription.starts_at)}
                  />

                  <DetailItem
                    label="Fin"
                    value={formatDate(subscription.ends_at)}
                  />

                  <DetailItem
                    label="Proveedor"
                    value={subscription.provider || "Sin proveedor"}
                  />

                  <DetailItem
                    label="Precio"
                    value={formatMoney(
                      subscription.paid_price,
                      subscription.currency
                    )}
                  />

                  <DetailItem
                    label="Pagados"
                    value={`${subscription.months_paid ?? 0} mes(es)`}
                  />

                  <DetailItem
                    label="Otorgados"
                    value={`${subscription.months_granted ?? 0} mes(es)`}
                  />
                </Box>
              </Stack>
            </Paper>
          );
        })}
      </Stack>

      <PaginationFooter
        page={page}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        total={safeSubscriptions.length}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrev={handlePrev}
        onNext={handleNext}
        itemLabel="suscripciones"
      />
    </Paper>
  );
}