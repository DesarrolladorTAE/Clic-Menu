import { useEffect, useMemo, useRef, useState } from "react";

import {
  Box, Button, Card, CircularProgress, FormControlLabel, IconButton, Paper, Stack,
  Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Tooltip, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import PlaylistAddCheckCircleOutlinedIcon from "@mui/icons-material/PlaylistAddCheckCircleOutlined";

import {
  getVariantAttributeValues,
  createVariantAttributeValue,
  updateVariantAttributeValue,
  deleteVariantAttributeValue,
} from "../../../services/products/variants/variantAttributeValues.service";

import usePagination from "../../../hooks/usePagination";
import PageContainer from "../../common/PageContainer";
import PaginationFooter from "../../common/PaginationFooter";
import AppAlert from "../../common/AppAlert";

const PAGE_SIZE = 5;

function normalizeErr(e) {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors
      ? Object.values(e.response.data.errors).flat().join("\n")
      : "") ||
    "Ocurrió un error"
  );
}

function sortValues(items) {
  return [...items].sort((a, b) => {
    const orderA = Number(a.sort_order ?? 0);
    const orderB = Number(b.sort_order ?? 0);

    if (orderA !== orderB) return orderA - orderB;

    return String(a.value || "").localeCompare(String(b.value || ""), "es");
  });
}

