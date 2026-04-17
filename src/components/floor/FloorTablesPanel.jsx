import {
  Box,
  Button,
  Card,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PaginationFooter from "../common/PaginationFooter";

const TABLE_SHAPE_LABELS = {
  square: "Cuadrada",
  round: "Circular",
  rectangle: "Rectangular",
};

function getTableShapeLabel(shape) {
  return TABLE_SHAPE_LABELS[String(shape || "").toLowerCase()] || "Cuadrada";
}

export default function FloorTablesPanel({
  selectedZone,
  zoneFilter,
  tables = [],
  total = 0,
  page = 1,
  totalPages = 1,
  startItem = 0,
  endItem = 0,
  hasPrev = false,
  hasNext = false,
  onPrev,
  onNext,
  onEditTable,
  onDeleteTable,
  getStatusMeta,
  getStatusLabel,
  formatWaiterFromTable,
}) {
  return (
    <Paper
      sx={{
        p: 0,
        overflow: "hidden",
        borderRadius: 0,
        backgroundColor: "background.paper",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.75,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            Mesas
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            {zoneFilter === "all"
              ? "Vista general de todas las zonas"
              : `Zona seleccionada: ${selectedZone?.name || "Sin zona"}`}
          </Typography>
        </Box>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            fontWeight: 700,
          }}
        >
          {total} resultado(s)
        </Typography>
      </Box>

      {total === 0 ? (
        <Box
          sx={{
            px: 3,
            py: 5,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            No hay mesas registradas
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
              fontSize: 14,
            }}
          >
            Agrega mesas para comenzar a organizar la operación del salón.
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(4, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              {tables.map((table) => {
                const meta = getStatusMeta(table.status);
                const waiterText = formatWaiterFromTable(table);
                const statusLabel = getStatusLabel(table.status);
                const shapeLabel = getTableShapeLabel(table.shape);

                return (
                  <Card
                    key={table.id}
                    sx={{
                      borderRadius: 1,
                      boxShadow: "none",
                      border: "1px solid",
                      borderColor: meta.border,
                      backgroundColor: meta.color,
                      minHeight: 220,
                      height: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
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
                                fontSize: 16,
                                fontWeight: 800,
                                color: "text.primary",
                                lineHeight: 1.25,
                                wordBreak: "break-word",
                              }}
                            >
                              {table.name}
                            </Typography>

                            <Typography
                              sx={{
                                mt: 0.5,
                                fontSize: 12,
                                color: "text.secondary",
                                fontWeight: 700,
                              }}
                            >
                              {table.zone_name || "Sin zona"}
                            </Typography>
                          </Box>

                          <Chip
                            label={statusLabel}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              bgcolor: "#fff",
                              color: "text.primary",
                            }}
                          />
                        </Stack>

                        <Box>
                          <Label>Asientos</Label>
                          <Value>{table.seats}</Value>
                        </Box>

                        <Box>
                          <Label>Forma</Label>
                          <Value>{shapeLabel}</Value>
                        </Box>

                        <Box>
                          <Label>Mesero</Label>
                          <Value>{waiterText || "Sin asignar"}</Value>
                        </Box>

                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1}
                          useFlexGap
                          flexWrap="wrap"
                          sx={{ mt: "auto" }}
                        >
                          <Button
                            onClick={() => onEditTable(table)}
                            variant="outlined"
                            startIcon={<EditOutlinedIcon />}
                            sx={{
                              flex: 1,
                              minWidth: 110,
                              height: 40,
                              borderRadius: 2,
                              fontWeight: 800,
                              bgcolor: "#fff",
                            }}
                          >
                            Editar
                          </Button>

                          <Button
                            onClick={() => onDeleteTable(table)}
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteOutlineIcon />}
                            sx={{
                              flex: 1,
                              minWidth: 110,
                              height: 40,
                              borderRadius: 2,
                              fontWeight: 800,
                              bgcolor: "#fff",
                            }}
                          >
                            Eliminar
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  </Card>
                );
              })}
            </Box>
          </Box>

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
            itemLabel="mesas"
          />
        </>
      )}
    </Paper>
  );
}

function Label({ children }) {
  return (
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 800,
        color: "text.secondary",
        textTransform: "uppercase",
        letterSpacing: 0.3,
      }}
    >
      {children}
    </Typography>
  );
}

function Value({ children }) {
  return (
    <Typography
      sx={{
        mt: 0.25,
        fontSize: 14,
        color: "text.primary",
        lineHeight: 1.45,
        wordBreak: "break-word",
      }}
    >
      {children}
    </Typography>
  );
}