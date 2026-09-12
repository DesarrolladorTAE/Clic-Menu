import {
  Box, Button, Card, Checkbox, Chip, Paper, Stack, Typography,
} from "@mui/material";

import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";

import PaginationFooter from "../../../common/PaginationFooter";

export default function SystemPlatformPurchasesPanel({
  purchases = [],
  selectedKeys = new Set(),
  pagination,
  refreshing = false,
  canSelect,
  onToggle,
  onClearSelection,
  onOpenInvoice,
}) {
  const selectedCount = selectedKeys.size;

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
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
            Movimientos
          </Typography>

          <Typography sx={{ mt: 0.4, fontSize: 12, color: "text.secondary" }}>
            Selecciona movimientos compatibles para generar una misma factura.
          </Typography>

          {refreshing ? (
            <Typography sx={{ mt: 0.6, fontSize: 12, color: "text.secondary" }}>
              Actualizando cambios…
            </Typography>
          ) : null}
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ width: { xs: "100%", md: "auto" } }}
        >
          {selectedCount > 0 ? (
            <Button
              variant="outlined"
              onClick={onClearSelection}
              sx={{ minWidth: { xs: "100%", sm: 150 } }}
            >
              Limpiar selección
            </Button>
          ) : null}

          <Button
            variant="contained"
            startIcon={<ReceiptLongRoundedIcon />}
            disabled={selectedCount === 0}
            onClick={onOpenInvoice}
            sx={{ minWidth: { xs: "100%", sm: 190 }, fontWeight: 800 }}
          >
            Facturar seleccionados
          </Button>
        </Stack>
      </Box>

      {purchases.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
              },
              gridAutoRows: "1fr",
              gap: 2,
              bgcolor: "background.default",
            }}
          >
            {pagination.paginatedItems.map((purchase) => {
              const key = purchaseKey(purchase);
              const selected = selectedKeys.has(key);
              const selectable = selected || canSelect(purchase);

              return (
                <PurchaseCard
                  key={key}
                  purchase={purchase}
                  selected={selected}
                  selectable={selectable}
                  onToggle={() => onToggle(purchase)}
                />
              );
            })}
          </Box>

          <PaginationFooter
            page={pagination.page}
            totalPages={pagination.totalPages}
            startItem={pagination.startItem}
            endItem={pagination.endItem}
            total={pagination.total}
            hasPrev={pagination.hasPrev}
            hasNext={pagination.hasNext}
            onPrev={pagination.prevPage}
            onNext={pagination.nextPage}
            itemLabel="movimientos"
          />
        </>
      )}
    </Paper>
  );
}

