// src/pages/staff/casher/CashierQueuePage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";
import usePagination from "../../../hooks/usePagination";

import { useStaffAuth } from "../../../context/StaffAuthContext";

import {
  fetchCashierSaleQueue,
  releaseCashierBillingGroup,
  takeCashierSale,
} from "../../../services/staff/casher/cashierQueue.service";

import {
  mergeCashierChecks,
  mergeCashierTables,
  moveCashierCheckItem,
  moveCashierCheckItemQuantity,
  reopenCashierCheck,
  splitCashierCheckByProducts,
  splitCashierCheckEqualParts,
  undoCashierCheckEqualParts,
} from "../../../services/staff/casher/cashierOrderCheck.service";

import { fetchCashierOperationalAuthorizers } from "../../../services/staff/casher/cashierOperationalAuthorizer.service";

import {
  fetchCashierReadyNotifications,
  markCashierReadyNotificationRead,
} from "../../../services/staff/casher/cashierReadyNotifications.service";

import echo from "../../../realtime/echo";

import CashierQueueHeroCard from "../../../components/staff/casher/queuePage/CashierQueueHeroCard";
import CashierQueueTabs from "../../../components/staff/casher/queuePage/CashierQueueTabs";
import CashierSalesPanel from "../../../components/staff/casher/queuePage/CashierSalesPanel";
import CashierReadyNotificationsDrawer from "../../../components/staff/casher/queuePage/CashierReadyNotificationsDrawer";
import CashierReleaseSaleDialog from "../../../components/staff/casher/queuePage/CashierReleaseSaleDialog";
import CashierSplitSaleDialog from "../../../components/staff/casher/queuePage/CashierSplitSaleDialog";
import CashierMergeSaleDialog from "../../../components/staff/casher/queuePage/CashierMergeSaleDialog";
import CashierOperationalAuthorizationDialog from "../../../components/staff/casher/authorization/CashierOperationalAuthorizationDialog";

const PAGE_SIZE = 5;

const AUTH_OPERATION = {
  SPLIT_PRODUCTS: "split_products",
  SPLIT_EQUAL: "split_equal",
  UNDO_EQUAL_PARTS: "undo_equal_parts",
  MOVE_ITEM: "move_item",
  MOVE_QUANTITY: "move_quantity",
  MERGE_CHECKS: "merge_checks",
  MERGE_TABLES: "merge_tables",
  REOPEN_CHECK: "reopen_check",
};

const EMPTY_RELEASE_DIALOG = { open: false, packageKey: null };
const EMPTY_SPLIT_DIALOG = { open: false, packageKey: null, initialCheckId: null };
const EMPTY_MERGE_DIALOG = { open: false, packageKey: null };

