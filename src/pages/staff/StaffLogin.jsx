import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import {
  Alert,
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AuthBrandPanel from "../../components/auth/AuthBrandPanel";
import { useStaffAuth } from "../../context/StaffAuthContext";
import { handleFormApiError } from "../../utils/useFormApiHandler";

function routeByRole(roleName) {
  if (roleName === "waiter") return "/staff/app";
  if (roleName === "cashier") return "/staff/cashier";
  if (roleName === "kitchen") return "/staff/kitchen";
  return "/staff/select-context";
}

export default function StaffLogin() {
  const { login } = useStaffAuth();
  const nav = useNavigate();
  const location = useLocation();

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const from = useMemo(() => {
    const fromState = location.state?.from;
    if (typeof fromState === "string" && fromState.startsWith("/staff")) return fromState;
    return "/staff/app";
  }, [location.state]);

  const form = useForm({
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;

  const onSubmit = async (values) => {
    setErr("");
    setBusy(true);

    try {
      const res = await login(values.email, values.password);

      if (res?.requires_context_selection) {
        nav("/staff/select-context", { replace: true, state: { from } });
        return;
      }

      const roleName = res?.active_context?.role?.name;
      if (roleName) {
        nav(routeByRole(roleName), { replace: true });
        return;
      }

      nav(from, { replace: true });
    } catch (e) {
      const handled = handleFormApiError(e, setError, {
        onMessage: (m) => setErr(m),
      });

      if (!handled) {
        const msg = e?.response?.data?.message || "No se pudo iniciar sesión staff.";
        setErr(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FFFFFF",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          minHeight: "100vh",
        }}
      >
        <AuthBrandPanel
          side="left"
          logoSrc="/images/clicmenu-blanco.png"
          title="Acceso para staff"
          subtitle="Ingresa para operar mesas, cocina, caja o seleccionar tu contexto de trabajo."
        />

        <Box
          sx={{
            order: { xs: 2, md: 2 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: { xs: 3, sm: 4, md: 6 },
            py: { xs: 5, md: 6 },
            bgcolor: "#FFFFFF",
          }}
        >
          <Container maxWidth="sm">
            <Stack
              spacing={2.5}
              sx={{
                width: "100%",
                maxWidth: 480,
                mx: "auto",
              }}
            >
              <Typography
                sx={{
                  color: "text.primary",
                  fontWeight: 800,
                  textAlign: "center",
                  fontSize: { xs: "2rem", md: "2.2rem" },
                  mb: 1,
                }}
              >
                Acceso Staff
              </Typography>

              {err && (
                <Alert severity="error" sx={{ width: "100%", borderRadius: 2 }}>
                  {err}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2}>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "text.primary",
                        mb: 0.5,
                        lineHeight: 1.2,
                      }}
                    >
                      Correo electrónico
                    </Typography>

                    <TextField
                      type="email"
                      autoComplete="username"
                      fullWidth
                      placeholder="correo@ejemplo.com"
                      {...register("email", { required: "El correo es obligatorio." })}
                      error={!!errors.email}
                      helperText={errors.email?.message || " "}
                      slotProps={{
                        formHelperText: {
                          sx: { ml: 0, mt: 0.5 },
                        },
                      }}
                      sx={fieldSx}
                    />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "text.primary",
                        mb: 0.5,
                        lineHeight: 1.2,
                      }}
                    >
                      Contraseña
                    </Typography>

                    <TextField
                      type="password"
                      autoComplete="current-password"
                      fullWidth
                      placeholder="Tu contraseña"
                      {...register("password", {
                        required: "La contraseña es obligatoria.",
                      })}
                      error={!!errors.password}
                      helperText={errors.password?.message || " "}
                      slotProps={{
                        formHelperText: {
                          sx: { ml: 0, mt: 0.5 },
                        },
                      }}
                      sx={fieldSx}
                    />
                  </Box>

                  <Button
                    disabled={busy}
                    variant="contained"
                    type="submit"
                    fullWidth
                    sx={{
                      mt: 0.5,
                      height: 44,
                      borderRadius: 2,
                      fontSize: 14,
                      fontWeight: 700,
                      boxShadow: "none",
                      textTransform: "none",
                    }}
                  >
                    {busy ? "Entrando..." : "Entrar"}
                  </Button>

                  <Box sx={{ textAlign: "center", pt: 0.5 }}>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: 14,
                        color: "text.secondary",
                      }}
                    >
                      ¿Eres propietario?{" "}
                    </Typography>

                    <Button
                      type="button"
                      onClick={() => nav("/auth/login")}
                      variant="text"
                      disabled={busy}
                      sx={{
                        p: 0,
                        minWidth: "auto",
                        minHeight: "auto",
                        color: "primary.main",
                        fontSize: 14,
                        fontWeight: 800,
                        verticalAlign: "baseline",
                        "&:hover": {
                          backgroundColor: "transparent",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Ir a login propietario
                    </Button>
                  </Box>
                </Stack>
              </form>
            </Stack>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#F4F4F4",
    borderRadius: 0,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "& .MuiInputBase-input": {
    py: 1.25,
    px: 1.4,
    fontSize: 14,
  },
  "& .MuiFormHelperText-root": {
    fontSize: 11,
  },
};