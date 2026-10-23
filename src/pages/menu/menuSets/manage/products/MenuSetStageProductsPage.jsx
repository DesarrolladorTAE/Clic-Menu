import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, InputAdornment, MenuItem, Paper, Stack, TextField,
  Tooltip, Typography,
} from "@mui/material";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";

import PageContainer from "../../../../../components/common/PageContainer";
import AppAlert from "../../../../../components/common/AppAlert";
import PaginationFooter from "../../../../../components/common/PaginationFooter";
import ContextOverview from "../../../../../components/common/ContextOverview";
import usePagination from "../../../../../hooks/usePagination";

import MenuSetProductForm from "../../../../../components/menu/menuSets/manage/products/MenuSetProductForm";
import MenuSetProductsList from "../../../../../components/menu/menuSets/manage/products/MenuSetProductsList";

import { getMenuSet } from "../../../../../services/menu/menuSets/menuSet.service";
import { getMenuSetStage } from "../../../../../services/menu/menuSets/menuSetStage.service";

import {
  getMenuSetEligibleProducts,
  getMenuSetStageProducts,
  createMenuSetStageProduct,
  updateMenuSetStageProduct,
  deleteMenuSetStageProduct,
} from "../../../../../services/menu/menuSets/menuSetProduct.service";

const panelSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: 1,
  backgroundColor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
};

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;

  const fieldErrors = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat()
    : [];

  return fieldErrors.find((message) => typeof message === "string")
    || data?.message || error?.message || fallback;
}

