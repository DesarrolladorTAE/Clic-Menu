import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import LocalCafeRoundedIcon from "@mui/icons-material/LocalCafeRounded";
import LocalPizzaRoundedIcon from "@mui/icons-material/LocalPizzaRounded";
import LunchDiningRoundedIcon from "@mui/icons-material/LunchDiningRounded";
import IcecreamRoundedIcon from "@mui/icons-material/IcecreamRounded";
import BakeryDiningRoundedIcon from "@mui/icons-material/BakeryDiningRounded";
import RoomServiceRoundedIcon from "@mui/icons-material/RoomServiceRounded";

import { handleFormApiError } from "../../utils/useFormApiHandler";
import { useStaffAuth } from "../../context/StaffAuthContext";
import PageContainer from "../../components/common/PageContainer";

function roleLabel(name) {
  if (name === "waiter") return "Mesero";
  if (name === "cashier") return "Cajero";
  if (name === "kitchen") return "Cocina";
  return name || "—";
}

function routeByRole(roleName) {
  if (roleName === "waiter") return "/staff/waiter/tables/grid";
  if (roleName === "cashier") return "/staff/cashier";
  if (roleName === "kitchen") return "/staff/kitchen";
  return "/staff/select-context";
}

/*
 * Decoración visual del fondo.
 *
 * Los íconos son SVG de Material UI para mantener una apariencia
 * consistente en Windows, Android, iPhone y navegadores modernos.
 *
 * No intervienen con botones, formularios ni eventos táctiles.
 */
