import { useEffect, useMemo, useState } from "react";
import { CircularProgress, Paper, Stack, Typography } from "@mui/material";

import BillingRulesContextCard from "./BillingRulesContextCard";
import BillingRulesFormCard from "./BillingRulesFormCard";

const MIN_MAX_CHECKS_PER_GROUP = 2;
const MAX_MAX_CHECKS_PER_GROUP = 20;

export default function BillingRulesTab({
  selectedBranch,
  setting,
  loading = false,
  saving = false,
  onSave,
  showToast,
}) {
  const [form, setForm] = useState({
    max_checks_per_group: String(MIN_MAX_CHECKS_PER_GROUP),
  });

  const canSave = useMemo(() => {
    const value = Number(form.max_checks_per_group);

    return (
      !!selectedBranch?.id &&
      Number.isInteger(value) &&
      value >= MIN_MAX_CHECKS_PER_GROUP &&
      value <= MAX_MAX_CHECKS_PER_GROUP
    );
  }, [selectedBranch, form.max_checks_per_group]);

  useEffect(() => {
    setForm({
      max_checks_per_group: String(
        setting?.max_checks_per_group ?? MIN_MAX_CHECKS_PER_GROUP
      ),
    });
  }, [setting, selectedBranch?.id]);

  const handleChange = (value) => {
    const normalized = String(value || "").replace(/\D/g, "").slice(0, 2);
    setForm({ max_checks_per_group: normalized });
  };

  const validateAndSave = async () => {
    const value = Number(form.max_checks_per_group);

    if (!selectedBranch?.id) {
      showToast?.("Selecciona una sucursal para continuar.", "warning");
      return;
    }

    if (!Number.isInteger(value)) {
      showToast?.(
        "El límite máximo de cuentas o partes debe ser un número entero.",
        "warning"
      );
      return;
    }

    if (value < MIN_MAX_CHECKS_PER_GROUP) {
      showToast?.(
        "El límite máximo de cuentas o partes debe ser al menos 2.",
        "warning"
      );
      return;
    }

    if (value > MAX_MAX_CHECKS_PER_GROUP) {
      showToast?.(
        "El límite máximo de cuentas o partes no puede ser mayor a 20.",
        "warning"
      );
      return;
    }

    await onSave?.({ max_checks_per_group: value });
  };

  if (!selectedBranch?.id) {
    return (
      <EmptyState
        title="No hay sucursal seleccionada"
        message="Selecciona una sucursal para configurar sus reglas de cuentas."
      />
    );
  }

  if (loading) {
    return (
      <Paper sx={loadingCardSx}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="primary" />

          <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
            Cargando reglas de cuentas…
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      <BillingRulesContextCard
        selectedBranch={selectedBranch}
        setting={setting}
      />

      <BillingRulesFormCard
        value={form.max_checks_per_group}
        canSave={canSave}
        saving={saving}
        onChange={handleChange}
        onSave={validateAndSave}
      />
    </Stack>
  );
}

function EmptyState({ title, message }) {
  return (
    <Paper sx={emptyCardSx}>
      <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
        {title}
      </Typography>

      <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 14 }}>
        {message}
      </Typography>
    </Paper>
  );
}

const loadingCardSx = {
  p: 4,
  borderRadius: 1,
  backgroundColor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
};

const emptyCardSx = {
  p: { xs: 2.5, sm: 3 },
  borderRadius: 1,
  backgroundColor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
  textAlign: "center",
};
