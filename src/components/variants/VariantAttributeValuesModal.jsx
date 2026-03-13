import { useEffect, useMemo, useRef, useState } from "react";

import {
  Alert, Box, Button, Card, Chip, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton,
  Paper, Stack, Switch, TextField, Tooltip, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import PlaylistAddCheckCircleOutlinedIcon from "@mui/icons-material/PlaylistAddCheckCircleOutlined";

import {
  getVariantAttributeValues,
  createVariantAttributeValue,
  updateVariantAttributeValue,
  deleteVariantAttributeValue,
} from "../../services/products/variants/variantAttributeValues.service";

import usePagination from "../../hooks/usePagination";
import PaginationFooter from "../common/PaginationFooter";
import AppAlert from "../common/AppAlert";

function normalizeErr(e) {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors
      ? Object.values(e.response.data.errors).flat().join("\n")
      : "") ||
    "Ocurrió un error"
  );
}

const PAGE_SIZE = 4;

export default function VariantAttributeValuesModal({
  open,
  onClose,
  restaurantId,
  attribute,
  onSaved,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [values, setValues] = useState([]);
  const [newValue, setNewValue] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingValueId, setEditingValueId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingOrder, setEditingOrder] = useState("");

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "success",
    title: "",
    message: "",
  });

  const reqRef = useRef(0);

  const showAlert = ({
    severity = "success",
    title = "",
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

  const loadValues = async ({ silent = false } = {}) => {
    if (!attribute?.id) return;

    const myReq = ++reqRef.current;

    if (!silent) setLoading(true);
    setErr("");

    try {
      const res = await getVariantAttributeValues(
        restaurantId,
        attribute.id,
        { only_active: false }
      );

      if (myReq !== reqRef.current) return;

      const list = Array.isArray(res?.data) ? res.data : [];

      const sorted = [...list].sort((a, b) => {
        const ao = Number(a.sort_order ?? 0);
        const bo = Number(b.sort_order ?? 0);
        if (ao !== bo) return ao - bo;
        return String(a.value || "").localeCompare(String(b.value || ""), "es");
      });

      setValues(sorted);
    } catch (e) {
      if (myReq !== reqRef.current) return;
      setErr(normalizeErr(e));
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setErr("");
    setNewValue("");
    setEditingValueId(null);
    setEditingText("");
    setEditingOrder("");
    loadValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, restaurantId, attribute?.id]);

  useEffect(() => {
    if (!err) return;

    const timer = setTimeout(() => {
        setErr("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [err]);




  const getNextSortOrder = () => {
    if (!values.length) return 1;
    const max = Math.max(...values.map((item) => Number(item.sort_order ?? 0)));
    return (Number.isFinite(max) ? max : 0) + 1;
  };

  const createValue = async () => {
    const value = newValue.trim();

    if (!attribute?.id) {
      setErr("No hay atributo seleccionado.");
      return;
    }

    if (!value) {
      setErr("Escribe un valor.");
      return;
    }

    setErr("");
    setCreating(true);

    try {
      await createVariantAttributeValue(restaurantId, attribute.id, {
        value,
        status: "active",
        sort_order: getNextSortOrder(),
      });

      setNewValue("");

      showAlert({
        severity: "success",
        title: "Valor creado",
        message: "El valor se creó correctamente.",
      });

      await loadValues({ silent: true });
      await onSaved?.();
    } catch (e) {
      setErr(normalizeErr(e));
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (row) => {
    setErr("");
    setEditingValueId(Number(row.id));
    setEditingText(String(row.value || ""));
    setEditingOrder(String(row.sort_order ?? 0));
  };

  const cancelEdit = () => {
    setEditingValueId(null);
    setEditingText("");
    setEditingOrder("");
  };

  const saveEdit = async (rowId) => {
    const value = editingText.trim();
    const sortOrder = Number(editingOrder);

    if (!value) {
      setErr("El valor no puede ir vacío.");
      return;
    }

    if (!Number.isFinite(sortOrder) || sortOrder < 0) {
      setErr("El orden debe ser un número mayor o igual a 0.");
      return;
    }

    setErr("");

    try {
      await updateVariantAttributeValue(restaurantId, attribute.id, rowId, {
        value,
        sort_order: sortOrder,
      });

      cancelEdit();

      showAlert({
        severity: "success",
        title: "Valor actualizado",
        message: "El valor se actualizó correctamente.",
      });

      await loadValues({ silent: true });
      await onSaved?.();
    } catch (e) {
      setErr(normalizeErr(e));
    }
  };

  const onToggleStatus = async (row) => {
    const nextStatus = row.status === "active" ? "inactive" : "active";
    const snapshot = values;

    setValues((prev) =>
      prev.map((item) =>
        Number(item.id) === Number(row.id)
          ? { ...item, status: nextStatus }
          : item
      )
    );

    try {
      await updateVariantAttributeValue(restaurantId, attribute.id, row.id, {
        status: nextStatus,
      });

      showAlert({
        severity: "success",
        title: "Estado actualizado",
        message:
          nextStatus === "active"
            ? "El valor quedó activo."
            : "El valor quedó inactivo.",
      });

      await loadValues({ silent: true });
      await onSaved?.();
    } catch (e) {
      setValues(snapshot);
      setErr(normalizeErr(e));
    }
  };

  const onDelete = async (row) => {
    const ok = window.confirm(
      `¿Eliminar valor?\n\n${row.value}\n\nEsto puede invalidar variantes relacionadas.`
    );
    if (!ok) return;

    const snapshot = values;
    setValues((prev) =>
      prev.filter((item) => Number(item.id) !== Number(row.id))
    );

    try {
      await deleteVariantAttributeValue(restaurantId, attribute.id, row.id);

      showAlert({
        severity: "success",
        title: "Valor eliminado",
        message: "El valor se eliminó correctamente.",
      });

      await loadValues({ silent: true });
      await onSaved?.();
    } catch (e) {
      setValues(snapshot);
      setErr(normalizeErr(e));
    }
  };

  const swapOrder = async (row, direction) => {
    const list = [...values].sort(
      (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
    );

    const idx = list.findIndex((item) => Number(item.id) === Number(row.id));
    if (idx < 0) return;

    const otherIdx = idx + direction;
    if (otherIdx < 0 || otherIdx >= list.length) return;

    const current = list[idx];
    const other = list[otherIdx];

    const snapshot = values;

    setValues((prev) =>
      prev.map((item) => {
        if (Number(item.id) === Number(current.id)) {
          return { ...item, sort_order: Number(other.sort_order ?? 0) };
        }
        if (Number(item.id) === Number(other.id)) {
          return { ...item, sort_order: Number(current.sort_order ?? 0) };
        }
        return item;
      })
    );

    try {
      await Promise.all([
        updateVariantAttributeValue(
          restaurantId,
          attribute.id,
          current.id,
          { sort_order: Number(other.sort_order ?? 0) }
        ),
        updateVariantAttributeValue(
          restaurantId,
          attribute.id,
          other.id,
          { sort_order: Number(current.sort_order ?? 0) }
        ),
      ]);

      await loadValues({ silent: true });
      await onSaved?.();
    } catch (e) {
      setValues(snapshot);
      setErr(normalizeErr(e));
    }
  };

  const sortedValues = useMemo(() => {
    return [...values].sort((a, b) => {
      const ao = Number(a.sort_order ?? 0);
      const bo = Number(b.sort_order ?? 0);
      if (ao !== bo) return ao - bo;
      return String(a.value || "").localeCompare(String(b.value || ""), "es");
    });
  }, [values]);

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
    items: sortedValues,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  if (!open) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={loading ? undefined : onClose}
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
                Valores del atributo
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                {attribute?.name
                  ? `Administrando valores de: ${attribute.name}`
                  : "Administra los valores del atributo seleccionado."}
              </Typography>
            </Box>

            <IconButton
              onClick={onClose}
              disabled={loading}
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
          <Stack spacing={2.5}>
            {err ? (
              <Alert
                severity="error"
                sx={{
                  borderRadius: 1,
                  alignItems: "flex-start",
                  whiteSpace: "pre-line",
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                    No se pudo completar la acción
                  </Typography>
                  <Typography variant="body2">{err}</Typography>
                </Box>
              </Alert>
            ) : null}

            <Paper
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 0,
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "none",
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "text.primary",
                    }}
                  >
                    Nuevo valor
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 13,
                      color: "text.secondary",
                    }}
                  >
                    Los nuevos valores se crean activos y con el siguiente orden
                    disponible.
                  </Typography>
                </Box>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <TextField
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Ej. Grande"
                  />

                  <Button
                    onClick={createValue}
                    disabled={creating}
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                      minWidth: { xs: "100%", sm: 180 },
                      height: 44,
                      borderRadius: 2,
                      fontWeight: 800,
                    }}
                  >
                    {creating ? "Guardando…" : "Agregar valor"}
                  </Button>
                </Stack>
              </Stack>
            </Paper>

            {loading ? (
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 0,
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "none",
                  textAlign: "center",
                }}
              >
                <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                  Cargando valores…
                </Typography>
              </Paper>
            ) : total === 0 ? (
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 0,
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "none",
                  textAlign: "center",
                }}
              >
                <PlaylistAddCheckCircleOutlinedIcon
                  sx={{
                    fontSize: 34,
                    color: "text.secondary",
                  }}
                />

                <Typography
                  sx={{
                    mt: 1,
                    fontSize: 18,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  No hay valores todavía
                </Typography>

                <Typography
                  sx={{
                    mt: 0.75,
                    fontSize: 14,
                    color: "text.secondary",
                  }}
                >
                  Agrega el primer valor para este atributo.
                </Typography>
              </Paper>
            ) : (
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
                    p: 2,
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 2,
                  }}
                >
                  {paginatedItems.map((row, idx) => {
                    const isActive = row.status === "active";
                    const isEditing = Number(editingValueId) === Number(row.id);

                    return (
                      <Card
                        key={row.id}
                        sx={{
                          borderRadius: 1,
                          boxShadow: "none",
                          border: "1px solid",
                          borderColor: "divider",
                          backgroundColor: "#fff",
                        }}
                      >
                        <Box sx={{ p: 2 }}>
                          <Stack spacing={1.75}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              spacing={1.5}
                            >
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                {isEditing ? (
                                  <Stack spacing={1}>
                                    <TextField
                                      value={editingText}
                                      onChange={(e) =>
                                        setEditingText(e.target.value)
                                      }
                                      placeholder="Valor"
                                    />

                                    <TextField
                                      type="number"
                                      value={editingOrder}
                                      onChange={(e) =>
                                        setEditingOrder(e.target.value)
                                      }
                                      placeholder="Orden"
                                    />
                                  </Stack>
                                ) : (
                                  <>
                                    <Typography
                                      sx={{
                                        fontSize: 18,
                                        fontWeight: 800,
                                        color: "text.primary",
                                        lineHeight: 1.25,
                                        wordBreak: "break-word",
                                      }}
                                    >
                                      {row.value}
                                    </Typography>

                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      flexWrap="wrap"
                                      useFlexGap
                                      sx={{ mt: 1 }}
                                    >
                                      <Chip
                                        size="small"
                                        label={`Orden ${row.sort_order ?? 0}`}
                                        sx={{ fontWeight: 800 }}
                                      />
                                      <Chip
                                        size="small"
                                        label={
                                          isActive ? "Activo" : "Inactivo"
                                        }
                                        color={isActive ? "success" : "default"}
                                        sx={{ fontWeight: 800 }}
                                      />
                                    </Stack>
                                  </>
                                )}
                              </Box>

                              {!isEditing ? (
                                <Stack direction="row" spacing={1}>
                                  <Tooltip title="Editar">
                                    <IconButton
                                      onClick={() => startEdit(row)}
                                      sx={iconEditSx}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Eliminar">
                                    <IconButton
                                      onClick={() => onDelete(row)}
                                      sx={iconDeleteSx}
                                    >
                                      <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              ) : null}
                            </Stack>

                            {!isEditing ? (
                              <Stack spacing={1}>
                                <Stack
                                  direction={{ xs: "column", sm: "row" }}
                                  spacing={{ xs: 0.5, sm: 1.25 }}
                                  alignItems={{ xs: "flex-start", sm: "center" }}
                                >
                                  <Typography sx={mobileLabelSx}>
                                    Estado
                                  </Typography>

                                  <FormControlLabel
                                    sx={{
                                      m: 0,
                                      "& .MuiFormControlLabel-label": {
                                        minWidth: 0,
                                      },
                                    }}
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
                                </Stack>
                              </Stack>
                            ) : null}

                            <Box
                              sx={{
                                pt: 1,
                                borderTop: "1px solid",
                                borderColor: "divider",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: 12,
                                  fontWeight: 800,
                                  color: "text.secondary",
                                  mb: 1,
                                  textTransform: "uppercase",
                                  letterSpacing: 0.35,
                                }}
                              >
                                Acciones
                              </Typography>

                              {isEditing ? (
                                <Stack
                                  direction={{ xs: "column", sm: "row" }}
                                  spacing={1}
                                >
                                  <Button
                                    onClick={() => saveEdit(row.id)}
                                    variant="contained"
                                    sx={{
                                      height: 40,
                                      borderRadius: 2,
                                      fontSize: 12,
                                      fontWeight: 800,
                                    }}
                                  >
                                    Guardar
                                  </Button>

                                  <Button
                                    onClick={cancelEdit}
                                    variant="outlined"
                                    sx={{
                                      height: 40,
                                      borderRadius: 2,
                                      fontSize: 12,
                                      fontWeight: 800,
                                    }}
                                  >
                                    Cancelar
                                  </Button>
                                </Stack>
                              ) : (
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  flexWrap="wrap"
                                  useFlexGap
                                >
                                  <Tooltip title="Subir">
                                    <span>
                                      <IconButton
                                        onClick={() => swapOrder(row, -1)}
                                        disabled={startItem + idx - 1 <= 0}
                                        sx={iconNeutralSx}
                                      >
                                        <ArrowUpwardIcon fontSize="small" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>

                                  <Tooltip title="Bajar">
                                    <span>
                                      <IconButton
                                        onClick={() => swapOrder(row, 1)}
                                        disabled={
                                          startItem + idx >= sortedValues.length
                                        }
                                        sx={iconNeutralSx}
                                      >
                                        <ArrowDownwardIcon fontSize="small" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </Stack>
                              )}
                            </Box>
                          </Stack>
                        </Box>
                      </Card>
                    );
                  })}
                </Box>

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
                  itemLabel="valores"
                />
              </Paper>
            )}
          </Stack>
        </DialogContent>
      </Dialog>

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

const iconNeutralSx = {
  width: 40,
  height: 40,
  bgcolor: "#F4F4F4",
  color: "text.primary",
  borderRadius: 1.5,
  border: "1px solid",
  borderColor: "divider",
  "&:hover": {
    bgcolor: "#ECECEC",
  },
  "&.Mui-disabled": {
    opacity: 0.45,
  },
};