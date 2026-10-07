import {
  Box, Button, Card, Chip, FormControlLabel, IconButton, Paper, Stack, Switch, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import PaginationFooter from "../../../../common/PaginationFooter";

import {
  getAppliesToLabel,
  iconDeleteSx,
  iconEditSx,
  switchLabelSx,
} from "./catalogShared";

function hasCustomRules(row) {
  return (
    row?.required_override !== null && row?.required_override !== undefined
  ) || (
    row?.min_selections_override !== null && row?.min_selections_override !== undefined
  ) || (
    row?.max_selections_override !== null && row?.max_selections_override !== undefined
  );
}

function RulesChip({ row }) {
  const customized = hasCustomRules(row);

  return (
    <Chip
      label={customized ? "Reglas personalizadas" : "Usa reglas del grupo"}
      size="small"
      color={customized ? "primary" : "default"}
      variant={customized ? "filled" : "outlined"}
      sx={{ fontWeight: 800 }}
    />
  );
}

export default function ModifierAssignmentsPanel({
  isMobile = false,
  title = "Grupos asignados",
  addButtonText = "Asignar grupo",
  emptyTitle = "No hay grupos asignados",
  emptyMessage = "Asigna tu primer grupo de modificadores.",
  missingSelectionTitle = "Selecciona un elemento",
  missingSelectionMessage = "Selecciona un elemento para continuar.",
  canAssign = false,
  hasSelection = false,
  rows = [],
  paginatedItems = [],
  page = 1,
  totalPages = 1,
  startItem = 0,
  endItem = 0,
  total = 0,
  hasPrev = false,
  hasNext = false,
  onPrev,
  onNext,
  onCreate,
  onEdit,
  onDelete,
  onToggleStatus,
  isSaving = () => false,
  itemLabel = "asignaciones",
}) {
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
          {title}
        </Typography>

        <Button
          onClick={onCreate}
          variant="contained"
          startIcon={<AddIcon />}
          disabled={!canAssign}
          sx={{
            minWidth: { xs: "100%", sm: 170 },
            height: 42,
            fontWeight: 800,
          }}
        >
          {addButtonText}
        </Button>
      </Box>

      {!hasSelection ? (
        <Box sx={{ px: 3, py: 5, textAlign: "center" }}>
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
            {missingSelectionTitle}
          </Typography>

          <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 14 }}>
            {missingSelectionMessage}
          </Typography>
        </Box>
      ) : rows.length === 0 ? (
        <Box sx={{ px: 3, py: 5, textAlign: "center" }}>
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
            {emptyTitle}
          </Typography>

          <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 14 }}>
            {emptyMessage}
          </Typography>

          <Button
            onClick={onCreate}
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!canAssign}
            sx={{
              mt: 2.5,
              minWidth: 220,
              height: 44,
              fontWeight: 800,
            }}
          >
            {addButtonText}
          </Button>
        </Box>
      ) : (
        <>
          {isMobile ? (
            <Stack spacing={1.5} sx={{ p: 2 }}>
              {paginatedItems.map((row) => {
                const active = !!row.is_active;
                const busy = isSaving(row.id);
                const group = row.modifier_group || row.modifierGroup || {};
                const optionsCount = Array.isArray(group?.options) ? group.options.length : 0;

                return (
                  <Card
                    key={row.id}
                    sx={{
                      width: "100%",
                      borderRadius: 1,
                      boxShadow: "none",
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundColor: "background.paper",
                    }}
                  >
                    <Box sx={{ p: 2 }}>
                      <Stack spacing={1.5}>
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
                              {group?.name || "Grupo sin nombre"}
                            </Typography>

                            <Typography
                              sx={{
                                mt: 0.5,
                                fontSize: 13,
                                color: "text.secondary",
                                lineHeight: 1.4,
                                wordBreak: "break-word",
                              }}
                            >
                              {group?.description || "Sin descripción"}
                            </Typography>
                          </Box>

                          <Chip
                            label={`Orden ${row.sort_order ?? 0}`}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              bgcolor: "#FFF3E0",
                              color: "#A75A00",
                            }}
                          />
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={1}
                          useFlexGap
                          flexWrap="wrap"
                        >
                          <Chip
                            label={`${optionsCount} opción${optionsCount === 1 ? "" : "es"}`}
                            size="small"
                          />

                          <Chip
                            label={getAppliesToLabel(group?.applies_to)}
                            size="small"
                          />

                          <RulesChip row={row} />
                        </Stack>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                              <Switch
                                checked={active}
                                onChange={() => onToggleStatus(row)}
                                disabled={busy}
                                color="primary"
                              />
                            }
                            label={
                              <Typography sx={switchLabelSx}>
                                {active ? "Activo" : "Inactivo"}
                              </Typography>
                            }
                          />

                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Editar">
                              <IconButton
                                onClick={() => onEdit(row)}
                                disabled={busy}
                                sx={iconEditSx}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Eliminar">
                              <IconButton
                                onClick={() => onDelete(row)}
                                disabled={busy}
                                sx={iconDeleteSx}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>
                  </Card>
                );
              })}
            </Stack>
          ) : (
            <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
              <Table sx={{ minWidth: 940 }}>
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
                    <TableCell>Grupo</TableCell>
                    <TableCell>Aplica para</TableCell>
                    <TableCell>Opciones</TableCell>
                    <TableCell>Reglas</TableCell>
                    <TableCell>Orden</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedItems.map((row) => {
                    const active = !!row.is_active;
                    const busy = isSaving(row.id);
                    const group = row.modifier_group || row.modifierGroup || {};
                    const optionsCount = Array.isArray(group?.options) ? group.options.length : 0;

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
                            whiteSpace: "nowrap",
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            minWidth: 220,
                            maxWidth: 320,
                            whiteSpace: "normal !important",
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 800,
                              color: "text.primary",
                              lineHeight: 1.3,
                              wordBreak: "break-word",
                            }}
                          >
                            {group?.name || "Grupo sin nombre"}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.4,
                              fontSize: 12.5,
                              color: "text.secondary",
                              lineHeight: 1.4,
                              wordBreak: "break-word",
                            }}
                          >
                            {group?.description || "Sin descripción"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {getAppliesToLabel(group?.applies_to)}
                        </TableCell>

                        <TableCell>{optionsCount}</TableCell>

                        <TableCell>
                          <RulesChip row={row} />
                        </TableCell>

                        <TableCell>{row.sort_order ?? 0}</TableCell>

                        <TableCell align="center">
                          <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                              <Switch
                                checked={active}
                                onChange={() => onToggleStatus(row)}
                                disabled={busy}
                                color="primary"
                              />
                            }
                            label={
                              <Typography sx={switchLabelSx}>
                                {active ? "Activo" : "Inactivo"}
                              </Typography>
                            }
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Editar">
                              <IconButton
                                onClick={() => onEdit(row)}
                                disabled={busy}
                                sx={iconEditSx}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Eliminar">
                              <IconButton
                                onClick={() => onDelete(row)}
                                disabled={busy}
                                sx={iconDeleteSx}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
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
            itemLabel={itemLabel}
          />
        </>
      )}
    </Paper>
  );
}