import {
  Box, Button, CircularProgress, Paper, Stack, Typography,
} from "@mui/material";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";

import MenuContentHeader from "../../../../components/menu/menus/menuContent/MenuContentHeader";
import MenuContentInstructionsCard from "../../../../components/menu/menus/menuContent/MenuContentInstructionsCard";
import MenuContentSummaryCards from "../../../../components/menu/menus/menuContent/MenuContentSummaryCards";
import MenuContentFilters from "../../../../components/menu/menus/menuContent/MenuContentFilters";
import MenuHierarchyEditor from "../../../../components/menu/menus/menuContent/MenuHierarchyEditor";
import MenuScheduleDialog from "../../../../components/menu/menus/menuContent/MenuScheduleDialog";

import {
  buildMenuContentPayload,
  findHierarchyNode,
  getBackendMessage,
  getHierarchySummary,
  mergeCatalogAndContent,
  moveHierarchyItem,
  setHierarchySelection,
  updateHierarchySchedules,
} from "../../../../components/menu/menus/menuContent/menuContent.helpers";

import {
  getMenuContent,
  getMenuContentCatalog,
  syncMenuContent,
} from "../../../../services/menu/menus/menuContent/menuContent.service";

export default function MenuContentPage() {
  const {
    restaurantId,
    menuId,
  } = useParams();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [searchParams] =
    useSearchParams();

  const restaurantName =
    location.state
      ?.restaurantName ||
    "RESTAURANTE";

  const branchId =
    searchParams.get(
      "branchId"
    ) ||
    location.state?.branchId ||
    "";

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [menu, setMenu] =
    useState(null);

  const [sections, setSections] =
    useState([]);

  const [
    productsMode,
    setProductsMode,
  ] = useState("global");

  const [search, setSearch] =
    useState("");

  const [
    selectedOnly,
    setSelectedOnly,
  ] = useState(false);

  const [
    scheduleTarget,
    setScheduleTarget,
  ] = useState(null);

  const [
    alertState,
    setAlertState,
  ] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const initialPayloadRef =
    useRef("");

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

  const closeAlert = (
    _,
    reason
  ) => {
    if (
      reason === "clickaway"
    ) {
      return;
    }

    setAlertState(
      (current) => ({
        ...current,
        open: false,
      })
    );
  };

  useEffect(() => {
    if (
      !restaurantId ||
      !menuId ||
      !branchId
    ) {
      setLoading(false);
      return undefined;
    }

    let active = true;

    const loadContent =
      async () => {
        setLoading(true);

        try {
          const [
            catalogResult,
            contentResult,
          ] =
            await Promise.allSettled(
              [
                getMenuContentCatalog(
                  restaurantId,
                  branchId,
                  menuId
                ),

                getMenuContent(
                  restaurantId,
                  branchId,
                  menuId
                ),
              ]
            );

          if (!active) return;

          if (
            catalogResult.status ===
            "rejected"
          ) {
            throw catalogResult.reason;
          }

          const catalogData =
            catalogResult.value
              ?.data || null;

          const contentData =
            contentResult.status ===
            "fulfilled"
              ? contentResult.value
                  ?.data || null
              : null;

          const merged =
            mergeCatalogAndContent(
              catalogData,
              contentData
            );

          setMenu(
            merged.menu
          );

          setProductsMode(
            merged.products_mode
          );

          setSections(
            merged.sections
          );

          initialPayloadRef.current =
            JSON.stringify(
              buildMenuContentPayload(
                merged.sections
              )
            );

          if (
            contentResult.status ===
            "rejected"
          ) {
            showAlert({
              severity: "warning",
              title: "Atención",
              message:
                getBackendMessage(
                  contentResult.reason,
                  "El catálogo se cargó, pero no fue posible recuperar todos los horarios actuales."
                ),
            });
          }
        } catch (error) {
          if (!active) return;

          setMenu(null);
          setSections([]);

          showAlert({
            severity: "error",
            title: "Error",
            message:
              getBackendMessage(
                error,
                "No se pudo cargar el contenido del menú."
              ),
          });
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

    loadContent();

    return () => {
      active = false;
    };
  }, [
    restaurantId,
    menuId,
    branchId,
  ]);

  const currentPayload =
    useMemo(
      () =>
        buildMenuContentPayload(
          sections
        ),
      [sections]
    );

  const hasChanges =
    useMemo(
      () =>
        JSON.stringify(
          currentPayload
        ) !==
        initialPayloadRef.current,
      [currentPayload]
    );

  const summary =
    useMemo(
      () =>
        getHierarchySummary(
          sections
        ),
      [sections]
    );

  const selectedScheduleNode =
    useMemo(() => {
      if (
        !scheduleTarget
      ) {
        return null;
      }

      return findHierarchyNode(
        sections,
        scheduleTarget
      );
    }, [
      sections,
      scheduleTarget,
    ]);

  const readOnly =
    !!menu?.is_archived;

  const handleToggle = (
    target,
    checked
  ) => {
    if (readOnly) return;

    setSections(
      (current) =>
        setHierarchySelection(
          current,
          target,
          checked
        )
    );
  };

  const handleMove = (
    target,
    direction
  ) => {
    if (readOnly) return;

    setSections(
      (current) =>
        moveHierarchyItem(
          current,
          target,
          direction
        )
    );
  };

  const handleOpenSchedule = (
    target
  ) => {
    setScheduleTarget(
      target
    );
  };

  const handleSaveSchedule = (
    schedules
  ) => {
    if (
      !scheduleTarget ||
      readOnly
    ) {
      return;
    }

    setSections(
      (current) =>
        updateHierarchySchedules(
          current,
          scheduleTarget,
          schedules
        )
    );

    setScheduleTarget(null);
  };

  const handleSave = async () => {
    if (
      saving ||
      readOnly ||
      !hasChanges
    ) {
      return;
    }

    setSaving(true);

    try {
      const result =
        await syncMenuContent(
          restaurantId,
          branchId,
          menuId,
          currentPayload
        );

      const merged =
        mergeCatalogAndContent(
          {
            menu:
              result.data?.menu ||
              menu,

            products_mode:
              productsMode,

            sections,
          },
          result.data
        );

      setMenu(
        merged.menu
      );

      setSections(
        merged.sections
      );

      initialPayloadRef.current =
        JSON.stringify(
          buildMenuContentPayload(
            merged.sections
          )
        );

      showAlert({
        severity: "success",
        title: "Hecho",
        message:
          result.message ||
          "Contenido del menú guardado correctamente.",
      });
    } catch (error) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          getBackendMessage(
            error,
            "No se pudo guardar el contenido del menú."
          ),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(
      `/owner/restaurants/${restaurantId}/operation/menus`,
      {
        state: {
          restaurantName,
          branchId,
        },
      }
    );
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
          <Stack
            spacing={2}
            alignItems="center"
          >
            <CircularProgress />

            <Typography
              sx={{
                fontSize: 14,
                color:
                  "text.secondary",
              }}
            >
              Cargando contenido del
              menú…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  if (!branchId) {
    return (
      <PageContainer>
        <Paper
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
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
            No se pudo identificar la
            sucursal
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontSize: 14,
              color:
                "text.secondary",
            }}
          >
            Regresa a la lista de menús
            y vuelve a seleccionar el
            contenido.
          </Typography>

          <Button
            type="button"
            variant="contained"
            onClick={handleBack}
            sx={{
              mt: 2.5,
              height: 44,
              fontWeight: 800,
            }}
          >
            Volver a menús
          </Button>
        </Paper>
      </PageContainer>
    );
  }

  if (!menu) {
    return (
      <PageContainer>
        <Paper
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
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
            No fue posible cargar el
            menú
          </Typography>

          <Button
            type="button"
            variant="contained"
            onClick={handleBack}
            sx={{
              mt: 2.5,
              height: 44,
              fontWeight: 800,
            }}
          >
            Volver a menús
          </Button>
        </Paper>

        <AppAlert
          open={
            alertState.open
          }
          onClose={closeAlert}
          severity={
            alertState.severity
          }
          title={
            alertState.title
          }
          message={
            alertState.message
          }
          autoHideDuration={
            3000
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <MenuContentHeader
          menu={menu}
          hasChanges={
            hasChanges
          }
          saving={saving}
          onBack={handleBack}
          onSave={handleSave}
        />

        <MenuContentInstructionsCard
          readOnly={readOnly}
        />

        <MenuContentSummaryCards
          summary={summary}
        />

        <MenuContentFilters
          search={search}
          selectedOnly={
            selectedOnly
          }
          onSearchChange={
            setSearch
          }
          onSelectedOnlyChange={
            setSelectedOnly
          }
        />

        <MenuHierarchyEditor
          sections={sections}
          search={search}
          selectedOnly={
            selectedOnly
          }
          readOnly={readOnly}
          onToggle={
            handleToggle
          }
          onMove={
            handleMove
          }
          onSchedule={
            handleOpenSchedule
          }
        />
      </Stack>

      <MenuScheduleDialog
        open={
          !!scheduleTarget &&
          !!selectedScheduleNode
        }
        node={
          selectedScheduleNode
        }
        nodeType={
          scheduleTarget?.type
        }
        readOnly={readOnly}
        onClose={() =>
          setScheduleTarget(
            null
          )
        }
        onSave={
          handleSaveSchedule
        }
      />

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={
          alertState.severity
        }
        title={alertState.title}
        message={
          alertState.message
        }
        autoHideDuration={3000}
      />
    </PageContainer>
  );
}