import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import TermsModal from "../../components/auth/TermsModal";
import AuthBrandPanel from "../../components/auth/AuthBrandPanel";
import { normalizePhone } from "../../utils/phone";
import { handleFormApiError } from "../../utils/useFormApiHandler";
import {
  requestRegisterCode,
  verifyRegisterCode,
  resendRegisterCode,
} from "../../services/auth/auth.service";

export default function Register() {
  const nav = useNavigate();

  const [step, setStep] = useState(1); // 1 = datos, 2 = código
  const [globalMsg, setGlobalMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const [termsOpen, setTermsOpen] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const form = useForm({
    defaultValues: {
      name: "",
      last_name_paternal: "",
      last_name_maternal: "",
      phone: "",
      email: "",
      password: "",
      password_confirmation: "",
      terms_accepted: false,
      code: "",
    },
    mode: "onSubmit",
  });

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = form;

  const phone = watch("phone");
  const termsAccepted = watch("terms_accepted");

  const title = useMemo(() => {
    return step === 1 ? "Crea tu cuenta" : "Verifica tu teléfono";
  }, [step]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const goToCodeStep = (expiresInSeconds) => {
    setStep(2);
    setCooldown(Number(expiresInSeconds || 180));
  };

  const onRequestCode = async (values) => {
    setGlobalMsg("");
    setBusy(true);

    const normalized = normalizePhone(values.phone);
    if (normalized.length !== 10) {
      setError("phone", {
        type: "client",
        message: "El número debe tener exactamente 10 dígitos.",
      });
      setBusy(false);
      return;
    }

    if (!values.terms_accepted) {
      setError("terms_accepted", {
        type: "client",
        message: "Debes aceptar los términos y condiciones para registrarte.",
      });
      setBusy(false);
      return;
    }

    try {
      const payload = {
        name: values.name,
        last_name_paternal: values.last_name_paternal,
        last_name_maternal: values.last_name_maternal || null,
        phone: normalized,
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
        terms_accepted: true,
      };

      const res = await requestRegisterCode(payload);

      setGlobalMsg(res?.message || "Código enviado.");
      goToCodeStep(res?.expires_in_seconds);

      reset({ ...values, phone: normalized, code: "" });
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || "No se pudo enviar el código.";

      const handled = handleFormApiError(err, setError, {
        onMessage: (m) => setGlobalMsg(m),
      });

      if (!handled) setGlobalMsg(msg);

      if (status === 429) {
        const retry = Number(err?.response?.data?.retry_after_seconds || 0);
        if (retry > 0) setCooldown(retry);
      }
    } finally {
      setBusy(false);
    }
  };

  const onVerifyCode = async (values) => {
    setGlobalMsg("");
    setBusy(true);

    const normalized = normalizePhone(values.phone);
    if (normalized.length !== 10) {
      setError("phone", {
        type: "client",
        message: "El número debe tener exactamente 10 dígitos.",
      });
      setBusy(false);
      return;
    }

    const code = String(values.code || "").trim();
    if (!code) {
      setError("code", { type: "client", message: "El código es obligatorio." });
      setBusy(false);
      return;
    }

    try {
      const res = await verifyRegisterCode({ phone: normalized, code });

      setGlobalMsg(res?.message || "Registro completado.");
      setTimeout(() => nav("/auth/login", { replace: true }), 900);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || "No se pudo verificar el código.";

      if (status === 422) {
        const handled = handleFormApiError(err, setError, {
          onMessage: (m) => setGlobalMsg(m),
        });
        if (!handled) setGlobalMsg(msg);
      } else {
        setGlobalMsg(msg);

        if (status === 410) {
          setCooldown(0);
        }

        if (status === 429) {
          const retry = Number(err?.response?.data?.retry_after_seconds || 0);
          if (retry > 0) setCooldown(retry);
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const onResend = async () => {
    setGlobalMsg("");
    setBusy(true);

    const normalized = normalizePhone(phone);
    if (normalized.length !== 10) {
      setError("phone", {
        type: "client",
        message: "El número debe tener exactamente 10 dígitos.",
      });
      setBusy(false);
      return;
    }

    try {
      const res = await resendRegisterCode({ phone: normalized });
      setGlobalMsg(res?.message || "Código reenviado.");
      setCooldown(Number(res?.expires_in_seconds || 180));
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || "No se pudo reenviar el código.";

      setGlobalMsg(msg);

      if (status === 429) {
        const retry = Number(err?.response?.data?.retry_after_seconds || 0);
        if (retry > 0) setCooldown(retry);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleAcceptedTermsFromModal = () => {
    clearErrors("terms_accepted");
    setValue("terms_accepted", true, { shouldValidate: true, shouldDirty: true });
    setTermsOpen(false);
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
        {/* Formulario izquierda */}
        <Box
          sx={{
            order: { xs: 2, md: 1 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: { xs: 3, sm: 4, md: 6 },
            py: { xs: 5, md: 6 },
            bgcolor: "#FFFFFF",
          }}
        >
          <Container maxWidth="md">
            <Stack
              spacing={2.5}
              sx={{
                width: "100%",
                maxWidth: 720,
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
                {title}
              </Typography>

              {globalMsg && (
                <Alert
                  severity={step === 2 ? "info" : "success"}
                  sx={{ width: "100%", borderRadius: 2 }}
                >
                  {globalMsg}
                </Alert>
              )}

              {step === 1 && (
                <form onSubmit={handleSubmit(onRequestCode)}>
                  <Stack spacing={1.4}>
                    <Box>
                      <FieldTitle label="Nombre" />
                      <TextField
                        fullWidth
                        placeholder="Ej. Juan"
                        {...register("name", {
                          required: "El nombre es obligatorio.",
                        })}
                        error={!!errors.name}
                        helperText={errors.name?.message || " "}
                        slotProps={{
                          formHelperText: {
                            sx: { ml: 0, mt: 0.5 },
                          },
                        }}
                        sx={fieldSx}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 1.5,
                      }}
                    >
                      <Box>
                        <FieldTitle label="Apellido paterno" />
                        <TextField
                          fullWidth
                          placeholder="Ej. Pérez"
                          {...register("last_name_paternal", {
                            required: "El apellido paterno es obligatorio.",
                          })}
                          error={!!errors.last_name_paternal}
                          helperText={errors.last_name_paternal?.message || " "}
                          slotProps={{
                            formHelperText: {
                              sx: { ml: 0, mt: 0.5 },
                            },
                          }}
                          sx={fieldSx}
                        />
                      </Box>

                      <Box>
                        <FieldTitle label="Apellido materno" />
                        <TextField
                          fullWidth
                          placeholder="Ej. López"
                          {...register("last_name_maternal")}
                          error={!!errors.last_name_maternal}
                          helperText={errors.last_name_maternal?.message || " "}
                          slotProps={{
                            formHelperText: {
                              sx: { ml: 0, mt: 0.5 },
                            },
                          }}
                          sx={fieldSx}
                        />
                      </Box>
                    </Box>

                    <Box>
                      <FieldTitle label="Teléfono" />
                      <TextField
                        fullWidth
                        placeholder="Ej. 5512345678"
                        inputMode="numeric"
                        autoComplete="tel"
                        {...register("phone", {
                          required: "El número de teléfono es obligatorio.",
                        })}
                        error={!!errors.phone}
                        helperText={errors.phone?.message || " "}
                        slotProps={{
                          formHelperText: {
                            sx: { ml: 0, mt: 0.5 },
                          },
                        }}
                        sx={fieldSx}
                      />
                    </Box>

                    <Box>
                      <FieldTitle label="Correo electrónico" />
                      <TextField
                        fullWidth
                        type="email"
                        autoComplete="username"
                        placeholder="Ej. correo@ejemplo.com"
                        {...register("email", {
                          required: "El correo electrónico es obligatorio.",
                        })}
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

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 1.5,
                      }}
                    >
                      <Box>
                        <FieldTitle label="Contraseña" />
                        <TextField
                          fullWidth
                          type="password"
                          autoComplete="new-password"
                          placeholder="Mínimo 8 caracteres"
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

                      <Box>
                        <FieldTitle label="Confirmar contraseña" />
                        <TextField
                          fullWidth
                          type="password"
                          autoComplete="new-password"
                          placeholder="Repite tu contraseña"
                          {...register("password_confirmation", {
                            required: "La confirmación es obligatoria.",
                          })}
                          error={!!errors.password_confirmation}
                          helperText={errors.password_confirmation?.message || " "}
                          slotProps={{
                            formHelperText: {
                              sx: { ml: 0, mt: 0.5 },
                            },
                          }}
                          sx={fieldSx}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: "center", pt: 0.5 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={!!termsAccepted}
                            {...register("terms_accepted")}
                            sx={{
                              color: "primary.main",
                              "&.Mui-checked": {
                                color: "primary.main",
                              },
                            }}
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: 13, color: "text.primary" }}>
                            Acepto los{" "}
                            <Button
                              type="button"
                              onClick={() => setTermsOpen(true)}
                              variant="text"
                              sx={{
                                p: 0,
                                minWidth: "auto",
                                minHeight: "auto",
                                verticalAlign: "baseline",
                                color: "primary.main",
                                fontWeight: 700,
                                fontSize: 13,
                                "&:hover": {
                                  backgroundColor: "transparent",
                                  textDecoration: "underline",
                                },
                              }}
                            >
                              términos y condiciones
                            </Button>
                          </Typography>
                        }
                        sx={{
                          m: 0,
                          justifyContent: "center",
                          width: "100%",
                          "& .MuiFormControlLabel-label": {
                            textAlign: "center",
                          },
                        }}
                      />

                      {errors.terms_accepted?.message && (
                        <Typography
                          sx={{
                            mt: 0.5,
                            color: "error.main",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {errors.terms_accepted.message}
                        </Typography>
                      )}

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
                      {busy ? "Enviando..." : "Enviar código por WhatsApp"}
                    </Button>

                    <Box sx={{ textAlign: "center", pt: 0.5 }}>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: 14,
                          color: "text.secondary",
                        }}
                      >
                        ¿Ya tienes cuenta?{" "}
                      </Typography>

                      <Button
                        type="button"
                        onClick={() => nav("/auth/login")}
                        variant="text"
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
                        Iniciar sesión
                      </Button>
                    </Box>
                  </Stack>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit(onVerifyCode)}>
                  <Stack spacing={2}>
                    <Typography
                      sx={{
                        fontSize: 14,
                        color: "text.secondary",
                        textAlign: "center",
                        mb: 1,
                      }}
                    >
                      Te enviamos un código a WhatsApp. Si no te llegó, revisa que el número sea correcto.
                    </Typography>

                    <FieldTitle label="Teléfono" />
                    <TextField
                      fullWidth
                      {...register("phone")}
                      readOnly
                      helperText={errors.phone?.message || " "}
                      error={!!errors.phone}
                      slotProps={{
                        formHelperText: {
                          sx: { ml: 0, mt: 0.75 },
                        },
                      }}
                      sx={fieldSx}
                    />

                    <FieldTitle label="Código" />
                    <TextField
                      fullWidth
                      placeholder="123456"
                      inputMode="numeric"
                      {...register("code")}
                      error={!!errors.code}
                      helperText={errors.code?.message || " "}
                      slotProps={{
                        formHelperText: {
                          sx: { ml: 0, mt: 0.75 },
                        },
                      }}
                      sx={fieldSx}
                    />

                    <Button
                      disabled={busy}
                      variant="contained"
                      type="submit"
                      fullWidth
                      sx={{
                        mt: 1,
                        height: 46,
                        borderRadius: 2,
                        fontSize: 15,
                        fontWeight: 700,
                        boxShadow: "none",
                        textTransform: "none",
                      }}
                    >
                      {busy ? "Verificando..." : "Verificar y completar registro"}
                    </Button>

                    <Button
                      type="button"
                      disabled={busy || cooldown > 0}
                      onClick={onResend}
                      variant="outlined"
                      fullWidth
                      sx={{
                        height: 44,
                        borderRadius: 2,
                        opacity: busy || cooldown > 0 ? 0.6 : 1,
                        cursor: busy || cooldown > 0 ? "not-allowed" : "pointer",
                      }}
                    >
                      {cooldown > 0 ? `Reenviar disponible en ${cooldown}s` : "Reenviar código"}
                    </Button>

                    <Button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setGlobalMsg("");
                        reset({ ...getValues(), code: "" });
                      }}
                      variant="text"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 700,
                        "&:hover": {
                          backgroundColor: "transparent",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Volver y corregir datos
                    </Button>
                  </Stack>
                </form>
              )}
            </Stack>
          </Container>
        </Box>

        {/* Panel naranja derecha */}
        <AuthBrandPanel
          side="right"
          logoSrc="/images/clicmenu-blanco.png"
          title={step === 1 ? "Crea tu cuenta" : "Verifica tu registro"}
          subtitle={
            step === 1
              ? "Registra tu restaurante y comienza a gestionar tu operación con ClicMenu."
              : "Confirma tu código y completa tu registro en unos segundos."
          }
        />
      </Box>

      <TermsModal
        mode="register"
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        onAccepted={handleAcceptedTermsFromModal}
      />
    </Box>
  );
}

function FieldTitle({ label }) {
  return (
    <Typography
      sx={{
        fontSize: 13,
        fontWeight: 700,
        color: "text.primary",
        mb: 1,
        lineHeight: 1,
      }}
    >
      {label}
    </Typography>
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