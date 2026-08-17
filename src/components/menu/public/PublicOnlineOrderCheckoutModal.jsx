// Formulario para pedidos en línea
import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Card, CardContent, Divider, MenuItem, Pagination, Stack, TextField, Typography,
} from "@mui/material";

import { money } from "../../../hooks/public/publicMenu.utils";
import { Modal, PillButton } from "../../../pages/public/publicMenu.ui";
import AppAlert from "../../common/AppAlert";

const CART_PAGE_SIZE = 5;

function fulfillmentLabel(type) {
  const labels = {
    pickup: "Recoger",
    home_delivery: "Entrega a domicilio",
    internal_location: "Ubicación interna",
    scheduled_point: "Punto programado",
  };

  return labels[String(type || "")] || "Forma de entrega";
}

function paymentLabel(type) {
  const labels = {
    cash: "Efectivo",
    transfer: "Transferencia",
    terminal: "Terminal",
  };

  return labels[String(type || "")] || "Método de pago";
}

function defaultTimingForFulfillment(fulfillment) {
  if (!fulfillment) return "";
  if (fulfillment.fulfillment_type === "scheduled_point") return "scheduled";

  const allowsAsap = Boolean(fulfillment.allows_asap);
  const allowsScheduling = Boolean(fulfillment.allows_scheduling);

  if (allowsAsap && !allowsScheduling) return "asap";
  if (!allowsAsap && allowsScheduling) return "scheduled";

  return "";
}

function isoWeekdayFromDate(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0);
  const day = date.getDay();

  return day === 0 ? 7 : day;
}

function normalizeDateTimeValue(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  return text.length === 16 ? `${text}:00` : text;
}

function isTimeInsideBlock(time, start, end) {
  const selected = String(time || "").trim();
  const from = String(start || "").trim();
  const to = String(end || "").trim();

  if (!selected || !from || !to) return false;

  return selected >= from && selected < to;
}

