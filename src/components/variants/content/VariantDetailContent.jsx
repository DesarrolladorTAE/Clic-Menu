// Muestra y administra el detalle de una variante, incluyendo estado, predeterminada, imagen, canales y corrección.

import { useEffect, useMemo, useState } from "react";

import {
  Box, Button, CircularProgress, FormControlLabel, Paper, Stack, Switch, Typography,
} from "@mui/material";

import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import {
  toggleProductVariant,
  setDefaultProductVariant,
} from "../../../services/products/variants/productVariants.service";

import PageContainer from "../../common/PageContainer";
import AppAlert from "../../common/AppAlert";

function normalizeErr(e) {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors ? Object.values(e.response.data.errors).flat().join("\n") : "") ||
    "Ocurrió un error"
  );
}

function normalizeText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function extractOptionName(variantRow, variant) {
  const attributes = Array.isArray(variantRow?.attributes) ? variantRow.attributes : [];

  if (attributes.length === 1 && Array.isArray(attributes[0]?.values) && attributes[0].values.length === 1) {
    return normalizeText(attributes[0].values[0]?.value_name);
  }

  return normalizeText(
    variant?.variant_name ||
    variant?.canonical_name ||
    variant?.stored_name ||
    variant?.name
  );
}

function buildDisplayName(productName, optionName, fallback = "") {
  const product = normalizeText(productName);
  const option = normalizeText(optionName);
  const fallbackName = normalizeText(fallback);

  if (!product) return fallbackName || option;
  if (!option) return fallbackName || product;

  const productLower = product.toLocaleLowerCase("es");
  const optionLower = option.toLocaleLowerCase("es");

  if (optionLower === productLower || optionLower.startsWith(`${productLower} `)) return option;

  return `${product} · ${option}`;
}

function imageUrl(image) {
  if (!image) return "";
  return (
    image.best_public_url ||
    image.medium_public_url ||
    image.public_url ||
    image.thumbnail_public_url ||
    ""
  );
}

function imageOrigin(image) {
  if (!image) return "Sin imagen disponible";
  if (image.source === "variant") return "Imagen propia de la variante";
  if (image.source === "product") return "Imagen del producto";
  if (image.source === "placeholder") return "Imagen predeterminada";
  return "Imagen disponible";
}

