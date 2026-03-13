import { useEffect, useMemo, useRef, useState } from "react";

import {
  Alert,Box, Button, Card, CardContent, Chip, Dialog, DialogContent, DialogTitle, FormControl, FormControlLabel,
  IconButton, MenuItem, Select, Stack, Switch, TextField, Tooltip, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import ImageIcon from "@mui/icons-material/Image";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import { changeProductType } from "../../services/products/catalog/productType.service";
import { changeInventoryType } from "../../services/products/catalog/productInventoryType.service";

const PRODUCT_TYPES = [
  { value: "simple", label: "Simple" },
  { value: "composite", label: "Compuesto" },
];

const INVENTORY_TYPES = [
  { value: "ingredients", label: "Ingredientes" },
  { value: "product", label: "Producto" },
  { value: "none", label: "Sin inventario" },
];

function allowedInventoryTypesForProductType(productType) {
  if (productType === "composite") return ["none"];
  return ["ingredients", "product"];
}

function normalizeInventoryForProductType(productType, inventoryType) {
  const allowed = allowedInventoryTypesForProductType(productType);
  return allowed.includes(inventoryType) ? inventoryType : allowed[0];
}

function getModeKey(productType, inventoryType) {
  const pt = productType || "simple";
  const it = inventoryType || (pt === "composite" ? "none" : "ingredients");
  return `${pt}:${it}`;
}

function modeHelp(productType, inventoryType) {
  const key = getModeKey(productType, inventoryType);

  if (key === "simple:ingredients") {
    return "Producto simple con receta. Descuenta ingredientes y permite trabajar recetas y variantes.";
  }

  if (key === "simple:product") {
    return "Producto simple sin receta. Descuenta stock del producto directamente.";
  }

  if (key === "composite:none") {
    return "Producto compuesto. Se integra por otros productos y no descuenta inventario directo.";
  }

  return "Configura el tipo de producto según la lógica operativa que necesitas.";
}

function apiErrorToMessage(e, fallback = "Ocurrió un error") {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors
      ? Object.entries(e.response.data.errors)
          .map(([k, arr]) =>
            `${k}: ${Array.isArray(arr) ? arr.join(", ") : String(arr)}`
          )
          .join("\n")
      : "") ||
    fallback
  );
}