const backgroundIcons = [
  {
    Icon: RestaurantRoundedIcon,
    top: "7%",
    left: "5%",
    size: { xs: 18, sm: 22, md: 25 },
    color: "primary.main",
    opacity: 0.13,
    animation: "contextFloatA",
    duration: "7s",
    delay: "-2s",
  },
  {
    Icon: LocalCafeRoundedIcon,
    top: "13%",
    left: "15%",
    size: { xs: 17, sm: 20, md: 23 },
    color: "secondary.main",
    opacity: 0.11,
    animation: "contextFloatB",
    duration: "9s",
    delay: "-5s",
  },
  {
    Icon: LocalPizzaRoundedIcon,
    top: "8%",
    left: "27%",
    size: { xs: 18, sm: 21, md: 24 },
    color: "primary.main",
    opacity: 0.1,
    animation: "contextFloatA",
    duration: "10s",
    delay: "-4s",
  },
  {
    Icon: BakeryDiningRoundedIcon,
    top: "17%",
    left: "38%",
    size: { xs: 16, sm: 19, md: 22 },
    color: "secondary.main",
    opacity: 0.1,
    animation: "contextFloatA",
    duration: "8s",
    delay: "-6s",
  },
  {
    Icon: RoomServiceRoundedIcon,
    top: "8%",
    left: "61%",
    size: { xs: 19, sm: 22, md: 25 },
    color: "primary.main",
    opacity: 0.12,
    animation: "contextFloatB",
    duration: "8.5s",
    delay: "-3s",
  },
  {
    Icon: LocalPizzaRoundedIcon,
    top: "12%",
    left: "74%",
    size: { xs: 17, sm: 21, md: 24 },
    color: "secondary.main",
    opacity: 0.13,
    animation: "contextFloatB",
    duration: "11s",
    delay: "-7s",
  },
  {
    Icon: RestaurantRoundedIcon,
    top: "7%",
    left: "87%",
    size: { xs: 17, sm: 20, md: 23 },
    color: "primary.main",
    opacity: 0.1,
    animation: "contextFloatA",
    duration: "9s",
    delay: "-1s",
  },
  {
    Icon: IcecreamRoundedIcon,
    top: "23%",
    left: "4%",
    size: { xs: 17, sm: 21, md: 24 },
    color: "secondary.main",
    opacity: 0.12,
    animation: "contextFloatB",
    duration: "7.5s",
    delay: "-4s",
  },
  {
    Icon: LunchDiningRoundedIcon,
    top: "29%",
    left: "13%",
    size: { xs: 18, sm: 22, md: 25 },
    color: "primary.main",
    opacity: 0.11,
    animation: "contextFloatA",
    duration: "8.5s",
    delay: "-6s",
  },
  {
    Icon: LocalCafeRoundedIcon,
    top: "27%",
    left: "26%",
    size: { xs: 16, sm: 19, md: 22 },
    color: "secondary.main",
    opacity: 0.09,
    animation: "contextFloatB",
    duration: "10s",
    delay: "-2s",
  },
  {
    Icon: BakeryDiningRoundedIcon,
    top: "25%",
    left: "78%",
    size: { xs: 17, sm: 20, md: 23 },
    color: "primary.main",
    opacity: 0.1,
    animation: "contextFloatB",
    duration: "9.5s",
    delay: "-5s",
  },
  {
    Icon: RoomServiceRoundedIcon,
    top: "31%",
    left: "91%",
    size: { xs: 18, sm: 22, md: 25 },
    color: "secondary.main",
    opacity: 0.12,
    animation: "contextFloatA",
    duration: "8s",
    delay: "-3s",
  },
  {
    Icon: RestaurantRoundedIcon,
    top: "43%",
    left: "5%",
    size: { xs: 17, sm: 20, md: 23 },
    color: "primary.main",
    opacity: 0.11,
    animation: "contextFloatA",
    duration: "11s",
    delay: "-6s",
  },
  {
    Icon: LocalPizzaRoundedIcon,
    top: "48%",
    left: "16%",
    size: { xs: 16, sm: 20, md: 23 },
    color: "secondary.main",
    opacity: 0.1,
    animation: "contextFloatB",
    duration: "7.5s",
    delay: "-1s",
  },
  {
    Icon: IcecreamRoundedIcon,
    top: "45%",
    left: "26%",
    size: { xs: 17, sm: 20, md: 22 },
    color: "primary.main",
    opacity: 0.08,
    animation: "contextFloatA",
    duration: "9s",
    delay: "-7s",
  },
  {
    Icon: LunchDiningRoundedIcon,
    top: "46%",
    left: "76%",
    size: { xs: 18, sm: 21, md: 24 },
    color: "secondary.main",
    opacity: 0.09,
    animation: "contextFloatB",
    duration: "10s",
    delay: "-4s",
  },
  {
    Icon: LocalCafeRoundedIcon,
    top: "42%",
    left: "87%",
    size: { xs: 16, sm: 19, md: 22 },
    color: "primary.main",
    opacity: 0.11,
    animation: "contextFloatA",
    duration: "8s",
    delay: "-2s",
  },
  {
    Icon: LocalPizzaRoundedIcon,
    top: "52%",
    left: "95%",
    size: { xs: 16, sm: 20, md: 23 },
    color: "secondary.main",
    opacity: 0.12,
    animation: "contextFloatB",
    duration: "9s",
    delay: "-5s",
  },
  {
    Icon: BakeryDiningRoundedIcon,
    top: "64%",
    left: "5%",
    size: { xs: 18, sm: 21, md: 24 },
    color: "primary.main",
    opacity: 0.12,
    animation: "contextFloatA",
    duration: "7.5s",
    delay: "-6s",
  },
  {
    Icon: LocalCafeRoundedIcon,
    top: "70%",
    left: "16%",
    size: { xs: 16, sm: 19, md: 22 },
    color: "secondary.main",
    opacity: 0.1,
    animation: "contextFloatB",
    duration: "11s",
    delay: "-2s",
  },
  {
    Icon: RestaurantRoundedIcon,
    top: "61%",
    left: "27%",
    size: { xs: 17, sm: 20, md: 23 },
    color: "primary.main",
    opacity: 0.09,
    animation: "contextFloatB",
    duration: "8.5s",
    delay: "-4s",
  },
  {
    Icon: RoomServiceRoundedIcon,
    top: "67%",
    left: "73%",
    size: { xs: 18, sm: 22, md: 25 },
    color: "secondary.main",
    opacity: 0.11,
    animation: "contextFloatA",
    duration: "9s",
    delay: "-7s",
  },
  {
    Icon: IcecreamRoundedIcon,
    top: "62%",
    left: "84%",
    size: { xs: 16, sm: 20, md: 23 },
    color: "primary.main",
    opacity: 0.1,
    animation: "contextFloatA",
    duration: "10s",
    delay: "-3s",
  },
  {
    Icon: LunchDiningRoundedIcon,
    top: "72%",
    left: "94%",
    size: { xs: 17, sm: 21, md: 24 },
    color: "secondary.main",
    opacity: 0.12,
    animation: "contextFloatB",
    duration: "8s",
    delay: "-5s",
  },
  {
    Icon: LocalPizzaRoundedIcon,
    top: "85%",
    left: "7%",
    size: { xs: 17, sm: 21, md: 24 },
    color: "secondary.main",
    opacity: 0.12,
    animation: "contextFloatA",
    duration: "11s",
    delay: "-4s",
  },
  {
    Icon: LunchDiningRoundedIcon,
    top: "87%",
    left: "20%",
    size: { xs: 18, sm: 22, md: 25 },
    color: "primary.main",
    opacity: 0.1,
    animation: "contextFloatA",
    duration: "8s",
    delay: "-1s",
  },
  {
    Icon: LocalCafeRoundedIcon,
    top: "82%",
    left: "34%",
    size: { xs: 16, sm: 19, md: 22 },
    color: "secondary.main",
    opacity: 0.1,
    animation: "contextFloatB",
    duration: "9.5s",
    delay: "-6s",
  },
  {
    Icon: BakeryDiningRoundedIcon,
    top: "89%",
    left: "53%",
    size: { xs: 17, sm: 20, md: 23 },
    color: "primary.main",
    opacity: 0.09,
    animation: "contextFloatB",
    duration: "10s",
    delay: "-5s",
  },
  {
    Icon: RestaurantRoundedIcon,
    top: "83%",
    left: "67%",
    size: { xs: 17, sm: 21, md: 24 },
    color: "secondary.main",
    opacity: 0.11,
    animation: "contextFloatA",
    duration: "7.5s",
    delay: "-3s",
  },
  {
    Icon: IcecreamRoundedIcon,
    top: "88%",
    left: "80%",
    size: { xs: 16, sm: 20, md: 23 },
    color: "primary.main",
    opacity: 0.1,
    animation: "contextFloatB",
    duration: "9s",
    delay: "-2s",
  },
  {
    Icon: RoomServiceRoundedIcon,
    top: "83%",
    left: "92%",
    size: { xs: 18, sm: 21, md: 24 },
    color: "secondary.main",
    opacity: 0.12,
    animation: "contextFloatA",
    duration: "11s",
    delay: "-7s",
  },
];

