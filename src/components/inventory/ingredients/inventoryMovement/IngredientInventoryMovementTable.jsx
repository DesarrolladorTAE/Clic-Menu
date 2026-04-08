import {
  Box, Button, Card, Chip,Paper, Stack, Table, TableBody,TableCell, TableContainer, TableHead,
  TableRow, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PaginationFooter from "../../../common/PaginationFooter";
import InventoryMovementEmptyState from "../../shared/movement/InventoryMovementEmptyState";

function typeLabel(type) {
  if (type === "IN") return "Entrada";
  if (type === "OUT") return "Salida";
  if (type === "ADJUST") return "Ajuste";
  return type || "—";
}

function typeChipSx(type) {
  if (type === "IN") {
    return {
      fontWeight: 800,
      bgcolor: "rgba(46, 175, 46, 0.14)",
      color: "success.main",
    };
  }

  if (type === "OUT") {
    return {
      fontWeight: 800,
      bgcolor: "rgba(242, 100, 42, 0.12)",
      color: "error.main",
    };
  }

  return {
    fontWeight: 800,
    bgcolor: "#EEF2FF",
    color: "#3F3A52",
  };
}

export default function IngredientInventoryMovementTable({
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
  onCreate,
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
          Historial de movimientos
        </Typography>
      </Box>

      {rows.length === 0 ? (
        <InventoryMovementEmptyState
          title="No hay movimientos registrados"
          description="Todavía no existen movimientos manuales para este almacén con los filtros actuales."
          actionLabel="Nuevo movimiento"
          onAction={onCreate}
        />
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
                    minHeight: 320,
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
                            {row.ingredient?.name || "Ingrediente"}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.5,
                              fontSize: 13,
                              color: "text.secondary",
                              wordBreak: "break-word",
                            }}
                          >
                            {row.ingredient?.code
                              ? `Clave: ${row.ingredient.code}`
                              : "Sin clave"}
                          </Typography>
                        </Box>

                        <Chip
                          label={typeLabel(row.type)}
                          size="small"
                          sx={typeChipSx(row.type)}
                        />
                      </Stack>

                      <InfoBlock label="Razón" value={row.reason || "—"} />
                      <InfoBlock
                        label="Cantidad"
                        value={`${row.quantity} ${row.unit_snapshot || ""}`}
                      />
                      <InfoBlock
                        label="Stock anterior"
                        value={String(row.previous_on_hand)}
                      />
                      <InfoBlock
                        label="Stock nuevo"
                        value={String(row.new_on_hand)}
                      />
                      <InfoBlock
                        label="Usuario"
                        value={row.performed_by?.name || "Sistema"}
                      />
                      <InfoBlock label="Notas" value={row.notes || "Sin notas"} />
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
                    <TableCell sx={{ width: "18%" }}>Ingrediente</TableCell>
                    <TableCell sx={{ width: "10%" }}>Tipo</TableCell>
                    <TableCell sx={{ width: "14%" }}>Razón</TableCell>
                    <TableCell sx={{ width: "12%" }}>Cantidad</TableCell>
                    <TableCell sx={{ width: "12%" }}>Anterior</TableCell>
                    <TableCell sx={{ width: "12%" }}>Nuevo</TableCell>
                    <TableCell sx={{ width: "12%" }}>Usuario</TableCell>
                    <TableCell sx={{ width: "10%" }}>Notas</TableCell>
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
                      <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                        <Stack spacing={0.5}>
                          <Typography sx={{ fontWeight: 800 }}>
                            {row.ingredient?.name || "Ingrediente"}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "text.secondary",
                              whiteSpace: "normal",
                            }}
                          >
                            {row.ingredient?.code
                              ? `Clave: ${row.ingredient.code}`
                              : "Sin clave"}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={typeLabel(row.type)}
                          size="small"
                          sx={typeChipSx(row.type)}
                        />
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                        {row.reason || "—"}
                      </TableCell>

                      <TableCell>
                        {row.quantity} {row.unit_snapshot || ""}
                      </TableCell>

                      <TableCell>{row.previous_on_hand}</TableCell>
                      <TableCell>{row.new_on_hand}</TableCell>

                      <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                        {row.performed_by?.name || "Sistema"}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                        {row.notes || "—"}
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
            itemLabel="movimientos"
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
