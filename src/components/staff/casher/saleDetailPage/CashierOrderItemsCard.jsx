// Tarjeta detalles del producto
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

              {typeof itemsSummary?.parent_items_count === "number" ? (
                <Chip
                  label={`${itemsSummary.parent_items_count} principales`}
                  size="small"
                />
              ) : null}

              {typeof itemsSummary?.children_items_count === "number" ? (
                <Chip
                  label={`${itemsSummary.children_items_count} componentes`}
                  size="small"
                />
              ) : null}

              {typeof itemsSummary?.modifiers_count === "number" ? (
                <Chip
                  label={`${itemsSummary.modifiers_count} modificadores`}
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
  const modifierGroups = Array.isArray(item?.modifier_groups_display)
    ? item.modifier_groups_display
    : [];
  const rawModifiers = Array.isArray(item?.modifiers) ? item.modifiers : [];

  const quantity = Number(item?.quantity ?? item?.qty ?? 1);
  const unitPrice = Number(item?.unit_price ?? item?.price ?? 0);
  const total = Number(item?.line_total ?? item?.total ?? quantity * unitPrice);

  const itemName = resolveItemName(item);
  const itemTypeLabel = resolveItemTypeLabel(item, level);
  const noteText = formatNotes(item?.notes);

  return (
    <Box sx={{ pl: level > 0 ? 2.5 : 0 }}>
      <Stack spacing={1.15} sx={{ py: 1 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={1}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography
                sx={{
                  fontSize: level === 0 ? 16 : 14,
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.3,
                  wordBreak: "break-word",
                }}
              >
                {quantity} × {itemName}
              </Typography>

              {itemTypeLabel ? (
                <Chip
                  label={itemTypeLabel}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: 12,
                    fontWeight: 800,
                    bgcolor: level > 0 ? "rgba(255,152,0,0.10)" : "#F5F5F5",
                  }}
                />
              ) : null}
            </Stack>

            {noteText ? (
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "text.secondary",
                  wordBreak: "break-word",
                }}
              >
                Nota: {noteText}
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

        {modifierGroups.length > 0 ? (
          <Stack spacing={0.75}>
            {modifierGroups.map((group, idx) => (
              <ModifierGroupBlock
                key={`${group?.group_name || "grupo"}-${idx}`}
                group={group}
              />
            ))}
          </Stack>
        ) : rawModifiers.length > 0 ? (
          <Stack spacing={0.5}>
            {rawModifiers.map((mod, idx) => {
              const modQty = Number(mod?.quantity ?? 1);
              const modPrice = Number(
                mod?.total_price ?? mod?.price ?? mod?.unit_price ?? 0
              );
              const modName =
                mod?.name_snapshot || mod?.name || "Modificador";

              return (
                <Box
                  key={mod?.id || `${modName}-${idx}`}
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
                    + {modQty} × {modName}{" "}
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
                key={child?.id || `${resolveItemName(child)}-${idx}`}
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

function ModifierGroupBlock({ group }) {
  const options = Array.isArray(group?.options) ? group.options : [];
  const contextLabel = group?.context_label;
  const groupName = group?.group_name || "Extras";

  return (
    <Box
      sx={{
        borderRadius: 1,
        px: 1.25,
        py: 1,
        bgcolor: "rgba(255, 152, 0, 0.06)",
      }}
    >
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 800,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.2,
          wordBreak: "break-word",
        }}
      >
        {groupName}
        {contextLabel ? ` · ${contextLabel}` : ""}
      </Typography>

      <Stack spacing={0.35} sx={{ mt: 0.6 }}>
        {options.map((option, idx) => {
          const qty = Number(option?.quantity ?? 1);
          const totalPrice = Number(option?.total_price ?? 0);
          const name = option?.name || "Modificador";

          return (
            <Typography
              key={option?.id || `${name}-${idx}`}
              sx={{
                fontSize: 13,
                color: "text.primary",
                wordBreak: "break-word",
              }}
            >
              + {qty} × {name}{" "}
              {totalPrice ? `(${formatCurrency(totalPrice)})` : ""}
            </Typography>
          );
        })}
      </Stack>
    </Box>
  );
}

function resolveItemName(item) {
  const displayName =
    typeof item?.display_name === "string" ? item.display_name.trim() : "";
  const productName =
    typeof item?.product_name === "string" ? item.product_name.trim() : "";
  const variantName =
    typeof item?.variant_name === "string" ? item.variant_name.trim() : "";

  if (displayName) return displayName;
  if (productName && variantName) return `${productName} · ${variantName}`;
  if (productName) return productName;
  if (variantName) return variantName;
  return "Producto";
}

function resolveItemTypeLabel(item, level) {
  if (item?.is_composite_parent) return "Compuesto";
  if (item?.item_kind === "composite_child") return "Componente";
  if (level > 0) return "Componente";
  if (item?.variant_name) return "Variante";
  return null;
}

function formatNotes(notes) {
  if (!notes) return "";

  if (typeof notes === "string") {
    return notes.trim();
  }

  if (Array.isArray(notes)) {
    return notes
      .map((entry) => {
        if (typeof entry === "string") return entry.trim();
        if (entry && typeof entry === "object") {
          return Object.values(entry)
            .filter(Boolean)
            .join(" ");
        }
        return "";
      })
      .filter(Boolean)
      .join(", ");
  }

  if (typeof notes === "object") {
    return Object.entries(notes)
      .map(([key, value]) => {
        if (value === null || value === undefined || value === "") return null;
        if (typeof value === "object") return `${key}: ${JSON.stringify(value)}`;
        return `${key}: ${value}`;
      })
      .filter(Boolean)
      .join(", ");
  }

  return String(notes);
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