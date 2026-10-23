import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, InputAdornment, LinearProgress,
  MenuItem, Paper, Stack, TextField, Typography,
} from "@mui/material";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";
import PaginationFooter from "../../../../components/common/PaginationFooter";
import ContextOverview from "../../../../components/common/ContextOverview";
import usePagination from "../../../../hooks/usePagination";

import MenuSetsList from "../../../../components/menu/menuSets/list/MenuSetsList";
import { getBranchesByRestaurant } from "../../../../services/restaurant/branch.service";

import {
  getMenuSets,
  changeMenuSetStatus,
  deleteMenuSet,
} from "../../../../services/menu/menuSets/menuSet.service";

const panelSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: 1,
  backgroundColor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
};

const labelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};

const instructions = [
  "Cada conjunto pertenece a una sucursal y puede contener varias etapas.",
  "Primero se crea el conjunto y después se configuran sus etapas y productos.",
  "Podrás activarlo cuando tenga la configuración necesaria.",
];

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;
  const fieldErrors = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat()
    : [];

  return fieldErrors.find((message) => typeof message === "string")
    || data?.message
    || error?.message
    || fallback;
}

export default function MenuSetsPage() {
  const { restaurantId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const initialBranchId = String(location.state?.branchId || "");

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(initialBranchId);
  const [menuSets, setMenuSets] = useState([]);
  const [loadedBranchId, setLoadedBranchId] = useState("");

  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingMenuSets, setLoadingMenuSets] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingIds, setUpdatingIds] = useState(new Set());

  const [menuSetToDelete, setMenuSetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const selectedBranchRef = useRef(selectedBranchId);
  selectedBranchRef.current = selectedBranchId;

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((previous) => ({ ...previous, open: false }));
  };

  // Obtener las sucursales utilizando el servicio existente.
  useEffect(() => {
    let active = true;

    const loadBranches = async () => {
      setLoadingBranches(true);

      try {
        const result = await getBranchesByRestaurant(restaurantId);
        if (!active) return;

        const availableBranches = Array.isArray(result) ? result : [];
        setBranches(availableBranches);

        setSelectedBranchId((current) => {
          const exists = availableBranches.some(
            (branch) => String(branch.id) === String(current)
          );

          if (exists) return String(current);

          return availableBranches[0]?.id
            ? String(availableBranches[0].id)
            : "";
        });
      } catch (error) {
        if (!active) return;

        setBranches([]);
        setSelectedBranchId("");

        showAlert({
          message: getErrorMessage(error, "No se pudieron cargar las sucursales."),
        });
      } finally {
        if (active) setLoadingBranches(false);
      }
    };

    loadBranches();

    return () => {
      active = false;
    };
  }, [restaurantId]);

  // Consultar los conjuntos únicamente cuando cambia la sucursal.
  useEffect(() => {
    if (!selectedBranchId) {
      setMenuSets([]);
      setLoadedBranchId("");
      setLoadingMenuSets(false);
      return undefined;
    }

    let active = true;
    const branchId = String(selectedBranchId);

    const loadMenuSets = async () => {
      setLoadingMenuSets(true);

      try {
        const result = await getMenuSets(restaurantId, branchId);
        if (!active) return;

        setMenuSets(result);
        setLoadedBranchId(branchId);
      } catch (error) {
        if (!active) return;

        setMenuSets([]);
        setLoadedBranchId(branchId);

        showAlert({
          message: getErrorMessage(error, "No se pudieron cargar los conjuntos."),
        });
      } finally {
        if (active) setLoadingMenuSets(false);
      }
    };

    loadMenuSets();

    return () => {
      active = false;
    };
  }, [restaurantId, selectedBranchId]);

  const selectedBranch = useMemo(() => {
    return branches.find(
      (branch) => String(branch.id) === String(selectedBranchId)
    ) || null;
  }, [branches, selectedBranchId]);

  // Evitar mostrar registros de la sucursal anterior.
  const currentMenuSets = useMemo(() => {
    return loadedBranchId === String(selectedBranchId) ? menuSets : [];
  }, [menuSets, loadedBranchId, selectedBranchId]);

  const listLoading = loadingMenuSets ||
    (Boolean(selectedBranchId) && loadedBranchId !== String(selectedBranchId));

  const summary = useMemo(() => ({
    total: currentMenuSets.length,
    active: currentMenuSets.filter((item) => Boolean(item.is_active)).length,
    inactive: currentMenuSets.filter((item) => !item.is_active).length,
  }), [currentMenuSets]);

  const filteredMenuSets = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es-MX");

    return currentMenuSets.filter((item) => {
      const matchesStatus = statusFilter === "all"
        || (statusFilter === "active" && Boolean(item.is_active))
        || (statusFilter === "inactive" && !item.is_active);

      const name = String(item.name || "").toLocaleLowerCase("es-MX");
      const billingName = String(item.billing_name || "").toLocaleLowerCase("es-MX");
      const matchesSearch = !term || name.includes(term) || billingName.includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [currentMenuSets, search, statusFilter]);

  const pagination = usePagination({
    items: filteredMenuSets,
    pageSize: 5,
    resetKey: `${selectedBranchId}|${search}|${statusFilter}`,
  });

  const handleBranchChange = (branchId) => {
    selectedBranchRef.current = String(branchId);
    setSelectedBranchId(String(branchId));
    setSearch("");
    setStatusFilter("all");
    setMenuSetToDelete(null);
  };

  const handleStatusChange = async (menuSet, checked) => {
    const menuSetId = String(menuSet.id);
    const branchId = String(selectedBranchId);
    const previousStatus = Boolean(menuSet.is_active);

    const allowed = checked
      ? menuSet.can_activate === true
      : menuSet.can_deactivate === true;

    if (!allowed || updatingIds.has(menuSetId)) return;

    setUpdatingIds((current) => new Set(current).add(menuSetId));

    // Mostrar inmediatamente el nuevo estado.
    setMenuSets((current) => current.map((item) =>
      String(item.id) === menuSetId ? { ...item, is_active: checked } : item
    ));

    try {
      const response = await changeMenuSetStatus(
        restaurantId, branchId, menuSet.id, checked
      );

      if (selectedBranchRef.current !== branchId) return;

      // Sustituir con el registro actualizado y sus permisos reales.
      setMenuSets((current) => current.map((item) =>
        String(item.id) === menuSetId
          ? { ...item, ...(response?.menu_set || {}) }
          : item
      ));

      showAlert({
        severity: "success",
        title: "Hecho",
        message: response?.message || (checked
          ? "Conjunto activado correctamente."
          : "Conjunto desactivado correctamente."),
      });
    } catch (error) {
      if (selectedBranchRef.current !== branchId) return;

      // Restaurar el estado anterior si el cambio no fue aceptado.
      setMenuSets((current) => current.map((item) =>
        String(item.id) === menuSetId
          ? { ...item, is_active: previousStatus }
          : item
      ));

      showAlert({
        message: getErrorMessage(error, "No se pudo cambiar el estado del conjunto."),
      });
    } finally {
      setUpdatingIds((current) => {
        const next = new Set(current);
        next.delete(menuSetId);
        return next;
      });
    }
  };

  const handleManage = (menuSet) => {
    navigate(`${menuSet.id}?branchId=${encodeURIComponent(selectedBranchId)}`, {
      state: { branchId: selectedBranchId },
    });
  };

  const handleDeleteRequest = (menuSet) => {
    if (menuSet.can_delete !== true) return;
    setMenuSetToDelete(menuSet);
  };

  const handleDeleteConfirm = async () => {
    if (!menuSetToDelete?.id || deleting) return;

    const menuSetId = String(menuSetToDelete.id);
    const branchId = String(selectedBranchId);

    setDeleting(true);

    try {
      const response = await deleteMenuSet(restaurantId, branchId, menuSetId);

      if (selectedBranchRef.current === branchId) {
        setMenuSets((current) => current.filter(
          (item) => String(item.id) !== menuSetId
        ));

        showAlert({
          severity: "success",
          title: "Hecho",
          message: response?.message || "Conjunto eliminado correctamente.",
        });
      }

      setMenuSetToDelete(null);
    } catch (error) {
      if (selectedBranchRef.current === branchId) {
        showAlert({
          message: getErrorMessage(error, "No se pudo eliminar el conjunto."),
        });
      }
    } finally {
      setDeleting(false);
    }
  };

  const contextItems = [
    {
      key: "total",
      title: "Conjuntos totales",
      value: `${summary.total} conjuntos registrados`,
      icon: <LayersOutlinedIcon fontSize="small" />,
      chipLabel: "Registrados",
      chipColor: "primary",
    },
    {
      key: "active",
      title: "Conjuntos activos",
      value: `${summary.active} conjuntos habilitados`,
      icon: <CheckCircleOutlineOutlinedIcon fontSize="small" />,
      chipLabel: "Activos",
      chipColor: "success",
    },
    {
      key: "inactive",
      title: "Conjuntos inactivos",
      value: `${summary.inactive} conjuntos sin habilitar`,
      icon: <PauseCircleOutlineOutlinedIcon fontSize="small" />,
      chipLabel: "Inactivos",
      chipColor: "default",
    },
  ];

  return (
    <PageContainer>
      <Stack spacing={3}>
        {loadingBranches ? (
          <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
            <Stack alignItems="center" spacing={2}>
              <CircularProgress color="primary" />
              <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                Cargando conjuntos…
              </Typography>
            </Stack>
          </Box>
        ) : (
          <>
            {/* Encabezado */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={2}
            >
              <Box>
                <Typography sx={{
                  fontSize: { xs: 30, md: 42 }, fontWeight: 800,
                  color: "text.primary", lineHeight: 1.1,
                }}>
                  Conjuntos
                </Typography>

                <Typography sx={{
                  mt: 1, fontSize: { xs: 14, md: 17 },
                  lineHeight: 1.55, color: "text.secondary",
                }}>
                  Administra los conjuntos de productos de{" "}
                  <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>
                    {selectedBranch?.name || "la sucursal seleccionada"}
                  </Box>.
                </Typography>
              </Box>

              <Button
                type="button"
                variant="contained"
                startIcon={<AddOutlinedIcon />}
                disabled={!selectedBranch || loadingMenuSets || deleting}
                onClick={() => navigate(`new?branchId=${encodeURIComponent(selectedBranchId)}`, {
                  state: { branchId: selectedBranchId },
                })}
                sx={{
                  minWidth: { xs: "100%", sm: 190 },
                  height: 44,
                  fontWeight: 800,
                }}
              >
                Nuevo conjunto
              </Button>
            </Stack>

            {/* Instrucciones */}
            <Paper sx={panelSx}>
              <Stack spacing={1.25}>
                <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
                  Antes de comenzar
                </Typography>

                {instructions.map((instruction, index) => (
                  <Stack
                    key={instruction}
                    direction="row"
                    spacing={1.25}
                    alignItems="flex-start"
                  >
                    <Box sx={{
                      minWidth: 28, height: 28, borderRadius: "50%",
                      bgcolor: "primary.main", color: "#fff",
                      display: "grid", placeItems: "center",
                      fontSize: 13, fontWeight: 800,
                    }}>
                      {index + 1}
                    </Box>

                    <Typography sx={{
                      fontSize: 14, color: "text.primary", lineHeight: 1.6,
                    }}>
                      {instruction}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>

            {/* Sucursal */}
            <Paper sx={panelSx}>
              <Typography sx={labelSx}>Sucursal</Typography>

              <TextField
                select
                value={selectedBranchId}
                onChange={(event) => handleBranchChange(event.target.value)}
                disabled={deleting || branches.length === 0}
                SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={String(branch.id)}>
                    {branch.name || `Sucursal ${branch.id}`}
                  </MenuItem>
                ))}
              </TextField>

              <Typography sx={{ mt: 1.25, fontSize: 12, color: "text.secondary" }}>
                Estás administrando los conjuntos de{" "}
                <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>
                  {selectedBranch?.name || "la sucursal seleccionada"}
                </Box>.
              </Typography>
            </Paper>

            {branches.length === 0 ? (
              <Paper sx={{ ...panelSx, px: 3, py: 5, textAlign: "center" }}>
                <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
                  No hay sucursales disponibles
                </Typography>

                <Typography sx={{ mt: 1, fontSize: 14, color: "text.secondary" }}>
                  Registra una sucursal antes de administrar conjuntos.
                </Typography>
              </Paper>
            ) : (
              <>
                {/* Contexto actual */}
                <ContextOverview items={contextItems} />

                {/* Buscador y filtro */}
                <Paper sx={panelSx}>
                  <Stack spacing={1.75}>
                    <Box>
                      <Typography sx={{
                        fontSize: 16, fontWeight: 800, color: "text.primary",
                      }}>
                        Buscar y filtrar
                      </Typography>

                      <Typography sx={{
                        mt: 0.5, fontSize: 13, color: "text.secondary",
                      }}>
                        Localiza conjuntos por nombre o estado.
                      </Typography>
                    </Box>

                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <TextField
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Buscar conjunto..."
                        inputProps={{ "aria-label": "Buscar conjunto" }}
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
                        sx={{ width: { xs: "100%", md: 220 }, flexShrink: 0 }}
                      >
                        <MenuItem value="all">Todos</MenuItem>
                        <MenuItem value="active">Activos</MenuItem>
                        <MenuItem value="inactive">Inactivos</MenuItem>
                      </TextField>
                    </Stack>
                  </Stack>
                </Paper>

                {/* Listado */}
                <Stack spacing={2}>
                  <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
                    Conjuntos registrados
                  </Typography>

                  <MenuSetsList
                    menuSets={pagination.paginatedItems}
                    loading={listLoading}
                    updatingIds={updatingIds}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteRequest}
                    onManage={handleManage}
                  />

                  {!listLoading && filteredMenuSets.length > 0 ? (
                    <Paper sx={{
                      borderRadius: 1, border: "1px solid",
                      borderColor: "divider", boxShadow: "none",
                      overflow: "hidden",
                    }}>
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
                        itemLabel="conjuntos"
                      />
                    </Paper>
                  ) : null}
                </Stack>
              </>
            )}
          </>
        )}
      </Stack>

      {/* Confirmación de eliminación */}
      <Dialog
        open={Boolean(menuSetToDelete)}
        onClose={deleting ? undefined : () => setMenuSetToDelete(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "text.primary" }}>
          Eliminar conjunto
        </DialogTitle>

        <DialogContent>
          <Stack spacing={1.25}>
            <Typography sx={{ fontSize: 14, lineHeight: 1.55, color: "text.primary" }}>
              ¿Deseas eliminar el conjunto{" "}
              <Box component="span" sx={{ fontWeight: 800 }}>
                {menuSetToDelete?.name || "seleccionado"}
              </Box>?
            </Typography>

            <Typography sx={{
              fontSize: 13, color: "text.secondary", lineHeight: 1.5,
            }}>
              Esta acción eliminará su configuración y no se podrá deshacer.
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
            onClick={() => setMenuSetToDelete(null)}
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
            {deleting ? "Eliminando…" : "Eliminar conjunto"}
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