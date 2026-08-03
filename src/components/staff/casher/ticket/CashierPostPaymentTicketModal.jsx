// src/components/staff/casher/ticket/CashierPostPaymentTicketModal.jsx
import React from "react";
import {
  Box, Dialog, DialogContent, IconButton, Stack, Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";

import CashierTicketPreviewCard from "./CashierTicketPreviewCard";
import CashierTicketWhatsappCard from "./CashierTicketWhatsappCard";
import CashierTicketActionsBar from "./CashierTicketActionsBar";

export default function CashierPostPaymentTicketModal({
  open,
  onContinue,
  onViewTicket,
  onPrintTicket,
  onThermalPrintTicket,
  onDownloadTicket,
  busyView = false,
  busyPrint = false,
  busyThermalPrint = false,
  busyDownload = false,
  busyWhatsapp = false,
  onSendWhatsapp,
  printConfig = null,
  customerSummary = null,
  ticket = null,
  sale = null,
  order = null,
  table = null,
  settlement = null,
  ticketWarning = false,
  ticketErrorCode = null,
  ticketErrorMessage = null,
}) {
  const ticketAvailable = Boolean(ticket?.id);

  const partiallyPaid = settlement?.partially_paid === true;
  const completed = settlement?.completed === true;

  const rawPendingChecksCount = Number(
    settlement?.pending_checks_count ?? 0
  );

  const pendingChecksCount = Number.isFinite(rawPendingChecksCount)
    ? Math.max(0, Math.trunc(rawPendingChecksCount))
    : 0;

  const paymentTitle = partiallyPaid
    ? "Cuenta cobrada"
    : completed
    ? "Cobro finalizado"
    : "Cobro realizado";

  const paymentMessage = partiallyPaid
    ? pendingChecksCount === 1
      ? "El cobro de esta cuenta se realizó correctamente. Queda 1 cuenta pendiente en esta venta."
      : `El cobro de esta cuenta se realizó correctamente. Quedan ${pendingChecksCount} cuentas pendientes en esta venta.`
    : completed
    ? "La última cuenta fue pagada y el paquete quedó concluido."
    : "El cobro se realizó correctamente. Revisa el resumen y las acciones disponibles.";

  const thermalPrintEnabled =
    Boolean(printConfig?.enabled) &&
    Boolean(printConfig?.show_print_button);

  const thermalPrintAppName =
    printConfig?.app_type?.name ||
    "la aplicación de impresión térmica";

  const handleExit = () => {
    onContinue?.();
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === "backdropClick") return;
        handleExit();
      }}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
          overflow: "hidden",
          m: { xs: 1.5, sm: 2 },
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 2.5 },
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "success.main",
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                <TaskAltRoundedIcon />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: 22, sm: 26 },
                    fontWeight: 800,
                    color: "text.primary",
                    lineHeight: 1.1,
                  }}
                >
                  {paymentTitle}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 14,
                    color: "text.secondary",
                    lineHeight: 1.5,
                  }}
                >
                  {paymentMessage}
                </Typography>
              </Box>
            </Stack>

            <IconButton
              onClick={handleExit}
              sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2.5}>
            <CashierTicketPreviewCard
              ticket={ticket}
              sale={sale}
              order={order}
              table={table}
              settlement={settlement}
              ticketWarning={ticketWarning}
              ticketErrorCode={ticketErrorCode}
              ticketErrorMessage={ticketErrorMessage}
            />

            <CashierTicketWhatsappCard
              ticketAvailable={ticketAvailable}
              customerSummary={customerSummary}
              onSendWhatsapp={onSendWhatsapp}
              busy={busyWhatsapp}
            />

            {thermalPrintEnabled ? (
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.default",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  Impresión térmica habilitada
                </Typography>

                <Typography
                  sx={{
                    mt: 0.35,
                    fontSize: 13,
                    color: "text.secondary",
                    lineHeight: 1.5,
                  }}
                >
                  {`Esta sucursal tiene habilitada la impresión directa mediante ${thermalPrintAppName}.`}
                </Typography>
              </Box>
            ) : null}

            <CashierTicketActionsBar
              onView={onViewTicket}
              onPrint={onPrintTicket}
              onThermalPrint={onThermalPrintTicket}
              onDownload={onDownloadTicket}
              onContinue={handleExit}
              loadingView={busyView}
              loadingPrint={busyPrint}
              loadingThermalPrint={busyThermalPrint}
              loadingDownload={busyDownload}
              ticketAvailable={ticketAvailable}
              thermalPrintEnabled={thermalPrintEnabled}
            />
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}