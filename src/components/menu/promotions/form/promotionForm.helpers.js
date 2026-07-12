export const PROMOTION_FORM_STEPS = [
  "Información",
  "Canales y horarios",
  "Productos",
  "Configuración",
  "Revisión",
];

export const PROMOTION_TYPE_OPTIONS = [
  {
    value: "promotional_price",
    label: "Precio especial",
    description:
      "Define un precio promocional para cada producto y canal seleccionado.",
  },
  {
    value: "buy_x_pay_y",
    label: "Compra X y paga Y",
    description:
      "Configura promociones como 2x1, 3x2 o 4x3.",
  },
  {
    value: "product_discount",
    label: "Descuento por producto",
    description:
      "Aplica un porcentaje o monto fijo a productos seleccionados.",
  },
];

export const PROMOTION_DAYS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
];

export function createInitialPromotionForm({
  branchId = "",
  type = "promotional_price",
} = {}) {
  return {
    branch_id: branchId ? String(branchId) : "",
    name: "",
    description: "",
    type,
    is_active: true,
    priority: "10",
    starts_on: "",
    ends_on: "",
    channel_ids: [],
    schedules: PROMOTION_DAYS.map((day) => ({
      day_of_week: day.value,
      enabled: false,
      start_time: "00:00",
      end_time: "23:59",
    })),
    targets: [],
    buy_x_pay_y_rule: {
      buy_quantity: "2",
      pay_quantity: "1",
      grouping_mode: "any_participant",
      discount_strategy: "cheapest",
    },
    discount_rule: {
      discount_type: "percent",
      discount_value: "10",
    },
  };
}

export function getPromotionTypeLabel(type) {
  return (
    PROMOTION_TYPE_OPTIONS.find(
      (option) => option.value === type
    )?.label || "Promoción"
  );
}

export function getPromotionDayLabel(dayOfWeek) {
  return (
    PROMOTION_DAYS.find(
      (day) => Number(day.value) === Number(dayOfWeek)
    )?.label || `Día ${dayOfWeek}`
  );
}

export function buildPromotionTargetKey(
  productId,
  variantId = null
) {
  return variantId
    ? `product:${productId}:variant:${variantId}`
    : `product:${productId}`;
}

export function getPromotionTargetLabel(target) {
  if (target?.variant_name) {
    return `${target.product_name} · ${target.variant_name}`;
  }

  return target?.product_name || "Producto";
}

