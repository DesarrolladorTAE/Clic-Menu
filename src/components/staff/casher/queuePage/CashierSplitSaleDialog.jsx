// src/components/staff/casher/queuePage/CashierSplitSaleDialog.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, Box, Button, Card, CardActionArea, CardContent, Checkbox, Chip,
  CircularProgress, Divider, Stack, TextField, Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CallSplitRoundedIcon from "@mui/icons-material/CallSplitRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DriveFileMoveRoundedIcon from "@mui/icons-material/DriveFileMoveRounded";
import FastfoodRoundedIcon from "@mui/icons-material/FastfoodRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import ViewWeekRoundedIcon from "@mui/icons-material/ViewWeekRounded";

import AppAlert from "../../../common/AppAlert";
import CashierChoiceCard from "../shared/CashierChoiceCard";
import CashierDialogShell from "../shared/CashierDialogShell";
import CashierFlowStepper from "../shared/CashierFlowStepper";

import { fetchCashierSaleChecks } from "../../../../services/staff/casher/cashierOrderCheck.service";

const METHOD_PRODUCTS = "products";
const METHOD_EQUAL = "equal";

const STEP_METHOD = 0;
const STEP_CONFIGURATION = 1;
const STEP_OPERATION = 2;

const ACCOUNT_PAGE_SIZE = 2;

