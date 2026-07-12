import api from "../../api";

function extractArray(payload, keys = []) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;

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
    if (
      source?.[key] &&
      typeof source[key] === "object"
    ) {
      return source[key];
    }
  }

  return source;
}

function normalizeBoolean(value, fallback = true) {
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
  ].includes(String(value).toLowerCase());
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
    (item?.branch_id && item?.sales_channel_id
      ? item?.id
      : null);

  const salesChannelId =
    item?.sales_channel_id ??
    item?.salesChannelId ??
    salesChannel?.id ??
    branchContext?.sales_channel_id ??
    branchContext?.salesChannelId ??
    branchSalesChannel?.sales_channel_id ??
    branchSalesChannel?.salesChannelId ??
    null;

  const branchIsActive = normalizeBoolean(
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

  const blockedByPlan = normalizeBoolean(
    item?.blocked_by_plan ??
      item?.plan_blocked ??
      item?.is_blocked_by_plan ??
      branchContext?.blocked_by_plan ??
      branchContext?.plan_blocked ??
      branchContext?.is_blocked_by_plan,
    false
  );

  const blockedByChannelStatus = normalizeBoolean(
    item?.blocked_by_channel_status ??
      item?.is_blocked_by_channel_status ??
      branchContext?.blocked_by_channel_status ??
      branchContext?.is_blocked_by_channel_status,
    false
  );

  const isSalesChannelActive = ![
    "inactive",
    "disabled",
  ].includes(salesChannelStatus);

  return {
    ...item,
    branch_sales_channel_id:
      branchSalesChannelId,
    sales_channel_id: salesChannelId,
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

function normalizeProduct(item) {
  const source = item?.product || item;

  const productId =
    item?.product_id ??
    source?.id ??
    null;

  const variantsCount = Number(
    source?.variants_count ??
      source?.product_variants_count ??
      item?.variants_count ??
      0
  );

  const hasVariants =
    normalizeBoolean(
      source?.has_variants ??
        source?.variants_enabled ??
        source?.uses_variants,
      false
    ) ||
    variantsCount > 0 ||
    Array.isArray(source?.variants);

  const status =
    source?.status ||
    item?.status ||
    "active";

  return {
    ...source,
    ...item,
    id: productId,
    name:
      source?.name ||
      item?.product_name ||
      `Producto ${productId}`,
    category_name:
      source?.category?.name ||
      item?.category?.name ||
      item?.category_name ||
      "Sin categoría",
    base_price:
      source?.price ??
      source?.base_price ??
      item?.price ??
      item?.base_price ??
      null,
    has_variants: hasVariants,
    is_active: status !== "inactive",
  };
}

function flattenCatalogProducts(payload) {
  const source = payload?.data ?? payload;
  const result = [];

  const walk = (
    value,
    categoryName = null
  ) => {
    if (Array.isArray(value)) {
      value.forEach((item) =>
        walk(item, categoryName)
      );
      return;
    }

    if (
      !value ||
      typeof value !== "object"
    ) {
      return;
    }

    const nextCategoryName =
      value?.category?.name ||
      value?.category_name ||
      (Array.isArray(value?.products)
        ? value?.name
        : null) ||
      categoryName;

    const productSource =
      value?.product || null;

    if (
      productSource?.id ||
      value?.product_id ||
      (
        value?.id &&
        value?.name &&
        !Array.isArray(value?.products) &&
        !Array.isArray(value?.categories) &&
        !Array.isArray(value?.sections)
      )
    ) {
      result.push({
        ...value,
        category_name:
          value?.category_name ||
          nextCategoryName ||
          "Sin categoría",
      });
    }

    [
      "sections",
      "menu_sections",
      "categories",
      "products",
      "items",
      "catalog",
      "data",
    ].forEach((key) => {
      if (value?.[key]) {
        walk(
          value[key],
          nextCategoryName
        );
      }
    });
  };

  walk(source);

  const unique = new Map();

  result.forEach((item) => {
    const normalized =
      normalizeProduct(item);

    if (normalized.id) {
      unique.set(
        String(normalized.id),
        normalized
      );
    }
  });

  return Array.from(unique.values());
}

function normalizeVariant(
  item,
  productId
) {
  const source =
    item?.product_variant ||
    item?.variant ||
    item;

  const variantId =
    item?.product_variant_id ??
    item?.variant_id ??
    source?.id ??
    null;

  const status =
    source?.status ||
    item?.status ||
    "active";

  return {
    ...source,
    ...item,
    id: variantId,
    product_id:
      item?.product_id ??
      source?.product_id ??
      productId,
    name:
      source?.name ||
      source?.display_name ||
      source?.sku ||
      `Variante ${variantId}`,
    price:
      source?.price ??
      item?.price ??
      null,
    is_active:
      status !== "inactive" &&
      normalizeBoolean(
        source?.is_enabled ??
          item?.is_enabled,
        true
      ),
  };
}

function normalizeChannelProduct(item) {
  const source =
    item?.product || item;

  const productId =
    item?.product_id ??
    source?.id ??
    null;

  const variant =
    item?.product_variant ||
    item?.variant ||
    null;

  const variantId =
    item?.product_variant_id ??
    item?.variant_id ??
    variant?.id ??
    null;

  const status =
    item?.status ||
    source?.status ||
    "active";

  return {
    ...item,
    product_id: productId,
    product_variant_id: variantId,
    price:
      item?.price ??
      item?.unit_price ??
      item?.channel_price ??
      item?.sale_price ??
      variant?.price ??
      source?.price ??
      null,
    is_active:
      status !== "inactive" &&
      normalizeBoolean(
        item?.is_active ??
          item?.is_enabled ??
          item?.enabled,
        true
      ),
  };
}

export async function getPromotionFormBranches(
  restaurantId
) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches`
  );

  const source = data?.data ?? data;

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

  const source = data?.data ?? data;

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

export async function getPromotionFormProductsCatalog(
  restaurantId,
  branchId
) {
  const [
    catalogResponse,
    productsResponse,
  ] = await Promise.all([
    api.get(
      `/restaurants/${restaurantId}/branches/${branchId}/catalog`
    ),
    api.get(
      `/restaurants/${restaurantId}/products`
    ),
  ]);

  const catalogProducts =
    flattenCatalogProducts(
      catalogResponse?.data
    );

  const productsSource =
    productsResponse?.data?.data ??
    productsResponse?.data;

  const restaurantProducts =
    extractArray(productsSource, [
      "products",
    ])
      .map(normalizeProduct)
      .filter((product) => product.id);

  const restaurantProductMap =
    new Map(
      restaurantProducts.map(
        (product) => [
          String(product.id),
          product,
        ]
      )
    );

  if (catalogProducts.length === 0) {
    return restaurantProducts.filter(
      (product) => product.is_active
    );
  }

  return catalogProducts
    .map((catalogProduct) => ({
      ...(restaurantProductMap.get(
        String(catalogProduct.id)
      ) || {}),
      ...catalogProduct,
    }))
    .filter(
      (product) =>
        product.id &&
        product.is_active !== false
    );
}

export async function getPromotionChannelProducts(
  restaurantId,
  branchId,
  salesChannelId
) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/sales-channels/${salesChannelId}/products`
  );

  const source = data?.data ?? data;

  return extractArray(source, [
    "products",
    "items",
  ])
    .map(normalizeChannelProduct)
    .filter(
      (item) => item.product_id
    );
}

export async function getPromotionProductVariants(
  restaurantId,
  productId
) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/products/${productId}/variants`
  );

  const source = data?.data ?? data;

  return extractArray(source, [
    "variants",
  ])
    .map((variant) =>
      normalizeVariant(
        variant,
        productId
      )
    )
    .filter(
      (variant) =>
        variant.id &&
        variant.is_active !== false
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