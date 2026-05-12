import { useCallback, useEffect, useMemo, useState } from "react";
import { getPlanAccess } from "../../services/plan/planAccess.service";

export default function usePlanAccess(restaurantId) {
  const [loading, setLoading] = useState(Boolean(restaurantId));
  const [error, setError] = useState("");
  const [access, setAccess] = useState(null);

  const loadPlanAccess = useCallback(async () => {
    if (!restaurantId) {
      setAccess(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getPlanAccess(restaurantId);
      setAccess(data);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "No se pudieron cargar los permisos del plan"
      );
      setAccess(null);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadPlanAccess();
  }, [loadPlanAccess]);

  const plan = access?.plan ?? null;
  const features = access?.features ?? {};

  const canUseAdditionalSalesChannels = useMemo(() => {
    return Boolean(features?.additional_sales_channels);
  }, [features]);

  return {
    loading,
    error,
    access,
    plan,
    features,
    canUseAdditionalSalesChannels,
    reload: loadPlanAccess,
  };
}