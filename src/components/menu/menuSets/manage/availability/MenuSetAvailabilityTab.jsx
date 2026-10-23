import { useEffect, useMemo, useRef, useState } from "react";

import {
  Box, Button, CircularProgress, InputAdornment,
  Paper, Stack, TextField, Typography,
} from "@mui/material";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import NumbersOutlinedIcon from "@mui/icons-material/NumbersOutlined";

import MenuSetAvailabilityResults from "./MenuSetAvailabilityResults";

import {
  getMenuSetAvailabilityPreview,
} from "../../../../../services/menu/menuSets/menuSetAvailability.service";

const panelSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "none",
};

function getCurrentDate(timezone) {
  const resolveDate = (zone) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const values = Object.fromEntries(
      parts.map((part) => [part.type, part.value])
    );

    return `${values.year}-${values.month}-${values.day}`;
  };

  try {
    return resolveDate(timezone || "America/Mexico_City");
  } catch {
    return resolveDate("America/Mexico_City");
  }
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;

  const errors = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat()
    : [];

  return errors.find((message) => typeof message === "string")
    || data?.message || error?.message || fallback;
}

function FieldBlock({ label, help, children }) {
  return (
    <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
      <Typography sx={{
        mb: 1,
        fontSize: 14,
        fontWeight: 800,
        color: "text.primary",
      }}>
        {label}
      </Typography>

      {children}

      {help ? (
        <Typography sx={{
          mt: 0.75,
          fontSize: 12,
          color: "text.secondary",
          lineHeight: 1.5,
        }}>
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}

export default function MenuSetAvailabilityTab({
  restaurantId,
  branchId,
  menuSet,
  onAlert,
}) {
  const timezone = menuSet?.branch?.timezone || "America/Mexico_City";

  const [serviceDate, setServiceDate] = useState(() => getCurrentDate(timezone));
  const [quantity, setQuantity] = useState("1");

  const [errors, setErrors] = useState({});
  const [consulting, setConsulting] = useState(false);
  const [result, setResult] = useState(null);

  const requestRef = useRef(null);
  const consultingRef = useRef(false);

  useEffect(() => {
    return () => {
      requestRef.current?.abort();
    };
  }, []);

  const queryChanged = useMemo(() => {
    if (!result) return false;

    return result.service_date !== serviceDate
      || Number(result.quantity) !== Number(quantity);
  }, [result, serviceDate, quantity]);

  const handleDateChange = (value) => {
    setServiceDate(value);

    setErrors((current) => {
      const next = { ...current };
      delete next.service_date;
      return next;
    });
  };

  const handleQuantityChange = (value) => {
    if (!/^\d*$/.test(value)) return;

    setQuantity(value);

    setErrors((current) => {
      const next = { ...current };
      delete next.quantity;
      return next;
    });
  };

  const validate = () => {
    const validationErrors = {};
    const requestedQuantity = Number(quantity);

    if (!serviceDate || !isValidDate(serviceDate)) {
      validationErrors.service_date = "Selecciona una fecha de servicio válida.";
    }

    if (
      !/^\d+$/.test(quantity) ||
      !Number.isSafeInteger(requestedQuantity) ||
      requestedQuantity < 1
    ) {
      validationErrors.quantity = "La cantidad debe ser un número entero mayor que cero.";
    }

    return validationErrors;
  };

  const handleConsult = async (event) => {
    event.preventDefault();

    if (consultingRef.current || !restaurantId || !branchId || !menuSet?.id) {
      return;
    }

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const controller = new AbortController();

    requestRef.current = controller;
    consultingRef.current = true;
    setConsulting(true);

    try {
      const response = await getMenuSetAvailabilityPreview(
        restaurantId,
        branchId,
        menuSet.id,
        serviceDate,
        Number(quantity),
        controller.signal
      );

      if (controller.signal.aborted) return;

      if (Number(response.menu_set_id) !== Number(menuSet.id)) {
        throw new Error("La consulta no corresponde al Conjunto seleccionado.");
      }

      // Sustituir únicamente los resultados, sin recargar la página.
      setResult(response);
    } catch (error) {
      if (controller.signal.aborted) return;

      onAlert?.({
        severity: "error",
        title: "Error",
        message: getErrorMessage(
          error,
          "No se pudo consultar la disponibilidad de los productos."
        ),
      });
    } finally {
      consultingRef.current = false;

      if (requestRef.current === controller) {
        requestRef.current = null;
      }

      if (!controller.signal.aborted) {
        setConsulting(false);
      }
    }
  };

  return (
    <Stack spacing={3}>

      {/* Formulario de consulta */}
      <Paper component="form" onSubmit={handleConsult} sx={panelSx}>
        <Stack spacing={3}>
          <Box>
            <Typography sx={{
              fontSize: 20,
              fontWeight: 800,
              color: "text.primary",
            }}>
              Consultar disponibilidad
            </Typography>

            <Typography sx={{
              mt: 0.5,
              fontSize: 13,
              color: "text.secondary",
              lineHeight: 1.55,
            }}>
              Selecciona una fecha e indica cuántas unidades deseas consultar.
              Se comprobará la disponibilidad individual de los productos del Conjunto.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            {/* Fecha */}
            <FieldBlock
              label="Fecha de servicio *"
              help="Selecciona el día para el que deseas consultar los productos."
            >
              <TextField
                fullWidth
                type="date"
                value={serviceDate}
                onChange={(event) => handleDateChange(event.target.value)}
                disabled={consulting}
                error={Boolean(errors.service_date)}
                helperText={errors.service_date || ""}
                inputProps={{ "aria-label": "Fecha de servicio" }}
                sx={{
                  "& input": {
                    minHeight: 23,
                  },
                }}
              />
            </FieldBlock>

            {/* Cantidad */}
            <FieldBlock
              label="Cantidad solicitada *"
              help="Número de unidades que deseas comprobar para cada producto."
            >
              <TextField
                fullWidth
                type="text"
                value={quantity}
                onChange={(event) => handleQuantityChange(event.target.value)}
                disabled={consulting}
                placeholder="Ej. 1"
                error={Boolean(errors.quantity)}
                helperText={errors.quantity || ""}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NumbersOutlinedIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </FieldBlock>
          </Stack>

          {/* Acciones */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="flex-end"
            spacing={1.5}
          >
            <Button
              type="submit"
              variant="contained"
              startIcon={consulting
                ? <CircularProgress size={18} color="inherit" />
                : <SearchOutlinedIcon />}
              disabled={consulting}
              sx={{
                minWidth: { xs: "100%", sm: 230 },
                height: 44,
                fontWeight: 800,
              }}
            >
              {consulting ? "Consultando…" : "Consultar disponibilidad"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Resultados */}
      {result ? (
        <MenuSetAvailabilityResults
          key={`${result.menu_set_id}-${result.service_date}-${result.quantity}-${JSON.stringify(result.options)}`}
          result={result}
          queryChanged={queryChanged}
        />
      ) : (
        <Paper sx={{
          ...panelSx,
          py: { xs: 5, sm: 6 },
          textAlign: "center",
        }}>
          <Box sx={{
            width: 64,
            height: 64,
            mx: "auto",
            mb: 2,
            borderRadius: 1,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(255, 152, 0, 0.12)",
            color: "primary.main",
          }}>
            <CalendarMonthOutlinedIcon sx={{ fontSize: 32 }} />
          </Box>

          <Typography sx={{
            fontSize: 19,
            fontWeight: 800,
            color: "text.primary",
          }}>
            Consulta pendiente
          </Typography>

          <Typography sx={{
            mt: 1,
            fontSize: 14,
            color: "text.secondary",
            lineHeight: 1.55,
            maxWidth: 460,
            mx: "auto",
          }}>
            Selecciona la fecha y cantidad que deseas consultar para conocer
            la disponibilidad de los productos de este Conjunto.
          </Typography>
        </Paper>
      )}
    </Stack>
  );
}