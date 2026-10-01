import { useEffect, useMemo, useRef, useState } from "react";

import {
  Box, Card, CardContent, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";

import VariantCreateContent from "./content/VariantCreateContent";
import VariantAttributesContent from "./content/VariantAttributesContent";
import VariantAttributeFormContent from "./content/VariantAttributeFormContent";
import VariantAttributeValuesContent from "./content/VariantAttributeValuesContent";
import VariantDetailContent from "./content/VariantDetailContent";
import VariantRepairContent from "./content/VariantRepairContent";
import VariantChannelsContent from "./content/VariantChannelsContent";
import VariantImageContent from "./content/VariantImageContent";

import {
  getProductVariantImage,
  uploadProductVariantImage,
  deleteProductVariantImage,
} from "../../services/products/variants/productVariantImages.service";

const TITLES = {
  create: "Crear variantes",
  attributes: "Presentación del producto",
  attribute_form: "Configurar presentación",
  values: "Opciones de presentación",
  variant_detail: "Administrar variante",
  repair: "Corregir variante",
  channels: "Precios por canal",
  image: "Imagen de la variante",
};

const VARIANT_VIEWS = [
  "variant_detail",
  "repair",
  "channels",
  "image",
];

function normalizeRoute(route) {
  if (!route?.name || !TITLES[route.name]) {
    return { name: "create", payload: {} };
  }

  return { name: route.name, payload: route.payload || {} };
}

function routeVariant(route) {
  return route?.payload?.variant || route?.payload?.variantRow?.variant || null;
}

function patchRouteVariant(route, variantId, patch) {
  if (!route || !variantId) {
    return route;
  }

  const currentVariant = routeVariant(route);

  if (!currentVariant || Number(currentVariant.id) !== Number(variantId)) {
    return route;
  }

  const nextVariant = { ...currentVariant, ...patch };
  const nextPayload = { ...route.payload, variant: nextVariant };

  if (route.payload?.variantRow) {
    nextPayload.variantRow = {
      ...route.payload.variantRow,
      variant: nextVariant,
    };
  }

  return { ...route, payload: nextPayload };
}

function variantLabel(productName, variant) {
  const product = String(variant?.product_name || productName || "").trim();
  const option = String(
    variant?.variant_name ||
    variant?.canonical_name ||
    variant?.stored_name ||
    ""
  ).trim();

  if (product && option) {
    return `${product} · ${option}`;
  }

  return variant?.display_name || variant?.name || product || "Variante";
}

export default function VariantManagementDialog({
  open,
  onClose,
  restaurantId,
  productId,
  productName,
  initialView = "create",
  initialVariantRow = null,
  disabledByPrecondition = false,
  onChanged,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const wasOpenRef = useRef(false);

  const initialRoute = useMemo(() => {
    if (VARIANT_VIEWS.includes(initialView) && initialVariantRow) {
      const variant = initialVariantRow?.variant || initialVariantRow;

      return {
        name: initialView,
        payload: {
          variantRow: initialVariantRow?.variant ? initialVariantRow : { variant },
          variant,
        },
      };
    }

    return { name: initialView || "create", payload: {} };
  }, [initialView, initialVariantRow]);

  const [current, setCurrent] = useState(normalizeRoute(initialRoute));
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setCurrent(normalizeRoute(initialRoute));
      setHistory([]);
    }

    wasOpenRef.current = open;
  }, [open, initialRoute]);

  const currentVariantRow =
    current?.payload?.variantRow ||
    (current.name === "variant_detail" ? initialVariantRow : null);

  const currentVariant =
    current?.payload?.variant ||
    currentVariantRow?.variant ||
    (currentVariantRow?.id ? currentVariantRow : null);

  const headerSubtitle = useMemo(() => {
    if (currentVariant) {
      return variantLabel(productName, currentVariant);
    }

    return productName || "Producto";
  }, [currentVariant, productName]);

  const goTo = (name, payload = {}) => {
    setHistory((prev) => [...prev, current]);
    setCurrent({ name, payload });
  };

  const goBack = () => {
    if (!history.length) {
      onClose?.();
      return;
    }

    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCurrent(previous);
  };

  const notifyChanged = async (detail = null) => {
    if (typeof onChanged === "function") {
      await onChanged(detail);
    }
  };

  const patchVariant = (patch) => {
    const variantId = currentVariant?.id;

    if (!variantId) {
      return;
    }

    setCurrent((prev) => patchRouteVariant(prev, variantId, patch));
    setHistory((prev) => prev.map((route) => patchRouteVariant(route, variantId, patch)));
  };

  const openAttributes = () => goTo("attributes");

  const openAttributeForm = (attribute = null) => {
    goTo("attribute_form", {
      attribute: attribute || null,
      editing: attribute || null,
    });
  };

  const openValues = (attribute) => {
    if (!attribute?.id) {
      return;
    }

    goTo("values", { attribute });
  };

  const openVariantDetail = (variantRow) => {
    const variant = variantRow?.variant || variantRow;

    if (!variant?.id) {
      return;
    }

    goTo("variant_detail", {
      variantRow: variantRow?.variant ? variantRow : { variant },
      variant,
    });
  };

  const openRepair = () => {
    if (!currentVariant?.id) {
      return;
    }

    goTo("repair", {
      variantRow: currentVariantRow || { variant: currentVariant },
      variant: currentVariant,
    });
  };

  const openChannels = () => {
    if (!currentVariant?.id) {
      return;
    }

    goTo("channels", {
      variantRow: currentVariantRow || { variant: currentVariant },
      variant: currentVariant,
    });
  };

  const openImage = () => {
    if (!currentVariant?.id) {
      return;
    }

    goTo("image", {
      variantRow: currentVariantRow || { variant: currentVariant },
      variant: currentVariant,
    });
  };

  const handleAttributeSaved = async (attribute) => {
    await notifyChanged({ type: "attribute_saved", attribute });
    goBack();
  };

  const handleAttributesChanged = async (detail) => {
    await notifyChanged({ type: "attributes_changed", detail });
  };

  const handleValuesChanged = async (detail) => {
    await notifyChanged({ type: "values_changed", detail });
  };

  const handleGenerated = async (detail) => {
    await notifyChanged({ type: "variants_generated", detail });
  };

  const handleRepaired = async (updated) => {
    const data = updated?.data?.data ?? updated?.data ?? updated ?? {};

    patchVariant({
      ...data,
      is_invalid: data?.is_invalid ?? false,
      invalid_reason: data?.invalid_reason ?? null,
    });

    await notifyChanged({ type: "variant_repaired", variant: data });
    goBack();
  };

  const handleChannelsChanged = async (detail) => {
    await notifyChanged({ type: "channels_changed", detail });
  };

  const handleImageChanged = async (imageState) => {
    patchVariant({
      variant_image: imageState?.variant_image ?? null,
      effective_image: imageState?.effective_image ?? null,
    });

    await notifyChanged({
      type: "variant_image_changed",
      variant_id: currentVariant?.id,
      image: imageState,
    });
  };

  const renderContent = () => {
    if (current.name === "create") {
      return (
        <VariantCreateContent
          restaurantId={restaurantId}
          productId={productId}
          productName={productName}
          disabledByPrecondition={disabledByPrecondition}
          onManageAttribute={openAttributes}
          onGenerated={handleGenerated}
        />
      );
    }

    if (current.name === "attributes") {
      return (
        <VariantAttributesContent
          restaurantId={restaurantId}
          productId={productId}
          productName={productName}
          onBack={goBack}
          onDone={goBack}
          onCreate={() => openAttributeForm(null)}
          onCreateAttribute={() => openAttributeForm(null)}
          onEdit={openAttributeForm}
          onEditAttribute={openAttributeForm}
          onValues={openValues}
          onOpenValues={openValues}
          onChanged={handleAttributesChanged}
        />
      );
    }

    if (current.name === "attribute_form") {
      const attribute =
        current?.payload?.attribute ||
        current?.payload?.editing ||
        null;

      return (
        <VariantAttributeFormContent
          restaurantId={restaurantId}
          productId={productId}
          productName={productName}
          attribute={attribute}
          editing={attribute}
          onBack={goBack}
          onClose={goBack}
          onSaved={handleAttributeSaved}
        />
      );
    }

    if (current.name === "values") {
      return (
        <VariantAttributeValuesContent
          restaurantId={restaurantId}
          productId={productId}
          productName={productName}
          attribute={current?.payload?.attribute || null}
          onBack={goBack}
          onClose={goBack}
          onChanged={handleValuesChanged}
        />
      );
    }

    if (current.name === "variant_detail") {
      return (
        <VariantDetailContent
          restaurantId={restaurantId}
          productId={productId}
          productName={productName}
          variantRow={currentVariantRow}
          variant={currentVariant}
          onBack={goBack}
          onClose={goBack}
          onRepair={openRepair}
          onOpenRepair={openRepair}
          onChannels={openChannels}
          onOpenChannels={openChannels}
          onImage={openImage}
          onOpenImage={openImage}
        />
      );
    }

    if (current.name === "repair") {
      return (
        <VariantRepairContent
          restaurantId={restaurantId}
          productId={productId}
          productName={productName}
          variantRow={currentVariantRow}
          variant={currentVariant}
          onBack={goBack}
          onClose={goBack}
          onRepaired={handleRepaired}
        />
      );
    }

    if (current.name === "channels") {
      return (
        <VariantChannelsContent
          restaurantId={restaurantId}
          productId={productId}
          productName={productName}
          variant={currentVariant}
          onBack={goBack}
          onChanged={handleChannelsChanged}
        />
      );
    }

    if (current.name === "image") {
      return (
        <VariantImageContent
          restaurantId={restaurantId}
          productId={productId}
          productName={productName}
          variant={currentVariant}
          getVariantImage={getProductVariantImage}
          uploadVariantImage={uploadProductVariantImage}
          deleteVariantImage={deleteProductVariantImage}
          onBack={goBack}
          onChanged={handleImageChanged}
        />
      );
    }

    return null;
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose?.()}
      fullScreen={isMobile}
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: "calc(100vw - 32px)", md: 1080 },
            maxWidth: 1080,
            height: { xs: "100%", sm: "calc(100dvh - 32px)", md: "min(820px, calc(100dvh - 48px))" },
            maxHeight: { xs: "100%", sm: "calc(100dvh - 32px)" },
            m: { xs: 0, sm: 2 },
            borderRadius: { xs: 0, sm: 1 },
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.paper",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          flexShrink: 0,
          px: { xs: 2, sm: 3 },
          py: 2,
          bgcolor: "#111111",
          color: "#fff",
          borderBottom: "1px solid",
          borderColor: "rgba(255,255,255,0.10)",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: 20, sm: 24 },
                fontWeight: 800,
                lineHeight: 1.2,
                color: "#fff",
              }}
            >
              {TITLES[current.name] || "Variantes"}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                lineHeight: 1.4,
                color: "rgba(255,255,255,0.78)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {headerSubtitle}
            </Typography>
          </Box>

          <IconButton
            aria-label="Cerrar"
            onClick={() => onClose?.()}
            sx={{
              flexShrink: 0,
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          bgcolor: "background.default",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Card
          sx={{
            borderRadius: 0,
            backgroundColor: "background.paper",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            {renderContent()}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}