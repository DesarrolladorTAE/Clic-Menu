import { useEffect, useMemo } from "react";
import {
  Box, Chip, FormControlLabel, Stack, Switch, TextField, Typography,
} from "@mui/material";

const EMPTY_RULES = {
  required_override: null,
  min_selections_override: null,
  max_selections_override: null,
};

const toIntegerOrNull = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

const hasCustomRules = (value) => {
  return (
    value?.required_override !== null &&
      value?.required_override !== undefined ||
    value?.min_selections_override !== null &&
      value?.min_selections_override !== undefined ||
    value?.max_selections_override !== null &&
      value?.max_selections_override !== undefined
  );
};

export default function ModifierAssignmentRulesFields({
  group,
  value = EMPTY_RULES,
  onChange,
  disabled = false,
  onValidityChange,
}) {
  const isSingle = String(group?.selection_mode ?? "multiple") === "single";
  const customized = hasCustomRules(value);

  const groupRequired = Boolean(group?.is_required);
  const groupMin = Number.isInteger(Number(group?.min_select))
    ? Number(group.min_select)
    : groupRequired
      ? 1
      : 0;

  const groupMax = isSingle
    ? 1
    : toIntegerOrNull(group?.max_select);

  const effectiveRequired =
    value?.required_override !== null &&
    value?.required_override !== undefined
      ? Boolean(value.required_override)
      : groupRequired;

  const effectiveMin =
    value?.min_selections_override !== null &&
    value?.min_selections_override !== undefined
      ? Number(value.min_selections_override)
      : groupMin;

  const effectiveMax =
    value?.max_selections_override !== null &&
    value?.max_selections_override !== undefined
      ? Number(value.max_selections_override)
      : groupMax;

  const validation = useMemo(() => {
    if (!customized) {
      return { valid: true, min: "", max: "" };
    }

    const min = Number(effectiveMin);
    const max = effectiveMax === null ? null : Number(effectiveMax);

    if (!Number.isInteger(min) || min < 0) {
      return {
        valid: false,
        min: "El mínimo debe ser un número entero igual o mayor que 0.",
        max: "",
      };
    }

    if (effectiveRequired && min < 1) {
      return {
        valid: false,
        min: "Un grupo obligatorio debe tener mínimo 1.",
        max: "",
      };
    }

    if (!effectiveRequired && min !== 0) {
      return {
        valid: false,
        min: "Un grupo opcional debe tener mínimo 0.",
        max: "",
      };
    }

    if (max !== null && (!Number.isInteger(max) || max < 1)) {
      return {
        valid: false,
        min: "",
        max: "El máximo debe ser un número entero igual o mayor que 1.",
      };
    }

    if (max !== null && min > max) {
      return {
        valid: false,
        min: "",
        max: "El máximo no puede ser menor que el mínimo.",
      };
    }

    if (isSingle && max !== 1) {
      return {
        valid: false,
        min: "",
        max: "En grupos de una sola opción, el máximo debe ser 1.",
      };
    }

    return { valid: true, min: "", max: "" };
  }, [
    customized,
    effectiveRequired,
    effectiveMin,
    effectiveMax,
    isSingle,
  ]);

  useEffect(() => {
    if (typeof onValidityChange === "function") {
      onValidityChange(validation.valid);
    }
  }, [onValidityChange, validation.valid]);

  const updateValue = (next) => {
    if (typeof onChange === "function") {
      onChange({
        required_override:
          next.required_override !== undefined
            ? next.required_override
            : value?.required_override ?? null,
        min_selections_override:
          next.min_selections_override !== undefined
            ? next.min_selections_override
            : value?.min_selections_override ?? null,
        max_selections_override:
          next.max_selections_override !== undefined
            ? next.max_selections_override
            : value?.max_selections_override ?? null,
      });
    }
  };

  const handleCustomizedChange = (event) => {
    const checked = event.target.checked;

    if (!checked) {
      onChange?.({ ...EMPTY_RULES });
      return;
    }

    onChange?.({
      required_override: groupRequired,
      min_selections_override: isSingle
        ? groupRequired
          ? 1
          : 0
        : groupMin,
      max_selections_override: isSingle ? 1 : groupMax,
    });
  };

  const handleRequiredChange = (event) => {
    const required = event.target.checked;

    updateValue({
      required_override: required,
      min_selections_override: required
        ? Math.max(1, Number(effectiveMin) || 1)
        : 0,
      ...(isSingle ? { max_selections_override: 1 } : {}),
    });
  };

  const handleMinChange = (event) => {
    if (!effectiveRequired) {
      return;
    }

    const rawValue = event.target.value;

    if (!/^\d*$/.test(rawValue)) {
      return;
    }

    const valueAsNumber = toIntegerOrNull(rawValue);

    updateValue({
      min_selections_override:
        valueAsNumber === null ? 1 : Math.max(1, valueAsNumber),
    });
  };

  const handleMaxChange = (event) => {
    if (isSingle) {
      return;
    }

    const rawValue = event.target.value;

    if (!/^\d*$/.test(rawValue)) {
      return;
    }

    updateValue({
      max_selections_override: toIntegerOrNull(rawValue),
    });
  };

  return (
    <Box
      sx={{
        width: "100%",
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        p: { xs: 2, sm: 2.5 },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Reglas de selección
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
            Decide si esta asignación conserva las reglas del grupo o utiliza una configuración propia.
          </Typography>
        </Box>

        <FormControlLabel
          sx={{ m: 0, flexShrink: 0 }}
          control={
            <Switch
              checked={customized}
              onChange={handleCustomizedChange}
              disabled={disabled || !group}
            />
          }
          label="Personalizar reglas"
        />
      </Stack>

      {!customized && (
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          sx={{ mt: 2 }}
        >
          <Chip
            size="small"
            label={groupRequired ? "Obligatorio" : "Opcional"}
            variant="outlined"
          />

          <Chip
            size="small"
            label={`Mínimo: ${groupMin}`}
            variant="outlined"
          />

          <Chip
            size="small"
            label={`Máximo: ${groupMax === null ? "Sin límite" : groupMax}`}
            variant="outlined"
          />

          <Chip
            size="small"
            label={isSingle ? "Una sola opción" : "Varias opciones"}
            variant="outlined"
          />
        </Stack>
      )}

      {customized && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "minmax(0, 1fr) minmax(0, 1fr)",
            },
            gap: 2,
            mt: 2.5,
          }}
        >
          <Box
            sx={{
              gridColumn: { xs: "1", sm: "1 / -1" },
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              px: 2,
              py: 1.25,
            }}
          >
            <FormControlLabel
              sx={{ m: 0 }}
              control={
                <Switch
                  checked={effectiveRequired}
                  onChange={handleRequiredChange}
                  disabled={disabled}
                />
              }
              label={effectiveRequired ? "Selección obligatoria" : "Selección opcional"}
            />
          </Box>

          <FieldBlock
            label="Mínimo de selecciones"
            help={
              validation.min ||
              (isSingle
                ? "Se ajusta automáticamente según sea obligatorio u opcional."
                : !effectiveRequired
                  ? "Un grupo opcional utiliza mínimo 0."
                  : "Cantidad mínima que debe seleccionar el cliente.")
            }
            error={Boolean(validation.min)}
            input={
              <TextField
                fullWidth
                type="text"
                value={isSingle ? (effectiveRequired ? 1 : 0) : effectiveMin}
                onChange={handleMinChange}
                disabled={disabled || isSingle || !effectiveRequired}
                error={Boolean(validation.min)}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
              />
            }
          />

          <FieldBlock
            label="Máximo de selecciones"
            help={
              validation.max ||
              (isSingle
                ? "En grupos de una sola opción, el máximo siempre es 1."
                : "Déjalo vacío para no establecer un máximo.")
            }
            error={Boolean(validation.max)}
            input={
              <TextField
                fullWidth
                type="text"
                value={isSingle ? 1 : effectiveMax ?? ""}
                onChange={handleMaxChange}
                disabled={disabled || isSingle}
                error={Boolean(validation.max)}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
              />
            }
          />
        </Box>
      )}
    </Box>
  );
}

function FieldBlock({ label, input, help, error = false }) {
  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 800,
          color: error ? "error.main" : "text.primary",
          mb: 1,
        }}
      >
        {label}
      </Typography>

      {input}

      {help ? (
        <Typography
          sx={{
            mt: 0.75,
            fontSize: 12,
            color: error ? "error.main" : "text.secondary",
            lineHeight: 1.45,
          }}
        >
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}