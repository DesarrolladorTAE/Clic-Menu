import { useEffect, useMemo, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

import AppAlert from "../../components/common/AppAlert";
import { normalizeErr } from "../../utils/err";

export default function SupplierUpsertModal({
  open,
  onClose,
  restaurantId,
  editing,
  onSaved,
  api,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isEdit = !!editing?.id;

  const [saving, setSaving] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("active");

  const title = useMemo(
    () => (isEdit ? "Editar proveedor" : "Nuevo proveedor"),
    [isEdit]
  );

  const showAlert = ({
    severity = "error",
    title = "Error",
    message = "",
  }) => {
    setAlertState({
      open: true,
      severity,
      title,
      message,
    });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      setName(editing?.name || "");
      setContactName(editing?.contact_name || "");
      setPhone(editing?.phone || "");
      setEmail(editing?.email || "");
      setNotes(editing?.notes || "");
      setStatus(editing?.status || "active");
    } else {
      setName("");
      setContactName("");
      setPhone("");
      setEmail("");
      setNotes("");
      setStatus("active");
    }
  }, [open, isEdit, editing]);

  const canSave = useMemo(() => !!name.trim(), [name]);

  const save = async () => {
    const payload = {
      name: name.trim(),
      contact_name: contactName.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      notes: notes.trim() || null,
      status,
    };

    if (!payload.name) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "El nombre es obligatorio.",
      });
      return;
    }

    setSaving(true);

    try {
      if (isEdit) {
        await api.updateSupplier(restaurantId, editing.id, payload);
      } else {
        await api.createSupplier(restaurantId, payload);
      }

      await onSaved?.();
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo guardar proveedor"),
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
        fullWidth
        maxWidth="sm"
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
                  ? "Actualiza la información principal del proveedor."
                  : "Registra un nuevo proveedor para futuras compras y presentaciones."}
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
                  Datos del proveedor
                </Typography>

                <Stack spacing={2}>
                  <FieldBlock
                    label="Nombre *"
                    input={
                      <TextField
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Distribuidora del Sur"
                      />
                    }
                  />

                  <FieldBlock
                    label="Contacto"
                    input={
                      <TextField
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Ej. Juan Pérez"
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

                    <FieldBlock
                      label="Correo electrónico"
                      input={
                        <TextField
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="correo@proveedor.com"
                        />
                      }
                    />
                  </Stack>

                  <FieldBlock
                    label="Notas"
                    input={
                      <TextField
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Observaciones del proveedor"
                        multiline
                        minRows={3}
                      />
                    }
                  />

                  {!isEdit ? (
                    <Box sx={{ width: "100%" }}>
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
                            {status === "active" ? "Activo" : "Inactivo"}
                          </Typography>
                        }
                      />
                    </Box>
                  ) : (
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "text.secondary",
                        lineHeight: 1.45,
                      }}
                    >
                      El estado de este proveedor se controla desde la pantalla principal con el switch de la tabla.
                    </Typography>
                  )}
                </Stack>

                <Stack
                  direction={{ xs: "column-reverse", sm: "row" }}
                  justifyContent="flex-end"
                  spacing={1.5}
                  pt={1}
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
                    onClick={save}
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
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={4000}
      />
    </>
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

const switchLabelSx = {
  fontSize: 14,
  fontWeight: 700,
  color: "text.primary",
};