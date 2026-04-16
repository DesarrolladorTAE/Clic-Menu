import React from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import PaginationFooter from "../../../common/PaginationFooter";
import CashierRefundSaleCard from "./CashierRefundSaleCard";

export default function CashierRefundSalesPanel({
  sales = [],
  page,
  totalPages,
  startItem,
  endItem,
  total,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onOpenDetail,
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
          py: 1.75,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          Ventas históricas
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            fontSize: 14,
            color: "text.secondary",
            lineHeight: 1.55,
          }}
        >
          Aquí aparecen las ventas cobradas, parcialmente devueltas o totalmente
          devueltas de la caja.
        </Typography>
      </Box>

      {sales.length === 0 ? (
        <Box
          sx={{
            px: 3,
            py: 6,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            No hay ventas para mostrar
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontSize: 14,
              color: "text.secondary",
              lineHeight: 1.6,
            }}
          >
            Ajusta los filtros o espera a que existan ventas cobradas en esta caja.
          </Typography>
        </Box>
      ) : (
        <>
          {isMobile ? (
            <Box
              sx={{
                p: 2,
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "repeat(1, minmax(0, 1fr))",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
              }}
            >
              {sales.map((sale) => (
                <CashierRefundSaleCard
                  key={sale.sale_id}
                  sale={sale}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </Box>
          ) : (
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
                    <TableCell>Venta</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Devuelto</TableCell>
                    <TableCell>Disponible</TableCell>
                    <TableCell>Pagada</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sales.map((sale) => (
                    <TableRow
                      key={sale.sale_id}
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
                        <Typography sx={{ fontWeight: 800 }}>
                          Venta #{sale.sale_id}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                          Orden #{sale.order_id || "—"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontWeight: 700 }}>
                          {sale.customer_name || "Cliente sin nombre"}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                          {sale.ticket_folio ? `Folio ${sale.ticket_folio}` : "Sin folio"}
                        </Typography>
                      </TableCell>

                      <TableCell>{getRefundStatusLabel(sale.status)}</TableCell>
                      <TableCell>{formatCurrency(sale.total)}</TableCell>
                      <TableCell>{formatCurrency(sale.refunded_total)}</TableCell>
                      <TableCell>{formatCurrency(sale.available_to_refund)}</TableCell>
                      <TableCell>{formatDateTime(sale.paid_at)}</TableCell>

                      <TableCell align="right">
                        <Stack direction="row" justifyContent="flex-end">
                          <Button
                            variant="contained"
                            onClick={() => onOpenDetail?.(sale)}
                            sx={{
                              minWidth: 150,
                              height: 40,
                              borderRadius: 2,
                              fontWeight: 800,
                            }}
                          >
                            Ver detalle
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <PaginationFooter
            page={page}
            totalPages={totalPages}
            startItem={startItem}
            endItem={endItem}
            total={total}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={onPrev}
            onNext={onNext}
            itemLabel="ventas"
          />
        </>
      )}
    </Paper>
  );
}

function getRefundStatusLabel(status) {
  switch (String(status || "").toLowerCase()) {
    case "paid":
      return "Pagada";
    case "partially_refunded":
      return "Parcialmente devuelta";
    case "refunded":
      return "Devuelta";
    default:
      return status || "—";
  }
}

function formatCurrency(value) {
  const safe = Number(value || 0);

  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `$${safe.toFixed(2)}`;
  }
}

function formatDateTime(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}