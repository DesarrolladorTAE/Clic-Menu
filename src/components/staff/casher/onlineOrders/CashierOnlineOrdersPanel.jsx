import React, { useRef, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";

import AppAlert from "../../../common/AppAlert";
import PaginationFooter from "../../../common/PaginationFooter";
import CashierOnlineOrderCard from "./CashierOnlineOrderCard";

import {
  fetchCashierOnlineOrderDeliveryPrintConfig,
  fetchCashierOnlineOrderDeliveryPrintPayload,
} from "../../../../services/staff/casher/onlineOrders/cashierOnlineOrders.service";

import {
  sendCashierThermalPrintPayload,
} from "../../../../services/staff/casher/cashierTicket.service";

export default function CashierOnlineOrdersPanel({
  mode = "available",
  orders = [],
  busyOrderId = null,
  busyAction = "",
  actionsDisabled = false,
  page,
  totalPages,
  startItem,
  endItem,
  total,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onOpenDetail,
  onAction,
}) {
  const availableMode = mode === "available";

  const [printingOrderId, setPrintingOrderId] = useState(null);
  const printingRef = useRef(false);
  const [printNotice, setPrintNotice] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const showPrintNotice = (severity, message) => {
    setPrintNotice({ open: true, severity, message });
  };

  /**
   * Imprime manualmente el documento de entrega reutilizando el transporte térmico.
   * No modifica el pedido, registra pagos ni genera tickets oficiales.
   */
  const handlePrintDelivery = async (order) => {
    const onlineOrderId = Number(order?.id || 0);

    if (
      printingRef.current ||
      actionsDisabled ||
      Boolean(busyOrderId) ||
      onlineOrderId <= 0 ||
      order?.can_print_delivery_ticket !== true
    ) {
      return;
    }

    printingRef.current = true;
    setPrintingOrderId(onlineOrderId);

    try {
      // 1. Consultar la configuración actual de impresión.
      const configResponse = await fetchCashierOnlineOrderDeliveryPrintConfig(onlineOrderId);
      const config = configResponse?.data;

      if (configResponse?.ok !== true || !config?.enabled || !config?.app_type?.code) {
        showPrintNotice(
          "warning",
          config?.message || configResponse?.message || "La impresión térmica no está disponible para esta sucursal."
        );
        return;
      }

      // 2. Recuperar el documento térmico directamente del backend.
      const payloadResponse = await fetchCashierOnlineOrderDeliveryPrintPayload(onlineOrderId);
      const payload = payloadResponse?.payload;

      if (payloadResponse?.ok !== true || !payload || typeof payload !== "object") {
        showPrintNotice(
          "error",
          payloadResponse?.message || "No fue posible preparar el documento de entrega para imprimir."
        );
        return;
      }

      // 3. Verificar que sea el documento correcto y que no abra el cajón.
      if (payload?.meta?.document_type !== "online_order_delivery" || payload?.openDrawer !== false) {
        showPrintNotice("error", "La configuración del documento de entrega necesita revisión.");
        return;
      }

      // 4. Reutilizar el servicio actual de impresión térmica.
      const result = await sendCashierThermalPrintPayload(payload, config);

      if (result === false || result?.ok === false) {
        showPrintNotice("error", "La aplicación de impresión no pudo procesar el documento. Intenta nuevamente.");
        return;
      }

      showPrintNotice("success", "Se envió la solicitud de impresión del documento de entrega.");
    } catch (error) {
      console.error("Error al imprimir documento de entrega:", error);

      const serverMessage = error?.response?.data?.message;
      const message = typeof serverMessage === "string" && serverMessage.trim()
        ? serverMessage.trim()
        : "No fue posible enviar el documento a la impresora. Revisa la conexión e inténtalo nuevamente.";

      showPrintNotice("error", message);
    } finally {
      printingRef.current = false;
      setPrintingOrderId(null);
    }
  };

  return (
    <Paper
      sx={{
        p: 0,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        backgroundColor: "background.paper",
        boxShadow: "none",
      }}
    >
      <Box sx={{ px: 2, py: 1.75, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
          {availableMode ? "Pedidos disponibles" : "Mis pedidos"}
        </Typography>

        <Typography sx={{ mt: 0.5, fontSize: 14, color: "text.secondary", lineHeight: 1.55 }}>
          {availableMode
            ? "Aquí aparecen los pedidos que todavía se encuentran pendientes por aceptar."
            : "Aquí aparecen los pedidos que actualmente están asignados a tu caja."}
        </Typography>
      </Box>

      {orders.length === 0 ? (
        <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: "text.primary" }}>
            {availableMode ? "No hay pedidos disponibles" : "No tienes pedidos asignados"}
          </Typography>

          <Typography sx={{ mt: 1, fontSize: 14, color: "text.secondary", lineHeight: 1.6 }}>
            {availableMode
              ? "Los nuevos pedidos o los pedidos liberados aparecerán aquí automáticamente."
              : "Cuando aceptes o tomes un pedido, aparecerá en esta sección."}
          </Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              p: 2,
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(2, minmax(0, 1fr))",
              },
              alignItems: "stretch",
            }}
          >
            {orders.map((order) => {
              const orderId = Number(order?.id || 0);
              const isBusyOrder = Number(busyOrderId || 0) === orderId;
              const anotherOrderBusy = Boolean(busyOrderId) && !isBusyOrder;

              return (
                <CashierOnlineOrderCard
                  key={`online-order:${orderId}`}
                  order={order}
                  disabled={actionsDisabled || anotherOrderBusy || printingOrderId !== null}
                  busyAction={isBusyOrder ? busyAction : ""}
                  printing={Number(printingOrderId || 0) === orderId}
                  onOpenDetail={onOpenDetail}
                  onAction={onAction}
                  onPrintDelivery={handlePrintDelivery}
                />
              );
            })}
          </Box>

          <PaginationFooter
            page={page}
            totalPages={totalPages}
            startItem={startItem}
            endItem={endItem}
            total={total}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={onPrev}
            onNext={onNext}
            itemLabel="pedidos"
          />
        </>
      )}

      <AppAlert
        open={printNotice.open}
        severity={printNotice.severity}
        message={printNotice.message}
        autoHideDuration={3000}
        onClose={(_, reason) => {
          if (reason === "clickaway") {
            return;
          }

          setPrintNotice((current) => ({ ...current, open: false }));
        }}
      />
    </Paper>
  );
}