//Tabs productos normales
import { useEffect, useMemo, useRef, useState } from "react";
import { CircularProgress, Paper, Stack, Typography } from "@mui/material";

import ViewAgendaOutlinedIcon from "@mui/icons-material/ViewAgendaOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

import ContextOverview from "../../../common/ContextOverview";
import MenuContentInstructionsCard from "./MenuContentInstructionsCard";
import MenuContentFilters from "./MenuContentFilters";
import MenuHierarchyEditor from "./MenuHierarchyEditor";
import MenuScheduleDialog from "./MenuScheduleDialog";

import {
  buildMenuContentPayload,
  findHierarchyNode,
  getBackendMessage,
  getHierarchySummary,
  mergeCatalogAndContent,
  moveHierarchyItem,
  setHierarchySelection,
  updateHierarchySchedules,
} from "./menuContent.helpers";

import {
  getMenuContent,
  getMenuContentCatalog,
  syncMenuContent,
} from "../../../../services/menu/menus/menuContent/menuContent.service";

function cleanCatalogSelections(catalog) {
  return {
    ...catalog,
    sections: (catalog?.sections || []).map((section) => ({
      ...section,
      is_selected: false,
      assignment_id: null,
      categories: (section.categories || []).map((category) => ({
        ...category,
        is_selected: false,
        assignment_id: null,
        products: (category.products || []).map((product) => ({
          ...product,
          is_selected: false,
          assignment_id: null,
        })),
      })),
    })),
  };
}

