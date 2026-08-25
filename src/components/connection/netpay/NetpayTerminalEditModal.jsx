import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, IconButton, MenuItem, Stack,
  TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const DEFAULT_FORM = {
  name: "",
  branch_id: "",
};

export default function NetpayTerminalEditModal({
  open,
  onClose,
  terminal,
  branches = [],
  saving = false,
  onSave,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [form, setForm] = useState(DEFAULT_FORM);

  const canSave = useMemo(() => {
    return !!terminal && !!form.branch_id && !saving;
  }, [terminal, form.branch_id, saving]);

  useEffect(() => {
    if (!open || !terminal) return;

    setForm({
      name: terminal?.name || "",
      branch_id: terminal?.branch_id ? String(terminal.branch_id) : "",
    });
  }, [open, terminal]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const save = async () => {
    if (!canSave) return;

    await onSave?.({
      name: String(form.name || "").trim() || null,
      branch_id: Number(form.branch_id),
    });
  };

  if (!open || !terminal) return null;

  return (
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
              Editar terminal NetPay
            </Typography>

            <Typography sx={{ mt: 0.5, fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
              Actualiza el nombre o la sucursal asignada a esta terminal.
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

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default" }}>
        <Card sx={{ borderRadius: 1, backgroundColor: "background.paper" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2.5}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 18, sm: 20 },
                  color: "text.primary",
                }}
              >
                Datos de la terminal
              </Typography>

              <FieldBlock
                label="Nombre"
                help="Puedes utilizar un nombre que te permita reconocer fácilmente dónde se encuentra la terminal."
                input={
                  <TextField
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Ej. Terminal mostrador"
                    inputProps={{ maxLength: 120 }}
                  />
                }
              />

              <FieldBlock
                label="Sucursal"
                help="Selecciona la sucursal donde se utilizará esta terminal."
                input={
                  <TextField
                    select
                    value={form.branch_id}
                    onChange={(e) => updateField("branch_id", e.target.value)}
                    disabled={branches.length === 0}
                    SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
                  >
                    {branches.map((branch) => (
                      <MenuItem key={branch.id} value={String(branch.id)}>
                        {branch.name || `Sucursal ${branch.id}`}
                      </MenuItem>
                    ))}
                  </TextField>
                }
              />

              <Box>
                <Typography
                  sx={{
                    mb: 1.25,
                    fontSize: 15,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  Información de la terminal
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                    gap: 1.25,
                  }}
                >
                  <InfoItem
                    label="Identificador del dispositivo"
                    value={terminal?.device_installation_id || "No disponible"}
                    fullWidth
                  />

                  <InfoItem label="Ambiente" value={environmentLabel(terminal?.environment)} />
                  <InfoItem label="Versión de NetPay" value={terminal?.sdk_version || "No disponible"} />
                  <InfoItem label="Versión de Clic Menu" value={terminal?.app_version || "No disponible"} />
                  <InfoItem label="Última conexión" value={formatDateTime(terminal?.last_seen_at)} />
                </Box>
              </Box>

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
                  sx={{ minWidth: { xs: "100%", sm: 150 }, height: 44 }}
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  onClick={save}
                  disabled={!canSave}
                  variant="contained"
                  startIcon={<SaveIcon />}
                  sx={{ minWidth: { xs: "100%", sm: 180 }, height: 44, fontWeight: 800 }}
                >
                  {saving ? "Guardando…" : "Guardar"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary", mb: 1 }}>
        {label}
      </Typography>

      {input}

      {help ? (
        <Typography sx={{ mt: 0.75, fontSize: 12, color: "text.secondary", lineHeight: 1.45 }}>
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}

function InfoItem({ label, value, fullWidth = false }) {
  return (
    <Box
      sx={{
        gridColumn: fullWidth ? "1 / -1" : "auto",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.5,
        backgroundColor: "background.default",
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 800,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          fontSize: 14,
          fontWeight: 700,
          color: "text.primary",
          wordBreak: "break-word",
        }}
      >
        {value || "No disponible"}
      </Typography>
    </Box>
  );
}

function environmentLabel(value) {
  if (value === "sandbox") return "Pruebas";
  if (value === "production") return "Producción";
  return "No disponible";
}

function formatDateTime(value) {
  if (!value) return "No disponible";

  try {
    return new Date(value).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "No disponible";
  }
}