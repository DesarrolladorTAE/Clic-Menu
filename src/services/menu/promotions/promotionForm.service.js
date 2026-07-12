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

  if (
    !source ||
    typeof source !== "object"
  ) {
    return null;
  }

  for (const key of keys) {
    if (
      source?.[key] &&
      typeof source[key] === "object"
    ) {
      return source[key];
    }
  }

  return source;
}

function normalizeBoolean(
  value,
  fallback = true
) {
  if (
    value === null ||
    typeof value === "undefined"
  ) {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  return ![
    "0",
    "false",
    "inactive",
    "disabled",
    "blocked",
  ].includes(
    String(value).toLowerCase()
  );
}

function normalizeBranch(branch) {
  return {
    ...branch,
    id: branch?.id,
    name:
      branch?.name ||
      branch?.branch_name ||
      branch?.trade_name ||
      `Sucursal ${branch?.id}`,
  };
}

function normalizeBranchSalesChannel(item) {
  const branchContext =
    item?.branch ||
    item?.branch_context ||
    item?.branchContext ||
    null;

  const branchSalesChannel =
    item?.branch_sales_channel ||
    item?.branchSalesChannel ||
    branchContext?.branch_sales_channel ||
    branchContext?.branchSalesChannel ||
    null;

  const salesChannel =
    item?.sales_channel ||
    item?.salesChannel ||
    item?.channel ||
    branchSalesChannel?.sales_channel ||
    branchSalesChannel?.salesChannel ||
    null;

  const branchSalesChannelId =
    item?.branch_sales_channel_id ??
    item?.branchSalesChannelId ??
    branchContext?.override_id ??
    branchContext?.branch_sales_channel_id ??
    branchContext?.branchSalesChannelId ??
    branchSalesChannel?.id ??
    (
      item?.branch_id &&
      item?.sales_channel_id
        ? item?.id
        : null
    );

  const salesChannelId =
    item?.sales_channel_id ??
    item?.salesChannelId ??
    salesChannel?.id ??
    branchContext?.sales_channel_id ??
    branchContext?.salesChannelId ??
    branchSalesChannel?.sales_channel_id ??
    branchSalesChannel?.salesChannelId ??
    null;

  const branchIsActive =
    normalizeBoolean(
      item?.effective_is_active ??
        item?.is_effective_active ??
        branchContext?.effective_is_active ??
        branchContext?.is_effective_active ??
        item?.is_active ??
        branchContext?.is_active ??
        branchSalesChannel?.is_active,
      true
    );

  const salesChannelStatus = String(
    item?.sales_channel_status ??
      salesChannel?.status ??
      "active"
  ).toLowerCase();

  const blockedByPlan =
    normalizeBoolean(
      item?.blocked_by_plan ??
        item?.plan_blocked ??
        item?.is_blocked_by_plan ??
        branchContext?.blocked_by_plan ??
        branchContext?.plan_blocked ??
        branchContext?.is_blocked_by_plan,
      false
    );

  const blockedByChannelStatus =
    normalizeBoolean(
      item?.blocked_by_channel_status ??
        item?.is_blocked_by_channel_status ??
        branchContext?.blocked_by_channel_status ??
        branchContext?.is_blocked_by_channel_status,
      false
    );

  const isSalesChannelActive =
    ![
      "inactive",
      "disabled",
    ].includes(salesChannelStatus);

  return {
    ...item,
    branch_sales_channel_id:
      branchSalesChannelId,
    sales_channel_id:
      salesChannelId,
    sales_channel:
      salesChannel,
    name:
      salesChannel?.name ||
      salesChannel?.label ||
      item?.channel_name ||
      item?.name ||
      `Canal ${
        salesChannelId ||
        branchSalesChannelId
      }`,
    is_usable:
      !!branchSalesChannelId &&
      branchIsActive &&
      isSalesChannelActive &&
      !blockedByPlan &&
      !blockedByChannelStatus,
  };
}

function normalizeBranchSalesChannelIds(
  branchSalesChannelIds
) {
  const source = Array.isArray(
    branchSalesChannelIds
  )
    ? branchSalesChannelIds
    : branchSalesChannelIds !== null &&
        typeof branchSalesChannelIds !==
          "undefined"
      ? [branchSalesChannelIds]
      : [];

  return Array.from(
    new Set(
      source
        .map((id) => Number(id))
        .filter(
          (id) =>
            Number.isInteger(id) &&
            id > 0
        )
    )
  );
}

function createEmptyEligibleProductsCatalog(
  branchId = null
) {
  const normalizedBranchId =
    Number(branchId);

  return {
    products_mode: null,
    branch_id:
      Number.isInteger(normalizedBranchId) &&
      normalizedBranchId > 0
        ? normalizedBranchId
        : null,
    branch_sales_channel_ids: [],
    channels: [],
    products_count: 0,
    variants_count: 0,
    eligible_target_keys: [],
    data: [],
  };
}

function extractEligibleProductsCatalog(
  payload,
  branchId
) {
  const source =
    payload?.data ?? payload;

  if (
    !source ||
    typeof source !== "object" ||
    Array.isArray(source)
  ) {
    return createEmptyEligibleProductsCatalog(
      branchId
    );
  }

  const products = Array.isArray(
    source?.data
  )
    ? source.data
    : [];

  const channels = Array.isArray(
    source?.channels
  )
    ? source.channels
    : [];

  const channelIds = Array.isArray(
    source?.branch_sales_channel_ids
  )
    ? source.branch_sales_channel_ids
        .map((id) => Number(id))
        .filter(
          (id) =>
            Number.isInteger(id) &&
            id > 0
        )
    : [];

  const eligibleTargetKeys =
    Array.isArray(
      source?.eligible_target_keys
    )
      ? source.eligible_target_keys
      : [];

  return {
    ...source,
    products_mode:
      source?.products_mode ?? null,
    branch_id:
      source?.branch_id ??
      (
        Number.isInteger(
          Number(branchId)
        )
          ? Number(branchId)
          : null
      ),
    branch_sales_channel_ids:
      channelIds,
    channels,
    products_count: Number(
      source?.products_count ??
        products.length
    ),
    variants_count: Number(
      source?.variants_count ?? 0
    ),
    eligible_target_keys:
      eligibleTargetKeys,
    data: products,
  };
}

export async function getPromotionFormBranches(
  restaurantId
) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches`
  );

  const source =
    data?.data ?? data;

  return extractArray(source, [
    "branches",
  ])
    .map(normalizeBranch)
    .filter((branch) => branch.id);
}

export async function getPromotionFormChannels(
  restaurantId,
  branchId
) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/sales-channels`
  );

  const source =
    data?.data ?? data;

  return extractArray(source, [
    "sales_channels",
    "channels",
  ])
    .map(normalizeBranchSalesChannel)
    .filter(
      (channel) =>
        channel.branch_sales_channel_id
    );
}

export async function getPromotionEligibleProducts(
  restaurantId,
  branchId,
  branchSalesChannelIds
) {
  const normalizedChannelIds =
    normalizeBranchSalesChannelIds(
      branchSalesChannelIds
    );

  if (normalizedChannelIds.length === 0) {
    return createEmptyEligibleProductsCatalog(
      branchId
    );
  }

  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/promotions/eligible-products`,
    {
      params: {
        branch_sales_channel_ids:
          normalizedChannelIds,
      },
    }
  );

  return extractEligibleProductsCatalog(
    data,
    branchId
  );
}

export async function getPromotionFormProductsCatalog(
  restaurantId,
  branchId,
  branchSalesChannelIds
) {
  return getPromotionEligibleProducts(
    restaurantId,
    branchId,
    branchSalesChannelIds
  );
}

export async function createPromotion(
  restaurantId,
  branchId,
  payload
) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/branches/${branchId}/promotions`,
    payload
  );

  return {
    response: data,
    promotion: extractEntity(data, [
      "promotion",
    ]),
  };
}