export default function MenuNormalProductsTab({
  restaurantId,
  branchId,
  menuId,
  menu,
  onAlert,
}) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState(null);

  const initialPayloadRef = useRef("");
  const persistedRef = useRef({ catalog: null, content: null });
  const savingRef = useRef(false);
  const onAlertRef = useRef(onAlert);

  const readOnly = menu?.is_archived === true || menu?.status === "archived";

  useEffect(() => {
    onAlertRef.current = onAlert;
  }, [onAlert]);

  useEffect(() => {
    let active = true;

    const loadContent = async () => {
      setLoading(true);
      setLoadFailed(false);

      try {
        const [catalogResult, contentResult] = await Promise.all([
          getMenuContentCatalog(restaurantId, branchId, menuId),
          getMenuContent(restaurantId, branchId, menuId),
        ]);

        if (!active) return;

        if (!catalogResult?.data || !contentResult?.data) {
          throw new Error("No fue posible recuperar toda la información del contenido.");
        }

        const catalog = cleanCatalogSelections(catalogResult.data);
        const content = contentResult.data;
        const merged = mergeCatalogAndContent(catalog, content);

        persistedRef.current = { catalog, content };
        initialPayloadRef.current = JSON.stringify(buildMenuContentPayload(merged.sections));

        setSections(merged.sections);
      } catch (error) {
        if (!active) return;

        setSections([]);
        setLoadFailed(true);

        onAlertRef.current?.({
          severity: "error",
          title: "Error",
          message: getBackendMessage(error, "No se pudo cargar el contenido normal del menú."),
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    loadContent();

    return () => {
      active = false;
    };
  }, [restaurantId, branchId, menuId]);

  const currentPayload = useMemo(() => buildMenuContentPayload(sections), [sections]);

  const hasChanges = useMemo(() => {
    return !loading && !loadFailed
      && JSON.stringify(currentPayload) !== initialPayloadRef.current;
  }, [currentPayload, loading, loadFailed]);

  const summary = useMemo(() => getHierarchySummary(sections), [sections]);

  const contextItems = useMemo(() => [
    {
      key: "sections",
      icon: <ViewAgendaOutlinedIcon fontSize="small" />,
      title: "Secciones",
      value: String(summary.sections),
    },
    {
      key: "categories",
      icon: <CategoryOutlinedIcon fontSize="small" />,
      title: "Categorías",
      value: String(summary.categories),
    },
    {
      key: "products",
      icon: <RestaurantMenuOutlinedIcon fontSize="small" />,
      title: "Productos",
      value: String(summary.products),
    },
    {
      key: "schedules",
      icon: <AccessTimeOutlinedIcon fontSize="small" />,
      title: "Horarios propios",
      value: String(summary.schedules),
    },
  ], [summary]);

  const selectedScheduleNode = useMemo(() => {
    if (!scheduleTarget) return null;
    return findHierarchyNode(sections, scheduleTarget);
  }, [sections, scheduleTarget]);

  const handleToggle = (target, checked) => {
    if (readOnly || saving) return;
    setSections((current) => setHierarchySelection(current, target, checked));
  };

  const handleMove = (target, direction) => {
    if (readOnly || saving) return;
    setSections((current) => moveHierarchyItem(current, target, direction));
  };

  const handleOpenSchedule = (target) => {
    if (saving) return;
    setScheduleTarget(target);
  };

  const handleSaveSchedule = (schedules) => {
    if (!scheduleTarget || readOnly || saving) return;

    setSections((current) => updateHierarchySchedules(current, scheduleTarget, schedules));
    setScheduleTarget(null);
  };

  const handleDiscard = () => {
    if (saving || !hasChanges) return;

    const { catalog, content } = persistedRef.current;
    if (!catalog || !content) return;

    const merged = mergeCatalogAndContent(catalog, content);
    setSections(merged.sections);
    setScheduleTarget(null);
  };

  const handleSave = async () => {
    if (saving || savingRef.current || readOnly || !hasChanges) return;

    savingRef.current = true;
    setSaving(true);

    try {
      const result = await syncMenuContent(
        restaurantId, branchId, menuId, currentPayload
      );

      if (!result?.data) {
        throw new Error("No se recibió el contenido actualizado del menú.");
      }

      const catalog = persistedRef.current.catalog;
      const merged = mergeCatalogAndContent(catalog, result.data);

      persistedRef.current = { catalog, content: result.data };
      initialPayloadRef.current = JSON.stringify(buildMenuContentPayload(merged.sections));

      setSections(merged.sections);

      onAlertRef.current?.({
        severity: "success",
        title: "Hecho",
        message: result.message || "Contenido del menú guardado correctamente.",
      });
    } catch (error) {
      onAlertRef.current?.({
        severity: "error",
        title: "Error",
        message: getBackendMessage(error, "No se pudo guardar el contenido del menú."),
      });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={panelSx}>
        <Stack spacing={2} alignItems="center" sx={{ py: 5 }}>
          <CircularProgress />
          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
            Cargando productos normales…
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (loadFailed) {
    return (
      <Paper sx={{ ...panelSx, textAlign: "center", p: 4 }}>
        <Typography sx={{ fontSize: 19, fontWeight: 800 }}>
          No fue posible cargar los productos normales
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 14, color: "text.secondary" }}>
          No se realizaron cambios en el contenido del menú.
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Stack spacing={3}>
        <MenuContentInstructionsCard readOnly={readOnly} />

        <ContextOverview
          title="Contenido seleccionado"
          items={contextItems}
        />

        <MenuContentFilters
          search={search}
          selectedOnly={selectedOnly}
          onSearchChange={setSearch}
          onSelectedOnlyChange={setSelectedOnly}
        />

        <MenuHierarchyEditor
          sections={sections}
          search={search}
          selectedOnly={selectedOnly}
          readOnly={readOnly}
          saving={saving}
          hasChanges={hasChanges}
          onToggle={handleToggle}
          onMove={handleMove}
          onSchedule={handleOpenSchedule}
          onDiscard={handleDiscard}
          onSave={handleSave}
        />
      </Stack>

      <MenuScheduleDialog
        open={!!scheduleTarget && !!selectedScheduleNode}
        node={selectedScheduleNode}
        nodeType={scheduleTarget?.type}
        readOnly={readOnly || saving}
        onClose={() => setScheduleTarget(null)}
        onSave={handleSaveSchedule}
      />
    </>
  );
}

const panelSx = {
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "none",
};