export default function VariantDetailContent({
  restaurantId,
  productId,
  productName,
  variantRow,
  effectiveImage = null,
  onOpenChannels,
  onOpenImage,
  onOpenRepair,
  onChanged,
}) {
  const sourceVariant = useMemo(
    () => variantRow?.variant || variantRow || {},
    [variantRow]
  );

  const [variant, setVariant] = useState(sourceVariant);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingDefault, setSavingDefault] = useState(false);
  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  useEffect(() => {
    setVariant(sourceVariant);
  }, [sourceVariant]);

  const showError = (title, message) => {
    setAlertState({ open: true, severity: "error", title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const optionName = useMemo(
    () => extractOptionName(variantRow, variant),
    [variantRow, variant]
  );

  const displayName = useMemo(
    () => buildDisplayName(productName, optionName, variant?.display_name || variant?.name),
    [productName, optionName, variant?.display_name, variant?.name]
  );

  const currentImage =
    effectiveImage ||
    variant?.effective_image ||
    variantRow?.effective_image ||
    sourceVariant?.effective_image ||
    null;

  const currentImageUrl = imageUrl(currentImage);
  const isInvalid = Boolean(variant?.is_invalid);
  const busy = savingStatus || savingDefault;

  const handleStatusChange = async () => {
    if (!variant?.id || savingStatus) return;

    const previous = { ...variant };
    const nextEnabled = !Boolean(variant.is_enabled);

    if (isInvalid && nextEnabled) {
      showError("No se puede activar", "Corrige primero esta variante para poder activarla.");
      return;
    }

    const optimistic = {
      ...variant,
      is_enabled: nextEnabled,
      is_default: nextEnabled ? Boolean(variant.is_default) : false,
    };

    setVariant(optimistic);
    setSavingStatus(true);

    try {
      const response = await toggleProductVariant(
        restaurantId,
        productId,
        variant.id,
        nextEnabled
      );

      const updated = { ...optimistic, ...(response?.data || {}) };
      setVariant(updated);
      onChanged?.(updated, { type: "status" });
    } catch (e) {
      setVariant(previous);
      showError("No se pudo cambiar el estado", normalizeErr(e));
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDefaultChange = async () => {
    if (!variant?.id || savingDefault) return;

    if (isInvalid) {
      showError(
        "No se puede marcar como predeterminada",
        "Corrige primero esta variante para poder usarla como predeterminada."
      );
      return;
    }

    const previous = { ...variant };
    const nextDefault = !Boolean(variant.is_default);

    const optimistic = {
      ...variant,
      is_default: nextDefault,
      is_enabled: nextDefault ? true : Boolean(variant.is_enabled),
    };

    setVariant(optimistic);
    setSavingDefault(true);

    try {
      const response = await setDefaultProductVariant(
        restaurantId,
        productId,
        variant.id,
        nextDefault
      );

      const updated = { ...optimistic, ...(response?.data || {}) };
      setVariant(updated);
      onChanged?.(updated, { type: "default" });
    } catch (e) {
      setVariant(previous);
      showError("No se pudo cambiar la opción predeterminada", normalizeErr(e));
    } finally {
      setSavingDefault(false);
    }
  };

  if (!variant?.id) {
    return (
      <PageContainer sx={{ py: 0, px: 0 }} innerSx={{ width: "100%" }}>
        <Paper sx={emptySx}>
          <Typography sx={{ fontSize: 17, fontWeight: 800 }}>No hay una variante seleccionada</Typography>
          <Typography sx={{ mt: 0.75, fontSize: 13, color: "text.secondary" }}>
            Regresa a la lista de variantes para continuar.
          </Typography>
        </Paper>
      </PageContainer>
    );
  }

  return (
    <PageContainer sx={{ py: 0, px: 0 }} innerSx={{ width: "100%" }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 22, sm: 26 },
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.25,
              wordBreak: "break-word",
            }}
          >
            {displayName}
          </Typography>

          <Typography sx={{ mt: 0.75, fontSize: 14, color: "text.secondary" }}>
            Administra la configuración de esta variante.
          </Typography>
        </Box>

        {isInvalid ? (
          <Paper
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "warning.main",
              borderRadius: 1,
              boxShadow: "none",
              backgroundColor: "background.paper",
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="flex-start">
              <WarningAmberRoundedIcon color="warning" />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                  Esta variante necesita corrección
                </Typography>
                <Typography sx={{ mt: 0.4, fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
                  {variant?.invalid_reason || "La configuración actual de la variante no es válida."}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.15fr) minmax(280px, 0.85fr)" },
            gap: 2,
            alignItems: "stretch",
          }}
        >
          <Paper sx={containerSx}>
            <Stack spacing={2.5}>
              <Box>
                <Typography sx={sectionTitleSx}>Información de la variante</Typography>
                <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
                  Consulta su opción y controla su disponibilidad.
                </Typography>
              </Box>

              <Box>
                <Typography sx={fieldLabelSx}>Opción</Typography>
                <Typography sx={{ mt: 0.5, fontSize: 17, fontWeight: 800, wordBreak: "break-word" }}>
                  {optionName || "Sin opción válida"}
                </Typography>
              </Box>

              <Box>
                <Typography sx={fieldLabelSx}>Estado</Typography>

                <FormControlLabel
                  sx={{ m: 0, mt: 0.5 }}
                  control={
                    <Switch
                      checked={Boolean(variant.is_enabled)}
                      disabled={savingStatus || savingDefault || (isInvalid && !variant.is_enabled)}
                      onChange={handleStatusChange}
                    />
                  }
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={switchLabelSx}>
                        {variant.is_enabled ? "Activa" : "Inactiva"}
                      </Typography>
                      {savingStatus ? <CircularProgress size={17} /> : null}
                    </Stack>
                  }
                />
              </Box>

              <Box>
                <Typography sx={fieldLabelSx}>Predeterminada</Typography>

                <FormControlLabel
                  sx={{ m: 0, mt: 0.5 }}
                  control={
                    <Switch
                      checked={Boolean(variant.is_default)}
                      disabled={savingDefault || savingStatus || isInvalid}
                      onChange={handleDefaultChange}
                    />
                  }
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={switchLabelSx}>
                        {variant.is_default ? "Sí" : "No"}
                      </Typography>
                      {savingDefault ? <CircularProgress size={17} /> : null}
                    </Stack>
                  }
                />
              </Box>
            </Stack>
          </Paper>

          <Paper sx={{ ...containerSx, p: 0, overflow: "hidden" }}>
            {currentImageUrl ? (
              <Box
                component="img"
                src={currentImageUrl}
                alt={`Imagen de ${displayName}`}
                loading="lazy"
                sx={{
                  width: "100%",
                  height: { xs: 220, sm: 260, md: 240 },
                  display: "block",
                  objectFit: "cover",
                  backgroundColor: "action.hover",
                }}
              />
            ) : (
              <Box
                sx={{
                  height: { xs: 220, sm: 260, md: 240 },
                  display: "grid",
                  placeItems: "center",
                  backgroundColor: "action.hover",
                }}
              >
                <Stack spacing={1} alignItems="center">
                  <ImageOutlinedIcon sx={{ fontSize: 44, color: "text.secondary" }} />
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    Sin imagen disponible
                  </Typography>
                </Stack>
              </Box>
            )}

            <Box sx={{ p: 2 }}>
              <Typography sx={fieldLabelSx}>Imagen efectiva</Typography>
              <Typography sx={{ mt: 0.5, fontSize: 14, fontWeight: 700 }}>
                {imageOrigin(currentImage)}
              </Typography>
            </Box>
          </Paper>
        </Box>

        <Paper sx={containerSx}>
          <Typography sx={sectionTitleSx}>Administrar variante</Typography>

          <Box
            sx={{
              mt: 2,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
              gap: 1.5,
            }}
          >
            <Button
              type="button"
              variant="outlined"
              startIcon={<PointOfSaleOutlinedIcon />}
              onClick={() => onOpenChannels?.(variant)}
              sx={{ minHeight: 48, fontWeight: 800 }}
            >
              Canales
            </Button>

            <Button
              type="button"
              variant="outlined"
              startIcon={<ImageOutlinedIcon />}
              onClick={() => onOpenImage?.(variant)}
              sx={{ minHeight: 48, fontWeight: 800 }}
            >
              Imagen
            </Button>

            {isInvalid ? (
              <Button
                type="button"
                variant="contained"
                color="warning"
                startIcon={<BuildCircleOutlinedIcon />}
                onClick={() => onOpenRepair?.(variant)}
                sx={{ minHeight: 48, fontWeight: 800 }}
              >
                Reparar
              </Button>
            ) : null}
          </Box>
        </Paper>
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

const containerSx = {
  p: { xs: 2, sm: 2.5 },
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  boxShadow: "none",
  backgroundColor: "background.paper",
};

const emptySx = {
  p: { xs: 3, sm: 4 },
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  boxShadow: "none",
  textAlign: "center",
};

const sectionTitleSx = {
  fontSize: 17,
  fontWeight: 800,
  color: "text.primary",
};

const fieldLabelSx = {
  fontSize: 12,
  fontWeight: 800,
  color: "text.secondary",
  textTransform: "uppercase",
  letterSpacing: 0.35,
};

const switchLabelSx = {
  fontSize: 14,
  fontWeight: 700,
  color: "text.primary",
};