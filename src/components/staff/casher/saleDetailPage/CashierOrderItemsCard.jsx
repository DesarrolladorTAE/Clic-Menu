import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

export default function CashierOrderItemsCard({
  itemsTree = [],
  itemsSummary = null,
}) {
  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
        backgroundColor: "background.paper",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Box>
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Detalle de productos
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 14,
                color: "text.secondary",
              }}
            >
              Revisión visual de la orden antes del cobro.
            </Typography>
          </Box>

          {itemsSummary ? (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {typeof itemsSummary?.items_count === "number" ? (
                <Chip label={`${itemsSummary.items_count} ítems`} size="small" />
              ) : null}

              {typeof itemsSummary?.modifiers_count === "number" ? (
                <Chip
                  label={`${itemsSummary.modifiers_count} modificadores`}
                  size="small"
                />
              ) : null}

              {typeof itemsSummary?.total_quantity === "number" ? (
                <Chip
                  label={`${itemsSummary.total_quantity} unidades`}
                  size="small"
                />
              ) : null}
            </Stack>
          ) : null}

          {Array.isArray(itemsTree) && itemsTree.length > 0 ? (
            <Stack spacing={1.5}>
              {itemsTree.map((item, index) => (
                <Box key={item?.id || index}>
                  <OrderItemBlock item={item} />

                  {index < itemsTree.length - 1 ? <Divider /> : null}
                </Box>
              ))}
            </Stack>
          ) : (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "#FCFCFC",
                px: 2,
                py: 4,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                No hay ítems para mostrar
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  fontSize: 14,
                  color: "text.secondary",
                }}
              >
                El detalle de la orden no devolvió productos visibles.
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function OrderItemBlock({ item, level = 0 }) {
  const children = Array.isArray(item?.children) ? item.children : [];
  const modifiers = Array.isArray(item?.modifiers) ? item.modifiers : [];
  const quantity = Number(item?.quantity ?? item?.qty ?? 1);
  const unitPrice = Number(item?.unit_price ?? item?.price ?? 0);
  const total = Number(item?.total ?? quantity * unitPrice);

  return (
    <Box sx={{ pl: level > 0 ? 2.5 : 0 }}>
      <Stack spacing={1.15} sx={{ py: 1 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={1}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: level === 0 ? 16 : 14,
                fontWeight: 800,
                color: "text.primary",
                lineHeight: 1.3,
                wordBreak: "break-word",
              }}
            >
              {quantity} × {item?.name || "Producto"}
            </Typography>

            {item?.notes ? (
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "text.secondary",
                  wordBreak: "break-word",
                }}
              >
                Nota: {item.notes}
              </Typography>
            ) : null}
          </Box>

          <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
            <Typography
              sx={{
                fontSize: 13,
                color: "text.secondary",
              }}
            >
              Unitario {formatCurrency(unitPrice)}
            </Typography>

            <Typography
              sx={{
                mt: 0.25,
                fontSize: 14,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              {formatCurrency(total)}
            </Typography>
          </Box>
        </Stack>

        {modifiers.length > 0 ? (
          <Stack spacing={0.5}>
            {modifiers.map((mod, idx) => {
              const modQty = Number(mod?.quantity ?? 1);
              const modPrice = Number(mod?.price ?? mod?.unit_price ?? 0);

              return (
                <Box
                  key={mod?.id || `${mod?.name || "mod"}-${idx}`}
                  sx={{
                    borderRadius: 1,
                    px: 1.25,
                    py: 0.9,
                    bgcolor: "rgba(255, 152, 0, 0.06)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "text.primary",
                      wordBreak: "break-word",
                    }}
                  >
                    + {modQty} × {mod?.name || "Modificador"}{" "}
                    {modPrice ? `(${formatCurrency(modPrice)})` : ""}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        ) : null}

        {children.length > 0 ? (
          <Stack spacing={0.5}>
            {children.map((child, idx) => (
              <OrderItemBlock
                key={child?.id || `${child?.name || "child"}-${idx}`}
                item={child}
                level={level + 1}
              />
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}

function formatCurrency(value) {
  const safe = Number(value || 0);

  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `$${safe.toFixed(2)}`;
  }
}
