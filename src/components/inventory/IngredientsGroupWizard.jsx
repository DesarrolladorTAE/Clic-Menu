import { useEffect, useMemo, useRef, useState } from "react";

import {
  Box, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogContent, DialogTitle, FormControlLabel,
  IconButton, Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { normalizeErr } from "../../utils/err";
import usePagination from "../../hooks/usePagination";
import PaginationFooter from "../../components/common/PaginationFooter";
import AppAlert from "../../components/common/AppAlert";

import {
  getIngredientGroups,
  createIngredientGroup,
  updateIngredientGroup,
  deleteIngredientGroup,
} from "../../services/inventory/ingredients/ingredientsGroups.service";

import IngredientGroupUpsertModal from "./IngredientGroupUpsertModal";

const PAGE_SIZE = 5;

export default function IngredientGroupWizard({
  open,
  restaurantId,
  onClose,
  onChanged,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const [savingMap, setSavingMap] = useState({});
  const [reqTick, setReqTick] = useState(0);

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const reqRef = useRef(0);

  const showAlert = ({
    severity = "error",
    title = "Error",
    message = "",
  }) => {
    setAlertState({
      open: true,
      severity,
      title,
      message,
    });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const setSaving = (groupId, value) => {
    setSavingMap((prev) => ({ ...prev, [groupId]: value }));
  };

  const isSaving = (groupId) => !!savingMap[groupId];

  const title = useMemo(() => "Administrar grupos de ingredientes", []);

  const load = async () => {
    const myReq = ++reqRef.current;
    setLoading(true);

    try {
      const res = await getIngredientGroups(restaurantId);
      if (myReq !== reqRef.current) return;

      setRows(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      if (myReq !== reqRef.current) return;

      setRows([]);
      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudieron cargar los grupos"),
      });
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setEditing(null);
    setUpsertOpen(false);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, restaurantId, reqTick]);

  const {
    page,
    nextPage,
    prevPage,
    total,
    totalPages,
    startItem,
    endItem,
    hasPrev,
    hasNext,
    paginatedItems,
  } = usePagination({
    items: rows,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const openCreate = () => {
    setEditing(null);
    setUpsertOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setUpsertOpen(true);
  };

  const handleToggleStatus = async (row) => {
    const groupId = row?.id;
    if (!groupId || isSaving(groupId)) return;

    const snapshot = rows;
    const nextStatus = row.status === "active" ? "inactive" : "active";

    setRows((prev) =>
      prev.map((item) =>
        item.id === groupId ? { ...item, status: nextStatus } : item
      )
    );
    setSaving(groupId, true);

    try {
      await updateIngredientGroup(restaurantId, groupId, {
        name: row.name,
        description: row.description || null,
        sort_order: Number(row.sort_order ?? 0),
        status: nextStatus,
      });

      await onChanged?.({ type: "update", updatedId: groupId });
    } catch (e) {
      setRows(snapshot);
      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo actualizar el estado"),
      });
    } finally {
      setSaving(groupId, false);
    }
  };

  const remove = async (row) => {
    const ok = window.confirm(
      `¿Eliminar el grupo?\n\n${row.name}\n\nSi hay ingredientes usando este grupo, el backend debería bloquearlo.`
    );
    if (!ok) return;

    const snapshot = rows;
    setRows((prev) => prev.filter((item) => item.id !== row.id));

    try {
      await deleteIngredientGroup(restaurantId, row.id);

      await onChanged?.({
        type: "delete",
        deletedId: row.id,
      });

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Grupo eliminado correctamente.",
      });
    } catch (e) {
      setRows(snapshot);
      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo eliminar"),
      });
    }
  };

  if (!open) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="lg"
        fullScreen={isMobile}
        slotProps={{
          paper: {
            sx: {
              borderRadius: { xs: 0, sm: 1 },
              overflow: "hidden",
              backgroundColor: "background.paper",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            bgcolor: "#111111",
            color: "#fff",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 20, sm: 24 },
                  lineHeight: 1.2,
                  color: "#fff",
                }}
              >
                {title}
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                Organiza categorías como Carnes, Lácteos, Verduras y más para clasificar tus ingredientes.
              </Typography>
            </Box>

            <IconButton
              onClick={onClose}
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.08)",
                borderRadius: 1,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.16)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: "background.default",
          }}
        >
          <Card
            sx={{
              borderRadius: 0,
              backgroundColor: "background.paper",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2.5}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  spacing={2}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: { xs: 18, sm: 20 },
                        fontWeight: 800,
                        color: "text.primary",
                      }}
                    >
                      Catálogo de grupos
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontSize: 14,
                        color: "text.secondary",
                        lineHeight: 1.5,
                      }}
                    >
                      Crea, edita y activa o desactiva los grupos que usarán tus ingredientes.
                    </Typography>
                  </Box>

                  <Button
                    onClick={openCreate}
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                      minWidth: { xs: "100%", sm: 180 },
                      height: 44,
                      borderRadius: 2,
                      fontWeight: 800,
                    }}
                  >
                    Nuevo grupo
                  </Button>
                </Stack>

                <Paper
                  sx={{
                    p: 0,
                    overflow: "hidden",
                    borderRadius: 0,
                    backgroundColor: "background.paper",
                  }}
                >
                  {loading ? (
                    <Box
                      sx={{
                        minHeight: 240,
                        display: "grid",
                        placeItems: "center",
                        px: 2,
                      }}
                    >
                      <Stack spacing={2} alignItems="center">
                        <CircularProgress color="primary" />
                        <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                          Cargando grupos…
                        </Typography>
                      </Stack>
                    </Box>
                  ) : rows.length === 0 ? (
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
                        No hay grupos registrados
                      </Typography>

                      <Typography
                        sx={{
                          mt: 1,
                          color: "text.secondary",
                          fontSize: 14,
                        }}
                      >
                        Crea tu primer grupo para empezar a clasificar ingredientes.
                      </Typography>

                      <Button
                        onClick={openCreate}
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{
                          mt: 2.5,
                          minWidth: 220,
                          height: 44,
                          borderRadius: 2,
                          fontWeight: 800,
                        }}
                      >
                        Nuevo grupo
                      </Button>
                    </Box>
                  ) : (
                    <>
                      {isMobile ? (
                        <Stack spacing={1.5} sx={{ p: 2 }}>
                          {paginatedItems.map((g) => {
                            const active = g.status === "active";
                            const busy = isSaving(g.id);

                            return (
                              <Card
                                key={g.id}
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
                                          {g.name}
                                        </Typography>

                                        <Typography
                                          sx={{
                                            mt: 0.5,
                                            fontSize: 13,
                                            color: "text.secondary",
                                            wordBreak: "break-word",
                                          }}
                                        >
                                          Orden: {g.sort_order ?? 0}
                                        </Typography>
                                      </Box>

                                      <Chip
                                        label={active ? "ACTIVO" : "INACTIVO"}
                                        color={active ? "success" : "default"}
                                        size="small"
                                        sx={{ fontWeight: 800, flexShrink: 0 }}
                                      />
                                    </Stack>

                                    {g.description ? (
                                      <Box>
                                        <Typography sx={mobileLabelSx}>
                                          Descripción
                                        </Typography>
                                        <Typography sx={mobileValueSx}>
                                          {g.description}
                                        </Typography>
                                      </Box>
                                    ) : null}

                                    <Stack spacing={1.25}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "flex-start",
                                          minWidth: 0,
                                        }}
                                      >
                                        <FormControlLabel
                                          sx={{
                                            m: 0,
                                            minWidth: 0,
                                            "& .MuiFormControlLabel-label": {
                                              minWidth: 0,
                                            },
                                          }}
                                          control={
                                            <Switch
                                              checked={active}
                                              onChange={() => handleToggleStatus(g)}
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
                                      </Box>

                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        justifyContent="space-between"
                                      >
                                        <Tooltip title="Editar">
                                          <IconButton
                                            onClick={() => openEdit(g)}
                                            sx={iconEditSx}
                                          >
                                            <EditIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Eliminar">
                                          <IconButton
                                            onClick={() => remove(g)}
                                            sx={iconDeleteSx}
                                          >
                                            <DeleteOutlineIcon fontSize="small" />
                                          </IconButton>
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
                        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
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
                                <TableCell>Nombre</TableCell>
                                <TableCell>Descripción</TableCell>
                                <TableCell>Orden</TableCell>
                                <TableCell align="center">Activo</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                              </TableRow>
                            </TableHead>

                            <TableBody>
                              {paginatedItems.map((g) => {
                                const active = g.status === "active";
                                const busy = isSaving(g.id);

                                return (
                                  <TableRow
                                    key={g.id}
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
                                    <TableCell>
                                      <Typography sx={{ fontWeight: 800 }}>
                                        {g.name}
                                      </Typography>
                                    </TableCell>

                                    <TableCell
                                      sx={{
                                        whiteSpace: "normal !important",
                                        minWidth: 220,
                                      }}
                                    >
                                      {g.description || "—"}
                                    </TableCell>

                                    <TableCell>{g.sort_order ?? 0}</TableCell>

                                    <TableCell align="center">
                                      <FormControlLabel
                                        sx={{ m: 0 }}
                                        control={
                                          <Switch
                                            checked={active}
                                            onChange={() => handleToggleStatus(g)}
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
                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        justifyContent="flex-end"
                                        alignItems="center"
                                        flexWrap="nowrap"
                                      >
                                        <Tooltip title="Editar">
                                          <IconButton
                                            onClick={() => openEdit(g)}
                                            sx={iconEditSx}
                                          >
                                            <EditIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Eliminar">
                                          <IconButton
                                            onClick={() => remove(g)}
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
                        onPrev={prevPage}
                        onNext={nextPage}
                        itemLabel="grupos"
                      />
                    </>
                  )}
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </DialogContent>


      </Dialog>

      <IngredientGroupUpsertModal
        open={upsertOpen}
        onClose={() => setUpsertOpen(false)}
        restaurantId={restaurantId}
        editing={editing}
        onSaved={async (evt) => {
          setUpsertOpen(false);
          setEditing(null);
          setReqTick((prev) => prev + 1);
          await onChanged?.(evt);
        }}
        api={{
          createIngredientGroup,
          updateIngredientGroup,
        }}
      />

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={4000}
      />
    </>
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
  bgcolor: "error.main",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "error.dark",
  },
};