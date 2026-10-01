import { useEffect, useMemo, useRef, useState } from "react";

import {
  Box, Button, Card, CircularProgress, Paper, Stack, Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";

import AppAlert from "../../common/AppAlert";
import PageContainer from "../../common/PageContainer";

function normalizeErr(error, fallback = "Ocurrió un error") {
  return (
    error?.response?.data?.message ||
    (error?.response?.data?.errors ? Object.values(error.response.data.errors).flat().join("\n") : "") ||
    fallback
  );
}

function extractImageState(response) {
  const state = response?.data?.data ?? response?.data ?? response;

  if (!state || typeof state !== "object") {
    return {
      variant_image: null,
      effective_image: null,
    };
  }

  return {
    product_id: state.product_id ?? null,
    variant_id: state.variant_id ?? null,
    variant_image: state.variant_image ?? null,
    effective_image: state.effective_image ?? null,
  };
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

function effectiveSourceLabel(image, hasOwnImage) {
  if (hasOwnImage) return "Imagen propia de la variante";
  if (!image) return "Sin imagen disponible";
  if (image.source === "product") return "Imagen heredada del producto";
  if (image.source === "variant") return "Imagen propia de la variante";
  if (image.source === "placeholder") return "Imagen predeterminada";
  return "Imagen disponible";
}

function variantTitle(productName, variant) {
  const product = String(productName || "").trim();
  const option = String(
    variant?.variant_name ||
    variant?.canonical_name ||
    variant?.stored_name ||
    ""
  ).trim();

  if (product && option) return `${product} · ${option}`;
  return variant?.display_name || variant?.name || product || "Variante";
}

export default function VariantImageContent({
  restaurantId,
  productId,
  productName,
  variant,
  getVariantImage,
  uploadVariantImage,
  deleteVariantImage,
  onBack,
  onChanged,
}) {
  const fileInputRef = useRef(null);
  const requestRef = useRef(0);

  const initialState = useMemo(
    () => ({
      product_id: Number(productId) || null,
      variant_id: Number(variant?.id) || null,
      variant_image: variant?.variant_image ?? null,
      effective_image: variant?.effective_image ?? null,
    }),
    [productId, variant]
  );

  const [imageState, setImageState] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "success",
    title: "",
    message: "",
  });

  const showAlert = ({ severity = "success", title = "", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const busy = uploading || deleting;
  const ownImage = imageState?.variant_image ?? null;
  const effectiveImage = imageState?.effective_image ?? null;
  const ownImageUrl = imageUrl(ownImage);
  const effectiveImageUrl = imageUrl(effectiveImage);
  const hasOwnImage = Boolean(ownImage);

  useEffect(() => {
    setImageState(initialState);
  }, [initialState]);

  useEffect(() => {
    if (!restaurantId || !productId || !variant?.id) {
      setLoading(false);
      return;
    }

    if (typeof getVariantImage !== "function") {
      setLoading(false);
      return;
    }

    const requestId = ++requestRef.current;
    setLoading(true);

    (async () => {
      try {
        const response = await getVariantImage(
          restaurantId,
          productId,
          variant.id
        );

        if (requestId !== requestRef.current) return;
        setImageState(extractImageState(response));
      } catch (error) {
        if (requestId !== requestRef.current) return;

        showAlert({
          severity: "error",
          title: "No se pudo cargar la imagen",
          message: normalizeErr(error, "Inténtalo nuevamente."),
        });
      } finally {
        if (requestId === requestRef.current) setLoading(false);
      }
    })();

    return () => {
      requestRef.current += 1;
    };
  }, [restaurantId, productId, variant?.id, getVariantImage]);

  const updateLocalState = (response) => {
    const nextState = extractImageState(response);
    setImageState(nextState);
    onChanged?.(nextState);
    return nextState;
  };

  const chooseFile = () => {
    if (busy) return;
    fileInputRef.current?.click();
  };

  const upload = async (file) => {
    if (!file) return;

    if (!file.type?.startsWith("image/")) {
      showAlert({
        severity: "error",
        title: "Archivo no válido",
        message: "Selecciona una imagen.",
      });

      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (typeof uploadVariantImage !== "function") {
      showAlert({
        severity: "error",
        title: "No se pudo continuar",
        message: "La gestión de imágenes no está disponible en este momento.",
      });

      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);

    try {
      const response = await uploadVariantImage(
        restaurantId,
        productId,
        variant.id,
        file
      );

      updateLocalState(response);

      showAlert({
        severity: "success",
        title: hasOwnImage ? "Imagen reemplazada" : "Imagen guardada",
        message: hasOwnImage
          ? "La imagen propia de la variante se reemplazó correctamente."
          : "La variante ahora tiene una imagen propia.",
      });
    } catch (error) {
      showAlert({
        severity: "error",
        title: "No se pudo guardar la imagen",
        message: normalizeErr(error, "Revisa el archivo e inténtalo nuevamente."),
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const remove = async () => {
    if (!hasOwnImage || deleting) return;

    if (typeof deleteVariantImage !== "function") {
      showAlert({
        severity: "error",
        title: "No se pudo continuar",
        message: "La gestión de imágenes no está disponible en este momento.",
      });
      return;
    }

    setDeleting(true);

    try {
      const response = await deleteVariantImage(
        restaurantId,
        productId,
        variant.id
      );

      updateLocalState(response);

      showAlert({
        severity: "success",
        title: "Imagen eliminada",
        message: "La variante volverá a utilizar la imagen disponible del producto.",
      });
    } catch (error) {
      showAlert({
        severity: "error",
        title: "No se pudo eliminar la imagen",
        message: normalizeErr(error, "Inténtalo nuevamente."),
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageContainer sx={{ py: 0, px: 0 }} innerSx={{ width: "100%" }}>
      <Stack spacing={2.5}>
        <Box>
          <Button
            type="button"
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={() => onBack?.()}
            disabled={busy}
            sx={{ mb: 1, fontWeight: 800 }}
          >
            Volver
          </Button>

          <Typography sx={titleSx}>Imagen de la variante</Typography>
          <Typography sx={{ mt: 0.75, fontSize: 14, color: "text.secondary" }}>
            {variantTitle(productName, variant)}
          </Typography>
        </Box>

        {loading ? (
          <Paper sx={loadingSx}>
            <CircularProgress size={30} />
            <Typography sx={{ mt: 1.25, fontSize: 13, color: "text.secondary" }}>
              Cargando imagen…
            </Typography>
          </Paper>
        ) : (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                gap: 2,
                alignItems: "stretch",
              }}
            >
              <Card sx={imageCardSx}>
                <Stack sx={{ height: "100%" }}>
                  <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Typography sx={sectionTitleSx}>Imagen propia</Typography>
                    <Typography sx={{ mt: 0.4, fontSize: 13, color: "text.secondary" }}>
                      Esta imagen pertenece únicamente a esta variante.
                    </Typography>
                  </Box>

                  <ImagePreview
                    src={ownImageUrl}
                    alt={`Imagen propia de ${variantTitle(productName, variant)}`}
                    emptyText="Esta variante no tiene una imagen propia"
                  />

                  <Stack spacing={1.25} sx={{ p: 2, mt: "auto" }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(event) => upload(event.target.files?.[0] || null)}
                    />

                    <Button
                      fullWidth
                      type="button"
                      variant="contained"
                      startIcon={
                        uploading
                          ? <CircularProgress size={17} color="inherit" />
                          : <UploadOutlinedIcon />
                      }
                      onClick={chooseFile}
                      disabled={busy}
                      sx={{ minHeight: 44, fontWeight: 800 }}
                    >
                      {uploading
                        ? "Guardando…"
                        : hasOwnImage
                        ? "Reemplazar imagen"
                        : "Subir imagen"}
                    </Button>

                    {hasOwnImage ? (
                      <Button
                        fullWidth
                        type="button"
                        variant="outlined"
                        color="error"
                        startIcon={
                          deleting
                            ? <CircularProgress size={17} color="inherit" />
                            : <DeleteOutlineIcon />
                        }
                        onClick={remove}
                        disabled={busy}
                        sx={{ minHeight: 44, fontWeight: 800 }}
                      >
                        {deleting ? "Eliminando…" : "Eliminar imagen propia"}
                      </Button>
                    ) : null}
                  </Stack>
                </Stack>
              </Card>

              <Card sx={imageCardSx}>
                <Stack sx={{ height: "100%" }}>
                  <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Typography sx={sectionTitleSx}>Imagen efectiva</Typography>
                    <Typography sx={{ mt: 0.4, fontSize: 13, color: "text.secondary" }}>
                      Es la imagen que se utilizará actualmente para esta variante.
                    </Typography>
                  </Box>

                  <ImagePreview
                    src={effectiveImageUrl}
                    alt={`Imagen efectiva de ${variantTitle(productName, variant)}`}
                    emptyText="No hay una imagen disponible"
                  />

                  <Box sx={{ p: 2, mt: "auto" }}>
                    <Typography sx={fieldLabelSx}>Origen actual</Typography>
                    <Typography sx={{ mt: 0.5, fontSize: 15, fontWeight: 800 }}>
                      {effectiveSourceLabel(effectiveImage, hasOwnImage)}
                    </Typography>

                    {!hasOwnImage && effectiveImage?.source === "product" ? (
                      <Typography sx={{ mt: 0.75, fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
                        Si subes una imagen propia, reemplazará visualmente a la imagen heredada del producto.
                      </Typography>
                    ) : null}

                    {!hasOwnImage && effectiveImage?.source === "placeholder" ? (
                      <Typography sx={{ mt: 0.75, fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
                        No hay una imagen propia ni una imagen disponible en el producto.
                      </Typography>
                    ) : null}
                  </Box>
                </Stack>
              </Card>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="flex-start"
            >
              <Button
                type="button"
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => onBack?.()}
                disabled={busy}
                sx={{ width: { xs: "100%", sm: "auto" }, minWidth: { sm: 150 }, height: 44 }}
              >
                Volver
              </Button>
            </Stack>
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

function ImagePreview({ src, alt, emptyText }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <Box
        sx={{
          width: "100%",
          height: { xs: 240, sm: 280, md: 300 },
          display: "grid",
          placeItems: "center",
          bgcolor: "action.hover",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack spacing={1} alignItems="center" sx={{ px: 2, textAlign: "center" }}>
          <ImageOutlinedIcon sx={{ fontSize: 46, color: "text.secondary" }} />
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            {emptyText}
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      sx={{
        width: "100%",
        height: { xs: 240, sm: 280, md: 300 },
        display: "block",
        objectFit: "cover",
        bgcolor: "action.hover",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    />
  );
}

const titleSx = {
  fontSize: { xs: 22, sm: 26 },
  fontWeight: 800,
  color: "text.primary",
  lineHeight: 1.25,
};

const sectionTitleSx = {
  fontSize: 17,
  fontWeight: 800,
  color: "text.primary",
};

const fieldLabelSx = {
  fontSize: 11,
  fontWeight: 800,
  color: "text.secondary",
  textTransform: "uppercase",
  letterSpacing: 0.3,
};

const imageCardSx = {
  width: "100%",
  height: "100%",
  minWidth: 0,
  overflow: "hidden",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  boxShadow: "none",
  backgroundColor: "background.paper",
};

const loadingSx = {
  minHeight: 320,
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  boxShadow: "none",
  backgroundColor: "background.paper",
};