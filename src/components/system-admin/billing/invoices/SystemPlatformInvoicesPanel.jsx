import {
  Box, Button, Card, Chip, IconButton, Paper, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

import PaginationFooter from "../../../common/PaginationFooter";

export default function SystemPlatformInvoicesPanel({
  invoices = [],
  pagination,
  busyKey = "",
  onView,
  onDownloadPdf,
  onDownloadXml,
  onRetry,
  onPrev,
  onNext,
}) {
  const theme = useTheme();
  const useCards = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Paper
      sx={{
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.75,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
          Historial de facturas
        </Typography>

        <Typography sx={{ mt: 0.4, fontSize: 12, color: "text.secondary" }}>
          Consulta los comprobantes emitidos a propietarios y a Público General.
        </Typography>
      </Box>

      {invoices.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {useCards ? (
            <InvoicesCards
              invoices={invoices}
              busyKey={busyKey}
              onView={onView}
              onDownloadPdf={onDownloadPdf}
              onDownloadXml={onDownloadXml}
              onRetry={onRetry}
            />
          ) : (
            <InvoicesTable
              invoices={invoices}
              busyKey={busyKey}
              onView={onView}
              onDownloadPdf={onDownloadPdf}
              onDownloadXml={onDownloadXml}
              onRetry={onRetry}
            />
          )}

          <PaginationFooter
            page={pagination.page}
            totalPages={pagination.totalPages}
            startItem={pagination.startItem}
            endItem={pagination.endItem}
            total={pagination.total}
            hasPrev={pagination.hasPrev}
            hasNext={pagination.hasNext}
            onPrev={onPrev}
            onNext={onNext}
            itemLabel="facturas"
          />
        </>
      )}
    </Paper>
  );
}

function InvoicesTable({
  invoices,
  busyKey,
  onView,
  onDownloadPdf,
  onDownloadXml,
  onRetry,
}) {
  return (
    <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
      <Table sx={{ minWidth: 1060 }}>
        <TableHead>
          <TableRow
            sx={{
              "& th": {
                bgcolor: "primary.main",
                color: "#fff",
                fontSize: 12,
                fontWeight: 800,
                borderBottom: "none",
                whiteSpace: "nowrap",
              },
            }}
          >
            <TableCell>Receptor</TableCell>
            <TableCell>Periodo</TableCell>
            <TableCell>Serie / Folio</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>UUID</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Origen</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {invoices.map((invoice) => (
            <TableRow
              key={invoice.id}
              hover
              sx={{
                "& td": {
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  fontSize: 13,
                  color: "text.primary",
                  verticalAlign: "middle",
                },
              }}
            >
              <TableCell sx={{ minWidth: 170 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                  {receiverName(invoice)}
                </Typography>

                <Typography sx={{ mt: 0.2, fontSize: 11, color: "text.secondary" }}>
                  {receiverTypeLabel(invoice.receiver_type)}
                </Typography>
              </TableCell>

              <TableCell>{formatPeriod(invoice.period_date)}</TableCell>

              <TableCell>
                <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                  {invoiceReference(invoice)}
                </Typography>
              </TableCell>

              <TableCell>{formatDate(invoice?.fiscal?.fiscal_date || invoice.stamped_at)}</TableCell>

              <TableCell sx={{ maxWidth: 150 }}>
                {invoice.uuid ? (
                  <Tooltip title={invoice.uuid}>
                    <Typography
                      sx={{
                        maxWidth: 145,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: 12,
                        fontFamily: "monospace",
                      }}
                    >
                      {invoice.uuid}
                    </Typography>
                  </Tooltip>
                ) : (
                  "—"
                )}
              </TableCell>

              <TableCell align="right">
                <Typography sx={{ fontWeight: 900 }}>
                  {formatCurrency(invoice.total, invoice.currency)}
                </Typography>
              </TableCell>

              <TableCell>
                <InvoiceStatusChip status={invoice.status} />
              </TableCell>

              <TableCell>{issuanceSourceLabel(invoice.issuance_source)}</TableCell>

              <TableCell align="right">
                <InvoiceIconActions
                  invoice={invoice}
                  busyKey={busyKey}
                  onView={onView}
                  onDownloadPdf={onDownloadPdf}
                  onDownloadXml={onDownloadXml}
                  onRetry={onRetry}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function InvoicesCards({
  invoices,
  busyKey,
  onView,
  onDownloadPdf,
  onDownloadXml,
  onRetry,
}) {
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
        gridAutoRows: "1fr",
        gap: 2,
        bgcolor: "background.default",
      }}
    >
      {invoices.map((invoice) => {
        const visual = invoiceVisual(invoice.status);

        return (
          <Card
            key={invoice.id}
            sx={{
              width: "100%",
              height: "100%",
              minHeight: 390,
              display: "flex",
              flexDirection: "column",
              border: "1px solid",
              borderColor: visual.border,
              borderTop: "3px solid",
              borderTopColor: visual.accent,
              borderRadius: 1,
              boxShadow: "0 4px 14px rgba(0,0,0,0.035)",
              bgcolor: "#fff",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.6,
                bgcolor: visual.headerBg,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack direction="row" justifyContent="space-between" spacing={1.5}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
                    {invoiceReference(invoice)}
                  </Typography>

                  <Typography sx={{ mt: 0.3, fontSize: 12, color: "text.secondary" }}>
                    {receiverTypeLabel(invoice.receiver_type)}
                  </Typography>
                </Box>

                <InvoiceStatusChip status={invoice.status} />
              </Stack>
            </Box>

            <Box sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column" }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                  gap: 1.25,
                }}
              >
                <InfoBlock label="Receptor" value={receiverName(invoice)} />
                <InfoBlock label="Periodo" value={formatPeriod(invoice.period_date)} />
                <InfoBlock label="Fecha" value={formatDate(invoice?.fiscal?.fiscal_date || invoice.stamped_at)} />
                <InfoBlock label="Origen" value={issuanceSourceLabel(invoice.issuance_source)} />
              </Box>

              <Box
                sx={{
                  mt: 1.5,
                  p: 1.4,
                  borderRadius: 1,
                  bgcolor: "rgba(0,0,0,0.025)",
                }}
              >
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  UUID
                </Typography>

                <Typography
                  sx={{
                    mt: 0.25,
                    fontSize: 11,
                    color: "text.primary",
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                  }}
                >
                  {invoice.uuid || "—"}
                </Typography>
              </Box>

              <Box sx={{ flex: 1 }} />

              <Box
                sx={{
                  mt: 1.5,
                  px: 1.5,
                  py: 1.25,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "rgba(0,0,0,0.018)",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.secondary" }}>
                    Total
                  </Typography>

                  <Typography sx={{ fontSize: 20, fontWeight: 900, color: "text.primary" }}>
                    {formatCurrency(invoice.total, invoice.currency)}
                  </Typography>
                </Stack>
              </Box>

              <InvoiceCardActions
                invoice={invoice}
                busyKey={busyKey}
                onView={onView}
                onDownloadPdf={onDownloadPdf}
                onDownloadXml={onDownloadXml}
                onRetry={onRetry}
              />
            </Box>
          </Card>
        );
      })}
    </Box>
  );
}

function InvoiceIconActions({
  invoice,
  busyKey,
  onView,
  onDownloadPdf,
  onDownloadXml,
  onRetry,
}) {
  const pdfBusy = busyKey === `pdf-${invoice.id}`;
  const xmlBusy = busyKey === `xml-${invoice.id}`;
  const retryBusy = busyKey === `retry-${invoice.id}`;

  return (
    <Stack direction="row" spacing={0.6} justifyContent="flex-end">
      <Tooltip title="Ver detalle">
        <IconButton onClick={() => onView(invoice)} sx={actionIconSx}>
          <VisibilityOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title={invoice?.documents?.pdf_available ? "Descargar PDF" : "PDF no disponible"}>
        <span>
          <IconButton
            disabled={!invoice?.documents?.pdf_available || pdfBusy}
            onClick={() => onDownloadPdf(invoice)}
            sx={actionIconSx}
          >
            <PictureAsPdfOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title={invoice?.documents?.xml_available ? "Descargar XML" : "XML no disponible"}>
        <span>
          <IconButton
            disabled={!invoice?.documents?.xml_available || xmlBusy}
            onClick={() => onDownloadXml(invoice)}
            sx={actionIconSx}
          >
            <DataObjectRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      {invoice.can_retry ? (
        <Tooltip title="Reintentar factura">
          <span>
            <IconButton
              disabled={retryBusy}
              onClick={() => onRetry(invoice)}
              sx={retryIconSx}
            >
              <ReplayRoundedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      ) : null}
    </Stack>
  );
}

function InvoiceCardActions({
  invoice,
  busyKey,
  onView,
  onDownloadPdf,
  onDownloadXml,
  onRetry,
}) {
  const pdfBusy = busyKey === `pdf-${invoice.id}`;
  const xmlBusy = busyKey === `xml-${invoice.id}`;
  const retryBusy = busyKey === `retry-${invoice.id}`;

  return (
    <Box
      sx={{
        mt: 1.5,
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 1,
      }}
    >
      <Button
        variant="contained"
        startIcon={<VisibilityOutlinedIcon />}
        onClick={() => onView(invoice)}
        sx={{ fontWeight: 800 }}
      >
        Ver detalle
      </Button>

      <Button
        variant="outlined"
        startIcon={<PictureAsPdfOutlinedIcon />}
        disabled={!invoice?.documents?.pdf_available || pdfBusy}
        onClick={() => onDownloadPdf(invoice)}
      >
        PDF
      </Button>

      <Button
        variant="outlined"
        startIcon={<DataObjectRoundedIcon />}
        disabled={!invoice?.documents?.xml_available || xmlBusy}
        onClick={() => onDownloadXml(invoice)}
      >
        XML
      </Button>

      {invoice.can_retry ? (
        <Button
          variant="outlined"
          color="warning"
          startIcon={<ReplayRoundedIcon />}
          disabled={retryBusy}
          onClick={() => onRetry(invoice)}
        >
          Reintentar
        </Button>
      ) : (
        <Box />
      )}
    </Box>
  );
}

function InfoBlock({ label, value }) {
  return (
    <Box sx={{ minWidth: 0, p: 1.25, borderRadius: 1, bgcolor: "rgba(0,0,0,0.025)" }}>
      <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{label}</Typography>

      <Typography
        sx={{
          mt: 0.25,
          fontSize: 13,
          fontWeight: 700,
          color: "text.primary",
          lineHeight: 1.4,
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  );
}

function InvoiceStatusChip({ status }) {
  const config = statusConfig(status);

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        flexShrink: 0,
        bgcolor: config.bg,
        color: config.color,
        border: "1px solid",
        borderColor: config.border,
        fontWeight: 800,
      }}
    />
  );
}

function statusConfig(status) {
  const map = {
    stamped: {
      label: "Timbrada",
      bg: "#E8F5E9",
      color: "#2E7D32",
      border: "#A5D6A7",
    },
    processing: {
      label: "En proceso",
      bg: "#E3F2FD",
      color: "#1565C0",
      border: "#BBDEFB",
    },
    failed: {
      label: "Fallida",
      bg: "#FFEBEE",
      color: "#C62828",
      border: "#FFCDD2",
    },
    review_required: {
      label: "Requiere revisión",
      bg: "#F3E5F5",
      color: "#7B1FA2",
      border: "#CE93D8",
    },
  };

  return map[status] || {
    label: "Sin estado",
    bg: "#F5F5F5",
    color: "#616161",
    border: "#E0E0E0",
  };
}

function invoiceVisual(status) {
  const map = {
    stamped: { accent: "#2E7D32", border: "#C8E6C9", headerBg: "#F7FBF7" },
    processing: { accent: "#1976D2", border: "#BBDEFB", headerBg: "#F7FAFD" },
    failed: { accent: "#D32F2F", border: "#FFCDD2", headerBg: "#FFF8F8" },
    review_required: { accent: "#7B1FA2", border: "#E1BEE7", headerBg: "#FCF8FD" },
  };

  return map[status] || {
    accent: "#ff9800",
    border: "divider",
    headerBg: "rgba(255,152,0,0.025)",
  };
}

function receiverName(invoice) {
  if (invoice?.receiver_type === "public_general") {
    return invoice?.receiver?.name || "Público General";
  }

  return invoice?.receiver?.full_name ||
    [invoice?.receiver?.name, invoice?.receiver?.last_name_paternal, invoice?.receiver?.last_name_maternal]
      .filter(Boolean)
      .join(" ") ||
    "—";
}

function receiverTypeLabel(value) {
  if (value === "owner") return "Propietario";
  if (value === "public_general") return "Público General";
  return "—";
}

function issuanceSourceLabel(value) {
  if (value === "owner") return "Propietario";
  if (value === "system_admin") return "Administrador";
  return "—";
}

function invoiceReference(invoice) {
  const serie = invoice?.fiscal?.serie;
  const folio = invoice?.fiscal?.folio;

  if (serie && folio !== null && folio !== undefined) return `${serie}-${folio}`;
  if (folio !== null && folio !== undefined) return String(folio);

  return "Sin folio";
}

function formatPeriod(value) {
  if (!value) return "—";

  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "—";

  const text = date.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(value, currency = "MXN") {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
  }).format(number);
}

function EmptyState() {
  return (
    <Box sx={{ px: 3, py: 7, textAlign: "center" }}>
      <ReceiptLongRoundedIcon sx={{ fontSize: 48, color: "text.disabled" }} />

      <Typography sx={{ mt: 1.5, fontSize: 20, fontWeight: 800, color: "text.primary" }}>
        No hay facturas para mostrar
      </Typography>

      <Typography sx={{ mt: 0.75, fontSize: 14, color: "text.secondary" }}>
        No se encontraron facturas que coincidan con los filtros seleccionados.
      </Typography>
    </Box>
  );
}

const actionIconSx = {
  width: 36,
  height: 36,
  border: "1px solid",
  borderColor: "divider",
  color: "text.primary",
  borderRadius: 1,
  "&:hover": {
    bgcolor: "rgba(255,152,0,0.07)",
    borderColor: "primary.main",
    color: "primary.main",
  },
};

const retryIconSx = {
  ...actionIconSx,
  color: "warning.dark",
  borderColor: "warning.light",
};