// src/components/staff/casher/queuePage/CashierReleaseSaleDialog.jsx
import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import AssignmentReturnRoundedIcon from "@mui/icons-material/AssignmentReturnRounded";

import CashierDialogShell from "../shared/CashierDialogShell";

export default function CashierReleaseSaleDialog({
  open,
  sale,
  submitting = false,
  onClose,
  onConfirm,
}) {
  const groupId = Number(sale?.order_billing_group_id || 0);
  const saleId = Number(sale?.sale_id || 0);
  const checksCount = Number(
    sale?.counts?.active_checks ??
      sale?.counts?.checks_total ??
      sale?.checks?.length ??
      0
  );

  return (
    <CashierDialogShell
      open={open}
      title={`Liberar venta${saleId ? ` #${saleId}` : ""}`}
      description="Devuelve el paquete financiero completo a la cola de ventas disponibles."
      icon={<AssignmentReturnRoundedIcon />}
      busy={submitting}
      maxWidth="sm"
      onClose={onClose}
    >
      <Card
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          boxShadow: "none",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2, sm: 3 },
            "&:last-child": {
              pb: { xs: 2, sm: 3 },
            },
          }}
        >
          <Stack spacing={2.5}>
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: 18, sm: 20 },
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                Confirmar liberación
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: "text.secondary",
                }}
              >
                Las cuentas y divisiones existentes se conservarán. La venta
                podrá ser tomada posteriormente por otra caja.
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.default",
              }}
            >
              <Stack spacing={1}>
                <InfoRow
                  label="Venta representativa"
                  value={saleId ? `#${saleId}` : "No disponible"}
                />

                <Divider />

                <InfoRow
                  label="Paquete financiero"
                  value={groupId ? `#${groupId}` : "No disponible"}
                />

                <Divider />

                <InfoRow
                  label="Cuentas conservadas"
                  value={String(checksCount)}
                />
              </Stack>
            </Box>

            <Alert
              severity="warning"
              variant="outlined"
              sx={{ minWidth: 0 }}
            >
              Después de liberarla, esta caja no podrá continuar el cobro
              hasta que la venta vuelva a ser tomada.
            </Alert>

            {!groupId ? (
              <Alert
                severity="error"
                variant="outlined"
                sx={{ minWidth: 0 }}
              >
                Esta venta no tiene un grupo financiero y no puede liberarse
                desde este flujo.
              </Alert>
            ) : null}

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              justifyContent="flex-end"
              spacing={1.5}
              pt={0.5}
            >
              <Button
                type="button"
                variant="outlined"
                onClick={onClose}
                disabled={submitting}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  minWidth: { sm: 140 },
                }}
              >
                Cancelar
              </Button>

              <Button
                type="button"
                variant="contained"
                color="secondary"
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
                  width: { xs: "100%", sm: "auto" },
                  minWidth: { sm: 180 },
                }}
              >
                {submitting ? "Liberando…" : "Liberar venta"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </CashierDialogShell>
  );
}

function InfoRow({ label, value }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={1}
    >
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 700,
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 800,
          color: "text.primary",
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
