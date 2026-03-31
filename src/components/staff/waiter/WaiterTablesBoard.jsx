import React from "react";
import { Box } from "@mui/material";
import WaiterTableCard from "./WaiterTableCard";

export default function WaiterTablesBoard({
  tables = [],
  meta,
  payingBusyOrderId,
  onAttend,
  onRejectCall,
  onFinish,
  onReleaseSession,
  onMarkPaid,
  onAccept,
  onReject,
  onStartPayment,
  onOccupy,
  onFree,
  onCreateOrder,
  onViewOrder,
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "repeat(1, minmax(0, 1fr))",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))",
          lg: "repeat(4, minmax(0, 1fr))",
        },
        alignItems: "stretch",
      }}
    >
      {tables.map((table) => (
        <WaiterTableCard
          key={table.id}
          table={table}
          meta={meta}
          payingBusyOrderId={payingBusyOrderId}
          onAttend={onAttend}
          onRejectCall={onRejectCall}
          onFinish={onFinish}
          onReleaseSession={onReleaseSession}
          onMarkPaid={onMarkPaid}
          onAccept={onAccept}
          onReject={onReject}
          onStartPayment={onStartPayment}
          onOccupy={onOccupy}
          onFree={onFree}
          onCreateOrder={onCreateOrder}
          onViewOrder={onViewOrder}
        />
      ))}
    </Box>
  );
}
