import { useEffect, useMemo, useState } from "react";

import {
  Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton,
  Stack, Switch, TextField, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

import AppAlert from "../../components/common/AppAlert";

export default function MenuSectionUpsertModal({
  open,
  onClose,
  restaurantId,
  requiresBranch,
  effectiveBranchId,
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
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [status, setStatus] = useState("active");

  const title = useMemo(
    () => (isEdit ? "Editar sección" : "Nueva sección"),
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
      setDescription(editing?.description || "");
      setSortOrder(String(editing?.sort_order ?? 0));
      setStatus(editing?.status || "active");
    } else {
      setName("");
      setDescription("");
      setSortOrder("0");
      setStatus("active");
    }
  }, [open, isEdit, editing]);

  const canSave = useMemo(() => {
    if (!name.trim()) return false;
    const n = Number(sortOrder);
    if (!Number.isFinite(n) || n < 0) return false;
    return true;
  }, [name, sortOrder]);

  const save = async () => {
    const payload = {
      branch_id: requiresBranch ? effectiveBranchId : null,
      name: name.trim(),
      description: description.trim() || null,
      sort_order: Number(sortOrder),
      status,
    };

    if (!payload.name) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "El nombre de la sección es obligatorio.",
      });
      return;
    }

    if (requiresBranch && !payload.branch_id) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una sucursal para continuar.",
      });
      return;
    }

    if (!Number.isFinite(payload.sort_order) || payload.sort_order < 0) {
      showAlert({
        severity: "error",
        title: "Error",
        message: "El orden debe ser un número igual o mayor a 0.",
      });
      return;
    }

    setSaving(true);

    try {
      if (isEdit) {
        await api.updateMenuSection(restaurantId, editing.id, payload);
      } else {
        await api.createMenuSection(restaurantId, payload);
      }

      await onSaved?.();
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message || "No se pudo guardar la sección",
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
                  ? "Actualiza la información principal de la sección."
                  : "Crea una nueva sección para organizar mejor el menú."}
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
                  Datos de la sección
                </Typography>

                <Stack spacing={2}>
                  <FieldBlock
                    label="Nombre *"
                    input={
                      <TextField
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Bebidas"
                      />
                    }
                  />

                  <FieldBlock
                    label="Descripción"
                    input={
                      <TextField
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Opcional"
                        multiline
                        minRows={3}
                      />
                    }
                  />

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Orden"
                      help="0 = normal. Entre más bajo, aparece primero."
                      input={
                        <TextField
                          value={sortOrder}
                          onChange={(e) => setSortOrder(e.target.value)}
                          inputProps={{ inputMode: "numeric" }}
                          placeholder="0"
                        />
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
                          flex: 1,
                          fontSize: 12,
                          color: "text.secondary",
                          lineHeight: 1.45,
                          pt: 4,
                        }}
                      >
                        El estado de la sección se controla desde la pantalla principal con el switch de la tabla.
                      </Typography>
                    )}
                  </Stack>
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