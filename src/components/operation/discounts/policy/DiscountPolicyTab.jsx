import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";

import DiscountPolicyContextCard from "./DiscountPolicyContextCard";
import DiscountPolicyFormCard from "./DiscountPolicyFormCard";

const DEFAULT_FORM = {
  discount_capture_mode: "cashier",
  max_discount_percent: "10",
  max_discount_amount: "100",
  exceeded_discount_action: "authorize",
  reason_required: true,
  is_active: true,
};

export default function DiscountPolicyTab({
  selectedBranch,
  payload,
  loading = false,
  saving = false,
  deleting = false,
  onSave,
  onDelete,
  showToast,
}) {
  const [form, setForm] = useState(DEFAULT_FORM);

  const policy = payload?.data || null;
  const hasPolicy = !!policy?.id;

  const canSave = useMemo(() => {
    if (!selectedBranch?.id) return false;

    const percent = Number(form.max_discount_percent);
    const amount = Number(form.max_discount_amount);

    if (Number.isNaN(percent) || percent < 0 || percent > 100) return false;
    if (Number.isNaN(amount) || amount < 0) return false;
    if (!form.discount_capture_mode) return false;
    if (!form.exceeded_discount_action) return false;

    return true;
  }, [selectedBranch, form]);

  useEffect(() => {
    if (policy) {
      setForm({
        discount_capture_mode: policy.discount_capture_mode || "cashier",
        max_discount_percent:
          policy.max_discount_percent !== null &&
          policy.max_discount_percent !== undefined
            ? String(policy.max_discount_percent)
            : "10",
        max_discount_amount:
          policy.max_discount_amount !== null &&
          policy.max_discount_amount !== undefined
            ? String(policy.max_discount_amount)
            : "100",
        exceeded_discount_action:
          policy.exceeded_discount_action || "authorize",
        reason_required: !!policy.reason_required,
        is_active: !!policy.is_active,
      });

      return;
    }

    setForm(DEFAULT_FORM);
  }, [policy, selectedBranch?.id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateAndSave = async () => {
    if (!selectedBranch?.id) {
      showToast?.("Selecciona una sucursal para continuar.", "warning");
      return;
    }

    const percent = Number(form.max_discount_percent);
    const amount = Number(form.max_discount_amount);

    if (Number.isNaN(percent) || percent < 0 || percent > 100) {
      showToast?.(
        "El porcentaje máximo debe ser un número entre 0 y 100.",
        "warning"
      );
      return;
    }

    if (Number.isNaN(amount) || amount < 0) {
      showToast?.("El monto máximo debe ser mayor o igual a 0.", "warning");
      return;
    }

    await onSave?.({
      discount_capture_mode: form.discount_capture_mode,
      max_discount_percent: percent,
      max_discount_amount: amount,
      exceeded_discount_action: form.exceeded_discount_action,
      reason_required: !!form.reason_required,
      is_active: !!form.is_active,
    });
  };

  if (!selectedBranch?.id) {
    return (
      <Paper
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 1,
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          No hay sucursal seleccionada
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "text.secondary",
            fontSize: 14,
          }}
        >
          Selecciona una sucursal para configurar su política de descuentos.
        </Typography>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Paper
        sx={{
          p: 4,
          borderRadius: 1,
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="primary" />

          <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
            Cargando política de descuentos…
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Box>
      <Stack spacing={3}>
        <DiscountPolicyContextCard
          selectedBranch={selectedBranch}
          payload={payload}
        />

        <DiscountPolicyFormCard
          form={form}
          hasPolicy={hasPolicy}
          canSave={canSave}
          saving={saving}
          deleting={deleting}
          onChange={handleChange}
          onSave={validateAndSave}
          onDelete={onDelete}
        />
      </Stack>
    </Box>
  );
}
