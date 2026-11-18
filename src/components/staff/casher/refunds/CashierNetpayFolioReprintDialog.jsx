//src/components/staff/casher/refunds/CashierNetpayFolioReprintDialog.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box, Button, Card, CardContent, Checkbox, Chip, CircularProgress,
  Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton,
  Radio, RadioGroup, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";

import PaginationFooter from "../../../common/PaginationFooter";

import { fetchNetpayFolioReprints } from "../../../../services/staff/casher/netpayTransaction.service";
import {
  closeCashierNetpayFolioReprintReview,
  executeCashierNetpayFolioReprint,
  getCashierPendingNetpayFolioReprint,
} from "../../../../services/staff/casher/cashierNetpayFolioReprint.service";
import { isNetpayBridgeAvailable } from "../../../../services/native/netpayBridge.service";

const PAGE_SIZE = 5;

const BANK_STATUS_LABELS = {
  approved: "Aprobada",
  declined: "Declinada",
  cancelled: "Cancelada",
  reversed: "Reversada",
  pending_reversal: "Reverso pendiente",
  no_record: "Sin registro",
  uncertain: "Sin confirmar",
  not_sent: "No ejecutada",
};

const OPERATION_STATUS_LABELS = {
  pending: "Consulta pendiente",
  completed: "Consulta registrada",
  review_required: "Revisión necesaria",
  review_closed: "Revisión cerrada",
};

const LOCAL_STATUS_LABELS = {
  pending: "Pendiente",
  finalized: "Finalizada",
  not_required: "Sin pago aplicado",
  error: "Con incidencia",
};

const moneyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Mexico_City",
});

function formatMoney(value) {
  const amount = Number(value);
  return moneyFormatter.format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value) {
  if (!value) return "Sin fecha";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Sin fecha" : dateFormatter.format(date);
}

function bankStatusLabel(value) {
  return BANK_STATUS_LABELS[String(value || "").toLowerCase()] || "Sin confirmar";
}

function operationStatusLabel(value) {
  return OPERATION_STATUS_LABELS[String(value || "").toLowerCase()] || "Sin consultas previas";
}

function bankStatusColor(value) {
  const status = String(value || "").toLowerCase();
  if (status === "approved") return "success";
  if (status === "declined" || status === "cancelled" || status === "reversed") return "error";
  return "warning";
}

function operationNeedsReview(row) {
  return row?.last_folio_reprint?.review_required === true;
}