export default function CashierQueuePage() {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { clearStaff } = useStaffAuth() || {};

  const initialTab = searchParams.get("tab") === "mine" ? "mine" : "available";

  const [loading, setLoading] = useState(true);
  const [queueData, setQueueData] = useState(null);

  const [tab, setTab] = useState(initialTab);
  const [takingSaleId, setTakingSaleId] = useState(null);

  const [releaseDialog, setReleaseDialog] = useState(EMPTY_RELEASE_DIALOG);
  const [splitDialog, setSplitDialog] = useState(EMPTY_SPLIT_DIALOG);
  const [mergeDialog, setMergeDialog] = useState(EMPTY_MERGE_DIALOG);

  const [releaseSubmitting, setReleaseSubmitting] = useState(false);
  const [mergeSubmitting, setMergeSubmitting] = useState(false);
  const [splitExternalResult, setSplitExternalResult] = useState(null);

  const [authorizationOpen, setAuthorizationOpen] = useState(false);
  const [authorizationLoading, setAuthorizationLoading] = useState(false);
  const [authorizationSubmitting, setAuthorizationSubmitting] = useState(false);
  const [operationalAuthorizers, setOperationalAuthorizers] = useState([]);
  const [pendingAuthorization, setPendingAuthorization] = useState(null);

  const [readyNotifications, setReadyNotifications] = useState([]);
  const [readyBusyId, setReadyBusyId] = useState(null);
  const [readyDrawerOpen, setReadyDrawerOpen] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "info",
    title: "",
    message: "",
  });

  const pollRef = useRef(null);
  const wsRefreshFastRef = useRef(null);
  const wsRefreshSlowRef = useRef(null);

  const showAlert = ({ severity = "info", title, message }) => {
    if (!message) return;

    const resolvedTitle =
      title ||
      (severity === "success"
        ? "Listo"
        : severity === "warning"
        ? "Nota"
        : severity === "error"
        ? "Error"
        : "Aviso");

    setAlertState({ open: true, severity, title: resolvedTitle, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((previous) => ({ ...previous, open: false }));
  };

  const pickErr = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

  const pickCode = (error) => error?.response?.data?.code;

  const isAuthorizationRequired = (error) =>
    Number(error?.response?.status || 0) === 422 &&
    pickCode(error) === "OPERATIONAL_AUTHORIZATION_REQUIRED";

  const isContextConflict = (error) => {
    const status = Number(error?.response?.status || 0);
    const message = String(
      error?.response?.data?.message || error?.message || ""
    ).toLowerCase();

    if (status !== 409) return false;

    return (
      message.includes("no hay un turno activo") ||
      message.includes("selecciona sucursal") ||
      message.includes("sucursal sin configuración operativa")
    );
  };

  const load = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);

      const [queueResponse, readyResponse] = await Promise.all([
        fetchCashierSaleQueue(),
        fetchCashierReadyNotifications().catch(() => null),
      ]);

      setQueueData(queueResponse?.data || null);
      setReadyNotifications(
        Array.isArray(readyResponse?.data) ? readyResponse.data : []
      );
    } catch (error) {
      const status = Number(error?.response?.status || 0);
      const code = pickCode(error);

      if (status === 409 && code === "NO_OPEN_CASH_SESSION") {
        nav("/staff/cashier", { replace: true });
        return;
      }

      if (status === 401) {
        clearStaff?.();
        nav("/staff/login", { replace: true });
        return;
      }

      if (isContextConflict(error)) {
        nav("/staff/select-context", { replace: true });
        return;
      }

      showAlert({
        severity: "error",
        message: pickErr(error, "No se pudo cargar el tablero de cobro."),
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleTabChange = (nextTab) => {
    const resolved = nextTab === "mine" ? "mine" : "available";

    setTab(resolved);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", resolved);

    setSearchParams(nextParams, { replace: true });
  };

  useEffect(() => {
    const requestedTab =
      searchParams.get("tab") === "mine" ? "mine" : "available";

    setTab((current) => (current === requestedTab ? current : requestedTab));
  }, [searchParams]);

  useEffect(() => {
    if (["mine", "available"].includes(searchParams.get("tab"))) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", "available");

    setSearchParams(nextParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();

    pollRef.current = setInterval(() => {
      if (document.visibilityState === "visible") load({ silent: true });
    }, 10000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cashSession = queueData?.cash_session || null;
  const meta = queueData?.meta || {};

  const branchId = Number(
    meta?.branch_id ||
      cashSession?.branch_id ||
      queueData?.branch_id ||
      queueData?.branch?.id ||
      0
  );

  const staffId = Number(
    meta?.staff_id ||
      cashSession?.staff_id ||
      cashSession?.opened_by_staff_id ||
      queueData?.staff_id ||
      0
  );

  useEffect(() => {
    if (!branchId) return undefined;

    const channelName = `branch.${branchId}.cashier`;

    const scheduleRefresh = () => {
      if (wsRefreshFastRef.current) clearTimeout(wsRefreshFastRef.current);
      if (wsRefreshSlowRef.current) clearTimeout(wsRefreshSlowRef.current);

      wsRefreshFastRef.current = setTimeout(
        () => load({ silent: true }),
        120
      );

      wsRefreshSlowRef.current = setTimeout(
        () => load({ silent: true }),
        900
      );
    };

    const handleCashierQueueUpdated = (payload = {}) => {
      const eventBranchId = Number(payload?.branch_id || 0);

      if (!eventBranchId || eventBranchId !== branchId) return;

      scheduleRefresh();

      const targetStaffId = Number(payload?.target_staff_id || 0);
      const message = String(payload?.message || "").trim();
      const reason = String(payload?.reason || "").trim();
      const isReadConfirmation = ["cashier_ready_notice_read", "online_order_ready_notification_read"].includes(reason);

      if (isReadConfirmation) return;

      if (message && (!targetStaffId || !staffId || targetStaffId === staffId)) {
        showAlert({ severity: "info", message });
      }
    };

    echo
      .private(channelName)
      .listen(".cashier.queue.updated", handleCashierQueueUpdated);

    return () => {
      if (wsRefreshFastRef.current) {
        clearTimeout(wsRefreshFastRef.current);
        wsRefreshFastRef.current = null;
      }

      if (wsRefreshSlowRef.current) {
        clearTimeout(wsRefreshSlowRef.current);
        wsRefreshSlowRef.current = null;
      }

      echo.leaveChannel(channelName);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, staffId]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (wsRefreshFastRef.current) clearTimeout(wsRefreshFastRef.current);
      if (wsRefreshSlowRef.current) clearTimeout(wsRefreshSlowRef.current);
    };
  }, []);

  const availableSales = useMemo(
    () =>
      Array.isArray(queueData?.available_sales)
        ? queueData.available_sales
        : [],
    [queueData]
  );

  const mySales = useMemo(
    () => (Array.isArray(queueData?.my_sales) ? queueData.my_sales : []),
    [queueData]
  );

  const myTotal = useMemo(
    () =>
      mySales.reduce(
        (total, sale) =>
          total +
          Number(
            sale?.pending_total ??
              sale?.payable_total ??
              sale?.total ??
              0
          ),
        0
      ),
    [mySales]
  );

  const activeList = tab === "available" ? availableSales : mySales;

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
    items: activeList,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const releaseSale = useMemo(
    () => findSaleByPackageKey(mySales, releaseDialog.packageKey),
    [mySales, releaseDialog.packageKey]
  );

  const splitSale = useMemo(
    () => findSaleByPackageKey(mySales, splitDialog.packageKey),
    [mySales, splitDialog.packageKey]
  );

  const mergeSale = useMemo(
    () => findSaleByPackageKey(mySales, mergeDialog.packageKey),
    [mySales, mergeDialog.packageKey]
  );

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (mySales.length > 0) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    const handlePopState = () => {
      if (mySales.length === 0) return;

      showAlert({
        severity: "warning",
        title: "Ventas tomadas",
        message:
          "Aún tienes ventas tomadas. No puedes salir hasta cobrarlas o liberarlas.",
      });

      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [mySales]);

  const handleTakeSale = async (sale) => {
    const saleId = Number(sale?.sale_id || 0);

    if (!saleId || takingSaleId) return;

    setTakingSaleId(saleId);

    try {
      const response = await takeCashierSale(saleId);

      showAlert({
        severity: "success",
        message: response?.message || "Venta tomada correctamente.",
      });

      handleTabChange("mine");
      load({ silent: true });
    } catch (error) {
      const code = pickCode(error);
      const message = pickErr(error, "No se pudo tomar la venta.");

      if (code === "SALE_PACKAGE_NOT_AVAILABLE") {
        showAlert({ severity: "warning", message });
        load({ silent: true });
        return;
      }

      showAlert({ severity: "error", message });
    } finally {
      setTakingSaleId(null);
    }
  };

  const handleReadReadyNotification = async (notificationId) => {
    if (!notificationId) return;

    setReadyBusyId(notificationId);

    try {
      const response = await markCashierReadyNotificationRead(notificationId);

      setReadyNotifications((current) =>
        current.filter(
          (row) => Number(row?.id) !== Number(notificationId)
        )
      );

      showAlert({
        severity: "success",
        message:
          response?.message ||
          "Aviso de caja marcado como leído. La orden quedó lista para entregar.",
      });

      load({ silent: true });
    } catch (error) {
      showAlert({
        severity: "error",
        message: friendlyReadyNotificationMessage(
          pickErr(error, "No se pudo marcar el aviso como leído.")
        ),
      });
    } finally {
      setReadyBusyId(null);
    }
  };

  const handleOpenDetail = (sale) => {
    const saleId = Number(sale?.sale_id || 0);
    if (saleId) nav(`/staff/cashier/sales/${saleId}`);
  };

  const handleOpenCheck = (check) => {
    const saleId = Number(check?.sale_id || 0);

    if (!saleId) {
      showAlert({
        severity: "warning",
        message:
          "La cuenta todavía no tiene una venta cobrable asociada.",
      });
      return;
    }

    nav(`/staff/cashier/sales/${saleId}`);
  };

  const handleOpenMerge = (sale) => {
    setMergeDialog({
      open: true,
      packageKey: getPackageKey(sale),
    });
  };

  const handleCloseMerge = () => {
    if (!mergeSubmitting) setMergeDialog(EMPTY_MERGE_DIALOG);
  };

  const handleOpenSplit = (sale) => {
    const splitMode = resolveSplitMode(sale);

    if (splitMode === "inconsistent") {
      handleOpenMerge(sale);
      return;
    }

    setSplitExternalResult(null);

    setSplitDialog({
      open: true,
      packageKey: getPackageKey(sale),
      initialCheckId: null,
    });
  };

  const handleCloseSplit = () => {
    setSplitDialog(EMPTY_SPLIT_DIALOG);
    setSplitExternalResult(null);
  };

  const handleOpenRelease = (sale) => {
    setReleaseDialog({
      open: true,
      packageKey: getPackageKey(sale),
    });
  };

  const handleCloseRelease = () => {
    if (!releaseSubmitting) setReleaseDialog(EMPTY_RELEASE_DIALOG);
  };

  const handleConfirmRelease = async (sale) => {
    const groupId = Number(sale?.order_billing_group_id || 0);

    if (!groupId || releaseSubmitting) return;

    setReleaseSubmitting(true);

    try {
      const response = await releaseCashierBillingGroup(groupId);

      showAlert({
        severity: "success",
        message:
          response?.message ||
          "La venta fue liberada correctamente.",
      });

      setReleaseDialog(EMPTY_RELEASE_DIALOG);
      load({ silent: true });
    } catch (error) {
      showAlert({
        severity: "error",
        message: pickErr(error, "No se pudo liberar la venta."),
      });
    } finally {
      setReleaseSubmitting(false);
    }
  };

  const openAuthorization = async (operation) => {
    setPendingAuthorization(operation);
    setAuthorizationOpen(true);
    setAuthorizationLoading(true);
    setOperationalAuthorizers([]);

    try {
      const response = await fetchCashierOperationalAuthorizers();

      setOperationalAuthorizers(
        Array.isArray(response?.data) ? response.data : []
      );
    } catch (error) {
      const status = Number(error?.response?.status || 0);
      const code = pickCode(error);

      if (status === 409 && code === "NO_OPEN_CASH_SESSION") {
        setAuthorizationOpen(false);
        setPendingAuthorization(null);
        nav("/staff/cashier", { replace: true });
        return;
      }

      showAlert({
        severity: "error",
        message: pickErr(
          error,
          "No se pudieron consultar los autorizadores operativos."
        ),
      });
    } finally {
      setAuthorizationLoading(false);
    }
  };

  const closeAuthorization = () => {
    if (authorizationSubmitting) return;

    setAuthorizationOpen(false);
    setPendingAuthorization(null);
    setOperationalAuthorizers([]);
  };

  const requestAuthorizationFromError = async (error, operation) => {
    if (!isAuthorizationRequired(error)) return false;

    await openAuthorization(operation);
    return true;
  };

  const handleSplitByProducts = async ({ checkId, payload }) => {
    try {
      const response = await splitCashierCheckByProducts(
        checkId,
        payload
      );

      showAlert({
        severity: "success",
        message:
          response?.message ||
          "Cuenta dividida por productos correctamente.",
      });

      setSplitDialog(EMPTY_SPLIT_DIALOG);
      setSplitExternalResult(null);
      load({ silent: true });

      return response;
    } catch (error) {
      const authorizationRequested =
        await requestAuthorizationFromError(error, {
          type: AUTH_OPERATION.SPLIT_PRODUCTS,
          packageKey: splitDialog.packageKey,
          args: { checkId, payload },
        });

      if (authorizationRequested) {
        return {
          ok: false,
          authorization_required: true,
        };
      }

      throw error;
    }
  };

  const handleSplitEqualParts = async ({ checkId, payload }) => {
    try {
      const response = await splitCashierCheckEqualParts(
        checkId,
        payload
      );

      showAlert({
        severity: "success",
        message:
          response?.message ||
          "Cuenta dividida en partes iguales correctamente.",
      });

      setSplitDialog(EMPTY_SPLIT_DIALOG);
      setSplitExternalResult(null);
      load({ silent: true });

      return response;
    } catch (error) {
      const authorizationRequested =
        await requestAuthorizationFromError(error, {
          type: AUTH_OPERATION.SPLIT_EQUAL,
          packageKey: splitDialog.packageKey,
          args: { checkId, payload },
        });

      if (authorizationRequested) {
        return {
          ok: false,
          authorization_required: true,
        };
      }

      throw error;
    }
  };

  const handleUndoEqualParts = async ({ groupId, payload = {} }) => {
    try {
      const response = await undoCashierCheckEqualParts(
        groupId,
        payload
      );

      showAlert({
        severity: "success",
        message:
          response?.message ||
          "División en partes iguales deshecha correctamente.",
      });

      setSplitDialog(EMPTY_SPLIT_DIALOG);
      setSplitExternalResult(null);
      load({ silent: true });

      return response;
    } catch (error) {
      const authorizationRequested =
        await requestAuthorizationFromError(error, {
          type: AUTH_OPERATION.UNDO_EQUAL_PARTS,
          packageKey: splitDialog.packageKey,
          args: { groupId, payload },
        });

      if (authorizationRequested) {
        return {
          ok: false,
          authorization_required: true,
        };
      }

      throw error;
    }
  };

  const handleMoveItem = async ({ checkId, itemId, payload }) => {
    try {
      const response = await moveCashierCheckItem(
        checkId,
        itemId,
        payload
      );

      showAlert({
        severity: "success",
        message:
          response?.message || "Producto movido correctamente.",
      });

      load({ silent: true });

      return response;
    } catch (error) {
      const authorizationRequested =
        await requestAuthorizationFromError(error, {
          type: AUTH_OPERATION.MOVE_ITEM,
          packageKey: splitDialog.packageKey,
          args: { checkId, itemId, payload },
        });

      if (authorizationRequested) {
        return {
          ok: false,
          authorization_required: true,
        };
      }

      throw error;
    }
  };

  const handleMoveQuantity = async ({
    checkId,
    itemId,
    payload,
  }) => {
    try {
      const response = await moveCashierCheckItemQuantity(
        checkId,
        itemId,
        payload
      );

      showAlert({
        severity: "success",
        message:
          response?.message || "Cantidad movida correctamente.",
      });

      load({ silent: true });

      return response;
    } catch (error) {
      const authorizationRequested =
        await requestAuthorizationFromError(error, {
          type: AUTH_OPERATION.MOVE_QUANTITY,
          packageKey: splitDialog.packageKey,
          args: { checkId, itemId, payload },
        });

      if (authorizationRequested) {
        return {
          ok: false,
          authorization_required: true,
        };
      }

      throw error;
    }
  };

  const handleMergeChecks = async ({
    sourceCheckId,
    targetCheckId,
    payload,
  }) => {
    if (mergeSubmitting) return null;

    setMergeSubmitting(true);

    try {
      const response = await mergeCashierChecks(
        sourceCheckId,
        targetCheckId,
        payload
      );

      showAlert({
        severity: "success",
        message:
          response?.message ||
          "Cuentas juntadas correctamente.",
      });

      setMergeDialog(EMPTY_MERGE_DIALOG);
      load({ silent: true });

      return response;
    } catch (error) {
      const authorizationRequested =
        await requestAuthorizationFromError(error, {
          type: AUTH_OPERATION.MERGE_CHECKS,
          packageKey: mergeDialog.packageKey,
          args: {
            sourceCheckId,
            targetCheckId,
            payload,
          },
        });

      if (authorizationRequested) {
        return {
          ok: false,
          authorization_required: true,
        };
      }

      throw error;
    } finally {
      setMergeSubmitting(false);
    }
  };

  const handleMergeTables = async ({
    sourceTableId,
    targetTableId,
    payload,
  }) => {
    if (mergeSubmitting) return null;

    setMergeSubmitting(true);

    try {
      const response = await mergeCashierTables(
        sourceTableId,
        targetTableId,
        payload
      );

      showAlert({
        severity: "success",
        message:
          response?.message || "Mesas juntadas correctamente.",
      });

      setMergeDialog(EMPTY_MERGE_DIALOG);
      load({ silent: true });

      return response;
    } catch (error) {
      const authorizationRequested =
        await requestAuthorizationFromError(error, {
          type: AUTH_OPERATION.MERGE_TABLES,
          packageKey: mergeDialog.packageKey,
          args: {
            sourceTableId,
            targetTableId,
            payload,
          },
        });

      if (authorizationRequested) {
        return {
          ok: false,
          authorization_required: true,
        };
      }

      throw error;
    } finally {
      setMergeSubmitting(false);
    }
  };

  const handleRequestReopen = async (check, sale) => {
    const checkId = Number(
      check?.order_check_id || check?.id || 0
    );

    if (!checkId) {
      showAlert({
        severity: "warning",
        message:
          "No se pudo identificar la cuenta que deseas reabrir.",
      });
      return;
    }

    await openAuthorization({
      type: AUTH_OPERATION.REOPEN_CHECK,
      packageKey: getPackageKey(sale),
      args: {
        checkId,
        saleId: Number(check?.sale_id || 0),
        payload: {},
      },
    });
  };

  const handleAuthorizationSubmit = async (authorization) => {
    if (!pendingAuthorization || authorizationSubmitting) return;

    setAuthorizationSubmitting(true);

    try {
      const operation = pendingAuthorization;
      const originalPayload = operation?.args?.payload || {};

      const payload = {
        ...originalPayload,
        authorization_user_id:
          authorization.authorization_user_id,
        authorization_pin: authorization.authorization_pin,
        reason: authorization.reason,
        meta_json: {
          ...(isPlainObject(originalPayload.meta_json)
            ? originalPayload.meta_json
            : {}),
          ...buildAuthorizationMeta(operation),
        },
      };

      let response;

      switch (operation.type) {
        case AUTH_OPERATION.SPLIT_PRODUCTS:
          response = await splitCashierCheckByProducts(
            operation.args.checkId,
            payload
          );
          break;

        case AUTH_OPERATION.SPLIT_EQUAL:
          response = await splitCashierCheckEqualParts(
            operation.args.checkId,
            payload
          );
          break;

        case AUTH_OPERATION.UNDO_EQUAL_PARTS:
          response = await undoCashierCheckEqualParts(
            operation.args.groupId,
            payload
          );
          break;

        case AUTH_OPERATION.MOVE_ITEM:
          response = await moveCashierCheckItem(
            operation.args.checkId,
            operation.args.itemId,
            payload
          );
          break;

        case AUTH_OPERATION.MOVE_QUANTITY:
          response = await moveCashierCheckItemQuantity(
            operation.args.checkId,
            operation.args.itemId,
            payload
          );
          break;

        case AUTH_OPERATION.MERGE_CHECKS:
          response = await mergeCashierChecks(
            operation.args.sourceCheckId,
            operation.args.targetCheckId,
            payload
          );
          break;

        case AUTH_OPERATION.MERGE_TABLES:
          response = await mergeCashierTables(
            operation.args.sourceTableId,
            operation.args.targetTableId,
            payload
          );
          break;

        case AUTH_OPERATION.REOPEN_CHECK:
          response = await reopenCashierCheck(
            operation.args.checkId,
            payload
          );
          break;

        default:
          throw new Error(
            "La operación pendiente de autorización no es válida."
          );
      }

      showAlert({
        severity: "success",
        message:
          response?.message ||
          successMessageForOperation(operation.type),
      });

      setAuthorizationOpen(false);
      setPendingAuthorization(null);
      setOperationalAuthorizers([]);

      if (
        [
          AUTH_OPERATION.MOVE_ITEM,
          AUTH_OPERATION.MOVE_QUANTITY,
        ].includes(operation.type)
      ) {
        setSplitExternalResult(response);
      }

      if (
        [
          AUTH_OPERATION.SPLIT_PRODUCTS,
          AUTH_OPERATION.SPLIT_EQUAL,
          AUTH_OPERATION.UNDO_EQUAL_PARTS,
        ].includes(operation.type)
      ) {
        setSplitDialog(EMPTY_SPLIT_DIALOG);
        setSplitExternalResult(null);
      }

      if (
        [
          AUTH_OPERATION.MERGE_CHECKS,
          AUTH_OPERATION.MERGE_TABLES,
        ].includes(operation.type)
      ) {
        setMergeDialog(EMPTY_MERGE_DIALOG);
      }

      load({ silent: true });

      return response;
    } finally {
      setAuthorizationSubmitting(false);
    }
  };

  const actionsDisabled =
    releaseSubmitting ||
    mergeSubmitting ||
    authorizationSubmitting;

  const authorizationContent = authorizationDialogContent(
    pendingAuthorization?.type
  );

  if (loading) {
    return (
      <PageContainer>
        <Box
          sx={{
            minHeight: "70vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress />

            <Typography
              sx={{
                color: "text.secondary",
                fontSize: 14,
              }}
            >
              Cargando tablero de cobro…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <CashierQueueHeroCard
          cashSession={cashSession}
          availableCount={availableSales.length}
          myCount={mySales.length}
          myTotal={myTotal}
          syncing={false}
        />

        <CashierQueueTabs
          tab={tab}
          onChange={handleTabChange}
          availableCount={availableSales.length}
          myCount={mySales.length}
        />

        <CashierSalesPanel
          title={
            tab === "available"
              ? "Ventas disponibles"
              : "Mis ventas"
          }
          subtitle={
            tab === "available"
              ? "Estas ventas todavía no están asignadas a ninguna caja. Puedes tomarlas para comenzar el cobro."
              : "Estas ventas ya están tomadas por tu caja. Desde aquí puedes administrar sus cuentas y continuar el cobro."
          }
          mode={tab === "available" ? "available" : "mine"}
          sales={paginatedItems}
          actionBusyId={takingSaleId}
          actionsDisabled={actionsDisabled}
          page={page}
          totalPages={totalPages}
          startItem={startItem}
          endItem={endItem}
          total={total}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={prevPage}
          onNext={nextPage}
          onTake={handleTakeSale}
          onOpenDetail={handleOpenDetail}
          onOpenCheck={handleOpenCheck}
          onReopenCheck={handleRequestReopen}
          onSplit={handleOpenSplit}
          onMerge={handleOpenMerge}
          onRelease={handleOpenRelease}
        />
      </Stack>

      <CashierReleaseSaleDialog
        open={releaseDialog.open}
        sale={releaseSale}
        submitting={releaseSubmitting}
        onClose={handleCloseRelease}
        onConfirm={handleConfirmRelease}
      />

      <CashierSplitSaleDialog
        open={splitDialog.open}
        sale={splitSale}
        initialCheckId={splitDialog.initialCheckId}
        externalResult={splitExternalResult}
        onClose={handleCloseSplit}
        onSplitByProducts={handleSplitByProducts}
        onSplitEqualParts={handleSplitEqualParts}
        onUndoEqualParts={handleUndoEqualParts}
        onMoveItem={handleMoveItem}
        onMoveQuantity={handleMoveQuantity}
      />

      <CashierMergeSaleDialog
        open={mergeDialog.open}
        sale={mergeSale}
        mySales={mySales}
        submitting={mergeSubmitting}
        onClose={handleCloseMerge}
        onMergeChecks={handleMergeChecks}
        onMergeTables={handleMergeTables}
      />

      <CashierOperationalAuthorizationDialog
        open={authorizationOpen}
        title={authorizationContent.title}
        description={authorizationContent.description}
        authorizers={operationalAuthorizers}
        loadingAuthorizers={authorizationLoading}
        submitting={authorizationSubmitting}
        onClose={closeAuthorization}
        onSubmit={handleAuthorizationSubmit}
      />

      <CashierReadyNotificationsDrawer
        open={readyDrawerOpen}
        onOpen={() => setReadyDrawerOpen(true)}
        onClose={() => setReadyDrawerOpen(false)}
        notifications={readyNotifications}
        busyId={readyBusyId}
        onReadNotification={handleReadReadyNotification}
      />

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={3000}
      />
    </PageContainer>
  );
}

function resolveSplitMode(sale) {
  const mode = String(sale?.split_mode || "").toLowerCase();

  if (
    ["normal", "products", "equal_parts", "inconsistent"].includes(
      mode
    )
  ) {
    return mode;
  }

  if (sale?.has_inconsistent_structure === true) {
    return "inconsistent";
  }

  return "normal";
}

function getPackageKey(sale) {
  return (
    sale?.package_key ||
    `sale:${Number(sale?.sale_id || 0)}`
  );
}

function findSaleByPackageKey(sales, packageKey) {
  if (!packageKey) return null;

  return (
    (Array.isArray(sales) ? sales : []).find(
      (sale) => getPackageKey(sale) === packageKey
    ) || null
  );
}

function buildAuthorizationMeta(operation) {
  const args = operation?.args || {};

  const meta = {
    source: "cashier_queue",
    operation: operation?.type || null,
    package_key: operation?.packageKey || null,
    order_billing_group_id: args.groupId || null,
    order_check_id: args.checkId || null,
    source_check_id: args.sourceCheckId || null,
    target_check_id: args.targetCheckId || null,
    order_check_item_id: args.itemId || null,
    source_table_id: args.sourceTableId || null,
    target_table_id: args.targetTableId || null,
    sale_id: args.saleId || null,
    items_count: Array.isArray(args?.payload?.items)
      ? args.payload.items.length
      : null,
  };

  return Object.fromEntries(
    Object.entries(meta).filter(
      ([, value]) =>
        value !== null &&
        value !== undefined &&
        value !== ""
    )
  );
}

function authorizationDialogContent(type) {
  const content = {
    [AUTH_OPERATION.SPLIT_PRODUCTS]: {
      title: "Autorizar división por productos",
      description:
        "La división por productos afecta información protegida y requiere autorización operativa.",
    },
    [AUTH_OPERATION.SPLIT_EQUAL]: {
      title: "Autorizar división",
      description:
        "La división afecta información protegida y requiere autorización operativa.",
    },
    [AUTH_OPERATION.UNDO_EQUAL_PARTS]: {
      title: "Autorizar restauración de cuenta",
      description:
        "Deshacer las partes iguales afecta información protegida y requiere autorización operativa.",
    },
    [AUTH_OPERATION.MOVE_ITEM]: {
      title: "Autorizar movimiento",
      description:
        "Mover este producto requiere autorización operativa.",
    },
    [AUTH_OPERATION.MOVE_QUANTITY]: {
      title: "Autorizar movimiento",
      description:
        "Mover esta cantidad requiere autorización operativa.",
    },
    [AUTH_OPERATION.MERGE_CHECKS]: {
      title: "Autorizar unión de cuentas",
      description:
        "La unión de cuentas requiere autorización operativa.",
    },
    [AUTH_OPERATION.MERGE_TABLES]: {
      title: "Autorizar unión de mesas",
      description:
        "La unión de mesas requiere autorización operativa.",
    },
    [AUTH_OPERATION.REOPEN_CHECK]: {
      title: "Autorizar reapertura",
      description:
        "Selecciona un autorizador para reabrir esta cuenta.",
    },
  };

  return (
    content[type] || {
      title: "Autorización operativa",
      description:
        "Selecciona un autorizador e ingresa sus datos para continuar.",
    }
  );
}

function successMessageForOperation(type) {
  const messages = {
    [AUTH_OPERATION.SPLIT_PRODUCTS]:
      "Cuenta dividida por productos correctamente.",
    [AUTH_OPERATION.SPLIT_EQUAL]:
      "Cuenta dividida en partes iguales correctamente.",
    [AUTH_OPERATION.UNDO_EQUAL_PARTS]:
      "División en partes iguales deshecha correctamente.",
    [AUTH_OPERATION.MOVE_ITEM]:
      "Producto movido correctamente.",
    [AUTH_OPERATION.MOVE_QUANTITY]:
      "Cantidad movida correctamente.",
    [AUTH_OPERATION.MERGE_CHECKS]:
      "Cuentas juntadas correctamente.",
    [AUTH_OPERATION.MERGE_TABLES]:
      "Mesas juntadas correctamente.",
    [AUTH_OPERATION.REOPEN_CHECK]:
      "Cuenta reabierta correctamente.",
  };

  return messages[type] || "Operación realizada correctamente.";
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function friendlyReadyNotificationMessage(message) {
  return String(message || "").replaceAll("handoff", "proceso de entrega de Cocina a Caja");
}