export default function MenuSetStageProductsPage() {
  const { restaurantId, menuSetId, stageId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const branchId = String(searchParams.get("branchId") || location.state?.branchId || "");

  const [menuSet, setMenuSet] = useState(null);
  const [stage, setStage] = useState(null);
  const [options, setOptions] = useState([]);
  const [eligibleProducts, setEligibleProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [eligibleLoaded, setEligibleLoaded] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formMode, setFormMode] = useState(null);
  const [editingOption, setEditingOption] = useState(null);
  const [formVersion, setFormVersion] = useState(0);
  const [saving, setSaving] = useState(false);

  const [updatingOptionId, setUpdatingOptionId] = useState(null);
  const [optionToDelete, setOptionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const mountedRef = useRef(false);
  const operationRef = useRef(false);

  const showAlert = useCallback(({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  }, []);

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((current) => ({ ...current, open: false }));
  };

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const busy = saving || deleting || updatingOptionId !== null;

  // Consultar información inicial de la etapa.
  useEffect(() => {
    if (!restaurantId || !branchId || !menuSetId || !stageId) {
      setLoadFailed(true);
      setLoading(false);
      return undefined;
    }

    let active = true;

    const loadConfiguration = async () => {
      setLoading(true);
      setLoadFailed(false);
      setEligibleLoaded(false);

      const results = await Promise.allSettled([
        getMenuSet(restaurantId, branchId, menuSetId),
        getMenuSetStage(restaurantId, branchId, menuSetId, stageId),
        getMenuSetStageProducts(restaurantId, branchId, menuSetId, stageId),
        getMenuSetEligibleProducts(restaurantId, branchId),
      ]);

      if (!active) return;

      const [setResult, stageResult, optionsResult, eligibleResult] = results;

      const requiredFailed = setResult.status !== "fulfilled"
        || !setResult.value?.id
        || stageResult.status !== "fulfilled"
        || !stageResult.value?.id
        || optionsResult.status !== "fulfilled";

      if (requiredFailed) {
        const failed = results.slice(0, 3).find((result) => result.status === "rejected");

        setMenuSet(null);
        setStage(null);
        setOptions([]);
        setLoadFailed(true);

        showAlert({
          message: failed
            ? getErrorMessage(failed.reason, "No se pudieron consultar los productos de la etapa.")
            : "No se pudo consultar la información de la etapa.",
        });
      } else {
        setMenuSet(setResult.value);
        setStage(stageResult.value);
        setOptions(optionsResult.value.options);
      }

      if (eligibleResult.status === "fulfilled") {
        setEligibleProducts(eligibleResult.value);
        setEligibleLoaded(true);
      } else {
        setEligibleProducts([]);
        setEligibleLoaded(false);

        if (!requiredFailed) {
          showAlert({
            message: getErrorMessage(
              eligibleResult.reason,
              "No se pudieron consultar los productos disponibles para agregar."
            ),
          });
        }
      }

      setLoading(false);
    };

    loadConfiguration();

    return () => {
      active = false;
    };
  }, [restaurantId, branchId, menuSetId, stageId, showAlert]);

  // Sincronizar permisos después de modificar un producto, sin mostrar recargas.
  const synchronize = async () => {
    const results = await Promise.allSettled([
      getMenuSetStageProducts(restaurantId, branchId, menuSetId, stageId),
      getMenuSetStage(restaurantId, branchId, menuSetId, stageId),
    ]);

    if (!mountedRef.current) return;

    if (results[0].status === "fulfilled") {
      setOptions(results[0].value.options);
    }

    if (results[1].status === "fulfilled" && results[1].value?.id) {
      setStage(results[1].value);
    }
  };

  const orderedOptions = useMemo(() => {
    return [...options].sort((a, b) => {
      const difference = Number(a.sort_order) - Number(b.sort_order);
      return difference || Number(a.id) - Number(b.id);
    });
  }, [options]);

  const summary = useMemo(() => ({
    total: options.length,
    active: options.filter((option) => Boolean(option.is_active)).length,
    inactive: options.filter((option) => !option.is_active).length,
  }), [options]);

  const availableProducts = useMemo(() => {
    const assignedIds = new Set(options.map((option) => Number(option.product_id)));

    return eligibleProducts.filter((product) => !assignedIds.has(Number(product.id)));
  }, [eligibleProducts, options]);

  const filteredOptions = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es-MX");

    return orderedOptions.filter((option) => {
      const matchesStatus = statusFilter === "all"
        || (statusFilter === "active" && Boolean(option.is_active))
        || (statusFilter === "inactive" && !option.is_active);

      const name = String(option.name || option.product?.name || "")
        .toLocaleLowerCase("es-MX");

      return matchesStatus && (!term || name.includes(term));
    });
  }, [orderedOptions, search, statusFilter]);

  const pagination = usePagination({
    items: filteredOptions,
    pageSize: 5,
    resetKey: `${stageId}|${search}|${statusFilter}`,
  });

  const contextItems = [
    {
      key: "conjunto",
      title: "Conjunto",
      value: menuSet?.name || "Sin nombre",
      icon: <RestaurantMenuRoundedIcon fontSize="small" />,
      chipLabel: "Actual",
      chipColor: "primary",
    },
    {
      key: "total",
      title: "Productos totales",
      value: `${summary.total} productos asignados`,
      icon: <Inventory2OutlinedIcon fontSize="small" />,
      chipLabel: "Registrados",
      chipColor: "primary",
    },
    {
      key: "active",
      title: "Productos activos",
      value: `${summary.active} productos habilitados`,
      icon: <CheckCircleOutlineOutlinedIcon fontSize="small" />,
      chipLabel: "Activos",
      chipColor: "success",
    },
    {
      key: "inactive",
      title: "Productos inactivos",
      value: `${summary.inactive} productos sin habilitar`,
      icon: <PauseCircleOutlineOutlinedIcon fontSize="small" />,
      chipLabel: "Inactivos",
      chipColor: "default",
    },
  ];

  const handleBack = () => {
    navigate(`/owner/restaurants/${restaurantId}/operation/menu-sets/${menuSetId}?branchId=${encodeURIComponent(branchId)}`, {
      state: {
        branchId,
        activeTab: "stages",
      },
    });
  };

  const openForm = (mode, option = null) => {
    if (busy || operationRef.current) return;

    setFormMode(mode);
    setEditingOption(option);
    setFormVersion((current) => current + 1);
  };

  const closeForm = () => {
    if (saving) return;

    setFormMode(null);
    setEditingOption(null);
  };

  const handleSave = async (payload, option) => {
    if (operationRef.current) return;

    operationRef.current = true;
    setSaving(true);

    try {
      const response = option
        ? await updateMenuSetStageProduct(
            restaurantId, branchId, menuSetId, stageId, option.id, payload
          )
        : await createMenuSetStageProduct(
            restaurantId, branchId, menuSetId, stageId, payload
          );

      const savedOption = response?.option;

      if (!savedOption?.id) {
        throw new Error("No se recibió la información del producto guardado.");
      }

      // Actualizar inmediatamente el listado.
      setOptions((current) => {
        const exists = current.some((item) => String(item.id) === String(savedOption.id));

        if (exists) {
          return current.map((item) =>
            String(item.id) === String(savedOption.id) ? savedOption : item
          );
        }

        return [...current, savedOption];
      });

      setFormMode(null);
      setEditingOption(null);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: response?.message || "Producto guardado correctamente.",
      });

      await synchronize();
    } finally {
      operationRef.current = false;

      if (mountedRef.current) {
        setSaving(false);
      }
    }
  };

  const handleStatusChange = async (option, checked) => {
    if (operationRef.current || busy) return;

    const allowed = checked
      ? option.can_activate === true
      : option.can_deactivate === true;

    if (!allowed) return;

    operationRef.current = true;
    setUpdatingOptionId(option.id);

    // Reflejar visualmente el cambio.
    setOptions((current) => current.map((item) =>
      String(item.id) === String(option.id)
        ? { ...item, is_active: checked }
        : item
    ));

    try {
      const response = await updateMenuSetStageProduct(
        restaurantId, branchId, menuSetId, stageId,
        option.id, { is_active: checked }
      );

      if (!response?.option?.id) {
        throw new Error("No se recibió la información actualizada del producto.");
      }

      setOptions((current) => current.map((item) =>
        String(item.id) === String(option.id)
          ? response.option
          : item
      ));

      showAlert({
        severity: "success",
        title: "Hecho",
        message: response?.message || "Estado del producto actualizado correctamente.",
      });

      await synchronize();
    } catch (error) {
      setOptions((current) => current.map((item) =>
        String(item.id) === String(option.id) ? option : item
      ));

      showAlert({
        message: getErrorMessage(error, "No se pudo cambiar el estado del producto."),
      });
    } finally {
      operationRef.current = false;

      if (mountedRef.current) {
        setUpdatingOptionId(null);
      }
    }
  };

  const handleDeleteRequest = (option) => {
    if (busy || option.can_delete !== true) return;
    setOptionToDelete(option);
  };

  const handleDeleteConfirm = async () => {
    if (!optionToDelete?.id || deleting || operationRef.current) return;

    const optionId = optionToDelete.id;

    operationRef.current = true;
    setDeleting(true);

    try {
      const response = await deleteMenuSetStageProduct(
        restaurantId, branchId, menuSetId, stageId, optionId
      );

      setOptions((current) => current.filter(
        (option) => String(option.id) !== String(optionId)
      ));

      setOptionToDelete(null);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: response?.message || "Producto retirado correctamente.",
      });

      await synchronize();
    } catch (error) {
      showAlert({
        message: getErrorMessage(error, "No se pudo retirar el producto."),
      });
    } finally {
      operationRef.current = false;

      if (mountedRef.current) {
        setDeleting(false);
      }
    }
  };

  return (
    <PageContainer>
      <Stack spacing={3}>
        {/* Encabezado */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{
              fontSize: { xs: 30, md: 42 },
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.1,
            }}>
              Productos de la etapa
            </Typography>

            <Typography sx={{
              mt: 1,
              fontSize: { xs: 14, md: 17 },
              color: "text.secondary",
              lineHeight: 1.55,
            }}>
              Administra los productos disponibles en{" "}
              <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>
                {stage?.name || location.state?.stageName || "la etapa seleccionada"}
              </Box>.
            </Typography>
          </Box>

          <Button
            type="button"
            variant="outlined"
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={handleBack}
            sx={{
              minWidth: { xs: "100%", sm: 190 },
              height: 44,
              fontWeight: 800,
            }}
          >
            Volver a etapas
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ minHeight: "45vh", display: "grid", placeItems: "center" }}>
            <Stack spacing={2} alignItems="center">
              <CircularProgress color="primary" />

              <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                Cargando productos de la etapa…
              </Typography>
            </Stack>
          </Box>
        ) : loadFailed || !menuSet || !stage ? (
          <Paper sx={{ ...panelSx, py: 5, textAlign: "center" }}>
            <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
              Etapa no disponible
            </Typography>

            <Typography sx={{
              mt: 1, fontSize: 14,
              color: "text.secondary", lineHeight: 1.55,
            }}>
              Regresa a las etapas del conjunto para continuar.
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Contexto actual */}
            <ContextOverview items={contextItems} />

            {/* Buscar y filtrar */}
            <Paper sx={panelSx}>
              <Stack spacing={1.75}>
                <Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 800 }}>
                    Buscar y filtrar
                  </Typography>

                  <Typography sx={{
                    mt: 0.5, fontSize: 13,
                    color: "text.secondary",
                  }}>
                    Localiza productos por nombre o estado.
                  </Typography>
                </Box>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <TextField
                    fullWidth
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar producto..."
                    inputProps={{ "aria-label": "Buscar producto" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchOutlinedIcon
                            fontSize="small"
                            sx={{ color: "text.secondary" }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
                    sx={{
                      width: { xs: "100%", md: 220 },
                      flexShrink: 0,
                    }}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="active">Activos</MenuItem>
                    <MenuItem value="inactive">Inactivos</MenuItem>
                  </TextField>
                </Stack>
              </Stack>
            </Paper>

            {/* Productos asignados */}
            <Paper sx={{
              p: 0,
              overflow: "hidden",
              borderRadius: 0,
              backgroundColor: "background.paper",
              boxShadow: "none",
            }}>
              {/* Encabezado del listado */}
              <Box sx={{
                px: 2,
                py: 1.75,
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}>
                <Typography sx={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "text.primary",
                }}>
                  Productos asignados
                </Typography>

                <Tooltip
                  title={!eligibleLoaded
                    ? "No se pudieron consultar los productos disponibles."
                    : availableProducts.length === 0
                      ? "No hay más productos disponibles para agregar."
                      : ""}
                  arrow
                >
                  <span style={{ width: "auto", maxWidth: "100%" }}>
                    <Button
                      type="button"
                      variant="contained"
                      startIcon={<AddOutlinedIcon />}
                      disabled={busy || !eligibleLoaded || availableProducts.length === 0}
                      onClick={() => openForm("create")}
                      sx={{
                        minWidth: { xs: "100%", sm: 170 },
                        height: 42,
                        borderRadius: 2,
                        fontWeight: 800,
                      }}
                    >
                      Agregar producto
                    </Button>
                  </span>
                </Tooltip>
              </Box>

              {/* Tabla y tarjetas responsivas */}
              <MenuSetProductsList
                options={pagination.paginatedItems}
                busy={busy}
                updatingOptionId={updatingOptionId}
                hasFilters={Boolean(search.trim()) || statusFilter !== "all"}
                onStatusChange={handleStatusChange}
                onEdit={(option) => openForm("edit", option)}
                onDelete={handleDeleteRequest}
              />

              {/* Paginación dentro del mismo contenedor */}
              {filteredOptions.length > 0 ? (
                <PaginationFooter
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  startItem={pagination.startItem}
                  endItem={pagination.endItem}
                  total={pagination.total}
                  hasPrev={pagination.hasPrev}
                  hasNext={pagination.hasNext}
                  onPrev={pagination.prevPage}
                  onNext={pagination.nextPage}
                  itemLabel="productos"
                />
              ) : null}
            </Paper>
          </>
        )}
      </Stack>

      {/* Modal agregar / editar */}
      {formMode && menuSet && stage ? (
        <MenuSetProductForm
          key={`${formMode}-${editingOption?.id || "new"}-${formVersion}`}
          open
          option={editingOption}
          menuSet={menuSet}
          stage={stage}
          products={availableProducts}
          saving={saving}
          onSave={handleSave}
          onCancel={closeForm}
          onAlert={showAlert}
        />
      ) : null}

      {/* Confirmar retiro */}
      <Dialog
        open={Boolean(optionToDelete)}
        onClose={deleting ? undefined : () => setOptionToDelete(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "text.primary" }}>
          Retirar producto
        </DialogTitle>

        <DialogContent>
          <Stack spacing={1.25}>
            <Typography sx={{
              fontSize: 14, lineHeight: 1.55, color: "text.primary",
            }}>
              ¿Deseas retirar el producto{" "}
              <Box component="span" sx={{ fontWeight: 800 }}>
                {optionToDelete?.name || optionToDelete?.product?.name || "seleccionado"}
              </Box>{" "}
              de esta etapa?
            </Typography>

            <Typography sx={{
              fontSize: 13, lineHeight: 1.5, color: "text.secondary",
            }}>
              Se eliminará su configuración dentro de esta etapa. El producto original permanecerá en el catálogo.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{
          px: 3, pb: 2.5,
          flexDirection: { xs: "column-reverse", sm: "row" },
          gap: 1,
        }}>
          <Button
            type="button"
            variant="outlined"
            disabled={deleting}
            onClick={() => setOptionToDelete(null)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="contained"
            color="error"
            disabled={deleting}
            onClick={handleDeleteConfirm}
            startIcon={deleting
              ? <CircularProgress size={18} color="inherit" />
              : <DeleteOutlineOutlinedIcon />}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {deleting ? "Retirando…" : "Retirar producto"}
          </Button>
        </DialogActions>
      </Dialog>

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