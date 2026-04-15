import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useLocation, useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";

import CustomerLoyaltySettingsHeader from "../../../components/operation/loyalty/CustomerLoyaltySettingsHeader";
import CustomerLoyaltySettingsInstructionsCard from "../../../components/operation/loyalty/CustomerLoyaltySettingsInstructionsCard";
import CustomerLoyaltySettingsContextCard from "../../../components/operation/loyalty/CustomerLoyaltySettingsContextCard";
import CustomerLoyaltySettingsFormCard from "../../../components/operation/loyalty/CustomerLoyaltySettingsFormCard";

import {
  getCustomerLoyaltySettings,
  updateCustomerLoyaltySettings,
} from "../../../services/operation/loyalty/customerLoyaltySettings.service";

const DEFAULT_FORM = {
  is_enabled: false,
  earn_mode: "amount_ratio",
  earn_rate_amount: 10,
  points_per_rate: 1,
  minimum_purchase_amount: 0,
  exclude_tip: true,
  exclude_tax: false,
  allow_points_on_discounted_sales: true,
  rounding_mode: "floor",
  preview_sale_total: 150,
  preview_tip: 0,
  preview_tax_total: 0,
  preview_discount_total: 0,
};

export default function CustomerLoyaltySettingsPage() {
  const { restaurantId } = useParams();
  const location = useLocation();

  const restaurantName = location.state?.restaurantName || "RESTAURANTE";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [loyaltyData, setLoyaltyData] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);

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

  const canSave = useMemo(() => {
    const earnRateAmount = Number(form.earn_rate_amount);
    const pointsPerRate = Number(form.points_per_rate);
    const minimumPurchase = Number(form.minimum_purchase_amount);

    if (!form.earn_mode) return false;
    if (!form.rounding_mode) return false;
    if (Number.isNaN(earnRateAmount) || earnRateAmount <= 0) return false;
    if (Number.isNaN(pointsPerRate) || pointsPerRate < 1) return false;
    if (Number.isNaN(minimumPurchase) || minimumPurchase < 0) return false;

    return true;
  }, [form]);

  const hydrateFormFromResponse = (responseData) => {
    setForm((prev) => ({
      ...prev,
      is_enabled: Boolean(responseData?.is_enabled),
      earn_mode: responseData?.earn_mode || "amount_ratio",
      earn_rate_amount:
        responseData?.earn_rate_amount !== null &&
        responseData?.earn_rate_amount !== undefined
          ? Number(responseData.earn_rate_amount)
          : 10,
      points_per_rate:
        responseData?.points_per_rate !== null &&
        responseData?.points_per_rate !== undefined
          ? Number(responseData.points_per_rate)
          : 1,
      minimum_purchase_amount:
        responseData?.minimum_purchase_amount !== null &&
        responseData?.minimum_purchase_amount !== undefined
          ? Number(responseData.minimum_purchase_amount)
          : 0,
      exclude_tip: Boolean(responseData?.exclude_tip),
      exclude_tax: Boolean(responseData?.exclude_tax),
      allow_points_on_discounted_sales: Boolean(
        responseData?.allow_points_on_discounted_sales
      ),
      rounding_mode: responseData?.rounding_mode || "floor",
    }));
  };

  const loadSettings = async () => {
    setLoading(true);

    try {
      const data = await getCustomerLoyaltySettings(restaurantId);
      setLoyaltyData(data);
      hydrateFormFromResponse(data);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo cargar la configuración del programa de puntos.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const handleChangeField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]:
        [
          "earn_rate_amount",
          "points_per_rate",
          "minimum_purchase_amount",
          "preview_sale_total",
          "preview_tip",
          "preview_tax_total",
          "preview_discount_total",
        ].includes(field)
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const handleSave = async () => {
    const payload = {
      is_enabled: Boolean(form.is_enabled),
      earn_mode: form.earn_mode,
      earn_rate_amount: Number(form.earn_rate_amount),
      points_per_rate: Number(form.points_per_rate),
      minimum_purchase_amount: Number(form.minimum_purchase_amount),
      exclude_tip: Boolean(form.exclude_tip),
      exclude_tax: Boolean(form.exclude_tax),
      allow_points_on_discounted_sales: Boolean(
        form.allow_points_on_discounted_sales
      ),
      rounding_mode: form.rounding_mode,
      preview_sale_total: Number(form.preview_sale_total || 0),
      preview_tip: Number(form.preview_tip || 0),
      preview_tax_total: Number(form.preview_tax_total || 0),
      preview_discount_total: Number(form.preview_discount_total || 0),
    };

    setSaving(true);

    try {
      const updated = await updateCustomerLoyaltySettings(restaurantId, payload);
      setLoyaltyData(updated);
      hydrateFormFromResponse(updated);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Configuración del programa de puntos guardada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo guardar la configuración del programa de puntos.",
      });
    } finally {
      setSaving(false);
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
              Cargando configuración del programa de puntos…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <CustomerLoyaltySettingsHeader
          restaurantName={restaurantName}
          saving={saving}
          onSave={handleSave}
          canSave={canSave}
        />

        <CustomerLoyaltySettingsInstructionsCard />

        <CustomerLoyaltySettingsContextCard
          loyaltyData={loyaltyData}
          restaurantName={restaurantName}
        />

        <CustomerLoyaltySettingsFormCard
          form={form}
          onChange={handleChangeField}
          disabled={saving}
          preview={loyaltyData?.preview}
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
