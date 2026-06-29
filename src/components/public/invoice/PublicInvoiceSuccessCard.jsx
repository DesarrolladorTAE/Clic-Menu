import { useState } from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";

import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import TagOutlinedIcon from "@mui/icons-material/TagOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

function formatDate(value) {
  if (!value) return "Sin datos";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function billingModeLabel(value) {
  if (value === "global") return "Facturación global";
  if (value === "per_product") return "Facturación por producto";
  return "Sin datos";
}

export default function PublicInvoiceSuccessCard({ data }) {
  const [copied, setCopied] = useState(false);

  const uuid = data?.uuid || "";

  const copyUuid = async () => {
    if (!uuid) return;

    try {
      await navigator.clipboard.writeText(uuid);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Paper
      sx={{
        width: "100%",
        p: 0,
        overflow: "hidden",
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        boxShadow: "none",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 3, sm: 4 },
          textAlign: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          background:
            "linear-gradient(135deg, rgba(255,152,0,0.14), rgba(255,255,255,0))",
        }}
      >
        <Box
          sx={{
            width: 76,
            height: 76,
            borderRadius: 2,
            mx: "auto",
            mb: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(46, 125, 50, 0.12)",
            color: "success.main",
          }}
        >
          <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 40 }} />
        </Box>

        <Typography
          sx={{
            fontSize: { xs: 24, sm: 30 },
            fontWeight: 900,
            color: "text.primary",
            lineHeight: 1.15,
          }}
        >
          Factura timbrada correctamente
        </Typography>

        <Typography
          sx={{
            mt: 1,
            maxWidth: 620,
            mx: "auto",
            fontSize: 14,
            color: "text.secondary",
            lineHeight: 1.6,
          }}
        >
          Tu factura fue generada correctamente. Conserva el UUID para cualquier
          aclaración.
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Chip
            label="Timbrada"
            color="success"
            size="small"
            sx={{ fontWeight: 800 }}
          />
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack spacing={2}>
          <Box
            sx={{
              p: 1.75,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              borderLeft: "5px solid",
              borderLeftColor: "primary.main",
              backgroundColor: "background.default",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={1.5}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: 0.35,
                  }}
                >
                  UUID fiscal
                </Typography>

                <Typography
                  sx={{
                    mt: 0.75,
                    fontSize: 14,
                    fontWeight: 800,
                    color: "text.primary",
                    lineHeight: 1.45,
                    wordBreak: "break-word",
                  }}
                >
                  {uuid || "Sin datos"}
                </Typography>
              </Box>

              {uuid ? (
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<ContentCopyOutlinedIcon />}
                  onClick={copyUuid}
                  sx={{
                    minWidth: { xs: "100%", sm: 150 },
                    height: 42,
                    fontWeight: 800,
                  }}
                >
                  {copied ? "Copiado" : "Copiar"}
                </Button>
              ) : null}
            </Stack>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            <SuccessItem
              icon={<ReceiptLongOutlinedIcon fontSize="small" />}
              label="Serie y folio"
              value={`${data?.serie || "Sin serie"}-${data?.folio || "Sin folio"}`}
            />

            <SuccessItem
              icon={<TagOutlinedIcon fontSize="small" />}
              label="ID factura"
              value={data?.invoice_id ? `#${data.invoice_id}` : "Sin datos"}
            />

            <SuccessItem
              icon={<SettingsOutlinedIcon fontSize="small" />}
              label="Modo"
              value={billingModeLabel(data?.billing_mode)}
            />

            <SuccessItem
              icon={<CalendarMonthOutlinedIcon fontSize="small" />}
              label="Timbrada el"
              value={formatDate(data?.stamped_at)}
            />

            <SuccessItem
              icon={<ReceiptLongOutlinedIcon fontSize="small" />}
              label="Venta"
              value={data?.sale_id ? `#${data.sale_id}` : "Sin datos"}
            />

            <SuccessItem
              icon={<TagOutlinedIcon fontSize="small" />}
              label="Factura Taeconta"
              value={data?.taeconta_factura_id || "Sin datos"}
            />
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}

function SuccessItem({ icon, label, value }) {
  return (
    <Box
      sx={{
        minHeight: 118,
        height: "100%",
        p: 1.75,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.default",
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255, 152, 0, 0.12)",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 900,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: 0.35,
            }}
          >
            {label}
          </Typography>
        </Stack>

        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.45,
            wordBreak: "break-word",
          }}
        >
          {value || "Sin datos"}
        </Typography>
      </Stack>
    </Box>
  );
}