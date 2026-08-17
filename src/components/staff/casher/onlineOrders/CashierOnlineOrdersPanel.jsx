import React from "react";
import { Box, Paper, Typography } from "@mui/material";

import PaginationFooter from "../../../common/PaginationFooter";
import CashierOnlineOrderCard from "./CashierOnlineOrderCard";

export default function CashierOnlineOrdersPanel({
  mode = "available",
  orders = [],
  busyOrderId = null,
  busyAction = "",
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
                  disabled={anotherOrderBusy}
                  busyAction={isBusyOrder ? busyAction : ""}
                  onOpenDetail={onOpenDetail}
                  onAction={onAction}
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
    </Paper>
  );
}