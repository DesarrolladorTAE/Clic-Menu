// Tarjeta de datos de la orden
import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, Chip, Divider, Stack, Typography,
} from "@mui/material";

import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";

import PaginationFooter from "../../../common/PaginationFooter";

const PAGE_SIZE = 5;

export default function OrderDetailsTab({ data, themeColor, onNotify }) {
  const products = Array.isArray(data?.products) ? data.products : [];
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedProducts = products.slice(startIndex, startIndex + PAGE_SIZE);

  const summary = useMemo(() => {
    return products.reduce(
      (accumulator, product) => {
        accumulator.gross += Number(product?.gross_line_total || 0);
        accumulator.discount += Number(product?.discount_total || 0);
        accumulator.net += Number(product?.net_line_total || 0);
        return accumulator;
      },
      { gross: 0, discount: 0, net: 0 },
    );
  }, [products]);

  return (
    <Stack spacing={2.5} sx={{ width: "100%" }}>
      <OrderInformationCard data={data} themeColor={themeColor} />

      <Card
        sx={{
          width: "100%",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box sx={{ width: "100%", minWidth: 0 }}>
            <Stack direction="row" spacing={1.1} alignItems="center" sx={{ mb: 2 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  flexShrink: 0,
                  borderRadius: 1,
                  display: "grid",
                  placeItems: "center",
                  color: themeColor,
                  backgroundColor: `${themeColor}12`,
                }}
              >
                <RestaurantMenuRoundedIcon fontSize="small" />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 900, color: "text.primary" }}>
                  Tus productos
                </Typography>

                <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                  {products.length} {products.length === 1 ? "producto" : "productos"} en tu pedido
                </Typography>
              </Box>
            </Stack>

            {products.length > 0 ? (
              <Box
                sx={{
                  width: "100%",
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                {paginatedProducts.map((product, index) => (
                  <ProductItem
                    key={`${product?.name || "producto"}-${startIndex + index}`}
                    item={product}
                    themeColor={themeColor}
                    isLast={index === paginatedProducts.length - 1}
                  />
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  p: 3,
                  border: "1px solid",
                  borderColor: `${themeColor}22`,
                  borderRadius: 1,
                  textAlign: "center",
                  backgroundColor: `${themeColor}06`,
                }}
              >
                <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                  No hay productos para mostrar.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {products.length > PAGE_SIZE ? (
          <PaginationFooter
            page={page}
            totalPages={totalPages}
            startItem={products.length ? startIndex + 1 : 0}
            endItem={Math.min(startIndex + PAGE_SIZE, products.length)}
            total={products.length}
            hasPrev={page > 1}
            hasNext={page < totalPages}
            onPrev={() => setPage((current) => Math.max(1, current - 1))}
            onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
            itemLabel="productos"
          />
        ) : null}

        <Divider />

        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            boxSizing: "border-box",
            p: { xs: 2, sm: 2.5, md: 3 },
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 900, color: "text.primary", mb: 1.5 }}>
            Resumen
          </Typography>

          <SummaryRow label="Productos" value={money(summary.gross)} />

          {summary.discount > 0 ? (
            <SummaryRow
              label="Descuentos"
              value={`-${money(summary.discount)}`}
              valueColor="success.main"
            />
          ) : null}

          <SummaryRow label="Costo de entrega" value={money(data?.delivery_fee)} />

          <Divider sx={{ my: 1.5 }} />

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: 17, fontWeight: 900, color: "text.primary" }}>
              Total
            </Typography>

            <Typography sx={{ fontSize: 21, fontWeight: 900, color: themeColor }}>
              {money(data?.total)}
            </Typography>
          </Stack>
        </Box>
      </Card>

      {data?.transfer?.applies ? (
        <TransferCard
          transfer={data.transfer}
          themeColor={themeColor}
          onNotify={onNotify}
        />
      ) : null}
    </Stack>
  );
}

function OrderInformationCard({ data, themeColor }) {
  return (
    <Card
      sx={{
        width: "100%",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              color: themeColor,
              backgroundColor: `${themeColor}12`,
            }}
          >
            <ReceiptLongOutlinedIcon fontSize="small" />
          </Box>

          <Typography sx={{ fontSize: 18, fontWeight: 900, color: "text.primary" }}>
            Información del pedido
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              md: "repeat(4, minmax(0, 1fr))",
            },
            gap: 1.25,
            alignItems: "stretch",
          }}
        >
          <InfoBox
            icon={<ReceiptLongOutlinedIcon />}
            label="Número de pedido"
            value={data?.public_number || "No disponible"}
            themeColor={themeColor}
          />

          <InfoBox
            icon={<BadgeOutlinedIcon />}
            label="Nombre"
            value={data?.order_name || "No disponible"}
            themeColor={themeColor}
          />

          <InfoBox
            icon={<LocationOnOutlinedIcon />}
            label="Forma de entrega"
            value={data?.fulfillment_type_label || data?.destination?.label || "No disponible"}
            themeColor={themeColor}
          />

          <InfoBox
            icon={<ScheduleRoundedIcon />}
            label="Horario"
            value={resolveTimingLabel(data)}
            themeColor={themeColor}
          />

          <InfoBox
            icon={<CreditCardRoundedIcon />}
            label="Forma de pago"
            value={data?.payment_type_label || "No disponible"}
            themeColor={themeColor}
          />

          <InfoBox
            icon={<PaymentsOutlinedIcon />}
            label="Estado del pago"
            value={data?.financial_status_label || "Pendiente de pago"}
            themeColor={themeColor}
            extra={
              <Chip
                size="small"
                label={data?.financial_status_label || "Pendiente de pago"}
                sx={{
                  mt: 0.8,
                  maxWidth: "100%",
                  width: "fit-content",
                  height: "auto",
                  minHeight: 28,
                  color: themeColor,
                  fontWeight: 850,
                  border: "1px solid",
                  borderColor: `${themeColor}32`,
                  backgroundColor: `${themeColor}12`,
                  "& .MuiChip-label": {
                    display: "block",
                    px: 1.2,
                    py: 0.55,
                    whiteSpace: "normal",
                    overflow: "visible",
                    textOverflow: "clip",
                    wordBreak: "break-word",
                    lineHeight: 1.25,
                  },
                }}
              />
            }
          />

          <InfoBox
            icon={<AccessTimeRoundedIcon />}
            label="Pedido realizado"
            value={formatDateTime(data?.created_at)}
            themeColor={themeColor}
          />

          <InfoBox
            icon={<PaymentsOutlinedIcon />}
            label="Total"
            value={money(data?.total)}
            themeColor={themeColor}
            highlight
          />
        </Box>

        <DestinationBlock destination={data?.destination} themeColor={themeColor} />
      </Box>
    </Card>
  );
}

