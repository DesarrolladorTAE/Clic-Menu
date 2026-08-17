import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import {
  actorLabel,
  financialStatusLabel,
  formatCurrency,
  formatDate,
  formatDateTime,
  fulfillmentLabel,
  kitchenFlowLabel,
  onlineOrderStatusLabel,
  ownershipLabel,
  paymentTypeLabel,
  timingLabel,
} from "./onlineOrderDisplay";

export default function CashierOnlineOrderDetailView({
  order,
  onBack,
}) {
  return (
    <Stack spacing={3}>
      <Card sx={cardSx}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={{ xs: 1.5, sm: 2 }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 24, sm: 30, md: 38 },
                    lineHeight: 1.05,
                    fontWeight: 800,
                    color: "text.primary",
                    wordBreak: "break-word",
                  }}
                >
                  {order?.public_number ? `Pedido ${order.public_number}` : "Pedido"}
                </Typography>

                <Typography sx={{ mt: 0.75, fontSize: 15, color: "text.secondary" }}>
                  {order?.order_name || "Cliente sin nombre"}
                </Typography>
              </Box>

              <Button
                type="button"
                variant="outlined"
                startIcon={<ArrowBackRoundedIcon />}
                onClick={onBack}
                sx={{
                  minHeight: { xs: 42, sm: 48 },
                  px: { xs: 1.5, sm: 2.5 },
                  fontSize: { xs: 12.5, sm: 14 },
                  fontWeight: 800,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                Volver a pedidos
              </Button>
            </Stack>

            <Divider />

            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(4, minmax(0, 1fr))",
                },
              }}
            >
              <SummaryItem label="Entrega" value={fulfillmentLabel(order?.fulfillment_type)} />
              <SummaryItem label="Horario" value={timingLabel(order?.timing_type)} />
              <SummaryItem label="Pago" value={paymentTypeLabel(order?.payment_type)} />
              <SummaryItem label="Preparación" value={kitchenFlowLabel(order?.kitchen_flow)} />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            lg: "repeat(2, minmax(0, 1fr))",
          },
          alignItems: "stretch",
        }}
      >
        <SectionCard title="Cliente">
          <InfoRow label="Nombre" value={order?.order_name || "No proporcionado"} />
          <InfoRow label="Teléfono" value={order?.customer_phone || "No proporcionado"} />
          <InfoRow label="Correo" value={order?.customer_email || "No proporcionado"} />

          {order?.customer_notes ? (
            <>
              <Divider />
              <InfoBlock label="Notas del cliente" value={order.customer_notes} />
            </>
          ) : null}
        </SectionCard>

        <SectionCard title="Entrega y horario">
          <InfoRow label="Forma de entrega" value={fulfillmentLabel(order?.fulfillment_type)} />
          <InfoRow label="Tipo de horario" value={timingLabel(order?.timing_type)} />
          <InfoRow label="Horario solicitado" value={formatDateTime(order?.requested_for_at)} />
          <InfoRow label="Horario estimado" value={formatDateTime(order?.estimated_for_at)} />

          {order?.destination?.scheduled_date ? (
            <InfoRow label="Fecha programada" value={formatDate(order.destination.scheduled_date)} />
          ) : null}

          <DestinationSnapshot snapshot={order?.destination?.destination_snapshot} />
        </SectionCard>

        <SectionCard title="Pago">
          <InfoRow label="Método elegido" value={paymentTypeLabel(order?.payment_type)} />
          <InfoRow label="Estado del pago" value={financialStatusLabel(order?.financial_status)} />
          <InfoRow label="Costo de entrega" value={formatCurrency(order?.delivery_fee)} />
          <Divider />
          <InfoRow label="Total" value={formatCurrency(order?.total)} strong />
        </SectionCard>

        <SectionCard title="Asignación">
          <InfoRow label="Caja" value={ownershipLabel(order?.ownership)} />
          <InfoRow label="Estado" value={onlineOrderStatusLabel(order?.status)} />
          <InfoRow label="Preparación" value={kitchenFlowLabel(order?.kitchen_flow)} />
        </SectionCard>
      </Box>

      <SectionCard title="Productos">
        <ProductsList products={order?.products} />

        {order?.products?.length ? (
          <>
            <Divider />

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary" }}>
                Total del pedido
              </Typography>

              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "primary.main" }}>
                {formatCurrency(order?.total)}
              </Typography>
            </Stack>
          </>
        ) : null}
      </SectionCard>

      <SectionCard title="Historial">
        <StatusHistory rows={order?.status_history} />
      </SectionCard>
    </Stack>
  );
}

