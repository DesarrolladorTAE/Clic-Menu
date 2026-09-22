import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Avatar, Box, Button, Card, CardContent, Chip, CircularProgress, IconButton, Stack, Tooltip, Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import StarIcon from "@mui/icons-material/Star";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

import {
  getBranchesByRestaurant,
  dryRunDeleteBranch,
  deleteBranch,
} from "../../services/restaurant/branch.service";

import {
  getRestaurant,
  setRestaurantMainBranch,
} from "../../services/restaurant/restaurant.service";

import {
  deleteDemoContent,
  getDemoContentStatus,
} from "../../services/restaurant/demoContent.service";

import { handleRestaurantApiError } from "../../utils/subscriptionGuards";

import BranchUpsertModal from "../../components/restaurant/BranchUpsertModal";
import DemoContentCard from "../../components/restaurant/DemoContentCard";

import AppAlert from "../../components/common/AppAlert";
import PageContainer from "../../components/common/PageContainer";

function getBranchStatusConfig(status) {
  const value = String(status || "").toLowerCase();

  if (value === "active") {
    return {
      label: "ACTIVO",
      bg: "#2EAF2E",
      color: "#FFFFFF",
    };
  }

  if (value === "inactive") {
    return {
      label: "INACTIVO",
      bg: "#F2642A",
      color: "#FFFFFF",
    };
  }

  if (
    value === "restaurant_suspended" ||
    value === "suspended" ||
    value === "suspended_by_plan"
  ) {
    return {
      label: "SUSPENDIDO POR PLAN",
      bg: "#F2642A",
      color: "#FFFFFF",
    };
  }

  return {
    label: (status || "SIN ESTADO").toString().toUpperCase(),
    bg: "#6E6A6A",
    color: "#FFFFFF",
  };
}

function formatHour(value) {
  if (!value) return "--:--";
  return String(value).slice(0, 5);
}

function resolveBranchLogo(branch) {
  const logo = branch?.active_logo || branch?.activeLogo || null;
  return logo?.public_url || null;
}