function InfoBox({ icon, label, value, themeColor, extra, highlight = false }) {
  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        minHeight: 96,
        p: 1.4,
        boxSizing: "border-box",
        border: "1px solid",
        borderColor: highlight ? `${themeColor}55` : "divider",
        borderRadius: 1,
        backgroundColor: highlight ? `${themeColor}08` : "background.default",
      }}
    >
      <Stack direction="row" spacing={0.7} alignItems="flex-start" sx={{ minWidth: 0 }}>
        <Box
          sx={{
            display: "flex",
            flexShrink: 0,
            color: themeColor,
            "& svg": { fontSize: 17 },
          }}
        >
          {icon}
        </Box>

        <Typography
          sx={{
            minWidth: 0,
            fontSize: 11.5,
            fontWeight: 800,
            color: "text.secondary",
            lineHeight: 1.35,
            wordBreak: "break-word",
          }}
        >
          {label}
        </Typography>
      </Stack>

      {!extra ? (
        <Typography
          sx={{
            mt: 1,
            minWidth: 0,
            fontSize: highlight ? 16 : 13.5,
            fontWeight: highlight ? 900 : 800,
            color: highlight ? themeColor : "text.primary",
            lineHeight: 1.45,
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {value || "No disponible"}
        </Typography>
      ) : (
        <Box sx={{ minWidth: 0, maxWidth: "100%" }}>
          {extra}
        </Box>
      )}
    </Box>
  );
}

