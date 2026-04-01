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

import PaginationFooter from "../../common/PaginationFooter";
import CashierSaleCard from "./CashierSaleCard";

export default function CashierSalesPanel({
  title,
  subtitle,
  mode = "available",
  sales = [],
  actionBusyId = null,
  page,
  totalPages,
  startItem,
  endItem,
  total,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onTake,
  onOpenDetail,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const isAvailableMode = mode === "available";

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
          {title}
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            fontSize: 14,
            color: "text.secondary",
            lineHeight: 1.55,
          }}
        >
          {subtitle}
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
            {isAvailableMode
              ? "No hay ventas disponibles"
              : "Todavía no has tomado ventas"}
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontSize: 14,
              color: "text.secondary",
              lineHeight: 1.6,
            }}
          >
            {isAvailableMode
              ? "Cuando un mesero envíe una cuenta a caja y siga pendiente, aparecerá aquí."
              : "Las ventas que tomes desde la cola se moverán a esta sección para continuar con su cobro."}
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
                <CashierSaleCard
                  key={sale.sale_id}
                  sale={sale}
                  mode={mode}
                  taking={actionBusyId === sale.sale_id}
                  onTake={onTake}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </Box>
          ) : (
            <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
              <Table sx={{ minWidth: 1120 }}>
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
                    <TableCell>Mesa</TableCell>
                    <TableCell>Estado orden</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>{isAvailableMode ? "Creada" : "Tomada"}</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sales.map((sale) => {
                    const order = sale?.order || null;
                    const table = sale?.table || null;

                    return (
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
                            Orden #{order?.id || "—"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography sx={{ fontWeight: 700 }}>
                            {order?.customer_name?.trim() || "Cliente sin nombre"}
                          </Typography>
                        </TableCell>

                        <TableCell>{table?.name || "Sin mesa"}</TableCell>

                        <TableCell>{order?.status || "—"}</TableCell>

                        <TableCell>{formatCurrency(sale?.total)}</TableCell>

                        <TableCell>
                          {formatDateTime(
                            isAvailableMode ? order?.created_at : sale?.taken_at
                          )}
                        </TableCell>

                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                            alignItems="center"
                            flexWrap="nowrap"
                          >
                            {isAvailableMode ? (
                              <Button
                                variant="contained"
                                onClick={() => onTake?.(sale)}
                                disabled={actionBusyId === sale.sale_id}
                                sx={{
                                  minWidth: 140,
                                  height: 40,
                                  borderRadius: 2,
                                  fontWeight: 800,
                                }}
                              >
                                {actionBusyId === sale.sale_id
                                  ? "Tomando…"
                                  : "Tomar venta"}
                              </Button>
                            ) : null}

                            <Button
                              variant={isAvailableMode ? "outlined" : "contained"}
                              color={isAvailableMode ? "inherit" : "primary"}
                              onClick={() => onOpenDetail?.(sale)}
                              sx={{
                                minWidth: 130,
                                height: 40,
                                borderRadius: 2,
                                fontWeight: 800,
                              }}
                            >
                              {isAvailableMode ? "Ver detalle" : "Continuar"}
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
