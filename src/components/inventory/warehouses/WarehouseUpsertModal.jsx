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

import AppAlert from "../../../components/common/AppAlert";

export default function WarehouseUpsertModal({
  open,
  onClose,
  inventoryMode,
  editing,
  selectedBranch,
  onSave,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isEdit = !!editing?.id;
  const isBranchMode = inventoryMode === "branch";

  const [saving, setSaving] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [notes, setNotes] = useState("");
  const [statusActive, setStatusActive] = useState(true);

  const title = useMemo(
    () => (isEdit ? "Editar almacén" : "Nuevo almacén"),
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
      setCode(editing?.code || "");
      setNotes(editing?.notes || "");
      setStatusActive((editing?.status || "active") === "active");
    } else {
      setName("");
      setCode("");
      setNotes("");
      setStatusActive(true);
    }
  }, [open, isEdit, editing]);

  const canSave = useMemo(() => {
    return !!name.trim();
  }, [name]);

  const save = async () => {
    if (!name.trim()) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "El nombre del almacén es obligatorio.",
      });
      return;
    }

    if (isBranchMode && !selectedBranch?.id) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una sucursal antes de continuar.",
      });
      return;
    }

    const payload = {
      name: name.trim(),
      code: code.trim() || null,
      notes: notes.trim() || null,
      ...(isEdit
        ? {}
        : {
            status: statusActive ? "active" : "inactive",
            scope: isBranchMode ? "branch" : "global",
            ...(isBranchMode ? { branch_id: Number(selectedBranch.id) } : {}),
          }),
    };

    setSaving(true);

    try {
      await onSave(payload, editing || null);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message || "No se pudo guardar el almacén.",
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
                  ? "Actualiza la información del almacén."
                  : "Crea un nuevo almacén dentro del contexto actual de inventario."}
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
                  Datos del almacén
                </Typography>

                <Stack spacing={2}>
                  <FieldBlock
                    label="Contexto"
                    input={
                      <TextField
                        value={
                          isBranchMode
                            ? `Sucursal: ${selectedBranch?.name || "No seleccionada"}`
                            : "Global"
                        }
                        disabled
                      />
                    }
                    help={
                      isBranchMode
                        ? "Este almacén pertenece a la sucursal seleccionada."
                        : "Este almacén pertenece al contexto global del restaurante."
                    }
                  />

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Nombre *"
                      input={
                        <TextField
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ej. Almacén principal"
                        />
                      }
                    />

                    <FieldBlock
                      label="Clave"
                      input={
                        <TextField
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder="Ej. ALM-01"
                        />
                      }
                      help="Opcional. Si la usas, debe ser única dentro del restaurante."
                    />
                  </Stack>

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
                            checked={statusActive}
                            onChange={(e) => setStatusActive(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Typography sx={switchLabelSx}>
                            {statusActive ? "Activo" : "Inactivo"}
                          </Typography>
                        }
                      />
                    </Box>
                  ) : null}

                  <FieldBlock
                    label="Notas"
                    input={
                      <TextField
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Opcional"
                        multiline
                        minRows={4}
                      />
                    }
                  />
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