function DestinationBlock({ destination, themeColor }) {
  const details = destination?.details || {};
  const rows = [];

  addDestinationRow(rows, "Nombre", details?.name);
  addDestinationRow(rows, "Zona", details?.zone_name);
  addDestinationRow(rows, "Área", details?.internal_area);
  addDestinationRow(rows, "Código postal", details?.postal_code);
  addDestinationRow(rows, "Dirección", details?.address);
  addDestinationRow(rows, "Descripción", details?.description);
  addDestinationRow(rows, "Fecha programada", formatDateOnly(destination?.scheduled_date));

  if (!destination?.label && rows.length === 0) return null;

  return (
    <Box
      sx={{
        mt: 2,
        p: { xs: 1.5, sm: 2 },
        border: "1px solid",
        borderColor: `${themeColor}24`,
        borderLeft: `3px solid ${themeColor}`,
        borderRadius: 1,
        backgroundColor: `${themeColor}06`,
      }}
    >
      <Stack
        direction="row"
        spacing={0.8}
        alignItems="center"
        sx={{ mb: rows.length ? 1.5 : 0 }}
      >
        <LocationOnOutlinedIcon sx={{ color: themeColor, fontSize: 20 }} />

        <Typography sx={{ fontSize: 14, fontWeight: 900, color: "text.primary" }}>
          {destination?.label || "Destino"}
        </Typography>
      </Stack>

      {rows.length ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 1,
          }}
        >
          {rows.map((row) => (
            <Box key={row.label}>
              <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: "text.secondary" }}>
                {row.label}
              </Typography>

              <Typography sx={{ mt: 0.3, fontSize: 13, color: "text.primary" }}>
                {row.value}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

function ProductItem({ item, themeColor, level = 0, isLast = false }) {
  const modifiers = Array.isArray(item?.modifiers) ? item.modifiers : [];
  const components = Array.isArray(item?.components) ? item.components : [];
  const notes = normalizeNotes(item?.notes);
  const hasDiscount = Number(item?.discount_total || 0) > 0;
  const nested = level > 0;

  return (
    <Box
      sx={{
        width: "100%",
        py: nested ? 1 : { xs: 1.4, sm: 1.6 },
        px: nested ? 1.2 : { xs: 0.25, sm: 0.5 },
        borderBottom: !nested && !isLast ? "1px solid" : "none",
        borderColor: "divider",
        backgroundColor: nested ? `${themeColor}06` : "transparent",
        borderLeft: nested ? `3px solid ${themeColor}` : "none",
        borderRadius: nested ? 1 : 0,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={{ xs: 1.5, sm: 2 }}
        alignItems="flex-start"
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontSize: nested ? 13.5 : { xs: 14.5, sm: 15 },
              fontWeight: 900,
              color: "text.primary",
              lineHeight: 1.35,
              wordBreak: "break-word",
            }}
          >
            {item?.name || item?.product_name || "Producto"}
          </Typography>

          {item?.variant_name ? (
            <Typography
              sx={{
                mt: 0.3,
                fontSize: 12.5,
                color: "text.secondary",
                lineHeight: 1.35,
              }}
            >
              {item.variant_name}
            </Typography>
          ) : null}

          <Typography
            sx={{
              mt: 0.55,
              fontSize: 12,
              fontWeight: 850,
              color: themeColor,
            }}
          >
            Cantidad: {Number(item?.quantity || 0)}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "right", flexShrink: 0 }}>
          {hasDiscount ? (
            <Typography
              sx={{
                fontSize: 11.5,
                color: "text.secondary",
                textDecoration: "line-through",
              }}
            >
              {money(item?.gross_line_total)}
            </Typography>
          ) : null}

          <Typography
            sx={{
              fontSize: nested ? 13.5 : 15,
              fontWeight: 900,
              color: "text.primary",
            }}
          >
            {money(item?.net_line_total)}
          </Typography>
        </Box>
      </Stack>

      {modifiers.length ? (
        <Stack spacing={1} sx={{ mt: 1.25 }}>
          {modifiers.map((group, groupIndex) => (
            <Box key={`${group?.group_name || "extras"}-${groupIndex}`}>
              <Typography sx={{ fontSize: 11.5, fontWeight: 900, color: "text.secondary" }}>
                {group?.group_name || "Extras"}
              </Typography>

              {(Array.isArray(group?.options) ? group.options : []).map((option, optionIndex) => (
                <Stack
                  key={`${option?.name || "extra"}-${optionIndex}`}
                  direction="row"
                  justifyContent="space-between"
                  spacing={1}
                  sx={{ mt: 0.4 }}
                >
                  <Typography sx={{ fontSize: 12.5, color: "text.primary" }}>
                    • {Number(option?.quantity || 1)} × {option?.name || "Extra"}
                  </Typography>

                  {Number(option?.total_price || 0) > 0 ? (
                    <Typography sx={{ fontSize: 12.5, color: "text.secondary", flexShrink: 0 }}>
                      {money(option.total_price)}
                    </Typography>
                  ) : null}
                </Stack>
              ))}
            </Box>
          ))}
        </Stack>
      ) : null}

      {notes ? (
        <Box
          sx={{
            mt: 1.25,
            px: 1,
            py: 0.8,
            borderLeft: `2px solid ${themeColor}`,
            backgroundColor: `${themeColor}07`,
          }}
        >
          <Typography sx={{ fontSize: 11.5, fontWeight: 900, color: "text.secondary" }}>
            Notas
          </Typography>

          <Typography sx={{ mt: 0.3, fontSize: 12.5, color: "text.primary" }}>
            {notes}
          </Typography>
        </Box>
      ) : null}

      {components.length ? (
        <Box sx={{ mt: 1.4 }}>
          <Typography sx={{ mb: 0.8, fontSize: 11.5, fontWeight: 900, color: "text.secondary" }}>
            Incluye
          </Typography>

          <Stack spacing={0.8}>
            {components.map((component, index) => (
              <ProductItem
                key={`${component?.name || "componente"}-${index}`}
                item={component}
                themeColor={themeColor}
                level={level + 1}
                isLast={index === components.length - 1}
              />
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}

function TransferCard({ transfer, themeColor, onNotify }) {
  const data = transfer?.data || {};

  const copyValue = async (value, label) => {
    const text = String(value || "").trim();
    if (!text) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      onNotify?.({
        severity: "success",
        title: "Copiado",
        message: `${label} se copió correctamente.`,
      });
    } catch {
      onNotify?.({
        severity: "error",
        title: "No se pudo copiar",
        message: `Copia manualmente ${label.toLowerCase()}.`,
      });
    }
  };

  return (
    <Card
      sx={{
        width: "100%",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              color: themeColor,
              backgroundColor: `${themeColor}12`,
            }}
          >
            <AccountBalanceRoundedIcon fontSize="small" />
          </Box>

          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 900, color: "text.primary" }}>
              Datos para transferencia
            </Typography>

            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
              Información proporcionada por la sucursal
            </Typography>
          </Box>
        </Stack>

        {!transfer?.available ? (
          <Box
            sx={{
              p: 1.5,
              border: "1px solid",
              borderColor: `${themeColor}35`,
              borderRadius: 1,
              backgroundColor: `${themeColor}08`,
            }}
          >
            <Typography sx={{ fontSize: 13, color: "text.primary", lineHeight: 1.6 }}>
              {transfer?.message || "Los datos de transferencia no están disponibles en este momento."}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.2}>
            <TransferRow label="Banco" value={data?.bank_name} />
            <TransferRow label="Beneficiario" value={data?.beneficiary_name} />

            <TransferRow
              label="Cuenta"
              value={data?.account_number}
              action={
                data?.account_number ? (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ContentCopyRoundedIcon />}
                    onClick={() => copyValue(data.account_number, "La cuenta")}
                    sx={{
                      color: themeColor,
                      borderColor: themeColor,
                      "&:hover": {
                        borderColor: themeColor,
                        backgroundColor: `${themeColor}08`,
                      },
                    }}
                  >
                    Copiar
                  </Button>
                ) : null
              }
            />

            <TransferRow
              label="CLABE"
              value={data?.clabe}
              action={
                data?.clabe ? (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ContentCopyRoundedIcon />}
                    onClick={() => copyValue(data.clabe, "La CLABE")}
                    sx={{
                      color: themeColor,
                      borderColor: themeColor,
                      "&:hover": {
                        borderColor: themeColor,
                        backgroundColor: `${themeColor}08`,
                      },
                    }}
                  >
                    Copiar
                  </Button>
                ) : null
              }
            />

            {data?.instructions ? (
              <Box
                sx={{
                  p: 1.5,
                  border: "1px solid",
                  borderColor: `${themeColor}24`,
                  borderRadius: 1,
                  backgroundColor: `${themeColor}06`,
                }}
              >
                <Typography sx={{ fontSize: 11.5, fontWeight: 900, color: "text.secondary" }}>
                  Indicaciones
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 13,
                    color: "text.primary",
                    whiteSpace: "pre-line",
                  }}
                >
                  {data.instructions}
                </Typography>
              </Box>
            ) : null}
          </Stack>
        )}
      </Box>
    </Card>
  );
}

