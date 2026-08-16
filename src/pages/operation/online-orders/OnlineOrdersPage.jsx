import { Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";

import OnlineOrdersHeader from "../../../components/operation/online-orders/OnlineOrdersHeader";
import OnlineOrderBranchSelector from "../../../components/operation/online-orders/OnlineOrderBranchSelector";
import OnlineOrderTabs from "../../../components/operation/online-orders/OnlineOrderTabs";
import OnlineOrderGeneralTab from "../../../components/operation/online-orders/general/OnlineOrderGeneralTab";
import OnlineOrderDeliveryTab from "../../../components/operation/online-orders/delivery/OnlineOrderDeliveryTab";
import OnlineOrderPaymentsTab from "../../../components/operation/online-orders/payments/OnlineOrderPaymentsTab";
import OnlineOrderActivationTab from "../../../components/operation/online-orders/activation/OnlineOrderActivationTab";

import { getOnlineOrderBranches } from "../../../services/operation/online-orders/onlineOrders.service";

const instructions = [
  "La configuración de Pedidos en línea se administra de manera independiente para cada sucursal.",
  "Guardar los datos de General, Entrega o Pagos no activa automáticamente el servicio.",
  "La activación final se realizará desde Preparación para activar cuando la sucursal cumpla todos los requisitos.",
];

export default function OnlineOrdersPage() {
  const { restaurantId } = useParams();
  const location = useLocation();

  const returnedBranchId = location.state?.branchId
    ? String(location.state.branchId)
    : "";

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(returnedBranchId);
  const [activeTab, setActiveTab] = useState("general");

  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingGeneral, setLoadingGeneral] = useState(false);
  const [generalSetting, setGeneralSetting] = useState(null);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const showAlert = useCallback(({
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
  }, []);

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;

    setAlertState((previous) => ({
      ...previous,
      open: false,
    }));
  };

  useEffect(() => {
    let active = true;

    const loadBranches = async () => {
      setLoadingBranches(true);

      try {
        const result = await getOnlineOrderBranches(restaurantId);
        if (!active) return;

        setBranches(result);

        setSelectedBranchId((current) => {
          const currentExists = result.some(
            (branch) => String(branch.id) === String(current)
          );

          if (currentExists) return String(current);

          const returnedExists = result.some(
            (branch) => String(branch.id) === String(returnedBranchId)
          );

          if (returnedExists) return returnedBranchId;

          return result[0]?.id ? String(result[0].id) : "";
        });
      } catch (error) {
        if (!active) return;

        setBranches([]);
        setSelectedBranchId("");

        showAlert({
          severity: "error",
          title: "Error",
          message:
            error?.response?.data?.message ||
            error?.message ||
            "No se pudieron cargar las sucursales.",
        });
      } finally {
        if (active) setLoadingBranches(false);
      }
    };

    loadBranches();

    return () => {
      active = false;
    };
  }, [restaurantId, returnedBranchId, showAlert]);

  const selectedBranch = useMemo(() => {
    return (
      branches.find(
        (branch) => String(branch.id) === String(selectedBranchId)
      ) || null
    );
  }, [branches, selectedBranchId]);

  const handleBranchChange = (branchId) => {
    setSelectedBranchId(String(branchId));
    setGeneralSetting(null);
  };

  if (loadingBranches) {
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
              Cargando Pedidos en línea…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <OnlineOrdersHeader branchName={selectedBranch?.name} />

        <Paper
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 1,
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
          }}
        >
          <Stack spacing={1.25}>
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
              Antes de comenzar
            </Typography>

            {instructions.map((instruction, index) => (
              <InstructionRow
                key={instruction}
                step={index + 1}
                text={instruction}
              />
            ))}
          </Stack>
        </Paper>

        <OnlineOrderBranchSelector
          branches={branches}
          value={selectedBranchId}
          onChange={handleBranchChange}
          disabled={loadingGeneral}
        />

        {branches.length === 0 ? (
          <Paper
            sx={{
              px: 3,
              py: 5,
              textAlign: "center",
              borderRadius: 1,
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
            }}
          >
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
              No hay sucursales disponibles
            </Typography>

            <Typography sx={{ mt: 1, fontSize: 14, color: "text.secondary", lineHeight: 1.55 }}>
              Registra una sucursal antes de configurar Pedidos en línea.
            </Typography>
          </Paper>
        ) : (
          <>
            <OnlineOrderTabs value={activeTab} onChange={setActiveTab} />

            {activeTab === "general" ? (
              <OnlineOrderGeneralTab
                restaurantId={restaurantId}
                branchId={selectedBranchId}
                branchName={selectedBranch?.name}
                setting={generalSetting}
                setSetting={setGeneralSetting}
                loading={loadingGeneral}
                setLoading={setLoadingGeneral}
                onAlert={showAlert}
              />
            ) : null}

            {activeTab === "delivery" ? (
              <OnlineOrderDeliveryTab
                key={selectedBranchId}
                restaurantId={restaurantId}
                branchId={selectedBranchId}
                branchName={selectedBranch?.name}
                onAlert={showAlert}
              />
            ) : null}

            {activeTab === "payments" ? (
              <OnlineOrderPaymentsTab
                key={selectedBranchId}
                restaurantId={restaurantId}
                branchId={selectedBranchId}
                branchName={selectedBranch?.name}
                onAlert={showAlert}
              />
            ) : null}

            {activeTab === "activation" ? (
              <OnlineOrderActivationTab
                key={selectedBranchId}
                restaurantId={restaurantId}
                branchId={selectedBranchId}
                branch={selectedBranch}
                branchName={selectedBranch?.name}
                onGoToTab={setActiveTab}
                onAlert={showAlert}
              />
            ) : null}
          </>
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

function InstructionRow({ step, text }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          minWidth: 28,
          height: 28,
          borderRadius: 999,
          bgcolor: "primary.main",
          color: "#fff",
          display: "grid",
          placeItems: "center",
          fontSize: 13,
          fontWeight: 800,
        }}
      >
        {step}
      </Box>

      <Typography sx={{ fontSize: 14, color: "text.primary", lineHeight: 1.6 }}>
        {text}
      </Typography>
    </Stack>
  );
}