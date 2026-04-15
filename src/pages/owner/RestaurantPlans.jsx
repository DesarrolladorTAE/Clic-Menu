import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import PageContainer from "../../components/common/PageContainer";
import AppAlert from "../../components/common/AppAlert";

import PlansHeader from "../../components/owner/PlansHeader";
import PlansStateCard from "../../components/owner/PlansStateCard";
import PlansNoticeCard from "../../components/owner/PlansNoticeCard";
import PlansCarouselControls from "../../components/owner/PlansCarouselControls";
import PlanCard from "../../components/owner/PlanCard";

import { getPlans } from "../../services/owner/plan.service";
import {
  getRestaurantSubscriptionStatus,
  subscribeRestaurant,
} from "../../services/restaurant/restaurant.service";

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export default function RestaurantPlans() {
  const nav = useNavigate();
  const { restaurantId } = useParams();
  const location = useLocation();

  const [plans, setPlans] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyPlanId, setBusyPlanId] = useState(null);
  const [visibleGroupIndex, setVisibleGroupIndex] = useState(0);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

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

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const notice = location?.state?.notice || "";
  const noticeCode = location?.state?.code || null;
  const noticeMeta = location?.state?.meta || null;

  const isOperational = status?.is_operational === true;
  const currentPlanSlug = status?.subscription?.plan?.slug || null;
  const currentEndsAt = status?.subscription?.ends_at || null;

  const canChangeNow = useMemo(() => {
    if (!status?.subscription?.plan?.slug) return true;
    return status.subscription.plan.slug === "demo";
  }, [status]);

  const load = async () => {
    setLoading(true);
    try {
      const [plansRes, stRes] = await Promise.all([
        getPlans(),
        getRestaurantSubscriptionStatus(restaurantId),
      ]);

      const safePlans = Array.isArray(plansRes) ? plansRes : [];
      setPlans(safePlans);
      setStatus(stRes || null);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message || "No se pudieron cargar los planes",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [restaurantId]);

  useEffect(() => {
    if (notice) {
      nav(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const planGroups = useMemo(() => {
    return chunkArray(plans, 3);
  }, [plans]);

  const visiblePlans = useMemo(() => {
    return planGroups[visibleGroupIndex] || [];
  }, [planGroups, visibleGroupIndex]);

  useEffect(() => {
    if (visibleGroupIndex > Math.max(planGroups.length - 1, 0)) {
      setVisibleGroupIndex(0);
    }
  }, [planGroups, visibleGroupIndex]);

  const handlePrevGroup = () => {
    setVisibleGroupIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNextGroup = () => {
    setVisibleGroupIndex((prev) =>
      Math.min(prev + 1, Math.max(planGroups.length - 1, 0))
    );
  };

  const onSubscribe = async (planId) => {
    setBusyPlanId(planId);

    try {
      await subscribeRestaurant(restaurantId, {
        plan_id: planId,
        provider: "manual",
        months_paid: 1,
        months_granted: 1,
      });

      await load();

      const newStatus = await getRestaurantSubscriptionStatus(restaurantId);
      if (newStatus?.is_operational) {
        nav("/owner/restaurants", { replace: true });
      }
    } catch (e) {
      const code = e?.response?.data?.code;
      const msg =
        e?.response?.data?.message ||
        (code === "PLAN_CHANGE_NOT_ALLOWED_UNTIL_EXPIRES"
          ? "No puedes cambiar de plan hasta que termine tu suscripción actual."
          : "No se pudo contratar el plan.");

      showAlert({
        severity: "error",
        title: "Error",
        message: msg,
      });
    } finally {
      setBusyPlanId(null);
    }
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
              Cargando planes…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <PlansHeader
          restaurantId={restaurantId}
          totalPlans={plans.length}
          onBack={() => nav("/owner/restaurants-home")}
        />

        {notice ? (
          <PlansNoticeCard
            title="Atención"
            message={notice}
            variant="warning"
            noticeCode={noticeCode}
            noticeMeta={noticeMeta}
          />
        ) : null}

        <PlansStateCard
          isOperational={isOperational}
          currentPlanSlug={currentPlanSlug}
          currentEndsAt={currentEndsAt}
          canChangeNow={canChangeNow}
        />

        
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
            alignItems: "stretch",
          }}
        >
          {visiblePlans.map((p) => {
            const isCurrent = p.slug === currentPlanSlug;
            const isDisabled =
              busyPlanId !== null ||
              isCurrent ||
              (!canChangeNow && currentPlanSlug && currentPlanSlug !== "demo");

            return (
              <PlanCard
                key={p.id}
                plan={p}
                isCurrent={isCurrent}
                isDisabled={isDisabled}
                busy={busyPlanId === p.id}
                onSubscribe={onSubscribe}
              />
            );
          })}
        </Box>

        {visiblePlans.length === 0 ? (
          <Box
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              No hay planes disponibles
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: 14,
                color: "text.secondary",
              }}
            >
              No se encontraron planes para mostrar en este momento.
            </Typography>
          </Box>
        ) : null}

        <PlansCarouselControls
          currentGroup={visibleGroupIndex + 1}
          totalGroups={Math.max(planGroups.length, 1)}
          hasPrev={visibleGroupIndex > 0}
          hasNext={visibleGroupIndex < planGroups.length - 1}
          onPrev={handlePrevGroup}
          onNext={handleNextGroup}
        />
        
      </Stack>

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={4000}
      />
    </PageContainer>
  );
}