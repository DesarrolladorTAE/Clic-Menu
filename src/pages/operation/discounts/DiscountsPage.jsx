import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";

import DiscountsHeader from "../../../components/operation/discounts/DiscountsHeader";
import DiscountsInstructionsCard from "../../../components/operation/discounts/DiscountsInstructionsCard";
import DiscountsBranchSelectorCard from "../../../components/operation/discounts/DiscountsBranchSelectorCard";
import DiscountsTabs from "../../../components/operation/discounts/DiscountsTabs";

import DiscountPolicyTab from "../../../components/operation/discounts/policy/DiscountPolicyTab";
import DiscountAuthorizersTab from "../../../components/operation/discounts/authorizers/DiscountAuthorizersTab";

import { getBranchesByRestaurant } from "../../../services/restaurant/branch.service";
import {
  getBranchDiscountPolicy,
  upsertBranchDiscountPolicy,
  deleteBranchDiscountPolicy,
} from "../../../services/operation/discounts/discountPolicy.service";

import {
  getBranchDiscountAuthorizers,
  getBranchDiscountAuthorizerCandidates,
  createBranchDiscountAuthorizer,
  updateBranchDiscountAuthorizer,
  deleteBranchDiscountAuthorizer,
} from "../../../services/operation/discounts/discountAuthorizers.service";

function normalizeRows(response) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
}

function buildEmptyPolicyPayload(branchId = null) {
  return {
    ok: true,
    message:
      "Esta sucursal no tiene política de descuentos. Caja trabaja sin límites ni autorización.",
    mode: "legacy_unrestricted",
    rules_apply: false,
    data: null,
    branch_id: branchId ? Number(branchId) : null,
  };
}

function sortAuthorizers(rows) {
  return [...rows].sort((a, b) => {
    const activeDiff = Number(!!b?.is_active) - Number(!!a?.is_active);
    if (activeDiff !== 0) return activeDiff;

    const aName = a?.user?.name || "";
    const bName = b?.user?.name || "";

    return aName.localeCompare(bName, "es", {
      sensitivity: "base",
    });
  });
}