export default function BranchesPage() {
  const nav = useNavigate();
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingBranchId, setDeletingBranchId] = useState(null);
  const [eliminandoContenidoDemo, setEliminandoContenidoDemo] = useState(false);

  const [items, setItems] = useState([]);
  const [mainBranchId, setMainBranchId] = useState(null);
  const [contenidoDemo, setContenidoDemo] = useState({
    has_demo_content: false,
    branch: null,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [alerta, setAlerta] = useState({
    open: false,
    severity: "success",
    title: "",
    message: "",
  });

  const title = useMemo(() => "Sucursales del restaurante", []);

  const mostrarAlerta = (severity, title, message) => {
    setAlerta({
      open: true,
      severity,
      title,
      message,
    });
  };

  const cerrarAlerta = () => {
    setAlerta((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const load = async (mostrarCarga = true) => {
    if (mostrarCarga) {
      setLoading(true);
    }

    try {
      const [branchesRes, restaurantRes, demoRes] = await Promise.all([
        getBranchesByRestaurant(restaurantId),
        getRestaurant(restaurantId),
        getDemoContentStatus(restaurantId),
      ]);

      const rows = Array.isArray(branchesRes) ? branchesRes : [];
      const restaurant = restaurantRes?.data ?? restaurantRes;

      setItems(rows);
      setMainBranchId(restaurant?.main_branch_id ?? null);
      setContenidoDemo(
        demoRes?.has_demo_content
          ? demoRes
          : {
              has_demo_content: false,
              branch: null,
            }
      );
    } catch (e) {
      const redirected = handleRestaurantApiError(e, nav, restaurantId);

      if (!redirected) {
        mostrarAlerta(
          "error",
          "Error",
          e?.response?.data?.message || "No se pudieron cargar las sucursales."
        );
      }
    } finally {
      if (mostrarCarga) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    load(true);
  }, [restaurantId]);

  const onCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const onEdit = (branch) => {
    setEditing(branch);
    setModalOpen(true);
  };

  const onCloseModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
  };

  const onDelete = async (branch) => {
    const branchId = branch?.id;

    if (!branchId) return;
    if (saving || deletingBranchId !== null) return;

    cerrarAlerta();
    setSaving(true);
    setDeletingBranchId(branchId);

    try {
      const dryRunResult = await dryRunDeleteBranch(restaurantId, branchId);

      if (dryRunResult?.ok === false) {
        mostrarAlerta(
          "error",
          "No se puede eliminar",
          dryRunResult?.message ||
            "Esta sucursal no puede eliminarse por la información relacionada que tiene registrada."
        );

        return;
      }

      const branchName = branch?.name || `Sucursal #${branchId}`;

      const ok = window.confirm(
        `¿Eliminar definitivamente la sucursal "${branchName}"?\n\nEsta acción no se puede deshacer.`
      );

      if (!ok) return;

      const result = await deleteBranch(restaurantId, branchId);

      setItems((prev) => prev.filter((item) => item.id !== branchId));

      if (Number(mainBranchId) === Number(branchId)) {
        setMainBranchId(null);
      }

      mostrarAlerta(
        "success",
        "Listo",
        result?.message || "La sucursal se eliminó correctamente."
      );

      await load(false);
    } catch (e) {
      const redirected = handleRestaurantApiError(e, nav, restaurantId);

      if (!redirected) {
        mostrarAlerta(
          "error",
          "Error",
          e?.response?.data?.message || "No se pudo eliminar la sucursal."
        );
      }
    } finally {
      setSaving(false);
      setDeletingBranchId(null);
    }
  };

  const onDeleteDemoContent = async (branch) => {
    if (!branch?.id || eliminandoContenidoDemo) {
      return false;
    }

    cerrarAlerta();
    setEliminandoContenidoDemo(true);

    try {
      const result = await deleteDemoContent(restaurantId, branch.id);

      setContenidoDemo({
        has_demo_content: false,
        branch: null,
      });

      mostrarAlerta(
        "success",
        "Listo",
        result?.message || "El contenido de demostración fue eliminado correctamente."
      );

      return true;
    } catch (e) {
      const redirected = handleRestaurantApiError(e, nav, restaurantId);

      if (!redirected) {
        mostrarAlerta(
          "error",
          "Error",
          e?.response?.data?.message || "No se pudo eliminar el contenido de demostración."
        );
      }

      return false;
    } finally {
      setEliminandoContenidoDemo(false);
    }
  };

  const onSetMain = async (branch) => {
    if (!branch?.id) {
      return;
    }

    const previousMainBranchId = mainBranchId;

    cerrarAlerta();
    setMainBranchId(branch.id);
    setSaving(true);

    try {
      await setRestaurantMainBranch(restaurantId, branch.id);

      mostrarAlerta(
        "success",
        "Listo",
        "La sucursal principal se actualizó correctamente."
      );
    } catch (e) {
      setMainBranchId(previousMainBranchId);

      const redirected = handleRestaurantApiError(e, nav, restaurantId);

      if (!redirected) {
        mostrarAlerta(
          "error",
          "Error",
          e?.response?.data?.message || "No se pudo actualizar la sucursal principal."
        );
      }
    } finally {
      setSaving(false);
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
              Cargando sucursales...
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <>
      <PageContainer>
          <Stack
            spacing={3}
            sx={{
              minHeight: { xs: "auto", md: "calc(100dvh - 48px)" },
            }}
          >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "flex-start" }}
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
                {title}
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: { xs: 15, md: 18 },
                }}
              >
                Define cuántas sucursales administrará tu restaurante
              </Typography>
            </Box>

            <Button
              onClick={onCreate}
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 210 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
                alignSelf: { xs: "stretch", md: "flex-start" },
              }}
            >
              Nueva sucursal
            </Button>
          </Stack>

          {items.length === 0 ? (
            <Card
              sx={{
                borderRadius: 1,
                backgroundColor: "background.paper",
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}>
                <Stack spacing={2} alignItems="center">
                  <Typography
                    sx={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: "text.primary",
                    }}
                  >
                    No hay sucursales registradas
                  </Typography>

                  <Typography
                    sx={{
                      maxWidth: 520,
                      color: "text.secondary",
                      fontSize: 14,
                    }}
                  >
                    Crea la primera sucursal para comenzar a organizar la operación del restaurante.
                  </Typography>

                  <Button
                    onClick={onCreate}
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                      minWidth: 220,
                      height: 44,
                      borderRadius: 2,
                      fontWeight: 800,
                    }}
                  >
                    Crear sucursal
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "1fr 1fr",
                },
                gap: 2.5,
              }}
            >
              {items.map((branch) => {
                const isMain = Number(mainBranchId) === Number(branch.id);
                const status = getBranchStatusConfig(branch.status);
                const logoUrl = resolveBranchLogo(branch);

                return (
                  <Card
                    key={branch.id}
                    sx={{
                      borderRadius: 1,
                      minHeight: { xs: "auto", md: 230 },
                      backgroundColor: "background.paper",
                    }}
                  >
                    <CardContent
                      sx={{
                        p: { xs: 2.25, sm: 2.5, md: 3 },
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Stack spacing={2}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          gap={1.5}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                            <Avatar
                              src={logoUrl || undefined}
                              variant="rounded"
                              imgProps={{
                                style: {
                                  objectFit: "contain",
                                  objectPosition: "center",
                                  padding: "6px",
                                  width: "100%",
                                  height: "100%",
                                },
                              }}
                              sx={{
                                width: 52,
                                height: 52,
                                borderRadius: 1.5,
                                bgcolor: "#F4F1F4",
                                color: "text.secondary",
                                flexShrink: 0,
                                overflow: "hidden",
                                "& img": {
                                  objectFit: "contain",
                                  objectPosition: "center",
                                  padding: "6px",
                                  backgroundColor: "#F4F1F4",
                                },
                              }}
                            >
                              {!logoUrl && <StorefrontOutlinedIcon />}
                            </Avatar>

                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                sx={{
                                  fontSize: { xs: 28, md: 22 },
                                  fontWeight: 800,
                                  color: "text.primary",
                                  lineHeight: 1.1,
                                  wordBreak: "break-word",
                                }}
                              >
                                {branch.name || "Sucursal sin nombre"}
                              </Typography>

                              <Typography
                                sx={{
                                  mt: 0.4,
                                  fontSize: 12,
                                  color: "text.secondary",
                                }}
                              >
                                {logoUrl ? "Logo configurado" : "Sin logo"}
                              </Typography>
                            </Box>
                          </Stack>

                          <Chip
                            label={status.label}
                            size="small"
                            sx={{
                              bgcolor: status.bg,
                              color: status.color,
                              fontWeight: 800,
                              borderRadius: 999,
                              flexShrink: 0,
                              "& .MuiChip-label": {
                                px: 1.2,
                              },
                            }}
                          />
                        </Stack>

                        <Box>
                          <Typography
                            sx={{
                              fontSize: 13,
                              color: "text.secondary",
                              lineHeight: 1.45,
                            }}
                          >
                            {branch.phone || "Sin teléfono"}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.35,
                              fontSize: 13,
                              color: "text.secondary",
                              lineHeight: 1.45,
                              wordBreak: "break-word",
                            }}
                          >
                            Dirección: {branch.address || "Sin dirección"}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.35,
                              fontSize: 13,
                              color: "text.secondary",
                              lineHeight: 1.45,
                            }}
                          >
                            Abre: {formatHour(branch.open_time)} · Cierra: {formatHour(branch.close_time)}
                          </Typography>
                        </Box>

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          gap={1.5}
                          sx={{ mt: "auto" }}
                        >
                          {isMain ? (
                            <Button
                              variant="contained"
                              disabled
                              sx={{
                                minWidth: 120,
                                height: 36,
                                borderRadius: 2,
                                fontWeight: 900,
                                bgcolor: "primary.main",
                                color: "#fff",
                                opacity: 1,
                                "&.Mui-disabled": {
                                  bgcolor: "primary.main",
                                  color: "#fff",
                                  opacity: 1,
                                },
                              }}
                            >
                              Principal
                            </Button>
                          ) : (
                            <Button
                              onClick={() => onSetMain(branch)}
                              disabled={saving}
                              variant="contained"
                              startIcon={<StarIcon sx={{ fontSize: 16 }} />}
                              sx={{
                                minWidth: 150,
                                height: 36,
                                borderRadius: 2,
                                fontWeight: 900,
                                bgcolor: "#6F78D8",
                                color: "#fff",
                                "&:hover": {
                                  bgcolor: "#5F68C8",
                                },
                              }}
                            >
                              Hacer principal
                            </Button>
                          )}

                          <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
                            <Tooltip title="Editar">
                              <IconButton
                                onClick={() => onEdit(branch)}
                                disabled={saving}
                                sx={iconEditSx}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Eliminar">
                              <span>
                                <IconButton
                                  onClick={() => onDelete(branch)}
                                  disabled={saving || deletingBranchId === branch.id}
                                  sx={iconDeleteSx}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}

          {contenidoDemo?.has_demo_content && contenidoDemo?.branch ? (
            <Box sx={{ mt: "auto !important" }}>
              <DemoContentCard
                branch={contenidoDemo.branch}
                eliminando={eliminandoContenidoDemo}
                onConfirmDelete={onDeleteDemoContent}
              />
            </Box>
          ) : null}

        </Stack>
      </PageContainer>

      <BranchUpsertModal
        open={modalOpen}
        onClose={onCloseModal}
        restaurantId={restaurantId}
        editing={editing}
        onSaved={async () => {
          mostrarAlerta(
            "success",
            "Listo",
            editing
              ? "La sucursal se actualizó correctamente."
              : "La sucursal se creó correctamente."
          );

          await load(false);
        }}
        nav={nav}
      />

      <AppAlert
        open={alerta.open}
        onClose={cerrarAlerta}
        severity={alerta.severity}
        title={alerta.title}
        message={alerta.message}
        autoHideDuration={3000}
      />
    </>
  );
}

const iconEditSx = {
  width: 36,
  height: 36,
  bgcolor: "#E3C24A",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "#C9AA39",
  },
};

const iconDeleteSx = {
  width: 36,
  height: 36,
  bgcolor: "#F2642A",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "#D94E17",
  },
  "&.Mui-disabled": {
    bgcolor: "action.disabledBackground",
    color: "action.disabled",
  },
};