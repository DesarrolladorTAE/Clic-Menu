import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import {
  ThemeProvider, alpha, createTheme, useTheme,
} from "@mui/material/styles";
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

const GENERAL_ERROR_KEYS = [
  "resico_retention",
  "sat",
  "sat_product_service",
  "sat_unit",
  "global_product",
  "global_sat_product_service",
  "global_sat_unit",
  "global_description",
  "products",
  "sale",
  "setting",
  "account",
  "tax_profile",
  "forma_pago",
  "payments",
  "billing_mode",
];

function normalizeThemeColor(value) {
  if (typeof value !== "string") {
    return null;
  }

  const color = value.trim().toUpperCase();

  if (!/^#[0-9A-F]{6}$/.test(color)) {
    return null;
  }

  return color;
}

function isGenericValidationMessage(message) {
  const text = String(message || "").trim().toLowerCase();

  return (
    text === "the given data was invalid." ||
    text === "the given data was invalid" ||
    text === "los datos proporcionados no son válidos." ||
    text === "los datos proporcionados no son válidos"
  );
}

function errorValueToMessages(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.flat().filter(Boolean).map((item) => String(item));
  }

  return [String(value)];
}

function collectErrorMessages(errors, keys = null) {
  if (!errors || typeof errors !== "object") return [];

  const entries = keys
    ? keys.map((key) => [key, errors[key]]).filter(([, value]) => value)
    : Object.entries(errors);

  return entries
    .flatMap(([, value]) => errorValueToMessages(value))
    .map((message) => message.trim())
    .filter(Boolean);
}