function PurchaseCard({ purchase, selected, selectable, onToggle }) {
  const visual = cardVisual(purchase, selected);
  const availability = availabilityLabel(purchase);

  return (
    <Card
      sx={{
        width: "100%",
        minHeight: 390,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: selected ? "primary.main" : visual.border,
        borderTop: "3px solid",
        borderTopColor: selected ? "primary.main" : visual.accent,
        borderRadius: 1,
        boxShadow: selected
          ? "0 5px 18px rgba(255,152,0,0.10)"
          : "0 4px 14px rgba(0,0,0,0.035)",
        bgcolor: "#fff",
        overflow: "hidden",
        transition: "border-color 0.18s ease, box-shadow 0.18s ease",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 2.25 },
          py: 1.75,
          bgcolor: visual.headerBg,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontSize: { xs: 16, sm: 17 },
                fontWeight: 800,
                color: "text.primary",
                lineHeight: 1.35,
                wordBreak: "break-word",
              }}
            >
              {purchase.concept || "Movimiento sin concepto"}
            </Typography>

            <Typography sx={{ mt: 0.35, fontSize: 12, fontWeight: 700, color: "text.secondary" }}>
              {typeLabel(purchase.type)}
            </Typography>
          </Box>

          <Checkbox
            checked={selected}
            disabled={!selectable}
            onChange={onToggle}
            color="primary"
            inputProps={{ "aria-label": "Seleccionar movimiento" }}
            sx={{ p: 0.25 }}
          />
        </Stack>

        <Stack
          direction="row"
          spacing={0.75}
          useFlexGap
          flexWrap="wrap"
          sx={{ mt: 1.25 }}
        >
          <FiscalStatusChip purchase={purchase} />

          {availability ? (
            <Chip
              label={availability.label}
              size="small"
              sx={{
                bgcolor: availability.bg,
                color: availability.color,
                border: "1px solid",
                borderColor: availability.border,
                fontWeight: 800,
              }}
            />
          ) : null}
        </Stack>
      </Box>

      <Box
        sx={{
          p: { xs: 2, sm: 2.25 },
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "repeat(2, minmax(0, 1fr))",
            },
            gap: 1.4,
          }}
        >
          <InfoBlock
            label="Propietario"
            value={ownerName(purchase.owner)}
            secondary={purchase.owner?.email}
          />

          <InfoBlock
            label="Restaurante"
            value={entityName(purchase.restaurant)}
          />

          <InfoBlock
            label="Sucursal"
            value={entityName(purchase.branch)}
          />

          <InfoBlock
            label="Fecha de compra"
            value={formatDate(purchase.purchase_date)}
          />

          <InfoBlock
            label="Forma de compra"
            value={purchase?.economic_source?.label || paymentLabel(purchase.payment_method)}
          />

          <InfoBlock
            label="Límite administrativo"
            value={formatDateTime(purchase?.window?.admin_deadline)}
          />
        </Box>

        {purchase?.invoice ? (
          <Box
            sx={{
              mt: 1.5,
              px: 1.5,
              py: 1.1,
              borderRadius: 1,
              bgcolor: "rgba(0,0,0,0.025)",
            }}
          >
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              Factura relacionada
            </Typography>

            <Typography sx={{ mt: 0.25, fontSize: 13, fontWeight: 800, color: "text.primary" }}>
              {invoiceReference(purchase.invoice)}
            </Typography>
          </Box>
        ) : null}

        <Box sx={{ flex: 1 }} />

        <Box
          sx={{
            mt: 2,
            px: 1.6,
            py: 1.35,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "rgba(0,0,0,0.018)",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.secondary" }}>
              Importe
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: 19, sm: 21 },
                fontWeight: 900,
                color: "text.primary",
                textAlign: "right",
              }}
            >
              {formatCurrency(purchase.amount, purchase.currency)}
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Card>
  );
}

function InfoBlock({ label, value, secondary }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        px: 1.4,
        py: 1.15,
        borderRadius: 1,
        bgcolor: "rgba(0,0,0,0.025)",
      }}
    >
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.3,
          fontSize: 13,
          fontWeight: 700,
          color: "text.primary",
          lineHeight: 1.4,
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </Typography>

      {secondary ? (
        <Typography
          sx={{
            mt: 0.25,
            fontSize: 11,
            color: "text.secondary",
            lineHeight: 1.35,
            wordBreak: "break-word",
          }}
        >
          {secondary}
        </Typography>
      ) : null}
    </Box>
  );
}

function FiscalStatusChip({ purchase }) {
  const config = fiscalStatusConfig(purchase);

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        bgcolor: config.bg,
        color: config.color,
        border: "1px solid",
        borderColor: config.border,
        fontWeight: 800,
      }}
    />
  );
}

function fiscalStatusConfig(purchase) {
  if (purchase?.can_invoice_owner) {
    return {
      label: "Disponible para facturar",
      bg: "#E8F5E9",
      color: "#1B5E20",
      border: "#A5D6A7",
    };
  }

  if (purchase?.can_invoice_public_general) {
    return {
      label: "Disponible para Público General",
      bg: "#EEF4F8",
      color: "#35536E",
      border: "#C8D8E4",
    };
  }

  const map = {
    sin_facturar: {
      label: "Sin facturar",
      bg: "#FFF3E0",
      color: "#9A5700",
      border: "#FFD59A",
    },
    procesando: {
      label: "Procesando",
      bg: "#E3F2FD",
      color: "#1565C0",
      border: "#BBDEFB",
    },
    fallido: {
      label: "Fallido",
      bg: "#FFEBEE",
      color: "#C62828",
      border: "#FFCDD2",
    },
    revision_requerida: {
      label: "Requiere revisión",
      bg: "#F3E5F5",
      color: "#7B1FA2",
      border: "#CE93D8",
    },
    facturado: {
      label: "Facturado",
      bg: "#E8F5E9",
      color: "#2E7D32",
      border: "#A5D6A7",
    },
    publico_general: {
      label: "Facturado a Público General",
      bg: "#ECEFF1",
      color: "#455A64",
      border: "#CFD8DC",
    },
    ventana_vencida: {
      label: "Plazo administrativo vencido",
      bg: "#FBEDE7",
      color: "#A4492D",
      border: "#E8B7A5",
    },
  };

  return map[purchase?.invoice_status] || {
    label: purchase?.invoice_status || "Sin estado",
    bg: "#F5F5F5",
    color: "#616161",
    border: "#E0E0E0",
  };
}