export default function CashierSplitSaleDialog({
  open,
  sale,
  initialCheckId = null,
  externalResult = null,
  onClose,
  onSplitByProducts,
  onSplitEqualParts,
  onUndoEqualParts,
  onMoveItem,
  onMoveQuantity,
}) {
  const saleId = Number(sale?.sale_id || 0);

  const [loading, setLoading] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [summary, setSummary] = useState(null);

  const [method, setMethod] = useState(null);
  const [activeStep, setActiveStep] = useState(STEP_METHOD);

  const [sourceCheckId, setSourceCheckId] = useState("");
  const [targetCheckId, setTargetCheckId] = useState("");

  const [checkName, setCheckName] = useState("");
  const [reason, setReason] = useState("");
  const [parts, setParts] = useState("2");

  const [selectedItems, setSelectedItems] = useState({});
  const [partialItemId, setPartialItemId] = useState(null);
  const [partialQuantity, setPartialQuantity] = useState("");

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const showAlert = ({ severity = "error", title = "Error", message }) => {
    if (!message) return;
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, closeReason) => {
    if (closeReason === "clickaway") return;
    setAlertState((previous) => ({ ...previous, open: false }));
  };

  const loadChecks = async () => {
    if (!saleId) return;

    setLoading(true);

    try {
      const response = await fetchCashierSaleChecks(saleId);
      setSummary(response?.data || null);
    } catch (error) {
      setSummary(null);

      showAlert({
        severity: "error",
        title: "No se pudieron cargar las cuentas",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "No se pudieron consultar las cuentas de la venta.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    setMethod(null);
    setActiveStep(STEP_METHOD);
    setSourceCheckId("");
    setTargetCheckId("");
    setCheckName("");
    setReason("");
    setParts("2");
    setSelectedItems({});
    setPartialItemId(null);
    setPartialQuantity("");
    setSummary(null);
    setAlertState((previous) => ({ ...previous, open: false }));

    loadChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, saleId]);

  useEffect(() => {
    if (!open || !externalResult) return;

    setPartialItemId(null);
    setPartialQuantity("");
    loadChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalResult, open]);

  const splitMode = resolveSplitMode(summary);
  const permissions = summary?.permissions || {};
  const blockedReasons = summary?.blocked_reasons || {};

  const checks = useMemo(() => decorateChecks(summary), [summary]);

  const activeChecks = useMemo(
    () =>
      checks.filter(
        (check) =>
          !["merged", "cancelled"].includes(
            String(check?.status || check?.check_status || "").toLowerCase()
          )
      ),
    [checks]
  );

  const normalSourceChecks = useMemo(
    () =>
      activeChecks.filter(
        (check) =>
          check?.flags?.editable === true &&
          check?.flags?.is_empty !== true &&
          check?.flags?.is_equal_part !== true
      ),
    [activeChecks]
  );

  const productChecks = useMemo(
    () =>
      activeChecks.filter(
        (check) =>
          check?.flags?.can_move_items === true &&
          check?.flags?.is_equal_part !== true
      ),
    [activeChecks]
  );

  const sourceCandidates = splitMode === "products" ? productChecks : normalSourceChecks;

  useEffect(() => {
    if (!open || !summary) return;

    if (splitMode === "products") {
      setMethod(METHOD_PRODUCTS);
      setActiveStep(STEP_OPERATION);
      return;
    }

    if (splitMode === "equal_parts") {
      setMethod(METHOD_EQUAL);
      setActiveStep(STEP_OPERATION);
      return;
    }

    if (splitMode === "inconsistent") {
      setMethod(null);
      setActiveStep(STEP_METHOD);
    }
  }, [open, splitMode, summary]);

  useEffect(() => {
    if (!open || sourceCandidates.length === 0) return;

    const requestedId = Number(initialCheckId || 0);
    const requestedExists = sourceCandidates.some((check) => getCheckId(check) === requestedId);

    setSourceCheckId((current) => {
      const currentId = Number(current || 0);
      const currentExists = sourceCandidates.some((check) => getCheckId(check) === currentId);

      if (currentExists) return current;
      if (requestedExists) return String(requestedId);

      return String(getCheckId(sourceCandidates[0]));
    });
  }, [initialCheckId, open, sourceCandidates]);

  useEffect(() => {
    setSelectedItems({});
    setPartialItemId(null);
    setPartialQuantity("");
  }, [sourceCheckId]);

  useEffect(() => {
    if (splitMode !== "products") return;

    const sourceId = Number(sourceCheckId || 0);
    const targetCandidates = productChecks.filter((check) => getCheckId(check) !== sourceId);

    setTargetCheckId((current) => {
      const currentId = Number(current || 0);
      const currentExists = targetCandidates.some((check) => getCheckId(check) === currentId);

      if (currentExists) return current;

      return targetCandidates.length > 0 ? String(getCheckId(targetCandidates[0])) : "";
    });
  }, [productChecks, sourceCheckId, splitMode]);

  const sourceCheck = useMemo(
    () =>
      activeChecks.find((check) => getCheckId(check) === Number(sourceCheckId || 0)) ||
      null,
    [activeChecks, sourceCheckId]
  );

  const targetCheck = useMemo(
    () =>
      activeChecks.find((check) => getCheckId(check) === Number(targetCheckId || 0)) ||
      null,
    [activeChecks, targetCheckId]
  );

  const targetCandidates = useMemo(
    () => productChecks.filter((check) => getCheckId(check) !== Number(sourceCheckId || 0)),
    [productChecks, sourceCheckId]
  );

  const sourceItems = useMemo(
    () =>
      (Array.isArray(sourceCheck?.items) ? sourceCheck.items : []).filter(
        (item) =>
          item?.parent_order_item_id === null &&
          Number(item?.quantity || 0) > 0
      ),
    [sourceCheck]
  );

  const selectedProductRows = useMemo(
    () =>
      sourceItems
        .filter((item) =>
          Object.prototype.hasOwnProperty.call(selectedItems, getItemId(item))
        )
        .map((item) => ({
          item,
          quantity: Number(selectedItems[getItemId(item)] || 0),
        })),
    [selectedItems, sourceItems]
  );

  const structureLimits = summary?.structure_limits || summary?.limits || {};

  const remainingChecks = Number(
    structureLimits?.remaining_checks ??
      summary?.limits?.remaining_checks ??
      0
  );

  const maxEqualParts = Math.max(
    Number(structureLimits?.max_parts ?? remainingChecks + 1),
    2
  );

  const canSplitByProducts = permissions.can_split_products === true;
  const canSplitEqual = permissions.can_split_equal_parts === true;
  const canManageProductSplit = permissions.can_manage_product_split === true;
  const canUndoEqualParts = permissions.can_undo_equal_parts === true;

  const busy = loading || busyAction !== "";

  const steps = useMemo(() => {
    if (splitMode === "products") {
      return ["División actual", "Seleccionar cuentas", "Mover productos"];
    }

    if (splitMode === "equal_parts") {
      return ["División actual", "Revisar partes", "Deshacer"];
    }

    if (method === METHOD_PRODUCTS) {
      return ["Método", "Seleccionar productos", "Confirmar"];
    }

    if (method === METHOD_EQUAL) {
      return ["Método", "Configurar partes", "Confirmar"];
    }

    return ["Método", "Configurar", "Finalizar"];
  }, [method, splitMode]);

  const dialogTitle = (() => {
    if (splitMode === "products") {
      return `Administrar división${saleId ? ` de venta #${saleId}` : ""}`;
    }

    if (splitMode === "equal_parts") {
      return `Partes iguales${saleId ? ` de venta #${saleId}` : ""}`;
    }

    if (splitMode === "inconsistent") {
      return `Cuentas pendientes de corrección${saleId ? ` · Venta #${saleId}` : ""}`;
    }

    return `Dividir venta${saleId ? ` #${saleId}` : ""}`;
  })();

  const dialogDescription = (() => {
    if (splitMode === "products") {
      return "Mueve productos entre las cuentas existentes. Los importes se actualizarán automáticamente.";
    }

    if (splitMode === "equal_parts") {
      return "La división solo puede deshacerse completa. No se seleccionan partes individuales.";
    }

    if (splitMode === "inconsistent") {
      return "Las cuentas necesitan corregirse antes de continuar con la división o el cobro.";
    }

    return "Elige el método y sigue el flujo paso a paso.";
  })();

  const selectMethod = (nextMethod) => {
    if (nextMethod === METHOD_PRODUCTS && !canSplitByProducts) return;
    if (nextMethod === METHOD_EQUAL && !canSplitEqual) return;

    setMethod(nextMethod);
    setActiveStep(STEP_CONFIGURATION);
    setCheckName("");
    setReason("");
    setParts("2");
    setSelectedItems({});
    setPartialItemId(null);
    setPartialQuantity("");
  };

  const returnToMethods = () => {
    if (busy) return;

    setMethod(null);
    setActiveStep(STEP_METHOD);
    setCheckName("");
    setReason("");
    setParts("2");
    setSelectedItems({});
  };

  const toggleProductSelection = (item, checked) => {
    const itemId = getItemId(item);

    if (!itemId) return;

    setSelectedItems((current) => {
      const next = { ...current };

      if (!checked) {
        delete next[itemId];
        return next;
      }

      const defaultQuantity = getDefaultMovableQuantity(item);

      if (defaultQuantity <= 0) return current;

      next[itemId] = String(defaultQuantity);
      return next;
    });
  };

  const changeSelectedQuantity = (itemId, value) => {
    setSelectedItems((current) => ({ ...current, [itemId]: value }));
  };

  const handleProductContinue = () => {
    const checkId = Number(sourceCheckId || 0);

    if (!checkId) {
      showAlert({
        severity: "warning",
        title: "Selecciona una cuenta",
        message: "Selecciona la cuenta desde la que se moverán los productos.",
      });
      return;
    }

    if (selectedProductRows.length === 0) {
      showAlert({
        severity: "warning",
        title: "Selecciona productos",
        message: "Selecciona por lo menos un producto para crear la nueva cuenta.",
      });
      return;
    }

    for (const row of selectedProductRows) {
      const validationMessage = validateSelectedQuantity(row.item, row.quantity);

      if (validationMessage) {
        showAlert({
          severity: "warning",
          title: "Cantidad inválida",
          message: validationMessage,
        });
        return;
      }
    }

    setActiveStep(STEP_OPERATION);
  };

  const handleProductConfirm = async () => {
    const checkId = Number(sourceCheckId || 0);

    if (!checkId || selectedProductRows.length === 0) return;

    const items = selectedProductRows.map((row) => ({
      order_check_item_id: getItemId(row.item),
      quantity: row.quantity,
    }));

    setBusyAction("split-products");

    try {
      await onSplitByProducts?.({
        checkId,
        payload: {
          name: checkName.trim() || null,
          reason: reason.trim() || null,
          items,
        },
      });
    } catch (error) {
      showAlert({
        severity: "error",
        title: "No se pudo dividir la cuenta",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "No se pudo completar la división por productos.",
      });
    } finally {
      setBusyAction("");
    }
  };

  const handleEqualContinue = () => {
    const checkId = Number(sourceCheckId || 0);
    const parsedParts = Number(parts);

    if (!checkId) {
      showAlert({
        severity: "warning",
        title: "Selecciona una cuenta",
        message: "Selecciona la cuenta que deseas dividir.",
      });
      return;
    }

    if (!Number.isInteger(parsedParts) || parsedParts < 2) {
      showAlert({
        severity: "warning",
        title: "Número de partes inválido",
        message: "La cantidad de partes debe ser un número entero mayor o igual a 2.",
      });
      return;
    }

    if (parsedParts > maxEqualParts) {
      showAlert({
        severity: "warning",
        title: "Límite de cuentas",
        message: `Puedes dividir esta cuenta en un máximo de ${maxEqualParts} partes.`,
      });
      return;
    }

    setActiveStep(STEP_OPERATION);
  };

  const handleEqualConfirm = async () => {
    const checkId = Number(sourceCheckId || 0);
    const parsedParts = Number(parts);

    setBusyAction("equal");

    try {
      await onSplitEqualParts?.({
        checkId,
        payload: { parts: parsedParts },
      });
    } catch (error) {
      showAlert({
        severity: "error",
        title: "No se pudo dividir la cuenta",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "No se pudo dividir la cuenta en partes iguales.",
      });
    } finally {
      setBusyAction("");
    }
  };

  const handleUndoEqualParts = async () => {
    const groupId = Number(
      summary?.order_billing_group_id ||
        sale?.order_billing_group_id ||
        0
    );

    if (!groupId) {
      showAlert({
        severity: "warning",
        title: "Paquete no identificado",
        message: "No se pudo identificar el grupo financiero de las partes.",
      });
      return;
    }

    setBusyAction("undo-equal");

    try {
      await onUndoEqualParts?.({
        groupId,
        payload: {},
      });
    } catch (error) {
      showAlert({
        severity: "error",
        title: "No se pudo deshacer la división",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "No se pudo restaurar la cuenta original.",
      });
    } finally {
      setBusyAction("");
    }
  };

  const handleMove = async (item, partial = false) => {
    const checkId = Number(sourceCheckId || 0);
    const destinationId = Number(targetCheckId || 0);
    const itemId = getItemId(item);
    const requestedQuantity = Number(partialQuantity);

    if (!checkId || !destinationId || !itemId) {
      showAlert({
        severity: "warning",
        title: "Datos incompletos",
        message: "No se pudo identificar correctamente el movimiento.",
      });
      return;
    }

    if (!partial && !canMoveItemFull(item)) {
      showAlert({
        severity: "warning",
        title: "Movimiento no permitido",
        message:
          getItemBlockedReason(item) ||
          "Este producto no puede moverse completo.",
      });
      return;
    }

    if (partial) {
      if (!canMoveItemPartial(item)) {
        showAlert({
          severity: "warning",
          title: "Movimiento no permitido",
          message:
            getItemBlockedReason(item) ||
            "No es posible mover una cantidad parcial de este producto.",
        });
        return;
      }

      const maximum = getMaximumMovableQuantity(item);

      if (
        !Number.isFinite(requestedQuantity) ||
        requestedQuantity <= 0 ||
        requestedQuantity > maximum
      ) {
        showAlert({
          severity: "warning",
          title: "Cantidad inválida",
          message: `La cantidad debe ser mayor que cero y no superar ${formatQuantity(maximum)}.`,
        });
        return;
      }
    }

    setBusyAction(`move:${itemId}`);

    try {
      const args = {
        checkId,
        itemId,
        payload: partial
          ? { target_check_id: destinationId, quantity: requestedQuantity }
          : { target_check_id: destinationId },
      };

      const result = partial
        ? await onMoveQuantity?.(args)
        : await onMoveItem?.(args);

      if (!result?.ok) return;

      setPartialItemId(null);
      setPartialQuantity("");

      await loadChecks();
    } catch (error) {
      showAlert({
        severity: "error",
        title: "No se pudo mover el producto",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "No se pudo completar el movimiento.",
      });
    } finally {
      setBusyAction("");
    }
  };

  const productDisabledReason =
    blockedReasons?.split_products ||
    "Esta cuenta no puede dividirse por productos en este momento.";

  const equalDisabledReason =
    blockedReasons?.split_equal_parts ||
    "Esta cuenta no puede dividirse en partes iguales en este momento.";

  return (
    <>
      <CashierDialogShell
        open={open}
        title={dialogTitle}
        description={dialogDescription}
        icon={<CallSplitRoundedIcon />}
        busy={busy}
        maxWidth="md"
        onClose={onClose}
      >
        <Stack spacing={2}>
          <CashierFlowStepper steps={steps} activeStep={activeStep} />

          {loading ? (
            <LoadingCard />
          ) : (
            <Card
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                boxShadow: "none",
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, sm: 3 },
                  "&:last-child": { pb: { xs: 2, sm: 3 } },
                }}
              >
                {splitMode === "inconsistent" ? (
                  <InconsistentStructureContent
                    reason={
                      blockedReasons?.manage_product_split ||
                      blockedReasons?.split_products ||
                      blockedReasons?.merge_checks
                    }
                    onClose={onClose}
                  />
                ) : null}

                {splitMode === "equal_parts" ? (
                  <EqualPartsUndoContent
                    checks={activeChecks}
                    canUndo={canUndoEqualParts}
                    blockedReason={blockedReasons?.undo_equal_parts}
                    busy={busy}
                    busyAction={busyAction}
                    onUndo={handleUndoEqualParts}
                    onClose={onClose}
                  />
                ) : null}

                {splitMode === "products" ? (
                  <ProductManagementContent
                    sourceChecks={productChecks}
                    targetChecks={targetCandidates}
                    sourceCheckId={sourceCheckId}
                    targetCheckId={targetCheckId}
                    sourceCheck={sourceCheck}
                    targetCheck={targetCheck}
                    sourceItems={sourceItems}
                    canManage={canManageProductSplit}
                    blockedReason={blockedReasons?.manage_product_split}
                    busy={busy}
                    busyAction={busyAction}
                    partialItemId={partialItemId}
                    partialQuantity={partialQuantity}
                    onSourceChange={setSourceCheckId}
                    onTargetChange={setTargetCheckId}
                    onPartialQuantityChange={setPartialQuantity}
                    onOpenPartial={(itemId) => {
                      setPartialItemId(itemId);
                      setPartialQuantity("");
                    }}
                    onCancelPartial={() => {
                      setPartialItemId(null);
                      setPartialQuantity("");
                    }}
                    onMove={handleMove}
                    onClose={onClose}
                  />
                ) : null}

                {splitMode === "normal" && activeStep === STEP_METHOD ? (
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: { xs: 18, sm: 20 },
                          fontWeight: 800,
                          color: "text.primary",
                        }}
                      >
                        ¿Cómo quieres dividir la cuenta?
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontSize: 13,
                          lineHeight: 1.55,
                          color: "text.secondary",
                        }}
                      >
                        Selecciona una de las opciones disponibles para esta cuenta.
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gap: 2,
                        gridTemplateColumns: {
                          xs: "minmax(0, 1fr)",
                          sm: "repeat(2, minmax(0, 1fr))",
                        },
                        alignItems: "stretch",
                      }}
                    >
                      <CashierChoiceCard
                        title="Dividir por productos"
                        description="Selecciona los productos y confirma toda la división en una sola operación."
                        disabled={!canSplitByProducts}
                        disabledReason={canSplitByProducts ? "" : productDisabledReason}
                        icon={<FastfoodRoundedIcon />}
                        color="primary"
                        onClick={() => selectMethod(METHOD_PRODUCTS)}
                      />

                      <CashierChoiceCard
                        title="Dividir en partes iguales"
                        description="Indica el número de partes y deja que el servidor distribuya importes y residuos."
                        disabled={!canSplitEqual}
                        disabledReason={canSplitEqual ? "" : equalDisabledReason}
                        icon={<ViewWeekRoundedIcon />}
                        color="secondary"
                        onClick={() => selectMethod(METHOD_EQUAL)}
                      />
                    </Box>

                    <LimitsSummary summary={summary} />
                  </Stack>
                ) : null}

                {splitMode === "normal" &&
                activeStep === STEP_CONFIGURATION &&
                method === METHOD_PRODUCTS ? (
                  <Stack spacing={2.5}>
                    <StepHeading
                      title="Seleccionar productos"
                      description="La cuenta destino todavía no existe. Se creará únicamente cuando confirmes una selección válida."
                    />

                    <CheckSelector
                      label="Cuenta origen"
                      checks={normalSourceChecks}
                      value={sourceCheckId}
                      onChange={setSourceCheckId}
                      disabled={busy}
                    />

                    <Divider />

                    <FieldBlock
                      label="Nombre de la cuenta destino"
                      help="Opcional. Si se deja vacío, el sistema asignará un nombre."
                      input={
                        <TextField
                          value={checkName}
                          onChange={(event) =>
                            setCheckName(event.target.value.slice(0, 120))
                          }
                          inputProps={{ maxLength: 120 }}
                          placeholder="Ej. Persona 2"
                          disabled={busy}
                        />
                      }
                    />

                    <FieldBlock
                      label="Motivo"
                      help={`${reason.length}/255 · Opcional`}
                      input={
                        <TextField
                          value={reason}
                          onChange={(event) =>
                            setReason(event.target.value.slice(0, 255))
                          }
                          inputProps={{ maxLength: 255 }}
                          multiline
                          minRows={2}
                          placeholder="Describe brevemente la división"
                          disabled={busy}
                        />
                      }
                    />

                    <InitialProductSelection
                      items={sourceItems}
                      selectedItems={selectedItems}
                      disabled={busy}
                      onToggle={toggleProductSelection}
                      onQuantityChange={changeSelectedQuantity}
                    />

                    <LimitsSummary summary={summary} />

                    <ResponsiveActions>
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={returnToMethods}
                        disabled={busy}
                        startIcon={<ArrowBackRoundedIcon />}
                      >
                        Cambiar método
                      </Button>

                      <Button
                        type="button"
                        variant="contained"
                        onClick={handleProductContinue}
                        disabled={
                          busy ||
                          !sourceCheckId ||
                          selectedProductRows.length === 0
                        }
                      >
                        Revisar división
                      </Button>
                    </ResponsiveActions>
                  </Stack>
                ) : null}

                {splitMode === "normal" &&
                activeStep === STEP_OPERATION &&
                method === METHOD_PRODUCTS ? (
                  <Stack spacing={2.5}>
                    <StepHeading
                      title="Confirmar división por productos"
                      description="Revisa los productos seleccionados antes de crear la nueva cuenta."
                    />

                    <Box
                      sx={{
                        display: "grid",
                        gap: 2,
                        gridTemplateColumns: {
                          xs: "minmax(0, 1fr)",
                          sm: "repeat(2, minmax(0, 1fr))",
                        },
                      }}
                    >
                      <SummaryCard
                        label="Cuenta origen"
                        title={getCheckName(sourceCheck)}
                        value={formatCurrency(sourceCheck?.total)}
                      />

                      <SummaryCard
                        label="Cuenta destino"
                        title={checkName.trim() || "Nombre automático"}
                        value={`${selectedProductRows.length} ${
                          selectedProductRows.length === 1
                            ? "producto seleccionado"
                            : "productos seleccionados"
                        }`}
                        color="secondary"
                      />
                    </Box>

                    <SelectedProductsSummary rows={selectedProductRows} />

                    <Alert severity="info" variant="outlined" sx={{ minWidth: 0 }}>
                      Cerrar o cancelar antes de confirmar no creará cuentas ni registros financieros.
                    </Alert>

                    <ResponsiveActions>
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={() => setActiveStep(STEP_CONFIGURATION)}
                        disabled={busy}
                        startIcon={<ArrowBackRoundedIcon />}
                      >
                        Regresar
                      </Button>

                      <Button
                        type="button"
                        variant="contained"
                        onClick={handleProductConfirm}
                        disabled={busy}
                        startIcon={
                          busyAction === "split-products" ? (
                            <CircularProgress size={17} color="inherit" />
                          ) : (
                            <CheckRoundedIcon />
                          )
                        }
                      >
                        {busyAction === "split-products"
                          ? "Dividiendo…"
                          : "Confirmar división"}
                      </Button>
                    </ResponsiveActions>
                  </Stack>
                ) : null}

                {splitMode === "normal" &&
                activeStep === STEP_CONFIGURATION &&
                method === METHOD_EQUAL ? (
                  <Stack spacing={2.5}>
                    <StepHeading
                      title="Configurar partes iguales"
                      description="Selecciona la cuenta e indica el número total de partes."
                    />

                    <CheckSelector
                      label="Cuenta origen"
                      checks={normalSourceChecks}
                      value={sourceCheckId}
                      onChange={setSourceCheckId}
                      disabled={busy}
                    />

                    <FieldBlock
                      label="Número de partes *"
                      help={`Puedes dividir esta cuenta en un máximo de ${maxEqualParts} partes.`}
                      input={
                        <TextField
                          type="number"
                          value={parts}
                          onChange={(event) => setParts(event.target.value)}
                          inputProps={{
                            min: 2,
                            max: maxEqualParts,
                            step: 1,
                            inputMode: "numeric",
                          }}
                          disabled={busy}
                        />
                      }
                    />

                    <LimitsSummary summary={summary} />

                    <ResponsiveActions>
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={returnToMethods}
                        disabled={busy}
                        startIcon={<ArrowBackRoundedIcon />}
                      >
                        Cambiar método
                      </Button>

                      <Button
                        type="button"
                        variant="contained"
                        color="secondary"
                        onClick={handleEqualContinue}
                        disabled={busy || !sourceCheckId}
                      >
                        Revisar división
                      </Button>
                    </ResponsiveActions>
                  </Stack>
                ) : null}

                {splitMode === "normal" &&
                activeStep === STEP_OPERATION &&
                method === METHOD_EQUAL ? (
                  <Stack spacing={2.5}>
                    <StepHeading
                      title="Confirmar división"
                      description="Revisa cómo quedará dividida la cuenta antes de confirmar."
                    />

                    <Box
                      sx={{
                        display: "grid",
                        gap: 2,
                        gridTemplateColumns: {
                          xs: "minmax(0, 1fr)",
                          sm: "repeat(2, minmax(0, 1fr))",
                        },
                      }}
                    >
                      <SummaryCard
                        label="Cuenta origen"
                        title={getCheckName(sourceCheck)}
                        value={formatCurrency(sourceCheck?.total)}
                      />

                      <SummaryCard
                        label="Resultado"
                        title={`${Number(parts)} partes iguales`}
                        value="Importes distribuidos automáticamente"
                        color="secondary"
                      />
                    </Box>

                    <Alert severity="info" variant="outlined" sx={{ minWidth: 0 }}>
                      El total se distribuirá entre las partes y cualquier diferencia de centavos se ajustará automáticamente.
                    </Alert>

                    <ResponsiveActions>
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={() => setActiveStep(STEP_CONFIGURATION)}
                        disabled={busy}
                        startIcon={<ArrowBackRoundedIcon />}
                      >
                        Regresar
                      </Button>

                      <Button
                        type="button"
                        variant="contained"
                        color="secondary"
                        onClick={handleEqualConfirm}
                        disabled={busy}
                        startIcon={
                          busyAction === "equal" ? (
                            <CircularProgress size={17} color="inherit" />
                          ) : (
                            <CheckRoundedIcon />
                          )
                        }
                      >
                        {busyAction === "equal"
                          ? "Dividiendo…"
                          : "Confirmar división"}
                      </Button>
                    </ResponsiveActions>
                  </Stack>
                ) : null}
              </CardContent>
            </Card>
          )}
        </Stack>
      </CashierDialogShell>

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={3000}
      />
    </>
  );
}

