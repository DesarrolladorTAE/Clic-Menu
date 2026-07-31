import React from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import AssignmentReturnRoundedIcon from "@mui/icons-material/AssignmentReturnRounded";

export default function CashierReleaseSaleDialog({
  open,
  sale,
  submitting = false,
  onClose,
  onConfirm,
}) {
  const groupId = Number(sale?.order_billing_group_id || 0);
  const saleId = Number(sale?.sale_id || 0);

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ fontWeight: 800 }}>
        Liberar venta{saleId ? ` #${saleId}` : ""}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography
            sx={{
              fontSize: 14,
              color: "text.primary",
              lineHeight: 1.6,
            }}
          >
            La venta quedará disponible para otra caja. Las cuentas y
            divisiones existentes se conservarán.
          </Typography>

          <Alert severity="warning">
            Después de liberarla, ya no podrás continuar su cobro hasta que
            vuelva a ser tomada por una caja.
          </Alert>

          {!groupId ? (
            <Alert severity="error">
              Esta venta no tiene un grupo financiero y no puede liberarse
              desde este flujo.
            </Alert>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          color="inherit"
          onClick={onClose}
          disabled={submitting}
          sx={{ fontWeight: 800 }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          color="warning"
          disabled={!groupId || submitting}
          onClick={() => onConfirm?.(sale)}
          startIcon={
            submitting ? (
              <CircularProgress size={17} color="inherit" />
            ) : (
              <AssignmentReturnRoundedIcon />
            )
          }
          sx={{
            minWidth: 150,
            borderRadius: 2,
            fontWeight: 800,
          }}
        >
          {submitting ? "Liberando…" : "Liberar venta"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