export default function ProductFormModal({
  open,
  onClose,
  restaurantId,
  productsMode,
  requiresBranch,
  effectiveBranchId,
  categories,
  initialData,
  getProduct,
  createProduct,
  updateProduct,
  getProductImages,
  uploadProductImage,
  deleteProductImage,
  reorderProductImages,
  onSaved,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isEdit = !!initialData?.id;
  const fileInputRef = useRef(null);
  const imageReqRef = useRef(0);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    id: null,
    category_id: "",
    name: "",
    description: "",
    status: "active",
    product_type: "simple",
    inventory_type: "ingredients",
  });

  const [images, setImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);

  const maxImages = 6;
  const canUploadMore = images.length < maxImages;

  const currentInitialId = initialData?.id || null;

  const inventoryOptions = useMemo(() => {
    const allowed = allowedInventoryTypesForProductType(form.product_type);
    return INVENTORY_TYPES.filter((x) => allowed.includes(x.value));
  }, [form.product_type]);

  useEffect(() => {
    if (!open) return;

    setErr("");

    const nextCategory =
      initialData?.category_id
        ? String(initialData.category_id)
        : categories?.[0]?.id
        ? String(categories[0].id)
        : "";

    setForm({
      id: initialData?.id || null,
      category_id: nextCategory,
      name: initialData?.name || "",
      description: initialData?.description || "",
      status: initialData?.status || "active",
      product_type: initialData?.product_type || "simple",
      inventory_type:
        initialData?.inventory_type ||
        normalizeInventoryForProductType(
          initialData?.product_type || "simple",
          "ingredients"
        ),
    });

    setImages([]);
    setImagesLoading(!!initialData?.id);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData?.id, categories]);

  useEffect(() => {
    if (!open) return;

    const productId = currentInitialId || form.id || null;

    setImages([]);
    imageReqRef.current += 1;
    const reqId = imageReqRef.current;

    if (!productId) {
      setImagesLoading(false);
      return;
    }

    setImagesLoading(true);

    (async () => {
      try {
        const imgs = await getProductImages(restaurantId, productId);

        if (reqId !== imageReqRef.current) return;
        setImages(Array.isArray(imgs) ? imgs : []);
      } catch (e) {
        if (reqId !== imageReqRef.current) return;
        setErr(apiErrorToMessage(e, "No se pudieron cargar imágenes"));
        setImages([]);
      } finally {
        if (reqId !== imageReqRef.current) return;
        setImagesLoading(false);
      }
    })();
  }, [open, currentInitialId, form.id, restaurantId, getProductImages]);


  useEffect(() => {
    if (!err) return;

    const timer = setTimeout(() => {
      setErr("");
    }, 4500); // puedes cambiar la duración

    return () => clearTimeout(timer);
  }, [err]);


  const title = isEdit ? "Editar producto" : "Nuevo producto";

  const canSave = useMemo(() => {
    if (requiresBranch && !effectiveBranchId) return false;
    if (!form.category_id) return false;
    if (!form.name.trim()) return false;
    return true;
  }, [requiresBranch, effectiveBranchId, form.category_id, form.name]);

  const handleProductTypeChange = async (nextType) => {
    setErr("");

    const prevType = form.product_type || "simple";
    const prevInventory = form.inventory_type || "ingredients";

    const nextInventory = normalizeInventoryForProductType(
      nextType,
      prevInventory
    );

    setForm((prev) => ({
      ...prev,
      product_type: nextType,
      inventory_type: nextInventory,
    }));

    if (!form.id) return;

    try {
      const res = await changeProductType(restaurantId, form.id, nextType);
      const updated = res?.data || res || null;

      setForm((prev) => ({
        ...prev,
        product_type: updated?.product_type || nextType,
        inventory_type:
          updated?.inventory_type ||
          normalizeInventoryForProductType(
            updated?.product_type || nextType,
            prev.inventory_type
          ),
        status: updated?.status || prev.status,
      }));

      await onSaved?.(updated || { id: form.id });
    } catch (e) {
      setForm((prev) => ({
        ...prev,
        product_type: prevType,
        inventory_type: prevInventory,
      }));
      setErr(apiErrorToMessage(e, "No se pudo cambiar el tipo de producto"));
    }
  };

  const handleInventoryTypeChange = async (nextInventory) => {
    setErr("");

    const prevInventory = form.inventory_type || "ingredients";
    const productType = form.product_type || "simple";

    const allowed = allowedInventoryTypesForProductType(productType);
    if (!allowed.includes(nextInventory)) {
      const forced = allowed[0];
      setForm((prev) => ({
        ...prev,
        inventory_type: forced,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      inventory_type: nextInventory,
    }));

    if (!form.id) return;

    try {
      const res = await changeInventoryType(
        restaurantId,
        form.id,
        nextInventory
      );
      const updated = res?.data || res || null;

      setForm((prev) => ({
        ...prev,
        inventory_type: updated?.inventory_type || nextInventory,
        status: updated?.status || prev.status,
      }));

      await onSaved?.(updated || { id: form.id });
    } catch (e) {
      setForm((prev) => ({
        ...prev,
        inventory_type: prevInventory,
      }));
      setErr(
        apiErrorToMessage(e, "No se pudo cambiar el tipo de inventario")
      );
    }
  };

  const handleSave = async () => {
    setErr("");

    if (requiresBranch && !effectiveBranchId) {
      setErr("Selecciona una sucursal.");
      return;
    }

    if (!form.category_id) {
      setErr("Selecciona categoría.");
      return;
    }

    if (!form.name.trim()) {
      setErr("Nombre obligatorio.");
      return;
    }

    const pt = form.product_type || "simple";
    const it = normalizeInventoryForProductType(
      pt,
      form.inventory_type || "ingredients"
    );

    setSaving(true);

    try {
      let saved = null;

      if (form.id) {
        const updatePayload = {
          category_id: Number(form.category_id),
          name: form.name.trim(),
          description: form.description?.trim() || null,
        };

        saved = await updateProduct(restaurantId, form.id, updatePayload);

        const fresh = await getProduct(restaurantId, form.id);

        setForm((prev) => ({
          ...prev,
          id: fresh.id,
          category_id: String(fresh.category_id),
          name: fresh.name || "",
          description: fresh.description || "",
          status: fresh.status || prev.status,
          product_type: fresh.product_type || prev.product_type,
          inventory_type:
            fresh.inventory_type ||
            normalizeInventoryForProductType(
              fresh.product_type || prev.product_type,
              prev.inventory_type
            ),
        }));
      } else {
        const createPayload = {
          category_id: Number(form.category_id),
          name: form.name.trim(),
          description: form.description?.trim() || null,
          status: form.status,
          product_type: pt,
          inventory_type: it,
          is_global: productsMode === "global",
          branch_id: productsMode === "branch" ? effectiveBranchId : null,
        };

        saved = await createProduct(restaurantId, createPayload);

        setForm((prev) => ({
          ...prev,
          id: saved.id,
          category_id: String(saved.category_id),
          name: saved.name ?? prev.name,
          description: saved.description ?? prev.description,
          status: saved.status || prev.status,
          product_type: saved.product_type || prev.product_type,
          inventory_type: saved.inventory_type || prev.inventory_type,
        }));
      }

      await onSaved?.(saved);
    } catch (e) {
      setErr(apiErrorToMessage(e, "No se pudo guardar producto"));
    } finally {
      setSaving(false);
    }
  };

  const onUpload = async (file) => {
    if (!form.id) {
      setErr("Primero guarda el producto.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!file) return;

    if (!canUploadMore) {
      setErr(`Ya tienes ${maxImages} imágenes.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setErr("");
    try {
      await uploadProductImage(restaurantId, form.id, file, images.length);

      const reqId = ++imageReqRef.current;
      setImagesLoading(true);

      const imgs = await getProductImages(restaurantId, form.id);
      if (reqId !== imageReqRef.current) return;

      setImages(Array.isArray(imgs) ? imgs : []);
    } catch (e) {
      setErr(apiErrorToMessage(e, "No se pudo subir imagen"));
    } finally {
      setImagesLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onRemoveImage = async (imageId) => {
    if (!form.id) return;

    try {
      await deleteProductImage(restaurantId, form.id, imageId);

      const reqId = ++imageReqRef.current;
      setImagesLoading(true);

      const imgs = await getProductImages(restaurantId, form.id);
      if (reqId !== imageReqRef.current) return;

      setImages(Array.isArray(imgs) ? imgs : []);
    } catch (e) {
      setErr(apiErrorToMessage(e, "No se pudo eliminar imagen"));
    } finally {
      setImagesLoading(false);
    }
  };

  const moveImage = async (index, dir) => {
    if (!form.id) return;

    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= images.length) return;

    const copy = [...images];
    [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
    setImages(copy);

    try {
      const items = copy.map((img, i) => ({
        id: img.id,
        sort_order: i,
      }));

      const reqId = ++imageReqRef.current;
      const updated = await reorderProductImages(restaurantId, form.id, items);
      if (reqId !== imageReqRef.current) return;

      setImages(Array.isArray(updated) ? updated : []);
    } catch (e) {
      setErr(apiErrorToMessage(e, "No se pudo reordenar"));

      try {
        const reqId = ++imageReqRef.current;
        const imgs = await getProductImages(restaurantId, form.id);
        if (reqId !== imageReqRef.current) return;

        setImages(Array.isArray(imgs) ? imgs : []);
      } catch {
        // suficiente castigo por hoy
      }
    }
  };

  const imageSrc = (img) => img?.public_url || img?.url || "";

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="lg"
      fullScreen={isMobile}
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, sm: 1 },
            overflow: "hidden",
            backgroundColor: "background.paper",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          bgcolor: "#111111",
          color: "#fff",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: 20, sm: 24 },
                lineHeight: 1.2,
                color: "#fff",
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              {isEdit
                ? "Actualiza los datos visuales del producto sin alterar la lógica ya establecida."
                : "Crea un nuevo producto y define cómo se comportará dentro del catálogo."}
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            disabled={saving}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.16)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: "background.default",
        }}
      >
        <Stack spacing={2.5}>
          {err ? (
            <Alert
              severity="error"
              sx={{
                borderRadius: 1,
                alignItems: "flex-start",
                whiteSpace: "pre-line",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                  No se pudo completar la acción
                </Typography>
                <Typography variant="body2">{err}</Typography>
              </Box>
            </Alert>
          ) : null}

          <Card
            sx={{
              borderRadius: 0,
              backgroundColor: "background.paper",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2.5}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: 18, sm: 20 },
                    color: "text.primary",
                  }}
                >
                  Datos principales
                </Typography>

                <Stack spacing={2}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Categoría *"
                      input={
                        <FormControl fullWidth>
                          <Select
                            value={form.category_id}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                category_id: e.target.value,
                              }))
                            }
                            displayEmpty
                            IconComponent={KeyboardArrowDownIcon}
                            sx={selectSx}
                          >
                            <MenuItem value="">
                              {categories?.length
                                ? "Selecciona una categoría"
                                : "No hay categorías disponibles"}
                            </MenuItem>

                            {categories.map((c) => (
                              <MenuItem key={c.id} value={String(c.id)}>
                                {c.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      }
                    />

                    <FieldBlock
                      label="Nombre *"
                      input={
                        <TextField
                          value={form.name}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Ej. Hamburguesa especial"
                        />
                      }
                    />
                  </Stack>

                  <FieldBlock
                    label="Descripción"
                    input={
                      <TextField
                        value={form.description}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Describe brevemente este producto"
                        multiline
                        minRows={3}
                      />
                    }
                  />

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Tipo de producto *"
                      input={
                        <FormControl fullWidth>
                          <Select
                            value={form.product_type}
                            onChange={(e) =>
                              handleProductTypeChange(e.target.value)
                            }
                            IconComponent={KeyboardArrowDownIcon}
                            sx={selectSx}
                          >
                            {PRODUCT_TYPES.map((op) => (
                              <MenuItem key={op.value} value={op.value}>
                                {op.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      }
                    />

                    <FieldBlock
                      label="Tipo de inventario *"
                      input={
                        <FormControl fullWidth>
                          <Select
                            value={form.inventory_type}
                            onChange={(e) =>
                              handleInventoryTypeChange(e.target.value)
                            }
                            IconComponent={KeyboardArrowDownIcon}
                            sx={selectSx}
                          >
                            {inventoryOptions.map((op) => (
                              <MenuItem key={op.value} value={op.value}>
                                {op.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      }
                    />
                  </Stack>

                  <Alert
                    severity="info"
                    sx={{
                      borderRadius: 1,
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography variant="body2">
                      {modeHelp(form.product_type, form.inventory_type)}
                    </Typography>
                  </Alert>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Alcance del catálogo"
                      input={
                        <Box
                          sx={{
                            minHeight: 44,
                            display: "flex",
                            alignItems: "center",
                            px: 1.5,
                            bgcolor: "#F4F4F4",
                            borderRadius: 0,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 14,
                              color: "text.primary",
                              fontWeight: 700,
                            }}
                          >
                            {productsMode === "global"
                              ? "Global (catálogo base)"
                              : "Sucursal (catálogo base)"}
                          </Typography>
                        </Box>
                      }
                    />

                    {!isEdit ? (
                      <Box sx={{ flex: 1, width: "100%" }}>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: "text.primary",
                            mb: 1,
                          }}
                        >
                          Estado inicial
                        </Typography>

                        <FormControlLabel
                          control={
                            <Switch
                              checked={form.status === "active"}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  status: e.target.checked ? "active" : "inactive",
                                }))
                              }
                              color="primary"
                            />
                          }
                          label={
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "text.primary",
                              }}
                            >
                              {form.status === "active"
                                ? "Activo al guardar"
                                : "Inactivo al guardar"}
                            </Typography>
                          }
                          sx={{ m: 0 }}
                        />
                      </Box>
                    ) : (
                      <Box sx={{ flex: 1, width: "100%" }}>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: "text.primary",
                            mb: 1,
                          }}
                        >
                          Estado
                        </Typography>

                        <Alert
                          severity="warning"
                          sx={{ borderRadius: 1, alignItems: "flex-start" }}
                        >
                          <Typography variant="body2">
                            El estado activo o inactivo se controla desde la página principal.
                          </Typography>
                        </Alert>
                      </Box>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card
            sx={{
              borderRadius: 0,
              backgroundColor: "background.paper",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: 18, sm: 20 },
                        color: "text.primary",
                      }}
                    >
                      Imágenes
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontSize: 13,
                        color: "text.secondary",
                      }}
                    >
                      Máximo {maxImages} imágenes por producto.
                    </Typography>
                  </Box>

                  {imagesLoading ? (
                    <Chip
                      icon={<ImageIcon />}
                      label="Cargando..."
                      size="small"
                      sx={{ fontWeight: 800 }}
                    />
                  ) : null}
                </Stack>

                {!form.id ? (
                  <Alert
                    severity="info"
                    sx={{
                      borderRadius: 1,
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography variant="body2">
                      Guarda el producto primero para poder subir y ordenar imágenes.
                    </Typography>
                  </Alert>
                ) : (
                  <>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      alignItems={{ xs: "stretch", sm: "center" }}
                    >
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<ImageIcon />}
                        disabled={!canUploadMore}
                        sx={{
                          minWidth: { xs: "100%", sm: 220 },
                          height: 44,
                          borderRadius: 2,
                        }}
                      >
                        Subir imagen
                        <input
                          ref={fileInputRef}
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => onUpload(e.target.files?.[0])}
                        />
                      </Button>

                      {!canUploadMore ? (
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "error.main",
                            fontWeight: 700,
                          }}
                        >
                          Ya tienes {maxImages} imágenes cargadas.
                        </Typography>
                      ) : null}
                    </Stack>

                    {imagesLoading ? (
                      <Box
                        sx={{
                          p: 3,
                          border: "1px dashed",
                          borderColor: "divider",
                          borderRadius: 1,
                          textAlign: "center",
                          bgcolor: "#fff",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 14,
                            color: "text.secondary",
                          }}
                        >
                          Cargando imágenes…
                        </Typography>
                      </Box>
                    ) : images.length === 0 ? (
                      <Box
                        sx={{
                          p: 3,
                          border: "1px dashed",
                          borderColor: "divider",
                          borderRadius: 1,
                          textAlign: "center",
                          bgcolor: "#fff",
                        }}
                      >
                        <Inventory2OutlinedIcon
                          sx={{
                            fontSize: 34,
                            color: "text.secondary",
                          }}
                        />
                        <Typography
                          sx={{
                            mt: 1,
                            fontSize: 14,
                            color: "text.secondary",
                          }}
                        >
                          Aún no hay imágenes para este producto.
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "repeat(2, minmax(0, 1fr))",
                            sm: "repeat(3, minmax(0, 1fr))",
                            md: "repeat(4, minmax(0, 1fr))",
                          },
                          gap: 2,
                        }}
                      >
                        {images.map((img, idx) => (
                          <Card
                            key={img.id}
                            sx={{
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor: "divider",
                              boxShadow: "none",
                              backgroundColor: "#fff",
                            }}
                          >
                            <Box sx={{ p: 1.25 }}>
                              <Box
                                sx={{
                                  width: "100%",
                                  aspectRatio: "1 / 1",
                                  overflow: "hidden",
                                  borderRadius: 1,
                                  border: "1px solid",
                                  borderColor: "divider",
                                  backgroundColor: "#F7F7F7",
                                }}
                              >
                                <img
                                  src={imageSrc(img)}
                                  alt=""
                                  loading="lazy"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                  }}
                                  onError={(ev) => {
                                    ev.currentTarget.style.display = "none";
                                    const parent = ev.currentTarget.parentElement;
                                    if (
                                      parent &&
                                      !parent.querySelector(".img-fallback")
                                    ) {
                                      const d = document.createElement("div");
                                      d.className = "img-fallback";
                                      d.style.height = "100%";
                                      d.style.display = "grid";
                                      d.style.placeItems = "center";
                                      d.style.fontSize = "12px";
                                      d.style.color = "#6E6A6A";
                                      d.innerText = "Sin imagen";
                                      parent.appendChild(d);
                                    }
                                  }}
                                />
                              </Box>

                              <Stack direction="row" spacing={1} mt={1.25}>
                                <Tooltip title="Subir posición">
                                  <span style={{ display: "inline-flex", flex: 1 }}>
                                    <IconButton
                                      onClick={() => moveImage(idx, -1)}
                                      disabled={idx === 0}
                                      sx={imageActionSx}
                                    >
                                      <ArrowUpwardIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>

                                <Tooltip title="Bajar posición">
                                  <span style={{ display: "inline-flex", flex: 1 }}>
                                    <IconButton
                                      onClick={() => moveImage(idx, 1)}
                                      disabled={idx === images.length - 1}
                                      sx={imageActionSx}
                                    >
                                      <ArrowDownwardIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>

                                <Tooltip title="Eliminar imagen">
                                  <IconButton
                                    onClick={() => onRemoveImage(img.id)}
                                    sx={imageDeleteSx}
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Box>
                          </Card>
                        ))}
                      </Box>
                    )}
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            justifyContent="flex-end"
            spacing={1.5}
          >
            <Button
              type="button"
              onClick={onClose}
              disabled={saving}
              variant="outlined"
              sx={{
                minWidth: { xs: "100%", sm: 150 },
                height: 44,
                borderRadius: 2,
              }}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              disabled={!canSave || saving}
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 180 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 800,
          color: "text.primary",
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
            color: "text.secondary",
            lineHeight: 1.45,
          }}
        >
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}

const selectSx = {
  bgcolor: "#F4F4F4",
  borderRadius: 0,
  minHeight: 44,
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "1.5px solid #FF9800",
  },
  "& .MuiSelect-select": {
    py: 1.25,
    px: 1.5,
    fontSize: 14,
    color: "text.primary",
  },
};

const imageActionSx = {
  flex: 1,
  width: "100%",
  height: 40,
  bgcolor: "#F4F4F4",
  color: "text.primary",
  borderRadius: 1.5,
  border: "1px solid",
  borderColor: "divider",
  "&:hover": {
    bgcolor: "#ECECEC",
  },
};

const imageDeleteSx = {
  width: 40,
  height: 40,
  bgcolor: "error.main",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "error.dark",
  },
};