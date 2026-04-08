import {
  Box,
  Button,
  Card,
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
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

function money(v) {
  return Number(v || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

export default function PurchaseProductItemsTable({
  items = [],
  editable = false,
  onAdd,
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          Ítems de productos
        </Typography>

        {editable ? (
          <Button
            onClick={onAdd}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              minWidth: { xs: "100%", sm: 180 },
              height: 40,
              borderRadius: 2,
              fontWeight: 800,
            }}
          >
            Agregar producto
          </Button>
        ) : null}
      </Box>

      {items.length === 0 ? (
        <EmptyText text="No hay productos agregados en esta compra." />
      ) : isMobile ? (
        <Stack spacing={1.5} sx={{ p: 2 }}>
          {items.map((item) => (
            <Card
              key={item.id}
              sx={{
                borderRadius: 1,
                boxShadow: "none",
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "#fff",
                minHeight: 240,
              }}
            >
              <Box sx={{ p: 2 }}>
                <Stack spacing={1.25}>
                  <Info label="Producto" value={item.product?.name || "—"} />
                  <Info label="Cantidad" value={String(item.quantity)} />
                  <Info label="Costo unitario" value={money(item.unit_cost)} />
                  <Info label="Subtotal" value={money(item.subtotal)} />
                  <Info label="Notas" value={item.notes || "Sin notas"} />

                  {editable ? (
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Editar">
                        <IconButton onClick={() => onEdit(item)} sx={iconEditSx}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar">
                        <IconButton onClick={() => onDelete(item)} sx={iconDeleteSx}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  ) : null}
                </Stack>
              </Box>
            </Card>
          ))}
        </Stack>
      ) : (
        <TableContainer sx={{ width: "100%", overflowX: "hidden" }}>
          <Table sx={{ width: "100%", tableLayout: "fixed" }}>
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
                <TableCell sx={{ width: "30%" }}>Producto</TableCell>
                <TableCell sx={{ width: "14%" }}>Cantidad</TableCell>
                <TableCell sx={{ width: "18%" }}>Costo unitario</TableCell>
                <TableCell sx={{ width: "18%" }}>Subtotal</TableCell>
                <TableCell sx={{ width: "10%" }}>Notas</TableCell>
                {editable ? (
                  <TableCell align="right" sx={{ width: "10%" }}>
                    Acciones
                  </TableCell>
                ) : null}
              </TableRow>
            </TableHead>

            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item.id}
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
                    {item.product?.name || "—"}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{money(item.unit_cost)}</TableCell>
                  <TableCell>{money(item.subtotal)}</TableCell>
                  <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                    {item.notes || "—"}
                  </TableCell>

                  {editable ? (
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Editar">
                          <IconButton onClick={() => onEdit(item)} sx={iconEditSx}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar">
                          <IconButton onClick={() => onDelete(item)} sx={iconDeleteSx}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}

function EmptyText({ text }) {
  return (
    <Box sx={{ px: 3, py: 5, textAlign: "center" }}>
      <Typography
        sx={{
          fontSize: 15,
          color: "text.secondary",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

function Info({ label, value }) {
  return (
    <Box>
      <Typography sx={mobileLabelSx}>{label}</Typography>
      <Typography sx={mobileValueSx}>{value}</Typography>
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
