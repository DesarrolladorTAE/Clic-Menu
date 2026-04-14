import React from "react";
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";

import CashierTicketPreviewCard from "./CashierTicketPreviewCard";
import CashierTicketActionsBar from "./CashierTicketActionsBar";

export default function CashierPostPaymentTicketModal({
  open,
  onClose,
  onContinue,
  onViewTicket,
  onPrintTicket,
  onDownloadTicket,
  busyView = false,
  busyPrint = false,
  busyDownload = false,
  ticket = null,
  sale = null,
  order = null,
  table = null,
  ticketWarning = false,
  ticketErrorCode = null,
  ticketErrorMessage = null,
}) {
  const ticketAvailable = Boolean(ticket?.id);

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === "backdropClick") return;
        onClose?.();
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
            <Stack direction="row" spacing={1.5} alignItems="center">
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
                  Cobro realizado
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 14,
                    color: "text.secondary",
                    lineHeight: 1.5,
                  }}
                >
                  {ticketAvailable
                    ? "La venta se cerró correctamente y el ticket ya quedó listo."
                    : "La venta se cerró correctamente. Revisa el detalle del ticket en este resumen."}
                </Typography>
              </Box>
            </Stack>

            <IconButton
              onClick={onClose}
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
              ticketWarning={ticketWarning}
              ticketErrorCode={ticketErrorCode}
              ticketErrorMessage={ticketErrorMessage}
            />

            <CashierTicketActionsBar
              onView={onViewTicket}
              onPrint={onPrintTicket}
              onDownload={onDownloadTicket}
              onContinue={onContinue}
              loadingView={busyView}
              loadingPrint={busyPrint}
              loadingDownload={busyDownload}
              ticketAvailable={ticketAvailable}
            />
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
