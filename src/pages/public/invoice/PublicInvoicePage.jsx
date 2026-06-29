import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";

import {
  getPublicInvoice,
  stampPublicInvoice,
} from "../../../services/public/publicInvoice.service";

import PublicInvoiceSummaryCard from "../../../components/public/invoice/PublicInvoiceSummaryCard";
import PublicInvoiceStatusCard from "../../../components/public/invoice/PublicInvoiceStatusCard";
import PublicInvoiceForm from "../../../components/public/invoice/PublicInvoiceForm";
import PublicInvoiceSuccessCard from "../../../components/public/invoice/PublicInvoiceSuccessCard";

import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";

function apiErrorToMessage(e, fallback = "Ocurrió un error") {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors
      ? Object.values(e.response.data.errors)
          .flat()
          .filter(Boolean)
          .join("\n")
      : "") ||
    e?.message ||
    fallback
  );
}

function normalizeErrors(errors) {
  if (!errors || typeof errors !== "object") return {};

  return Object.entries(errors).reduce((acc, [key, value]) => {
    acc[key] = Array.isArray(value) ? value : [String(value)];
    return acc;
  }, {});
}

function buildFallbackPayload(e, token) {
  const responseData = e?.response?.data;

  if (responseData && typeof responseData === "object") {
    return responseData;
  }

  return {
    ok: false,
    can_invoice: false,
    status: "network_error",
    message:
      e?.message ||
      "No fue posible consultar el ticket de facturación en este momento.",
    data: {
      sale_id: null,
      sale_total: null,
      sale_date: null,
      restaurant_name: null,
      expires_at: null,
      invoice_mode: null,
      can_invoice: false,
      status: "network_error",
      message:
        e?.message ||
        "No fue posible consultar el ticket de facturación en este momento.",
      token,
    },
  };
}

export default function PublicInvoicePage() {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [invoicePayload, setInvoicePayload] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const showAlert = ({
    severity = "error",
    title = "Error",
    message = "",
  }) => {
    setAlertState({
      open: true,
      severity,
      title,
      message,
    });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const invoiceData = useMemo(() => {
    return invoicePayload?.data || null;
  }, [invoicePayload]);

  const canInvoice = !!invoicePayload?.can_invoice;
  const currentStatus = invoicePayload?.status || invoiceData?.status || "";
  const currentMessage = invoicePayload?.message || invoiceData?.message || "";

  useEffect(() => {
    let alive = true;

    async function loadInvoice() {
      setLoading(true);
      setInvoicePayload(null);
      setSuccessData(null);
      setFieldErrors({});
      setSubmitError("");

      if (!token) {
        setInvoicePayload({
          ok: false,
          can_invoice: false,
          status: "not_found",
          message: "El ticket de facturación no existe.",
          data: null,
        });

        setLoading(false);
        return;
      }

      try {
        const payload = await getPublicInvoice(token);

        if (!alive) return;

        setInvoicePayload(payload);
      } catch (e) {
        if (!alive) return;

        setInvoicePayload(buildFallbackPayload(e, token));
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    loadInvoice();

    return () => {
      alive = false;
    };
  }, [token]);

  const handleStamp = async (payload) => {
    setSubmitting(true);
    setFieldErrors({});
    setSubmitError("");

    try {
      const response = await stampPublicInvoice(token, payload);

      if (response?.ok && response?.status === "stamped") {
        setSuccessData(response?.data || null);

        setInvoicePayload((prev) => ({
          ...(prev || {}),
          can_invoice: false,
          status: "stamped",
          message: response?.message || "Factura timbrada correctamente.",
          data: {
            ...(prev?.data || {}),
            can_invoice: false,
            status: "stamped",
            message: response?.message || "Factura timbrada correctamente.",
          },
        }));

        showAlert({
          severity: "success",
          title: "Factura timbrada",
          message: response?.message || "Factura timbrada correctamente.",
        });

        return;
      }

      const message =
        response?.message || "No fue posible timbrar la factura.";

      setSubmitError(message);

      showAlert({
        severity: "error",
        title: "No se pudo timbrar",
        message,
      });
    } catch (e) {
      const responseData = e?.response?.data;
      const errors = normalizeErrors(responseData?.errors);
      const message = apiErrorToMessage(
        e,
        "No fue posible timbrar la factura."
      );

      setFieldErrors(errors);
      setSubmitError(message);

      if (
        responseData &&
        responseData?.can_invoice === false &&
        responseData?.status !== "stamp_failed"
      ) {
        setInvoicePayload(responseData);
      }

      showAlert({
        severity: "error",
        title: "No se pudo timbrar",
        message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Box
          sx={{
            minHeight: "70vh",
            display: "grid",
            placeItems: "center",
            py: { xs: 3, sm: 4 },
          }}
        >
          <Paper
            sx={{
              width: "100%",
              maxWidth: 720,
              p: { xs: 3, sm: 4 },
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
              boxShadow: "none",
              textAlign: "center",
            }}
          >
            <Stack spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(255, 152, 0, 0.12)",
                  color: "primary.main",
                }}
              >
                <CircularProgress color="primary" size={30} />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: "text.primary",
                  }}
                >
                  Consultando ticket
                </Typography>

                <Typography
                  sx={{
                    mt: 0.75,
                    fontSize: 14,
                    color: "text.secondary",
                  }}
                >
                  Estamos verificando si tu ticket está disponible para
                  facturación.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Stack spacing={3} alignItems="center">
          <Paper
            sx={{
              width: "100%",
              p: { xs: 2.5, sm: 3 },
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
              boxShadow: "none",
              overflow: "hidden",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(255,152,0,0.14), rgba(255,255,255,0) 48%)",
                pointerEvents: "none",
              },
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={2}
              sx={{ position: "relative" }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(255, 152, 0, 0.14)",
                    color: "primary.main",
                    flexShrink: 0,
                  }}
                >
                  <ReceiptLongOutlinedIcon sx={{ fontSize: 30 }} />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: { xs: 24, sm: 30 },
                      fontWeight: 900,
                      color: "text.primary",
                      lineHeight: 1.1,
                    }}
                  >
                    Factura tu ticket
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.75,
                      fontSize: 14,
                      color: "text.secondary",
                      lineHeight: 1.55,
                    }}
                  >
                    Captura tus datos fiscales para generar tu factura desde
                    Clic Menu.
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "background.default",
                }}
              >
                <SecurityOutlinedIcon
                  fontSize="small"
                  sx={{ color: "primary.main" }}
                />
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  Sitio seguro
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          {invoiceData ? (
            <PublicInvoiceSummaryCard data={invoiceData} />
          ) : null}

          {successData ? (
            <PublicInvoiceSuccessCard data={successData} />
          ) : canInvoice ? (
            <PublicInvoiceForm
              invoiceMode={invoiceData?.invoice_mode}
              submitting={submitting}
              apiErrors={fieldErrors}
              generalError={submitError}
              onSubmit={handleStamp}
            />
          ) : (
            <PublicInvoiceStatusCard
              status={currentStatus}
              message={currentMessage}
              data={invoiceData}
            />
          )}
        </Stack>
      </Box>

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={4500}
      />
    </PageContainer>
  );
}