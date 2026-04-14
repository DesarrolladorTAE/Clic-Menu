import React from "react";
import { Button, Stack } from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EastRoundedIcon from "@mui/icons-material/EastRounded";

export default function CashierTicketActionsBar({
  onView,
  onPrint,
  onDownload,
  onContinue,
  loadingView = false,
  loadingPrint = false,
  loadingDownload = false,
  disabled = false,
  ticketAvailable = true,
}) {
  const ticketDisabled = disabled || !ticketAvailable;

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

        <Button
          variant="contained"
          endIcon={<EastRoundedIcon />}
          onClick={onContinue}
          disabled={disabled}
          sx={{
            flex: 1,
            height: 44,
            borderRadius: 2,
            fontWeight: 800,
          }}
        >
          Volver a la cola
        </Button>
      </Stack>
    </Stack>
  );
}
