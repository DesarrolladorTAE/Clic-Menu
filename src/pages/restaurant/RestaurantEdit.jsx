import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import StorefrontIcon from "@mui/icons-material/Storefront";

import {
  getRestaurant,
  updateRestaurant,
} from "../../services/restaurant/restaurant.service";

const restaurantFieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#ECEAEC",
  },
};

export default function RestaurantEdit() {
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [serverMsg, setServerMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [restaurant, setRestaurant] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      trade_name: "",
      description: "",
      contact_phone: "",
      contact_email: "",
    },
    mode: "onSubmit",
  });

  const title = useMemo(() => "Editar información del restaurante", []);

  const load = async () => {
    setLoading(true);
    setServerMsg("");
    setSuccessMsg("");

    try {
        const res = await getRestaurant(restaurantId);
        const found = res?.data ?? res;

        if (!found) {
        setServerMsg("No se encontró el restaurante.");
        setRestaurant(null);
        return;
        }

        setRestaurant(found);

        reset({
        trade_name: found.trade_name ?? "",
        description: found.description ?? "",
        contact_phone: found.contact_phone ?? "",
        contact_email: found.contact_email ?? "",
        });
    } catch (e) {
        setServerMsg(e?.response?.data?.message || "No se pudo cargar el restaurante.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [restaurantId]);

  const mapBackendErrors = (e) => {
    const data = e?.response?.data;
    const bag = data?.errors;

    if (bag && typeof bag === "object") {
      Object.entries(bag).forEach(([field, arr]) => {
        const first = Array.isArray(arr) ? arr[0] : String(arr);
        setError(field, { type: "server", message: first });
      });
      setServerMsg("");
      return;
    }

    setServerMsg(data?.message || "No se pudo guardar. Intenta de nuevo.");
  };

  const onSubmit = async (values) => {
    setServerMsg("");
    setSuccessMsg("");
    setBusy(true);

    try {
      await updateRestaurant(restaurantId, values);
      setSuccessMsg("La información del restaurante se guardó correctamente.");
      await load();
    } catch (e) {
      if (e?.response?.status === 422) {
        mapBackendErrors(e);
      } else {
        setServerMsg(e?.response?.data?.message || "No se pudo guardar.");
      }
    } finally {
      setBusy(false);
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
            Cargando información del restaurante...
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
      <Box sx={{ maxWidth: 980, mx: "auto" }}>
        <Stack spacing={3}>
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
              Actualiza los datos generales de tu restaurante.
            </Typography>
          </Box>

          {serverMsg && (
            <Alert
              severity="error"
              sx={{
                borderRadius: 2,
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                  Error
                </Typography>
                <Typography variant="body2">{serverMsg}</Typography>
              </Box>
            </Alert>
          )}

          {successMsg && (
            <Alert
              severity="success"
              sx={{
                borderRadius: 2,
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                  Listo
                </Typography>
                <Typography variant="body2">{successMsg}</Typography>
              </Box>
            </Alert>
          )}

          <Card
            sx={{
              borderRadius: 0,
              backgroundColor: "background.paper",
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5, md: 4 } }}>
              <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <StorefrontIcon sx={{ color: "primary.main" }} />
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: 18, sm: 20 },
                        color: "text.primary",
                      }}
                    >
                      Datos generales
                    </Typography>
                  </Stack>

                  <FieldBlock
                    label="Nombre comercial"
                    input={
                      <TextField
                        {...register("trade_name")}
                        placeholder="Ej. Restaurante Ensigna"
                        error={!!errors.trade_name}
                        helperText={errors.trade_name?.message || " "}
                        sx={restaurantFieldSx}
                      />
                    }
                  />

                  <FieldBlock
                    label="Descripción"
                    input={
                      <TextField
                        {...register("description")}
                        placeholder="Describe brevemente tu restaurante"
                        error={!!errors.description}
                        helperText={errors.description?.message || " "}
                        multiline
                        minRows={3}
                        sx={restaurantFieldSx}
                      />
                    }
                  />

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Teléfono"
                      input={
                        <TextField
                          {...register("contact_phone")}
                          placeholder="Ej. 5512345678"
                          inputMode="tel"
                          error={!!errors.contact_phone}
                          helperText={errors.contact_phone?.message || " "}
                          sx={restaurantFieldSx}
                        />
                      }
                    />

                    <FieldBlock
                      label="Correo electrónico"
                      input={
                        <TextField
                          {...register("contact_email")}
                          type="email"
                          placeholder="correo@ejemplo.com"
                          inputMode="email"
                          error={!!errors.contact_email}
                          helperText={errors.contact_email?.message || " "}
                          sx={restaurantFieldSx}
                        />
                      }
                    />
                  </Stack>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="flex-end"
                    spacing={1.5}
                    pt={1}
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={busy || !isDirty}
                      startIcon={<SaveIcon />}
                      sx={{
                        minWidth: { xs: "100%", sm: 210 },
                        height: 44,
                        borderRadius: 2,
                        fontWeight: 800,
                      }}
                    >
                      {busy ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}

function FieldBlock({ label, input }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 800,
          color: "text.primary",
          mb: 1,
        }}
      >
        {label}
      </Typography>
      {input}
    </Box>
  );
}