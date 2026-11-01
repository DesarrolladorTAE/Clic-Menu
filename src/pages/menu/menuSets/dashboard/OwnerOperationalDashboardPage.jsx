//src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  Box, Button, CircularProgress, MenuItem, Paper,
  Stack, TextField, Typography,
} from "@mui/material";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";
import OwnerDashboardTabs, {
  normalizeDashboardTab,
} from "../../../../components/menu/menuSets/dashboard/OwnerDashboardTabs";
import OwnerDashboardOverview from "../../../../components/menu/menuSets/dashboard/OwnerDashboardOverview";
import OwnerDashboardInventory from "../../../../components/menu/menuSets/dashboard/OwnerDashboardInventory";
import OwnerDashboardProducts from "../../../../components/menu/menuSets/dashboard/OwnerDashboardProducts";
import OwnerDashboardMenuSets from "../../../../components/menu/menuSets/dashboard/OwnerDashboardMenuSets";
import OwnerDashboardImportUpdates from "../../../../components/menu/menuSets/dashboard/OwnerDashboardImportUpdates";
import OwnerDashboardReminders from "../../../../components/menu/menuSets/dashboard/OwnerDashboardReminders";

import { getBranchesByRestaurant } from "../../../../services/restaurant/branch.service";
import { getOperationalDashboardOverview } from "../../../../services/menu/menuSets/dashboard/operationalDashboard.service";

const panelSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: 1, border: "1px solid",
  borderColor: "divider", bgcolor: "background.paper",
  boxShadow: "none",
};

const pendingSections = {
  inventario: {
    title: "Inventario",
    description: "Aquí podrás consultar las existencias físicas, cantidades reservadas y disponibilidad por almacén.",
  },
  productos: {
    title: "Productos",
    description: "Aquí podrás revisar la disponibilidad de productos, variantes y sus motivos de restricción.",
  },
  conjuntos: {
    title: "Conjuntos",
    description: "Aquí podrás consultar la disponibilidad comercial, las etapas, capacidades y publicaciones aplicables.",
  },
  actualizaciones: {
    title: "Actualizaciones",
    description: "Aquí podrás consultar la programación comercial, publicaciones pendientes y vencimientos.",
  },
  avisos: {
    title: "Avisos",
    description: "Aquí podrás consultar los avisos de actualización y el historial de recordatorios de la sucursal.",
  },
};

function getCurrentDate(timezone = "America/Mexico_City") {
  const format = (zone) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(new Date());

    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  };

  try {
    return format(timezone);
  } catch {
    return format("America/Mexico_City");
  }
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;
  const errors = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat() : [];

  return errors.find((message) => typeof message === "string")
    || data?.message || error?.message || fallback;
}

function PendingSection({ section }) {
  return (
    <Paper sx={{ ...panelSx, py: { xs: 4, sm: 5 } }}>
      <Stack alignItems="center" spacing={1.5} sx={{ textAlign: "center" }}>
        <Box sx={{
          width: 62, height: 62, borderRadius: 1,
          display: "grid", placeItems: "center",
          bgcolor: "action.hover", color: "primary.main",
        }}>
          <DashboardOutlinedIcon sx={{ fontSize: 32 }} />
        </Box>

        <Typography sx={{
          fontSize: 20, fontWeight: 800, color: "text.primary",
        }}>
          {section.title}
        </Typography>

        <Typography sx={{
          maxWidth: 520, fontSize: 14, lineHeight: 1.6,
          color: "text.secondary",
        }}>
          {section.description}
        </Typography>

        <Typography sx={{
          fontSize: 12, fontWeight: 700, color: "text.secondary",
        }}>
          Este apartado se integrará en los siguientes pasos.
        </Typography>
      </Stack>
    </Paper>
  );
}

