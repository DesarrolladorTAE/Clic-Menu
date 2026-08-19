// Sección visual de formas de entrega para Pedidos en línea
import React, { useMemo } from "react";
import {
  Box, Card, CardContent, MenuItem, Stack, TextField, Typography,
} from "@mui/material";

import DeliveryDiningOutlinedIcon from "@mui/icons-material/DeliveryDiningOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

import { money } from "../../../../hooks/public/publicMenu.utils";

const DEFAULT_THEME_COLOR = "#FF7A00";

function safeThemeColor(value) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(value || ""))
    ? String(value)
    : DEFAULT_THEME_COLOR;
}

function hexToRgba(hex, alpha = 1) {
  const safe = safeThemeColor(hex).replace("#", "");
  const r = parseInt(safe.substring(0, 2), 16);
  const g = parseInt(safe.substring(2, 4), 16);
  const b = parseInt(safe.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function fulfillmentPresentation(type) {
  const options = {
    pickup: {
      label: "Recoger en sucursal",
      description: "Pasa por tu pedido directamente a la sucursal.",
      icon: StorefrontOutlinedIcon,
    },
    home_delivery: {
      label: "Entrega a domicilio",
      description: "Recibe tu pedido en una zona disponible.",
      icon: DeliveryDiningOutlinedIcon,
    },
    internal_location: {
      label: "Ubicación interna",
      description: "Recibe tu pedido dentro de la ubicación configurada.",
      icon: PlaceOutlinedIcon,
    },
    scheduled_point: {
      label: "Punto programado",
      description: "Recoge tu pedido en un punto y horario disponible.",
      icon: EventAvailableOutlinedIcon,
    },
  };

  return options[String(type || "")] || {
    label: "Forma de entrega",
    description: "Selecciona cómo deseas recibir tu pedido.",
    icon: PlaceOutlinedIcon,
  };
}

function timingOptions(fulfillment) {
  if (!fulfillment) return [];

  const options = [];

  if (fulfillment.allows_asap) {
    options.push({ value: "asap", label: "Lo antes posible" });
  }

  if (fulfillment.allows_scheduling) {
    options.push({ value: "scheduled", label: "Programar pedido" });
  }

  return options;
}

const WEEKDAY_LABELS = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};

function formatTime12(value) {
  const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return String(value || "");

  const hours = Number(match[1]);
  const minutes = match[2];
  if (hours < 0 || hours > 23) return String(value || "");

  const suffix = hours < 12 ? "a. m." : "p. m.";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${minutes} ${suffix}`;
}

function formatTextList(items = []) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} y ${items[1]}`;

  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

function selectedSummarySx(accentColor) {
  return {
    width: "100%",
    border: "1px solid",
    borderColor: hexToRgba(accentColor, 0.18),
    borderLeft: `3px solid ${accentColor}`,
    borderRadius: 1.5,
    boxShadow: "none",
    backgroundColor: hexToRgba(accentColor, 0.04),
  };
}

function selectFieldSx(accentColor) {
  return {
    width: "100%",
    minWidth: 0,
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: accentColor,
      borderWidth: "1px",
    },
  };
}

function nativeDateTimeFieldSx(accentColor) {
  return {
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
    "& .MuiOutlinedInput-root": {
      width: "100%",
      minWidth: 0,
      minHeight: 48,
      boxSizing: "border-box",
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: accentColor,
      borderWidth: "1px",
    },
    "& .MuiInputBase-input": {
      width: "100%",
      minWidth: 0,
      maxWidth: "100%",
      height: 48,
      px: 1.75,
      py: 0,
      boxSizing: "border-box",
    },
  };
}

function menuItemSx(accentColor) {
  return {
    "&.Mui-selected": {
      backgroundColor: hexToRgba(accentColor, 0.09),
    },
    "&.Mui-selected:hover": {
      backgroundColor: hexToRgba(accentColor, 0.13),
    },
    "&:hover": {
      backgroundColor: hexToRgba(accentColor, 0.045),
    },
  };
}

export default function OnlineOrderFulfillmentSection({
  fulfillments,
  fulfillmentType,
  selectedFulfillment,
  timingType,
  requestedForAt,
  deliveryConceptId,
  deliveryConcepts,
  selectedDeliveryConcept,
  scheduledPointId,
  scheduledPoints,
  selectedPoint,
  scheduledDate,
  availableBlocks,
  scheduledPointTimeBlockId,
  selectedBlock,
  scheduledTime,
  themeColor,
  disabled,
  onFulfillmentChange,
  onTimingTypeChange,
  onRequestedForAtChange,
  onDeliveryConceptChange,
  onScheduledPointChange,
  onScheduledDateChange,
  onBlockChange,
  onScheduledTimeChange,
}) {
  const accentColor = safeThemeColor(themeColor);

  const availableTimingOptions = useMemo(
    () => timingOptions(selectedFulfillment),
    [selectedFulfillment],
  );

  const selectedPointDays = useMemo(() => {
    const blocks = Array.isArray(selectedPoint?.time_blocks) ? selectedPoint.time_blocks : [];

    const days = [...new Set(
      blocks
        .map((block) => Number(block?.day_of_week))
        .filter((day) => WEEKDAY_LABELS[day])
    )]
      .sort((a, b) => a - b)
      .map((day) => WEEKDAY_LABELS[day]);

    return formatTextList(days);
  }, [selectedPoint]);

  return (
    <Card
      variant="outlined"
      sx={{ width: "100%", borderWidth: 1, borderRadius: 0, boxShadow: "none" }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography fontWeight={800}>Forma de entrega</Typography>

            <Typography variant="body2" color="text.secondary">
              Selecciona cómo deseas recibir tu pedido.
            </Typography>
          </Box>

          {fulfillments.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: { xs: 1, sm: 1.25 },
                width: "100%",
                minWidth: 0,
              }}
            >
              {fulfillments.map((row, index) => {
                const type = String(row?.fulfillment_type || "");
                const presentation = fulfillmentPresentation(type);
                const FulfillmentIcon = presentation.icon;
                const selected = fulfillmentType === type;

                const shouldSpanBoth =
                  fulfillments.length === 1 ||
                  (fulfillments.length === 3 && index === 2);

                return (
                  <Box
                    key={type}
                    component="button"
                    type="button"
                    aria-pressed={selected}
                    disabled={disabled}
                    onClick={() => onFulfillmentChange?.(type)}
                    sx={{
                      gridColumn: shouldSpanBoth ? "1 / -1" : "auto",
                      minWidth: 0,
                      minHeight: { xs: 102, sm: 108 },
                      p: { xs: 1.15, sm: 1.4 },
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      gap: 0.75,
                      font: "inherit",
                      color: "text.primary",
                      border: "1px solid",
                      borderColor: selected ? accentColor : "divider",
                      borderRadius: 2,
                      backgroundColor: selected ? hexToRgba(accentColor, 0.07) : "#FFFFFF",
                      cursor: disabled ? "not-allowed" : "pointer",
                      opacity: disabled ? 0.6 : 1,
                      transition:
                        "border-color 160ms ease, background-color 160ms ease, transform 160ms ease",
                      "&:hover": disabled
                        ? {}
                        : {
                            borderColor: accentColor,
                            backgroundColor: hexToRgba(accentColor, selected ? 0.09 : 0.035),
                            transform: "translateY(-1px)",
                          },
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        color: accentColor,
                        backgroundColor: hexToRgba(accentColor, 0.1),
                      }}
                    >
                      <FulfillmentIcon sx={{ fontSize: { xs: 21, sm: 23 } }} />
                    </Box>

                    <Typography
                      sx={{
                        fontSize: { xs: 12.5, sm: 14 },
                        fontWeight: 850,
                        lineHeight: 1.2,
                      }}
                    >
                      {presentation.label}
                    </Typography>

                    <Typography
                      sx={{
                        display: { xs: shouldSpanBoth ? "block" : "none", sm: "block" },
                        maxWidth: shouldSpanBoth ? 420 : 240,
                        fontSize: 11.5,
                        color: "text.secondary",
                        lineHeight: 1.3,
                      }}
                    >
                      {presentation.description}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          ) : null}

          {selectedFulfillment?.minimum_order_amount !== null &&
          selectedFulfillment?.minimum_order_amount !== undefined ? (
            <Typography variant="body2" color="text.secondary">
              Pedido mínimo:{" "}
              <strong>{money(selectedFulfillment.minimum_order_amount)}</strong>
            </Typography>
          ) : null}

          {fulfillmentType !== "scheduled_point" && selectedFulfillment ? (
            <FieldBlock
              label="¿Cuándo lo quieres? *"
              input={
                availableTimingOptions.length === 1 ? (
                  <TextField
                    size="small"
                    value={availableTimingOptions[0]?.label || ""}
                    disabled
                    sx={selectFieldSx(accentColor)}
                  />
                ) : (
                  <TextField
                    select
                    size="small"
                    value={timingType}
                    onChange={(e) => onTimingTypeChange?.(e.target.value)}
                    disabled={disabled || availableTimingOptions.length === 0}
                    sx={selectFieldSx(accentColor)}
                  >
                    <MenuItem value="" disabled>
                      Selecciona una opción
                    </MenuItem>

                    {availableTimingOptions.map((option) => (
                      <MenuItem
                        key={option.value}
                        value={option.value}
                        sx={menuItemSx(accentColor)}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )
              }
            />
          ) : null}

          {timingType === "asap" && fulfillmentType !== "scheduled_point" ? (
            <Box
              sx={{
                px: 1.25,
                py: 1,
                borderLeft: "3px solid",
                borderColor: accentColor,
                backgroundColor: hexToRgba(accentColor, 0.045),
              }}
            >
              <Typography sx={{ fontSize: 12.5, color: "text.secondary", lineHeight: 1.45 }}>
                Se avisará a la sucursal que deseas recibir tu pedido lo antes posible.
              </Typography>
            </Box>
          ) : null}

          {timingType === "scheduled" && fulfillmentType !== "scheduled_point" ? (
            <FieldBlock
              label="Fecha y hora *"
              input={
                <TextField
                  size="small"
                  type="datetime-local"
                  value={requestedForAt}
                  onChange={(e) => onRequestedForAtChange?.(e.target.value)}
                  disabled={disabled}
                  sx={nativeDateTimeFieldSx(accentColor)}
                />
              }
            />
          ) : null}

          {timingType === "scheduled" &&
          Number(selectedFulfillment?.minimum_lead_minutes || 0) > 0 ? (
            <Typography variant="body2" color="text.secondary">
              Programa tu pedido con al menos{" "}
              <strong>{selectedFulfillment.minimum_lead_minutes} minutos</strong>{" "}
              de anticipación.
            </Typography>
          ) : null}

          {deliveryConcepts.length > 0 ? (
            <FieldBlock
              label={
                fulfillmentType === "home_delivery"
                  ? "Zona o código postal *"
                  : "Ubicación *"
              }
              input={
                <TextField
                  select
                  size="small"
                  value={deliveryConceptId}
                  onChange={(e) => onDeliveryConceptChange?.(e.target.value)}
                  disabled={disabled}
                  sx={selectFieldSx(accentColor)}
                >
                  <MenuItem value="" disabled>
                    {fulfillmentType === "home_delivery"
                      ? "Selecciona una zona o código postal"
                      : "Selecciona una ubicación"}
                  </MenuItem>

                  {deliveryConcepts.map((concept) => (
                    <MenuItem
                      key={concept.id}
                      value={String(concept.id)}
                      sx={menuItemSx(accentColor)}
                    >
                      {concept.name}
                      {concept.postal_code ? ` · ${concept.postal_code}` : ""}
                    </MenuItem>
                  ))}
                </TextField>
              }
            />
          ) : null}

          {selectedDeliveryConcept ? (
            <Card variant="outlined" sx={selectedSummarySx(accentColor)}>
              <CardContent
                sx={{
                  px: { xs: 1.35, sm: 1.5 },
                  py: 1.1,
                  "&:last-child": { pb: 1.1 },
                }}
              >
                <Stack spacing={0.3}>
                  <Typography sx={{ fontSize: 14, fontWeight: 800, lineHeight: 1.25 }}>
                    {selectedDeliveryConcept.name}
                  </Typography>

                  {selectedDeliveryConcept.description ? (
                    <Typography
                      sx={{
                        fontSize: 12.5,
                        color: "text.secondary",
                        lineHeight: 1.35,
                      }}
                    >
                      {selectedDeliveryConcept.description}
                    </Typography>
                  ) : null}

                  <Typography sx={{ fontSize: 12.5, lineHeight: 1.35 }}>
                    Costo de entrega:{" "}
                    <strong>{money(selectedDeliveryConcept.delivery_fee || 0)}</strong>
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ) : null}

          {fulfillmentType === "scheduled_point" ? (
            <>
              <FieldBlock
                label="Punto programado *"
                input={
                  <TextField
                    select
                    size="small"
                    value={scheduledPointId}
                    onChange={(e) => onScheduledPointChange?.(e.target.value)}
                    disabled={disabled}
                    sx={selectFieldSx(accentColor)}
                  >
                    <MenuItem value="" disabled>
                      Selecciona un punto programado
                    </MenuItem>

                    {scheduledPoints.map((point) => (
                      <MenuItem
                        key={point.id}
                        value={String(point.id)}
                        sx={menuItemSx(accentColor)}
                      >
                        {point.name}
                      </MenuItem>
                    ))}
                  </TextField>
                }
              />

              {selectedPoint ? (
                <Card variant="outlined" sx={selectedSummarySx(accentColor)}>
                  <CardContent
                    sx={{
                      px: { xs: 1.35, sm: 1.5 },
                      py: 1.1,
                      "&:last-child": { pb: 1.1 },
                    }}
                  >
                    <Stack spacing={0.3}>
                      <Typography sx={{ fontSize: 14, fontWeight: 800, lineHeight: 1.25 }}>
                        {selectedPoint.name}
                      </Typography>

                      {selectedPoint.address ? (
                        <Typography sx={{ fontSize: 12.5, lineHeight: 1.35 }}>
                          {selectedPoint.address}
                        </Typography>
                      ) : null}

                      {selectedPoint.description ? (
                        <Typography
                          sx={{
                            fontSize: 12.5,
                            color: "text.secondary",
                            lineHeight: 1.35,
                          }}
                        >
                          {selectedPoint.description}
                        </Typography>
                      ) : null}

                      {selectedPointDays ? (
                        <Typography sx={{ fontSize: 12.5, lineHeight: 1.35 }}>
                          Días disponibles: <strong>{selectedPointDays}</strong>
                        </Typography>
                      ) : null}

                      <Typography sx={{ fontSize: 12.5, lineHeight: 1.35 }}>
                        Costo de entrega:{" "}
                        <strong>{money(selectedPoint.delivery_fee || 0)}</strong>
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ) : null}

              <FieldBlock
                label="Fecha *"
                input={
                  <TextField
                    size="small"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => onScheduledDateChange?.(e.target.value)}
                    inputProps={{
                      min: selectedPoint?.valid_from || undefined,
                      max: selectedPoint?.valid_until || undefined,
                    }}
                    disabled={!selectedPoint || disabled}
                    sx={nativeDateTimeFieldSx(accentColor)}
                  />
                }
              />

              {scheduledDate && availableBlocks.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No hay horarios disponibles para la fecha seleccionada.
                </Typography>
              ) : null}

              {availableBlocks.length > 0 ? (
                <FieldBlock
                  label="Horario *"
                  input={
                    <TextField
                      select
                      size="small"
                      value={scheduledPointTimeBlockId}
                      onChange={(e) => onBlockChange?.(e.target.value)}
                      disabled={disabled}
                      sx={selectFieldSx(accentColor)}
                    >
                      <MenuItem value="" disabled>
                        Selecciona un horario
                      </MenuItem>

                      {availableBlocks.map((block) => (
                        <MenuItem
                          key={block.id}
                          value={String(block.id)}
                          sx={menuItemSx(accentColor)}
                        >
                          {formatTime12(block.start_time)} - {formatTime12(block.end_time)}
                        </MenuItem>
                      ))}
                    </TextField>
                  }
                />
              ) : null}

              {selectedBlock ? (
                <FieldBlock
                  label="Hora *"
                  help={`Selecciona una hora dentro de ${formatTime12(selectedBlock.start_time)} - ${formatTime12(selectedBlock.end_time)}.`}
                  input={
                    <TextField
                      size="small"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => onScheduledTimeChange?.(e.target.value)}
                      inputProps={{
                        min: selectedBlock.start_time,
                        max: selectedBlock.end_time,
                        step: 60,
                      }}
                      disabled={disabled}
                      sx={nativeDateTimeFieldSx(accentColor)}
                    />
                  }
                />
              ) : null}
            </>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ width: "100%", minWidth: 0, maxWidth: "100%" }}>
      <Typography
        sx={{
          mb: 1,
          fontSize: 14,
          fontWeight: 800,
          color: "text.primary",
        }}
      >
        {label}
      </Typography>

      {input}

      {help ? (
        <Typography
          sx={{
            mt: 0.75,
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.45,
          }}
        >
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}