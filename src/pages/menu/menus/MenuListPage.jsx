import {
  Box, CircularProgress, Paper, Stack, Typography,
} from "@mui/material";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";

import MenusHeader from "../../../components/menu/menus/MenusHeader";
import MenusInstructionsCard from "../../../components/menu/menus/MenusInstructionsCard";
import MenuBranchSelector from "../../../components/menu/menus/MenuBranchSelector";
import MenuFilters from "../../../components/menu/menus/MenuFilters";
import MenusList from "../../../components/menu/menus/MenusList";
import MenuFormDialog from "../../../components/menu/menus/MenuFormDialog";
import MenuActionDialog from "../../../components/menu/menus/MenuActionDialog";

import {
  getBranchesByRestaurant,
} from "../../../services/restaurant/branch.service";

import {
  activateMenu,
  archiveMenu,
  createMenu,
  getMenus,
  updateMenu,
} from "../../../services/menu/menus/menus.service";

export default function MenuListPage() {
  const { restaurantId } =
    useParams();

  const navigate = useNavigate();
  const location = useLocation();

  const restaurantName =
    location.state?.restaurantName ||
    "RESTAURANTE";

  const returnedBranchId =
    location.state?.branchId
      ? String(
          location.state.branchId
        )
      : "";

  const [branches, setBranches] =
    useState([]);

  const [
    selectedBranchId,
    setSelectedBranchId,
  ] = useState(returnedBranchId);

  const [menus, setMenus] =
    useState([]);

  const [
    loadingBranches,
    setLoadingBranches,
  ] = useState(true);

  const [
    loadingMenus,
    setLoadingMenus,
  ] = useState(false);

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingMenu, setEditingMenu] =
    useState(null);

  const [actionState, setActionState] =
    useState({
      open: false,
      type: null,
      menu: null,
    });

  const [
    processingAction,
    setProcessingAction,
  ] = useState(false);

  const [busyMenuId, setBusyMenuId] =
    useState(null);

  const [alertState, setAlertState] =
    useState({
      open: false,
      severity: "error",
      title: "",
      message: "",
    });

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
    if (reason === "clickaway") {
      return;
    }

    setAlertState((current) => ({
      ...current,
      open: false,
    }));
  };

  useEffect(() => {
    let active = true;

    const loadBranches =
      async () => {
        setLoadingBranches(true);

        try {
          const response =
            await getBranchesByRestaurant(
              restaurantId
            );

          if (!active) return;

          const rows = Array.isArray(
            response
          )
            ? response
            : [];

          setBranches(rows);

          setSelectedBranchId(
            (current) => {
              const currentExists =
                rows.some(
                  (branch) =>
                    String(branch.id) ===
                    String(current)
                );

              if (currentExists) {
                return String(current);
              }

              const returnedExists =
                rows.some(
                  (branch) =>
                    String(branch.id) ===
                    String(
                      returnedBranchId
                    )
                );

              if (returnedExists) {
                return String(
                  returnedBranchId
                );
              }

              return rows[0]?.id
                ? String(rows[0].id)
                : "";
            }
          );
        } catch (error) {
          if (!active) return;

          setBranches([]);
          setSelectedBranchId("");

          showAlert({
            severity: "error",
            title: "Error",
            message:
              error?.response?.data
                ?.message ||
              error?.message ||
              "No se pudieron cargar las sucursales.",
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
  }, [
    restaurantId,
    returnedBranchId,
  ]);

  useEffect(() => {
    if (!selectedBranchId) {
      setMenus([]);
      return undefined;
    }

    let active = true;

    const loadMenus = async () => {
      setLoadingMenus(true);

      try {
        const result =
          await getMenus(
            restaurantId,
            selectedBranchId
          );

        if (!active) return;

        setMenus(
          normalizeMenus(
            result.menus
          )
        );
      } catch (error) {
        if (!active) return;

        setMenus([]);

        showAlert({
          severity: "error",
          title: "Error",
          message:
            getBackendMessage(
              error,
              "No se pudieron cargar los menús."
            ),
        });
      } finally {
        if (active) {
          setLoadingMenus(false);
        }
      }
    };

    loadMenus();

    return () => {
      active = false;
    };
  }, [
    restaurantId,
    selectedBranchId,
  ]);

  const selectedBranch =
    useMemo(() => {
      return (
        branches.find(
          (branch) =>
            String(branch.id) ===
            String(
              selectedBranchId
            )
        ) || null
      );
    }, [
      branches,
      selectedBranchId,
    ]);

  const filteredMenus =
    useMemo(() => {
      const normalizedSearch =
        String(search || "")
          .trim()
          .toLocaleLowerCase(
            "es-MX"
          );

      return menus.filter((menu) => {
        const matchesStatus =
          statusFilter === "all" ||
          menu?.status ===
            statusFilter;

        const menuName =
          String(menu?.name || "")
            .toLocaleLowerCase(
              "es-MX"
            );

        const matchesSearch =
          normalizedSearch === "" ||
          menuName.includes(
            normalizedSearch
          );

        return (
          matchesStatus &&
          matchesSearch
        );
      });
    }, [
      menus,
      search,
      statusFilter,
    ]);

  const handleBranchChange = (
    branchId
  ) => {
    setSelectedBranchId(
      String(branchId)
    );

    setSearch("");
    setStatusFilter("all");
  };

  const openCreate = () => {
    if (!selectedBranchId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message:
          "Selecciona una sucursal para crear un menú.",
      });

      return;
    }

    setEditingMenu(null);
    setFormOpen(true);
  };

  const openEdit = (menu) => {
    setEditingMenu(menu);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingMenu(null);
  };

  const saveMenu = async (
    payload
  ) => {
    if (!selectedBranchId) {
      throw new Error(
        "Selecciona una sucursal para continuar."
      );
    }

    if (editingMenu?.id) {
      const result =
        await updateMenu(
          restaurantId,
          selectedBranchId,
          editingMenu.id,
          payload
        );

      if (result.menu) {
        setMenus((current) =>
          normalizeMenus(
            current.map((menu) =>
              String(menu.id) ===
              String(
                result.menu.id
              )
                ? result.menu
                : menu
            )
          )
        );
      }

      showAlert({
        severity: "success",
        title: "Hecho",
        message:
          result.message ||
          "Menú actualizado correctamente.",
      });
    } else {
      const result =
        await createMenu(
          restaurantId,
          selectedBranchId,
          payload
        );

      if (result.menu) {
        setMenus((current) =>
          normalizeMenus([
            ...current,
            result.menu,
          ])
        );
      }

      showAlert({
        severity: "success",
        title: "Hecho",
        message:
          result.message ||
          "Menú creado correctamente.",
      });
    }

    closeForm();
  };

  const openAction = (
    type,
    menu
  ) => {
    setActionState({
      open: true,
      type,
      menu,
    });
  };

  const closeAction = () => {
    if (processingAction) return;

    setActionState({
      open: false,
      type: null,
      menu: null,
    });
  };

  const confirmAction = async () => {
    const menu =
      actionState.menu;

    if (
      !menu?.id ||
      !selectedBranchId
    ) {
      return;
    }

    setProcessingAction(true);
    setBusyMenuId(menu.id);

    try {
      const result =
        actionState.type ===
        "archive"
          ? await archiveMenu(
              restaurantId,
              selectedBranchId,
              menu.id
            )
          : await activateMenu(
              restaurantId,
              selectedBranchId,
              menu.id
            );

      if (result.menu) {
        setMenus((current) =>
          normalizeMenus(
            current.map(
              (currentMenu) =>
                String(
                  currentMenu.id
                ) ===
                String(
                  result.menu.id
                )
                  ? result.menu
                  : currentMenu
            )
          )
        );
      }

      showAlert({
        severity: "success",
        title: "Hecho",
        message:
          result.message ||
          (actionState.type ===
          "archive"
            ? "Menú archivado correctamente."
            : "Menú activado correctamente."),
      });

      setActionState({
        open: false,
        type: null,
        menu: null,
      });
    } catch (error) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          getBackendMessage(
            error,
            actionState.type ===
              "archive"
              ? "No se pudo archivar el menú."
              : "No se pudo activar el menú."
          ),
      });
    } finally {
      setProcessingAction(false);
      setBusyMenuId(null);
    }
  };

  const navigateToContent = (
    menu
  ) => {
    navigate(
      `/owner/restaurants/${restaurantId}/operation/menus/${menu.id}/content?branchId=${selectedBranchId}`,
      {
        state: {
          restaurantName,
          branchId:
            selectedBranchId,
          menuName: menu.name,
        },
      }
    );
  };

  const navigateToChannels = (
    menu
  ) => {
    navigate(
      `/owner/restaurants/${restaurantId}/operation/menus/${menu.id}/channels?branchId=${selectedBranchId}`,
      {
        state: {
          restaurantName,
          branchId:
            selectedBranchId,
          menuName: menu.name,
        },
      }
    );
  };

  if (loadingBranches) {
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
              Cargando menús…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <MenusHeader
          branchName={
            selectedBranch?.name
          }
          onCreate={openCreate}
          disabled={
            branches.length === 0
          }
        />

        <MenusInstructionsCard />

        <MenuBranchSelector
          branches={branches}
          value={selectedBranchId}
          onChange={
            handleBranchChange
          }
          disabled={loadingMenus}
        />

        {branches.length === 0 ? (
          <Paper
            sx={{
              px: 3,
              py: 5,
              textAlign: "center",
              borderRadius: 1,
              backgroundColor:
                "background.paper",
              border: "1px solid",
              borderColor:
                "divider",
              boxShadow: "none",
            }}
          >
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 800,
                color:
                  "text.primary",
              }}
            >
              No hay sucursales disponibles
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: 14,
                color:
                  "text.secondary",
                lineHeight: 1.55,
              }}
            >
              Registra una sucursal antes de crear y administrar menús.
            </Typography>
          </Paper>
        ) : (
          <>
            <MenuFilters
              search={search}
              status={
                statusFilter
              }
              total={
                filteredMenus.length
              }
              onSearchChange={
                setSearch
              }
              onStatusChange={
                setStatusFilter
              }
            />

            <MenusList
              menus={
                filteredMenus
              }
              loading={
                loadingMenus
              }
              busyMenuId={
                busyMenuId
              }
              onContent={
                navigateToContent
              }
              onChannels={
                navigateToChannels
              }
              onEdit={openEdit}
              onAction={
                openAction
              }
            />
          </>
        )}
      </Stack>

      <MenuFormDialog
        open={formOpen}
        menu={editingMenu}
        onClose={closeForm}
        onSave={saveMenu}
        onError={(message) =>
          showAlert({
            severity: "error",
            title: "Error",
            message,
          })
        }
      />

      <MenuActionDialog
        open={actionState.open}
        type={actionState.type}
        menu={actionState.menu}
        loading={
          processingAction
        }
        onClose={closeAction}
        onConfirm={
          confirmAction
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

function normalizeMenus(
  menus
) {
  return [
    ...(Array.isArray(menus)
      ? menus
      : []),
  ].sort((a, b) => {
    const aOrder = Number(
      a?.sort_order || 0
    );

    const bOrder = Number(
      b?.sort_order || 0
    );

    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    return String(
      a?.name || ""
    ).localeCompare(
      String(b?.name || ""),
      "es",
      {
        sensitivity: "base",
      }
    );
  });
}

function getBackendMessage(
  error,
  fallback
) {
  const data =
    error?.response?.data;

  const firstError =
    Object.values(
      data?.errors || {}
    ).flat()?.[0];

  return (
    data?.message ||
    firstError ||
    error?.message ||
    fallback
  );
}