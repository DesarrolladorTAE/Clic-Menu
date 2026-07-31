import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";

import BillingSettingsHeader from "../../../components/operation/billing-settings/BillingSettingsHeader";
import BillingSettingsInstructionsCard from "../../../components/operation/billing-settings/BillingSettingsInstructionsCard";
import BillingSettingsBranchSelectorCard from "../../../components/operation/billing-settings/BillingSettingsBranchSelectorCard";
import BillingSettingsTabs from "../../../components/operation/billing-settings/BillingSettingsTabs";

import BillingRulesTab from "../../../components/operation/billing-settings/rules/BillingRulesTab";
import OperationalAuthorizersTab from "../../../components/operation/billing-settings/authorizers/OperationalAuthorizersTab";

import { getBranchesByRestaurant } from "../../../services/restaurant/branch.service";
import {
  getBranchBillingSettings,
  updateBranchBillingSettings,
} from "../../../services/operation/billing-settings/branchBillingSettings.service";
import {
  getBranchOperationalAuthorizers,
  getBranchOperationalAuthorizerCandidates,
  createBranchOperationalAuthorizer,
  updateBranchOperationalAuthorizer,
  deleteBranchOperationalAuthorizer,
} from "../../../services/operation/billing-settings/operationalAuthorizers.service";

function normalizeRows(response) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
}

function normalizeSetting(response, branchId = null) {
  const raw =
    response?.data && typeof response.data === "object" && !Array.isArray(response.data)
      ? response.data
      : response;

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

  const maxChecksPerGroup = Number(raw.max_checks_per_group);

  return {
    ...raw,
    branch_id: branchId ? Number(branchId) : null,
    max_checks_per_group: Number.isInteger(maxChecksPerGroup) ? maxChecksPerGroup : null,
  };
}

function sortAuthorizers(rows) {
  return [...rows].sort((a, b) => {
    const activeDiff = Number(!!b?.is_active) - Number(!!a?.is_active);
    if (activeDiff !== 0) return activeDiff;

    return String(a?.user?.name || "").localeCompare(
      String(b?.user?.name || ""),
      "es",
      { sensitivity: "base" }
    );
  });
}

