import {
  Box, Button, Card, Chip,FormControlLabel, IconButton, Paper, Stack, Switch, Table, TableBody,
  TableCell, TableContainer,  TableHead, TableRow, Tooltip, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PaginationFooter from "../../../common/PaginationFooter";
import InventoryStockEmptyState from "../../shared/stock/InventoryStockEmptyState";

export default function ProductInventoryStockTable({
  rows,
  paginatedItems,
  page,
  totalPages,
  startItem,
  endItem,
  total,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onOpenProductConfig,
  onToggleStatus,
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
        border: "1px solid",
        borderColor: "divider",
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
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          Stock de productos con inventario directo
        </Typography>
      </Box>

      {rows.length === 0 ? (
        <InventoryStockEmptyState
          title="No hay productos con existencia registrada"
          description="No se encontraron productos con stock directo en este almacén para los filtros actuales."
        />
      ) : (
        <>
          {isMobile ? (
            <Stack spacing={1.5} sx={{ p: 2 }}>
              {paginatedItems.map((row) => {
                const product = row.product || {};
                const isActive = product.status === "active";

                return (
                  <Card
                    key={row.id}
                    sx={{
                      borderRadius: 1,
                      boxShadow: "none",
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundColor: "#fff",
                      minHeight: 280,
                      display: "flex",
                    }}
                  >
                    <Box sx={{ p: 2, width: "100%" }}>
                      <Stack spacing={1.5} sx={{ height: "100%" }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          spacing={1}
                        >
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
                              {product.name || "Producto"}
                            </Typography>

                            <Typography
                              sx={{
                                mt: 0.5,
                                fontSize: 13,
                                color: "text.secondary",
                                wordBreak: "break-word",
                              }}
                            >
                              {product.category_name || "Sin categoría"}
                            </Typography>
                          </Box>

                          <Chip
                            label={Number(row.on_hand) > 0 ? "Con stock" : "Sin stock"}
                            size="small"
                            color={Number(row.on_hand) > 0 ? "success" : "default"}
                            sx={{ fontWeight: 800 }}
                          />
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Chip
                            label={product.is_global ? "Global" : "Sucursal"}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              bgcolor: "#EEF2FF",
                              color: "#3F3A52",
                            }}
                          />
                          <Chip
                            label="Simple / Producto"
                            size="small"
                            sx={{ fontWeight: 800 }}
                          />
                        </Stack>

                        <InfoBlock label="Existencia actual" value={String(row.on_hand)} />
                        <InfoBlock label="Categoría" value={product.category_name || "—"} />

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography sx={switchLabelSx}>Activo</Typography>
                          <Switch
                            checked={isActive}
                            onChange={() => onToggleStatus(row)}
                            color="primary"
                          />
                        </Box>

                        <Box sx={{ flexGrow: 1 }} />

                        <Button
                          onClick={() => onOpenProductConfig(row)}
                          variant="outlined"
                          startIcon={<SettingsOutlinedIcon />}
                          sx={{
                            height: 40,
                            borderRadius: 2,
                            fontWeight: 800,
                          }}
                        >
                          Configuración
                        </Button>
                      </Stack>
                    </Box>
                  </Card>
                );
              })}
            </Stack>
          ) : (
            <TableContainer sx={{ width: "100%", overflowX: "hidden" }}>
              <Table
                sx={{
                  width: "100%",
                  tableLayout: "fixed",
                }}
              >
                <TableHead>
                  <TableRow
                    sx={{
                      "& th": {
                        backgroundColor: "primary.main",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: 13,
                        borderBottom: "none",
                        py: 1.75,
                      },
                    }}
                  >
                    <TableCell sx={{ width: "28%" }}>Producto</TableCell>
                    <TableCell sx={{ width: "18%" }}>Categoría</TableCell>
                    <TableCell sx={{ width: "12%" }}>Stock</TableCell>
                    <TableCell sx={{ width: "14%" }}>Ámbito</TableCell>
                    <TableCell sx={{ width: "16%" }}>Activo</TableCell>
                    <TableCell align="right" sx={{ width: "12%" }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedItems.map((row) => {
                    const product = row.product || {};
                    const isActive = product.status === "active";

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
                            verticalAlign: "top",
                            py: 2,
                          },
                        }}
                      >
                        <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                          <Typography sx={{ fontWeight: 800 }}>
                            {product.name || "Producto"}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                          {product.category_name || "—"}
                        </TableCell>

                        <TableCell>
                          <Typography sx={{ fontWeight: 800 }}>
                            {row.on_hand}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {product.is_global ? "Global" : "Sucursal"}
                        </TableCell>

                        <TableCell>
                          <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                              <Switch
                                checked={isActive}
                                onChange={() => onToggleStatus(row)}
                                color="primary"
                              />
                            }
                            label={
                              <Typography sx={switchLabelSx}>
                                {isActive ? "Activo" : "Inactivo"}
                              </Typography>
                            }
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Tooltip title="Abrir configuración">
                            <IconButton
                              onClick={() => onOpenProductConfig(row)}
                              sx={iconActionSx}
                            >
                              <SettingsOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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
            itemLabel="registros"
          />
        </>
      )}
    </Paper>
  );
}

function InfoBlock({ label, value }) {
  return (
    <Box>
      <Typography sx={mobileLabelSx}>{label}</Typography>
      <Typography sx={mobileValueSx}>{value}</Typography>
    </Box>
  );
}

const switchLabelSx = {
  fontSize: 14,
  fontWeight: 700,
  color: "text.primary",
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

const iconActionSx = {
  width: 40,
  height: 40,
  bgcolor: "#E3C24A",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "#C9AA39",
  },
};