function validId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function pickError(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

const actionButtonSx = {
  width: 44,
  height: 44,
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  bgcolor: "background.paper",
  color: "text.primary",
  flexShrink: 0,
  "&:hover": {
    bgcolor: "action.hover",
  },
  "&.Mui-disabled": {
    borderColor: "divider",
    bgcolor: "action.disabledBackground",
    color: "action.disabled",
  },
};

export default function CashierNetpayFolioReprintDialog({
  open = false,
  onClose,
  onNotify,
  reloadToken = 0,
  onChanged,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const [pendingLocal, setPendingLocal] = useState(null);

  const [reviewRow, setReviewRow] = useState(null);
  const [reviewResolution, setReviewResolution] = useState("");
  const [reviewReason, setReviewReason] = useState("");
  const [terminalChecked, setTerminalChecked] = useState(false);

  const requestSequenceRef = useRef(0);
  const notifyRef = useRef(onNotify);
  const changedRef = useRef(onChanged);
  const previousReloadRef = useRef(reloadToken);

  notifyRef.current = onNotify;
  changedRef.current = onChanged;

  const nativeAvailable = isNetpayBridgeAvailable();
  const busy = busyId !== null;

  const notify = (severity, message, title = "") => {
    if (!message) return;
    notifyRef.current?.({ severity, message, title });
  };

  const refreshPendingLocal = useCallback(() => {
    try {
      setPendingLocal(getCashierPendingNetpayFolioReprint());
    } catch {
      // El historial debe seguir disponible aunque Android no responda.
      setPendingLocal({
        available: false,
        hasPendingOperation: false,
        isFolioReprint: false,
        operation: null,
      });
    }
  }, []);

  const loadHistory = useCallback(async (targetPage, { silent = false } = {}) => {
    const sequence = ++requestSequenceRef.current;
    if (!silent) setLoading(true);

    try {
      const response = await fetchNetpayFolioReprints(targetPage, PAGE_SIZE);

      if (sequence !== requestSequenceRef.current) return;

      if (response?.ok !== true || !Array.isArray(response?.data)) {
        throw new Error(
          response?.message || "No se recibió correctamente el historial de operaciones NetPay."
        );
      }

      const info = response.pagination || {};
      const lastPage = Math.max(1, Number(info.last_page) || 1);

      setRows(response.data);
      setPagination({
        current_page: Math.max(1, Number(info.current_page) || targetPage),
        last_page: lastPage,
        total: Math.max(0, Number(info.total) || 0),
      });

      if (targetPage > lastPage) {
        setPage(lastPage);
      }
    } catch (error) {
      if (sequence !== requestSequenceRef.current) return;

      if (!silent) {
        notifyRef.current?.({
          severity: "error",
          title: "No se pudo consultar",
          message: pickError(error, "No se pudo cargar el historial NetPay."),
        });
      }
    } finally {
      if (sequence === requestSequenceRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    setPage(1);
    setSelectedId(null);
    setReviewRow(null);
    setReviewResolution("");
    setReviewReason("");
    setTerminalChecked(false);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    loadHistory(page);
    refreshPendingLocal();

    const timer = setInterval(() => {
      if (document.visibilityState !== "visible") return;

      loadHistory(page, { silent: true });
      refreshPendingLocal();
    }, 12000);

    return () => {
      clearInterval(timer);
      requestSequenceRef.current += 1;
    };
  }, [open, page, loadHistory, refreshPendingLocal]);

  useEffect(() => {
    if (!open) {
      previousReloadRef.current = reloadToken;
      return;
    }

    if (previousReloadRef.current === reloadToken) return;

    previousReloadRef.current = reloadToken;
    loadHistory(page, { silent: true });
    refreshPendingLocal();
  }, [open, page, reloadToken, loadHistory, refreshPendingLocal]);

  const selectedRow = rows.find(
    (row) => Number(row?.netpay_transaction_id) === Number(selectedId)
  ) || null;

  const localOperation = pendingLocal?.isFolioReprint
    ? pendingLocal.operation
    : null;

  const hasLocalPending = pendingLocal?.hasPendingOperation === true;
  const hasPendingOutsidePage =
    localOperation &&
    !rows.some(
      (row) => Number(row?.netpay_transaction_id) === Number(localOperation.netpayTransactionId)
    );

  const canCloseReview = Boolean(
    reviewRow &&
    validId(reviewRow.sale_id) &&
    validId(reviewRow.netpay_transaction_id) &&
    reviewRow.last_folio_reprint?.operation_uuid &&
    ["confirmed_printed", "confirmed_not_printed"].includes(reviewResolution) &&
    terminalChecked &&
    reviewReason.trim().length >= 10 &&
    reviewReason.trim().length <= 500 &&
    !busy
  );

  const canReprint = (row) => {
    const status = String(row?.bank_status || "").toLowerCase();
    const operationStatus = String(row?.last_folio_reprint?.status || "");

    return (
      nativeAvailable &&
      !busy &&
      !hasLocalPending &&
      ["approved", "declined"].includes(status) &&
      !["pending", "review_required"].includes(operationStatus)
    );
  };

  const handleSelect = (row) => {
    const id = validId(row?.netpay_transaction_id);
    setSelectedId((previous) => (previous === id ? null : id));
  };

  const handleReprint = async (row) => {
    if (!canReprint(row)) return;

    const transactionId = validId(row?.netpay_transaction_id);
    if (!transactionId) return;

    setBusyId(`reprint-${transactionId}`);

    try {
      const result = await executeCashierNetpayFolioReprint({
        saleId: row.sale_id,
        netpayTransactionId: transactionId,
        environment: row.environment,
      });

      if (result.outcome === "already_registered") {
        notify(
          "warning",
          result.message,
          "Solicitud ya registrada"
        );
      } else if (result.outcome === "review_pending") {
        notify(
          "warning",
          result.message,
          "Revisión necesaria"
        );
      }

      await loadHistory(page, { silent: true });
      refreshPendingLocal();
      changedRef.current?.();
    } catch (error) {
      const status = Number(error?.response?.status || 0);

      notify(
        [409, 422].includes(status) ? "warning" : "error",
        pickError(error, "No fue posible solicitar la reimpresión NetPay."),
        "No se pudo reimprimir"
      );

      await loadHistory(page, { silent: true });
      refreshPendingLocal();
    } finally {
      setBusyId(null);
    }
  };

  const openReview = (row) => {
    if (busy || !row?.last_folio_reprint?.operation_uuid) return;

    setReviewRow(row);
    setReviewResolution("");
    setReviewReason("");
    setTerminalChecked(false);
  };

  const closeReviewDialog = () => {
    if (busy) return;

    setReviewRow(null);
    setReviewResolution("");
    setReviewReason("");
    setTerminalChecked(false);
  };

  const handleCloseReview = async () => {
    if (!canCloseReview) return;

    const transactionId = Number(reviewRow.netpay_transaction_id);
    setBusyId(`review-${transactionId}`);

    try {
      const result = await closeCashierNetpayFolioReprintReview({
        saleId: reviewRow.sale_id,
        netpayTransactionId: transactionId,
        operationUuid: reviewRow.last_folio_reprint.operation_uuid,
        resolution: reviewResolution,
        terminalChecked,
        reason: reviewReason.trim(),
      });

      notify(
        result.localReleasePending ? "warning" : "success",
        result.message,
        result.localReleasePending ? "Revisión registrada con aviso" : "Revisión cerrada"
      );

      setReviewRow(null);
      setReviewResolution("");
      setReviewReason("");
      setTerminalChecked(false);

      await loadHistory(page, { silent: true });
      refreshPendingLocal();
      changedRef.current?.();
    } catch (error) {
      const status = Number(error?.response?.status || 0);

      notify(
        [409, 422].includes(status) ? "warning" : "error",
        pickError(error, "No fue posible registrar el cierre de la revisión."),
        "No se pudo cerrar la revisión"
      );
    } finally {
      setBusyId(null);
    }
  };

  const handlePageChange = (nextPage) => {
    if (loading || busy || nextPage < 1 || nextPage > pagination.last_page) return;

    setSelectedId(null);
    setPage(nextPage);
  };

  const renderActions = (row) => (
    <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: "flex-end", md: "flex-end" }} sx={{ width: "100%" }}>
      <IconButton
        onClick={() => handleSelect(row)}
        disabled={busy}
        aria-label={selectedId === row.netpay_transaction_id ? "Ocultar detalle" : "Ver detalle"}
        title={selectedId === row.netpay_transaction_id ? "Ocultar detalle" : "Ver detalle"}
        sx={{
          ...actionButtonSx,
          bgcolor: selectedId === row.netpay_transaction_id ? "#EAF2FA" : "background.paper",
          color: "text.primary",
        }}
      >
        <VisibilityRoundedIcon sx={{ fontSize: 22 }} />
      </IconButton>

      {operationNeedsReview(row) ? (
        <IconButton
          onClick={() => openReview(row)}
          disabled={busy}
          aria-label="Revisar operación"
          title="Revisar operación"
          sx={{
            ...actionButtonSx,
            color: "warning.main",
            borderColor: "warning.light",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <FactCheckRoundedIcon sx={{ fontSize: 22 }} />
        </IconButton>
      ) : (
        <IconButton
          onClick={() => handleReprint(row)}
          disabled={!canReprint(row)}
          aria-label="Reimprimir comprobante"
          title="Reimprimir comprobante"
          sx={{
            ...actionButtonSx,
            color: "primary.main",
            borderColor: "primary.main",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          {busyId === `reprint-${row.netpay_transaction_id}`
            ? <CircularProgress size={20} color="inherit" />
            : <PrintRoundedIcon sx={{ fontSize: 22 }} />}
        </IconButton>
      )}
    </Stack>
  );

  if (!open) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={busy ? undefined : onClose}
        fullWidth
        maxWidth="lg"
        fullScreen={isMobile}
        slotProps={{
          paper: {
            sx: {
              borderRadius: { xs: 0, md: 1 },
              overflow: "hidden",
              backgroundColor: "background.paper",
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
      >
        <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: 2, bgcolor: "#111111", color: "#fff", flexShrink: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: 20, sm: 24 }, lineHeight: 1.2, color: "#fff" }}>
                Operaciones NetPay
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 13, color: "rgba(255,255,255,0.82)", lineHeight: 1.5 }}>
                Consulta los intentos de cobro y sus comprobantes bancarios.
              </Typography>
            </Box>

            <IconButton
              onClick={onClose}
              disabled={busy}
              aria-label="Cerrar operaciones NetPay"
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.08)",
                borderRadius: 1,
                flexShrink: 0,
                "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
                "&.Mui-disabled": { color: "rgba(255,255,255,0.35)" },
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default", overflowY: "auto" }}>
          <Card sx={{ borderRadius: 0, bgcolor: "background.paper", boxShadow: "none" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 }, "&:last-child": { pb: { xs: 2, sm: 3 } } }}>
              <Stack spacing={2.5}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1.5}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: 18, sm: 20 }, color: "text.primary" }}>
                      Historial de intentos
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5, lineHeight: 1.5 }}>
                      Se muestran cobros aprobados y declinados de esta sucursal.
                    </Typography>
                  </Box>

                  <Chip
                    icon={<ReceiptLongRoundedIcon />}
                    label={`${pagination.total} ${pagination.total === 1 ? "operación" : "operaciones"}`}
                    variant="outlined"
                    sx={{ fontWeight: 700, borderRadius: 1, flexShrink: 0 }}
                  />
                </Stack>

                {!nativeAvailable ? (
                  <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, bgcolor: "background.default", px: 2, py: 1.5 }}>
                    <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.6 }}>
                      Puedes consultar el historial desde aquí. Para reimprimir comprobantes,
                      abre esta pantalla desde una terminal NetPay compatible.
                    </Typography>
                  </Box>
                ) : null}

                {hasPendingOutsidePage ? (
                  <Card sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, bgcolor: "background.default", boxShadow: "none" }}>
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "stretch", sm: "center" }}
                        spacing={1.5}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: 14, color: "text.primary" }}>
                            Consulta pendiente en esta terminal
                          </Typography>
                          <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5, overflowWrap: "anywhere" }}>
                            Venta #{localOperation.saleId} · intento NetPay #{localOperation.netpayTransactionId}
                          </Typography>
                        </Box>

                        {localOperation.localState === "requires_review" ? (
                          <Button
                            variant="outlined"
                            color="warning"
                            disabled={busy}
                            startIcon={<FactCheckRoundedIcon />}
                            onClick={() => openReview({
                              sale_id: localOperation.saleId,
                              netpay_transaction_id: localOperation.netpayTransactionId,
                              last_folio_reprint: { operation_uuid: localOperation.operationUuid },
                            })}
                            sx={{ height: 42, borderRadius: 2, fontWeight: 800, textTransform: "none", flexShrink: 0 }}
                          >
                            Registrar revisión
                          </Button>
                        ) : (
                          <Chip label="Pendiente de confirmación" color="warning" size="small" sx={{ fontWeight: 700, alignSelf: { xs: "flex-start", sm: "center" } }} />
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                ) : null}

                <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, bgcolor: "background.paper", overflow: "hidden", minWidth: 0 }}>
                  {loading ? (
                    <Box sx={{ minHeight: 220, display: "grid", placeItems: "center", p: 3 }}>
                      <Stack alignItems="center" spacing={1.5}>
                        <CircularProgress size={30} />
                        <Typography sx={{ fontSize: 13, color: "text.secondary", textAlign: "center" }}>
                          Cargando operaciones NetPay…
                        </Typography>
                      </Stack>
                    </Box>
                  ) : rows.length === 0 ? (
                    <Box sx={{ minHeight: 200, display: "grid", placeItems: "center", p: 3, textAlign: "center" }}>
                      <Stack spacing={1} alignItems="center">
                        <ReceiptLongRoundedIcon sx={{ fontSize: 38, color: "text.disabled" }} />
                        <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
                          Sin operaciones registradas
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                          No se encontraron intentos aprobados o declinados.
                        </Typography>
                      </Stack>
                    </Box>
                  ) : isMobile ? (
                    <Stack spacing={1.5} sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: "background.default" }}>
                      {rows.map((row) => (
                        <Card
                          key={row.netpay_transaction_id}
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            boxShadow: "none",
                            bgcolor: selectedId === row.netpay_transaction_id ? "#EAF2FA" : "background.paper",
                          }}
                        >
                          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                            <Stack spacing={1.75}>
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography sx={{ fontSize: 17, fontWeight: 800, color: "text.primary" }}>
                                    Venta #{row.sale_id}
                                  </Typography>
                                  <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.35 }}>
                                    Intento {row.attempt_number}
                                  </Typography>
                                </Box>

                                <Chip
                                  size="small"
                                  color={bankStatusColor(row.bank_status)}
                                  label={bankStatusLabel(row.bank_status)}
                                  sx={{ fontWeight: 800, flexShrink: 0 }}
                                />
                              </Stack>

                              <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 1.5 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                                    Importe
                                  </Typography>
                                  <Typography sx={{ fontSize: 19, fontWeight: 800, color: "text.primary" }}>
                                    {formatMoney(row.expected_total)}
                                  </Typography>
                                </Stack>

                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mt: 1 }}>
                                  <Typography sx={{ fontSize: 13, color: "text.secondary", flexShrink: 0 }}>
                                    Fecha
                                  </Typography>
                                  <Typography sx={{ fontSize: 13, color: "text.primary", textAlign: "right" }}>
                                    {formatDate(row.netpay_transaction_at || row.created_at)}
                                  </Typography>
                                </Stack>
                              </Box>

                              {row.last_folio_reprint ? (
                                <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 1.5 }}>
                                  <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}>
                                    Última consulta: {operationStatusLabel(row.last_folio_reprint.status)}
                                  </Typography>
                                </Box>
                              ) : null}

                              <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 1.5 }}>
                                {renderActions(row)}
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    <TableContainer sx={{ width: "100%", bgcolor: "background.paper" }}>
                      <Table size="small" sx={{ minWidth: 750 }}>
                        <TableHead>
                          <TableRow sx={{ bgcolor: "#FF9800" }}>
                            <TableCell sx={{ fontSize: 14, fontWeight: 800, color: "#fff", py: 2, px: 2.5, borderBottom: "none", width: "21%" }}>
                              Venta / intento
                            </TableCell>
                            <TableCell sx={{ fontSize: 14, fontWeight: 800, color: "#fff", py: 2, px: 2, borderBottom: "none", width: "23%" }}>
                              Resultado original
                            </TableCell>
                            <TableCell sx={{ fontSize: 14, fontWeight: 800, color: "#fff", py: 2, px: 2, borderBottom: "none", width: "15%" }}>
                              Importe
                            </TableCell>
                            <TableCell sx={{ fontSize: 14, fontWeight: 800, color: "#fff", py: 2, px: 2, borderBottom: "none", width: "24%" }}>
                              Fecha
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: 14, fontWeight: 800, color: "#fff", py: 2, px: 2.5, borderBottom: "none", width: "17%" }}>
                              Acciones
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {rows.map((row) => (
                            <TableRow
                              key={row.netpay_transaction_id}
                              hover
                              sx={{
                                bgcolor: selectedId === row.netpay_transaction_id ? "#EAF2FA" : "background.paper",
                                "& td": { borderBottom: "1px solid", borderColor: "divider" },
                                "&:last-child td": { borderBottom: 0 },
                              }}
                            >
                              <TableCell sx={{ px: 2.5, py: 2 }}>
                                <Typography sx={{ fontSize: 17, fontWeight: 800, color: "text.primary", lineHeight: 1.35 }}>
                                  Venta #{row.sale_id}
                                </Typography>
                                <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.4 }}>
                                  Intento {row.attempt_number}
                                </Typography>
                              </TableCell>

                              <TableCell sx={{ px: 2, py: 2 }}>
                                <Stack spacing={0.75} alignItems="flex-start">
                                  <Chip
                                    size="small"
                                    color={bankStatusColor(row.bank_status)}
                                    label={bankStatusLabel(row.bank_status)}
                                    sx={{ fontWeight: 800 }}
                                  />
                                  {row.last_folio_reprint ? (
                                    <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.4 }}>
                                      {operationStatusLabel(row.last_folio_reprint.status)}
                                    </Typography>
                                  ) : null}
                                </Stack>
                              </TableCell>

                              <TableCell sx={{ px: 2, py: 2 }}>
                                <Typography sx={{ fontSize: 15, fontWeight: 700, color: "text.primary", whiteSpace: "nowrap" }}>
                                  {formatMoney(row.expected_total)}
                                </Typography>
                              </TableCell>

                              <TableCell sx={{ px: 2, py: 2 }}>
                                <Typography sx={{ fontSize: 13, color: "text.primary", lineHeight: 1.5 }}>
                                  {formatDate(row.netpay_transaction_at || row.created_at)}
                                </Typography>
                              </TableCell>

                              <TableCell align="right" sx={{ px: 2.5, py: 2 }}>
                                {renderActions(row)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  {pagination.total > 0 ? (
                    <PaginationFooter
                      page={pagination.current_page}
                      totalPages={pagination.last_page}
                      startItem={Math.min((pagination.current_page - 1) * PAGE_SIZE + 1, pagination.total)}
                      endItem={Math.min(pagination.current_page * PAGE_SIZE, pagination.total)}
                      total={pagination.total}
                      hasPrev={!loading && !busy && page > 1}
                      hasNext={!loading && !busy && page < pagination.last_page}
                      onPrev={() => handlePageChange(page - 1)}
                      onNext={() => handlePageChange(page + 1)}
                      itemLabel="operaciones"
                    />
                  ) : null}
                </Box>

                {selectedRow ? (
                  <Card sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, boxShadow: "none", bgcolor: "background.paper" }}>
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: { xs: 17, sm: 19 }, fontWeight: 800, color: "text.primary" }}>
                              Detalle del intento
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.4 }}>
                              Información de la operación bancaria seleccionada.
                            </Typography>
                          </Box>

                          <IconButton
                            size="small"
                            onClick={() => setSelectedId(null)}
                            aria-label="Cerrar detalle"
                            sx={{
                              color: "text.primary",
                              bgcolor: "background.default",
                              borderRadius: 1,
                              flexShrink: 0,
                              "&:hover": { bgcolor: "action.hover" },
                            }}
                          >
                            <CloseRoundedIcon fontSize="small" />
                          </IconButton>
                        </Stack>

                        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>
                          <DetailField label="Venta" value={`#${selectedRow.sale_id}`} />
                          <DetailField label="Número de intento" value={selectedRow.attempt_number} />
                          <DetailField label="Importe" value={formatMoney(selectedRow.expected_total)} />
                          <DetailField label="Estado original" value={bankStatusLabel(selectedRow.bank_status)} />
                          <DetailField label="Estado de la venta" value={LOCAL_STATUS_LABELS[selectedRow.local_status] || "Sin confirmar"} />
                          <DetailField label="Terminal" value={selectedRow.terminal_name || `Terminal #${selectedRow.netpay_terminal_id}`} />
                          <DetailField label="Folio de la operación" value={selectedRow.folio || "Sin folio"} />
                          <DetailField label="Referencia bancaria" value={selectedRow.netpay_order_id || "Sin referencia"} />
                          <DetailField
                            label="Fecha del intento"
                            value={formatDate(selectedRow.netpay_transaction_at || selectedRow.created_at)}
                          />
                          <DetailField
                            label="Última consulta"
                            value={operationStatusLabel(selectedRow.last_folio_reprint?.status)}
                          />
                        </Box>

                        {selectedRow.last_folio_reprint ? (
                          <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2 }}>
                            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary", mb: 2 }}>
                              Resultado de la última consulta
                            </Typography>

                            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>
                              <DetailField
                                label="Resultado observado"
                                value={
                                  selectedRow.last_folio_reprint.observed_status
                                    ? bankStatusLabel(selectedRow.last_folio_reprint.observed_status)
                                    : "Sin respuesta registrada"
                                }
                              />
                              <DetailField
                                label="Comprobante"
                                value={
                                  selectedRow.last_folio_reprint.reprint_success
                                    ? "Reimpresión confirmada"
                                    : "Reimpresión no confirmada"
                                }
                              />
                              <DetailField
                                label="Fecha de consulta"
                                value={formatDate(selectedRow.last_folio_reprint.requested_at)}
                              />
                              <DetailField
                                label="Fecha de respuesta"
                                value={formatDate(selectedRow.last_folio_reprint.responded_at)}
                              />
                            </Box>

                            {selectedRow.last_folio_reprint.message ? (
                              <Box sx={{ mt: 2, p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1, bgcolor: "background.default" }}>
                                <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.6, overflowWrap: "anywhere" }}>
                                  {selectedRow.last_folio_reprint.message}
                                </Typography>
                              </Box>
                            ) : null}
                          </Box>
                        ) : null}
                      </Stack>
                    </CardContent>
                  </Card>
                ) : null}

                <Stack direction={{ xs: "column-reverse", sm: "row" }} justifyContent="flex-end" spacing={1.5} sx={{ pt: 1 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={onClose}
                    disabled={busy}
                    sx={{
                      minWidth: { xs: "100%", sm: 150 },
                      height: 44,
                      borderRadius: 2,
                      fontWeight: 800,
                      textTransform: "none",
                    }}
                  >
                    Cerrar
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(reviewRow)}
        onClose={busy ? undefined : closeReviewDialog}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
        slotProps={{
          paper: {
            sx: {
              borderRadius: { xs: 0, md: 1 },
              overflow: "hidden",
              backgroundColor: "background.paper",
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
      >
        <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: 2, bgcolor: "#111111", color: "#fff", flexShrink: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: 20, sm: 24 }, lineHeight: 1.2, color: "#fff" }}>
                Cerrar revisión de comprobante
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 13, color: "rgba(255,255,255,0.82)", lineHeight: 1.5 }}>
                Registra el resultado de la revisión realizada en la terminal NetPay.
              </Typography>
            </Box>

            <IconButton
              onClick={closeReviewDialog}
              disabled={busy}
              aria-label="Cerrar revisión"
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.08)",
                borderRadius: 1,
                flexShrink: 0,
                "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
                "&.Mui-disabled": { color: "rgba(255,255,255,0.35)" },
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default", overflowY: "auto" }}>
          <Card sx={{ borderRadius: 0, bgcolor: "background.paper", boxShadow: "none" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 }, "&:last-child": { pb: { xs: 2, sm: 3 } } }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: { xs: 18, sm: 20 }, color: "text.primary" }}>
                    Datos de la revisión
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.6, mt: 1 }}>
                    Confirma qué ocurrió después de revisar físicamente la terminal.
                    Este registro no modifica el cobro original.
                  </Typography>
                </Box>

                <Box sx={{ width: "100%" }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary", mb: 1 }}>
                    Resultado de la revisión *
                  </Typography>

                  <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, bgcolor: "background.default", p: 1.5 }}>
                    <RadioGroup
                      value={reviewResolution}
                      onChange={(event) => setReviewResolution(event.target.value)}
                      sx={{ gap: 0.75 }}
                    >
                      <FormControlLabel
                        value="confirmed_printed"
                        control={<Radio size="small" />}
                        label={
                          <Typography sx={{ fontSize: 13, color: "text.primary", lineHeight: 1.5 }}>
                            La terminal imprimió el comprobante
                          </Typography>
                        }
                        disabled={busy}
                        sx={{ m: 0, alignItems: "center", "& .MuiRadio-root": { p: 1 } }}
                      />

                      <FormControlLabel
                        value="confirmed_not_printed"
                        control={<Radio size="small" />}
                        label={
                          <Typography sx={{ fontSize: 13, color: "text.primary", lineHeight: 1.5 }}>
                            La terminal no imprimió el comprobante
                          </Typography>
                        }
                        disabled={busy}
                        sx={{ m: 0, alignItems: "center", "& .MuiRadio-root": { p: 1 } }}
                      />
                    </RadioGroup>
                  </Box>
                </Box>

                <Box sx={{ width: "100%" }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary", mb: 1 }}>
                    Descripción de la revisión *
                  </Typography>

                  <TextField
                    placeholder="Describe qué verificaste y cuál fue el resultado."
                    value={reviewReason}
                    onChange={(event) => setReviewReason(event.target.value.slice(0, 500))}
                    multiline
                    rows={3}
                    fullWidth
                    disabled={busy}
                    helperText={`${reviewReason.trim().length}/500 caracteres · mínimo 10`}
                    inputProps={{ "aria-label": "Descripción de la revisión" }}
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 1, bgcolor: "background.default" },
                      "& .MuiInputBase-input": { fontSize: 14, lineHeight: 1.6 },
                      "& .MuiFormHelperText-root": { mx: 0, mt: 0.75, fontSize: 12 },
                    }}
                  />
                </Box>

                <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, bgcolor: "background.default", p: 1.5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={terminalChecked}
                        onChange={(event) => setTerminalChecked(event.target.checked)}
                        disabled={busy}
                        sx={{ p: 1 }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: 13, color: "text.primary", lineHeight: 1.6 }}>
                        Revisé la terminal y confirmé que no existe una operación en curso.
                      </Typography>
                    }
                    sx={{ alignItems: "flex-start", m: 0, width: "100%" }}
                  />
                </Box>

                <Stack
                  direction={{ xs: "column-reverse", sm: "row" }}
                  justifyContent="flex-end"
                  spacing={1.5}
                  sx={{ pt: 1 }}
                >
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={closeReviewDialog}
                    disabled={busy}
                    sx={{
                      minWidth: { xs: "100%", sm: 150 },
                      height: 44,
                      borderRadius: 2,
                      fontWeight: 800,
                      textTransform: "none",
                    }}
                  >
                    Volver
                  </Button>

                  <Button
                    type="button"
                    variant="contained"
                    onClick={handleCloseReview}
                    disabled={!canCloseReview}
                    startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <FactCheckRoundedIcon />}
                    sx={{
                      minWidth: { xs: "100%", sm: 180 },
                      height: 44,
                      borderRadius: 2,
                      fontWeight: 800,
                      textTransform: "none",
                    }}
                  >
                    Registrar cierre
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DetailField({ label, value }) {
  return (
    <Box sx={{ minWidth: 0, width: "100%" }}>
      <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5, lineHeight: 1.45 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary", lineHeight: 1.5, overflowWrap: "anywhere" }}>
        {value ?? "—"}
      </Typography>
    </Box>
  );
}