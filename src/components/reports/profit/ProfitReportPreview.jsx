import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from "@mui/material";

import PaginationFooter from "../../common/PaginationFooter";

export default function ProfitReportPreview({
  restaurantName,
  summary,
  rows,
  pagination,
  branchName,
  filters,
  onPrev,
  onNext,
}) {
  const hasRows = Array.isArray(rows) && rows.length > 0;
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
                    Reporte de utilidades
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
                width: "25%",
              },
            }}
          >
            <tbody>
              <tr>
                <FilterCell
                  label="Fecha inicial"
                  value={filters?.start_date || "—"}
                />
                <FilterCell
                  label="Fecha final"
                  value={filters?.end_date || "—"}
                />
                <FilterCell
                  label="Sucursal"
                  value={branchName || "Todas las sucursales"}
                />
                <FilterCell label="Estados incluidos" value="paid" />
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
                width: "20%",
                wordBreak: "break-word",
              },
            }}
          >
            <tbody>
              <tr>
                <SummaryCell
                  label="Venta bruta"
                  value={money(summary?.gross_sales ?? summary?.income_total)}
                />

                <SummaryCell
                  label="Promociones"
                  value={money(summary?.promotion_discount_total)}
                />

                <SummaryCell
                  label="Desc. manuales"
                  value={money(summary?.manual_discount_total)}
                />

                <SummaryCell
                  label="Venta neta"
                  value={money(summary?.net_sales ?? summary?.income_total)}
                />

                <SummaryCell
                  label="Costo total"
                  value={money4(summary?.cost_total)}
                />
              </tr>

              <tr>
                <SummaryCell
                  label="Utilidad total"
                  value={money4(summary?.profit_total)}
                />

                <SummaryCell
                  label="Margen %"
                  value={percent(summary?.margin_percent)}
                />

                <SummaryCell
                  label="Ítems"
                  value={summary?.items_count ?? 0}
                />

                <SummaryCell
                  label="Descuento total"
                  value={money(summary?.discount_total)}
                />

                <SummaryCell
                  label="Base utilidad"
                  value="Neta"
                />
              </tr>
            </tbody>
          </Box>

          <SectionTitle title="Detalle resumido" />

          <TableContainer
            sx={{
              width: "100%",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <Table
              size="small"
              sx={{
                width: "100%",
                minWidth: { xs: 1120, lg: "100%" },
                tableLayout: "fixed",
                borderCollapse: "collapse",

                "& th": {
                  ...tableHeadCellSx,
                  px: "4px",
                  py: "6px",
                  fontSize: "8.5px",
                  lineHeight: 1.2,
                },

                "& td": {
                  ...tableBodyCellSx,
                  px: "4px",
                  py: "6px",
                  fontSize: "8.5px",
                  lineHeight: 1.25,
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 55 }}>Sale ID</TableCell>
                  <TableCell sx={{ width: 60 }}>Order ID</TableCell>
                  <TableCell sx={{ width: 130 }}>Producto</TableCell>
                  <TableCell sx={{ width: 100 }}>Categoría</TableCell>

                  <TableCell align="center" sx={{ width: 52 }}>
                    Cant.
                  </TableCell>

                  <TableCell align="center" sx={{ width: 52 }}>
                    Prep.
                  </TableCell>

                  <TableCell align="right" sx={{ width: 85 }}>
                    Venta bruta
                  </TableCell>

                  <TableCell align="right" sx={{ width: 80 }}>
                    Promos
                  </TableCell>

                  <TableCell align="right" sx={{ width: 88 }}>
                    Desc. manual
                  </TableCell>

                  <TableCell align="right" sx={{ width: 85 }}>
                    Venta neta
                  </TableCell>

                  <TableCell align="right" sx={{ width: 80 }}>
                    Costo
                  </TableCell>

                  <TableCell align="right" sx={{ width: 85 }}>
                    Utilidad
                  </TableCell>

                  <TableCell align="right" sx={{ width: 65 }}>
                    Margen %
                  </TableCell>

                  <TableCell sx={{ width: 82 }}>
                    Resultado
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {hasRows ? (
                  rows.map((row, index) => {
                    const resultado = row.resultado || "Empate";

                    return (
                      <TableRow key={`${row.sale_id}-${row.order_id}-${index}`}>
                        <TableCell>{row.sale_id || ""}</TableCell>
                        <TableCell>{row.order_id || ""}</TableCell>

                        <TableCell>
                          <Box sx={{ fontWeight: 800, color: "#2F2A3D" }}>
                            {row.product?.name || ""}
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ color: "#6E6A6A", fontSize: 8 }}>
                            {row.category?.name || "Sin categoría"}
                          </Box>
                        </TableCell>

                        <TableCell align="center">
                          {number3(row.quantity_sold ?? row.quantity_net)}
                        </TableCell>

                        <TableCell align="center">
                          {number3(row.quantity_prepared ?? row.quantity_net)}
                        </TableCell>

                        <TableCell align="right">
                          {money(row.gross_sales)}
                        </TableCell>

                        <TableCell align="right">
                          {money(row.promotion_discount_total)}
                        </TableCell>

                        <TableCell align="right">
                          {money(row.manual_discount_total)}
                        </TableCell>

                        <TableCell align="right">
                          {money(row.net_sales ?? row.income_net)}
                        </TableCell>

                        <TableCell align="right">
                          {money4(row.cost_total)}
                        </TableCell>

                        <TableCell align="right">
                          {money4(row.profit_total)}
                        </TableCell>

                        <TableCell align="right">
                          {percent(row.margin_percent)}
                        </TableCell>

                        <TableCell>
                          <Box
                            component="span"
                            sx={{
                              display: "inline-block",
                              px: "7px",
                              py: "3px",
                              borderRadius: "12px",
                              fontSize: 8,
                              fontWeight: 800,
                              whiteSpace: "nowrap",
                              ...resultSx(resultado),
                            }}
                          >
                            {resultado}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={14}
                      align="center"
                      sx={{
                        color: "#6E6A6A",
                        p: "14px",
                      }}
                    >
                      No hay utilidades para mostrar en el rango seleccionado.
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
          itemLabel="utilidades"
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

function money4(value) {
  const number = Number(
    String(value ?? "0").replace(/[$,\s]/g, "") || 0
  );

  return `$${number.toLocaleString("es-MX", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  })}`;
}

function percent(value) {
  if (typeof value === "string" && value.trim().endsWith("%")) {
    const parsed = Number(value.replace(/[%\s]/g, ""));
    if (!Number.isNaN(parsed)) {
      return `${parsed.toLocaleString("es-MX", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}%`;
    }

    return value;
  }

  const number = Number(String(value ?? "0").replace(/[%\s]/g, "") || 0);

  return `${number.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

function number3(value) {
  const number = Number(value || 0);

  return number.toLocaleString("es-MX", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
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

function resultSx(resultado) {
  if (resultado === "Ganancia") {
    return {
      background: "#DFF4DF",
      color: "#168A16",
    };
  }

  if (resultado === "Pérdida") {
    return {
      background: "#FFE2D8",
      color: "#C43D12",
    };
  }

  return {
    background: "#F1F1F1",
    color: "#6E6A6A",
  };
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