function ContextBackground() {
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 0,

        "@keyframes contextFloatA": {
          "0%, 100%": {
            transform: "translate3d(0, 0, 0)",
          },
          "50%": {
            transform: "translate3d(5px, -10px, 0)",
          },
        },

        "@keyframes contextFloatB": {
          "0%, 100%": {
            transform: "translate3d(0, 0, 0)",
          },
          "50%": {
            transform: "translate3d(-6px, 8px, 0)",
          },
        },

        "@media (prefers-reduced-motion: reduce)": {
          "& *": {
            animation: "none !important",
          },
        },
      }}
    >
      {backgroundIcons.map(
        (
          {
            Icon,
            top,
            left,
            size,
            color,
            opacity,
            animation,
            duration,
            delay,
          },
          index
        ) => (
          <Box
            key={index}
            sx={{
              position: "absolute",
              top,
              left,
              color,
              opacity,
              lineHeight: 0,
              animation: `${animation} ${duration} ease-in-out ${delay} infinite`,
              willChange: "transform",
            }}
          >
            <Icon
              sx={{
                fontSize: size,
              }}
            />
          </Box>
        )
      )}
    </Box>
  );
}

export default function StaffSelectContext() {
  const nav = useNavigate();
  const location = useLocation();

  const { contexts, selectContext, logout, clearStaff, activeContext } = useStaffAuth();

  const [busy, setBusy] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [err, setErr] = useState("");

  const forceSelection = !!location.state?.forceSelection;

  const from = useMemo(() => {
    const fromState = location.state?.from;
    if (typeof fromState === "string" && fromState.startsWith("/staff")) return fromState;
    return "/staff/app";
  }, [location.state]);

  const form = useForm({
    defaultValues: { contextKey: "" },
    mode: "onSubmit",
  });

  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = form;

  const selectedKey = watch("contextKey");

  const options = useMemo(() => {
    return (contexts || []).map((c) => {
      const key = `${c.restaurant.id}:${c.branch.id}:${c.role.id}`;
      const label = `${c.restaurant.name} · ${c.branch.name} · ${roleLabel(c.role.name)}`;
      return { key, label, c };
    });
  }, [contexts]);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      if (!Array.isArray(contexts) || contexts.length === 0) {
        nav("/staff/login", { replace: true, state: { from } });
        return;
      }

      if (forceSelection && contexts.length <= 1) {
        setLoggingOut(true);
        setErr("");

        try {
          await logout();
        } catch {
          clearStaff();
        } finally {
          if (!cancelled) {
            nav("/staff/login", { replace: true });
            setLoggingOut(false);
          }
        }

        return;
      }

      if (!forceSelection && activeContext?.role?.name) {
        nav(routeByRole(activeContext.role.name), { replace: true });
        return;
      }

      if (!forceSelection && contexts.length === 1) {
        const only = contexts[0];

        setBusy(true);
        setErr("");

        try {
          const res = await selectContext({
            restaurant_id: only.restaurant.id,
            branch_id: only.branch.id,
            role_id: only.role.id,
          });

          const roleName = res?.active_context?.role?.name;
          nav(routeByRole(roleName), { replace: true });
        } catch (e) {
          setErr(e?.response?.data?.message || "No se pudo seleccionar el contexto.");
        } finally {
          if (!cancelled) {
            setBusy(false);
          }
        }
      }
    };

    boot();

    return () => {
      cancelled = true;
    };
  }, [
    activeContext?.role?.name,
    clearStaff,
    contexts,
    forceSelection,
    from,
    logout,
    nav,
    selectContext,
  ]);

  const onSubmit = async () => {
    setErr("");

    const opt = options.find((o) => o.key === selectedKey);

    if (!opt) {
      setErr("Selecciona un contexto.");
      return;
    }

    setBusy(true);
    setErr("");

    try {
      const res = await selectContext({
        restaurant_id: opt.c.restaurant.id,
        branch_id: opt.c.branch.id,
        role_id: opt.c.role.id,
      });

      const roleName = res?.active_context?.role?.name;
      nav(routeByRole(roleName), { replace: true });
    } catch (e) {
      const handled = handleFormApiError(e, setError, {
        onMessage: (m) => setErr(m),
      });

      if (!handled) {
        setErr(e?.response?.data?.message || "No se pudo seleccionar el contexto.");
      }
    } finally {
      setBusy(false);
    }
  };

  const onLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setErr("");

    try {
      await logout();
    } catch {
      clearStaff();
    } finally {
      nav("/staff/login", { replace: true });
      setLoggingOut(false);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        bgcolor: "background.default",

        "@supports (height: 100dvh)": {
          minHeight: "100dvh",
        },
      }}
    >
      <ContextBackground />

      <PageContainer
        maxWidth={560}
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 3, sm: 4 },
          position: "relative",
          zIndex: 1,

          "@supports (height: 100dvh)": {
            minHeight: "100dvh",
          },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            p: { xs: 2.5, sm: 4 },
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontSize: { xs: "1.55rem", sm: "1.75rem" },
                fontWeight: 700,
                mb: 0.75,
              }}
            >
              Selecciona contexto
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Restaurante · Sucursal · Rol
            </Typography>
          </Box>

          {err ? (
            <Alert
              severity="error"
              variant="filled"
              sx={{
                mb: 2.5,
                minWidth: 0,
              }}
            >
              {err}
            </Alert>
          ) : null}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <Controller
                name="contextKey"
                control={control}
                rules={{
                  required: "Selecciona un contexto.",
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Contexto"
                    disabled={busy || loggingOut}
                    error={Boolean(errors.contextKey)}
                    helperText={errors.contextKey?.message || " "}
                    SelectProps={{
                      displayEmpty: false,
                    }}
                  >
                    <MenuItem value="">
                      <Typography
                        component="span"
                        color="text.secondary"
                        sx={{ fontSize: "inherit" }}
                      >
                        Selecciona…
                      </Typography>
                    </MenuItem>

                    {options.map((o) => (
                      <MenuItem key={o.key} value={o.key}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={busy || loggingOut}
                sx={{
                  minHeight: 46,
                }}
              >
                {busy ? "Guardando..." : "Entrar"}
              </Button>

              <Button
                type="button"
                variant="contained"
                color="secondary"
                fullWidth
                disabled={busy || loggingOut}
                onClick={onLogout}
                sx={{
                  minHeight: 46,
                }}
              >
                {loggingOut ? "Cerrando sesión..." : "Cerrar sesión (Logout)"}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </PageContainer>
    </Box>
  );
}