export function formatPromotionCurrency(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Sin precio";
  }

  return amount.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function extractPromotionApiError(
  error,
  fallback
) {
  const errors = error?.response?.data?.errors;

  const firstError =
    errors && typeof errors === "object"
      ? Object.values(errors).flat()?.[0]
      : null;

  return (
    firstError ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function validateInformation(form) {
  if (!form?.branch_id) {
    return "Selecciona una sucursal para continuar.";
  }

  if (!String(form?.name || "").trim()) {
    return "El nombre de la promoción es obligatorio.";
  }

  if (
    !PROMOTION_TYPE_OPTIONS.some(
      (option) => option.value === form?.type
    )
  ) {
    return "Selecciona un tipo de promoción válido.";
  }

  const priority = Number(form?.priority);

  if (
    !Number.isInteger(priority) ||
    priority < 1
  ) {
    return "La prioridad debe ser un número entero mayor o igual a 1.";
  }

  if (
    form?.starts_on &&
    form?.ends_on &&
    form.starts_on > form.ends_on
  ) {
    return "La fecha final no puede ser anterior a la fecha inicial.";
  }

  return null;
}

function validateChannelsAndSchedules(form) {
  if (
    !Array.isArray(form?.channel_ids) ||
    form.channel_ids.length === 0
  ) {
    return "Selecciona al menos un canal de venta.";
  }

  const enabledSchedules = (
    form?.schedules || []
  ).filter((schedule) => schedule.enabled);

  if (enabledSchedules.length === 0) {
    return "Configura al menos un día y horario de aplicación.";
  }

  const invalidSchedule = enabledSchedules.find(
    (schedule) =>
      !schedule.start_time ||
      !schedule.end_time ||
      schedule.start_time >= schedule.end_time
  );

  if (invalidSchedule) {
    return `El horario de ${getPromotionDayLabel(
      invalidSchedule.day_of_week
    )} no es válido. La hora inicial debe ser menor que la hora final.`;
  }

  return null;
}

function validateTargets(form) {
  if (
    !Array.isArray(form?.targets) ||
    form.targets.length === 0
  ) {
    return "Selecciona al menos un producto o variante participante.";
  }

  return null;
}

function validateConfiguration(form) {
  if (form?.type === "promotional_price") {
    const invalidTarget = form.targets.find(
      (target) =>
        form.channel_ids.some((channelId) => {
          const value =
            target?.channel_prices?.[
              String(channelId)
            ];

          return (
            !Number.isFinite(Number(value)) ||
            Number(value) <= 0
          );
        })
    );

    if (invalidTarget) {
      return `Captura un precio promocional válido para ${getPromotionTargetLabel(
        invalidTarget
      )} en todos los canales seleccionados.`;
    }

    return null;
  }

  if (form?.type === "buy_x_pay_y") {
    const buyQuantity = Number(
      form?.buy_x_pay_y_rule?.buy_quantity
    );

    const payQuantity = Number(
      form?.buy_x_pay_y_rule?.pay_quantity
    );

    if (
      !Number.isInteger(buyQuantity) ||
      buyQuantity < 2
    ) {
      return "La cantidad que debe comprar debe ser un número entero mayor o igual a 2.";
    }

    if (
      !Number.isInteger(payQuantity) ||
      payQuantity < 1
    ) {
      return "La cantidad que debe pagar debe ser un número entero mayor o igual a 1.";
    }

    if (buyQuantity <= payQuantity) {
      return "La cantidad que debe comprar debe ser mayor que la cantidad que debe pagar.";
    }

    if (
      !["same_product", "any_participant"].includes(
        form?.buy_x_pay_y_rule?.grouping_mode
      )
    ) {
      return "Selecciona una forma de agrupación válida.";
    }

    return null;
  }

  if (form?.type === "product_discount") {
    const discountType =
      form?.discount_rule?.discount_type;

    const discountValue = Number(
      form?.discount_rule?.discount_value
    );

    if (
      !["percent", "fixed"].includes(
        discountType
      )
    ) {
      return "Selecciona un tipo de descuento válido.";
    }

    if (
      !Number.isFinite(discountValue) ||
      discountValue <= 0
    ) {
      return "El valor del descuento debe ser mayor que cero.";
    }

    if (
      discountType === "percent" &&
      discountValue > 100
    ) {
      return "El porcentaje de descuento no puede ser mayor a 100.";
    }

    return null;
  }

  return "El tipo de promoción seleccionado no es válido.";
}

export function validatePromotionStep(
  step,
  form
) {
  if (step === 0) {
    return validateInformation(form);
  }

  if (step === 1) {
    return validateChannelsAndSchedules(form);
  }

  if (step === 2) {
    return validateTargets(form);
  }

  if (step === 3) {
    return validateConfiguration(form);
  }

  return null;
}

export function validateCompletePromotionForm(form) {
  for (let step = 0; step <= 3; step += 1) {
    const error = validatePromotionStep(step, form);

    if (error) {
      return {
        step,
        message: error,
      };
    }
  }

  return null;
}

export function buildPromotionCreatePayload(
  form,
  statusOverride = null
) {
  const payload = {
    name: String(form?.name || "").trim(),
    description:
      String(form?.description || "").trim() ||
      null,
    type: form.type,
    status:
      statusOverride ||
      (form.is_active ? "active" : "inactive"),
    priority: Number(form.priority),
    starts_on: form.starts_on || null,
    ends_on: form.ends_on || null,
    channels: form.channel_ids.map(
      (channelId) => ({
        branch_sales_channel_id:
          Number(channelId),
      })
    ),
    schedules: form.schedules
      .filter((schedule) => schedule.enabled)
      .map((schedule) => ({
        day_of_week: Number(
          schedule.day_of_week
        ),
        start_time: schedule.start_time,
        end_time: schedule.end_time,
      })),
    targets: form.targets.map((target) => {
      const result = {
        product_id: Number(target.product_id),
        product_variant_id:
          target.product_variant_id
            ? Number(target.product_variant_id)
            : null,
      };

      if (form.type === "promotional_price") {
        result.channel_prices =
          form.channel_ids.map((channelId) => ({
            branch_sales_channel_id:
              Number(channelId),
            promotional_unit_price: Number(
              target.channel_prices?.[
                String(channelId)
              ]
            ),
          }));
      }

      return result;
    }),
  };

  if (form.type === "buy_x_pay_y") {
    payload.buy_x_pay_y_rule = {
      buy_quantity: Number(
        form.buy_x_pay_y_rule.buy_quantity
      ),
      pay_quantity: Number(
        form.buy_x_pay_y_rule.pay_quantity
      ),
      grouping_mode:
        form.buy_x_pay_y_rule.grouping_mode,
      discount_strategy: "cheapest",
    };
  }

  if (form.type === "product_discount") {
    payload.discount_rule = {
      discount_type:
        form.discount_rule.discount_type,
      discount_value: Number(
        form.discount_rule.discount_value
      ),
    };
  }

  return payload;
}
