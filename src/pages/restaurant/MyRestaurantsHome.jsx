// src/pages/restaurant/MyRestaurantsHome.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert, Avatar,Box,Button,Card, CardContent, Chip, CircularProgress, Container, IconButton, Stack, Typography,
} from "@mui/material";

import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import StorefrontIcon from "@mui/icons-material/Storefront";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import {
  getMyRestaurants,
  getRestaurantSubscriptionStatus,
  deleteRestaurant,
} from "../../services/restaurant/restaurant.service";

import { useAuth } from "../../context/AuthContext";
import RestaurantFormModal from "../../components/restaurant/RestaurantFormModal";
import OwnerProfileModal from "../../components/owner/profile/OwnerProfileModal";
import OwnerUserMenu from "../../components/layout/OwnerUserMenu";
import AppAlert from "../../components/common/AppAlert";

import ReferralDiscountModal from "../../components/referrals/ReferralDiscountModal";

function getBadgeConfig(st) {
  if (!st) {
    return {
      label: "Verificando...",
      color: "#333",
      bg: "#eeeeee",
    };
  }

  if (st?.code === "RESTAURANT_SUSPENDED") {
    return {
      label: "SUSPENDIDO",
      color: "#ffffff",
      bg: "#D67A3A",
    };
  }

  if (st?.is_operational === true && st?.access_type === "demo") {
    return {
      label: "DEMO ACTIVO",
      color: "#111111",
      bg: "#FFB547",
    };
  }

  if (st?.is_operational === true && st?.access_type === "internal") {
    return {
      label: "ACCESO INTERNO",
      color: "#ffffff",
      bg: "#1976D2",
    };
  }

  if (st?.is_operational === true && st?.access_type === "paid") {
    return {
      label: st?.has_next_subscription ? "RENOVACIÓN PROGRAMADA" : "OPERATIVO",
      color: "#ffffff",
      bg: "#2EAF2E",
    };
  }

  if (st?.is_operational === true) {
    return {
      label: "OPERATIVO",
      color: "#ffffff",
      bg: "#2EAF2E",
    };
  }

  return {
    label: "BLOQUEADO",
    color: "#ffffff",
    bg: "#F2642A",
  };
}

