import {
  Box, Button, Card, Chip, IconButton, Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Tooltip, Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LockOutlineIcon from "@mui/icons-material/LockOutline";

import PaginationFooter from "../common/PaginationFooter";

export default function SalesChannelsList({
  items,
  paginatedItems,
  isMobile,
  saving,
  canUseAdditionalSalesChannels,
  planMessage,
  page,
  totalPages,
  startItem,
  endItem,
  total,
  hasPrev,
  hasNext,
  prevPage,
  nextPage,
  isSystemChannel,
  onCreate,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  const getChannelBlockedByPlan = (it) => {
    return !isSystemChannel(it) && !canUseAdditionalSalesChannels;
  };

  const getStatusTooltip = (it) => {
    const locked = isSystemChannel(it);
    const blockedByPlan = getChannelBlockedByPlan(it);
    const active = it.status === "active";

    if (locked) return 'Este canal es fijo y no se puede desactivar';
    if (blockedByPlan) return planMessage;
    return active ? "Desactivar" : "Activar";
  };

  const getActionDisabled = (it) => {
    return saving || isSystemChannel(it) || getChannelBlockedByPlan(it);
  };

  return (
    <Paper
      sx={{
        p: 0,
        overflow: "hidden",
        borderRadius: 0,
        backgroundColor: "background.paper",
      }}
    >
      {items.length === 0 ? (
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
            No hay canales registrados
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
              fontSize: 14,
            }}
          >
            Crea el primero. Por ejemplo: COMEDOR, DELIVERY o PICKUP.
          </Typography>

          <Tooltip
            title={!canUseAdditionalSalesChannels ? planMessage : "Crear canal"}
          >
            <span>
              <Button
                onClick={onCreate}
                variant="contained"
                startIcon={<AddIcon />}
                disabled={!canUseAdditionalSalesChannels || saving}
                sx={{
                  mt: 2.5,
                  minWidth: 220,
                  height: 44,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                Crear canal
              </Button>
            </span>
          </Tooltip>
        </Box>
      ) : (
        <>
          {isMobile ? (
            <Stack spacing={1.5} sx={{ p: 2 }}>
              {paginatedItems.map((it) => {
                const active = it.status === "active";
                const locked = isSystemChannel(it);
                const blockedByPlan = getChannelBlockedByPlan(it);

                return (
                  <Card
                    key={it.id}
                    sx={{
                      borderRadius: 1,
                      boxShadow: "none",
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundColor: "#fff",
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
                              {it.name}
                            </Typography>

                            <Typography
                              sx={{
                                mt: 0.5,
                                fontSize: 13,
                                color: "text.secondary",
                                fontFamily: "monospace",
                                wordBreak: "break-word",
                              }}
                            >
                              {it.code}
                            </Typography>
                          </Box>

                          <Stack spacing={0.75} alignItems="flex-end">
                            {locked && (
                              <Chip
                                label="FIJO"
                                size="small"
                                icon={<LockOutlineIcon />}
                                sx={{
                                  fontWeight: 800,
                                  bgcolor: "#EEF2FF",
                                  color: "#3F3A52",
                                }}
                              />
                            )}

                            {blockedByPlan && (
                              <Chip
                                label="BLOQUEADO POR PLAN"
                                size="small"
                                icon={<LockOutlineIcon />}
                                sx={{
                                  fontWeight: 800,
                                  bgcolor: "#FFF4E5",
                                  color: "#8A4B00",
                                }}
                              />
                            )}
                          </Stack>
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Tooltip title={getStatusTooltip(it)}>
                            <span>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Switch
                                  checked={active}
                                  disabled={getActionDisabled(it)}
                                  onChange={() => onToggleStatus(it)}
                                  color="success"
                                />
                                <Typography
                                  sx={{
                                    fontSize: 13,
                                    fontWeight: 800,
                                    color: active ? "success.main" : "text.secondary",
                                  }}
                                >
                                  {active ? "ACTIVO" : "INACTIVO"}
                                </Typography>
                              </Stack>
                            </span>
                          </Tooltip>

                          <Stack direction="row" spacing={1}>
                            <Tooltip
                              title={
                                locked
                                  ? "Este canal es fijo y no se puede editar"
                                  : blockedByPlan
                                  ? planMessage
                                  : "Editar"
                              }
                            >
                              <span>
                                <IconButton
                                  onClick={() => onEdit(it)}
                                  disabled={saving || locked || blockedByPlan}
                                  sx={iconEditSx}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip
                              title={
                                locked
                                  ? "Este canal es fijo y no se puede eliminar"
                                  : "Eliminar"
                              }
                            >
                              <span>
                                <IconButton
                                  onClick={() => onDelete(it)}
                                  disabled={saving || locked}
                                  sx={iconDeleteSx}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Box>
                  </Card>
                );
              })}
            </Stack>
          ) : (
            <TableContainer sx={{ width: "100%", overflowX: "auto", borderRadius: 0 }}>
              <Table sx={{ minWidth: 900 }}>
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
                    <TableCell>Code</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedItems.map((it) => {
                    const active = it.status === "active";
                    const locked = isSystemChannel(it);
                    const blockedByPlan = getChannelBlockedByPlan(it);

                    return (
                      <TableRow
                        key={it.id}
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
                            fontFamily: "monospace",
                            fontWeight: 800,
                          }}
                        >
                          {it.code}
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography sx={{ fontWeight: 700 }}>
                              {it.name}
                            </Typography>

                            {locked && (
                              <Chip
                                label="FIJO"
                                size="small"
                                icon={<LockOutlineIcon />}
                                sx={{
                                  fontWeight: 800,
                                  bgcolor: "#EEF2FF",
                                  color: "#3F3A52",
                                }}
                              />
                            )}

                            {blockedByPlan && (
                              <Chip
                                label="BLOQUEADO POR PLAN"
                                size="small"
                                icon={<LockOutlineIcon />}
                                sx={{
                                  fontWeight: 800,
                                  bgcolor: "#FFF4E5",
                                  color: "#8A4B00",
                                }}
                              />
                            )}
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Tooltip title={getStatusTooltip(it)}>
                            <span>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Switch
                                  checked={active}
                                  disabled={getActionDisabled(it)}
                                  onChange={() => onToggleStatus(it)}
                                  color="success"
                                />
                                <Typography
                                  sx={{
                                    fontSize: 13,
                                    fontWeight: 800,
                                    color: active ? "success.main" : "text.secondary",
                                  }}
                                >
                                  {active ? "ACTIVO" : "INACTIVO"}
                                </Typography>
                              </Stack>
                            </span>
                          </Tooltip>
                        </TableCell>

                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                            alignItems="center"
                            flexWrap="nowrap"
                          >
                            <Tooltip
                              title={
                                locked
                                  ? "Este canal es fijo y no se puede editar"
                                  : blockedByPlan
                                  ? planMessage
                                  : "Editar"
                              }
                            >
                              <span>
                                <IconButton
                                  onClick={() => onEdit(it)}
                                  disabled={saving || locked || blockedByPlan}
                                  sx={iconEditSx}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip
                              title={
                                locked
                                  ? "Este canal es fijo y no se puede eliminar"
                                  : "Eliminar"
                              }
                            >
                              <span>
                                <IconButton
                                  onClick={() => onDelete(it)}
                                  disabled={saving || locked}
                                  sx={iconDeleteSx}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </span>
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
            onPrev={prevPage}
            onNext={nextPage}
            itemLabel="canales"
          />
        </>
      )}
    </Paper>
  );
}

const iconEditSx = {
  width: 36,
  height: 36,
  bgcolor: "#E3C24A",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "#C9AA39",
  },
};

const iconDeleteSx = {
  width: 36,
  height: 36,
  bgcolor: "error.main",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "error.dark",
  },
};