import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";

import SubscriptionHistoryHeader from "../../../components/owner/subscription-history/SubscriptionHistoryHeader";
import SubscriptionHistorySummary from "../../../components/owner/subscription-history/SubscriptionHistorySummary";
import SubscriptionHistoryFilters from "../../../components/owner/subscription-history/SubscriptionHistoryFilters";
import SubscriptionHistoryList from "../../../components/owner/subscription-history/SubscriptionHistoryList";

import { getRestaurantSubscriptions } from "../../../services/restaurant/restaurant.service";

function isActiveSubscription(subscription) {
  const classification = subscription?.classification || {};

  return (
    classification.is_currently_active === true ||
    classification.is_future_renewal === true
  );
}

export default function RestaurantSubscriptionHistoryPage() {
  const nav = useNavigate();
  const { restaurantId } = useParams();

  const hasLoadedRef = useRef(false);

  const [loading, setLoading] = useState(true);

  const [restaurant, setRestaurant] = useState(null);
  const [summary, setSummary] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);

  const [filters, setFilters] = useState({
    period: "all",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const [activeOnly, setActiveOnly] = useState(false);

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

  const requestFilters = useMemo(() => {
    const next = {
      period: filters.period,
    };

    if (filters.period === "year" || filters.period === "month") {
      next.year = filters.year;
    }

    if (filters.period === "month") {
      next.month = filters.month;
    }

    return next;
  }, [filters]);

  const visibleSubscriptions = useMemo(() => {
    const safeSubscriptions = Array.isArray(subscriptions)
      ? subscriptions
      : [];

    if (!activeOnly) return safeSubscriptions;

    return safeSubscriptions.filter((item) => isActiveSubscription(item));
  }, [subscriptions, activeOnly]);

  const loadSubscriptions = useCallback(
    async ({ silent = false } = {}) => {
      const shouldShowInitialLoading = !hasLoadedRef.current && !silent;

      if (shouldShowInitialLoading) {
        setLoading(true);
      }

      try {
        const res = await getRestaurantSubscriptions(
          restaurantId,
          requestFilters
        );

        setRestaurant(res?.restaurant || null);
        setSummary(res?.summary || null);
        setSubscriptions(Array.isArray(res?.data) ? res.data : []);

        hasLoadedRef.current = true;
      } catch (error) {
        if (!silent) {
          showAlert({
            severity: "error",
            title: "Error",
            message:
              error?.response?.data?.message ||
              "No se pudo cargar el historial de suscripciones.",
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [restaurantId, requestFilters]
  );

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (hasLoadedRef.current) {
        loadSubscriptions({ silent: true });
      }
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadSubscriptions]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && hasLoadedRef.current) {
        loadSubscriptions({ silent: true });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadSubscriptions]);

  const handleFiltersChange = (nextFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...nextFilters,
    }));
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

            <Typography
              sx={{
                color: "text.secondary",
                fontSize: 14,
              }}
            >
              Cargando historial de suscripciones…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <SubscriptionHistoryHeader
          restaurant={restaurant}
          restaurantId={restaurantId}
          onBack={() => nav(`/owner/restaurants/${restaurantId}/plans`)}
        />

        <SubscriptionHistorySummary summary={summary} />

        <SubscriptionHistoryFilters
          filters={filters}
          activeOnly={activeOnly}
          onChange={handleFiltersChange}
          onActiveOnlyChange={setActiveOnly}
        />

        <SubscriptionHistoryList subscriptions={visibleSubscriptions} />
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