export default function VariantAttributeValuesContent({
  restaurantId,
  productId,
  productName,
  attribute,
  refreshKey = 0,
  onBack,
  onChanged,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState([]);

  const [newValue, setNewValue] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingValueId, setEditingValueId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const [actionId, setActionId] = useState(null);
  const [ordering, setOrdering] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "success",
    title: "",
    message: "",
  });

  const reqRef = useRef(0);

  const showAlert = ({ severity = "success", title = "", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const loadValues = async () => {
    if (!attribute?.id) {
      setValues([]);
      setLoading(false);
      return;
    }

    const myReq = ++reqRef.current;
    setLoading(true);

    try {
      const response = await getVariantAttributeValues(
        restaurantId,
        productId,
        attribute.id,
        { only_active: false }
      );

      if (myReq !== reqRef.current) return;

      setValues(sortValues(Array.isArray(response?.data) ? response.data : []));
    } catch (e) {
      if (myReq !== reqRef.current) return;

      setValues([]);

      showAlert({
        severity: "error",
        title: "No se pudieron cargar las opciones",
        message: normalizeErr(e),
      });
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
    }
  };

  useEffect(() => {
    setNewValue("");
    setEditingValueId(null);
    setEditingText("");
    loadValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, productId, attribute?.id, refreshKey]);

  const sortedValues = useMemo(() => sortValues(values), [values]);

  const nextSortOrder = () => {
    if (values.length === 0) return 1;

    const max = Math.max(...values.map((item) => Number(item.sort_order ?? 0)));
    return (Number.isFinite(max) ? max : 0) + 1;
  };

  const createValue = async () => {
    const value = newValue.trim().replace(/\s+/g, " ");

    if (!attribute?.id) {
      showAlert({
        severity: "warning",
        title: "No hay atributo seleccionado",
        message: "Regresa y selecciona el atributo del producto.",
      });
      return;
    }

    if (!value) {
      showAlert({
        severity: "warning",
        title: "Falta la opción",
        message: "Escribe el nombre de la opción.",
      });
      return;
    }

    setCreating(true);

    try {
      const response = await createVariantAttributeValue(
        restaurantId,
        productId,
        attribute.id,
        {
          value,
          status: "active",
          sort_order: nextSortOrder(),
        }
      );

      const createdValue = response?.data;

      if (createdValue) {
        setValues((prev) => sortValues([...prev, createdValue]));
      }

      setNewValue("");

      showAlert({
        severity: "success",
        title: "Opción agregada",
        message: "La opción se creó correctamente.",
      });

      await onChanged?.(createdValue);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "No se pudo agregar",
        message: normalizeErr(e),
      });
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (row) => {
    setEditingValueId(Number(row.id));
    setEditingText(String(row.value || ""));
  };

  const cancelEdit = () => {
    setEditingValueId(null);
    setEditingText("");
  };

  const saveEdit = async (row) => {
    const value = editingText.trim().replace(/\s+/g, " ");

    if (!value) {
      showAlert({
        severity: "warning",
        title: "Falta la opción",
        message: "El nombre no puede quedar vacío.",
      });
      return;
    }

    setActionId(Number(row.id));

    try {
      const response = await updateVariantAttributeValue(
        restaurantId,
        productId,
        attribute.id,
        row.id,
        { value }
      );

      const updatedValue = response?.data || { ...row, value };

      setValues((prev) =>
        sortValues(
          prev.map((item) =>
            Number(item.id) === Number(row.id)
              ? { ...item, ...updatedValue }
              : item
          )
        )
      );

      cancelEdit();

      showAlert({
        severity: "success",
        title: "Opción actualizada",
        message: "El nombre se actualizó correctamente.",
      });

      await onChanged?.(updatedValue);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "No se pudo guardar",
        message: normalizeErr(e),
      });
    } finally {
      setActionId(null);
    }
  };

  const toggleStatus = async (row) => {
    const nextStatus = row.status === "active" ? "inactive" : "active";
    const snapshot = values;

    setValues((prev) =>
      prev.map((item) =>
        Number(item.id) === Number(row.id)
          ? { ...item, status: nextStatus }
          : item
      )
    );

    setActionId(Number(row.id));

    try {
      const response = await updateVariantAttributeValue(
        restaurantId,
        productId,
        attribute.id,
        row.id,
        { status: nextStatus }
      );

      const updatedValue = response?.data;

      if (updatedValue) {
        setValues((prev) =>
          prev.map((item) =>
            Number(item.id) === Number(row.id)
              ? { ...item, ...updatedValue }
              : item
          )
        );
      }

      await onChanged?.(updatedValue || { ...row, status: nextStatus });
    } catch (e) {
      setValues(snapshot);

      showAlert({
        severity: "error",
        title: "No se pudo cambiar el estado",
        message: normalizeErr(e),
      });
    } finally {
      setActionId(null);
    }
  };

  const deleteValue = async (row) => {
    const confirmed = window.confirm(
      `¿Eliminar "${row.value}"?\n\nSi ya existe una variante relacionada, se conservará desactivada para mantener su historial.`
    );

    if (!confirmed) return;

    const snapshot = values;

    setValues((prev) =>
      prev.filter((item) => Number(item.id) !== Number(row.id))
    );

    setActionId(Number(row.id));

    try {
      await deleteVariantAttributeValue(
        restaurantId,
        productId,
        attribute.id,
        row.id
      );

      if (Number(editingValueId) === Number(row.id)) cancelEdit();

      showAlert({
        severity: "success",
        title: "Opción eliminada",
        message: "La opción se eliminó correctamente.",
      });

      await onChanged?.();
    } catch (e) {
      setValues(snapshot);

      showAlert({
        severity: "error",
        title: "No se pudo eliminar",
        message: normalizeErr(e),
      });
    } finally {
      setActionId(null);
    }
  };

  const moveValue = async (row, direction) => {
    if (ordering) return;

    const current = sortValues(values);
    const index = current.findIndex((item) => Number(item.id) === Number(row.id));

    if (index < 0) return;

    const destinationIndex = index + direction;

    if (destinationIndex < 0 || destinationIndex >= current.length) return;

    const snapshot = values;
    const reordered = [...current];

    [reordered[index], reordered[destinationIndex]] = [
      reordered[destinationIndex],
      reordered[index],
    ];

    const normalized = reordered.map((item, itemIndex) => ({
      ...item,
      sort_order: itemIndex + 1,
    }));

    const previousById = new Map(
      current.map((item) => [Number(item.id), Number(item.sort_order ?? 0)])
    );

    const changes = normalized.filter(
      (item) => previousById.get(Number(item.id)) !== Number(item.sort_order)
    );

    setValues(normalized);
    setOrdering(true);

    try {
      const responses = await Promise.all(
        changes.map((item) =>
          updateVariantAttributeValue(
            restaurantId,
            productId,
            attribute.id,
            item.id,
            { sort_order: Number(item.sort_order) }
          )
        )
      );

      const updatedById = new Map();

      changes.forEach((item, itemIndex) => {
        const updated = responses[itemIndex]?.data;

        if (updated) {
          updatedById.set(Number(item.id), updated);
        }
      });

      if (updatedById.size > 0) {
        setValues((prev) =>
          sortValues(
            prev.map((item) => {
              const updated = updatedById.get(Number(item.id));
              return updated ? { ...item, ...updated } : item;
            })
          )
        );
      }

      await onChanged?.();
    } catch (e) {
      setValues(snapshot);

      showAlert({
        severity: "error",
        title: "No se pudo cambiar el orden",
        message: normalizeErr(e),
      });
    } finally {
      setOrdering(false);
    }
  };

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

  const busy = creating || actionId !== null || ordering;

  return (
    <PageContainer sx={{ py: 0, px: 0 }} innerSx={{ width: "100%" }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: 22, sm: 26 },
              color: "text.primary",
              lineHeight: 1.2,
            }}
          >
            Administrar opciones
          </Typography>

          <Typography
            sx={{
              mt: 0.75,
              fontSize: 14,
              color: "text.secondary",
              lineHeight: 1.5,
            }}
          >
            {attribute?.name
              ? `${attribute.name}${productName ? ` · ${productName}` : ""}`
              : "Administra las opciones del atributo del producto."}
          </Typography>
        </Box>

        {!attribute?.id ? (
          <Paper
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
              textAlign: "center",
              backgroundColor: "background.paper",
            }}
          >
            <Typography sx={{ fontSize: 17, fontWeight: 800, color: "text.primary" }}>
              No hay un atributo seleccionado
            </Typography>

            <Typography sx={{ mt: 0.75, fontSize: 13, color: "text.secondary" }}>
              Regresa a la administración del atributo para continuar.
            </Typography>
          </Paper>
        ) : (
          <>
            <Paper
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "none",
                backgroundColor: "background.paper",
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography sx={{ fontSize: 17, fontWeight: 800, color: "text.primary" }}>
                    Nueva opción
                  </Typography>

                  <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
                    Agrega una opción para este atributo.
                  </Typography>
                </Box>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <TextField
                    fullWidth
                    value={newValue}
                    disabled={creating}
                    placeholder="Ej. Grande"
                    inputProps={{ maxLength: 120 }}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !creating) createValue();
                    }}
                  />

                  <Button
                    type="button"
                    variant="contained"
                    startIcon={
                      creating
                        ? <CircularProgress size={18} color="inherit" />
                        : <AddIcon />
                    }
                    onClick={createValue}
                    disabled={creating || !newValue.trim()}
                    sx={{
                      width: { xs: "100%", sm: "auto" },
                      minWidth: { sm: 180 },
                      height: 44,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {creating ? "Agregando…" : "Agregar opción"}
                  </Button>
                </Stack>
              </Stack>
            </Paper>

            {loading ? (
              <Paper
                sx={{
                  minHeight: 260,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "none",
                  display: "grid",
                  placeItems: "center",
                  backgroundColor: "background.paper",
                }}
              >
                <Stack spacing={1.5} alignItems="center">
                  <CircularProgress size={30} />

                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    Cargando opciones…
                  </Typography>
                </Stack>
              </Paper>
            ) : total === 0 ? (
              <Paper
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "none",
                  textAlign: "center",
                  backgroundColor: "background.paper",
                }}
              >
                <PlaylistAddCheckCircleOutlinedIcon sx={{ fontSize: 38, color: "text.secondary" }} />

                <Typography sx={{ mt: 1, fontSize: 18, fontWeight: 800, color: "text.primary" }}>
                  Todavía no hay opciones
                </Typography>

                <Typography sx={{ mt: 0.75, fontSize: 14, color: "text.secondary" }}>
                  Agrega la primera opción para comenzar.
                </Typography>
              </Paper>
            ) : (
              <Paper
                sx={{
                  p: 0,
                  overflow: "hidden",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "none",
                  backgroundColor: "background.paper",
                }}
              >
                {isMobile ? (
                  <Stack spacing={1.5} sx={{ p: 2 }}>
                    {paginatedItems.map((row) => {
                      const isActive = row.status === "active";
                      const isEditing = Number(editingValueId) === Number(row.id);
                      const processingRow = Number(actionId) === Number(row.id);
                      const absoluteIndex = sortedValues.findIndex(
                        (item) => Number(item.id) === Number(row.id)
                      );

                      return (
                        <Card
                          key={row.id}
                          sx={{
                            width: "100%",
                            minHeight: 220,
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "divider",
                            boxShadow: "none",
                            backgroundColor: "background.paper",
                          }}
                        >
                          <Box sx={{ p: 2 }}>
                            <Stack spacing={2}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="flex-start"
                                spacing={1.5}
                              >
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography sx={mobileLabelSx}>Opción</Typography>

                                  {isEditing ? (
                                    <TextField
                                      fullWidth
                                      autoFocus
                                      value={editingText}
                                      disabled={processingRow}
                                      sx={{ mt: 0.75 }}
                                      inputProps={{ maxLength: 120 }}
                                      onChange={(e) => setEditingText(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" && !processingRow) saveEdit(row);
                                        if (e.key === "Escape" && !processingRow) cancelEdit();
                                      }}
                                    />
                                  ) : (
                                    <Typography
                                      sx={{
                                        mt: 0.4,
                                        fontSize: 18,
                                        fontWeight: 800,
                                        color: "text.primary",
                                        lineHeight: 1.3,
                                        wordBreak: "break-word",
                                      }}
                                    >
                                      {row.value}
                                    </Typography>
                                  )}
                                </Box>

                                {!isEditing ? (
                                  <Stack direction="row" spacing={0.75}>
                                    <Tooltip title="Editar">
                                      <span>
                                        <IconButton
                                          onClick={() => startEdit(row)}
                                          disabled={busy}
                                          sx={iconEditSx}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </span>
                                    </Tooltip>

                                    <Tooltip title="Eliminar">
                                      <span>
                                        <IconButton
                                          onClick={() => deleteValue(row)}
                                          disabled={busy}
                                          sx={iconDeleteSx}
                                        >
                                          <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  </Stack>
                                ) : null}
                              </Stack>

                              {!isEditing ? (
                                <Box>
                                  <Typography sx={mobileLabelSx}>Estado</Typography>

                                  <FormControlLabel
                                    sx={{ m: 0, mt: 0.4 }}
                                    control={
                                      <Switch
                                        checked={isActive}
                                        disabled={busy}
                                        onChange={() => toggleStatus(row)}
                                      />
                                    }
                                    label={
                                      <Typography sx={switchLabelSx}>
                                        {isActive ? "Activo" : "Inactivo"}
                                      </Typography>
                                    }
                                  />
                                </Box>
                              ) : null}

                              <Box
                                sx={{
                                  pt: 1.5,
                                  borderTop: "1px solid",
                                  borderColor: "divider",
                                }}
                              >
                                {isEditing ? (
                                  <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={1}
                                  >
                                    <Button
                                      type="button"
                                      variant="contained"
                                      startIcon={
                                        processingRow
                                          ? <CircularProgress size={17} color="inherit" />
                                          : <SaveIcon />
                                      }
                                      onClick={() => saveEdit(row)}
                                      disabled={processingRow || !editingText.trim()}
                                      sx={{ width: "100%", height: 40, fontWeight: 800 }}
                                    >
                                      Guardar
                                    </Button>

                                    <Button
                                      type="button"
                                      variant="outlined"
                                      onClick={cancelEdit}
                                      disabled={processingRow}
                                      sx={{ width: "100%", height: 40 }}
                                    >
                                      Cancelar
                                    </Button>
                                  </Stack>
                                ) : (
                                  <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    spacing={1}
                                  >
                                    <Box>
                                      <Typography sx={mobileLabelSx}>Orden</Typography>

                                      <Typography sx={{ mt: 0.3, fontSize: 14, fontWeight: 700 }}>
                                        {absoluteIndex + 1}
                                      </Typography>
                                    </Box>

                                    <Stack direction="row" spacing={0.75}>
                                      <Tooltip title="Subir">
                                        <span>
                                          <IconButton
                                            onClick={() => moveValue(row, -1)}
                                            disabled={busy || absoluteIndex <= 0}
                                            sx={iconNeutralSx}
                                          >
                                            <ArrowUpwardIcon fontSize="small" />
                                          </IconButton>
                                        </span>
                                      </Tooltip>

                                      <Tooltip title="Bajar">
                                        <span>
                                          <IconButton
                                            onClick={() => moveValue(row, 1)}
                                            disabled={
                                              busy ||
                                              absoluteIndex < 0 ||
                                              absoluteIndex >= sortedValues.length - 1
                                            }
                                            sx={iconNeutralSx}
                                          >
                                            <ArrowDownwardIcon fontSize="small" />
                                          </IconButton>
                                        </span>
                                      </Tooltip>
                                    </Stack>
                                  </Stack>
                                )}
                              </Box>
                            </Stack>
                          </Box>
                        </Card>
                      );
                    })}
                  </Stack>
                ) : (
                  <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                    <Table sx={{ minWidth: 820 }}>
                      <TableHead>
                        <TableRow
                          sx={{
                            "& th": {
                              backgroundColor: "primary.main",
                              color: "#fff",
                              fontWeight: 800,
                              borderBottom: "none",
                              whiteSpace: "nowrap",
                            },
                          }}
                        >
                          <TableCell>Opción</TableCell>
                          <TableCell width={190}>Estado</TableCell>
                          <TableCell width={150}>Orden</TableCell>
                          <TableCell align="right" width={240}>Acciones</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {paginatedItems.map((row) => {
                          const isActive = row.status === "active";
                          const isEditing = Number(editingValueId) === Number(row.id);
                          const processingRow = Number(actionId) === Number(row.id);
                          const absoluteIndex = sortedValues.findIndex(
                            (item) => Number(item.id) === Number(row.id)
                          );

                          return (
                            <TableRow key={row.id} hover>
                              <TableCell>
                                {isEditing ? (
                                  <TextField
                                    fullWidth
                                    autoFocus
                                    size="small"
                                    value={editingText}
                                    disabled={processingRow}
                                    inputProps={{ maxLength: 120 }}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && !processingRow) saveEdit(row);
                                      if (e.key === "Escape" && !processingRow) cancelEdit();
                                    }}
                                  />
                                ) : (
                                  <Typography
                                    sx={{
                                      fontSize: 14,
                                      fontWeight: 800,
                                      color: "text.primary",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {row.value}
                                  </Typography>
                                )}
                              </TableCell>

                              <TableCell>
                                <FormControlLabel
                                  sx={{ m: 0 }}
                                  control={
                                    <Switch
                                      checked={isActive}
                                      disabled={busy || isEditing}
                                      onChange={() => toggleStatus(row)}
                                    />
                                  }
                                  label={
                                    <Typography sx={switchLabelSx}>
                                      {isActive ? "Activo" : "Inactivo"}
                                    </Typography>
                                  }
                                />
                              </TableCell>

                              <TableCell>
                                <Stack direction="row" spacing={0.75} alignItems="center">
                                  <Typography
                                    sx={{
                                      minWidth: 24,
                                      fontSize: 14,
                                      fontWeight: 700,
                                      color: "text.primary",
                                    }}
                                  >
                                    {absoluteIndex + 1}
                                  </Typography>

                                  <Tooltip title="Subir">
                                    <span>
                                      <IconButton
                                        onClick={() => moveValue(row, -1)}
                                        disabled={busy || isEditing || absoluteIndex <= 0}
                                        sx={iconNeutralSx}
                                      >
                                        <ArrowUpwardIcon fontSize="small" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>

                                  <Tooltip title="Bajar">
                                    <span>
                                      <IconButton
                                        onClick={() => moveValue(row, 1)}
                                        disabled={
                                          busy ||
                                          isEditing ||
                                          absoluteIndex < 0 ||
                                          absoluteIndex >= sortedValues.length - 1
                                        }
                                        sx={iconNeutralSx}
                                      >
                                        <ArrowDownwardIcon fontSize="small" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </Stack>
                              </TableCell>

                              <TableCell align="right">
                                {isEditing ? (
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    justifyContent="flex-end"
                                  >
                                    <Button
                                      type="button"
                                      variant="contained"
                                      startIcon={
                                        processingRow
                                          ? <CircularProgress size={17} color="inherit" />
                                          : <SaveIcon />
                                      }
                                      onClick={() => saveEdit(row)}
                                      disabled={processingRow || !editingText.trim()}
                                      sx={{ height: 40, fontWeight: 800 }}
                                    >
                                      Guardar
                                    </Button>

                                    <Button
                                      type="button"
                                      variant="outlined"
                                      onClick={cancelEdit}
                                      disabled={processingRow}
                                      sx={{ height: 40 }}
                                    >
                                      Cancelar
                                    </Button>
                                  </Stack>
                                ) : (
                                  <Stack
                                    direction="row"
                                    spacing={0.75}
                                    justifyContent="flex-end"
                                  >
                                    <Tooltip title="Editar">
                                      <span>
                                        <IconButton
                                          onClick={() => startEdit(row)}
                                          disabled={busy}
                                          sx={iconEditSx}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </span>
                                    </Tooltip>

                                    <Tooltip title="Eliminar">
                                      <span>
                                        <IconButton
                                          onClick={() => deleteValue(row)}
                                          disabled={busy}
                                          sx={iconDeleteSx}
                                        >
                                          <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  </Stack>
                                )}
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
                  itemLabel="opciones"
                />
              </Paper>
            )}
          </>
        )}

        <Stack direction="row" justifyContent="flex-end">
          <Button
            type="button"
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => onBack?.()}
            disabled={busy}
            sx={{ minWidth: 130, height: 44, fontWeight: 800 }}
          >
            Volver
          </Button>
        </Stack>
      </Stack>

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={3000}
      />
    </PageContainer>
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
  "&:hover": { bgcolor: "#C9AA39" },
  "&.Mui-disabled": {
    bgcolor: "#EFE7BF",
    color: "rgba(255,255,255,0.85)",
  },
};

const iconDeleteSx = {
  width: 40,
  height: 40,
  bgcolor: "error.main",
  color: "#fff",
  "&:hover": { bgcolor: "error.dark" },
  "&.Mui-disabled": {
    bgcolor: "action.disabledBackground",
    color: "action.disabled",
  },
};

const iconNeutralSx = {
  width: 40,
  height: 40,
  bgcolor: "action.hover",
  color: "text.primary",
  border: "1px solid",
  borderColor: "divider",
  "&:hover": { bgcolor: "action.selected" },
};