function apiErrorToMessage(e, fallback = "Ocurrió un error") {
  const responseData = e?.response?.data;

  if (!responseData || typeof responseData !== "object") {
    return e?.message || fallback;
  }

  const errors = responseData?.errors || {};

  const generalMessages = collectErrorMessages(errors, GENERAL_ERROR_KEYS);

  if (generalMessages.length > 0) {
    return generalMessages.join("\n");
  }

  const allErrorMessages = collectErrorMessages(errors);

  if (allErrorMessages.length > 0) {
    return allErrorMessages.join("\n");
  }

  if (
    responseData?.message &&
    !isGenericValidationMessage(responseData.message)
  ) {
    return String(responseData.message);
  }

  return e?.message || fallback;
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
      theme_color: null,
      cover_image_url: null,
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

function downloadXmlFile(xml, filename = "factura.xml") {
  if (!xml || typeof xml !== "string") {
    return false;
  }

  try {
    const safeFilename =
      typeof filename === "string" && filename.trim()
        ? filename.trim()
        : "factura.xml";

    const blob = new Blob([xml], {
      type: "application/xml;charset=utf-8",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = safeFilename.endsWith(".xml")
      ? safeFilename
      : `${safeFilename}.xml`;

    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);

    return true;
  } catch {
    return false;
  }
}

function downloadPdfBase64File(pdfBase64, filename = "factura.pdf") {
  if (!pdfBase64 || typeof pdfBase64 !== "string") {
    return false;
  }

  try {
    const safeFilename =
      typeof filename === "string" && filename.trim()
        ? filename.trim()
        : "factura.pdf";

    const cleanBase64 = pdfBase64.includes(",")
      ? pdfBase64.split(",").pop()
      : pdfBase64;

    const binaryString = window.atob(cleanBase64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);

    for (let i = 0; i < length; i += 1) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], {
      type: "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = safeFilename.endsWith(".pdf")
      ? safeFilename
      : `${safeFilename}.pdf`;

    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);

    return true;
  } catch {
    return false;
  }
}

function cleanSuccessData(data) {
  if (!data || typeof data !== "object") {
    return data || null;
  }

  const { xml, pdf_base64, pdf_error_message, ...cleanData } = data;

  return cleanData;
}

export default function PublicInvoicePage() {
  const { token } = useParams();
  const baseTheme = useTheme();

  const [loading, setLoading] = useState(true);
  const [invoicePayload, setInvoicePayload] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const [coverImageError, setCoverImageError] = useState(false);

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

  /**
   * Cierre automático de la alerta superior.
   * Lo dejamos aquí para garantizar que cierre aunque AppAlert no respete autoHideDuration.
   */
  useEffect(() => {
    if (!alertState.open) return undefined;

    const timer = window.setTimeout(() => {
      setAlertState((prev) => ({
        ...prev,
        open: false,
      }));
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [alertState.open, alertState.severity, alertState.title, alertState.message]);

  const invoiceData = useMemo(() => {
    return invoicePayload?.data || null;
  }, [invoicePayload]);

  const coverImageUrl = useMemo(() => {
    const value = invoiceData?.cover_image_url;

    if (typeof value !== "string") {
      return "";
    }

    return value.trim();
  }, [invoiceData?.cover_image_url]);

  /**
   * Cuando cambia la portada del ticket, se limpia cualquier error
   * registrado por una imagen anterior.
   */
  useEffect(() => {
    setCoverImageError(false);
  }, [coverImageUrl]);

  const resolvedThemeColor = useMemo(() => {
    return (
      normalizeThemeColor(invoiceData?.theme_color) ||
      baseTheme.palette.primary.main
    );
  }, [invoiceData?.theme_color, baseTheme.palette.primary.main]);

  const invoiceTheme = useMemo(() => {
    const primaryPalette = baseTheme.palette.augmentColor({
      color: {
        main: resolvedThemeColor,
      },
      name: "primary",
    });

    return createTheme(baseTheme, {
      palette: {
        primary: primaryPalette,
      },
    });
  }, [baseTheme, resolvedThemeColor]);

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

        const payloadStatus = payload?.status || payload?.data?.status;

        if (payloadStatus === "already_invoiced") {
          setSuccessData(cleanSuccessData(payload?.data || null));
        }
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
        const rawSuccessData = response?.data || null;

        const xmlDownloaded = downloadXmlFile(
          rawSuccessData?.xml,
          rawSuccessData?.xml_filename
        );

        const pdfDownloaded = downloadPdfBase64File(
          rawSuccessData?.pdf_base64,
          rawSuccessData?.pdf_filename
        );

        setSuccessData(cleanSuccessData(rawSuccessData));

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

        let successMessage = "Factura timbrada correctamente.";

        if (xmlDownloaded && pdfDownloaded) {
          successMessage =
            "Factura timbrada correctamente. El XML y PDF se descargaron automáticamente.";
        } else if (xmlDownloaded && !pdfDownloaded) {
          successMessage =
            rawSuccessData?.pdf_error_message ||
            "Factura timbrada correctamente. El XML se descargó, pero no fue posible generar el PDF.";
        } else if (!xmlDownloaded && pdfDownloaded) {
          successMessage =
            "Factura timbrada correctamente. El PDF se descargó, pero no se recibió el XML para descarga.";
        } else {
          successMessage =
            "Factura timbrada correctamente, pero no se recibieron archivos para descarga.";
        }

        showAlert({
          severity: "success",
          title: "Factura timbrada",
          message: successMessage,
        });

        return;
      }

      const message =
        response?.message || "No fue posible timbrar la factura.";

      setSubmitError(message);
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
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={invoiceTheme}>
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
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
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
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={invoiceTheme}>

      {coverImageUrl && !coverImageError ? (
        <Box
          component="img"
          src={coverImageUrl}
          alt={`Portada de ${
            invoiceData?.restaurant_name || "restaurante"
          }`}
          onError={() => {
            setCoverImageError(true);
          }}
          sx={{
            width: "100%",
            height: {
              xs: 200,
              sm: 280,
              md: 360,
              lg: 400,
            },
            display: "block",
            verticalAlign: "top",
            objectFit: "cover",
            objectPosition: "center",
            borderRadius: 0,
            border: 0,
            m: 0,
            mb: 0,
            p: 0,
          }}
        />
      ) : null}

      <PageContainer sx={{ py: 0 }}>
        <Box
          sx={{
            pt: 2,
            pb: { xs: 2, sm: 3, md: 4 },
          }}
        >
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
                  background: (theme) =>
                    `linear-gradient(
                      135deg,
                      ${alpha(theme.palette.primary.main, 0.14)},
                      ${alpha(theme.palette.background.paper, 0)} 48%
                    )`,
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
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
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
          autoHideDuration={3000}
        />
      </PageContainer>
    </ThemeProvider>
  );
}