function LoadingCard() {
  return (
    <Card
      sx={{
        minHeight: 320,
        display: "grid",
        placeItems: "center",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
      }}
    >
      <Stack alignItems="center" spacing={1.25}>
        <CircularProgress />
        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
          Cargando cuentas y productos…
        </Typography>
      </Stack>
    </Card>
  );
}

function InconsistentStructureContent({ reason, onClose }) {
  return (
    <Stack spacing={2.5}>
      <StepHeading
        title="Las cuentas necesitan corrección"
        description="No es posible dividir ni mover productos hasta corregir las cuentas de esta venta."
      />

      <Alert severity="warning" variant="outlined" sx={{ minWidth: 0 }}>
        {reason || "Utiliza la acción Reparar cuentas desde el menú de la venta."}
      </Alert>

      <ResponsiveActions>
        <Button type="button" variant="contained" onClick={onClose}>
          Cerrar
        </Button>
      </ResponsiveActions>
    </Stack>
  );
}

function EqualPartsUndoContent({
  checks,
  canUndo,
  blockedReason,
  busy,
  busyAction,
  onUndo,
  onClose,
}) {
  return (
    <Stack spacing={2.5}>
      <StepHeading
        title="Deshacer división en partes iguales"
        description="Todas las partes se absorberán en una sola cuenta. No se permite seleccionar solamente algunas."
      />

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "repeat(2, minmax(0, 1fr))",
          },
        }}
      >
        {checks.map((check) => (
          <SummaryCard
            key={getCheckId(check)}
            label={
              Number(check?.part_index || 0) > 0
                ? `Parte ${check.part_index} de ${check?.parts_total || checks.length}`
                : "Parte"
            }
            title={getCheckName(check)}
            value={formatCurrency(check?.total)}
            color="secondary"
          />
        ))}
      </Box>

      {!canUndo ? (
        <Alert severity="warning" variant="outlined" sx={{ minWidth: 0 }}>
          {blockedReason || "Esta división no puede deshacerse en este momento."}
        </Alert>
      ) : (
        <Alert severity="info" variant="outlined" sx={{ minWidth: 0 }}>
          Todas las partes se unirán automáticamente en una sola cuenta.
        </Alert>
      )}

      <ResponsiveActions>
        <Button
          type="button"
          variant="outlined"
          onClick={onClose}
          disabled={busy}
        >
          Cerrar
        </Button>

        <Button
          type="button"
          variant="contained"
          color="secondary"
          onClick={onUndo}
          disabled={busy || !canUndo}
          startIcon={
            busyAction === "undo-equal" ? (
              <CircularProgress size={17} color="inherit" />
            ) : (
              <UndoRoundedIcon />
            )
          }
        >
          {busyAction === "undo-equal"
            ? "Deshaciendo…"
            : "Deshacer partes iguales"}
        </Button>
      </ResponsiveActions>
    </Stack>
  );
}

