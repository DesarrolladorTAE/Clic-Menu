// src/components/staff/casher/queuePage/CashierMergeSaleDialog.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, Box, Button, Card, CardActionArea, CardContent, Chip, CircularProgress, Divider, Stack, Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import MergeRoundedIcon from "@mui/icons-material/MergeRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import TableRestaurantRoundedIcon from "@mui/icons-material/TableRestaurantRounded";

import AppAlert from "../../../common/AppAlert";
import CashierChoiceCard from "../shared/CashierChoiceCard";
import CashierDialogShell from "../shared/CashierDialogShell";
import CashierFlowStepper from "../shared/CashierFlowStepper";

import { fetchCashierSaleChecks } from "../../../../services/staff/casher/cashierOrderCheck.service";

const MODE_CHECKS = "checks";
const MODE_TABLES = "tables";

const STEP_METHOD = 0;
const STEP_SELECTION = 1;
const STEP_CONFIRMATION = 2;

const PAGE_SIZE = 2;

export default function CashierMergeSaleDialog({
  open,
  sale,
  mySales = [],
  submitting = false,
  onClose,
  onMergeChecks,
  onMergeTables,
}) {
  const saleId = Number(sale?.sale_id || 0);

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const [mode, setMode] = useState(null);
  const [activeStep, setActiveStep] = useState(STEP_METHOD);

  const [sourceCheckId, setSourceCheckId] = useState("");
  const [targetCheckId, setTargetCheckId] = useState("");
  const [sourceTableId, setSourceTableId] = useState("");
  const [targetTableId, setTargetTableId] = useState("");

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const showAlert = ({
    severity = "error",
    title = "Error",
    message,
  }) => {
    if (!message) return;

    setAlertState({
      open: true,
      severity,
      title,
      message,
    });
  };

  const closeAlert = (_, closeReason) => {
    if (closeReason === "clickaway") return;

    setAlertState((previous) => ({
      ...previous,
      open: false,
    }));
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
          "No se pudo consultar la estructura financiera de la venta.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    setSummary(null);
    setMode(null);
    setActiveStep(STEP_METHOD);
    setSourceCheckId("");
    setTargetCheckId("");
    setSourceTableId("");
    setTargetTableId("");

    setAlertState((previous) => ({
      ...previous,
      open: false,
    }));

    loadChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, saleId]);

  const splitMode = resolveSplitMode(summary);
  const permissions = summary?.permissions || {};
  const blockedReasons = summary?.blocked_reasons || {};

  const allChecks = useMemo(
    () =>
      decorateChecks(summary).filter(
        (check) =>
          !["merged", "cancelled"].includes(
            String(
              check?.status || check?.check_status || ""
            ).toLowerCase()
          )
      ),
    [summary]
  );

  const mergeableChecks = useMemo(
    () =>
      allChecks.filter(
        (check) =>
          check?.flags?.can_merge === true ||
          check?.permissions?.can_merge === true
      ),
    [allChecks]
  );

  const repairSourceChecks = useMemo(
    () =>
      mergeableChecks.filter(
        (check) =>
          check?.flags?.is_empty === true &&
          check?.flags?.repair_only_by_merge === true
      ),
    [mergeableChecks]
  );

  const repairTargetChecks = useMemo(
    () =>
      mergeableChecks.filter(
        (check) => check?.flags?.is_empty !== true
      ),
    [mergeableChecks]
  );

  const isRepairMode =
    splitMode === "inconsistent";

  const checkSourceOptions = isRepairMode
    ? repairSourceChecks
    : mergeableChecks;

  const checkTargetOptions = useMemo(() => {
    const sourceId = Number(sourceCheckId || 0);

    const rows = isRepairMode
      ? repairTargetChecks
      : mergeableChecks;

    return rows.filter(
      (check) => getCheckId(check) !== sourceId
    );
  }, [
    isRepairMode,
    mergeableChecks,
    repairTargetChecks,
    sourceCheckId,
  ]);

  const backendCanMergeChecks =
    permissions.can_merge_checks === true;

  const backendCanMergeTables =
    permissions.can_merge_tables === true;

  const sourceTables = useMemo(
    () => getSaleTables(sale),
    [sale]
  );

  const targetTables = useMemo(() => {
    const rows = [];
    const seen = new Set();

    (Array.isArray(mySales) ? mySales : []).forEach(
      (candidateSale) => {
        const candidateMode = String(
          candidateSale?.split_mode || ""
        ).toLowerCase();

        if (
          getPackageKey(candidateSale) ===
            getPackageKey(sale) ||
          candidateSale?.permissions?.can_merge_tables !==
            true ||
          candidateMode !== "normal"
        ) {
          return;
        }

        getSaleTables(candidateSale).forEach((table) => {
          const tableId = Number(table?.id || 0);

          if (!tableId || seen.has(tableId)) return;

          seen.add(tableId);

          rows.push({
            id: tableId,
            name:
              table?.name || `Mesa #${tableId}`,
            sale_id: Number(
              candidateSale?.sale_id || 0
            ),
            package_key:
              getPackageKey(candidateSale),
          });
        });
      }
    );

    return rows;
  }, [mySales, sale]);

  const canMergeChecks =
    backendCanMergeChecks &&
    checkSourceOptions.length > 0 &&
    checkTargetOptions.length > 0;

  const canMergeTables =
    backendCanMergeTables &&
    splitMode === "normal" &&
    sourceTables.length > 0 &&
    targetTables.length > 0;

  useEffect(() => {
    if (
      !open ||
      loading ||
      !summary ||
      !isRepairMode ||
      mode
    ) {
      return;
    }

    setMode(MODE_CHECKS);
    setActiveStep(STEP_SELECTION);
  }, [
    isRepairMode,
    loading,
    mode,
    open,
    summary,
  ]);

  useEffect(() => {
    if (
      !open ||
      checkSourceOptions.length === 0
    ) {
      return;
    }

    setSourceCheckId((current) => {
      const currentId = Number(current || 0);
      const currentExists = checkSourceOptions.some(
        (check) => getCheckId(check) === currentId
      );

      if (currentExists) return current;

      return String(
        getCheckId(checkSourceOptions[0])
      );
    });
  }, [checkSourceOptions, open]);

  useEffect(() => {
    if (
      mode !== MODE_CHECKS ||
      checkTargetOptions.length === 0
    ) {
      return;
    }

    setTargetCheckId((current) => {
      const currentId = Number(current || 0);
      const currentExists = checkTargetOptions.some(
        (check) => getCheckId(check) === currentId
      );

      if (currentExists) return current;

      return String(
        getCheckId(checkTargetOptions[0])
      );
    });
  }, [checkTargetOptions, mode]);

  const sourceCheck = useMemo(
    () =>
      allChecks.find(
        (check) =>
          getCheckId(check) ===
          Number(sourceCheckId || 0)
      ) || null,
    [allChecks, sourceCheckId]
  );

  const targetCheck = useMemo(
    () =>
      allChecks.find(
        (check) =>
          getCheckId(check) ===
          Number(targetCheckId || 0)
      ) || null,
    [allChecks, targetCheckId]
  );

  const sourceTable = useMemo(
    () =>
      sourceTables.find(
        (table) =>
          Number(table?.id || 0) ===
          Number(sourceTableId || 0)
      ) || null,
    [sourceTableId, sourceTables]
  );

  const targetTable = useMemo(
    () =>
      targetTables.find(
        (table) =>
          Number(table?.id || 0) ===
          Number(targetTableId || 0)
      ) || null,
    [targetTableId, targetTables]
  );

  const busy = loading || submitting;

  const selectMode = (nextMode) => {
    if (
      nextMode === MODE_CHECKS &&
      !canMergeChecks
    ) {
      return;
    }

    if (
      nextMode === MODE_TABLES &&
      !canMergeTables
    ) {
      return;
    }

    setMode(nextMode);
    setActiveStep(STEP_SELECTION);
    setSourceTableId("");
    setTargetTableId("");
  };

  const returnToMethods = () => {
    if (busy || isRepairMode) return;

    setMode(null);
    setActiveStep(STEP_METHOD);
    setSourceCheckId("");
    setTargetCheckId("");
    setSourceTableId("");
    setTargetTableId("");
  };

  const continueToConfirmation = () => {
    if (mode === MODE_CHECKS) {
      const sourceId = Number(sourceCheckId || 0);
      const targetId = Number(targetCheckId || 0);

      if (
        !sourceId ||
        !targetId ||
        sourceId === targetId
      ) {
        showAlert({
          severity: "warning",
          title: "Selecciona las cuentas",
          message:
            "Selecciona cuentas de origen y destino diferentes.",
        });
        return;
      }

      if (
        isRepairMode &&
        sourceCheck?.flags?.is_empty !== true
      ) {
        showAlert({
          severity: "warning",
          title: "Origen no válido",
          message:
            "La reparación debe utilizar la cuenta vacía como origen.",
        });
        return;
      }

      if (
        isRepairMode &&
        targetCheck?.flags?.is_empty === true
      ) {
        showAlert({
          severity: "warning",
          title: "Destino no válido",
          message:
            "La cuenta destino de la reparación debe contener productos.",
        });
        return;
      }
    }

    if (mode === MODE_TABLES) {
      const sourceId = Number(sourceTableId || 0);
      const targetId = Number(targetTableId || 0);

      if (
        !sourceId ||
        !targetId ||
        sourceId === targetId
      ) {
        showAlert({
          severity: "warning",
          title: "Selecciona las mesas",
          message:
            "Selecciona mesas de origen y destino diferentes.",
        });
        return;
      }
    }

    setActiveStep(STEP_CONFIRMATION);
  };

  const handleConfirm = async () => {
    try {
      let result;

      if (mode === MODE_CHECKS) {
        result = await onMergeChecks?.({
          sourceCheckId: Number(sourceCheckId),
          targetCheckId: Number(targetCheckId),
          payload: {},
        });
      } else {
        result = await onMergeTables?.({
          sourceTableId: Number(sourceTableId),
          targetTableId: Number(targetTableId),
          payload: {},
        });
      }

      if (result?.ok) onClose?.();
    } catch (error) {
      showAlert({
        severity: "error",
        title:
          mode === MODE_CHECKS
            ? isRepairMode
              ? "No se pudieron reparar las cuentas"
              : "No se pudieron juntar las cuentas"
            : "No se pudieron juntar las mesas",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "No se pudo completar la operación.",
      });
    }
  };

  const checksDisabledReason = (() => {
    if (!backendCanMergeChecks) {
      return (
        blockedReasons?.merge_checks ||
        "Las cuentas de esta venta no pueden juntarse en este momento."
      );
    }

    if (isRepairMode) {
      if (repairSourceChecks.length === 0) {
        return "No se encontró una cuenta vacía autorizada para reparación.";
      }

      if (repairTargetChecks.length === 0) {
        return "No se encontró una cuenta con productos que pueda recibir la reparación.";
      }
    }

    if (mergeableChecks.length < 2) {
      return "Se necesitan al menos dos cuentas disponibles para juntarlas.";
    }

    return "";
  })();

  const tablesDisabledReason = (() => {
    if (!backendCanMergeTables) {
      return (
        blockedReasons?.merge_tables ||
        "Esta venta no puede juntarse con otra mesa en este momento."
      );
    }

    if (splitMode !== "normal") {
      return "Primero debes dejar esta venta con una sola cuenta antes de juntarla con otra mesa.";
    }

    if (sourceTables.length === 0) {
      return "La venta no tiene una mesa asociada.";
    }

    if (targetTables.length === 0) {
      return "No hay otra mesa compatible tomada por esta caja.";
    }

    return "";
  })();

  const dialogTitle = isRepairMode
    ? "Reparar cuentas"
    : "Juntar cuentas o mesas";

  const dialogDescription = isRepairMode
    ? "La cuenta vacía se eliminará y la venta conservará la cuenta que contiene productos."
    : "Elige qué deseas juntar.";

  return (
    <>
      <CashierDialogShell
        open={open}
        title={dialogTitle}
        description={dialogDescription}
        icon={
          isRepairMode ? (
            <BuildRoundedIcon />
          ) : (
            <MergeRoundedIcon />
          )
        }
        busy={busy}
        maxWidth="md"
        onClose={onClose}
      >
        <Stack spacing={2}>
          <CashierFlowStepper
            steps={[
              isRepairMode ? "Reparación" : "Método",
              "Seleccionar",
              "Confirmar",
            ]}
            activeStep={activeStep}
          />

          {loading ? (
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

                <Typography
                  sx={{
                    fontSize: 13,
                    color: "text.secondary",
                  }}
                >
                  Cargando estructura financiera…
                </Typography>
              </Stack>
            </Card>
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
                  "&:last-child": {
                    pb: { xs: 2, sm: 3 },
                  },
                }}
              >
                {activeStep === STEP_METHOD ? (
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: { xs: 18, sm: 20 },
                          fontWeight: 800,
                          color: "text.primary",
                        }}
                      >
                        ¿Qué quieres juntar?
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontSize: 13,
                          lineHeight: 1.55,
                          color: "text.secondary",
                        }}
                      >
                        Selecciona una de las opciones disponibles para esta venta.
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
                        title="Juntar cuentas"
                        description="Pasa todos los productos de una cuenta a otra y conserva una sola cuenta."
                        disabled={!canMergeChecks}
                        disabledReason={
                          canMergeChecks
                            ? ""
                            : checksDisabledReason
                        }
                        icon={<ReceiptLongRoundedIcon />}
                        color="primary"
                        onClick={() =>
                          selectMode(MODE_CHECKS)
                        }
                      />

                      <CashierChoiceCard
                        title="Juntar mesas"
                        description="Reúne las cuentas y productos de dos mesas en una sola."
                        disabled={!canMergeTables}
                        disabledReason={
                          canMergeTables
                            ? ""
                            : tablesDisabledReason
                        }
                        icon={<TableRestaurantRoundedIcon />}
                        color="secondary"
                        onClick={() =>
                          selectMode(MODE_TABLES)
                        }
                      />
                    </Box>
                  </Stack>
                ) : null}

                {activeStep === STEP_SELECTION &&
                mode === MODE_CHECKS ? (
                  <Stack spacing={2.5}>
                    <StepHeading
                      title={
                        isRepairMode
                          ? "Seleccionar reparación"
                          : "Seleccionar cuentas"
                      }
                      description={
                        isRepairMode
                          ? "La cuenta vacía debe permanecer como origen. La cuenta con productos debe permanecer como destino."
                          : "La cuenta origen desaparecerá como cuenta activa y sus productos pasarán a la cuenta destino."
                      }
                    />

                    {isRepairMode ? (
                      <Alert
                        severity="warning"
                        variant="outlined"
                        sx={{ minWidth: 0 }}
                      >
                        La dirección de esta operación no puede
                        invertirse.
                      </Alert>
                    ) : null}

                    <SelectionSection
                      title={
                        isRepairMode
                          ? "Cuenta vacía de origen"
                          : "Cuenta origen"
                      }
                      items={checkSourceOptions}
                      value={sourceCheckId}
                      onChange={(value) => {
                        setSourceCheckId(value);

                        if (
                          Number(value) ===
                          Number(targetCheckId || 0)
                        ) {
                          setTargetCheckId("");
                        }
                      }}
                      disabled={busy}
                      renderItem={(check) => ({
                        id: getCheckId(check),
                        title: getCheckName(check),
                        subtitle: formatCurrency(
                          check?.total
                        ),
                        detail:
                          isRepairMode &&
                          check?.flags?.is_empty === true
                            ? "Cuenta vacía · Debe eliminarse"
                            : statusLabel(check?.status),
                      })}
                    />

                    <Divider />

                    <SelectionSection
                      title={
                        isRepairMode
                          ? "Cuenta válida de destino"
                          : "Cuenta destino"
                      }
                      items={checkTargetOptions}
                      value={targetCheckId}
                      onChange={setTargetCheckId}
                      disabled={busy}
                      renderItem={(check) => ({
                        id: getCheckId(check),
                        title: getCheckName(check),
                        subtitle: formatCurrency(
                          check?.total
                        ),
                        detail: statusLabel(check?.status),
                      })}
                      color="secondary"
                    />

                    <ResponsiveActions>
                      {!isRepairMode ? (
                        <Button
                          type="button"
                          variant="outlined"
                          onClick={returnToMethods}
                          disabled={busy}
                          startIcon={
                            <ArrowBackRoundedIcon />
                          }
                        >
                          Cambiar método
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outlined"
                          onClick={onClose}
                          disabled={busy}
                        >
                          Cancelar
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="contained"
                        onClick={continueToConfirmation}
                        disabled={
                          busy ||
                          !sourceCheckId ||
                          !targetCheckId
                        }
                      >
                        {isRepairMode
                          ? "Revisar reparación"
                          : "Revisar unión"}
                      </Button>
                    </ResponsiveActions>
                  </Stack>
                ) : null}

                {activeStep === STEP_SELECTION &&
                mode === MODE_TABLES ? (
                  <Stack spacing={2.5}>
                    <StepHeading
                      title="Seleccionar mesas"
                      description="La mesa origen será absorbida por la mesa destino."
                    />

                    <SelectionSection
                      title="Mesa origen"
                      items={sourceTables}
                      value={sourceTableId}
                      onChange={setSourceTableId}
                      disabled={busy}
                      renderItem={(table) => ({
                        id: Number(table?.id || 0),
                        title: normalizeTableName(
                          table?.name,
                          table?.id
                        ),
                        subtitle:
                          "Mesa de la venta actual",
                        detail: "",
                      })}
                    />

                    <Divider />

                    <SelectionSection
                      title="Mesa destino"
                      items={targetTables}
                      value={targetTableId}
                      onChange={setTargetTableId}
                      disabled={busy}
                      renderItem={(table) => ({
                        id: Number(table?.id || 0),
                        title: normalizeTableName(
                          table?.name,
                          table?.id
                        ),
                        subtitle: table?.sale_id
                          ? `Venta #${table.sale_id}`
                          : "Venta tomada por esta caja",
                        detail: "",
                      })}
                      color="secondary"
                    />

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
                        onClick={continueToConfirmation}
                        disabled={
                          busy ||
                          !sourceTableId ||
                          !targetTableId
                        }
                      >
                        Revisar unión
                      </Button>
                    </ResponsiveActions>
                  </Stack>
                ) : null}

                {activeStep === STEP_CONFIRMATION ? (
                  <Stack spacing={2.5}>
                    <StepHeading
                      title={
                        isRepairMode
                          ? "Confirmar reparación"
                          : "Confirmar unión"
                      }
                      description="Revisa el origen y el destino antes de continuar."
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
                      <ConfirmationCard
                        label={
                          mode === MODE_CHECKS
                            ? isRepairMode
                              ? "Cuenta vacía de origen"
                              : "Cuenta origen"
                            : "Mesa origen"
                        }
                        title={
                          mode === MODE_CHECKS
                            ? getCheckName(sourceCheck)
                            : normalizeTableName(
                                sourceTable?.name,
                                sourceTable?.id
                              )
                        }
                        description={
                          mode === MODE_CHECKS
                            ? formatCurrency(
                                sourceCheck?.total
                              )
                            : "Esta mesa se integrará a la mesa de destino"
                        }
                      />

                      <ConfirmationCard
                        label={
                          mode === MODE_CHECKS
                            ? "Cuenta destino"
                            : "Mesa destino"
                        }
                        title={
                          mode === MODE_CHECKS
                            ? getCheckName(targetCheck)
                            : normalizeTableName(
                                targetTable?.name,
                                targetTable?.id
                              )
                        }
                        description={
                          mode === MODE_CHECKS
                            ? formatCurrency(
                                targetCheck?.total
                              )
                            : "Esta mesa conservará las cuentas reunidas"
                        }
                        color="secondary"
                      />
                    </Box>

                    <Alert
                      severity={
                        isRepairMode ? "info" : "warning"
                      }
                      variant="outlined"
                      sx={{ minWidth: 0 }}
                    >
                      {isRepairMode
                        ? "La cuenta vacía se eliminará y la cuenta con productos se conservará."
                        : "Antes de continuar se verificará que las cuentas puedan juntarse."}
                    </Alert>

                    <ResponsiveActions>
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={() =>
                          setActiveStep(STEP_SELECTION)
                        }
                        disabled={busy}
                        startIcon={<ArrowBackRoundedIcon />}
                      >
                        Regresar
                      </Button>

                      <Button
                        type="button"
                        variant="contained"
                        color={
                          mode === MODE_TABLES
                            ? "secondary"
                            : "primary"
                        }
                        onClick={handleConfirm}
                        disabled={busy}
                        startIcon={
                          submitting ? (
                            <CircularProgress
                              size={17}
                              color="inherit"
                            />
                          ) : isRepairMode ? (
                            <BuildRoundedIcon />
                          ) : (
                            <CheckRoundedIcon />
                          )
                        }
                      >
                        {submitting
                          ? "Procesando…"
                          : isRepairMode
                          ? "Reparar cuentas"
                          : mode === MODE_CHECKS
                          ? "Juntar cuentas"
                          : "Juntar mesas"}
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

function SelectionSection({
  title,
  items,
  value,
  onChange,
  disabled,
  renderItem,
  color = "primary",
}) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(items.length / PAGE_SIZE)
  );

  useEffect(() => {
    setPage((current) =>
      Math.min(current, totalPages)
    );
  }, [totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const visibleItems = items.slice(
    start,
    start + PAGE_SIZE
  );

  if (items.length === 0) {
    return (
      <Alert
        severity="warning"
        variant="outlined"
        sx={{ minWidth: 0 }}
      >
        No hay opciones disponibles para {title.toLowerCase()}.
      </Alert>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 800,
          color: "text.primary",
        }}
      >
        {title}
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
        {visibleItems.map((item) => {
          const rendered = renderItem(item);

          const selected =
            Number(value || 0) === Number(rendered.id);

          const paletteColor =
            color === "secondary"
              ? "secondary"
              : "primary";

          return (
            <Card
              key={`${title}:${rendered.id}`}
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: selected
                  ? `${paletteColor}.main`
                  : "divider",
                boxShadow: "none",
              }}
            >
              <CardActionArea
                disabled={disabled}
                onClick={() =>
                  onChange(String(rendered.id))
                }
                sx={{ height: "100%" }}
              >
                <CardContent
                  sx={{
                    minHeight: 120,
                    p: 2,
                    "&:last-child": { pb: 2 },
                  }}
                >
                  <Stack spacing={0.75}>
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
                        {rendered.title}
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
                        fontSize: 14,
                        fontWeight: 700,
                        color: `${paletteColor}.main`,
                      }}
                    >
                      {rendered.subtitle}
                    </Typography>

                    {rendered.detail ? (
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "text.secondary",
                        }}
                      >
                        {rendered.detail}
                      </Typography>
                    ) : null}
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>

      {totalPages > 1 ? (
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={1}
        >
          <Button
            type="button"
            size="small"
            variant="outlined"
            disabled={page <= 1 || disabled}
            onClick={() =>
              setPage((current) => current - 1)
            }
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
            size="small"
            variant="outlined"
            disabled={page >= totalPages || disabled}
            onClick={() =>
              setPage((current) => current + 1)
            }
            endIcon={<ChevronRightRoundedIcon />}
          >
            Siguiente
          </Button>
        </Stack>
      ) : null}
    </Stack>
  );
}

function ConfirmationCard({
  label,
  title,
  description,
  color = "primary",
}) {
  const paletteColor =
    color === "secondary" ? "secondary" : "primary";

  return (
    <Card
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderLeft: "4px solid",
        borderLeftColor: `${paletteColor}.main`,
        boxShadow: "none",
      }}
    >
      <CardContent
        sx={{
          p: 2,
          "&:last-child": { pb: 2 },
        }}
      >
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
            fontSize: 17,
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
          {description}
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
  const checks = Array.isArray(summary?.checks)
    ? summary.checks
    : [];

  const checksById = summary?.checks_by_id || {};

  return checks.map((check) => {
    const checkId = getCheckId(check);

    const policy =
      checksById?.[checkId] ||
      checksById?.[String(checkId)] ||
      {};

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
    };
  });
}

