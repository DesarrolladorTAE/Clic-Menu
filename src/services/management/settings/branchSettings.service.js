import api from "../../api";

import {
  getOperationalSettings,
  updateOperationalSettings,
} from "../../floor/operationalSettings.service";

export async function getBranchWorkflowSetting(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/workflow-setting`
  );

  return data;
}

export async function updateBranchWorkflowSetting(restaurantId, branchId, catalogMode) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/workflow-setting`,
    { catalog_mode: catalogMode }
  );

  return data;
}

export async function getBranchDirectSaleSetting(restaurantId, branchId) {
  return getOperationalSettings(restaurantId, branchId);
}

export async function updateBranchDirectSaleSetting(
  restaurantId,
  branchId,
  operationalData,
  operationalUi,
  cashierDirectMode
) {
  if (!operationalData) {
    throw new Error(
      "Primero debes completar la configuración operativa de esta sucursal."
    );
  }

  const visibility = operationalUi?.visibility || {};

  const directAttentionMode =
    operationalUi?.is_direct_attention_mode === true ||
    operationalUi?.attention_mode === "direct" ||
    operationalData?.attention_mode === "direct" ||
    (
      visibility?.ordering_mode === false &&
      visibility?.table_service_mode === false &&
      visibility?.seat_capacity === false
    );

  const payload = directAttentionMode
    ? {
        cashier_direct_mode: cashierDirectMode,
      }
    : {
        ordering_mode: operationalData.ordering_mode || "waiter_only",
        table_service_mode: operationalData.table_service_mode || "free_for_all",
        assignment_strategy:
          operationalData.table_service_mode === "assigned_waiter"
            ? operationalData.assignment_strategy || "table_only"
            : null,
        cashier_direct_mode: cashierDirectMode,
        min_seats: Number(operationalData.min_seats ?? 1),
        max_seats: Number(operationalData.max_seats ?? 6),
      };

  return updateOperationalSettings(restaurantId, branchId, payload);
}