export default function PublicOnlineOrderCheckoutModal({
  open,
  checkoutConfig,
  cart,
  hasInvalidItems,
  invalidItemsCount,
  quoting,
  creating,
  onClose,
  onQuote,
  onCreate,
  onCreated,
}) {
  const fulfillments = useMemo(
    () => Array.isArray(checkoutConfig?.fulfillments) ? checkoutConfig.fulfillments : [],
    [checkoutConfig],
  );

  const paymentMethods = useMemo(
    () => Array.isArray(checkoutConfig?.payment_methods) ? checkoutConfig.payment_methods : [],
    [checkoutConfig],
  );

  const [orderName, setOrderName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const [fulfillmentType, setFulfillmentType] = useState("");
  const [timingType, setTimingType] = useState("");
  const [requestedForAt, setRequestedForAt] = useState("");

  const [deliveryConceptId, setDeliveryConceptId] = useState("");
  const [scheduledPointId, setScheduledPointId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledPointTimeBlockId, setScheduledPointTimeBlockId] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const [paymentType, setPaymentType] = useState("");
  const [quote, setQuote] = useState(null);
  const [quotedSelection, setQuotedSelection] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [cartPage, setCartPage] = useState(1);

  const selectedFulfillment = useMemo(
    () => fulfillments.find((row) => row?.fulfillment_type === fulfillmentType) || null,
    [fulfillments, fulfillmentType],
  );

  const deliveryConcepts = useMemo(
    () => Array.isArray(selectedFulfillment?.delivery_concepts)
      ? selectedFulfillment.delivery_concepts
      : [],
    [selectedFulfillment],
  );

  const scheduledPoints = useMemo(
    () => Array.isArray(selectedFulfillment?.scheduled_points)
      ? selectedFulfillment.scheduled_points
      : [],
    [selectedFulfillment],
  );

  const selectedDeliveryConcept = useMemo(
    () => deliveryConcepts.find((row) => Number(row?.id) === Number(deliveryConceptId)) || null,
    [deliveryConcepts, deliveryConceptId],
  );

  const selectedPoint = useMemo(
    () => scheduledPoints.find((row) => Number(row?.id) === Number(scheduledPointId)) || null,
    [scheduledPoints, scheduledPointId],
  );

  const availableBlocks = useMemo(() => {
    if (!selectedPoint || !scheduledDate) return [];

    const weekday = isoWeekdayFromDate(scheduledDate);
    const blocks = Array.isArray(selectedPoint?.time_blocks) ? selectedPoint.time_blocks : [];

    return blocks.filter((block) => Number(block?.day_of_week) === Number(weekday));
  }, [selectedPoint, scheduledDate]);

  const selectedBlock = useMemo(
    () => availableBlocks.find((row) => Number(row?.id) === Number(scheduledPointTimeBlockId)) || null,
    [availableBlocks, scheduledPointTimeBlockId],
  );

  const cartRows = Array.isArray(cart) ? cart : [];
  const cartPageCount = Math.max(1, Math.ceil(cartRows.length / CART_PAGE_SIZE));

  const paginatedCart = useMemo(() => {
    const start = (cartPage - 1) * CART_PAGE_SIZE;
    return cartRows.slice(start, start + CART_PAGE_SIZE);
  }, [cartRows, cartPage]);

  const fieldValidity = useMemo(() => {
    const nameValid = String(orderName || "").trim() !== "";
    const phoneValid = /^[0-9]{10}$/.test(String(customerPhone || "").trim());

    const email = String(customerEmail || "").trim();
    const emailValid = email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const fulfillmentValid = Boolean(selectedFulfillment);
    const isScheduledPoint = fulfillmentType === "scheduled_point";
    const isDeliveryConcept =
      fulfillmentType === "home_delivery" ||
      fulfillmentType === "internal_location";

    const resolvedTiming = isScheduledPoint ? "scheduled" : timingType;

    const timingValid =
      Boolean(resolvedTiming) &&
      (
        (resolvedTiming === "asap" && Boolean(selectedFulfillment?.allows_asap)) ||
        (resolvedTiming === "scheduled" && Boolean(selectedFulfillment?.allows_scheduling))
      );

    const deliveryConceptValid =
      !isDeliveryConcept ||
      Boolean(deliveryConceptId && selectedDeliveryConcept);

    const requestedForAtValid =
      isScheduledPoint ||
      resolvedTiming !== "scheduled" ||
      Boolean(requestedForAt);

    const scheduledPointValid =
      !isScheduledPoint ||
      Boolean(scheduledPointId && selectedPoint);

    const scheduledDateValid =
      !isScheduledPoint ||
      Boolean(
        scheduledDate &&
        (!selectedPoint?.valid_from || scheduledDate >= selectedPoint.valid_from) &&
        (!selectedPoint?.valid_until || scheduledDate <= selectedPoint.valid_until)
      );

    const scheduledBlockValid =
      !isScheduledPoint ||
      Boolean(scheduledPointTimeBlockId && selectedBlock);

    const scheduledTimeValid =
      !isScheduledPoint ||
      Boolean(
        scheduledTime &&
        selectedBlock &&
        isTimeInsideBlock(scheduledTime, selectedBlock.start_time, selectedBlock.end_time)
      );

    const paymentValid = Boolean(
      paymentType &&
      paymentMethods.some((row) => String(row?.payment_type || "") === String(paymentType)),
    );

    return {
      orderName: nameValid,
      customerPhone: phoneValid,
      customerEmail: emailValid,
      fulfillmentType: fulfillmentValid,
      timingType: timingValid,
      deliveryConceptId: deliveryConceptValid,
      requestedForAt: requestedForAtValid,
      scheduledPointId: scheduledPointValid,
      scheduledDate: scheduledDateValid,
      scheduledPointTimeBlockId: scheduledBlockValid,
      scheduledTime: scheduledTimeValid,
      paymentType: paymentValid,
    };
  }, [
    orderName,
    customerPhone,
    customerEmail,
    selectedFulfillment,
    fulfillmentType,
    timingType,
    deliveryConceptId,
    selectedDeliveryConcept,
    requestedForAt,
    scheduledPointId,
    selectedPoint,
    scheduledDate,
    scheduledPointTimeBlockId,
    selectedBlock,
    scheduledTime,
    paymentType,
    paymentMethods,
  ]);

  const formReady = useMemo(() => {
    if (fulfillments.length === 0 || paymentMethods.length === 0) return false;
    if (cartRows.length === 0 || hasInvalidItems) return false;

    return Object.values(fieldValidity).every(Boolean);
  }, [
    fulfillments.length,
    paymentMethods.length,
    cartRows.length,
    hasInvalidItems,
    fieldValidity,
  ]);

  const primaryActionEnabled = quote
    ? Boolean(quotedSelection) && !quoting && !creating
    : formReady && !quoting && !creating;

  useEffect(() => {
    if (!open) return;

    const initialFulfillment =
      fulfillments.length === 1 ? String(fulfillments[0]?.fulfillment_type || "") : "";

    const initialFulfillmentRow =
      fulfillments.find((row) => row?.fulfillment_type === initialFulfillment) || null;

    setOrderName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setCustomerNotes("");
    setFulfillmentType(initialFulfillment);
    setTimingType(defaultTimingForFulfillment(initialFulfillmentRow));
    setRequestedForAt("");
    setDeliveryConceptId("");
    setScheduledPointId("");
    setScheduledDate("");
    setScheduledPointTimeBlockId("");
    setScheduledTime("");
    setPaymentType(paymentMethods.length === 1 ? String(paymentMethods[0]?.payment_type || "") : "");
    setQuote(null);
    setQuotedSelection(null);
    setErrorMessage("");
    setCartPage(1);
  }, [open, fulfillments, paymentMethods]);

  useEffect(() => {
    if (cartPage > cartPageCount) setCartPage(cartPageCount);
  }, [cartPage, cartPageCount]);

  useEffect(() => {
    if (!open) return;

    setQuote(null);
    setQuotedSelection(null);
  }, [
    open,
    orderName,
    customerPhone,
    customerEmail,
    customerNotes,
    fulfillmentType,
    timingType,
    requestedForAt,
    deliveryConceptId,
    scheduledPointId,
    scheduledDate,
    scheduledPointTimeBlockId,
    scheduledTime,
    paymentType,
    cart,
  ]);

  function handleFulfillmentChange(value) {
    const nextType = String(value || "");
    const fulfillment = fulfillments.find((row) => row?.fulfillment_type === nextType) || null;

    setFulfillmentType(nextType);
    setTimingType(defaultTimingForFulfillment(fulfillment));
    setRequestedForAt("");
    setDeliveryConceptId("");
    setScheduledPointId("");
    setScheduledDate("");
    setScheduledPointTimeBlockId("");
    setScheduledTime("");
  }

  function handleScheduledPointChange(value) {
    setScheduledPointId(value);
    setScheduledDate("");
    setScheduledPointTimeBlockId("");
    setScheduledTime("");
  }

  function handleScheduledDateChange(value) {
    setScheduledDate(value);
    setScheduledPointTimeBlockId("");
    setScheduledTime("");
  }

  function handleBlockChange(value) {
    setScheduledPointTimeBlockId(value);
    setScheduledTime("");
  }

  function buildSelection() {
    const name = String(orderName || "").trim();
    const phone = String(customerPhone || "").trim();
    const email = String(customerEmail || "").trim();
    const notes = String(customerNotes || "").trim();

    if (!name) return { ok: false, message: "Escribe el nombre para tu pedido." };

    if (!phone) {
      return { ok: false, message: "Ingresa el teléfono con WhatsApp para continuar." };
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return { ok: false, message: "El teléfono debe contener exactamente 10 dígitos numéricos." };
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, message: "Ingresa un correo electrónico válido." };
    }

    if (!selectedFulfillment) {
      return {
        ok: false,
        message: fulfillments.length === 0
          ? "No hay formas de entrega disponibles en este momento."
          : "Selecciona una forma de entrega.",
      };
    }

    const isScheduledPoint = fulfillmentType === "scheduled_point";
    const isDeliveryConcept =
      fulfillmentType === "home_delivery" ||
      fulfillmentType === "internal_location";

    const resolvedTiming = isScheduledPoint ? "scheduled" : timingType;

    if (!resolvedTiming) {
      return { ok: false, message: "Selecciona cuándo quieres recibir tu pedido." };
    }

    if (resolvedTiming === "asap" && !selectedFulfillment.allows_asap) {
      return { ok: false, message: "Esta forma de entrega no permite pedidos inmediatos." };
    }

    if (resolvedTiming === "scheduled" && !selectedFulfillment.allows_scheduling) {
      return { ok: false, message: "Esta forma de entrega no permite pedidos programados." };
    }

    if (isDeliveryConcept && !deliveryConceptId) {
      return {
        ok: false,
        message: fulfillmentType === "home_delivery"
          ? "Selecciona una zona o código postal de entrega."
          : "Selecciona una ubicación interna.",
      };
    }

    if (!paymentType) {
      return {
        ok: false,
        message: paymentMethods.length === 0
          ? "No hay métodos de pago disponibles en este momento."
          : "Selecciona un método de pago.",
      };
    }

    const payload = {
      order_name: name,
      customer_phone: phone,
      customer_email: email || null,
      customer_notes: notes || null,
      fulfillment_type: fulfillmentType,
      timing_type: resolvedTiming,
      payment_type: paymentType,
    };

    if (isDeliveryConcept) {
      payload.delivery_concept_id = Number(deliveryConceptId);
    }

    if (isScheduledPoint) {
      if (!scheduledPointId) {
        return { ok: false, message: "Selecciona un punto programado." };
      }

      if (!scheduledDate) {
        return { ok: false, message: "Selecciona la fecha del pedido." };
      }

      if (selectedPoint?.valid_from && scheduledDate < selectedPoint.valid_from) {
        return { ok: false, message: "El punto seleccionado todavía no está disponible para esa fecha." };
      }

      if (selectedPoint?.valid_until && scheduledDate > selectedPoint.valid_until) {
        return { ok: false, message: "El punto seleccionado ya no está disponible para esa fecha." };
      }

      if (!scheduledPointTimeBlockId || !selectedBlock) {
        return { ok: false, message: "Selecciona un horario disponible." };
      }

      if (!scheduledTime) {
        return { ok: false, message: "Selecciona la hora de tu pedido." };
      }

      if (!isTimeInsideBlock(scheduledTime, selectedBlock.start_time, selectedBlock.end_time)) {
        return {
          ok: false,
          message: `Selecciona una hora entre ${selectedBlock.start_time} y ${selectedBlock.end_time}.`,
        };
      }

      payload.scheduled_point_id = Number(scheduledPointId);
      payload.scheduled_point_time_block_id = Number(scheduledPointTimeBlockId);
      payload.scheduled_date = scheduledDate;
      payload.requested_for_at = `${scheduledDate}T${scheduledTime}:00`;
    } else if (resolvedTiming === "scheduled") {
      if (!requestedForAt) {
        return { ok: false, message: "Selecciona la fecha y hora de tu pedido." };
      }

      payload.requested_for_at = normalizeDateTimeValue(requestedForAt);
    }

    return { ok: true, payload };
  }

  async function handleQuote() {
    if (quoting || creating || !formReady) return;

    if (hasInvalidItems) {
      setErrorMessage(
        invalidItemsCount === 1
          ? "Hay un producto que debes revisar antes de continuar."
          : `Hay ${invalidItemsCount} productos que debes revisar antes de continuar.`,
      );
      return;
    }

    const selection = buildSelection();

    if (!selection.ok) {
      setErrorMessage(selection.message);
      return;
    }

    try {
      const result = await onQuote?.(selection.payload);

      if (!result?.ok) {
        setErrorMessage(result?.message || "No se pudo calcular el total del pedido.");
        return;
      }

      setQuotedSelection(selection.payload);
      setQuote(result.data);
    } catch {
      setErrorMessage("No se pudo calcular el total del pedido. Intenta nuevamente.");
    }
  }

  async function handleCreate() {
    if (quoting || creating || !quote || !quotedSelection) return;

    try {
      const result = await onCreate?.(quotedSelection);
      const created = result?.data && typeof result.data === "object" ? result.data : result;

      const successful =
        result?.ok === true ||
        Boolean(created?.tracking_url) ||
        Boolean(created?.tracking_token);

      if (!successful) {
        setErrorMessage(result?.message || "No se pudo enviar el pedido.");
        return;
      }

      const openedTracking = onCreated?.(created);

      if (openedTracking === false) {
        setErrorMessage(
          "Tu pedido fue creado correctamente, pero no pudimos abrir su seguimiento.",
        );
      }
    } catch {
      setErrorMessage("No se pudo enviar el pedido. Intenta nuevamente.");
    }
  }

  const unavailableConfiguration =
    fulfillments.length === 0 || paymentMethods.length === 0;

  return (
    <>
      <Modal
        open={open}
        title="Enviar pedido"
        fullScreenMobile
        squareCorners
        onClose={() => {
          if (quoting || creating) return;

          setErrorMessage("");
          onClose?.();
        }}
        actions={
          <>
            <PillButton
              tone="default"
              disabled={quoting || creating}
              onClick={() => {
                setErrorMessage("");
                onClose?.();
              }}
            >
              Cancelar
            </PillButton>

            <PillButton
              tone="orange"
              disabled={!primaryActionEnabled}
              onClick={quote ? handleCreate : handleQuote}
            >
              {quoting
                ? "Calculando..."
                : creating
                  ? "Enviando..."
                  : quote
                    ? "Confirmar pedido"
                    : "Calcular total"}
            </PillButton>
          </>
        }
      >
        <Stack spacing={2}>
          {unavailableConfiguration ? (
            <Box
              sx={{
                p: 1.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 0,
                backgroundColor: "background.default",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {!fulfillments.length && !paymentMethods.length
                  ? "No hay formas de entrega ni métodos de pago disponibles en este momento."
                  : !fulfillments.length
                    ? "No hay formas de entrega disponibles en este momento."
                    : "No hay métodos de pago disponibles en este momento."}
              </Typography>
            </Box>
          ) : null}

          <Card
            variant="outlined"
            sx={{ width: "100%", borderWidth: 1, borderRadius: 0, boxShadow: "none" }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography fontWeight={800}>Tus datos</Typography>

                  <Typography variant="body2" color="text.secondary">
                    Usaremos estos datos para identificar tu pedido y enviarte actualizaciones.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                    gap: 2,
                  }}
                >
                  <FieldBlock
                    label="Nombre para tu pedido *"
                    input={
                      <TextField
                        size="small"
                        value={orderName}
                        onChange={(e) => setOrderName(e.target.value)}
                        placeholder="Ej. Daniela"
                        inputProps={{ maxLength: 120 }}
                        disabled={quoting || creating}
                      />
                    }
                  />

                  <FieldBlock
                    label="Teléfono con WhatsApp *"
                    help="Ingresa los 10 dígitos de un número que tenga WhatsApp."
                    input={
                      <TextField
                        size="small"
                        value={customerPhone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setCustomerPhone(value);
                        }}
                        placeholder="Ej. 7441234567"
                        inputProps={{
                          maxLength: 10,
                          inputMode: "numeric",
                          pattern: "[0-9]*",
                        }}
                        disabled={quoting || creating}
                      />
                    }
                  />

                  <FieldBlock
                    label="Correo electrónico"
                    input={
                      <TextField
                        size="small"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="Ej. nombre@correo.com"
                        inputProps={{ maxLength: 190 }}
                        disabled={quoting || creating}
                      />
                    }
                  />

                  <FieldBlock
                    label="Notas para tu pedido"
                    input={
                      <TextField
                        size="small"
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder="Escribe alguna indicación si la necesitas"
                        inputProps={{ maxLength: 1000 }}
                        multiline
                        minRows={2}
                        disabled={quoting || creating}
                      />
                    }
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card
            variant="outlined"
            sx={{ width: "100%", borderWidth: 1, borderRadius: 0, boxShadow: "none" }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Typography fontWeight={800}>Forma de entrega</Typography>

                <FieldBlock
                  label="Forma de entrega *"
                  input={
                    <TextField
                      select
                      size="small"
                      value={fulfillmentType}
                      onChange={(e) => handleFulfillmentChange(e.target.value)}
                      disabled={quoting || creating || fulfillments.length === 0}
                    >
                      <MenuItem value="" disabled>
                        Selecciona una forma de entrega
                      </MenuItem>

                      {fulfillments.map((row) => (
                        <MenuItem key={row.fulfillment_type} value={row.fulfillment_type}>
                          {fulfillmentLabel(row.fulfillment_type)}
                        </MenuItem>
                      ))}
                    </TextField>
                  }
                />

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
                      <TextField
                        select
                        size="small"
                        value={timingType}
                        onChange={(e) => {
                          setTimingType(e.target.value);
                          setRequestedForAt("");
                        }}
                        disabled={quoting || creating}
                      >
                        <MenuItem value="" disabled>
                          Selecciona una opción
                        </MenuItem>

                        {selectedFulfillment.allows_asap ? (
                          <MenuItem value="asap">Lo antes posible</MenuItem>
                        ) : null}

                        {selectedFulfillment.allows_scheduling ? (
                          <MenuItem value="scheduled">Programar pedido</MenuItem>
                        ) : null}
                      </TextField>
                    }
                  />
                ) : null}

                {timingType === "scheduled" && fulfillmentType !== "scheduled_point" ? (
                  <FieldBlock
                    label="Fecha y hora *"
                    input={
                      <TextField
                        size="small"
                        type="datetime-local"
                        value={requestedForAt}
                        onChange={(e) => setRequestedForAt(e.target.value)}
                        disabled={quoting || creating}
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
                        onChange={(e) => setDeliveryConceptId(e.target.value)}
                        disabled={quoting || creating}
                      >
                        <MenuItem value="" disabled>
                          {fulfillmentType === "home_delivery"
                            ? "Selecciona una zona o código postal"
                            : "Selecciona una ubicación"}
                        </MenuItem>

                        {deliveryConcepts.map((concept) => (
                          <MenuItem key={concept.id} value={String(concept.id)}>
                            {concept.name}
                            {concept.postal_code ? ` · ${concept.postal_code}` : ""}
                          </MenuItem>
                        ))}
                      </TextField>
                    }
                  />
                ) : null}

                {selectedDeliveryConcept ? (
                  <Card
                    variant="outlined"
                    sx={{ width: "100%", borderWidth: 1, borderRadius: 0, boxShadow: "none" }}
                  >
                    <CardContent>
                      <Stack spacing={0.5}>
                        <Typography fontWeight={700}>
                          {selectedDeliveryConcept.name}
                        </Typography>

                        {selectedDeliveryConcept.description ? (
                          <Typography variant="body2" color="text.secondary">
                            {selectedDeliveryConcept.description}
                          </Typography>
                        ) : null}

                        <Typography variant="body2">
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
                          onChange={(e) => handleScheduledPointChange(e.target.value)}
                          disabled={quoting || creating}
                        >
                          <MenuItem value="" disabled>
                            Selecciona un punto programado
                          </MenuItem>

                          {scheduledPoints.map((point) => (
                            <MenuItem key={point.id} value={String(point.id)}>
                              {point.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      }
                    />

                    {selectedPoint ? (
                      <Card
                        variant="outlined"
                        sx={{ width: "100%", borderWidth: 1, borderRadius: 0, boxShadow: "none" }}
                      >
                        <CardContent>
                          <Stack spacing={0.5}>
                            <Typography fontWeight={700}>{selectedPoint.name}</Typography>

                            {selectedPoint.address ? (
                              <Typography variant="body2">
                                {selectedPoint.address}
                              </Typography>
                            ) : null}

                            {selectedPoint.description ? (
                              <Typography variant="body2" color="text.secondary">
                                {selectedPoint.description}
                              </Typography>
                            ) : null}

                            <Typography variant="body2">
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
                          onChange={(e) => handleScheduledDateChange(e.target.value)}
                          inputProps={{
                            min: selectedPoint?.valid_from || undefined,
                            max: selectedPoint?.valid_until || undefined,
                          }}
                          disabled={!selectedPoint || quoting || creating}
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
                            onChange={(e) => handleBlockChange(e.target.value)}
                            disabled={quoting || creating}
                          >
                            <MenuItem value="" disabled>
                              Selecciona un horario
                            </MenuItem>

                            {availableBlocks.map((block) => (
                              <MenuItem key={block.id} value={String(block.id)}>
                                {block.start_time} - {block.end_time}
                              </MenuItem>
                            ))}
                          </TextField>
                        }
                      />
                    ) : null}

                    {selectedBlock ? (
                      <FieldBlock
                        label="Hora *"
                        help={`Selecciona una hora dentro de ${selectedBlock.start_time} - ${selectedBlock.end_time}.`}
                        input={
                          <TextField
                            size="small"
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            inputProps={{
                              min: selectedBlock.start_time,
                              max: selectedBlock.end_time,
                              step: 60,
                            }}
                            disabled={quoting || creating}
                          />
                        }
                      />
                    ) : null}
                  </>
                ) : null}
              </Stack>
            </CardContent>
          </Card>

          <Card
            variant="outlined"
            sx={{ width: "100%", borderWidth: 1, borderRadius: 0, boxShadow: "none" }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Typography fontWeight={800}>Método de pago</Typography>

                <FieldBlock
                  label="Método de pago *"
                  input={
                    <TextField
                      select
                      size="small"
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                      disabled={quoting || creating || paymentMethods.length === 0}
                    >
                      <MenuItem value="" disabled>
                        Selecciona un método de pago
                      </MenuItem>

                      {paymentMethods.map((payment) => (
                        <MenuItem key={payment.payment_type} value={payment.payment_type}>
                          {paymentLabel(payment.payment_type)}
                        </MenuItem>
                      ))}
                    </TextField>
                  }
                />
              </Stack>
            </CardContent>
          </Card>

          <Card
            variant="outlined"
            sx={{ width: "100%", borderWidth: 1, borderRadius: 0, boxShadow: "none" }}
          >
            <CardContent>
              <Stack spacing={1.25}>
                <Box>
                  <Typography fontWeight={800}>Productos seleccionados</Typography>

                  <Typography variant="body2" color="text.secondary">
                    {cartRows.length} producto{cartRows.length === 1 ? "" : "s"} en tu pedido.
                  </Typography>
                </Box>

                {paginatedCart.map((item) => (
                  <Card
                    key={item.key}
                    variant="outlined"
                    sx={{
                      width: "100%",
                      minHeight: 72,
                      borderWidth: 1,
                      borderRadius: 0,
                      boxShadow: "none",
                    }}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                        "&:last-child": { pb: 2 },
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={700} noWrap>
                          {item.name || "Producto"}
                        </Typography>

                        {item.variant_name ? (
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {item.variant_name}
                          </Typography>
                        ) : null}
                      </Box>

                      <Typography fontWeight={800} sx={{ flexShrink: 0 }}>
                        × {Number(item.quantity || 1)}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}

                {cartPageCount > 1 ? (
                  <Box sx={{ display: "flex", justifyContent: "center", pt: 0.5 }}>
                    <Pagination
                      count={cartPageCount}
                      page={cartPage}
                      onChange={(_, nextPage) => setCartPage(nextPage)}
                      size="small"
                    />
                  </Box>
                ) : null}
              </Stack>
            </CardContent>
          </Card>

          {quote ? (
            <Card
              variant="outlined"
              sx={{ width: "100%", borderWidth: 1, borderRadius: 0, boxShadow: "none" }}
            >
              <CardContent>
                <Stack spacing={1.1}>
                  <Typography fontWeight={800}>Resumen de tu pedido</Typography>

                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Subtotal
                    </Typography>

                    <Typography variant="body2" fontWeight={700}>
                      {money(quote.subtotal || 0)}
                    </Typography>
                  </Box>

                  {Number(quote.promotion_discount_total || 0) > 0 ? (
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Promociones
                      </Typography>

                      <Typography variant="body2" fontWeight={700}>
                        -{money(quote.promotion_discount_total)}
                      </Typography>
                    </Box>
                  ) : null}

                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Entrega
                    </Typography>

                    <Typography variant="body2" fontWeight={700}>
                      {money(quote.delivery_fee || 0)}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                    <Typography fontWeight={800}>Total cotizado</Typography>

                    <Typography fontWeight={900}>
                      {money(quote.total || 0)}
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    La disponibilidad y los importes se validarán nuevamente al confirmar el pedido.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ) : null}
        </Stack>
      </Modal>

      <AppAlert
        open={Boolean(errorMessage)}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          setErrorMessage("");
        }}
        severity="error"
        title="Revisa tu pedido"
        message={errorMessage}
        autoHideDuration={3000}
      />
    </>
  );
}

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ width: "100%" }}>
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