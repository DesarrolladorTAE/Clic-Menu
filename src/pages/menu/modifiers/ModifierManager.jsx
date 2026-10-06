import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box, Button, CircularProgress, MenuItem, Paper, Stack, TextField, Typography,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";

import AppAlert from "../../../components/common/AppAlert";
import ModifierTabs from "../../../components/menu/modifiers/ModifierTabs";
import ModifierGroupsPanel from "../../../components/menu/modifiers/ModifierGroupsPanel";
import ModifierOptionsPanel from "../../../components/menu/modifiers/ModifierOptionsPanel";
import ModifierCatalogsDialog from "../../../components/menu/modifiers/catalogs/ModifierCatalogsDialog";

import { getRestaurantSettings } from "../../../services/restaurant/restaurantSettings.service";
import { getBranchesByRestaurant } from "../../../services/restaurant/branch.service";
import { getModifierGroups } from "../../../services/menu/modifiers/modifierGroups.service";
import { getAllModifierOptions } from "../../../services/menu/modifiers/modifierOptions.service";

export default function ModifierManager() {
  const nav = useNavigate();
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [catalogsDialogOpen, setCatalogsDialogOpen] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const [settings, setSettings] = useState(null);
  const modifiersMode = settings?.modifiers_mode || "global";
  const requiresBranch = modifiersMode === "branch";

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [tab, setTab] = useState("groups");

  const [groups, setGroups] = useState([]);
  const [options, setOptions] = useState([]);

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const normalizeSettingsResponse = (res) => {
    return res?.data ?? res?.settings ?? res ?? null;
  };

  const effectiveBranchId = useMemo(() => {
    if (!requiresBranch) {
      return null;
    }

    return branchId ? Number(branchId) : null;
  }, [requiresBranch, branchId]);

  const branchQuery = useMemo(() => {
    if (!requiresBranch || !effectiveBranchId) {
      return {};
    }

    return { branch_id: effectiveBranchId };
  }, [requiresBranch, effectiveBranchId]);

  const groupNameById = useMemo(() => {
    const map = {};

    groups.forEach((group) => {
      map[group.id] = group.name;
    });

    return map;
  }, [groups]);

  const getGroupLabel = (groupId) => {
    if (!groupId) {
      return "Sin grupo";
    }

    return groupNameById[groupId] || "Grupo eliminado";
  };

  const refreshModifierCatalog = async (queryOverride = null) => {
    const query = queryOverride ?? branchQuery;

    if (requiresBranch && !query?.branch_id) {
      setGroups([]);
      setOptions([]);

      return {
        groups: [],
        options: [],
      };
    }

    const groupsResponse = await getModifierGroups(restaurantId, query);
    const loadedGroups = Array.isArray(groupsResponse?.data)
      ? groupsResponse.data
      : [];

    setGroups(loadedGroups);

    const loadedOptions = await getAllModifierOptions(restaurantId, loadedGroups);
    const safeOptions = Array.isArray(loadedOptions) ? loadedOptions : [];

    setOptions(safeOptions);

    return {
      groups: loadedGroups,
      options: safeOptions,
    };
  };

  const loadAll = async () => {
    setLoading(true);

    try {
      const settingsResponse = await getRestaurantSettings(restaurantId);
      const st = normalizeSettingsResponse(settingsResponse);

      setSettings(st);

      let selectedBranchId = null;
      let loadedBranches = [];

      if (st?.modifiers_mode === "branch") {
        loadedBranches = await getBranchesByRestaurant(restaurantId);
        loadedBranches = Array.isArray(loadedBranches) ? loadedBranches : [];

        setBranches(loadedBranches);

        selectedBranchId = branchId
          ? Number(branchId)
          : loadedBranches?.[0]?.id
            ? Number(loadedBranches[0].id)
            : null;

        if (!branchId && selectedBranchId) {
          setBranchId(String(selectedBranchId));
        }
      } else {
        setBranches([]);
        setBranchId("");
      }

      if (st?.modifiers_mode === "branch" && !selectedBranchId) {
        setGroups([]);
        setOptions([]);
        return;
      }

      const query =
        st?.modifiers_mode === "branch"
          ? { branch_id: selectedBranchId }
          : {};

      const groupsResponse = await getModifierGroups(restaurantId, query);
      const loadedGroups = Array.isArray(groupsResponse?.data)
        ? groupsResponse.data
        : [];

      setGroups(loadedGroups);

      const loadedOptions = await getAllModifierOptions(
        restaurantId,
        loadedGroups
      );

      setOptions(Array.isArray(loadedOptions) ? loadedOptions : []);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo cargar el módulo de modificadores",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  useEffect(() => {
    if (!requiresBranch) {
      return;
    }

    if (!effectiveBranchId) {
      setGroups([]);
      setOptions([]);
      return;
    }

    (async () => {
      setRefreshing(true);

      try {
        await refreshModifierCatalog({ branch_id: effectiveBranchId });
      } catch (e) {
        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudieron recargar los grupos y opciones",
        });
      } finally {
        setRefreshing(false);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiresBranch, effectiveBranchId, restaurantId]);

  const handleSelectCatalog = (catalogKey) => {
    setCatalogsDialogOpen(false);

    switch (catalogKey) {
      case "products":
        nav(
          `/owner/restaurants/${restaurantId}/operation/modifiers/catalogs/products`
        );
        break;

      case "variants":
        nav(
          `/owner/restaurants/${restaurantId}/operation/modifiers/catalogs/variants`
        );
        break;

      case "components":
        nav(
          `/owner/restaurants/${restaurantId}/operation/modifiers/catalogs/components`
        );
        break;

      case "component-variants":
        nav(
          `/owner/restaurants/${restaurantId}/operation/modifiers/catalogs/component-variants`
        );
        break;

      default:
        break;
    }
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
            Cargando módulo de modificadores…
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
      <Box sx={{ maxWidth: 1180, mx: "auto" }}>
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
                  fontSize: { xs: 30, md: 42 },
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.1,
                }}
              >
                Configuración de modificadores
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: { xs: 14, md: 17 },
                }}
              >
                Organiza grupos y opciones para personalizar productos de tu menú.
              </Typography>
            </Box>

            <Button
              onClick={() => setCatalogsDialogOpen(true)}
              variant="contained"
              startIcon={<SettingsApplicationsIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 230 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              Administrar catálogos
            </Button>
          </Stack>

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
            <Stack spacing={1.25}>
              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                Antes de comenzar
              </Typography>

              <InstructionRow
                step="1"
                text={
                  modifiersMode === "global"
                    ? "Modo global: los grupos y opciones que crees estarán disponibles para todas tus sucursales."
                    : "Modo por sucursal: los grupos y opciones que crees pertenecerán únicamente a la sucursal seleccionada."
                }
              />

              <InstructionRow
                step="2"
                text={
                  modifiersMode === "global"
                    ? "Crea primero los grupos y después agrega las opciones que pertenezcan a cada uno."
                    : "Selecciona la sucursal correcta antes de crear o editar grupos y opciones."
                }
              />

              <InstructionRow
                step="3"
                text="Las opciones que controlan inventario deben crearse inactivas, configurar primero su consumo físico y después activarse."
              />
            </Stack>
          </Paper>

          {requiresBranch ? (
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
              <Stack spacing={1.25}>
                <Typography sx={fieldLabelSx}>Sucursal</Typography>

                <TextField
                  select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  fullWidth
                  disabled={refreshing}
                  SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch.id} value={String(branch.id)}>
                      {branch.name || `Sucursal ${branch.id}`}
                    </MenuItem>
                  ))}
                </TextField>

                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  Tu restaurante está configurado por sucursal, así que los
                  cambios se aplicarán solo a la sucursal seleccionada.
                </Typography>

                {refreshing ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={16} />

                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      Actualizando grupos y opciones…
                    </Typography>
                  </Stack>
                ) : null}
              </Stack>
            </Paper>
          ) : null}

          <ModifierTabs tab={tab} onChange={setTab} />

          {tab === "groups" ? (
            <ModifierGroupsPanel
              restaurantId={restaurantId}
              requiresBranch={requiresBranch}
              effectiveBranchId={effectiveBranchId}
              groups={groups}
              onReload={refreshModifierCatalog}
            />
          ) : (
            <ModifierOptionsPanel
              restaurantId={restaurantId}
              requiresBranch={requiresBranch}
              effectiveBranchId={effectiveBranchId}
              groups={groups}
              options={options}
              getGroupLabel={getGroupLabel}
              onReload={refreshModifierCatalog}
            />
          )}
        </Stack>
      </Box>

      <ModifierCatalogsDialog
        open={catalogsDialogOpen}
        onClose={() => setCatalogsDialogOpen(false)}
        onSelect={handleSelectCatalog}
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