export default function BillingSettingsPage() {
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [loadingRules, setLoadingRules] = useState(false);
  const [savingRules, setSavingRules] = useState(false);
  const [loadingAuthorizers, setLoadingAuthorizers] = useState(false);
  const [savingAuthorizerId, setSavingAuthorizerId] = useState(null);
  const [deletingAuthorizerId, setDeletingAuthorizerId] = useState(null);

  const [activeTab, setActiveTab] = useState("rules");
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [billingSetting, setBillingSetting] = useState(null);
  const [authorizers, setAuthorizers] = useState([]);
  const [candidates, setCandidates] = useState([]);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const selectedBranch = useMemo(() => {
    return branches.find(
      (branch) => Number(branch.id) === Number(selectedBranchId)
    ) || null;
  }, [branches, selectedBranchId]);

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const showToast = (message, type = "info") => {
    const severity =
      type === "success"
        ? "success"
        : type === "warning"
          ? "warning"
          : type === "info"
            ? "info"
            : "error";

    const title =
      type === "success"
        ? "Hecho"
        : type === "warning"
          ? "Nota"
          : type === "info"
            ? "Aviso"
            : "Error";

    showAlert({ severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const extractErrorMessage = (error, fallback) => {
    const errors = error?.response?.data?.errors;
    const firstError =
      errors && typeof errors === "object"
        ? Object.values(errors).flat()?.[0]
        : null;

    return firstError || error?.response?.data?.message || error?.message || fallback;
  };

  const loadRules = async (branchId, { silent = false } = {}) => {
    if (!restaurantId || !branchId) {
      setBillingSetting(null);
      return null;
    }

    if (!silent) setLoadingRules(true);

    try {
      const response = await getBranchBillingSettings(restaurantId, branchId);
      const nextSetting = normalizeSetting(response, branchId);

      setBillingSetting(nextSetting);
      return nextSetting;
    } catch (error) {
      setBillingSetting(null);

      showAlert({
        severity: "error",
        title: "Error",
        message: extractErrorMessage(
          error,
          "No se pudo cargar la configuración de cuentas."
        ),
      });

      return null;
    } finally {
      if (!silent) setLoadingRules(false);
    }
  };

  const loadAuthorizers = async (branchId, { silent = false } = {}) => {
    if (!restaurantId || !branchId) {
      setAuthorizers([]);
      setCandidates([]);
      return null;
    }

    if (!silent) setLoadingAuthorizers(true);

    try {
      const [authorizersResponse, candidatesResponse] = await Promise.all([
        getBranchOperationalAuthorizers(restaurantId, branchId),
        getBranchOperationalAuthorizerCandidates(restaurantId, branchId),
      ]);

      const authorizerRows = normalizeRows(authorizersResponse);
      const candidateRows = normalizeRows(candidatesResponse);

      setAuthorizers(sortAuthorizers(authorizerRows));
      setCandidates(candidateRows);

      return { authorizers: authorizerRows, candidates: candidateRows };
    } catch (error) {
      setAuthorizers([]);
      setCandidates([]);

      showAlert({
        severity: "error",
        title: "Error",
        message: extractErrorMessage(
          error,
          "No se pudieron cargar los autorizadores operativos."
        ),
      });

      return null;
    } finally {
      if (!silent) setLoadingAuthorizers(false);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);

    try {
      const branchResponse = await getBranchesByRestaurant(restaurantId);
      const branchRows = normalizeRows(branchResponse);
      const firstBranchId = branchRows?.[0]?.id ? String(branchRows[0].id) : "";

      setBranches(branchRows);
      setSelectedBranchId(firstBranchId);

      if (firstBranchId) {
        await Promise.all([
          loadRules(firstBranchId, { silent: true }),
          loadAuthorizers(firstBranchId, { silent: true }),
        ]);
      } else {
        setBillingSetting(null);
        setAuthorizers([]);
        setCandidates([]);
      }
    } catch (error) {
      setBranches([]);
      setSelectedBranchId("");
      setBillingSetting(null);
      setAuthorizers([]);
      setCandidates([]);

      showAlert({
        severity: "error",
        title: "Error",
        message: extractErrorMessage(
          error,
          "No se pudo cargar la configuración operativa de cuentas."
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const handleBranchChange = async (branchId) => {
    setSelectedBranchId(branchId);
    setBillingSetting(null);
    setAuthorizers([]);
    setCandidates([]);

    await Promise.all([loadRules(branchId), loadAuthorizers(branchId)]);
  };

  const handleSaveRules = async (payload) => {
    if (!selectedBranchId) {
      showToast("Selecciona una sucursal para continuar.", "warning");
      return null;
    }

    setSavingRules(true);

    try {
      const response = await updateBranchBillingSettings(
        restaurantId,
        selectedBranchId,
        payload
      );

      const saved = normalizeSetting(response, selectedBranchId);
      setBillingSetting(saved);

      showToast(
        response?.message || "Configuración de cuentas actualizada correctamente.",
        "success"
      );

      return saved;
    } catch (error) {
      showAlert({
        severity: "error",
        title: "Error",
        message: extractErrorMessage(
          error,
          "No se pudo actualizar la configuración de cuentas."
        ),
      });

      return null;
    } finally {
      setSavingRules(false);
    }
  };

  const handleCreateAuthorizer = async (payload) => {
    if (!selectedBranchId) {
      showToast("Selecciona una sucursal para continuar.", "warning");
      return null;
    }

    setSavingAuthorizerId("create");

    try {
      const response = await createBranchOperationalAuthorizer(
        restaurantId,
        selectedBranchId,
        payload
      );

      const saved = response?.data || null;

      if (saved?.id) {
        setAuthorizers((prev) => sortAuthorizers([...prev, saved]));
        setCandidates((prev) =>
          prev.map((candidate) =>
            Number(candidate.user_id) === Number(saved.user_id)
              ? { ...candidate, already_authorizer: true }
              : candidate
          )
        );
      }

      showToast(
        response?.message || "Autorizador operativo creado correctamente.",
        "success"
      );

      return saved;
    } catch (error) {
      showAlert({
        severity: "error",
        title: "Error",
        message: extractErrorMessage(
          error,
          "No se pudo crear el autorizador operativo."
        ),
      });

      return null;
    } finally {
      setSavingAuthorizerId(null);
    }
  };

  const handleUpdateAuthorizer = async (authorizerId, payload) => {
    if (!selectedBranchId || !authorizerId) {
      showToast("Selecciona un autorizador para continuar.", "warning");
      return null;
    }

    setSavingAuthorizerId(authorizerId);

    try {
      const response = await updateBranchOperationalAuthorizer(
        restaurantId,
        selectedBranchId,
        authorizerId,
        payload
      );

      const saved = response?.data || null;

      if (saved?.id) {
        setAuthorizers((prev) =>
          sortAuthorizers(
            prev.map((row) => Number(row.id) === Number(saved.id) ? saved : row)
          )
        );
      }

      showToast(
        response?.message || "Autorizador operativo actualizado correctamente.",
        "success"
      );

      return saved;
    } catch (error) {
      showAlert({
        severity: "error",
        title: "Error",
        message: extractErrorMessage(
          error,
          "No se pudo actualizar el autorizador operativo."
        ),
      });

      return null;
    } finally {
      setSavingAuthorizerId(null);
    }
  };

  const handleDeleteAuthorizer = async (authorizer) => {
    if (!selectedBranchId || !authorizer?.id) {
      showToast("Selecciona un autorizador para continuar.", "warning");
      return false;
    }

    setDeletingAuthorizerId(authorizer.id);

    try {
      const response = await deleteBranchOperationalAuthorizer(
        restaurantId,
        selectedBranchId,
        authorizer.id
      );

      setAuthorizers((prev) =>
        prev.filter((row) => Number(row.id) !== Number(authorizer.id))
      );

      setCandidates((prev) =>
        prev.map((candidate) =>
          Number(candidate.user_id) === Number(authorizer.user_id)
            ? { ...candidate, already_authorizer: false }
            : candidate
        )
      );

      showToast(
        response?.message || "Autorizador operativo eliminado correctamente.",
        "success"
      );

      return true;
    } catch (error) {
      showAlert({
        severity: "error",
        title: "Error",
        message: extractErrorMessage(
          error,
          "No se pudo eliminar el autorizador operativo."
        ),
      });

      return false;
    } finally {
      setDeletingAuthorizerId(null);
    }
  };

  const handleToggleAuthorizerStatus = async (authorizer) => {
    if (!authorizer?.id) return null;

    return handleUpdateAuthorizer(authorizer.id, {
      is_active: !authorizer.is_active,
    });
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="primary" />

            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Cargando configuración operativa de cuentas…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <BillingSettingsHeader selectedBranch={selectedBranch} />
        <BillingSettingsInstructionsCard />

        <BillingSettingsBranchSelectorCard
          branches={branches}
          branchId={selectedBranchId}
          selectedBranch={selectedBranch}
          onChangeBranch={handleBranchChange}
        />

        <BillingSettingsTabs value={activeTab} onChange={setActiveTab} />

        {activeTab === "rules" ? (
          <BillingRulesTab
            selectedBranch={selectedBranch}
            setting={billingSetting}
            loading={loadingRules}
            saving={savingRules}
            onSave={handleSaveRules}
            showToast={showToast}
          />
        ) : (
          <OperationalAuthorizersTab
            selectedBranch={selectedBranch}
            authorizers={authorizers}
            candidates={candidates}
            loading={loadingAuthorizers}
            savingAuthorizerId={savingAuthorizerId}
            deletingAuthorizerId={deletingAuthorizerId}
            onCreate={handleCreateAuthorizer}
            onUpdate={handleUpdateAuthorizer}
            onDelete={handleDeleteAuthorizer}
            onToggleStatus={handleToggleAuthorizerStatus}
            showToast={showToast}
          />
        )}
      </Stack>

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