export default function OwnerOperationalDashboardPage() {
  const { restaurantId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialBranchRef = useRef(
    String(searchParams.get("branchId") || location.state?.branchId || "")
  );

  const activeTab = normalizeDashboardTab(searchParams.get("tab"));

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(initialBranchRef.current);
  const [serviceDate, setServiceDate] = useState(() => getCurrentDate());

  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [overview, setOverview] = useState(null);

  const [alertState, setAlertState] = useState({
    open: false, severity: "error", title: "", message: "",
  });

  const showAlert = useCallback(({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  }, []);

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setAlertState((current) => ({ ...current, open: false }));
  };

  /*
  |--------------------------------------------------------------------------
  | Cargar sucursales y conservar la selección recibida
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    let active = true;
    setLoadingBranches(true);

    const loadBranches = async () => {
      try {
        const response = await getBranchesByRestaurant(restaurantId);
        if (!active) {
          return;
        }

        const available = Array.isArray(response) ? response : [];
        const requestedId = initialBranchRef.current;

        const selected = available.find((branch) => String(branch.id) === requestedId)
          || available[0] || null;

        const resolvedId = selected ? String(selected.id) : "";

        setBranches(available);
        setSelectedBranchId(resolvedId);
        setServiceDate(getCurrentDate(selected?.timezone));
        setOverview(null);

        if (resolvedId) {
          setSearchParams((current) => {
            const next = new URLSearchParams(current);
            next.set("branchId", resolvedId);
            return next;
          }, { replace: true });
        }
      } catch (error) {
        if (!active) {
          return;
        }

        setBranches([]);
        setSelectedBranchId("");
        setOverview(null);

        showAlert({
          message: getErrorMessage(error, "No se pudieron consultar las sucursales."),
        });
      } finally {
        if (active) {
          setLoadingBranches(false);
        }
      }
    };

    loadBranches();

    return () => {
      active = false;
    };
  }, [restaurantId, setSearchParams, showAlert]);

  const selectedBranch = useMemo(() => {
    return branches.find((branch) => String(branch.id) === selectedBranchId) || null;
  }, [branches, selectedBranchId]);

  const validDate = isValidDate(serviceDate);

  /*
  |--------------------------------------------------------------------------
  | Consultar el resumen al cambiar fecha, sucursal o pestaña
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    if (activeTab !== "resumen" || !restaurantId || !selectedBranchId || !validDate) {
      setLoadingOverview(false);
      return undefined;
    }

    let active = true;
    const controller = new AbortController();

    setLoadingOverview(true);

    setOverview((current) => {
      const sameBranch = String(current?.context?.branch_id || "") === selectedBranchId;
      const sameDate = current?.context?.service_date === serviceDate;
      return sameBranch && sameDate ? current : null;
    });

    const loadOverview = async () => {
      try {
        const response = await getOperationalDashboardOverview(
          restaurantId, selectedBranchId, serviceDate, controller.signal
        );

        if (!active || controller.signal.aborted) {
          return;
        }

        if (
          String(response.context.branch_id) !== selectedBranchId
          || response.context.service_date !== serviceDate
        ) {
          throw new Error("La información recibida no corresponde a la consulta seleccionada.");
        }

        setOverview(response);
      } catch (error) {
        if (!active || controller.signal.aborted) {
          return;
        }

        showAlert({
          severity: "error",
          title: "No se pudo consultar el resumen",
          message: getErrorMessage(error, "No fue posible consultar el estado operativo."),
        });
      } finally {
        if (active && !controller.signal.aborted) {
          setLoadingOverview(false);
        }
      }
    };

    loadOverview();

    return () => {
      active = false;
      controller.abort();
    };
  }, [
    restaurantId, selectedBranchId, serviceDate,
    validDate, activeTab, showAlert,
  ]);

  const handleBranchChange = (branchId) => {
    const nextId = String(branchId);
    const branch = branches.find((item) => String(item.id) === nextId);

    setSelectedBranchId(nextId);
    setServiceDate(getCurrentDate(branch?.timezone));
    setOverview(null);

    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("branchId", nextId);
      return next;
    }, { replace: true });
  };

  const handleTabChange = (nextTab) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("tab", normalizeDashboardTab(nextTab));

      if (selectedBranchId) {
        next.set("branchId", selectedBranchId);
      }

      return next;
    });
  };

  const handleBack = () => {
    navigate(`/owner/restaurants/${restaurantId}/operation/menu-sets`, {
      state: { branchId: selectedBranchId },
    });
  };

  const visibleOverview = overview
    && String(overview.context.branch_id) === selectedBranchId
    && overview.context.service_date === serviceDate
    ? overview : null;

  return (
    <PageContainer>
      <Stack spacing={3}>
        {/* Encabezado */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{
              fontSize: { xs: 30, md: 42 },
              fontWeight: 800, color: "text.primary", lineHeight: 1.1,
            }}>
              Panel operativo
            </Typography>

            <Typography sx={{
              mt: 1, fontSize: { xs: 14, md: 17 },
              color: "text.secondary", lineHeight: 1.55,
            }}>
              Consulta el estado operativo de{" "}
              <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>
                {selectedBranch?.name || "la sucursal seleccionada"}
              </Box>.
            </Typography>
          </Box>

          <Button
            type="button"
            variant="outlined"
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={handleBack}
            sx={{
              minWidth: { xs: "100%", md: 190 },
              height: 44, fontWeight: 800, flexShrink: 0,
            }}
          >
            Volver a Conjuntos
          </Button>
        </Stack>

        {loadingBranches ? (
          <Box sx={{ minHeight: "40vh", display: "grid", placeItems: "center" }}>
            <Stack alignItems="center" spacing={2}>
              <CircularProgress />

              <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                Cargando sucursales…
              </Typography>
            </Stack>
          </Box>
        ) : branches.length === 0 ? (
          <Paper sx={{ ...panelSx, py: 5, textAlign: "center" }}>
            <Typography sx={{ fontSize: 19, fontWeight: 800 }}>
              No hay sucursales disponibles
            </Typography>

            <Typography sx={{ mt: 1, fontSize: 13, color: "text.secondary" }}>
              Registra una sucursal para consultar su información operativa.
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Filtros generales */}
            <Paper sx={panelSx}>
              <Stack spacing={2}>
                <Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 800 }}>
                    Contexto de consulta
                  </Typography>

                  <Typography sx={{
                    mt: 0.5, fontSize: 13, color: "text.secondary", lineHeight: 1.55,
                  }}>
                    Selecciona la sucursal y la fecha que deseas consultar.
                  </Typography>
                </Box>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{
                      mb: 1, fontSize: 14, fontWeight: 800, color: "text.primary",
                    }}>
                      Sucursal
                    </Typography>

                    <TextField
                      fullWidth
                      select
                      value={selectedBranchId}
                      onChange={(event) => handleBranchChange(event.target.value)}
                      SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
                    >
                      {branches.map((branch) => (
                        <MenuItem key={branch.id} value={String(branch.id)}>
                          {branch.name || `Sucursal ${branch.id}`}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{
                      mb: 1, fontSize: 14, fontWeight: 800, color: "text.primary",
                    }}>
                      Fecha de servicio
                    </Typography>

                    <TextField
                      fullWidth
                      type="date"
                      value={serviceDate}
                      onChange={(event) => setServiceDate(event.target.value)}
                      error={!validDate}
                      helperText={!validDate ? "Selecciona una fecha de servicio válida." : ""}
                      inputProps={{ "aria-label": "Fecha de servicio" }}
                    />
                  </Box>
                </Stack>
              </Stack>
            </Paper>

            {/* Navegación compartida */}
            <OwnerDashboardTabs value={activeTab} onChange={handleTabChange} />

            {/* 1. Resumen */}
            {activeTab === "resumen" ? (
              <OwnerDashboardOverview
                data={visibleOverview}
                loading={loadingOverview}
              />
            ) : null}

            {/* 2. Inventario */}
            {activeTab === "inventario" ? (
              <OwnerDashboardInventory
                restaurantId={restaurantId}
                branchId={selectedBranchId}
                onAlert={showAlert}
              />
            ) : null}

            {/* 3. Productos */}
            {activeTab === "productos" ? (
              <OwnerDashboardProducts
                restaurantId={restaurantId}
                branchId={selectedBranchId}
                onAlert={showAlert}
              />
            ) : null}

            {/* 4. Conjuntos */}
            {activeTab === "conjuntos" ? (
              <OwnerDashboardMenuSets
                restaurantId={restaurantId}
                branchId={selectedBranchId}
                serviceDate={serviceDate}
                onAlert={showAlert}
              />
            ) : null}

                        {/* 5. Actualizaciones comerciales */}
            {activeTab === "actualizaciones" ? (
              <OwnerDashboardImportUpdates
                restaurantId={restaurantId}
                branchId={selectedBranchId}
                serviceDate={serviceDate}
                onAlert={showAlert}
              />
            ) : null}

            {/* 6. Avisos automáticos */}
            {activeTab === "avisos" ? (
              <OwnerDashboardReminders
                restaurantId={restaurantId}
                branchId={selectedBranchId}
                onAlert={showAlert}
              />
            ) : null}
          </>
        )}
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