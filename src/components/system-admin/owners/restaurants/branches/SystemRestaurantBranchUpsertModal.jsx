import { useEffect, useMemo, useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle,
  FormControlLabel, IconButton, Stack, Switch, TextField, Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

import AppAlert from "../../../../common/AppAlert";
import { normalizeErr } from "../../../../../utils/err";

export default function SystemRestaurantBranchUpsertModal({
  open,
  editing,
  onClose,
  onSave,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isEdit = !!editing?.id;
  const currentLogoBase = editing?.activeLogo || editing?.active_logo || null;

  const [saving, setSaving] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [status, setStatus] = useState("active");

  const [selectedLogoFile, setSelectedLogoFile] = useState(null);
  const [selectedLogoPreview, setSelectedLogoPreview] = useState("");
  const [removeCurrentLogo, setRemoveCurrentLogo] = useState(false);

  const title = useMemo(
    () => (isEdit ? "Editar sucursal" : "Crear sucursal"),
    [isEdit]
  );

  const currentLogo = removeCurrentLogo ? null : currentLogoBase;
  const previewUrl = selectedLogoPreview || currentLogo?.public_url || "";

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (!selectedLogoFile) {
      setSelectedLogoPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedLogoFile);
    setSelectedLogoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedLogoFile]);

  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      setName(editing?.name || "");
      setAddress(editing?.address || "");
      setPhone(editing?.phone || "");
      setOpenTime(editing?.open_time ? String(editing.open_time).slice(0, 5) : "");
      setCloseTime(editing?.close_time ? String(editing.close_time).slice(0, 5) : "");
      setStatus(editing?.status || "active");
    } else {
      setName("");
      setAddress("");
      setPhone("");
      setOpenTime("");
      setCloseTime("");
      setStatus("active");
    }

    setSelectedLogoFile(null);
    setSelectedLogoPreview("");
    setRemoveCurrentLogo(false);
  }, [open, isEdit, editing]);

  const canSave = useMemo(() => {
    if (!name.trim()) return false;
    return true;
  }, [name]);

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
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "El archivo debe ser PNG, JPG, JPEG o WEBP.",
      });
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "El logo no debe exceder 2 MB.",
      });
      event.target.value = "";
      return;
    }

    setSelectedLogoFile(file);
    setRemoveCurrentLogo(false);
    event.target.value = "";
  };

  const clearSelectedLogo = () => {
    setSelectedLogoFile(null);
    setSelectedLogoPreview("");
  };

  const handleRemoveCurrentLogo = () => {
    setRemoveCurrentLogo(true);
    setSelectedLogoFile(null);
    setSelectedLogoPreview("");
  };

  const save = async () => {
    if (!name.trim()) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "El nombre de la sucursal es obligatorio.",
      });
      return;
    }

    const payload = {
      name: name.trim(),
      address: address.trim() || null,
      phone: phone.trim() || null,
      open_time: openTime || null,
      close_time: closeTime || null,
      status,
    };

    setSaving(true);

    try {
      await onSave?.(
        {
          payload,
          logoFile: selectedLogoFile,
          removeCurrentLogo,
        },
        editing
      );
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo guardar la sucursal."),
      });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={saving ? undefined : onClose}
        fullScreen={isMobile}
        fullWidth={false}
        maxWidth={false}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "100%", sm: 780 },
              height: { xs: "100%", sm: "auto" },
              maxHeight: { xs: "100%", sm: "90vh" },
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
                  ? "Actualiza los datos y logo de la sucursal."
                  : "Registra una nueva sucursal para este restaurante."}
              </Typography>
            </Box>

            <IconButton
              onClick={onClose}
              disabled={saving}
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.08)",
                borderRadius: 1,
                "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
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
            overflowY: "auto",
          }}
        >
          <Stack spacing={2.5}>
            <Card sx={{ borderRadius: 0, backgroundColor: "background.paper" }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack spacing={2.5}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: 18, sm: 20 },
                      color: "text.primary",
                    }}
                  >
                    Datos de sucursal
                  </Typography>

                  <FieldBlock
                    label="Nombre sucursal *"
                    input={
                      <TextField
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Sucursal Centro"
                      />
                    }
                  />

                  <FieldBlock
                    label="Dirección"
                    input={
                      <TextField
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Ej. Av. Principal 123"
                      />
                    }
                  />

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Teléfono"
                      input={
                        <TextField
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Ej. 7441234567"
                        />
                      }
                    />

                    <Box sx={{ flex: 1, width: "100%" }}>
                      <Typography sx={fieldLabelSx}>Estado</Typography>

                      <FormControlLabel
                        sx={{ m: 0 }}
                        control={
                          <Switch
                            checked={status === "active"}
                            onChange={(e) =>
                              setStatus(e.target.checked ? "active" : "inactive")
                            }
                            color="primary"
                          />
                        }
                        label={
                          <Typography sx={switchLabelSx}>
                            {status === "active" ? "Activa" : "Inactiva"}
                          </Typography>
                        }
                      />
                    </Box>
                  </Stack>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Hora apertura"
                      input={
                        <TextField
                          value={openTime}
                          onChange={(e) => setOpenTime(e.target.value)}
                          placeholder="09:00"
                          inputProps={{ inputMode: "numeric" }}
                        />
                      }
                    />

                    <FieldBlock
                      label="Hora cierre"
                      input={
                        <TextField
                          value={closeTime}
                          onChange={(e) => setCloseTime(e.target.value)}
                          placeholder="22:00"
                          inputProps={{ inputMode: "numeric" }}
                        />
                      }
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 0, backgroundColor: "background.paper" }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack spacing={1.5}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: 18, sm: 20 },
                      color: "text.primary",
                    }}
                  >
                    Logo de sucursal
                  </Typography>

                  <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
                    Este logo quedará ligado a la sucursal y podrá usarse en tickets o elementos visuales.
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

                  {removeCurrentLogo ? (
                    <Alert severity="warning" sx={{ borderRadius: 1 }}>
                      El logo actual se eliminará al guardar.
                    </Alert>
                  ) : null}

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.25}
                    alignItems={{ xs: "stretch", sm: "center" }}
                  >
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadOutlinedIcon />}
                      disabled={saving}
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
                          minWidth: { xs: "100%", sm: 150 },
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
                        onClick={handleRemoveCurrentLogo}
                        disabled={saving}
                        sx={{
                          minWidth: { xs: "100%", sm: 170 },
                          height: 42,
                          borderRadius: 2,
                          fontWeight: 700,
                        }}
                      >
                        Eliminar logo
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
                type="button"
                onClick={save}
                variant="contained"
                disabled={!canSave || saving}
                startIcon={isEdit ? <SaveIcon /> : <AddIcon />}
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

function FieldBlock({ label, input }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography sx={fieldLabelSx}>{label}</Typography>
      {input}
    </Box>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};

const switchLabelSx = {
  fontSize: 14,
  fontWeight: 700,
  color: "text.primary",
};