import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { normalizeErr } from "../../utils/err";

import {
  Alert, Box, Button, Card, Chip, CircularProgress,FormControlLabel, IconButton, Paper, Stack, Switch,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

import {
  getIngredientPresentations,
  createIngredientPresentation,
  updateIngredientPresentation,
  deleteIngredientPresentation,
} from "../../services/inventory/ingredients/ingredientPresentations.service";

import AppAlert from "../../components/common/AppAlert";
import usePagination from "../../hooks/usePagination";
import PaginationFooter from "../../components/common/PaginationFooter";

import IngredientPresentationFormModal from "../../components/inventory/IngredientPresentationFormModal";
import SupplierWizard from "../../components/inventory/SupplierWizard";


const PAGE_SIZE = 5;

function money(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

export default function IngredientPresentationsPage() {
  const nav = useNavigate();
  const { restaurantId, ingredientId } = useParams();

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

  const [ingredient, setIngredient] = useState(null);
  const [rows, setRows] = useState([]);

  const [onlyActive, setOnlyActive] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const [openSupplierWizard, setOpenSupplierWizard] = useState(false);

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

  const load = async ({ initial = false } = {}) => {
    const myReq = ++reqRef.current;

    if (initial) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await getIngredientPresentations(restaurantId, ingredientId, {
        only_active: onlyActive,
      });

      if (myReq !== reqRef.current) return;

      setIngredient(res?.ingredient || null);
      setRows(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      if (myReq !== reqRef.current) return;

      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudieron cargar las presentaciones"),
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
  }, [restaurantId, ingredientId]);

  useEffect(() => {
    const t = setTimeout(() => load({ initial: false }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyActive]);

  const onNew = () => {
    setEditRow(null);
    setModalOpen(true);
  };

  const onEdit = (row) => {
    setEditRow(row);
    setModalOpen(true);
  };

  const onDelete = async (row) => {
    const ok = window.confirm(`¿Eliminar presentación?\n\n${row.description}\n`);
    if (!ok) return;

    const snapshot = rows;
    setRows((prev) => prev.filter((x) => x.id !== row.id));

    try {
      const res = await deleteIngredientPresentation(
        restaurantId,
        ingredientId,
        row.id
      );

      if (res?.mode === "inactivated") {
        showAlert({
          severity: "info",
          title: "Información",
          message:
            res?.message ||
            "La presentación no pudo eliminarse y fue desactivada.",
        });
        await load({ initial: false });
      } else {
        showAlert({
          severity: "success",
          title: "Hecho",
          message: res?.message || "Presentación eliminada correctamente.",
        });
      }
    } catch (e) {
      setRows(snapshot);
      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo eliminar"),
      });
    }
  };

  const onToggleStatus = async (row) => {
    const isOrphan = Number(row.needs_supplier) === 1;

    if (isOrphan) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "No puedes activarla hasta asignar proveedor.",
      });
      return;
    }

    const next = row.status === "active" ? "inactive" : "active";
    const snapshot = rows;

    setRows((prev) =>
      prev.map((x) => (x.id === row.id ? { ...x, status: next } : x))
    );

    try {
      await updateIngredientPresentation(restaurantId, ingredientId, row.id, {
        status: next,
      });
    } catch (e) {
      setRows(snapshot);
      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo actualizar el estado"),
      });
    }
  };

  const hasOrphans = useMemo(
    () => rows.some((r) => Number(r.needs_supplier) === 1),
    [rows]
  );

  const title = useMemo(() => {
    return `Configuración de ingredientes → ${
      ingredient?.name || `Ingrediente ${ingredientId}`
    }`;
  }, [ingredient?.name, ingredientId]);

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

  const handleBack = () => {
    nav(`/owner/restaurants/${restaurantId}/operation/ingredients`);
  };

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
            Cargando presentaciones…
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
      <Box sx={{ maxWidth: 1150, mx: "auto" }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: 28, md: 40 },
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
                  fontSize: { xs: 14, md: 17 },
                }}
              >
                Administra las presentaciones de compra del ingrediente, sus proveedores y el rendimiento de cada una.
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: 13,
                }}
              >
                Unidad base: <strong>{ingredient?.unit || "—"}</strong>
                {refreshing ? (
                  <span style={{ marginLeft: 10 }}>Actualizando cambios…</span>
                ) : null}
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              spacing={1.5}
              width={{ xs: "100%", md: "auto" }}
            >
              <Button
                onClick={handleBack}
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                sx={{
                  minWidth: { xs: "100%", sm: 150 },
                  height: 44,
                  borderRadius: 2,
                }}
              >
                Volver
              </Button>

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
                Nueva
              </Button>
            </Stack>
          </Stack>

          {hasOrphans ? (
            <Alert
              severity="warning"
              sx={{
                borderRadius: 1,
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                  Atención
                </Typography>
                <Typography variant="body2">
                  Hay presentaciones sin proveedor asignado. No podrán activarse hasta completar esa información.
                </Typography>
              </Box>
            </Alert>
          ) : null}

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
                    Solo presentaciones activas
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
                Mostrando {rows.length} presentaciones
              </Typography>
            </Stack>
          </Paper>

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
                Presentaciones registradas
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
                  No hay presentaciones registradas
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "text.secondary",
                    fontSize: 14,
                  }}
                >
                  Crea la primera presentación para este ingrediente.
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
                  Nueva presentación
                </Button>
              </Box>
            ) : (
              <>
                {isMobile ? (
                  <Stack spacing={1.5} sx={{ p: 2 }}>
                    {paginatedItems.map((r) => {
                      const isOrphan = Number(r.needs_supplier) === 1;
                      const isActive = r.status === "active";

                      return (
                        <Card
                          key={r.id}
                          sx={{
                            borderRadius: 1,
                            boxShadow: "none",
                            border: "1px solid",
                            borderColor: isOrphan ? "warning.main" : "divider",
                            backgroundColor: isOrphan ? "#FFF9E6" : "#fff",
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
                                    {r.description}
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

                                <Chip
                                  label={isActive ? "ACTIVO" : "INACTIVO"}
                                  color={isActive ? "success" : "default"}
                                  size="small"
                                  sx={{ fontWeight: 800, flexShrink: 0 }}
                                />
                              </Stack>

                              <Box>
                                <Typography sx={mobileLabelSx}>Proveedor</Typography>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1}
                                  sx={{ mt: 0.5, flexWrap: "wrap" }}
                                >
                                  <Typography sx={mobileValueSx}>
                                    {r.supplier_name || "—"}
                                  </Typography>

                                  {isOrphan ? (
                                    <Chip
                                      label="FALTA PROVEEDOR"
                                      color="warning"
                                      size="small"
                                      sx={{ fontWeight: 800 }}
                                    />
                                  ) : null}
                                </Stack>
                              </Box>

                              <Stack direction="row" spacing={2}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography sx={mobileLabelSx}>Costo compra</Typography>
                                  <Typography sx={mobileValueSx}>
                                    {money(r.purchase_cost)}
                                  </Typography>
                                </Box>

                                <Box sx={{ flex: 1 }}>
                                  <Typography sx={mobileLabelSx}>Rinde</Typography>
                                  <Typography sx={mobileValueSx}>
                                    {r.yield_qty} {r.yield_unit}
                                  </Typography>
                                </Box>
                              </Stack>

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
                                        onChange={() => onToggleStatus(r)}
                                        disabled={isOrphan}
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

                                {isOrphan ? (
                                  <Button
                                    onClick={() => onEdit(r)}
                                    variant="outlined"
                                    startIcon={<LocalShippingIcon />}
                                    fullWidth
                                    sx={{
                                      height: 40,
                                      borderRadius: 2,
                                      fontWeight: 800,
                                    }}
                                  >
                                    Elegir proveedor
                                  </Button>
                                ) : null}

                                <Stack direction="row" spacing={1}>
                                  <Tooltip title="Editar">
                                    <IconButton onClick={() => onEdit(r)} sx={iconEditSx}>
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Eliminar">
                                    <IconButton onClick={() => onDelete(r)} sx={iconDeleteSx}>
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
                    <Table sx={{ minWidth: 1080 }}>
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
                          <TableCell>Presentación</TableCell>
                          <TableCell>Proveedor</TableCell>
                          <TableCell>Costo compra</TableCell>
                          <TableCell>Rinde</TableCell>
                          <TableCell>Unidad</TableCell>
                          <TableCell align="center">Estado</TableCell>
                          <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {paginatedItems.map((r) => {
                          const isOrphan = Number(r.needs_supplier) === 1;
                          const isActive = r.status === "active";

                          return (
                            <TableRow
                              key={r.id}
                              hover
                              sx={{
                                backgroundColor: isOrphan ? "#FFF9E6" : "transparent",
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
                                  <Typography sx={{ fontWeight: 800 }}>
                                    {r.description}
                                  </Typography>
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

                              <TableCell>
                                <Stack spacing={0.75}>
                                  <Typography sx={{ fontWeight: 700 }}>
                                    {r.supplier_name || "—"}
                                  </Typography>

                                  {isOrphan ? (
                                    <Button
                                      onClick={() => onEdit(r)}
                                      variant="outlined"
                                      startIcon={<LocalShippingIcon />}
                                      sx={{
                                        width: "fit-content",
                                        height: 34,
                                        borderRadius: 2,
                                        fontSize: 12,
                                        fontWeight: 800,
                                      }}
                                    >
                                      Elegir proveedor
                                    </Button>
                                  ) : null}
                                </Stack>
                              </TableCell>

                              <TableCell sx={{ fontWeight: 800 }}>
                                {money(r.purchase_cost)}
                              </TableCell>

                              <TableCell sx={{ fontWeight: 800 }}>
                                {r.yield_qty}
                              </TableCell>

                              <TableCell sx={{ fontWeight: 800 }}>
                                {r.yield_unit}
                              </TableCell>

                              <TableCell align="center">
                                <FormControlLabel
                                  sx={{ m: 0 }}
                                  control={
                                    <Switch
                                      checked={isActive}
                                      onChange={() => onToggleStatus(r)}
                                      disabled={isOrphan}
                                      color="primary"
                                    />
                                  }
                                  label={
                                    <Typography sx={switchLabelSx}>
                                      {isActive ? "Activo" : "Inactivo"}
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
                                    <IconButton onClick={() => onEdit(r)} sx={iconEditSx}>
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Eliminar">
                                    <IconButton onClick={() => onDelete(r)} sx={iconDeleteSx}>
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
                  itemLabel="presentaciones"
                />
              </>
            )}
          </Paper>
        </Stack>
      </Box>

      <IngredientPresentationFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        restaurantId={restaurantId}
        ingredient={
          ingredient || {
            id: Number(ingredientId),
            name: `Ingrediente ${ingredientId}`,
            unit: "g",
          }
        }
        editRow={editRow}
        onSaved={async () => {
          setModalOpen(false);
          await load({ initial: false });
        }}
        api={{
          createPresentation: createIngredientPresentation,
          updatePresentation: updateIngredientPresentation,
        }}
      />

      <SupplierWizard
        open={openSupplierWizard}
        restaurantId={restaurantId}
        onClose={() => setOpenSupplierWizard(false)}
        onChanged={async () => {
          await load({ initial: false });
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