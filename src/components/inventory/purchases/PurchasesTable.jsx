import {
  Box, Button,
  Card,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import PaginationFooter from "../../common/PaginationFooter";

function money(v) {
  return Number(v || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function statusChipSx(status) {
  if (status === "completed") {
    return {
      fontWeight: 800,
      bgcolor: "rgba(46, 175, 46, 0.14)",
      color: "success.main",
    };
  }

  return {
    fontWeight: 800,
    bgcolor: "#FFF3E0",
    color: "#A75A00",
  };
}

export default function PurchasesTable({
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
  onOpenDetail,
  onEdit,
  onDelete,
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
          Historial de compras
        </Typography>
      </Box>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {isMobile ? (
            <Stack spacing={1.5} sx={{ p: 2 }}>
              {paginatedItems.map((row) => (
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
                            }}
                          >
                            Compra #{row.id}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.5,
                              fontSize: 13,
                              color: "text.secondary",
                            }}
                          >
                            {row.purchase_date || "Sin fecha"}
                          </Typography>
                        </Box>

                        <Chip
                          label={row.status === "completed" ? "Completada" : "Draft"}
                          size="small"
                          sx={statusChipSx(row.status)}
                        />
                      </Stack>

                      <InfoBlock
                        label="Sucursal"
                        value={row.branch?.name || "—"}
                      />
                      <InfoBlock
                        label="Proveedor"
                        value={row.supplier?.name || "Sin proveedor"}
                      />
                      <InfoBlock
                        label="Almacén"
                        value={row.warehouse?.name || "Pendiente"}
                      />
                      <InfoBlock
                        label="Total"
                        value={money(row.total_amount)}
                      />

                      <Box sx={{ flexGrow: 1 }} />

                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Ver detalle">
                          <IconButton onClick={() => onOpenDetail(row)} sx={iconViewSx}>
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {row.status === "draft" ? (
                          <>
                            <Tooltip title="Editar">
                              <IconButton onClick={() => onEdit(row)} sx={iconEditSx}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Eliminar">
                              <IconButton onClick={() => onDelete(row)} sx={iconDeleteSx}>
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : null}
                      </Stack>
                    </Stack>
                  </Box>
                </Card>
              ))}
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
                    <TableCell sx={{ width: "10%" }}>ID</TableCell>
                    <TableCell sx={{ width: "14%" }}>Fecha</TableCell>
                    <TableCell sx={{ width: "18%" }}>Sucursal</TableCell>
                    <TableCell sx={{ width: "18%" }}>Proveedor</TableCell>
                    <TableCell sx={{ width: "16%" }}>Almacén</TableCell>
                    <TableCell sx={{ width: "12%" }}>Estado</TableCell>
                    <TableCell sx={{ width: "12%" }}>Total</TableCell>
                    <TableCell align="right" sx={{ width: "16%" }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedItems.map((row) => (
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
                      <TableCell>
                        <Typography sx={{ fontWeight: 800 }}>
                          #{row.id}
                        </Typography>
                      </TableCell>

                      <TableCell>{row.purchase_date || "—"}</TableCell>

                      <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                        {row.branch?.name || "—"}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                        {row.supplier?.name || "Sin proveedor"}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                        {row.warehouse?.name || "Pendiente"}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={row.status === "completed" ? "Completada" : "Draft"}
                          size="small"
                          sx={statusChipSx(row.status)}
                        />
                      </TableCell>

                      <TableCell>{money(row.total_amount)}</TableCell>

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                          alignItems="center"
                          flexWrap="nowrap"
                        >
                          <Tooltip title="Ver detalle">
                            <IconButton onClick={() => onOpenDetail(row)} sx={iconViewSx}>
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {row.status === "draft" ? (
                            <>
                              <Tooltip title="Editar">
                                <IconButton onClick={() => onEdit(row)} sx={iconEditSx}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Eliminar">
                                <IconButton onClick={() => onDelete(row)} sx={iconDeleteSx}>
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : null}
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
            itemLabel="compras"
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

function EmptyState() {
  return (
    <Box
      sx={{
        px: 3,
        py: 5,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          mx: "auto",
          mb: 2,
          borderRadius: 999,
          bgcolor: "rgba(255, 152, 0, 0.12)",
          color: "primary.main",
          display: "grid",
          placeItems: "center",
        }}
      >
        <ShoppingCartOutlinedIcon sx={{ fontSize: 34 }} />
      </Box>

      <Typography
        sx={{
          fontSize: 20,
          fontWeight: 800,
          color: "text.primary",
        }}
      >
        No hay compras registradas
      </Typography>

      <Typography
        sx={{
          mt: 1,
          color: "text.secondary",
          fontSize: 14,
          maxWidth: 560,
          mx: "auto",
        }}
      >
        Crea tu primera compra draft para empezar a capturar ingredientes o
        productos.
      </Typography>
    </Box>
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

const iconViewSx = {
  width: 40,
  height: 40,
  bgcolor: "#4F46E5",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "#4338CA",
  },
};

const iconEditSx = {
  width: 40,
  height: 40,
  bgcolor: "#E3C24A",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "#C9AA39",
  },
};

const iconDeleteSx = {
  width: 40,
  height: 40,
  bgcolor: "#E55353",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "#D43F3F",
  },
};
