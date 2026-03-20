import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box, Button, CircularProgress, MenuItem, Paper, Stack,
  TextField, Typography,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";

import PageContainer from "../../components/common/PageContainer";
import AppAlert from "../../components/common/AppAlert";

import ModifierTabs from "../../components/menu/modifiers/ModifierTabs";
import ModifierGroupsPanel from "../../components/menu/modifiers/ModifierGroupsPanel";
import ModifierOptionsPanel from "../../components/menu/modifiers/ModifierOptionsPanel";
import ModifierCatalogsDialog from "../../components/menu/modifiers/catalogs/ModifierCatalogsDialog";

import { getRestaurantSettings } from "../../services/restaurant/restaurantSettings.service";
import { getBranchesByRestaurant } from "../../services/restaurant/branch.service";

import {
  getModifierGroups,
} from "../../services/menu/modifiers/modifierGroups.service";

import {
  getAllModifierOptions,
} from "../../services/menu/modifiers/modifierOptions.service";

export default function ModifierManager() {
  const nav = useNavigate();
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
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

  const effectiveBranchId = useMemo(() => {
    if (!requiresBranch) return null;
    return branchId ? Number(branchId) : null;
  }, [requiresBranch, branchId]);

  const branchQuery = useMemo(() => {
    if (!requiresBranch || !effectiveBranchId) return {};
    return { branch_id: effectiveBranchId };
  }, [requiresBranch, effectiveBranchId]);

  const groupNameById = useMemo(() => {
    const map = {};
    groups.forEach((g) => {
      map[g.id] = g.name;
    });
    return map;
  }, [groups]);

  const getGroupLabel = (groupId) => {
    if (!groupId) return "Sin grupo";
    return groupNameById[groupId] || "Grupo eliminado";
  };

  const refreshGroups = async (queryOverride = null) => {
    const response = await getModifierGroups(
      restaurantId,
      queryOverride ?? branchQuery
    );

    const rows = Array.isArray(response?.data) ? response.data : [];
    setGroups(rows);
    return rows;
  };

  const refreshOptions = async (groupsOverride = null) => {
    const sourceGroups = Array.isArray(groupsOverride) ? groupsOverride : groups;
    const rows = await getAllModifierOptions(restaurantId, sourceGroups);
    setOptions(Array.isArray(rows) ? rows : []);
  };

  const refreshAll = async (queryOverride = null) => {
    const loadedGroups = await refreshGroups(queryOverride);
    await refreshOptions(loadedGroups);
  };

  const loadAll = async () => {
    setLoading(true);

    try {
      const st = await getRestaurantSettings(restaurantId);
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

      const query =
        st?.modifiers_mode === "branch" && selectedBranchId
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
    if (!requiresBranch) return;
    if (!effectiveBranchId) return;

    (async () => {
      try {
        const query = { branch_id: effectiveBranchId };
        await refreshAll(query);
      } catch (e) {
        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudieron recargar los grupos y opciones",
        });
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
      <PageContainer>
        <Box
          sx={{
            minHeight: "60vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="primary" />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Cargando módulo de modificadores…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
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

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            <Button
              onClick={() => setCatalogsDialogOpen(true)}
              variant="outlined"
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
                  : "Modo por sucursal: los grupos y opciones pertenecerán únicamente a la sucursal seleccionada."
              }
            />

            <InstructionRow
              step="2"
              text={
                modifiersMode === "global"
                  ? "Crea primero los grupos y luego agrega las opciones que pertenezcan a cada uno."
                  : "Selecciona la sucursal correcta antes de crear o editar grupos y opciones."
              }
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
                SelectProps={{
                  IconComponent: KeyboardArrowDownIcon,
                }}
              >
                {branches.map((b) => (
                  <MenuItem key={b.id} value={String(b.id)}>
                    {b.name || `Sucursal ${b.id}`}
                  </MenuItem>
                ))}
              </TextField>

              <Typography
                sx={{
                  fontSize: 12,
                  color: "text.secondary",
                }}
              >
                Tu restaurante está configurado por sucursal, así que los cambios
                se aplicarán solo a la sucursal seleccionada.
              </Typography>
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
            onReload={refreshAll}
          />
        ) : (
          <ModifierOptionsPanel
            restaurantId={restaurantId}
            requiresBranch={requiresBranch}
            effectiveBranchId={effectiveBranchId}
            groups={groups}
            options={options}
            getGroupLabel={getGroupLabel}
            onReload={refreshAll}
          />
        )}
      </Stack>

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
    </PageContainer>
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