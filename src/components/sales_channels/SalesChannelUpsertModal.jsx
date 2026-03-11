import { 
    Alert, Box, Button, Dialog, DialogContent, DialogTitle, FormControl, IconButton, MenuItem,
    Select, Stack, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LockOutlineIcon from "@mui/icons-material/LockOutline";

function normalizeCode(v) {
  return (v || "")
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");
}

function isSalonChannel(it) {
  return normalizeCode(it?.code) === "SALON";
}

export default function SalesChannelUpsertModal({
  open,
  onClose,
  onSubmit,
  onChange,
  form,
  saving,
  editing,
  statusOptions = [],
  errorMessage = "",
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const editingIsSalon = isSalonChannel(editing);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
              {editing ? "Editar canal" : "Crear canal"}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              Codes recomendados: COMEDOR, DELIVERY, PICKUP, UBER_EATS
            </Typography>

            {editingIsSalon && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <LockOutlineIcon sx={{ fontSize: 16, color: "#fff" }} />
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.88)",
                  }}
                >
                  Este canal es fijo y no puede modificarse.
                </Typography>
              </Stack>
            )}
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
          {errorMessage && (
            <Alert
                severity="error"
                sx={{
                borderRadius: 1,
                alignItems: "flex-start",
                }}
            >
                <Box>
                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                    Error
                </Typography>
                <Typography variant="body2">{errorMessage}</Typography>
                </Box>
            </Alert>
          )}  
          
          <Box
            sx={{
              p: 2,
              borderRadius: 0,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={2}>
              <FieldBlock
                label="Code"
                help="Se normaliza automáticamente a MAYÚSCULAS con guion bajo."
                input={
                  <TextField
                    value={form.code}
                    onChange={(e) => onChange("code", e.target.value)}
                    placeholder="DELIVERY"
                    disabled={saving || editingIsSalon}
                  />
                }
              />

              <FieldBlock
                label="Nombre"
                input={
                  <TextField
                    value={form.name}
                    onChange={(e) => onChange("name", e.target.value)}
                    placeholder="Delivery"
                    disabled={saving || editingIsSalon}
                  />
                }
              />

              <FieldBlock
                label="Estado"
                input={
                  <FormControl fullWidth>
                    <Select
                      value={form.status}
                      onChange={(e) => onChange("status", e.target.value)}
                      disabled={saving || editingIsSalon}
                      IconComponent={KeyboardArrowDownIcon}
                      sx={selectSx}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            borderRadius: 1,
                          },
                        },
                      }}
                    >
                      {statusOptions.map((op) => (
                        <MenuItem key={op.value} value={op.value}>
                          {op.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                }
              />
            </Stack>
          </Box>

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Button
              onClick={onClose}
              disabled={saving}
              variant="outlined"
              sx={{
                minWidth: { xs: "100%", sm: 140 },
                height: 44,
                borderRadius: 2,
              }}
            >
              Cancelar
            </Button>

            <Button
              onClick={onSubmit}
              disabled={saving || editingIsSalon}
              variant="contained"
              startIcon={editing ? <SaveIcon /> : <AddIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 160 },
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
    <Box sx={{ width: "100%" }}>
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

      {help && (
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
      )}
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