function resolveSplitMode(summary) {
  const mode = String(
    summary?.split_mode || "inconsistent"
  ).toLowerCase();

  return [
    "normal",
    "products",
    "equal_parts",
    "inconsistent",
  ].includes(mode)
    ? mode
    : "inconsistent";
}

function getSaleTables(sale) {
  const rows = Array.isArray(sale?.tables)
    ? sale.tables
    : sale?.table
    ? [sale.table]
    : [];

  const seen = new Set();

  return rows.filter((table) => {
    const id = Number(table?.id || 0);

    if (!id || seen.has(id)) return false;

    seen.add(id);
    return true;
  });
}

function getPackageKey(sale) {
  return (
    sale?.package_key ||
    `sale:${Number(sale?.sale_id || 0)}`
  );
}

function getCheckId(check) {
  return Number(
    check?.order_check_id ||
      check?.id ||
      0
  );
}

function getCheckName(check) {
  const id = getCheckId(check);

  return (
    check?.name ||
    check?.code ||
    (id
      ? `Cuenta #${id}`
      : "Cuenta sin identificar")
  );
}

function normalizeTableName(name, id) {
  const resolved = String(name || "").trim();

  if (!resolved) return `Mesa #${id || "—"}`;

  if (
    resolved.toLowerCase().startsWith("mesa")
  ) {
    return resolved;
  }

  return `Mesa ${resolved}`;
}

function statusLabel(status) {
  const value = String(status || "").toLowerCase();

  const labels = {
    open: "Abierta",
    locked: "Bloqueada",
    paying: "En pago",
    paid: "Pagada",
  };

  return labels[value] || value || "Sin estado";
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