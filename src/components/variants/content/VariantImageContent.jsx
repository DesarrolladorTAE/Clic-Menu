//Ventana imagen variante
import { useEffect, useMemo, useRef, useState } from "react";

import {
  Box, Button, Card, CircularProgress, Paper, Stack, Typography,
} from "@mui/material";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";

import AppAlert from "../../common/AppAlert";

function normalizeErr(error, fallback = "Ocurrió un error") {
  return (
    error?.response?.data?.message ||
    (error?.response?.data?.errors
      ? Object.values(error.response.data.errors).flat().join("\n")
      : "") ||
    fallback
  );
}

function extractImageState(response) {
  const state = response?.data?.data ?? response?.data ?? response;

  if (!state || typeof state !== "object") {
    return {
      product_id: null,
      variant_id: null,
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
  if (!image) {
    return "";
  }

  return (
    image.best_public_url ||
    image.medium_public_url ||
    image.public_url ||
    image.thumbnail_public_url ||
    ""
  );
}

function variantTitle(productName, variant) {
  const product = String(productName || "").trim();

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

export default function VariantImageContent({
  restaurantId,
  productId,
  productName,
  variant,
  getVariantImage,
  uploadVariantImage,
  deleteVariantImage,
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
    if (reason === "clickaway") {
      return;
    }

    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const busy = uploading || deleting;
  const variantImage = imageState?.variant_image ?? null;
  const variantImageUrl = imageUrl(variantImage);
  const hasImage = Boolean(variantImage);

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

        if (requestId !== requestRef.current) {
          return;
        }

        setImageState(extractImageState(response));
      } catch (error) {
        if (requestId !== requestRef.current) {
          return;
        }

        showAlert({
          severity: "error",
          title: "No se pudo cargar la imagen",
          message: normalizeErr(error, "Inténtalo nuevamente."),
        });
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false);
        }
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
    if (busy) {
      return;
    }

    fileInputRef.current?.click();
  };

  const upload = async (file) => {
    if (!file) {
      return;
    }

    if (!file.type?.startsWith("image/")) {
      showAlert({
        severity: "error",
        title: "Archivo no válido",
        message: "Selecciona una imagen.",
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    if (typeof uploadVariantImage !== "function") {
      showAlert({
        severity: "error",
        title: "No se pudo continuar",
        message: "La gestión de imágenes no está disponible en este momento.",
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

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
        title: hasImage ? "Imagen reemplazada" : "Imagen guardada",
        message: hasImage
          ? "La imagen de la variante se reemplazó correctamente."
          : "La imagen de la variante se guardó correctamente.",
      });
    } catch (error) {
      showAlert({
        severity: "error",
        title: "No se pudo guardar la imagen",
        message: normalizeErr(error, "Revisa el archivo e inténtalo nuevamente."),
      });
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const remove = async () => {
    if (!hasImage || deleting) {
      return;
    }

    if (typeof deleteVariantImage !== "function") {
      showAlert({
        severity: "error",
        title: "No se pudo continuar",
        message: "La gestión de imágenes no está disponible en este momento.",
      });

      return;
    }

    const confirmed = window.confirm(
      "¿Deseas eliminar la imagen de esta variante?\n\nLa variante quedará sin imagen."
    );

    if (!confirmed) {
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
        message: "La variante quedó sin imagen.",
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
    <>
      <Stack spacing={2.5}>
        <Box>
          <Typography sx={{ fontSize: 14, color: "text.secondary", lineHeight: 1.5 }}>
            Administra la imagen que pertenece a{" "}
            <Box component="span" sx={{ fontWeight: 800, color: "text.primary" }}>
              {variantTitle(productName, variant)}
            </Box>
            .
          </Typography>
        </Box>

        {loading ? (
          <Paper sx={loadingSx}>
            <Stack alignItems="center">
              <CircularProgress size={30} />

              <Typography sx={{ mt: 1.25, fontSize: 13, color: "text.secondary" }}>
                Cargando imagen…
              </Typography>
            </Stack>
          </Paper>
        ) : (
          <Card sx={imageCardSx}>
            <Stack>
              <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography sx={sectionTitleSx}>Imagen de la variante</Typography>

                <Typography sx={{ mt: 0.4, fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
                  Recomendado: 1280 × 1280 px o menor. JPG, PNG o WebP. Máximo 4 MB.
                </Typography>
              </Box>

              <ImagePreview
                src={variantImageUrl}
                alt={`Imagen de ${variantTitle(productName, variant)}`}
                emptyText="Sin imagen"
              />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                sx={{ p: 2 }}
              >
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
                    : hasImage
                    ? "Reemplazar imagen"
                    : "Subir imagen"}
                </Button>

                {hasImage ? (
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
                    {deleting ? "Eliminando…" : "Eliminar imagen"}
                  </Button>
                ) : null}
              </Stack>
            </Stack>
          </Card>
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
    </>
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
          height: { xs: 260, sm: 320, md: 380 },
          display: "grid",
          placeItems: "center",
          bgcolor: "action.hover",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack spacing={1} alignItems="center" sx={{ px: 2, textAlign: "center" }}>
          <ImageOutlinedIcon sx={{ fontSize: 52, color: "text.secondary" }} />

          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
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
        height: { xs: 260, sm: 320, md: 380 },
        display: "block",
        objectFit: "contain",
        bgcolor: "action.hover",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    />
  );
}

const sectionTitleSx = {
  fontSize: 17,
  fontWeight: 800,
  color: "text.primary",
};

const imageCardSx = {
  width: "100%",
  minWidth: 0,
  overflow: "hidden",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  boxShadow: "none",
  backgroundColor: "background.paper",
};

const loadingSx = {
  minHeight: 360,
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  boxShadow: "none",
  backgroundColor: "background.paper",
};