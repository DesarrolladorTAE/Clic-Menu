export const PROMOTION_TYPES = [
  {
    value: "promotional_price",
    label: "Precio especial",
    description: "Precio promocional por producto y canal.",
  },
  {
    value: "buy_x_pay_y",
    label: "Compra X y paga Y",
    description: "Promociones como 2x1, 3x2 o 4x3.",
  },
  {
    value: "product_discount",
    label: "Descuento por producto",
    description: "Descuento porcentual o por monto fijo.",
  },
];

export function getPromotionType(type) {
  return (
    PROMOTION_TYPES.find((item) => item.value === type) ||
    PROMOTION_TYPES[0]
  );
}

export function getMexicoCurrentDate() {
  const parts = new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export function normalizeDateValue(value) {
  if (!value) return null;

  const match = String(value).match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}

export function formatDate(value) {
  const normalized = normalizeDateValue(value);

  if (!normalized) return "Sin límite";

  const [year, month, day] = normalized.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getPromotionDateState(promotion) {
  const today = getMexicoCurrentDate();
  const startsOn = normalizeDateValue(promotion?.starts_on);
  const endsOn = normalizeDateValue(promotion?.ends_on);

  if (startsOn && startsOn > today) {
    return {
      value: "upcoming",
      label: "Próxima",
      color: "info",
    };
  }

  if (endsOn && endsOn < today) {
    return {
      value: "finished",
      label: "Finalizada",
      color: "default",
    };
  }

  return {
    value: "current",
    label: "Vigente",
    color: "success",
  };
}

export function isPromotionCurrent(promotion) {
  return (
    promotion?.status === "active" &&
    getPromotionDateState(promotion).value === "current"
  );
}

export function formatPromotionValidity(promotion) {
  const startsOn = normalizeDateValue(promotion?.starts_on);
  const endsOn = normalizeDateValue(promotion?.ends_on);

  if (!startsOn && !endsOn) {
    return "Sin límite de fechas";
  }

  if (startsOn && endsOn) {
    return `${formatDate(startsOn)} al ${formatDate(endsOn)}`;
  }

  if (startsOn) {
    return `Desde ${formatDate(startsOn)}`;
  }

  return `Hasta ${formatDate(endsOn)}`;
}

function getBranchChannelId(channel) {
  return (
    channel?.branch_sales_channel_id ??
    channel?.branchSalesChannelId ??
    channel?.branch_sales_channel?.id ??
    null
  );
}

function getChannelName(channel) {
  return (
    channel?.branch_sales_channel?.sales_channel?.name ||
    channel?.branch_sales_channel?.sales_channel?.label ||
    channel?.branch_sales_channel?.name ||
    channel?.sales_channel?.name ||
    channel?.sales_channel?.label ||
    channel?.channel_name ||
    channel?.name ||
    (getBranchChannelId(channel)
      ? `Canal ${getBranchChannelId(channel)}`
      : "Canal")
  );
}

export function getPromotionChannels(promotion) {
  const channels = Array.isArray(promotion?.channels)
    ? promotion.channels
    : Array.isArray(promotion?.promotion_channels)
    ? promotion.promotion_channels
    : [];

  return Array.from(
    new Set(
      channels
        .map((channel) => getChannelName(channel))
        .filter(Boolean)
    )
  );
}

export function getPromotionTargets(promotion) {
  if (Array.isArray(promotion?.targets)) {
    return promotion.targets;
  }

  if (Array.isArray(promotion?.promotion_targets)) {
    return promotion.promotion_targets;
  }

  return [];
}

export function getPromotionSchedules(promotion) {
  if (Array.isArray(promotion?.schedules)) {
    return promotion.schedules;
  }

  if (Array.isArray(promotion?.promotion_schedules)) {
    return promotion.promotion_schedules;
  }

  return [];
}

export function getPromotionRuleSummary(promotion) {
  if (promotion?.type === "promotional_price") {
    const prices = getPromotionTargets(promotion).reduce(
      (total, target) => {
        const channelPrices = Array.isArray(target?.channel_prices)
          ? target.channel_prices
          : Array.isArray(target?.channelPrices)
          ? target.channelPrices
          : Array.isArray(
              target?.promotion_target_channel_prices
            )
          ? target.promotion_target_channel_prices
          : [];

        return total + channelPrices.length;
      },
      0
    );

    return {
      label: "Precios configurados",
      value:
        prices === 1
          ? "1 precio promocional"
          : `${prices} precios promocionales`,
    };
  }

  if (promotion?.type === "buy_x_pay_y") {
    const rule =
      promotion?.buy_x_pay_y_rule ||
      promotion?.buyXPayYRule ||
      promotion?.promotion_buy_x_pay_y_rule ||
      {};

    const buyQuantity = Number(rule?.buy_quantity || 0);
    const payQuantity = Number(rule?.pay_quantity || 0);

    const grouping =
      rule?.grouping_mode === "same_product"
        ? "Mismo producto"
        : "Productos combinados";

    return {
      label: "Regla",
      value:
        buyQuantity && payQuantity
          ? `Compra ${buyQuantity}, paga ${payQuantity}`
          : "Regla pendiente",
      helper: grouping,
    };
  }

  const rule =
    promotion?.discount_rule ||
    promotion?.discountRule ||
    promotion?.promotion_discount_rule ||
    {};

  const discountValue = Number(rule?.discount_value || 0);

  const value =
    rule?.discount_type === "percent"
      ? `${discountValue}%`
      : `$${discountValue.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

  return {
    label: "Descuento",
    value: discountValue ? value : "Descuento pendiente",
    helper:
      rule?.discount_type === "fixed"
        ? "Monto fijo"
        : "Porcentaje",
  };
}

export function getPromotionSearchText(promotion) {
  return [
    promotion?.name,
    promotion?.description,
    ...getPromotionChannels(promotion),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("es-MX");
}
