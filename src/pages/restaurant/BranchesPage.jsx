import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import StarIcon from "@mui/icons-material/Star";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

import {
  getBranchesByRestaurant,
  deleteBranch,
} from "../../services/restaurant/branch.service";
import {
  getRestaurant,
  setRestaurantMainBranch,
} from "../../services/restaurant/restaurant.service";
import { handleRestaurantApiError } from "../../utils/subscriptionGuards";

import BranchUpsertModal from "../../components/restaurant/BranchUpsertModal";

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
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [items, setItems] = useState([]);
  const [mainBranchId, setMainBranchId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const title = useMemo(() => "Sucursales del restaurante", []);

  const load = async () => {
    setErr("");
    setLoading(true);

    try {
      const [branchesRes, restaurantRes] = await Promise.all([
        getBranchesByRestaurant(restaurantId),
        getRestaurant(restaurantId),
      ]);

      const rows = Array.isArray(branchesRes) ? branchesRes : [];
      const restaurant = restaurantRes?.data ?? restaurantRes;

      setItems(rows);
      setMainBranchId(restaurant?.main_branch_id ?? null);
    } catch (e) {
      const redirected = handleRestaurantApiError(e, nav, restaurantId);
      if (!redirected) {
        setErr(e?.response?.data?.message || "No se pudieron cargar las sucursales.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [restaurantId]);

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(""), 3000);
    return () => clearTimeout(t);
  }, [successMsg]);

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
    const ok = window.confirm(`¿Eliminar la sucursal "${branch?.name || ""}"?`);
    if (!ok) return;

    setErr("");
    setSaving(true);

    try {
      await deleteBranch(restaurantId, branch.id);
      setSuccessMsg("La sucursal se eliminó correctamente.");
      await load();
    } catch (e) {
      const redirected = handleRestaurantApiError(e, nav, restaurantId);
      if (!redirected) {
        setErr(e?.response?.data?.message || "No se pudo eliminar la sucursal.");
      }
    } finally {
      setSaving(false);
    }
  };

  const onSetMain = async (branch) => {
    if (!branch?.id) return;

    setErr("");
    setSuccessMsg("");

    setMainBranchId(branch.id);
    setSaving(true);

    try {
      await setRestaurantMainBranch(restaurantId, branch.id);
      setSuccessMsg("La sucursal principal se actualizó correctamente.");
      await load();
    } catch (e) {
      const redirected = handleRestaurantApiError(e, nav, restaurantId);
      if (!redirected) {
        setErr(
          e?.response?.data?.message || "No se pudo actualizar la sucursal principal."
        );
      }
      await load();
    } finally {
      setSaving(false);
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
            Cargando sucursales...
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

          {err && (
            <Alert
              severity="error"
              sx={{
                borderRadius: 1,
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>Error</Typography>
                <Typography variant="body2">{err}</Typography>
              </Box>
            </Alert>
          )}

          {successMsg && (
            <Alert
              severity="success"
              sx={{
                borderRadius: 1,
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>Listo</Typography>
                <Typography variant="body2">{successMsg}</Typography>
              </Box>
            </Alert>
          )}

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
                              <IconButton
                                onClick={() => onDelete(branch)}
                                disabled={saving}
                                sx={iconDeleteSx}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
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
        </Stack>
      </Box>

      <BranchUpsertModal
        open={modalOpen}
        onClose={onCloseModal}
        restaurantId={restaurantId}
        editing={editing}
        onSaved={async () => {
          setSuccessMsg(
            editing
              ? "La sucursal se actualizó correctamente."
              : "La sucursal se creó correctamente."
          );
          await load();
        }}
        nav={nav}
      />
    </Box>
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
};