function ProductManagementContent({
  sourceChecks,
  targetChecks,
  sourceCheckId,
  targetCheckId,
  sourceCheck,
  targetCheck,
  sourceItems,
  canManage,
  blockedReason,
  busy,
  busyAction,
  partialItemId,
  partialQuantity,
  onSourceChange,
  onTargetChange,
  onPartialQuantityChange,
  onOpenPartial,
  onCancelPartial,
  onMove,
  onClose,
}) {
  return (
    <Stack spacing={2.5}>
      <StepHeading
        title="Administrar división por productos"
        description="Selecciona la cuenta de origen, la cuenta de destino y los productos que deseas mover."
      />

      {!canManage ? (
        <Alert severity="warning" variant="outlined" sx={{ minWidth: 0 }}>
          {blockedReason || "Esta división no puede modificarse en este momento."}
        </Alert>
      ) : null}

      <CheckSelector
        label="Cuenta origen"
        checks={sourceChecks}
        value={sourceCheckId}
        onChange={onSourceChange}
        disabled={busy || !canManage}
      />

      <Divider />

      <CheckSelector
        label="Cuenta destino"
        checks={targetChecks}
        value={targetCheckId}
        onChange={onTargetChange}
        disabled={busy || !canManage}
        color="secondary"
      />

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "repeat(2, minmax(0, 1fr))",
          },
        }}
      >
        <SummaryCard
          label="Cuenta origen"
          title={getCheckName(sourceCheck)}
          value={formatCurrency(sourceCheck?.total)}
        />

        <SummaryCard
          label="Cuenta destino"
          title={getCheckName(targetCheck)}
          value={formatCurrency(targetCheck?.total)}
          color="secondary"
        />
      </Box>

      {sourceItems.length === 0 ? (
        <Alert severity="warning" variant="outlined" sx={{ minWidth: 0 }}>
          La cuenta seleccionada no tiene productos disponibles para mover.
        </Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              md: "repeat(2, minmax(0, 1fr))",
            },
            alignItems: "stretch",
          }}
        >
          {sourceItems.map((item) => {
            const itemId = getItemId(item);
            const moving = busyAction === `move:${itemId}`;

            return (
              <ProductMoveCard
                key={`item:${itemId}`}
                item={item}
                busy={
                  busy ||
                  !canManage ||
                  !sourceCheckId ||
                  !targetCheckId
                }
                moving={moving}
                partialOpen={Number(partialItemId || 0) === itemId}
                partialQuantity={partialQuantity}
                onPartialQuantityChange={onPartialQuantityChange}
                onOpenPartial={() => onOpenPartial(itemId)}
                onCancelPartial={onCancelPartial}
                onMoveFull={() => onMove(item, false)}
                onMovePartial={() => onMove(item, true)}
              />
            );
          })}
        </Box>
      )}

      <ResponsiveActions>
        <Button
          type="button"
          variant="contained"
          onClick={onClose}
          disabled={busy}
          startIcon={<CheckRoundedIcon />}
        >
          Finalizar
        </Button>
      </ResponsiveActions>
    </Stack>
  );
}