export default function DiscountsPage() {
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [loadingPolicy, setLoadingPolicy] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [deletingPolicy, setDeletingPolicy] = useState(false);

  const [loadingAuthorizers, setLoadingAuthorizers] = useState(false);
  const [savingAuthorizerId, setSavingAuthorizerId] = useState(null);
  const [deletingAuthorizerId, setDeletingAuthorizerId] = useState(null);

  const [activeTab, setActiveTab] = useState("policy");
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [policyPayload, setPolicyPayload] = useState(null);

  const [authorizers, setAuthorizers] = useState([]);
  const [candidates, setCandidates] = useState([]);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const selectedBranch = useMemo(() => {
    return (
      branches.find((branch) => Number(branch.id) === Number(selectedBranchId)) ||
      null
    );
  }, [branches, selectedBranchId]);

  const showAlert = ({
    severity = "error",
    title = "Error",
    message = "",
  }) => {
    setAlertState({
      open: true,
      severity,
      title,
      message,
    });
  };

  const showToast = (message, type = "info") => {
    showAlert({
      severity:
        type === "success"
          ? "success"
          : type === "warning"
            ? "warning"
            : type === "info"
              ? "info"
              : "error",
      title:
        type === "success"
          ? "Hecho"
          : type === "warning"
            ? "Nota"
            : type === "info"
              ? "Aviso"
              : "Error",
      message,
    });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const extractErrorMessage = (e, fallback) => {
    const errors = e?.response?.data?.errors;
    const firstError =
      errors && typeof errors === "object"
        ? Object.values(errors)?.flat()?.[0]
        : null;

    return (
      firstError ||
      e?.response?.data?.message ||
      e?.message ||
      fallback
    );
  };

  const loadPolicy = async (branchId, { silent = false } = {}) => {
    if (!restaurantId || !branchId) {
      setPolicyPayload(buildEmptyPolicyPayload(branchId));
      return null;
    }

    if (!silent) {
      setLoadingPolicy(true);
    }

    try {
      const response = await getBranchDiscountPolicy(restaurantId, branchId);
      const nextPayload = response || buildEmptyPolicyPayload(branchId);

      setPolicyPayload({
        ...nextPayload,
        branch_id: Number(branchId),
      });

      return nextPayload;
    } catch (e) {
      const fallback = buildEmptyPolicyPayload(branchId);
      setPolicyPayload(fallback);

      showAlert({
        severity: "error",
        title: "Error",
        message: extractErrorMessage(
          e,
          "No se pudo cargar la política de descuentos."
        ),
      });

      return fallback;
    } finally {
      if (!silent) {
        setLoadingPolicy(false);
      }
    }
  };

  const loadAuthorizers = async (branchId, { silent = false } = {}) => {
    if (!restaurantId || !branchId) {
      setAuthorizers([]);
      setCandidates([]);
      return null;
    }

    if (!silent) {
      setLoadingAuthorizers(true);
    }

    try {
      const [authorizersResponse, candidatesResponse] = await Promise.all([
        getBranchDiscountAuthorizers(restaurantId, branchId),
        getBranchDiscountAuthorizerCandidates(restaurantId, branchId),
      ]);

      const authorizerRows = normalizeRows(authorizersResponse);
      const candidateRows = normalizeRows(candidatesResponse);

      setAuthorizers(sortAuthorizers(authorizerRows));
      setCandidates(candidateRows);

      return {
        authorizers: authorizerRows,
        candidates: candidateRows,
      };
    } catch (e) {
      setAuthorizers([]);
      setCandidates([]);

      showAlert({
        severity: "error",
        title: "Error",
        message: extractErrorMessage(
          e,
          "No se pudieron cargar los autorizadores de descuentos."
        ),
      });

      return null;
    } finally {
      if (!silent) {
        setLoadingAuthorizers(false);
      }
    }
  };

  const loadInitialData = async () => {
    setLoading(true);

    try {
      const branchResponse = await getBranchesByRestaurant(restaurantId);
      const branchRows = normalizeRows(branchResponse);

      setBranches(branchRows);

      const firstBranchId = branchRows?.[0]?.id ? String(branchRows[0].id) : "";

      setSelectedBranchId(firstBranchId);

      if (firstBranchId) {
        const [
          policyResponse,
          authorizersResponse,
          candidatesResponse,
        ] = await Promise.all([
          getBranchDiscountPolicy(restaurantId, firstBranchId),
          getBranchDiscountAuthorizers(restaurantId, firstBranchId),
          getBranchDiscountAuthorizerCandidates(restaurantId, firstBranchId),
        ]);

        setPolicyPayload({
          ...(policyResponse || buildEmptyPolicyPayload(firstBranchId)),
          branch_id: Number(firstBranchId),
        });

        setAuthorizers(sortAuthorizers(normalizeRows(authorizersResponse)));
        setCandidates(normalizeRows(candidatesResponse));
      } else {
        setPolicyPayload(buildEmptyPolicyPayload(null));
        setAuthorizers([]);
        setCandidates([]);
      }
    } catch (e) {
      setBranches([]);
      setSelectedBranchId("");
      setPolicyPayload(buildEmptyPolicyPayload(null));
      setAuthorizers([]);
      setCandidates([]);

      showAlert({
        severity: "error",
        title: "Error",
        message: extractErrorMessage(
          e,
          "No se pudo cargar la configuración de descuentos."
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

    await Promise.all([
      loadPolicy(branchId),
      loadAuthorizers(branchId),
    ]);
  };

  const handleSavePolicy = async (payload) => {
    if (!selectedBranchId) {
      showToast("Selecciona una sucursal para continuar.", "warning");
      return null;
    }

    setSavingPolicy(true);

    try {
      const response = await upsertBranchDiscountPolicy(
        restaurantId,
        selectedBranchId,
        payload
      );

      setPolicyPayload({
        ...(response || buildEmptyPolicyPayload(selectedBranchId)),
        branch_id: Number(selectedBranchId),
      });

      showToast(
        response?.message || "Política de descuentos guardada correctamente.",
        "success"
      );

      return response;
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: extractErrorMessage(
          e,
          "No se pudo guardar la política de descuentos."
        ),
      });

      return null;
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleDeletePolicy = async () => {
    if (!selectedBranchId) {
      showToast("Selecciona una sucursal para continuar.", "warning");
      return;
    }

    const ok = window.confirm(
      "¿Eliminar la política de descuentos de esta sucursal? Caja volverá a trabajar sin límites ni autorización."
    );

    if (!ok) return;

    setDeletingPolicy(true);

    try {
      const response = await deleteBranchDiscountPolicy(
        restaurantId,
        selectedBranchId
      );

      setPolicyPayload({
        ...(response || buildEmptyPolicyPayload(selectedBranchId)),
        branch_id: Number(selectedBranchId),
      });

      showToast(
        response?.message || "Política de descuentos eliminada correctamente.",
        "success"
      );
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: extractErrorMessage(
          e,
          "No se pudo eliminar la política de descuentos."
        ),
      });
    } finally {
      setDeletingPolicy(false);
    }
  };

  const handleCreateAuthorizer = async (payload) => {
    if (!selectedBranchId) {
      showToast("Selecciona una sucursal para continuar.", "warning");
      return null;
    }

    setSavingAuthorizerId("create");

    try {
      const response = await createBranchDiscountAuthorizer(
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
        response?.message || "Autorizador de descuentos creado correctamente.",
        "success"
      );

      return saved;
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: extractErrorMessage(
          e,
          "No se pudo crear el autorizador de descuentos."
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
      const response = await updateBranchDiscountAuthorizer(
        restaurantId,
        selectedBranchId,
        authorizerId,
        payload
      );

      const saved = response?.data || null;

      if (saved?.id) {
        setAuthorizers((prev) =>
          sortAuthorizers(
            prev.map((row) =>
              Number(row.id) === Number(saved.id) ? saved : row
            )
          )
        );
      }

      showToast(
        response?.message || "Autorizador de descuentos actualizado correctamente.",
        "success"
      );

      return saved;
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: extractErrorMessage(
          e,
          "No se pudo actualizar el autorizador de descuentos."
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
      return;
    }

    const ok = window.confirm(
      "¿Eliminar este autorizador de descuentos? Este usuario ya no podrá aprobar descuentos excedidos en esta sucursal."
    );

    if (!ok) return;

    setDeletingAuthorizerId(authorizer.id);

    try {
      const response = await deleteBranchDiscountAuthorizer(
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
        response?.message || "Autorizador de descuentos eliminado correctamente.",
        "success"
      );
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: extractErrorMessage(
          e,
          "No se pudo eliminar el autorizador de descuentos."
        ),
      });
    } finally {
      setDeletingAuthorizerId(null);
    }
  };

  const handleToggleAuthorizerStatus = async (authorizer) => {
    if (!authorizer?.id) return;

    await handleUpdateAuthorizer(authorizer.id, {
      can_authorize_exceeded_discount:
        !!authorizer.can_authorize_exceeded_discount,
      can_self_authorize: !!authorizer.can_self_authorize,
      is_active: !authorizer.is_active,
    });
  };

  if (loading) {
    return (
      <PageContainer>
        <Box
          sx={{
            minHeight: "60vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="primary" />

            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Cargando configuración de descuentos…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <DiscountsHeader selectedBranch={selectedBranch} />

        <DiscountsInstructionsCard />

        <DiscountsBranchSelectorCard
          branches={branches}
          branchId={selectedBranchId}
          onChangeBranch={handleBranchChange}
          selectedBranch={selectedBranch}
        />

        <DiscountsTabs value={activeTab} onChange={setActiveTab} />

        {activeTab === "policy" ? (
          <DiscountPolicyTab
            selectedBranch={selectedBranch}
            payload={policyPayload}
            loading={loadingPolicy}
            saving={savingPolicy}
            deleting={deletingPolicy}
            onSave={handleSavePolicy}
            onDelete={handleDeletePolicy}
            showToast={showToast}
          />
        ) : (
          <DiscountAuthorizersTab
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
