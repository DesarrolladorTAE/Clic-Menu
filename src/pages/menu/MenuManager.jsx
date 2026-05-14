import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box, Button, CircularProgress, MenuItem, Paper, Stack, TextField, Typography,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";

import { getRestaurantSettings } from "../../services/restaurant/restaurantSettings.service";
import { getBranchesByRestaurant } from "../../services/restaurant/branch.service";

import { getMenuSections } from "../../services/menu/menuSections.service";

import { getCategories } from "../../services/menu/categories.service";

import AppAlert from "../../components/common/AppAlert";
import MenuTabs from "../../components/menu/MenuTabs";
import MenuSectionsPanel from "../../components/menu/MenuSectionsPanel";
import MenuCategoriesPanel from "../../components/menu/MenuCategoriesPanel";

export default function MenuManager() {
  const nav = useNavigate();
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const [settings, setSettings] = useState(null);
  const productsMode = settings?.products_mode || "global";
  const requiresBranch = productsMode === "branch";

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");

  const [tab, setTab] = useState("sections");

  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);

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

  const normalizeSettingsResponse = (res) => {
    return res?.data ?? res?.settings ?? res ?? null;
  };

  const effectiveBranchId = useMemo(() => {
    if (!requiresBranch) return null;
    return branchId ? Number(branchId) : null;
  }, [requiresBranch, branchId]);

  const branchQuery = useMemo(() => {
    if (!requiresBranch || !effectiveBranchId) return {};
    return { branch_id: effectiveBranchId };
  }, [requiresBranch, effectiveBranchId]);

  const sectionNameById = useMemo(() => {
    const map = {};
    sections.forEach((s) => {
      map[s.id] = s.name;
    });
    return map;
  }, [sections]);

  const getSectionLabel = (sectionId) => {
    if (!sectionId) return "Sin sección";
    return sectionNameById[sectionId] || "Sección eliminada";
  };

  const refreshMenuCatalog = async (queryOverride = null) => {
    const query = queryOverride ?? branchQuery;

    const [sec, cat] = await Promise.all([
      getMenuSections(restaurantId, query),
      getCategories(restaurantId, query),
    ]);

    setSections(Array.isArray(sec) ? sec : []);
    setCategories(Array.isArray(cat) ? cat : []);

    return {
      sections: Array.isArray(sec) ? sec : [],
      categories: Array.isArray(cat) ? cat : [],
    };
  };

  const refreshSections = async (queryOverride = null) => {
    return refreshMenuCatalog(queryOverride);
  };

  const refreshCategories = async (queryOverride = null) => {
    return refreshMenuCatalog(queryOverride);
  };

  const loadAll = async () => {
    setLoading(true);

    try {
      const settingsResponse = await getRestaurantSettings(restaurantId);
      const st = normalizeSettingsResponse(settingsResponse);

      setSettings(st);

      let selectedBranchId = null;
      let loadedBranches = [];

      if (st?.products_mode === "branch") {
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
        st?.products_mode === "branch" && selectedBranchId
          ? { branch_id: selectedBranchId }
          : {};

      await refreshMenuCatalog(query);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message || "No se pudo cargar el módulo de menú",
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
      setRefreshing(true);

      try {
        await refreshMenuCatalog({ branch_id: effectiveBranchId });
      } catch (e) {
        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudieron recargar las secciones y categorías",
        });
      } finally {
        setRefreshing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiresBranch, effectiveBranchId, restaurantId]);

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
            Cargando módulo de menú…
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
                Configuración de menú
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: { xs: 14, md: 17 },
                }}
              >
                Organiza la estructura base de tu menú con secciones y categorías.
              </Typography>
            </Box>

            <Button
              onClick={() =>
                nav(`/owner/restaurants/${restaurantId}/operation/menu/products`)
              }
              variant="contained"
              startIcon={<RestaurantMenuIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 220 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              Administrar productos
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
                  productsMode === "global"
                    ? "Modo global: los productos, secciones y categorías que crees estarán disponibles para todas tus sucursales."
                    : "Modo por sucursal: los productos, secciones y categorías que crees pertenecerán únicamente a la sucursal seleccionada."
                }
              />

              <InstructionRow
                step="2"
                text={
                  productsMode === "global"
                    ? "Si quieres manejar contenido distinto por sucursal, cambia esta configuración en Configuración del restaurante."
                    : "Selecciona la sucursal correcta antes de crear o editar secciones y categorías."
                }
              />

              <InstructionRow
                step="3"
                text="Siempre debe existir al menos una sección y una categoría activa para que los productos puedan organizarse correctamente."
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
                  Tu restaurante está configurado por sucursal, así que los cambios se aplicarán solo a la sucursal seleccionada.
                </Typography>

                {refreshing ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={16} />
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "text.secondary",
                      }}
                    >
                      Actualizando secciones y categorías…
                    </Typography>
                  </Stack>
                ) : null}
              </Stack>
            </Paper>
          ) : null}

          <MenuTabs tab={tab} onChange={setTab} />

          {tab === "sections" ? (
            <MenuSectionsPanel
              restaurantId={restaurantId}
              requiresBranch={requiresBranch}
              effectiveBranchId={effectiveBranchId}
              sections={sections}
              onReload={refreshSections}
              onReloadAll={refreshMenuCatalog}
            />
          ) : (
            <MenuCategoriesPanel
              restaurantId={restaurantId}
              requiresBranch={requiresBranch}
              effectiveBranchId={effectiveBranchId}
              categories={categories}
              sections={sections}
              getSectionLabel={getSectionLabel}
              onReload={refreshCategories}
              onReloadAll={refreshMenuCatalog}
            />
          )}
        </Stack>
      </Box>

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