export default function MyRestaurantsHome() {
  const nav = useNavigate();
  const { user, logout, referralDiscount, refreshMe } = useAuth();

  const [items, setItems] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const [referralModalOpen, setReferralModalOpen] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "success",
    title: "",
    message: "",
  });

  const ownerName = useMemo(() => {
    if (!user) return "";
    return [user.name, user.last_name_paternal, user.last_name_maternal]
      .filter(Boolean)
      .join(" ");
  }, [user]);

  const userMenuOpen = Boolean(userMenuAnchor);

  const showAlert = ({
    severity = "success",
    title = "Hecho",
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

  const openCreate = () => {
    setSelectedRestaurant(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRestaurant(null);
  };

  const load = async () => {
    setErr("");
    setLoading(true);

    try {
      await refreshMe();

      const res = await getMyRestaurants();
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      setItems(list);

      try {
        const pairs = await Promise.all(
          list.map(async (r) => {
            const st = await getRestaurantSubscriptionStatus(r.id);
            return [r.id, st];
          }),
        );
        setStatusMap(Object.fromEntries(pairs));
      } catch (e) {
        console.log(
          "No se pudieron cargar estados de suscripción",
          e?.response?.data || e?.message,
        );
      }
    } catch (e) {
      setErr(
        e?.response?.data?.message || "No se pudieron cargar restaurantes.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user?.id) return;
    if (!referralDiscount?.applies) return;

    setReferralModalOpen(true);
  }, [loading, user?.id, referralDiscount?.applies]);

  const onGoReferralPlans = () => {
    const firstRestaurant = items?.[0];

    setReferralModalOpen(false);

    if (!firstRestaurant?.id) {
      openCreate();
      return;
    }

    nav(`/owner/restaurants/${firstRestaurant.id}/plans`);
  };

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      nav("/auth/login", { replace: true });
    }
  };

  const onSaved = async (payload) => {
    await load();
    closeModal();

    if (payload?.data?.active_subscription?.plan?.slug === "demo") {
      showAlert({
        severity: "success",
        title: "Demo activo",
        message:
          payload?.message ||
          "Restaurante creado con plan demo activo por 7 días.",
      });
    }
  };

  const onProfileSaved = () => {
    showAlert({
      severity: "success",
      title: "Hecho",
      message: "Perfil actualizado correctamente.",
    });
  };

  const onGoPlans = (restaurantId) => {
    nav(`/owner/restaurants/${restaurantId}/plans`);
  };

  const onGoAdmin = async (restaurantId, restaurantName) => {
    const st = statusMap[restaurantId];

    if (st?.is_operational !== true) {
      nav(`/owner/restaurants/${restaurantId}/plans`, {
        state: {
          notice:
            "Este restaurante necesita un plan vigente para poder administrarse.",
          code: st?.code || "SUBSCRIPTION_REQUIRED",
        },
      });
      return;
    }

    nav(`/owner/restaurants/${restaurantId}/edit-info`, {
      state: {
        restaurantName: restaurantName || "RESTAURANTE",
      },
    });
  };

  const onDelete = async (restaurantId) => {
    const ok = window.confirm("¿De verdad desea borrar restaurante?");
    if (!ok) return;

    try {
      await deleteRestaurant(restaurantId);
      await load();
    } catch (e) {
      setErr(
        e?.response?.data?.message || "No se pudo eliminar el restaurante.",
      );
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "background.default",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="primary" />
          <Typography sx={{ color: "text.secondary" }}>
            Cargando restaurantes...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <RestaurantFormModal
        open={modalOpen}
        mode={modalMode}
        restaurant={selectedRestaurant}
        onClose={closeModal}
        onSaved={onSaved}
      />

      <OwnerProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onSaved={onProfileSaved}
      />

      <OwnerUserMenu
        anchorEl={userMenuAnchor}
        open={userMenuOpen}
        onClose={() => setUserMenuAnchor(null)}
        user={user}
        ownerName={ownerName}
        onEditProfile={() => setProfileOpen(true)}
        onLogout={onLogout}
      />

      <Box
        sx={{
          bgcolor: "primary.main",
          color: "#fff",
          px: { xs: 2, md: 4 },
          py: 2,
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
            flexWrap="wrap"
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                component="img"
                src="/images/clicmenu-blanco.png"
                alt="CLICMENU"
                sx={{
                  height: { xs: 40, md: 52 },
                  width: "auto",
                  objectFit: "contain",
                }}
              />
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              flexWrap="wrap"
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  display: { xs: "none", sm: "block" },
                }}
              >
                Bienvenido, {user?.name || "Propietario"}!
              </Typography>

              <IconButton
                onClick={(event) => setUserMenuAnchor(event.currentTarget)}
                sx={{
                  p: 0.3,
                  borderRadius: 999,
                  bgcolor: "rgba(255,255,255,0.16)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.25)",
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.35)",
                    color: "#fff",
                    fontWeight: 900,
                    width: 50,
                    height: 50,
                  }}
                >
                  {ownerName?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>
              </IconButton>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={3}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: 28, md: 36 },
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                Mis restaurantes
              </Typography>

              {ownerName && (
                <Typography sx={{ mt: 0.5, color: "text.secondary" }}>
                  Propietario: <strong>{ownerName}</strong>
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              onClick={openCreate}
              startIcon={<AddBusinessIcon />}
              sx={{
                minWidth: 220,
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              Nuevo restaurante
            </Button>
          </Stack>

          {err && <Alert severity="error">{err}</Alert>}

          {items.length === 0 ? (
            <Card
              sx={{
                p: { xs: 3, md: 5 },
                textAlign: "center",
                borderRadius: 1,
              }}
            >
              <Stack spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 68,
                    height: 68,
                    bgcolor: "rgba(255,152,0,0.12)",
                    color: "primary.main",
                  }}
                >
                  <StorefrontIcon sx={{ fontSize: 34 }} />
                </Avatar>

                <Typography
                  sx={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  Aún no tienes restaurantes registrados
                </Typography>

                <Typography sx={{ maxWidth: 560, color: "text.secondary" }}>
                  Registra tu primer restaurante para comenzar con la
                  configuración y operación.
                </Typography>

                <Button
                  variant="contained"
                  onClick={openCreate}
                  sx={{
                    mt: 1,
                    minWidth: 220,
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  Registrar restaurante
                </Button>
              </Stack>
            </Card>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "1fr 1fr",
                },
                gap: 3,
              }}
            >
              {items.map((r) => {
                const st = statusMap[r.id];
                const badge = getBadgeConfig(st);

                const accessType = st?.access_type || "none";
                const currentAccess = st?.current_access || st?.subscription || null;
                const nextSubscription = st?.next_subscription || null;

                const isOperational = st?.is_operational === true;
                const isDemo = accessType === "demo";
                const isPaid = accessType === "paid";
                const isInternal = accessType === "internal";

                const demoDays = currentAccess?.days_remaining;
                const hasNextSubscription =
                  st?.has_next_subscription === true || Boolean(nextSubscription);

                return (
                  <Card
                    key={r.id}
                    sx={{
                      borderRadius: 1,
                      minHeight: 300,
                    }}
                  >
                    <CardContent
                      sx={{
                        p: { xs: 3, md: 4 },
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        gap={2}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: 26, md: 34 },
                            fontWeight: 800,
                            color: "text.primary",
                            lineHeight: 1.1,
                          }}
                        >
                          {r.trade_name || "Restaurante sin nombre"}
                        </Typography>

                        <Chip
                          label={badge.label}
                          sx={{
                            bgcolor: badge.bg,
                            color: badge.color,
                            fontWeight: 800,
                            borderRadius: 999,
                          }}
                        />
                      </Stack>

                      {isDemo ? (
                        <Typography
                          sx={{
                            mt: 2,
                            fontSize: 14,
                            fontWeight: 800,
                            color: "#8A5A00",
                            backgroundColor: "#FFF7E8",
                            border: "1px solid #F3D48B",
                            borderRadius: 1,
                            px: 1.5,
                            py: 1,
                          }}
                        >
                          Te quedan{" "}
                          {demoDays === null || demoDays === undefined
                            ? "algunos"
                            : demoDays}{" "}
                          día
                          {Number(demoDays) === 1 ? "" : "s"} de demo.
                        </Typography>
                      ) : null}

                      {isPaid && hasNextSubscription ? (
                        <Typography
                          sx={{
                            mt: 2,
                            fontSize: 14,
                            fontWeight: 800,
                            color: "#166534",
                            backgroundColor: "#ECFDF3",
                            border: "1px solid #B7E4C7",
                            borderRadius: 1,
                            px: 1.5,
                            py: 1,
                          }}
                        >
                          Este restaurante ya tiene una renovación programada
                          {nextSubscription?.starts_at
                            ? ` para iniciar el ${new Date(nextSubscription.starts_at).toLocaleDateString("es-MX")}.`
                            : "."}
                        </Typography>
                      ) : null}

                      {isInternal ? (
                        <Typography
                          sx={{
                            mt: 2,
                            fontSize: 14,
                            fontWeight: 800,
                            color: "#1D4ED8",
                            backgroundColor: "#EFF6FF",
                            border: "1px solid #BFDBFE",
                            borderRadius: 1,
                            px: 1.5,
                            py: 1,
                          }}
                        >
                          Este restaurante cuenta con acceso interno activo.
                        </Typography>
                      ) : null}


                      <Box sx={{ flex: 1 }} />

                      <Stack
                        spacing={1.5}
                        sx={{
                          maxWidth: 260,
                          mx: "auto",
                          width: "100%",
                        }}
                      >
                        <Button
                          variant="contained"
                          onClick={() => onGoPlans(r.id)}
                          fullWidth
                          sx={{
                            height: 40,
                            borderRadius: 2,
                            fontWeight: 800,
                          }}
                        >
                          {isOperational
                            ? isPaid
                              ? "Renovar plan"
                              : isDemo
                              ? "Contratar plan"
                              : "Ver planes"
                            : "Ver planes / Contratar"}
                        </Button>

                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => onGoAdmin(r.id, r.trade_name)}
                          fullWidth
                          sx={{
                            height: 40,
                            borderRadius: 2,
                            fontWeight: 800,
                          }}
                        >
                          Administrar
                        </Button>
                      </Stack>

                      <Stack
                        direction="row"
                        justifyContent="flex-end"
                        sx={{ mt: 2 }}
                      >
                        <IconButton
                          onClick={() => onDelete(r.id)}
                          sx={{
                            bgcolor: "error.main",
                            color: "#fff",
                            borderRadius: 2,
                            "&:hover": {
                              bgcolor: "error.dark",
                            },
                          }}
                          title="Eliminar restaurante"
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </Stack>
      </Container>

      <ReferralDiscountModal
        open={referralModalOpen}
        code={referralDiscount?.code}
        percent={referralDiscount?.percent || 5}
        hasRestaurant={items.length > 0}
        onClose={() => setReferralModalOpen(false)}
        onGoPlans={onGoReferralPlans}
      />

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={3000}
      />
    </Box>
  );
}
