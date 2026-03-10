import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Alert, Avatar, Box, Button, Card, CardContent, Chip, CircularProgress, Container,
  IconButton, Stack, Typography, } from "@mui/material";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import LogoutIcon from "@mui/icons-material/Logout";
import StorefrontIcon from "@mui/icons-material/Storefront";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import {
  getMyRestaurants,
  getRestaurantSubscriptionStatus,
  deleteRestaurant,
} from "../../services/restaurant/restaurant.service";
import { useAuth } from "../../context/AuthContext";
import RestaurantFormModal from "../../components/restaurant/RestaurantFormModal";

function getBadgeConfig(st) {
  if (!st) {
    return {
      label: "Verificando...",
      color: "#333",
      bg: "#eeeeee",
    };
  }

  if (st?.is_operational === true) {
    return {
      label: "OPERATIVO",
      color: "#ffffff",
      bg: "#2EAF2E",
    };
  }

  if (st?.code === "RESTAURANT_SUSPENDED") {
    return {
      label: "SUSPENDIDO",
      color: "#ffffff",
      bg: "#D67A3A",
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
  const { user, logout } = useAuth();

  const [items, setItems] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const ownerName = useMemo(() => {
    if (!user) return "";
    return [user.name, user.last_name_paternal, user.last_name_maternal]
      .filter(Boolean)
      .join(" ");
  }, [user]);

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
      const res = await getMyRestaurants();
      const list = Array.isArray(res) ? res : res?.data ?? [];
      setItems(list);

      try {
        const pairs = await Promise.all(
          list.map(async (r) => {
            const st = await getRestaurantSubscriptionStatus(r.id);
            return [r.id, st];
          })
        );
        setStatusMap(Object.fromEntries(pairs));
      } catch (e) {
        console.log("No se pudieron cargar estados de suscripción", e?.response?.data || e?.message);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudieron cargar restaurantes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      nav("/auth/login", { replace: true });
    }
  };

  const onSaved = async () => {
    await load();
    closeModal();
  };

  const onGoPlans = (restaurantId) => {
    nav(`/owner/restaurants/${restaurantId}/plans`);
  };

  const onGoAdmin = async (restaurantId, restaurantName) => {
    const st = statusMap[restaurantId];

    if (st?.is_operational !== true) {
      nav(`/owner/restaurants/${restaurantId}/plans`, {
        state: {
          notice: "Este restaurante necesita un plan vigente para poder administrarse.",
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
        setErr(e?.response?.data?.message || "No se pudo eliminar el restaurante.");
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

      {/* Header */}
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

            <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
              <Stack direction="row" alignItems="center" spacing={1.2}>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.35)", color: "#fff" }}>
                  {ownerName?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>
                <Typography sx={{ fontWeight: 700 }}>
                  Bienvenido, {user?.name || "Propietario"}!
                </Typography>
              </Stack>

              <Button
                variant="contained"
                onClick={onLogout}
                startIcon={<LogoutIcon />}
                sx={{
                  bgcolor: "#fff",
                  color: "primary.main",
                  fontWeight: 800,
                  px: 2.5,
                  "&:hover": {
                    bgcolor: "#f7f7f7",
                  },
                }}
              >
                Cerrar sesión
              </Button>
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
                borderRadius: 4,
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

                <Typography sx={{ fontSize: 28, fontWeight: 800, color: "text.primary" }}>
                  Aún no tienes restaurantes registrados
                </Typography>

                <Typography sx={{ maxWidth: 560, color: "text.secondary" }}>
                  Registra tu primer restaurante para comenzar con la configuración y operación.
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
                const isOperational = st?.is_operational === true;

                return (
                  <Card
                    key={r.id}
                    sx={{
                      borderRadius: 4,
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

                      <Box sx={{ flex: 1 }} />

                      <Stack spacing={1.5} sx={{ maxWidth: 260, mx: "auto", width: "100%" }}>
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
                          {isOperational ? "Cambiar plan" : "Ver planes / Contratar"}
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

                      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
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
    </Box>
  );
}