function InitialProductSelection({
  items,
  selectedItems,
  disabled,
  onToggle,
  onQuantityChange,
}) {
  if (items.length === 0) {
    return (
      <Alert severity="warning" variant="outlined" sx={{ minWidth: 0 }}>
        La cuenta no tiene productos seleccionables.
      </Alert>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
        Productos que pasarán a la nueva cuenta
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "repeat(2, minmax(0, 1fr))",
          },
        }}
      >
        {items.map((item) => {
          const itemId = getItemId(item);
          const selected = Object.prototype.hasOwnProperty.call(selectedItems, itemId);

          return (
            <InitialProductSelectionCard
              key={`select:${itemId}`}
              item={item}
              selected={selected}
              quantity={selectedItems[itemId] ?? ""}
              disabled={disabled}
              onToggle={(checked) => onToggle(item, checked)}
              onQuantityChange={(value) => onQuantityChange(itemId, value)}
            />
          );
        })}
      </Box>
    </Stack>
  );
}

function InitialProductSelectionCard({
  item,
  selected,
  quantity,
  disabled,
  onToggle,
  onQuantityChange,
}) {
  const canFull = canMoveItemFull(item);
  const canPartial = canMoveItemPartial(item);
  const maximum = getMaximumMovableQuantity(item);
  const selectable = canFull || canPartial;
  const blockedReason = getItemBlockedReason(item);

  return (
    <Card
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        borderRadius: 1,
        boxShadow: "none",
        opacity: selectable ? 1 : 0.62,
      }}
    >
      <CardContent
        sx={{
          p: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          "&:last-child": { pb: 2 },
        }}
      >
        <Stack spacing={1.5} sx={{ height: "100%" }}>
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Checkbox
              checked={selected}
              disabled={disabled || !selectable}
              onChange={(event) => onToggle(event.target.checked)}
              sx={{ p: 0.25 }}
            />

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "text.primary",
                  wordBreak: "break-word",
                }}
              >
                {getItemName(item)}
              </Typography>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" mt={1}>
                <Chip
                  label={`Disponible: ${formatQuantity(item?.quantity)}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />

                <Chip
                  label={`Máximo movible: ${formatQuantity(maximum)}`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              </Stack>
            </Box>
          </Stack>

          {blockedReason && !selectable ? (
            <Alert severity="warning" variant="outlined" sx={{ minWidth: 0 }}>
              {blockedReason}
            </Alert>
          ) : null}

          {selected ? (
            <TextField
              type="number"
              value={quantity}
              onChange={(event) => onQuantityChange(event.target.value)}
              inputProps={{
                min: 0.0001,
                max: maximum,
                step: 0.0001,
                inputMode: "decimal",
              }}
              label="Cantidad a mover"
              disabled={disabled || !canPartial}
              helperText={
                canPartial
                  ? "Puedes mover una cantidad parcial dentro del máximo autorizado."
                  : "Este producto solo puede moverse completo."              }
            />
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

function SelectedProductsSummary({ rows }) {
  return (
    <Stack spacing={1}>
      {rows.map(({ item, quantity }) => (
        <Box
          key={`summary:${getItemId(item)}`}
          sx={{
            p: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "background.default",
          }}
        >
          <Stack direction="row" justifyContent="space-between" spacing={1.5}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>
              {getItemName(item)}
            </Typography>

            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 800,
                color: "secondary.main",
                whiteSpace: "nowrap",
              }}
            >
              {formatQuantity(quantity)}
            </Typography>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

function CheckSelector({
  label,
  checks,
  value,
  onChange,
  disabled,
  color = "primary",
}) {
  if (checks.length === 0) {
    return (
      <Alert severity="warning" variant="outlined" sx={{ minWidth: 0 }}>
        No existen cuentas disponibles para {label.toLowerCase()}.
      </Alert>
    );
  }

  if (checks.length === 1) {
    const check = checks[0];

    return (
      <SummaryCard
        label={label}
        title={getCheckName(check)}
        value={formatCurrency(check?.total)}
        color={color}
      />
    );
  }

  return (
    <PagedCheckSelector
      label={label}
      checks={checks}
      value={value}
      onChange={onChange}
      disabled={disabled}
      color={color}
    />
  );
}

function PagedCheckSelector({
  label,
  checks,
  value,
  onChange,
  disabled,
  color = "primary",
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(checks.length / ACCOUNT_PAGE_SIZE));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const start = (page - 1) * ACCOUNT_PAGE_SIZE;
  const visibleChecks = checks.slice(start, start + ACCOUNT_PAGE_SIZE);
  const paletteColor = color === "secondary" ? "secondary" : "primary";

  return (
    <Stack spacing={1.5}>
      <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
        {label}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "repeat(2, minmax(0, 1fr))",
          },
          alignItems: "stretch",
        }}
      >
        {visibleChecks.map((check) => {
          const checkId = getCheckId(check);
          const selected = Number(value || 0) === checkId;

          return (
            <Card
              key={`check:${checkId}`}
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: selected ? `${paletteColor}.main` : "divider",
                boxShadow: "none",
              }}
            >
              <CardActionArea
                disabled={disabled}
                onClick={() => onChange(String(checkId))}
                sx={{ height: "100%" }}
              >
                <CardContent
                  sx={{
                    minHeight: 116,
                    p: 2,
                    "&:last-child": { pb: 2 },
                  }}
                >
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={1}
                    >
                      <Typography
                        sx={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: "text.primary",
                        }}
                      >
                        {getCheckName(check)}
                      </Typography>

                      {selected ? (
                        <Chip
                          label="Seleccionada"
                          size="small"
                          color={paletteColor}
                        />
                      ) : null}
                    </Stack>

                    <Typography
                      sx={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "text.primary",
                      }}
                    >
                      {formatCurrency(check?.total)}
                    </Typography>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>

      {totalPages > 1 ? (
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
          <Button
            type="button"
            variant="outlined"
            size="small"
            disabled={page <= 1 || disabled}
            onClick={() => setPage((current) => current - 1)}
            startIcon={<ChevronLeftRoundedIcon />}
          >
            Anterior
          </Button>

          <Typography
            sx={{
              minWidth: 62,
              textAlign: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "text.primary",
            }}
          >
            {page} / {totalPages}
          </Typography>

          <Button
            type="button"
            variant="outlined"
            size="small"
            disabled={page >= totalPages || disabled}
            onClick={() => setPage((current) => current + 1)}
            endIcon={<ChevronRightRoundedIcon />}
          >
            Siguiente
          </Button>
        </Stack>
      ) : null}
    </Stack>
  );
}

function ProductMoveCard({
  item,
  busy,
  moving,
  partialOpen,
  partialQuantity,
  onPartialQuantityChange,
  onOpenPartial,
  onCancelPartial,
  onMoveFull,
  onMovePartial,
}) {
  const canFull = canMoveItemFull(item);
  const canPartial = canMoveItemPartial(item);
  const maximum = getMaximumMovableQuantity(item);
  const blockedReason = getItemBlockedReason(item);

  return (
    <Card
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
      }}
    >
      <CardContent
        sx={{
          p: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          "&:last-child": { pb: 2 },
        }}
      >
        <Stack spacing={1.5} sx={{ height: "100%" }}>
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 800,
                color: "text.primary",
                wordBreak: "break-word",
              }}
            >
              {getItemName(item)}
            </Typography>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" mt={1}>
              <Chip
                label={`Cantidad: ${formatQuantity(item?.quantity)}`}
                size="small"
                color="primary"
                variant="outlined"
              />

              <Chip
                label={`Máximo movible: ${formatQuantity(maximum)}`}
                size="small"
                color="secondary"
                variant="outlined"
              />

              <Chip
                label={formatCurrency(item?.net_line_total)}
                size="small"
                variant="outlined"
              />
            </Stack>
          </Box>

          {blockedReason && !canFull && !canPartial ? (
            <Alert severity="warning" variant="outlined" sx={{ minWidth: 0 }}>
              {blockedReason}
            </Alert>
          ) : null}

          <Box sx={{ flex: 1 }} />

          {partialOpen && canPartial ? (
            <Stack spacing={1.25}>
              <TextField
                type="number"
                value={partialQuantity}
                onChange={(event) => onPartialQuantityChange(event.target.value)}
                inputProps={{
                  min: 0.0001,
                  max: maximum,
                  step: 0.0001,
                  inputMode: "decimal",
                }}
                placeholder="Cantidad a mover"
                disabled={busy}
              />

              <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={1}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={onCancelPartial}
                  disabled={busy}
                  sx={{ width: "100%" }}
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  variant="contained"
                  color="secondary"
                  onClick={onMovePartial}
                  disabled={busy}
                  startIcon={
                    moving ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <DriveFileMoveRoundedIcon />
                    )
                  }
                  sx={{ width: "100%" }}
                >
                  {moving ? "Moviendo…" : "Confirmar cantidad"}
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                type="button"
                variant="contained"
                onClick={onMoveFull}
                disabled={busy || !canFull}
                startIcon={
                  moving ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <DriveFileMoveRoundedIcon />
                  )
                }
                sx={{ width: "100%" }}
              >
                {moving ? "Moviendo…" : "Mover completo"}
              </Button>

              <Button
                type="button"
                variant="outlined"
                color="secondary"
                onClick={onOpenPartial}
                disabled={busy || !canPartial}
                sx={{ width: "100%" }}
              >
                Mover cantidad
              </Button>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function LimitsSummary({ summary }) {
  const limits = summary?.structure_limits || summary?.limits || null;

  if (!limits) return null;

  const activeChecks = Number(
    summary?.structure?.active_checks_count ??
      limits?.active_checks_count ??
      0
  );

  const maximum = Number(limits?.max_checks_per_group ?? 0);
  const remaining = Number(limits?.remaining_checks ?? 0);

  return (
    <Box
      sx={{
        p: 1.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.default",
      }}
    >
      <Typography sx={{ fontSize: 13, lineHeight: 1.5, color: "text.secondary" }}>
        Cuentas activas:{" "}
        <Box component="span" sx={{ fontWeight: 800, color: "text.primary" }}>
          {activeChecks}
        </Box>

        {maximum > 0 ? (
          <>
            {" "}de{" "}
            <Box component="span" sx={{ fontWeight: 800, color: "text.primary" }}>
              {maximum}
            </Box>
          </>
        ) : null}

        . Espacios disponibles:{" "}
        <Box component="span" sx={{ fontWeight: 800, color: "secondary.main" }}>
          {remaining}
        </Box>
        .
      </Typography>
    </Box>
  );
}

function SummaryCard({ label, title, value, color = "primary" }) {
  const paletteColor = color === "secondary" ? "secondary" : "primary";

  return (
    <Card
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderLeft: "4px solid",
        borderLeftColor: `${paletteColor}.main`,
        borderRadius: 1,
        boxShadow: "none",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 0.3,
            color: "text.secondary",
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            mt: 0.75,
            fontSize: 16,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          {title || "Sin seleccionar"}
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            fontSize: 13,
            fontWeight: 700,
            color: `${paletteColor}.main`,
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function StepHeading({ title, description }) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: { xs: 18, sm: 20 },
          fontWeight: 800,
          color: "text.primary",
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          fontSize: 13,
          lineHeight: 1.55,
          color: "text.secondary",
        }}
      >
        {description}
      </Typography>
    </Box>
  );
}

function FieldBlock({ label, help, input }) {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography sx={{ mb: 1, fontSize: 14, fontWeight: 800, color: "text.primary" }}>
        {label}
      </Typography>

      {input}

      {help ? (
        <Typography sx={{ mt: 0.75, fontSize: 12, lineHeight: 1.45, color: "text.secondary" }}>
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}

function ResponsiveActions({ children }) {
  return (
    <Stack
      direction={{ xs: "column-reverse", sm: "row" }}
      justifyContent="flex-end"
      spacing={1.5}
      pt={0.5}
      sx={{
        "& > .MuiButton-root": {
          width: { xs: "100%", sm: "auto" },
          minWidth: { sm: 155 },
        },
      }}
    >
      {children}
    </Stack>
  );
}

function decorateChecks(summary) {
  const checks = Array.isArray(summary?.checks) ? summary.checks : [];
  const checksById = summary?.checks_by_id || {};

  return checks.map((check) => {
    const checkId = getCheckId(check);
    const policy = getObjectValue(checksById, checkId) || {};
    const itemsById = policy?.items_by_id || {};

    const items = (Array.isArray(check?.items) ? check.items : []).map((item) => {
      const itemId = getItemId(item);
      const itemPolicy = getObjectValue(itemsById, itemId) || {};

      return {
        ...item,
        ...itemPolicy,
        flags: {
          ...(item?.flags || {}),
          ...(itemPolicy?.flags || {}),
        },
        permissions: {
          ...(item?.permissions || {}),
          ...(itemPolicy?.permissions || {}),
        },
      };
    });

    return {
      ...check,
      ...policy,
      flags: {
        ...(check?.flags || {}),
        ...(policy?.flags || {}),
      },
      permissions: {
        ...(check?.permissions || {}),
        ...(policy?.permissions || {}),
      },
      items,
    };
  });
}

function getObjectValue(object, id) {
  if (!object || !id) return null;
  return object[id] || object[String(id)] || null;
}

function resolveSplitMode(summary) {
  const mode = String(summary?.split_mode || "normal").toLowerCase();

  return ["normal", "products", "equal_parts", "inconsistent"].includes(mode)
    ? mode
    : "inconsistent";
}

function canMoveItemFull(item) {
  return item?.permissions?.can_move_full === true;
}

function canMoveItemPartial(item) {
  return item?.permissions?.can_move_partial === true;
}

function getMaximumMovableQuantity(item) {
  return Math.max(
    0,
    Number(
      item?.maximum_movable_quantity ??
        item?.max_movable_quantity ??
        0
    )
  );
}

function getItemBlockedReason(item) {
  return item?.blocked_reason || item?.permissions?.blocked_reason || "";
}

function getDefaultMovableQuantity(item) {
  const available = Number(item?.quantity || 0);
  const maximum = getMaximumMovableQuantity(item);

  if (canMoveItemFull(item) && maximum >= available) return available;
  if (canMoveItemPartial(item)) return maximum;

  return 0;
}

function validateSelectedQuantity(item, quantity) {
  const available = Number(item?.quantity || 0);
  const maximum = getMaximumMovableQuantity(item);
  const tolerance = 0.000001;

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return `${getItemName(item)}: la cantidad debe ser mayor que cero.`;
  }

  if (quantity > maximum + tolerance) {
    return `${getItemName(item)}: la cantidad supera el máximo movible de ${formatQuantity(maximum)}.`;
  }

  const isFull = Math.abs(quantity - available) <= tolerance;

  if (isFull && !canMoveItemFull(item)) {
    return (
      getItemBlockedReason(item) ||
      `${getItemName(item)}: este producto no puede moverse completo.`
    );
  }

  if (!isFull && !canMoveItemPartial(item)) {
    return (
      getItemBlockedReason(item) ||
      `${getItemName(item)}: no es posible mover una cantidad parcial.`
    );
  }

  return "";
}

function getCheckId(check) {
  return Number(check?.order_check_id || check?.id || 0);
}

function getCheckName(check) {
  const checkId = getCheckId(check);

  return (
    check?.name ||
    check?.code ||
    (checkId ? `Cuenta #${checkId}` : "Cuenta sin identificar")
  );
}

function getItemId(item) {
  return Number(item?.order_check_item_id || item?.id || 0);
}

function getItemName(item) {
  return [
    item?.product_name || `Producto #${item?.product_id || "—"}`,
    item?.variant_name,
  ]
    .filter(Boolean)
    .join(" · ");
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

function formatQuantity(value) {
  const safe = Number(value || 0);

  return Number.isInteger(safe)
    ? String(safe)
    : safe.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}