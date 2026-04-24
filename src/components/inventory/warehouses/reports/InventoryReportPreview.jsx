import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from "@mui/material";

import PaginationFooter from "../../../../components/common/PaginationFooter";

export default function InventoryReportPreview({
  summary,
  stockBreakdown,
  costBreakdown,
  rows,
  pagination,
  branchName,
  warehouseName,
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
                    Reporte de existencias
                  </Typography>

                  <Box
                    sx={{
                      mt: "5px",
                      color: "#6E6A6A",
                      fontSize: 10,
                      lineHeight: 1.5,
                    }}
                  >
                    Restaurante: Restaurante
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
                <FilterCell label="Sucursal" value={branchName || "Todas"} />
                <FilterCell label="Almacén" value={warehouseName || "Todos"} />
                <FilterCell
                  label="Filtro stock"
                  value={filters?.stock_status || "with_stock"}
                />
              </tr>
              <tr>
                <FilterCell
                  label="Filtro costo"
                  value={filters?.cost_status || "all"}
                />
                <FilterCell
                  label="Tipo recurso"
                  value={filters?.resource_type || "all"}
                />
                <FilterCell
                  label="Incluir inactivos"
                  value={filters?.include_inactive ? "Sí" : "No"}
                />
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
                width: "11.11%",
                wordBreak: "break-word",
              },
            }}
          >
            <tbody>
              <tr>
                <SummaryCell
                  label="Valor total"
                  value={money(summary?.inventory_total_value)}
                />
                <SummaryCell label="Total items" value={summary?.total_items || 0} />
                <SummaryCell
                  label="Ingredientes"
                  value={summary?.ingredients_count || 0}
                />
                <SummaryCell label="Productos" value={summary?.products_count || 0} />
                <SummaryCell label="Normal" value={stockBreakdown?.normal || 0} />
                <SummaryCell label="Agotado" value={stockBreakdown?.agotado || 0} />
                <SummaryCell label="Negativo" value={stockBreakdown?.negativo || 0} />
                <SummaryCell label="Con costo" value={costBreakdown?.con_costo || 0} />
                <SummaryCell label="Sin costo" value={costBreakdown?.sin_costo || 0} />
              </tr>
            </tbody>
          </Box>

          <SectionTitle title="Detalle de existencias" />

          <TableContainer sx={{ width: "100%", overflowX: "hidden" }}>
            <Table
              size="small"
              sx={{
                width: "100%",
                tableLayout: "fixed",
                borderCollapse: "collapse",
                "& th": {
                  background: "#EAF4E7",
                  color: "#2F5E35",
                  fontWeight: 800,
                  fontSize: 9,
                  border: "1px solid #D6E7D2",
                  p: "7px 6px",
                  textAlign: "left",
                  wordBreak: "break-word",
                },
                "& td": {
                  border: "1px solid #E1E1E1",
                  p: "7px 6px",
                  verticalAlign: "top",
                  fontSize: 9,
                  color: "#2F2A3D",
                  wordBreak: "break-word",
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "10%" }}>Tipo</TableCell>
                  <TableCell sx={{ width: "20%" }}>Nombre</TableCell>
                  <TableCell sx={{ width: "20%" }}>Almacén</TableCell>
                  <TableCell align="right" sx={{ width: "10%" }}>
                    Stock
                  </TableCell>
                  <TableCell sx={{ width: "8%" }}>Unidad</TableCell>
                  <TableCell align="right" sx={{ width: "14%" }}>
                    Costo unitario
                  </TableCell>
                  <TableCell align="right" sx={{ width: "10%" }}>
                    Valor
                  </TableCell>
                  <TableCell sx={{ width: "8%" }}>Estado</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {hasRows ? (
                  rows.map((row, index) => (
                    <TableRow
                      key={`${row.type}-${row.resource_id}-${row.warehouse?.id}-${index}`}
                    >
                      <TableCell>{row.type_label || ""}</TableCell>

                      <TableCell>
                        <Box sx={{ fontWeight: 800, color: "#2F2A3D" }}>
                          {row.name || ""}
                        </Box>
                        <Box sx={{ mt: "2px", color: "#6E6A6A", fontSize: 8 }}>
                          {row.category_or_group || "Sin categoría/grupo"}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ fontWeight: 800, color: "#2F2A3D" }}>
                          {row.warehouse?.name || ""}
                        </Box>
                        <Box sx={{ mt: "2px", color: "#6E6A6A", fontSize: 8 }}>
                          {row.branch?.name || ""}
                        </Box>
                      </TableCell>

                      <TableCell align="right">{number3(row.stock)}</TableCell>
                      <TableCell>{row.unit || "—"}</TableCell>
                      <TableCell align="right">{money(row.unit_cost)}</TableCell>
                      <TableCell align="right">{money(row.total_value)}</TableCell>

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
                            ...statusSx(row),
                          }}
                        >
                          {row.combined_status || ""}
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
                      Sin datos
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
          itemLabel="existencias"
        />
      ) : null}
    </Paper>
  );
}

function FilterCell({ label, value }) {
  return (
    <td>
      <Box
        sx={{
          fontSize: 9,
          textTransform: "uppercase",
          color: "#6E6A6A",
          fontWeight: 800,
          letterSpacing: ".2px",
        }}
      >
        {label}
      </Box>

      <Box
        sx={{
          mt: "2px",
          fontSize: 10,
          fontWeight: 800,
          color: "#2F5E35",
        }}
      >
        {value}
      </Box>
    </td>
  );
}

function SummaryCell({ label, value }) {
  return (
    <td>
      <Box
        sx={{
          fontSize: 8,
          color: "#6E6A6A",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: ".2px",
        }}
      >
        {label}
      </Box>

      <Box
        sx={{
          mt: "5px",
          fontSize: 13,
          fontWeight: 800,
          color: "#3F3A52",
        }}
      >
        {value}
      </Box>
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
  const number = Number(value || 0);

  return `$${number.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

function statusSx(row) {
  if (row.stock_status === "negativo") {
    return {
      background: "#FFE2D8",
      color: "#C43D12",
    };
  }

  if (row.cost_status === "sin_costo") {
    return {
      background: "#FFF0D8",
      color: "#B76200",
    };
  }

  return {
    background: "#DFF4DF",
    color: "#168A16",
  };
}