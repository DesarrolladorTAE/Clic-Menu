import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert, Box, Button, Dialog, DialogContent, DialogTitle, FormControl, IconButton, MenuItem, Select, Stack, TextField,
  Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

import {
  createBranch,
  deleteActiveBranchLogo,
  getBranch,
  getBranchLogo,
  updateBranch,
  uploadBranchLogo,
} from "../../services/restaurant/branch.service";
import { handleRestaurantApiError } from "../../utils/subscriptionGuards";

export default function BranchUpsertModal({
  open,
  onClose,
  restaurantId,
  editing,
  onSaved,
  nav,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isEdit = !!editing?.id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverMsg, setServerMsg] = useState("");

  const [currentLogo, setCurrentLogo] = useState(null);
  const [selectedLogoFile, setSelectedLogoFile] = useState(null);
  const [selectedLogoPreview, setSelectedLogoPreview] = useState("");
  const [logoRemoving, setLogoRemoving] = useState(false);

  const title = useMemo(
    () => (isEdit ? "Editar sucursal" : "Crear sucursal"),
    [isEdit]
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      open_time: "",
      close_time: "",
      status: "active",
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (!selectedLogoFile) {
      setSelectedLogoPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedLogoFile);
    setSelectedLogoPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedLogoFile]);

  useEffect(() => {
    if (!open) return;

    const loadBranch = async () => {
      setServerMsg("");
      setCurrentLogo(null);
      setSelectedLogoFile(null);
      setSelectedLogoPreview("");
      clearErrors();

      if (!isEdit) {
        reset({
          name: "",
          address: "",
          phone: "",
          open_time: "",
          close_time: "",
          status: "active",
        });
        return;
      }

      setLoading(true);
      try {
        const [res, logo] = await Promise.all([
          getBranch(restaurantId, editing.id),
          getBranchLogo(restaurantId, editing.id),
        ]);

        const b = res?.data ?? res;

        reset({
          name: b?.name ?? "",
          address: b?.address ?? "",
          phone: b?.phone ?? "",
          open_time: (b?.open_time ?? "").slice(0, 5),
          close_time: (b?.close_time ?? "").slice(0, 5),
          status: b?.status ?? "active",
        });

        setCurrentLogo(logo ?? null);
      } catch (e) {
        const redirected = handleRestaurantApiError(e, nav, restaurantId);
        if (!redirected) {
          setServerMsg(e?.response?.data?.message || "No se pudo cargar la sucursal.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadBranch();
  }, [open, isEdit, editing, restaurantId, reset, nav, clearErrors]);

  const mapBackendErrors = (e) => {
    const data = e?.response?.data;
    const bag = data?.errors;

    if (bag && typeof bag === "object") {
      Object.entries(bag).forEach(([field, arr]) => {
        const first = Array.isArray(arr) ? arr[0] : String(arr);
        setError(field, { type: "server", message: first });
      });
      setServerMsg("");
      return;
    }

    setServerMsg(data?.message || "No se pudo guardar la sucursal.");
  };

  const handleSelectLogo = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const validMime = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ].includes(file.type);

    if (!validMime) {
      setServerMsg("El archivo seleccionado debe ser PNG, JPG, JPEG o WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setServerMsg("El logo no debe exceder 2 MB.");
      event.target.value = "";
      return;
    }

    setServerMsg("");
    setSelectedLogoFile(file);
    event.target.value = "";
  };

  const clearSelectedLogo = () => {
    setSelectedLogoFile(null);
    setSelectedLogoPreview("");
  };

  const handleDeleteCurrentLogo = async () => {
    if (!isEdit || !editing?.id || !currentLogo?.id) return;

    const ok = window.confirm("¿Eliminar el logo activo de esta sucursal?");
    if (!ok) return;

    setServerMsg("");
    setLogoRemoving(true);

    try {
      await deleteActiveBranchLogo(restaurantId, editing.id);
      setCurrentLogo(null);
    } catch (e) {
      const redirected = handleRestaurantApiError(e, nav, restaurantId);
      if (!redirected) {
        setServerMsg(
          e?.response?.data?.message || "No se pudo eliminar el logo activo."
        );
      }
    } finally {
      setLogoRemoving(false);
    }
  };

  const onSubmit = async (values) => {
    setServerMsg("");
    setSaving(true);

    try {
      let branchId = editing?.id;

      if (isEdit) {
        const res = await updateBranch(restaurantId, editing.id, values);
        branchId = res?.branch?.id ?? editing.id;
      } else {
        const res = await createBranch(restaurantId, values);
        branchId = res?.branch?.id;
      }

      if (selectedLogoFile && branchId) {
        const uploaded = await uploadBranchLogo(restaurantId, branchId, selectedLogoFile);
        setCurrentLogo(uploaded ?? null);
        setSelectedLogoFile(null);
        setSelectedLogoPreview("");
      }

      onSaved?.();
      onClose?.();
    } catch (e) {
      const redirected = handleRestaurantApiError(e, nav, restaurantId);
      if (!redirected) {
        if (e?.response?.status === 422) {
          mapBackendErrors(e);
        } else {
          setServerMsg(e?.response?.data?.message || "No se pudo guardar la sucursal.");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const previewUrl = selectedLogoPreview || currentLogo?.public_url || "";

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="md"
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
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
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
                ? "Actualiza la información de la sucursal."
                : "Registra una nueva sucursal para este restaurante."}
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            disabled={saving}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 2,
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
          {serverMsg && (
            <Alert severity="error" sx={{ borderRadius: 1, alignItems: "flex-start" }}>
              <Box>
                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>Error</Typography>
                <Typography variant="body2">{serverMsg}</Typography>
              </Box>
            </Alert>
          )}

          {loading ? (
            <Box sx={{ py: 4 }}>
              <Typography sx={{ color: "text.secondary" }}>Cargando sucursal...</Typography>
            </Box>
          ) : (
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 1,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2}>
                  <FieldBlock
                    label="Nombre sucursal"
                    input={
                      <TextField
                        {...register("name")}
                        placeholder="Ej. Sucursal Centro"
                        error={!!errors.name}
                        helperText={errors.name?.message || " "}
                        sx={fieldSx}
                      />
                    }
                  />

                  <FieldBlock
                    label="Dirección"
                    input={
                      <TextField
                        {...register("address")}
                        placeholder="Ej. Av. Principal 123"
                        error={!!errors.address}
                        helperText={errors.address?.message || " "}
                        sx={fieldSx}
                      />
                    }
                  />

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Teléfono"
                      input={
                        <TextField
                          {...register("phone")}
                          placeholder="Ej. 5512345678"
                          error={!!errors.phone}
                          helperText={errors.phone?.message || " "}
                          sx={fieldSx}
                        />
                      }
                    />

                    {isEdit && (
                      <FieldBlock
                        label="Estatus"
                        input={
                          <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                              <FormControl fullWidth>
                                <Select
                                  {...field}
                                  IconComponent={KeyboardArrowDownIcon}
                                  sx={selectSx}
                                >
                                  <MenuItem value="active">Activo</MenuItem>
                                  <MenuItem value="inactive">Inactivo</MenuItem>
                                </Select>
                              </FormControl>
                            )}
                          />
                        }
                      />
                    )}
                  </Stack>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Hora apertura"
                      input={
                        <TextField
                          {...register("open_time")}
                          placeholder="09:00"
                          error={!!errors.open_time}
                          helperText={errors.open_time?.message || " "}
                          sx={fieldSx}
                        />
                      }
                    />

                    <FieldBlock
                      label="Hora cierre"
                      input={
                        <TextField
                          {...register("close_time")}
                          placeholder="22:00"
                          error={!!errors.close_time}
                          helperText={errors.close_time?.message || " "}
                          sx={fieldSx}
                        />
                      }
                    />
                  </Stack>

                  <Box
                    sx={{
                      mt: 1,
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      bgcolor: "background.default",
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: "text.primary",
                        }}
                      >
                        Logo de sucursal
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "text.secondary",
                          lineHeight: 1.5,
                        }}
                      >
                        Este logo quedará ligado a la sucursal y después se usará para tickets. Puedes cargarlo ahora y reemplazarlo cuando quieras.
                      </Typography>

                      <Box
                        sx={{
                          width: "100%",
                          minHeight: 180,
                          borderRadius: 1,
                          border: "1px dashed",
                          borderColor: "divider",
                          bgcolor: "#F6F4F6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        {previewUrl ? (
                          <Box
                            component="img"
                            src={previewUrl}
                            alt="Logo sucursal"
                            sx={{
                              width: "100%",
                              maxHeight: 240,
                              objectFit: "contain",
                              display: "block",
                            }}
                          />
                        ) : (
                          <Stack spacing={1} alignItems="center" sx={{ px: 2, py: 4 }}>
                            <ImageOutlinedIcon sx={{ fontSize: 42, color: "text.secondary" }} />
                            <Typography
                              sx={{
                                fontSize: 13,
                                color: "text.secondary",
                                textAlign: "center",
                              }}
                            >
                              No hay logo cargado todavía
                            </Typography>
                          </Stack>
                        )}
                      </Box>

                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.25}
                        alignItems={{ xs: "stretch", sm: "center" }}
                      >
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<CloudUploadOutlinedIcon />}
                          disabled={saving || logoRemoving}
                          sx={{
                            minWidth: { xs: "100%", sm: 190 },
                            height: 42,
                            borderRadius: 2,
                          }}
                        >
                          {selectedLogoFile || currentLogo ? "Reemplazar logo" : "Subir logo"}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            hidden
                            onChange={handleSelectLogo}
                          />
                        </Button>

                        {selectedLogoFile && (
                          <Button
                            type="button"
                            variant="text"
                            onClick={clearSelectedLogo}
                            disabled={saving}
                            sx={{
                              minWidth: { xs: "100%", sm: 140 },
                              height: 42,
                              borderRadius: 2,
                              fontWeight: 700,
                            }}
                          >
                            Quitar selección
                          </Button>
                        )}

                        {!selectedLogoFile && currentLogo && (
                          <Button
                            type="button"
                            color="error"
                            variant="text"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={handleDeleteCurrentLogo}
                            disabled={saving || logoRemoving}
                            sx={{
                              minWidth: { xs: "100%", sm: 170 },
                              height: 42,
                              borderRadius: 2,
                              fontWeight: 700,
                            }}
                          >
                            {logoRemoving ? "Eliminando..." : "Eliminar logo"}
                          </Button>
                        )}
                      </Stack>

                      {selectedLogoFile && (
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "text.secondary",
                            wordBreak: "break-word",
                          }}
                        >
                          Archivo seleccionado: <strong>{selectedLogoFile.name}</strong>
                        </Typography>
                      )}
                    </Stack>
                  </Box>

                  <Stack
                    direction={{ xs: "column-reverse", sm: "row" }}
                    justifyContent="space-between"
                    spacing={1.5}
                    pt={1}
                  >
                    <Button
                      type="button"
                      onClick={onClose}
                      variant="outlined"
                      disabled={saving}
                      sx={{
                        minWidth: { xs: "100%", sm: 150 },
                        height: 44,
                        borderRadius: 2,
                      }}
                    >
                      Cancelar
                    </Button>

                    <Button
                      type="submit"
                      variant="contained"
                      disabled={saving || logoRemoving}
                      startIcon={isEdit ? <SaveIcon /> : <AddIcon />}
                      sx={{
                        minWidth: { xs: "100%", sm: 180 },
                        height: 44,
                        borderRadius: 2,
                        fontWeight: 800,
                      }}
                    >
                      {saving ? "Guardando..." : "Guardar"}
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </Box>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function FieldBlock({ label, input }) {
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
    </Box>
  );
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#ECEAEC",
  },
};

const selectSx = {
  bgcolor: "#ECEAEC",
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