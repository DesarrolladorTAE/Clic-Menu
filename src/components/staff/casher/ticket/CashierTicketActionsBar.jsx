// src/components/staff/casher/ticket/CashierTicketActionsBar.jsx
import React from "react";
import { Button, Stack } from "@mui/material";

import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EastRoundedIcon from "@mui/icons-material/EastRounded";

export default function CashierTicketActionsBar({
  onView,
  onPrint,
  onThermalPrint,
  onReprintNetpayVoucher,
  onDownload,
  onContinue,
  loadingView = false,
  loadingPrint = false,
  loadingThermalPrint = false,
  loadingVoucherReprint = false,
  loadingDownload = false,
  disabled = false,
  asyncOperationBusy = false,
  ticketAvailable = true,
  thermalPrintEnabled = false,
  voucherReprintAvailable = false,
}) {
  const actionBlocked = disabled || asyncOperationBusy;
  const ticketDisabled = actionBlocked || !ticketAvailable;

  const thermalPrintDisabled =
    ticketDisabled ||
    !thermalPrintEnabled ||
    loadingThermalPrint;

  const voucherReprintDisabled =
    actionBlocked ||
    !voucherReprintAvailable ||
    loadingVoucherReprint;

  return (
    <Stack spacing={1.5}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ width: "100%" }}
      >
        <Button
          variant="outlined"
          startIcon={<VisibilityRoundedIcon />}
          onClick={onView}
          disabled={ticketDisabled || loadingView}
          sx={{
            flex: 1,
            height: 44,
            borderRadius: 2,
            fontWeight: 800,
          }}
        >
          {loadingView ? "Abriendo…" : "Ver ticket"}
        </Button>

        <Button
          variant="outlined"
          startIcon={<PrintRoundedIcon />}
          onClick={onPrint}
          disabled={ticketDisabled || loadingPrint}
          sx={{
            flex: 1,
            height: 44,
            borderRadius: 2,
            fontWeight: 800,
          }}
        >
          {loadingPrint ? "Imprimiendo…" : "Imprimir"}
        </Button>

        <Button
          variant="outlined"
          startIcon={<ReceiptLongRoundedIcon />}
          onClick={onThermalPrint}
          disabled={thermalPrintDisabled}
          sx={{
            flex: 1,
            height: 44,
            borderRadius: 2,
            fontWeight: 800,
          }}
        >
          {loadingThermalPrint
            ? "Enviando…"
            : "Imprimir térmico"}
        </Button>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ width: "100%" }}
      >
        <Button
          variant="outlined"
          startIcon={<DownloadRoundedIcon />}
          onClick={onDownload}
          disabled={ticketDisabled || loadingDownload}
          sx={{
            flex: 1,
            height: 44,
            borderRadius: 2,
            fontWeight: 800,
          }}
        >
          {loadingDownload ? "Descargando…" : "Descargar PDF"}
        </Button>

        {voucherReprintAvailable ? (
          <Button
            variant="outlined"
            startIcon={<ReplayRoundedIcon />}
            onClick={onReprintNetpayVoucher}
            disabled={voucherReprintDisabled}
            sx={{
              flex: 1,
              height: 44,
              borderRadius: 2,
              fontWeight: 800,
            }}
          >
            {loadingVoucherReprint
              ? "Reimprimiendo…"
              : "Reimprimir voucher NetPay"}
          </Button>
        ) : null}

        <Button
          variant="contained"
          endIcon={<EastRoundedIcon />}
          onClick={onContinue}
          disabled={actionBlocked}
          sx={{
            flex: 1,
            height: 44,
            borderRadius: 2,
            fontWeight: 800,
          }}
        >
          Volver a Mis ventas
        </Button>
      </Stack>
    </Stack>
  );
}