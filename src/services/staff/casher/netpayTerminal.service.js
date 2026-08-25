//src/services/staff/casher/netpayTerminal.service.js

import staffApi from "../../staffApi";

export async function syncCashierNetpayTerminal(capabilities) {
  const res = await staffApi.post(
    "/staff/cashier/netpay-terminals/sync",
    capabilities
  );

  return res?.data;
}
