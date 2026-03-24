import React, { useState } from "react";
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

import { useAuth } from "../../context/AuthContext";
import { handleFormApiError } from "../../utils/useFormApiHandler";
import ForgotPasswordModal from "../../components/auth/ForgotPasswordModal";
import TermsModal from "../../components/auth/TermsModal";
import AuthBrandPanel from "../../components/auth/AuthBrandPanel";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const fromState = location.state?.from;
  const fromSession = sessionStorage.getItem("auth_from");
  const from = fromState || fromSession;

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const [termsOpen, setTermsOpen] = useState(false);
  const [pendingCreds, setPendingCreds] = useState(null);

  // Guarda quién debe aceptar términos (viene del 403)
  const [pendingTermsUser, setPendingTermsUser] = useState(null);

  // Banner rojo específico para términos
  const [termsRequiredMsg, setTermsRequiredMsg] = useState("");

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

  const isSafeRedirect = (path) => {
    if (!path || typeof path !== "string") return false;
    if (path.startsWith("/auth")) return false;
    if (!path.startsWith("/")) return false;
    return true;
  };

  const onSubmit = async (values) => {
    setErr("");
    setTermsRequiredMsg("");
    setBusy(true);

    try {
      const res = await login(values.email, values.password);

      const roleName = res?.user?.role?.name?.toLowerCase();
      const roleId = String(res?.user?.role_id);

      const isOwner = roleName === "propietario" || roleId === "2";
      const fallback = isOwner ? "/owner/restaurants-home" : "/app";

      const target = !res?.userChanged && isSafeRedirect(from) ? from : fallback;

      sessionStorage.removeItem("auth_from");
      nav(target, { replace: true });
    } catch (e) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      const apiMsg = data?.message || "No se pudo iniciar sesión.";

      // Si faltan términos: banner rojo + abre modal + guarda creds + guarda user_id/email
      if (status === 403 && data?.code === "TERMS_REQUIRED") {
        setPendingCreds(values);
        setPendingTermsUser({
          user_id: data?.user_id ?? null,
          email: data?.email ?? values?.email ?? null,
        });

        setTermsRequiredMsg(
          "No has aceptado los Términos y Condiciones. Es obligatorio aceptarlos para poder iniciar sesión."
        );

        setTermsOpen(true);
        setErr("");
        return;
      }

      const handled = handleFormApiError(e, setError, {
        onMessage: (m) => setErr(m),
      });

      if (!handled) setErr(apiMsg);
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
        {/* Panel naranja izquierda */}
        <AuthBrandPanel
          side="left"
          logoSrc="/images/clicmenu-blanco.png"
          title="Bienvenido de nuevo"
          subtitle="Accede a tu cuenta y administra tus restaurantes y sucursales."
        />

        {/* Formulario derecha */}
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
                  fontSize: { xs: "2rem", md: "2.3rem" },
                  mb: 1,
                }}
              >
                Iniciar sesión
              </Typography>

              {termsRequiredMsg && (
                <Alert
                  severity="error"
                  sx={{
                    width: "100%",
                    borderRadius: 3,
                    alignItems: "flex-start",
                  }}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => setTermsOpen(true)}
                      disabled={busy}
                      sx={{
                        fontWeight: 800,
                        minWidth: "auto",
                        minHeight: "auto",
                        px: 0.5,
                      }}
                    >
                      Ver términos
                    </Button>
                  }
                >
                  <Box>
                    <Typography sx={{ fontWeight: 900, mb: 0.5 }}>
                      Falta aceptar términos
                    </Typography>
                    <Typography variant="body2">{termsRequiredMsg}</Typography>
                  </Box>
                </Alert>
              )}

              {err && (
                <Alert severity="error" sx={{ width: "100%", borderRadius: 3 }}>
                  {err}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2}>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "text.primary",
                        mb: 1,
                      }}
                    >
                      Correo electrónico
                    </Typography>

                    <TextField
                      type="email"
                      autoComplete="username"
                      fullWidth
                      placeholder="correo@ejemplo.com"
                      {...register("email", {
                        required: "El correo es obligatorio.",
                      })}
                      error={!!errors.email}
                      helperText={errors.email?.message || " "}
                      slotProps={{
                        formHelperText: {
                          sx: { ml: 0, mt: 0.75 },
                        },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#ECEAEC",
                          borderRadius: 0,
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "& .MuiInputBase-input": {
                          py: 1.6,
                          px: 1.6,
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                        gap: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "text.primary",
                        }}
                      >
                        Contraseña
                      </Typography>

                      <Button
                        type="button"
                        onClick={() => setForgotOpen(true)}
                        variant="text"
                        sx={{
                          p: 0,
                          minWidth: "auto",
                          minHeight: "auto",
                          color: "primary.main",
                          fontSize: 14,
                          fontWeight: 700,
                          lineHeight: 1.2,
                          "&:hover": {
                            backgroundColor: "transparent",
                            textDecoration: "underline",
                          },
                        }}
                      >
                        ¿Olvidaste tu contraseña?
                      </Button>
                    </Box>

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
                          sx: { ml: 0, mt: 0.75 },
                        },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#ECEAEC",
                          borderRadius: 0,
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "& .MuiInputBase-input": {
                          py: 1.6,
                          px: 1.6,
                        },
                      }}
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
                      fontSize: 15,
                      fontWeight: 700,
                      boxShadow: "none",
                      textTransform: "none",
                    }}
                  >
                    {busy ? "Entrando..." : "Iniciar sesión"}
                  </Button>

                  <Box sx={{ textAlign: "center", pt: 1 }}>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: 15,
                        color: "text.secondary",
                      }}
                    >
                      ¿Aún no tienes cuenta?{" "}
                    </Typography>

                    <Button
                      type="button"
                      onClick={() => nav("/auth/register")}
                      variant="text"
                      sx={{
                        p: 0,
                        minWidth: "auto",
                        minHeight: "auto",
                        color: "primary.main",
                        fontSize: 15,
                        fontWeight: 800,
                        verticalAlign: "baseline",
                        "&:hover": {
                          backgroundColor: "transparent",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Crear cuenta
                    </Button>
                  </Box>
                </Stack>
              </form>
            </Stack>
          </Container>
        </Box>
      </Box>

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />

      <TermsModal
        mode="login"
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        pendingTermsUser={pendingTermsUser}
        onAccepted={async () => {
          setTermsRequiredMsg("");
          setTermsOpen(false);

          if (!pendingCreds) return;
          await onSubmit(pendingCreds);
        }}
      />
    </Box>
  );
}