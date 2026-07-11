import api from "../../api";

function extractArray(payload, keys = []) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  return [];
}

function extractEntity(payload, keys = []) {
  const source = payload?.data ?? payload;

  if (!source || typeof source !== "object") {
    return null;
  }

  for (const key of keys) {
    if (source?.[key] && typeof source[key] === "object") {
      return source[key];
    }
  }

  return source;
}

function normalizeDate(value) {
  if (!value) return null;

  const match = String(value).match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}

function normalizeTime(value) {
  if (!value) return "";

  const match = String(value).match(/^\d{2}:\d{2}/);
  return match ? match[0] : String(value);
}

function getBranchSalesChannelId(channel) {
  return (
    channel?.branch_sales_channel_id ??
    channel?.branchSalesChannelId ??
    channel?.branch_sales_channel?.id ??
    null
  );
}

function getProductId(target) {
  return target?.product_id ?? target?.product?.id ?? null;
}

function getProductVariantId(target) {
  return (
    target?.product_variant_id ??
    target?.variant_id ??
    target?.product_variant?.id ??
    target?.variant?.id ??
    null
  );
}

function buildPromotionChannels(promotion) {
  const channels = Array.isArray(promotion?.channels)
    ? promotion.channels
    : Array.isArray(promotion?.promotion_channels)
    ? promotion.promotion_channels
    : [];

  return channels
    .map((channel) => ({
      branch_sales_channel_id: getBranchSalesChannelId(channel),
    }))
    .filter((channel) => channel.branch_sales_channel_id);
}

function buildPromotionSchedules(promotion) {
  const schedules = Array.isArray(promotion?.schedules)
    ? promotion.schedules
    : Array.isArray(promotion?.promotion_schedules)
    ? promotion.promotion_schedules
    : [];

  return schedules
    .map((schedule) => ({
      day_of_week: Number(schedule?.day_of_week),
      start_time: normalizeTime(schedule?.start_time),
      end_time: normalizeTime(schedule?.end_time),
    }))
    .filter(
      (schedule) =>
        schedule.day_of_week &&
        schedule.start_time &&
        schedule.end_time
    );
}

function buildTargetChannelPrices(target) {
  const prices = Array.isArray(target?.channel_prices)
    ? target.channel_prices
    : Array.isArray(target?.channelPrices)
    ? target.channelPrices
    : Array.isArray(target?.promotion_target_channel_prices)
    ? target.promotion_target_channel_prices
    : [];

  return prices
    .map((price) => ({
      branch_sales_channel_id: getBranchSalesChannelId(price),
      promotional_unit_price: Number(price?.promotional_unit_price),
    }))
    .filter(
      (price) =>
        price.branch_sales_channel_id &&
        Number.isFinite(price.promotional_unit_price)
    );
}

function buildPromotionTargets(promotion) {
  const targets = Array.isArray(promotion?.targets)
    ? promotion.targets
    : Array.isArray(promotion?.promotion_targets)
    ? promotion.promotion_targets
    : [];

  return targets
    .map((target) => {
      const result = {
        product_id: getProductId(target),
        product_variant_id: getProductVariantId(target),
      };

      const channelPrices = buildTargetChannelPrices(target);

      if (channelPrices.length > 0) {
        result.channel_prices = channelPrices;
      }

      return result;
    })
    .filter((target) => target.product_id);
}

function buildBuyXPayYRule(promotion) {
  const rule =
    promotion?.buy_x_pay_y_rule ??
    promotion?.buyXPayYRule ??
    promotion?.promotion_buy_x_pay_y_rule ??
    null;

  if (!rule) return null;

  return {
    buy_quantity: Number(rule?.buy_quantity),
    pay_quantity: Number(rule?.pay_quantity),
    grouping_mode: rule?.grouping_mode,
    discount_strategy: rule?.discount_strategy || "cheapest",
  };
}

function buildDiscountRule(promotion) {
  const rule =
    promotion?.discount_rule ??
    promotion?.discountRule ??
    promotion?.promotion_discount_rule ??
    null;

  if (!rule) return null;

  return {
    discount_type: rule?.discount_type,
    discount_value: Number(rule?.discount_value),
  };
}

export function buildPromotionUpdatePayload(
  promotion,
  statusOverride = null
) {
  const type = promotion?.type;

  const payload = {
    name: String(promotion?.name || "").trim(),
    description:
      promotion?.description === null ||
      typeof promotion?.description === "undefined"
        ? null
        : String(promotion.description).trim() || null,
    type,
    status: statusOverride || promotion?.status || "inactive",
    priority: Number(promotion?.priority || 1),
    starts_on: normalizeDate(promotion?.starts_on),
    ends_on: normalizeDate(promotion?.ends_on),
    channels: buildPromotionChannels(promotion),
    schedules: buildPromotionSchedules(promotion),
    targets: buildPromotionTargets(promotion),
  };

  if (type === "buy_x_pay_y") {
    payload.buy_x_pay_y_rule = buildBuyXPayYRule(promotion);
  }

  if (type === "product_discount") {
    payload.discount_rule = buildDiscountRule(promotion);
  }

  return payload;
}

export async function getPromotionBranches(restaurantId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches`
  );

  const source = data?.data ?? data;
  const branches = extractArray(source, ["branches"]);

  return branches
    .map((branch) => ({
      ...branch,
      id: branch?.id,
      name:
        branch?.name ||
        branch?.branch_name ||
        branch?.trade_name ||
        `Sucursal ${branch?.id}`,
    }))
    .filter((branch) => branch.id);
}

export async function getPromotions(
  restaurantId,
  branchId
) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/promotions`
  );

  const source = data?.data ?? data;

  return extractArray(source, ["promotions"]);
}

export async function getPromotion(
  restaurantId,
  branchId,
  promotionId
) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/promotions/${promotionId}`
  );

  return extractEntity(data, ["promotion"]);
}

export async function updatePromotion(
  restaurantId,
  branchId,
  promotionId,
  payload
) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/promotions/${promotionId}`,
    payload
  );

  return {
    response: data,
    promotion: extractEntity(data, ["promotion"]),
  };
}

export async function changePromotionStatus(
  restaurantId,
  branchId,
  promotionId,
  status
) {
  const currentPromotion = await getPromotion(
    restaurantId,
    branchId,
    promotionId
  );

  const payload = buildPromotionUpdatePayload(
    currentPromotion,
    status
  );

  const result = await updatePromotion(
    restaurantId,
    branchId,
    promotionId,
    payload
  );

  return {
    response: result.response,
    promotion:
      result.promotion || {
        ...currentPromotion,
        status,
      },
  };
}

export async function deletePromotion(
  restaurantId,
  branchId,
  promotionId
) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/branches/${branchId}/promotions/${promotionId}`
  );

  return data;
}