function availabilityLabel(purchase) {
  if (purchase?.can_invoice_owner && purchase?.can_invoice_public_general) {
    return {
      label: "Propietario o Público General",
      bg: "#FFF8E8",
      color: "#8A5A00",
      border: "#F3D48B",
    };
  }

  if (purchase?.can_invoice_owner) {
    return {
      label: "Factura al propietario",
      bg: "#F4FAF4",
      color: "#2E7D32",
      border: "#C8E6C9",
    };
  }

  if (purchase?.can_invoice_public_general) {
    return {
      label: "Público General",
      bg: "#F3F6F8",
      color: "#35536E",
      border: "#D4DEE5",
    };
  }

  return null;
}

function cardVisual(purchase, selected) {
  if (selected) {
    return {
      accent: "#ff9800",
      border: "#FFD59A",
      headerBg: "rgba(255,152,0,0.055)",
    };
  }

  if (purchase?.can_invoice_owner) {
    return {
      accent: "#2E7D32",
      border: "#C8E6C9",
      headerBg: "#F7FBF7",
    };
  }

  if (purchase?.can_invoice_public_general) {
    return {
      accent: "#35536E",
      border: "#D4DEE5",
      headerBg: "#F7F9FA",
    };
  }

  if (purchase?.invoice_status === "ventana_vencida") {
    return {
      accent: "#B85C38",
      border: "#E7C4B7",
      headerBg: "#FFF8F5",
    };
  }

  return {
    accent: "#ff9800",
    border: "divider",
    headerBg: "rgba(255,152,0,0.025)",
  };
}

function invoiceReference(invoice) {
  if (invoice?.serie && invoice?.folio !== null && invoice?.folio !== undefined) {
    return `${invoice.serie}-${invoice.folio}`;
  }

  if (invoice?.uuid) return invoice.uuid;
  if (invoice?.id) return `Factura #${invoice.id}`;

  return "Factura registrada";
}

function ownerName(owner) {
  if (!owner) return "—";
  return owner.full_name || [owner.name, owner.last_name_paternal, owner.last_name_maternal]
    .filter(Boolean)
    .join(" ") || "—";
}

function entityName(value) {
  if (!value) return "—";
  if (typeof value === "string") return value;
  return value.trade_name || value.name || value.business_name || value.label || "—";
}

function typeLabel(type) {
  if (type === "plan") return "Plan";
  if (type === "addon") return "Complemento";
  return "Compra";
}

function paymentLabel(method) {
  const value = String(method || "").toLowerCase();

  if (value === "paypal") return "PayPal";
  if (["manual", "transfer", "transferencia"].includes(value)) return "Transferencia";

  return method || "—";
}

function formatCurrency(value, currency = "MXN") {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
  }).format(number);
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

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function purchaseKey(purchase) {
  return `${purchase?.source_type || "source"}-${purchase?.source_id || 0}`;
}

function EmptyState() {
  return (
    <Box sx={{ px: 3, py: 7, textAlign: "center" }}>
      <FactCheckRoundedIcon sx={{ fontSize: 48, color: "text.disabled" }} />

      <Typography sx={{ mt: 1.5, fontSize: 20, fontWeight: 800, color: "text.primary" }}>
        No hay movimientos para mostrar
      </Typography>

      <Typography sx={{ mt: 0.75, fontSize: 14, color: "text.secondary" }}>
        No se encontraron compras que coincidan con los filtros seleccionados.
      </Typography>
    </Box>
  );
}