function TransferRow({ label, value, action }) {
  if (!value) return null;

  return (
    <Box
      sx={{
        minHeight: 58,
        p: 1.25,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        backgroundColor: "background.default",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 11.5, fontWeight: 900, color: "text.secondary" }}>
            {label}
          </Typography>

          <Typography
            sx={{
              mt: 0.3,
              fontSize: 13.5,
              fontWeight: 800,
              color: "text.primary",
              wordBreak: "break-all",
            }}
          >
            {value}
          </Typography>
        </Box>

        {action}
      </Stack>
    </Box>
  );
}

function SummaryRow({ label, value, valueColor = "text.primary" }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ py: 0.55 }}>
      <Typography sx={{ fontSize: 13.5, color: "text.secondary" }}>
        {label}
      </Typography>

      <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: valueColor }}>
        {value}
      </Typography>
    </Stack>
  );
}

function addDestinationRow(rows, label, value) {
  const normalized = String(value || "").trim();
  if (normalized) rows.push({ label, value: normalized });
}

function resolveTimingLabel(data) {
  if (String(data?.timing_type || "") === "scheduled" && data?.requested_for_at) {
    return formatDateTime(data.requested_for_at);
  }

  return data?.timing_type_label || "No disponible";
}

function normalizeNotes(value) {
  if (!value) return "";

  if (typeof value === "string") return value.trim();

  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean)
      .join(" · ");
  }

  if (typeof value === "object") {
    return Object.values(value)
      .filter((item) => typeof item === "string" || typeof item === "number")
      .map((item) => String(item).trim())
      .filter(Boolean)
      .join(" · ");
  }

  return "";
}

function formatDateTime(value) {
  if (!value) return "No disponible";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No disponible";

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDateOnly(value) {
  if (!value) return "";

  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
  }).format(date);
}

function money(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value || 0));
}