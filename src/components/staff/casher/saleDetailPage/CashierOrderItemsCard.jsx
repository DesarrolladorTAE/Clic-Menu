// src/components/staff/casher/saleDetailPage/CashierOrderItemsCard.jsx
import React, { useMemo } from "react";
import {
  Box, Card, CardContent, Chip, Divider, Stack, Typography,
} from "@mui/material";

import PaginationFooter from "../../../common/PaginationFooter";
import usePagination from "../../../../hooks/usePagination";

const PAGE_SIZE = 5;

export default function CashierOrderItemsCard({
  itemsTree = [],
}) {
  const normalizedItems = useMemo(() => {
    return normalizeCheckItems(itemsTree);
  }, [itemsTree]);

  const itemsSummary = useMemo(() => {
    return buildItemsSummary(normalizedItems);
  }, [normalizedItems]);

  const {
    page,
    total,
    totalPages,
    startItem,
    endItem,
    hasPrev,
    hasNext,
    nextPage,
    prevPage,
    paginatedItems,
  } = usePagination({
    items: normalizedItems,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const hasItems = normalizedItems.length > 0;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
        backgroundColor: "background.paper",
        overflow: "hidden",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3 },
          flex: 1,
        }}
      >
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
              Productos asignados exclusivamente a la cuenta seleccionada.
            </Typography>
          </Box>

          {hasItems ? (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={`${itemsSummary.items_count} ítems`}
                size="small"
              />

              <Chip
                label={`${itemsSummary.parent_items_count} principales`}
                size="small"
              />

              <Chip
                label={`${itemsSummary.children_items_count} componentes`}
                size="small"
              />

              <Chip
                label={`${itemsSummary.modifiers_count} modificadores`}
                size="small"
              />
            </Stack>
          ) : null}

          {hasItems ? (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "#FCFCFC",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  maxHeight: { xs: 520, md: 620 },
                  overflowY: "auto",
                  px: { xs: 1.5, sm: 2 },
                  py: 1,
                }}
              >
                <Stack spacing={1.5}>
                  {paginatedItems.map((item, index) => (
                    <Box
                      key={
                        item?.order_check_item_id ||
                        item?.id ||
                        `${item?.order_item_id || "item"}-${index}`
                      }
                    >
                      <OrderItemBlock item={item} />

                      {index < paginatedItems.length - 1 ? <Divider /> : null}
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
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
                La cuenta seleccionada no tiene productos asignados.
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>

      {hasItems ? (
        <PaginationFooter
          page={page}
          totalPages={totalPages}
          startItem={startItem}
          endItem={endItem}
          total={total}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={prevPage}
          onNext={nextPage}
          itemLabel="productos"
        />
      ) : null}
    </Card>
  );
}

function OrderItemBlock({ item, level = 0 }) {
  const children = Array.isArray(item?.children) ? item.children : [];
  const modifierGroups = Array.isArray(item?.modifier_groups_display)
    ? item.modifier_groups_display
    : [];
  const rawModifiers = Array.isArray(item?.modifiers) ? item.modifiers : [];
  const appliedPromotions = Array.isArray(item?.applied_promotions)
    ? item.applied_promotions
    : [];

  const quantity = toNumber(item?.quantity ?? item?.qty, 1);
  const unitPrice = toNumber(item?.unit_price ?? item?.price, 0);

  const baseLineTotal = toNumber(
    item?.base_line_total ??
      item?.gross_line_total ??
      item?.line_total ??
      item?.total,
    0
  );

  const modifiersTotal = toNumber(item?.modifiers_total, 0);
  const promotionDiscountTotal = toNumber(
    item?.promotion_discount_total,
    0
  );
  const manualDiscountTotal = toNumber(
    item?.manual_discount_total,
    0
  );
  const cancellationTotal = toNumber(
    item?.cancellation_total,
    0
  );

  const netLineTotal = toNumber(
    item?.net_line_total ??
      item?.total ??
      item?.line_total,
    0
  );

  const itemName = resolveItemName(item);
  const itemTypeLabel = resolveItemTypeLabel(item, level);
  const noteText = formatNotes(item?.notes);

  return (
    <Box sx={{ pl: level > 0 ? 2.5 : 0 }}>
      <Stack spacing={0.8} sx={{ py: 0.75 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={0.75}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              <Typography
                sx={{
                  fontSize: level === 0 ? 16 : 14,
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.3,
                  wordBreak: "break-word",
                }}
              >
                {formatQuantity(quantity)} × {itemName}
              </Typography>

              {itemTypeLabel ? (
                <Chip
                  label={itemTypeLabel}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: 12,
                    fontWeight: 800,
                    bgcolor:
                      level > 0
                        ? "rgba(255,152,0,0.10)"
                        : "#F5F5F5",
                  }}
                />
              ) : null}
            </Stack>

            {quantity > 1 && unitPrice > 0 ? (
              <Typography
                sx={{
                  mt: 0.25,
                  fontSize: 12,
                  color: "text.secondary",
                }}
              >
                {formatCurrency(unitPrice)} c/u
              </Typography>
            ) : null}

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

          <Box
            sx={{
              width: { xs: "100%", sm: 230 },
              flexShrink: 0,
            }}
          >
            <Stack spacing={0.35}>
              <ItemAmountRow
                label="Base del producto"
                value={formatCurrency(baseLineTotal)}
              />

              {modifiersTotal > 0 ? (
                <ItemAmountRow
                  label="Modificadores"
                  value={formatCurrency(modifiersTotal)}
                />
              ) : null}

              {promotionDiscountTotal > 0 ? (
                <ItemAmountRow
                  label="Promoción automática"
                  value={formatDiscountCurrency(promotionDiscountTotal)}
                  negative
                />
              ) : null}

              {manualDiscountTotal > 0 ? (
                <ItemAmountRow
                  label="Descuento manual"
                  value={formatDiscountCurrency(manualDiscountTotal)}
                  negative
                />
              ) : null}

              {cancellationTotal > 0 ? (
                <ItemAmountRow
                  label="Cancelaciones"
                  value={formatDiscountCurrency(cancellationTotal)}
                  negative
                />
              ) : null}

              <Divider sx={{ my: 0.2 }} />

              <ItemAmountRow
                label="Total neto"
                value={formatCurrency(netLineTotal)}
                strong
              />
            </Stack>
          </Box>
        </Stack>

        {appliedPromotions.length > 0 ? (
          <PromotionApplicationsBlock promotions={appliedPromotions} />
        ) : null}

        {modifierGroups.length > 0 ? (
          <Stack spacing={0.75}>
            {modifierGroups.map((group, index) => (
              <ModifierGroupBlock
                key={`${group?.group_name || "grupo"}-${index}`}
                group={group}
              />
            ))}
          </Stack>
        ) : rawModifiers.length > 0 ? (
          <Stack spacing={0.5}>
            {rawModifiers.map((modifier, index) => {
              const modifierQuantity = toNumber(modifier?.quantity, 1);

              const modifierTotal = toNumber(
                modifier?.total_price ??
                  modifier?.line_total ??
                  modifier?.amount ??
                  modifier?.price,
                0
              );

              const modifierName =
                modifier?.name_snapshot ||
                modifier?.name ||
                "Modificador";

              return (
                <Box
                  key={
                    modifier?.id ||
                    `${modifierName}-${index}`
                  }
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
                    + {formatQuantity(modifierQuantity)} × {modifierName}
                    {modifierTotal > 0
                      ? ` (${formatCurrency(modifierTotal)})`
                      : ""}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        ) : null}

        {children.length > 0 ? (
          <Stack spacing={0.5}>
            {children.map((child, index) => (
              <OrderItemBlock
                key={
                  child?.order_check_item_id ||
                  child?.id ||
                  `${child?.order_item_id || resolveItemName(child)}-${index}`
                }
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

function normalizeCheckItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  const normalized = items.map((item) => normalizeCheckItem(item));
  const alreadyNested = normalized.some(
    (item) => Array.isArray(item.children) && item.children.length > 0
  );

  return alreadyNested
    ? normalized
    : buildCheckItemsTree(normalized);
}

function normalizeCheckItem(item) {
  const safeItem = item && typeof item === "object" ? item : {};
  const meta = resolveMeta(safeItem.meta_json);

  const children = resolveFirstArray(
    safeItem.children,
    meta.children
  ).map((child) => normalizeCheckItem(child));

  const modifierGroups = resolveFirstArray(
    safeItem.modifier_groups_display,
    meta.modifier_groups_display
  );

  const modifiers = resolveFirstArray(
    safeItem.modifiers,
    meta.modifiers
  );

  const appliedPromotions = resolveFirstArray(
    safeItem.applied_promotions,
    meta.applied_promotions
  );

  const orderCheckItemId = normalizeNullableId(
    safeItem.order_check_item_id ??
      safeItem.id ??
      meta.order_check_item_id
  );

  const orderItemId = normalizeNullableId(
    safeItem.order_item_id ??
      meta.order_item_id
  );

  const parentOrderItemId = normalizeNullableId(
    safeItem.parent_order_item_id ??
      meta.parent_order_item_id
  );

  return {
    ...meta,
    ...safeItem,
    id: orderCheckItemId ?? safeItem.id ?? null,
    order_check_item_id: orderCheckItemId,
    order_item_id: orderItemId,
    parent_order_item_id: parentOrderItemId,
    display_name:
      safeItem.display_name ??
      meta.display_name ??
      null,
    product_name:
      safeItem.product_name ??
      meta.product_name ??
      null,
    variant_name:
      safeItem.variant_name ??
      meta.variant_name ??
      null,
    notes:
      safeItem.notes ??
      meta.notes ??
      null,
    item_kind:
      safeItem.item_kind ??
      meta.item_kind ??
      null,
    is_composite_parent: Boolean(
      safeItem.is_composite_parent ??
        meta.is_composite_parent ??
        children.length > 0
    ),
    modifier_groups_display: modifierGroups,
    modifiers,
    applied_promotions: appliedPromotions,
    children,
  };
}

function buildCheckItemsTree(items) {
  const nodes = items.map((item) => ({
    ...item,
    children: [],
  }));

  const byOrderItemId = new Map();

  nodes.forEach((item) => {
    if (
      item.order_item_id &&
      !byOrderItemId.has(item.order_item_id)
    ) {
      byOrderItemId.set(item.order_item_id, item);
    }
  });

  const roots = [];

  nodes.forEach((item) => {
    const parentOrderItemId = item.parent_order_item_id;

    if (
      parentOrderItemId &&
      parentOrderItemId !== item.order_item_id
    ) {
      const parent = byOrderItemId.get(parentOrderItemId);

      if (parent) {
        parent.children.push(item);
        parent.is_composite_parent = true;
        return;
      }
    }

    roots.push(item);
  });

  return roots;
}

function buildItemsSummary(items) {
  const summary = {
    items_count: 0,
    parent_items_count: Array.isArray(items) ? items.length : 0,
    children_items_count: 0,
    modifiers_count: 0,
  };

  const walk = (rows, level = 0) => {
    if (!Array.isArray(rows)) return;

    rows.forEach((item) => {
      summary.items_count += 1;

      if (level > 0) {
        summary.children_items_count += 1;
      }

      const modifierGroups = Array.isArray(
        item?.modifier_groups_display
      )
        ? item.modifier_groups_display
        : [];

      const rawModifiers = Array.isArray(item?.modifiers)
        ? item.modifiers
        : [];

      const groupedModifiersCount = modifierGroups.reduce(
        (count, group) => {
          const options = Array.isArray(group?.options)
            ? group.options
            : [];

          return count + options.length;
        },
        0
      );

      summary.modifiers_count +=
        groupedModifiersCount > 0
          ? groupedModifiersCount
          : rawModifiers.length;

      walk(item?.children, level + 1);
    });
  };

  walk(items);

  return summary;
}

function resolveMeta(metaJson) {
  if (!metaJson) {
    return {};
  }

  if (
    typeof metaJson === "object" &&
    !Array.isArray(metaJson)
  ) {
    return metaJson;
  }

  if (typeof metaJson === "string") {
    try {
      const parsed = JSON.parse(metaJson);

      return parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  }

  return {};
}

function resolveFirstArray(...values) {
  const found = values.find((value) => Array.isArray(value));
  return found || [];
}

function normalizeNullableId(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = Number(value);

  return Number.isInteger(normalized) && normalized > 0
    ? normalized
    : null;
}

function ItemAmountRow({
  label,
  value,
  strong = false,
  muted = false,
  negative = false,
}) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={1}
    >
      <Typography
        sx={{
          fontSize: strong ? 13 : 12,
          fontWeight: strong ? 800 : 700,
          color: muted ? "text.secondary" : "text.primary",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: strong ? 14 : 12,
          fontWeight: strong ? 900 : 800,
          color: negative ? "error.main" : "text.primary",
          textAlign: "right",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function PromotionApplicationsBlock({ promotions = [] }) {
  const rows = Array.isArray(promotions) ? promotions : [];

  if (rows.length === 0) return null;

  return (
    <Box
      sx={{
        borderRadius: 1,
        backgroundColor: "rgba(255, 152, 0, 0.06)",
        px: 1,
        py: 0.7,
      }}
    >
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 900,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.2,
        }}
      >
        {rows.length === 1
          ? "Promoción aplicada"
          : "Promociones aplicadas"}
      </Typography>

      <Stack spacing={0.3} sx={{ mt: 0.35 }}>
        {rows.map((promotion, index) => {
          const name =
            String(
              promotion?.promotion_name ||
                promotion?.name ||
                ""
            ).trim() || "Promoción automática";

          const typeLabel = resolvePromotionTypeLabel(
            promotion?.promotion_type ??
              promotion?.type
          );

          return (
            <Typography
              key={
                promotion?.order_item_promotion_application_id ||
                promotion?.id ||
                `${name}-${index}`
              }
              sx={{
                fontSize: 12,
                color: "text.secondary",
                lineHeight: 1.35,
                wordBreak: "break-word",
              }}
            >
              <Box
                component="span"
                sx={{
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                {name}
              </Box>

              {" · "}

              {typeLabel}
            </Typography>
          );
        })}
      </Stack>
    </Box>
  );
}

function ModifierGroupBlock({ group }) {
  const options = Array.isArray(group?.options)
    ? group.options
    : [];

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
        {options.map((option, index) => {
          const quantity = toNumber(option?.quantity, 1);

          const totalPrice = toNumber(
            option?.total_price ??
              option?.line_total ??
              option?.amount,
            0
          );

          const name =
            option?.name ||
            option?.name_snapshot ||
            "Modificador";

          return (
            <Typography
              key={option?.id || `${name}-${index}`}
              sx={{
                fontSize: 13,
                color: "text.primary",
                wordBreak: "break-word",
              }}
            >
              + {formatQuantity(quantity)} × {name}
              {totalPrice > 0
                ? ` (${formatCurrency(totalPrice)})`
                : ""}
            </Typography>
          );
        })}
      </Stack>
    </Box>
  );
}

function resolveItemName(item) {
  const displayName =
    typeof item?.display_name === "string"
      ? item.display_name.trim()
      : "";

  const productName =
    typeof item?.product_name === "string"
      ? item.product_name.trim()
      : "";

  const variantName =
    typeof item?.variant_name === "string"
      ? item.variant_name.trim()
      : "";

  const snapshotName =
    typeof item?.name_snapshot === "string"
      ? item.name_snapshot.trim()
      : "";

  if (displayName) return displayName;
  if (productName && variantName) {
    return `${productName} · ${variantName}`;
  }
  if (productName) return productName;
  if (variantName) return variantName;
  if (snapshotName) return snapshotName;

  return "Producto";
}

function resolveItemTypeLabel(item, level) {
  const children = Array.isArray(item?.children)
    ? item.children
    : [];

  if (item?.is_composite_parent || children.length > 0) {
    return "Compuesto";
  }

  if (
    item?.item_kind === "composite_child" ||
    item?.parent_order_item_id ||
    level > 0
  ) {
    return "Componente";
  }

  if (item?.variant_name) {
    return "Variante";
  }

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
        if (typeof entry === "string") {
          return entry.trim();
        }

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
        if (
          value === null ||
          value === undefined ||
          value === ""
        ) {
          return null;
        }

        if (typeof value === "object") {
          return `${key}: ${JSON.stringify(value)}`;
        }

        return `${key}: ${value}`;
      })
      .filter(Boolean)
      .join(", ");
  }

  return String(notes);
}

function resolvePromotionTypeLabel(type) {
  const key = String(type || "").trim().toLowerCase();

  const labels = {
    promotional_price: "Precio promocional",
    buy_x_pay_y: "Compra X y paga Y",
    product_discount: "Descuento de producto",
  };

  return labels[key] || "Promoción automática";
}

function toNumber(value, fallback = 0) {
  const normalized = Number(value);

  return Number.isFinite(normalized)
    ? normalized
    : fallback;
}

function formatQuantity(value) {
  const quantity = toNumber(value, 0);

  return Number.isInteger(quantity)
    ? String(quantity)
    : quantity.toLocaleString("es-MX", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
      });
}

function formatDiscountCurrency(value) {
  const amount = Math.abs(toNumber(value, 0));

  return `-${formatCurrency(amount)}`;
}

function formatCurrency(value) {
  const safe = toNumber(value, 0);

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
