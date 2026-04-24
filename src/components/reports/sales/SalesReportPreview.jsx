import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from "@mui/material";

import PaginationFooter from "../../common/PaginationFooter";

export default function SalesReportPreview({
  restaurantName,
  summary,
  paymentBreakdown,
  rows,
  pagination,
  branchName,
  filters,
  onPrev,
  onNext,
}) {
  const hasRows = Array.isArray(rows) && rows.length > 0;
  const hasPaymentRows =
    Array.isArray(paymentBreakdown) && paymentBreakdown.length > 0;
  const generatedAt = formatGeneratedAt(new Date());

  return (
    <Paper
      sx={{
        p: { xs: 1.5, sm: 2.5 },
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <Box sx={{ width: "100%", overflowX: "hidden", pb: 1 }}>
        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            mx: "auto",
            boxSizing: "border-box",
            bgcolor: "#fff",
            color: "#2F2A3D",
            border: "1px solid #D9D3D3",
            p: { xs: "12px", sm: "16px", md: "18px" },
            fontFamily: `"Roboto", "Arial", sans-serif`,
            fontSize: 10,
          }}
        >
          <Box
            component="table"
            sx={{
              width: "100%",
              borderCollapse: "collapse",
              mb: "14px",
              tableLayout: "fixed",
            }}
          >
            <tbody>
              <tr>
                <td>
                  <Typography
                    component="h1"
                    sx={{
                      m: 0,
                      fontSize: { xs: 20, sm: 24 },
                      fontWeight: 800,
                      color: "#3F3A52",
                      lineHeight: 1.2,
                    }}
                  >
                    Reporte de ventas
                  </Typography>

                  <Box
                    sx={{
                      mt: "5px",
                      color: "#6E6A6A",
                      fontSize: 10,
                      lineHeight: 1.5,
                    }}
                  >
                    Restaurante: {restaurantName || "Restaurante"}
                    <br />
                    Sucursal: {branchName || "Todas las sucursales"}
                    <br />
                    Generado: {generatedAt}
                  </Box>
                </td>
              </tr>
            </tbody>
          </Box>

          <Box
            component="table"
            sx={{
              width: "100%",
              borderCollapse: "collapse",
              mb: "22px",
              tableLayout: "fixed",
              "& td": {
                p: "7px 8px",
                border: "1px solid #D9D3D3",
                verticalAlign: "top",
                wordBreak: "break-word",
              },
            }}
          >
            <tbody>
              <tr>
                <FilterCell
                  label="Fecha inicial"
                  value={filters?.start_date || "—"}
                />
                <FilterCell label="Fecha final" value={filters?.end_date || "—"} />
                <FilterCell
                  label="Sucursal"
                  value={branchName || "Todas las sucursales"}
                />
              </tr>

              <tr>
                <td colSpan={3}>
                  <Box sx={filterLabelSx}>Estados incluidos</Box>
                  <Box sx={filterValueSx}>paid</Box>
                </td>
              </tr>
            </tbody>
          </Box>

          <SectionTitle title="Resumen general" />

          <Box
            component="table"
            sx={{
              width: "100%",
              borderCollapse: "collapse",
              mb: "22px",
              tableLayout: "fixed",
              "& td": {
                border: "1px solid #D9D3D3",
                p: "8px 7px",
                verticalAlign: "top",
                width: "33.33%",
                wordBreak: "break-word",
              },
            }}
          >
            <tbody>
              <tr>
                <SummaryCell
                  label="Ventas totales"
                  value={money(summary?.sales_total)}
                />
                <SummaryCell label="Tickets" value={summary?.tickets_count || 0} />
                <SummaryCell
                  label="Ticket promedio"
                  value={money(summary?.ticket_average)}
                />
              </tr>
            </tbody>
          </Box>

          <SectionTitle title="Métodos de pago" />

          <TableContainer sx={{ width: "100%", overflowX: "hidden", mb: "22px" }}>
            <Table
              size="small"
              sx={{
                width: "100%",
                tableLayout: "fixed",
                borderCollapse: "collapse",
                "& th": tableHeadCellSx,
                "& td": tableBodyCellSx,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "45%" }}>Método</TableCell>
                  <TableCell sx={{ width: "25%" }}>Código</TableCell>
                  <TableCell align="right" sx={{ width: "30%" }}>
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {hasPaymentRows ? (
                  paymentBreakdown.map((payment, index) => (
                    <TableRow key={`${payment.code || "payment"}-${index}`}>
                      <TableCell>
                        <Box sx={{ fontWeight: 800, color: "#2F2A3D" }}>
                          {payment.name || "Método"}
                        </Box>
                      </TableCell>
                      <TableCell>{payment.code || "—"}</TableCell>
                      <TableCell align="right">{money(payment.total)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{ color: "#6E6A6A", p: "14px" }}
                    >
                      No hay métodos de pago registrados en este rango.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <SectionTitle title="Ventas resumidas" />

          <TableContainer sx={{ width: "100%", overflowX: "hidden" }}>
            <Table
              size="small"
              sx={{
                width: "100%",
                tableLayout: "fixed",
                borderCollapse: "collapse",
                "& th": tableHeadCellSx,
                "& td": tableBodyCellSx,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "8%" }}>Sale ID</TableCell>
                  <TableCell sx={{ width: "8%" }}>Order ID</TableCell>
                  <TableCell sx={{ width: "15%" }}>Fecha pago</TableCell>
                  <TableCell sx={{ width: "15%" }}>Sucursal</TableCell>
                  <TableCell sx={{ width: "10%" }}>Mesa</TableCell>
                  <TableCell sx={{ width: "12%" }}>Cliente</TableCell>
                  <TableCell align="right" sx={{ width: "12%" }}>
                    Total
                  </TableCell>
                  <TableCell sx={{ width: "20%" }}>Métodos de pago</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {hasRows ? (
                  rows.map((row, index) => (
                    <TableRow key={`${row.sale_id}-${row.order_id}-${index}`}>
                      <TableCell>{row.sale_id || ""}</TableCell>
                      <TableCell>{row.order_id || ""}</TableCell>
                      <TableCell>{row.paid_at_display || ""}</TableCell>

                      <TableCell>
                        <Box sx={{ fontWeight: 800, color: "#2F2A3D" }}>
                          {row.branch?.name || ""}
                        </Box>
                      </TableCell>

                      <TableCell>{row.table?.name || ""}</TableCell>
                      <TableCell>{row.customer?.name || ""}</TableCell>
                      <TableCell align="right">{money(row.total)}</TableCell>

                      <TableCell>
                        <Box
                          sx={{
                            fontSize: 8,
                            color: "#6E6A6A",
                            lineHeight: 1.4,
                          }}
                        >
                          {formatPaymentMethods(row.payment_methods || [])}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={{
                        color: "#6E6A6A",
                        p: "14px",
                      }}
                    >
                      No hay ventas para mostrar en el rango seleccionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {hasRows ? (
        <PaginationFooter
          page={pagination?.current_page || 1}
          totalPages={pagination?.last_page || 1}
          startItem={pagination?.from || 0}
          endItem={pagination?.to || 0}
          total={pagination?.total || 0}
          hasPrev={(pagination?.current_page || 1) > 1}
          hasNext={!!pagination?.has_more_pages}
          onPrev={onPrev}
          onNext={onNext}
          itemLabel="ventas"
        />
      ) : null}
    </Paper>
  );
}

function FilterCell({ label, value }) {
  return (
    <td>
      <Box sx={filterLabelSx}>{label}</Box>
      <Box sx={filterValueSx}>{value}</Box>
    </td>
  );
}

function SummaryCell({ label, value }) {
  return (
    <td>
      <Box sx={summaryLabelSx}>{label}</Box>
      <Box sx={summaryValueSx}>{value}</Box>
    </td>
  );
}

function SectionTitle({ title }) {
  return (
    <Typography
      sx={{
        fontSize: 14,
        fontWeight: 800,
        color: "#2F5E35",
        mb: "8px",
      }}
    >
      {title}
    </Typography>
  );
}

function money(value) {
  if (typeof value === "string" && value.trim().startsWith("$")) {
    const parsed = Number(value.replace(/[$,\s]/g, ""));
    if (!Number.isNaN(parsed)) {
      return `$${parsed.toLocaleString("es-MX", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    return value;
  }

  const number = Number(String(value ?? "0").replace(/[$,\s]/g, "") || 0);

  return `$${number.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPaymentMethods(paymentMethods = []) {
  if (!Array.isArray(paymentMethods) || paymentMethods.length === 0) return "";

  return paymentMethods
    .map((payment) => {
      const name = String(payment?.name || "Método").trim();
      const amount = money(payment?.amount || 0);
      return `${name}: ${amount}`;
    })
    .join(" | ");
}

function formatGeneratedAt(date) {
  return date.toLocaleString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const filterLabelSx = {
  fontSize: 9,
  textTransform: "uppercase",
  color: "#6E6A6A",
  fontWeight: 800,
  letterSpacing: ".2px",
};

const filterValueSx = {
  mt: "2px",
  fontSize: 10,
  fontWeight: 800,
  color: "#2F5E35",
};

const summaryLabelSx = {
  fontSize: 8,
  color: "#6E6A6A",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: ".2px",
};

const summaryValueSx = {
  mt: "5px",
  fontSize: 13,
  fontWeight: 800,
  color: "#3F3A52",
};

const tableHeadCellSx = {
  background: "#EAF4E7",
  color: "#2F5E35",
  fontWeight: 800,
  fontSize: 9,
  border: "1px solid #D6E7D2",
  p: "7px 6px",
  textAlign: "left",
  wordBreak: "break-word",
};

const tableBodyCellSx = {
  border: "1px solid #E1E1E1",
  p: "7px 6px",
  verticalAlign: "top",
  fontSize: 9,
  color: "#2F2A3D",
  wordBreak: "break-word",
};