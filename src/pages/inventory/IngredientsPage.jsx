import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Alert, Box, Button, Card, Chip, CircularProgress, FormControlLabel, IconButton, Paper, Stack, Switch,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CategoryIcon from "@mui/icons-material/Category";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";

import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "../../services/inventory/ingredients/ingredients.service";


import AppAlert from "../../components/common/AppAlert";
import usePagination from "../../hooks/usePagination";
import PaginationFooter from "../../components/common/PaginationFooter";

import { normalizeErr } from "../../utils/err";
import IngredientFormModal from "../../components/inventory/IngredientFormModal";

const PAGE_SIZE = 5;

function pct(v) {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return `${n}%`;
}

export default function IngredientsPage() {
  const nav = useNavigate();
  const { restaurantId } = useParams();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const [rows, setRows] = useState([]);

  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

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

  const title = useMemo(() => "Configuración de Ingredientes", []);

  const load = async ({ initial = false } = {}) => {
    const myReq = ++reqRef.current;

    if (initial) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await getIngredients(restaurantId, {
        only_active: onlyActive,
        q,
      });

      if (myReq !== reqRef.current) return;
      setRows(res?.data || []);
    } catch (e) {
      if (myReq !== reqRef.current) return;

      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudieron cargar los ingredientes"),
      });
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load({ initial: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  useEffect(() => {
    const t = setTimeout(() => load({ initial: false }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, onlyActive]);

  const onNew = () => {
    setEditRow(null);
    setModalOpen(true);
  };

  const onEdit = (row) => {
    setEditRow(row);
    setModalOpen(true);
  };

  const onDelete = async (row) => {
    const ok = window.confirm(
      `¿Eliminar ingrediente?\n\n${row.name}\n\nSi tiene historial, el backend NO lo borrará y solo lo desactivará.`
    );
    if (!ok) return;

    const snapshot = rows;
    setRows((prev) => prev.filter((x) => x.id !== row.id));

    try {
      const res = await deleteIngredient(restaurantId, row.id);

      const mode = res?.mode;
      const message = res?.message;

      if (mode === "inactivated") {
        showAlert({
          severity: "info",
          title: "Información",
          message:
            message || "Este ingrediente tiene historial. Solo puede desactivarse.",
        });
      } else if (mode === "already_inactive") {
        showAlert({
          severity: "info",
          title: "Información",
          message: message || "Ingrediente ya estaba inactivo.",
        });
      } else if (mode === "deleted") {
        showAlert({
          severity: "success",
          title: "Hecho",
          message: message || "Ingrediente eliminado.",
        });
      } else {
        showAlert({
          severity: "info",
          title: "Información",
          message: message || "Acción realizada.",
        });
      }

      await load({ initial: false });
    } catch (e) {
      setRows(snapshot);
      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo eliminar"),
      });
    }
  };

  const buildFullUpdatePayloadForStatus = (row, nextStatus) => {
    const payload = {
      status: nextStatus,
      name: row.name,
      unit: row.unit,
      ingredient_group_id: row.ingredient_group_id ?? null,
      is_stock_item: !!row.is_stock_item,
      waste_percentage: row.waste_percentage ?? null,
      code: row.code ?? null,
    };

    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
    return payload;
  };

  const onToggleStatus = async (row) => {
    const needsGroup = Number(row.needs_group) === 1;

    if (needsGroup) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message:
          "Este ingrediente no tiene grupo. Está inactivo. Edita y elige un grupo para poder activarlo.",
      });
      onEdit(row);
      return;
    }

    const next = row.status === "active" ? "inactive" : "active";

    const snapshot = rows;
    setRows((prev) =>
      prev.map((x) => (x.id === row.id ? { ...x, status: next } : x))
    );

    try {
      const payload = buildFullUpdatePayloadForStatus(row, next);
      await updateIngredient(restaurantId, row.id, payload);
    } catch (e) {
      setRows(snapshot);
      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo actualizar estado"),
      });
    }
  };

  const onPresentations = (row) => {
    nav(`/owner/restaurants/${restaurantId}/operation/ingredients/${row.id}/presentations`);
  };

  const filteredRows = useMemo(() => rows, [rows]);

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
    items: filteredRows,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="primary" />
          <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
            Cargando ingredientes…
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 8, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        <Stack spacing={3}>
          {/* Header */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: 30, md: 42 },
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.1,
                }}
              >
                {title}
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: { xs: 15, md: 18 },
                }}
              >
                Define los ingredientes que utilizará tu restaurante para operar sus recetas e inventario.
              </Typography>

              {refreshing ? (
                <Typography
                  sx={{
                    mt: 1,
                    fontSize: 13,
                    color: "text.secondary",
                  }}
                >
                  Actualizando cambios…
                </Typography>
              ) : null}
            </Box>

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              spacing={1.5}
              width={{ xs: "100%", md: "auto" }}
            >
              <Button
                onClick={onNew}
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  minWidth: { xs: "100%", sm: 210 },
                  height: 44,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                Nuevo ingrediente
              </Button>
            </Stack>
          </Stack>

          {/* Instrucciones */}
          <Paper
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 1,
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
            }}
          >
            <Stack spacing={1.5}>
              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                Antes de comenzar
              </Typography>

              <Stack spacing={1}>
                <InstructionRow
                  step="1"
                  text="Crea los ingredientes que va a ocupar tu restaurante para sus sucursales."
                />
                <InstructionRow
                  step="2"
                  text="Asigna una presentación a cada ingrediente para usarlo correctamente en costos e inventario."
                />
              </Stack>
            </Stack>
          </Paper>

          {/* Filtros */}
          <Paper
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 1,
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
            }}
          >
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", md: "flex-end" }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography sx={fieldLabelSx}>Buscar ingrediente</Typography>

                  <TextField
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar por nombre o clave…"
                    fullWidth
                  />

                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: 12,
                      color: "text.secondary",
                    }}
                  >
                    Aquí puedes localizar rápidamente un ingrediente por nombre o clave interna.
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={onlyActive}
                      onChange={(e) => setOnlyActive(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography sx={switchLabelSx}>
                      Solo ingredientes activos
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />

                <Typography
                  sx={{
                    fontSize: 13,
                    color: "text.secondary",
                    fontWeight: 700,
                  }}
                >
                  Mostrando {rows.length} ingredientes
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          {/* Catálogo */}
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
                Catálogo de ingredientes
              </Typography>
            </Box>

            {rows.length === 0 ? (
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
                  No hay ingredientes registrados
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "text.secondary",
                    fontSize: 14,
                  }}
                >
                  Crea tu primer ingrediente para comenzar a organizar tu inventario.
                </Typography>

                <Button
                  onClick={onNew}
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
                  Nuevo ingrediente
                </Button>
              </Box>
            ) : (
              <>
                {isMobile ? (
                  <Stack spacing={1.5} sx={{ p: 2 }}>
                    {paginatedItems.map((r) => {
                      const needsGroup = Number(r.needs_group) === 1;
                      const statusEffective = needsGroup ? "inactive" : r.status;
                      const isActive = statusEffective === "active";

                      return (
                        <Card
                          key={r.id}
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
                                    {r.name}
                                  </Typography>

                                  <Typography
                                    sx={{
                                      mt: 0.5,
                                      fontSize: 13,
                                      color: "text.secondary",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {r.code ? `Clave: ${r.code}` : "Sin clave"} · ID: {r.id}
                                  </Typography>
                                </Box>

                              </Stack>

                              <Box>
                                <Typography sx={mobileLabelSx}>Unidad base</Typography>
                                <Typography sx={mobileValueSx}>{r.unit}</Typography>
                              </Box>

                              <Box>
                                <Typography sx={mobileLabelSx}>Grupo</Typography>

                                {needsGroup ? (
                                  <Stack spacing={1} sx={{ mt: 0.5 }}>
                                    <Chip
                                      label={r.group_name || "Falta grupo de ingredientes"}
                                      color="warning"
                                      size="small"
                                      sx={{
                                        fontWeight: 800,
                                        width: "fit-content",
                                      }}
                                    />

                                    <Button
                                      onClick={() => onEdit(r)}
                                      variant="outlined"
                                      startIcon={<CategoryIcon />}
                                      sx={{
                                        width: "100%",
                                        height: 40,
                                        borderRadius: 2,
                                        fontSize: 12,
                                        fontWeight: 800,
                                      }}
                                    >
                                      Elegir grupo
                                    </Button>
                                  </Stack>
                                ) : (
                                  <Chip
                                    label={r.group_name || "—"}
                                    size="small"
                                    sx={{
                                      mt: 0.5,
                                      fontWeight: 800,
                                      width: "fit-content",
                                      bgcolor: "#EEF2FF",
                                      color: "#3F3A52",
                                    }}
                                  />
                                )}
                              </Box>

                              <Box>
                                <Typography sx={mobileLabelSx}>Merma</Typography>
                                <Typography sx={mobileValueSx}>{pct(r.waste_percentage)}</Typography>
                              </Box>

                              <Box>
                                <Typography sx={mobileLabelSx}>Inventariable</Typography>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1}
                                  sx={{ mt: 0.5 }}
                                >
                                  {r.is_stock_item ? (
                                    <CheckCircleIcon sx={{ fontSize: 18, color: "success.main" }} />
                                  ) : (
                                    <BlockIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                  )}
                                  <Typography sx={mobileValueSx}>
                                    {r.is_stock_item ? "Sí" : "No"}
                                  </Typography>
                                </Stack>
                              </Box>

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
                                        checked={isActive}
                                        onChange={() =>
                                          onToggleStatus({ ...r, status: statusEffective })
                                        }
                                        color="primary"
                                      />
                                    }
                                    label={
                                      <Typography sx={switchLabelSx}>
                                        {isActive ? "Activo" : "Inactivo"}
                                      </Typography>
                                    }
                                  />
                                </Box>

                                <Stack direction="row" spacing={1} justifyContent="space-between">
                                  <Button
                                    onClick={() => onPresentations(r)}
                                    variant="contained"
                                    color="secondary"
                                    sx={{
                                      flex: 1,
                                      height: 40,
                                      borderRadius: 2,
                                      fontSize: 12,
                                      fontWeight: 800,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    Presentaciones
                                  </Button>

                                  <Tooltip title="Editar">
                                    <IconButton
                                      onClick={() => onEdit(r)}
                                      sx={iconEditSx}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Eliminar">
                                    <IconButton
                                      onClick={() => onDelete(r)}
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
                    <Table sx={{ minWidth: 1040 }}>
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
                          <TableCell>Unidad base</TableCell>
                          <TableCell>Grupo</TableCell>
                          <TableCell>Merma</TableCell>
                          <TableCell>Inventariable</TableCell>
                          <TableCell align="center">Activo</TableCell>
                          <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {paginatedItems.map((r) => {
                          const needsGroup = Number(r.needs_group) === 1;
                          const statusEffective = needsGroup ? "inactive" : r.status;
                          const isActive = statusEffective === "active";

                          return (
                            <TableRow
                              key={r.id}
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
                                <Stack spacing={0.5}>
                                  <Typography sx={{ fontWeight: 800 }}>{r.name}</Typography>
                                  <Typography
                                    sx={{
                                      fontSize: 12,
                                      color: "text.secondary",
                                      whiteSpace: "normal",
                                    }}
                                  >
                                    {r.code ? `Clave: ${r.code}` : "Sin clave"} · ID: {r.id}
                                  </Typography>
                                </Stack>
                              </TableCell>

                              <TableCell sx={{ fontWeight: 700 }}>{r.unit}</TableCell>

                              <TableCell>
                                {needsGroup ? (
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip
                                      label={r.group_name || "Falta grupo de ingredientes"}
                                      color="warning"
                                      size="small"
                                      sx={{ fontWeight: 800 }}
                                    />

                                    <Button
                                      onClick={() => onEdit(r)}
                                      variant="outlined"
                                      startIcon={<CategoryIcon />}
                                      sx={{
                                        height: 34,
                                        borderRadius: 2,
                                        fontSize: 12,
                                        fontWeight: 800,
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      Elegir grupo
                                    </Button>
                                  </Stack>
                                ) : (
                                  <Chip
                                    label={r.group_name || "—"}
                                    size="small"
                                    sx={{
                                      fontWeight: 800,
                                      bgcolor: "#EEF2FF",
                                      color: "#3F3A52",
                                    }}
                                  />
                                )}
                              </TableCell>

                              <TableCell>{pct(r.waste_percentage)}</TableCell>

                              <TableCell>
                                <Chip
                                  label={r.is_stock_item ? "SÍ" : "NO"}
                                  color={r.is_stock_item ? "success" : "default"}
                                  size="small"
                                  sx={{
                                    fontWeight: 800,
                                    minWidth: 70,
                                  }}
                                />
                              </TableCell>

                              <TableCell align="center">
                                <Switch
                                  checked={isActive}
                                  onChange={() =>
                                    onToggleStatus({ ...r, status: statusEffective })
                                  }
                                  color="primary"
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
                                  <Button
                                    onClick={() => onPresentations(r)}
                                    variant="contained"
                                    color="secondary"
                                    sx={{
                                      height: 36,
                                      minWidth: 140,
                                      borderRadius: 2,
                                      fontSize: 12,
                                      fontWeight: 800,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    Presentaciones
                                  </Button>

                                  <Tooltip title="Editar">
                                    <IconButton
                                      onClick={() => onEdit(r)}
                                      sx={iconEditSx}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Eliminar">
                                    <IconButton
                                      onClick={() => onDelete(r)}
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
                  itemLabel="ingredientes"
                />
              </>
            )}
          </Paper>

          <Typography
            sx={{
              fontSize: 12,
              color: "text.secondary",
              lineHeight: 1.5,
            }}
          >
            Nota: si un ingrediente no tiene grupo, el sistema no permitirá activarlo hasta que completes esa configuración.
          </Typography>
        </Stack>
      </Box>

      <IngredientFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        restaurantId={restaurantId}
        editRow={editRow}
        onSaved={async () => {
          setModalOpen(false);
          await load({ initial: false });
        }}
        api={{
          createIngredient,
          updateIngredient,
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
    </Box>
  );
}

function InstructionRow({ step, text }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          minWidth: 28,
          height: 28,
          borderRadius: 999,
          bgcolor: "primary.main",
          color: "#fff",
          display: "grid",
          placeItems: "center",
          fontSize: 13,
          fontWeight: 800,
        }}
      >
        {step}
      </Box>

      <Typography
        sx={{
          fontSize: 14,
          color: "text.primary",
          lineHeight: 1.6,
        }}
      >
        {text}
      </Typography>
    </Stack>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};

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