function SectionCard({ title, children }) {
  return (
    <Card sx={cardSx}>
      <CardContent
        sx={{
          p: { xs: 2, sm: 2.5 },
          height: "100%",
          "&:last-child": { pb: { xs: 2, sm: 2.5 } },
        }}
      >
        <Stack spacing={2}>
          <Typography sx={{ fontSize: 19, fontWeight: 800, color: "text.primary" }}>
            {title}
          </Typography>

          <Divider />

          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

function SummaryItem({ label, value }) {
  return (
    <Box
      sx={{
        p: 1.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.default",
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 800,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Typography>

      <Typography sx={{ mt: 0.5, fontSize: 14, fontWeight: 800, color: "text.primary" }}>
        {value}
      </Typography>
    </Box>
  );
}

function InfoRow({ label, value, strong = false }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: strong ? 800 : 700,
          color: strong ? "text.primary" : "text.secondary",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          maxWidth: "65%",
          fontSize: strong ? 16 : 13,
          fontWeight: 800,
          color: strong ? "primary.main" : "text.primary",
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </Typography>
    </Stack>
  );
}

function InfoBlock({ label, value }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          fontSize: 14,
          color: "text.primary",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function ProductsList({ products }) {
  const rows = Array.isArray(products) ? products : [];

  if (rows.length === 0) {
    return (
      <Alert severity="info" variant="outlined">
        No hay productos disponibles para mostrar.
      </Alert>
    );
  }

  return (
    <Stack spacing={1.25}>
      {rows.map((item, index) => (
        <ProductRow key={item?.id || item?.order_item_id || `product:${index}`} item={item} />
      ))}
    </Stack>
  );
}

function ProductRow({ item }) {
  const name = item?.product_name || item?.name || "Producto";
  const variant = item?.variant_name || "";
  const quantity = Number(item?.quantity ?? 1);
  const total = item?.net_line_total ?? item?.line_total ?? item?.total ?? item?.subtotal;
  const children = getProductChildren(item);

  return (
    <Box
      sx={{
        p: 1.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.default",
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary", wordBreak: "break-word" }}>
              {name}
            </Typography>

            {variant ? (
              <Typography sx={{ mt: 0.25, fontSize: 12, color: "text.secondary" }}>
                {variant}
              </Typography>
            ) : null}

            <Typography sx={{ mt: 0.4, fontSize: 12, color: "text.secondary" }}>
              Cantidad: {Number.isFinite(quantity) ? quantity : 1}
            </Typography>
          </Box>

          {total !== undefined && total !== null ? (
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary", whiteSpace: "nowrap" }}>
              {formatCurrency(total)}
            </Typography>
          ) : null}
        </Stack>

        {children.length > 0 ? (
          <Stack spacing={0.5} pl={1.5} sx={{ borderLeft: "2px solid", borderColor: "divider" }}>
            {children.map((child, index) => (
              <Typography
                key={child?.id || `child:${index}`}
                sx={{ fontSize: 12, color: "text.secondary", wordBreak: "break-word" }}
              >
                {child?.product_name || child?.name || child?.option_name || "Complemento"}
                {child?.quantity ? ` · ${child.quantity}` : ""}
              </Typography>
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}

function DestinationSnapshot({ snapshot }) {
  const values = extractDestinationValues(snapshot);

  if (values.length === 0) return null;

  return (
    <>
      <Divider />

      <Box>
        <Typography sx={{ mb: 0.75, fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
          Destino
        </Typography>

        <Stack spacing={0.35}>
          {values.map((value, index) => (
            <Typography
              key={`${value}:${index}`}
              sx={{ fontSize: 13, color: "text.primary", wordBreak: "break-word" }}
            >
              {value}
            </Typography>
          ))}
        </Stack>
      </Box>
    </>
  );
}

function StatusHistory({ rows }) {
  const history = Array.isArray(rows) ? rows : [];

  if (history.length === 0) {
    return (
      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
        Todavía no hay movimientos registrados.
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      {history.map((row, index) => (
        <Box
          key={`history:${index}:${row?.created_at || ""}`}
          sx={{
            p: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "background.default",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary" }}>
                {onlineOrderStatusLabel(row?.to_status)}
              </Typography>

              <Typography sx={{ mt: 0.25, fontSize: 12, color: "text.secondary" }}>
                Realizado por {actorLabel(row?.actor_type)}
              </Typography>

              {row?.reason ? (
                <Typography sx={{ mt: 0.5, fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}>
                  {row.reason}
                </Typography>
              ) : null}
            </Box>

            <Typography sx={{ fontSize: 12, color: "text.secondary", whiteSpace: "nowrap" }}>
              {formatDateTime(row?.created_at)}
            </Typography>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

function getProductChildren(item) {
  const candidates = [item?.children, item?.components, item?.modifiers];
  return candidates.find((rows) => Array.isArray(rows) && rows.length > 0) || [];
}

function extractDestinationValues(snapshot) {
  if (!snapshot) return [];

  if (typeof snapshot === "string") {
    const value = translateDestinationValue(snapshot.trim());
    return value ? [value] : [];
  }

  if (typeof snapshot !== "object" || Array.isArray(snapshot)) return [];

  const ignoredKeys = new Set([
    "id",
    "type",
    "code",
    "fulfillment_id",
    "delivery_concept_id",
    "scheduled_point_id",
    "time_block_id",
  ]);

  const values = [];

  const visit = (value, key = "") => {
    if (ignoredKeys.has(key)) return;

    if (typeof value === "string") {
      const clean = translateDestinationValue(value.trim());
      if (clean) values.push(clean);
      return;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      values.push(String(value));
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((row) => visit(row));
      return;
    }

    if (value && typeof value === "object") {
      Object.entries(value).forEach(([childKey, childValue]) => visit(childValue, childKey));
    }
  };

  visit(snapshot);

  return Array.from(new Set(values));
}

function translateDestinationValue(value) {
  const clean = String(value || "").trim();
  const normalized = clean.toLowerCase();

  const translations = {
    pickup: "Recoger en sucursal",
    home_delivery: "Entrega a domicilio",
    internal_location: "Entrega en ubicación interna",
    scheduled_point: "Punto programado",
    asap: "Lo antes posible",
    scheduled: "Programado",
  };

  return translations[normalized] || clean;
}

const cardSx = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  boxShadow: "none",
  backgroundColor: "background.paper",
};